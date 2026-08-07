import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { XMLParser } from "fast-xml-parser";
import postgres from "postgres";

const WIDTH_LABELS = { "1": "M", "2": "W", "3": "XW" };

function values(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function required(row, field, context) {
  const value = text(row[field]);
  if (!value) throw new Error(`${context}: chýba pole ${field}.`);
  return value;
}

function argumentsFromCommandLine(argv) {
  const result = { apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") result.apply = true;
    else if (argument === "--partner") result.partner = argv[++index];
    else if (argument === "--catalog") result.catalog = argv[++index];
    else if (argument === "--inventory") result.inventory = argv[++index];
    else throw new Error(`Neznámy argument ${argument}.`);
  }
  return result;
}

export async function parseDiawinFeeds(catalogPath, inventoryPath) {
  const [catalogXml, inventoryXml] = await Promise.all([
    readFile(catalogPath, "utf8"),
    readFile(inventoryPath, "utf8"),
  ]);
  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
  const catalogDocument = parser.parse(catalogXml);
  const inventoryDocument = parser.parse(inventoryXml);
  const catalogItems = values(catalogDocument?.rss?.channel?.item);
  const inventoryItems = values(inventoryDocument?.inventory?.item);

  const catalogBySku = new Map(
    catalogItems.map((item, index) => [required(item, "id", `Katalóg ${index + 1}`), item]),
  );
  const productsByModel = new Map();
  const variants = [];

  inventoryItems.forEach((item, index) => {
    const context = `Sklad ${index + 1}`;
    const sku = required(item, "sku", context);
    const catalog = catalogBySku.get(sku);
    if (!catalog) throw new Error(`${context}: SKU ${sku} nie je v katalógovom feede.`);

    const gtin = required(item, "gtin", context);
    if (gtin !== required(catalog, "gtin", `Katalóg SKU ${sku}`)) {
      throw new Error(`SKU ${sku}: GTIN sa medzi feedmi nezhoduje.`);
    }

    const modelId = required(item, "modelId", context);
    const quantity = Number(required(item, "quantity", context));
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error(`SKU ${sku}: neplatné množstvo.`);
    }

    if (!productsByModel.has(modelId)) {
      const name = required(item, "modelName", context);
      productsByModel.set(modelId, {
        externalModelId: modelId,
        name,
        slug: `diawin-${modelId.toLowerCase()}-${slugify(name)}`,
        brand: required(catalog, "brand", `Katalóg SKU ${sku}`),
        productLineId: required(item, "productLineId", context),
        productLineName: required(item, "productLineName", context),
        categoryId: required(item, "productCategoryId", context),
        categoryName: required(item, "productCategoryName", context),
        description: text(catalog.description),
      });
    }

    const widthCode = required(item, "width", context);
    variants.push({
      externalModelId: modelId,
      sku,
      gtin,
      size: required(item, "size", context),
      widthCode,
      widthLabel: WIDTH_LABELS[widthCode] ?? widthCode,
      quantity,
      availability: required(item, "availability", context),
      sourceUpdatedAt: required(item, "updatedAt", context),
    });
  });

  if (catalogBySku.size !== variants.length) {
    throw new Error(`Feedy nemajú rovnaký počet SKU (${catalogBySku.size} vs. ${variants.length}).`);
  }

  return {
    generatedAt: text(inventoryDocument?.inventory?.["@_generatedAt"]),
    checksum: createHash("sha256").update(catalogXml).update(inventoryXml).digest("hex"),
    products: [...productsByModel.values()],
    variants,
    totalStock: variants.reduce((sum, variant) => sum + variant.quantity, 0),
  };
}

async function importDiawin(databaseUrl, feed) {
  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    await sql.begin(async (transaction) => {
      const [supplier] = await transaction`
        select id from private.suppliers where code = 'diawin' limit 1
      `;
      if (!supplier) throw new Error("Partner Diawin nie je založený v databáze.");

      for (const product of feed.products) {
        const [canonical] = await transaction`
          insert into public.products
            (name, slug, short_description, brand, product_type, status, published_at)
          values
            (${product.name}, ${product.slug}, ${product.description}, ${product.brand}, 'physical', 'active', now())
          on conflict (slug) do update set
            name = excluded.name,
            short_description = excluded.short_description,
            brand = excluded.brand,
            updated_at = now()
          returning id
        `;
        await transaction`
          insert into private.supplier_products
            (supplier_id, external_model_id, canonical_product_id, name, brand,
             product_line_id, product_line_name, category_id, category_name,
             description, is_complete, last_seen_at)
          values
            (${supplier.id}, ${product.externalModelId}, ${canonical.id}, ${product.name},
             ${product.brand}, ${product.productLineId}, ${product.productLineName},
             ${product.categoryId}, ${product.categoryName}, ${product.description}, false, now())
          on conflict (supplier_id, external_model_id) do update set
            canonical_product_id = excluded.canonical_product_id,
            name = excluded.name,
            brand = excluded.brand,
            product_line_id = excluded.product_line_id,
            product_line_name = excluded.product_line_name,
            category_id = excluded.category_id,
            category_name = excluded.category_name,
            description = excluded.description,
            is_complete = false,
            last_seen_at = now()
        `;
      }

      for (const variant of feed.variants) {
        await transaction`
          insert into private.supplier_variants
            (supplier_id, supplier_product_id, sku, gtin, size, width_code,
             width_label, quantity, availability, source_updated_at, last_seen_at)
          select ${supplier.id}, product.id, ${variant.sku}, ${variant.gtin},
                 ${variant.size}, ${variant.widthCode}, ${variant.widthLabel},
                 ${variant.quantity}, ${variant.availability},
                 ${variant.sourceUpdatedAt}::timestamptz, now()
          from private.supplier_products product
          where product.supplier_id = ${supplier.id}
            and product.external_model_id = ${variant.externalModelId}
          on conflict (supplier_id, sku) do update set
            supplier_product_id = excluded.supplier_product_id,
            gtin = excluded.gtin,
            size = excluded.size,
            width_code = excluded.width_code,
            width_label = excluded.width_label,
            quantity = excluded.quantity,
            availability = excluded.availability,
            source_updated_at = excluded.source_updated_at,
            last_seen_at = now()
        `;
      }

      await transaction`
        insert into private.feed_imports
          (supplier_id, status, source_generated_at, source_checksum,
           product_count, variant_count, error_count, finished_at, notes)
        values
          (${supplier.id}, 'succeeded', ${feed.generatedAt || null}, ${feed.checksum},
           ${feed.products.length}, ${feed.variants.length}, 0, now(),
           'Automatizovaný import XML; bez ceny, obrázkov a produktových URL.')
      `;
      await transaction`
        update private.supplier_feeds set last_imported_at = now()
        where supplier_id = ${supplier.id}
      `;
    });
  } finally {
    await sql.end();
  }
}

async function main() {
  const options = argumentsFromCommandLine(process.argv.slice(2));
  if (options.partner !== "diawin" || !options.catalog || !options.inventory) {
    throw new Error("Použitie: --partner diawin --catalog <feed.xml> --inventory <feed.xml> [--apply]");
  }
  const feed = await parseDiawinFeeds(options.catalog, options.inventory);
  console.log(JSON.stringify({
    partner: "diawin",
    products: feed.products.length,
    variants: feed.variants.length,
    totalStock: feed.totalStock,
    generatedAt: feed.generatedAt,
    mode: options.apply ? "apply" : "dry-run",
  }, null, 2));

  if (options.apply) {
    const databaseUrl = process.env.SUPABASE_DATABASE_URL;
    if (!databaseUrl) throw new Error("Chýba SUPABASE_DATABASE_URL.");
    await importDiawin(databaseUrl, feed);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
