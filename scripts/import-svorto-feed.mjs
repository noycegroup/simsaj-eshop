import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import process from "node:process";
import { XMLParser } from "fast-xml-parser";
import postgres from "postgres";

const values = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const text = (value) => value == null ? "" : String(value).trim();
const number = (value, context) => {
  const result = Number(text(value));
  if (!Number.isFinite(result) || result < 0) throw new Error(`${context}: neplatná číselná hodnota.`);
  return result;
};
const required = (row, field, context) => {
  const result = text(row?.[field]);
  if (!result) throw new Error(`${context}: chýba pole ${field}.`);
  return result;
};
const slugify = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const plainText = (value) => text(value)
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  .replace(/&nbsp;|&#160;/g, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ").trim();
const minimumStock = (band, onStock) => {
  if (text(onStock) !== "1") return 0;
  const match = text(band).match(/\d+/);
  return match ? Number(match[0]) : 1;
};

function categoryFor(name, features) {
  const value = `${name} ${features.map((item) => `${item.name} ${item.value}`).join(" ")}`.toLocaleLowerCase("sk");
  if (/vlož|stiel|podpäten|pelot/.test(value)) return "ortopedicke-vlozky";
  if (/bandáž|ortéz|korektor|chránič|návlek|oddeľovač|fixátor/.test(value)) return "rehabilitacne-pomocky";
  return "starostlivost-o-chodidla";
}

async function readSource(source) {
  if (!/^https?:\/\//i.test(source)) return readFile(source, "utf8");
  const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Feed SVORTO vrátil HTTP ${response.status}.`);
  return response.text();
}

export async function parseSvortoFeed(source) {
  const xml = await readSource(source);
  const document = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, parseTagValue: false }).parse(xml);
  const rows = values(document?.SHOP?.PRODUCT);
  if (!rows.length) throw new Error("Feed SVORTO neobsahuje produkty.");

  const eans = new Set();
  const products = rows.map((row, productIndex) => {
    const context = `Produkt ${productIndex + 1}`;
    const externalId = required(row, "ITEM_ID", context);
    const name = required(row, "NAME", context);
    const reference = required(row, "REFERENCE", context);
    const features = values(row.FEATURES?.FEATURE).map((feature) => ({
      id: text(feature.ID), name: required(feature, "NAME", `${context} parameter`), value: required(feature, "VALUE", `${context} parameter`),
    }));
    const images = values(row.IMAGES?.IMG).map(text).filter((url) => /^https:\/\//i.test(url));
    if (!images.length) throw new Error(`${context}: chýba bezpečná HTTPS fotografia.`);
    const variants = values(row.COMBINATIONS?.COMBINATION).map((variant, variantIndex) => {
      const variantContext = `${context}, variant ${variantIndex + 1}`;
      const ean = required(variant, "EAN", variantContext);
      if (eans.has(ean)) throw new Error(`${variantContext}: duplicitný EAN ${ean}.`);
      eans.add(ean);
      const stockBand = required(variant, "QUANTITY_SAFE", variantContext);
      return {
        sku: `svorto-${ean}`, ean, size: required(variant, "ATTRIBUTE_NAME", variantContext),
        groupName: required(variant, "GROUP_NAME", variantContext), stockBand,
        quantity: minimumStock(stockBand, variant.ON_STOCK), availability: text(variant.ON_STOCK) === "1" ? "in_stock" : "out_of_stock",
        wholesaleIncl: number(variant.WHOLESALE_PRICE_TAX_INCL, variantContext), wholesaleExcl: number(variant.WHOLESALE_PRICE_TAX_EXCL, variantContext),
        retailIncl: number(variant.BASE_PRICE_PRICE_TAX_INCL, variantContext), retailExcl: number(variant.BASE_PRICE_PRICE_TAX_EXCL, variantContext),
      };
    });
    if (!variants.length) throw new Error(`${context}: chýbajú varianty.`);
    const shortDescription = plainText(required(row, "DESCRIPTION_SHORT", context));
    const description = plainText(row.DESCRIPTION) || shortDescription;
    return {
      externalId, name, reference, slug: `svorto-${externalId}-${slugify(name)}`, brand: "SVORTO", vatRate: number(row.RATE, context),
      shortDescription, description, images, features, variants, categorySlug: categoryFor(name, features),
    };
  });
  return { checksum: createHash("sha256").update(xml).digest("hex"), products, variants: products.flatMap((product) => product.variants) };
}

async function importSvorto(databaseUrl, feed) {
  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  let importId;
  try {
    const [lock] = await sql`select pg_try_advisory_lock(hashtext('simsaj:feed:svorto')) as acquired`;
    if (!lock?.acquired) throw new Error("Import SVORTO už práve prebieha.");
    const [supplier] = await sql`
      insert into private.suppliers (code, name, website_url) values ('svorto', 'SVORTO', 'https://www.svorto.sk')
      on conflict (code) do update set name=excluded.name, website_url=excluded.website_url, is_active=true, updated_at=now() returning id
    `;
    await sql`
      insert into private.supplier_feeds (supplier_id, feed_key, feed_type, format, mapping_version)
      values (${supplier.id}, 'b2b_feed', 'combined', 'xml', 1)
      on conflict (supplier_id, feed_key) do update set feed_type='combined', format='xml', mapping_version=1, is_active=true
    `;
    const [duplicate] = await sql`select id from private.feed_imports where supplier_id=${supplier.id} and source_checksum=${feed.checksum} and status='succeeded' limit 1`;
    if (duplicate) return { skipped: true, previousImportId: duplicate.id };
    const [started] = await sql`insert into private.feed_imports (supplier_id,status,source_checksum) values (${supplier.id},'running',${feed.checksum}) returning id`;
    importId = started.id;

    await sql.begin(async (tx) => {
      const categories = [
        ["Ortopedické vložky", "ortopedicke-vlozky", "Vložky a stielky pre pohodlie a podporu chodidla.", 2],
        ["Rehabilitačné pomôcky", "rehabilitacne-pomocky", "Pomôcky pre podporu, ochranu a regeneráciu pohybového aparátu.", 6],
        ["Starostlivosť o chodidlá", "starostlivost-o-chodidla", "Produkty pre každodennú starostlivosť a komfort chodidiel.", 7],
      ];
      for (const [name, slug, description, sortOrder] of categories) await tx`
        insert into public.categories (name,slug,description,sort_order,is_active) values (${name},${slug},${description},${sortOrder},true)
        on conflict (slug) do update set name=excluded.name,description=excluded.description,is_active=true,updated_at=now()
      `;

      for (const product of feed.products) {
        const [canonical] = await tx`
          insert into public.products (name,slug,short_description,description,brand,product_type,status,published_at,seo_title,seo_description)
          values (${product.name},${product.slug},${product.shortDescription},${product.description},${product.brand},'physical','active',now(),${`${product.name} | SIMSAJ`},${product.shortDescription.slice(0,160)})
          on conflict (slug) do update set
            name=case when exists (select 1 from public.product_manual_overrides o where o.product_id=public.products.id and 'name'=any(o.locked_fields)) then public.products.name else excluded.name end,
            short_description=case when exists (select 1 from public.product_manual_overrides o where o.product_id=public.products.id and 'short_description'=any(o.locked_fields)) then public.products.short_description else excluded.short_description end,
            description=case when exists (select 1 from public.product_manual_overrides o where o.product_id=public.products.id and 'description'=any(o.locked_fields)) then public.products.description else excluded.description end,
            brand=excluded.brand,
            status=case when exists (select 1 from public.product_manual_overrides o where o.product_id=public.products.id and 'status'=any(o.locked_fields)) then public.products.status else 'active' end,
            published_at=coalesce(public.products.published_at,now()),
            seo_title=case when exists (select 1 from public.product_manual_overrides o where o.product_id=public.products.id and 'seo_title'=any(o.locked_fields)) then public.products.seo_title else excluded.seo_title end,
            seo_description=case when exists (select 1 from public.product_manual_overrides o where o.product_id=public.products.id and 'seo_description'=any(o.locked_fields)) then public.products.seo_description else excluded.seo_description end,
            updated_at=now()
          returning id
        `;
        await tx`
          insert into private.supplier_products (supplier_id,external_model_id,canonical_product_id,name,brand,description,image_urls,suggested_price,currency,is_complete,last_seen_at,supplier_reference,vat_rate,features)
          values (${supplier.id},${product.externalId},${canonical.id},${product.name},${product.brand},${product.description},${product.images},${Math.min(...product.variants.map(v=>v.retailIncl))},'EUR',true,now(),${product.reference},${product.vatRate},${tx.json(product.features)})
          on conflict (supplier_id,external_model_id) do update set canonical_product_id=excluded.canonical_product_id,name=excluded.name,brand=excluded.brand,description=excluded.description,image_urls=excluded.image_urls,suggested_price=excluded.suggested_price,currency='EUR',is_complete=true,last_seen_at=now(),supplier_reference=excluded.supplier_reference,vat_rate=excluded.vat_rate,features=excluded.features
        `;
        const [category] = await tx`select id from public.categories where slug=${product.categorySlug}`;
        await tx`insert into public.product_categories (product_id,category_id,is_primary) values (${canonical.id},${category.id},true) on conflict (product_id,category_id) do update set is_primary=true`;
        await tx`delete from public.product_images where product_id=${canonical.id}`;
        for (const [index, image] of product.images.entries()) await tx`insert into public.product_images (product_id,storage_path,alt_text,sort_order) values (${canonical.id},${image},${`${product.name} – fotografia ${index + 1}`},${index})`;

        for (const variant of product.variants) {
          await tx`
            insert into public.product_variants (product_id,sku,name,price,barcode,size,stock_quantity,is_active,vat_rate)
            values (${canonical.id},${variant.sku},${`${product.name} – ${variant.size}`},${variant.retailIncl},${variant.ean},${variant.size},${variant.quantity},${variant.quantity > 0},${product.vatRate})
            on conflict (sku) do update set product_id=excluded.product_id,name=excluded.name,price=excluded.price,barcode=excluded.barcode,size=excluded.size,stock_quantity=excluded.stock_quantity,is_active=excluded.is_active,vat_rate=excluded.vat_rate,updated_at=now()
          `;
          await tx`
            insert into private.supplier_variants (supplier_id,supplier_product_id,sku,gtin,size,quantity,availability,price,currency,last_seen_at,wholesale_price_tax_incl,wholesale_price_tax_excl,retail_price_tax_incl,retail_price_tax_excl,stock_band)
            select ${supplier.id},sp.id,${variant.sku},${variant.ean},${variant.size},${variant.quantity},${variant.availability},${variant.wholesaleExcl},'EUR',now(),${variant.wholesaleIncl},${variant.wholesaleExcl},${variant.retailIncl},${variant.retailExcl},${variant.stockBand}
            from private.supplier_products sp where sp.supplier_id=${supplier.id} and sp.external_model_id=${product.externalId}
            on conflict (supplier_id,sku) do update set gtin=excluded.gtin,size=excluded.size,quantity=excluded.quantity,availability=excluded.availability,price=excluded.price,currency='EUR',last_seen_at=now(),wholesale_price_tax_incl=excluded.wholesale_price_tax_incl,wholesale_price_tax_excl=excluded.wholesale_price_tax_excl,retail_price_tax_incl=excluded.retail_price_tax_incl,retail_price_tax_excl=excluded.retail_price_tax_excl,stock_band=excluded.stock_band
          `;
        }
      }
      await tx`update private.feed_imports set status='succeeded',product_count=${feed.products.length},variant_count=${feed.variants.length},finished_at=now(),notes='SVORTO B2B XML: ceny, DPH, obrázky, parametre a skladové pásma.' where id=${importId}`;
      await tx`update private.supplier_feeds set last_imported_at=now() where supplier_id=${supplier.id}`;
    });
    return { skipped: false, importId };
  } catch (error) {
    if (importId) await sql`update private.feed_imports set status='failed',error_count=1,finished_at=now(),notes=${error instanceof Error ? error.message.slice(0,1000) : 'Neznáma chyba'} where id=${importId}`;
    throw error;
  } finally {
    await sql`select pg_advisory_unlock(hashtext('simsaj:feed:svorto'))`.catch(()=>undefined);
    await sql.end();
  }
}

async function main() {
  const args = process.argv.slice(2); const apply = args.includes("--apply"); const sourceIndex = args.indexOf("--source");
  const source = sourceIndex >= 0 ? args[sourceIndex + 1] : process.env.SVORTO_FEED_URL;
  if (!source) throw new Error("Použitie: --source <feed.xml alebo URL> [--apply]");
  const feed = await parseSvortoFeed(source);
  console.log(JSON.stringify({ partner: "svorto", products: feed.products.length, variants: feed.variants.length, images: feed.products.reduce((sum,p)=>sum+p.images.length,0), mode: apply ? "apply" : "dry-run" }, null, 2));
  if (apply) {
    if (!process.env.SUPABASE_DATABASE_URL) throw new Error("Chýba SUPABASE_DATABASE_URL.");
    console.log(JSON.stringify(await importSvorto(process.env.SUPABASE_DATABASE_URL, feed)));
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error)=>{ console.error(error instanceof Error ? error.message : error); process.exitCode=1; });
}
