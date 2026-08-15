import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function renderHome() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server renders the SIMSAJ storefront", async () => {
  const response = await renderHome();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="sk">/i);
  assert.match(html, /<title>SIMSAJ – Zdravie začína od nôh<\/title>/i);
  assert.match(html, /Zdravie/);
  assert.match(html, /začína od/);
  assert.match(html, /\/brand\/logo-simsaj-sk\.jpeg/);
  assert.match(html, /href="\/produkty"/);
  assert.doesNotMatch(html, /codex-preview|Building your site/i);
});

test("catalog provides instant filters and product suggestions", async () => {
  const page = await readFile(new URL("../components/catalog-filters.tsx", import.meta.url), "utf8");

  for (const field of ["q", "series", "size", "width", "sort"]) {
    assert.match(page, new RegExp(`name=\\"${field}\\"`));
  }
  assert.match(page, /method="get"/);
  assert.match(page, /price-asc/);
  assert.match(page, /price-desc/);
  assert.match(page, /router\.replace/);
  assert.match(page, /onChange=\{\(event\) => applyFilter/);
  assert.match(page, /role="combobox"/);
  assert.match(page, /Zobraziť nájdené produkty/);
});

test("admin catalog is server protected and excluded from search", async () => {
  const page = await readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
  assert.match(page, /requireChatGPTUser\("\/admin"\)/);
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.match(page, /\.from\("products"\)/);
  assert.match(page, /História importov partnerov/);
});

test("SVORTO import keeps B2B data private and exposes customer catalog data", async () => {
  const importer = await readFile(new URL("../scripts/import-svorto-feed.mjs", import.meta.url), "utf8");
  assert.match(importer, /parseSvortoFeed/);
  assert.match(importer, /private\.supplier_products/);
  assert.match(importer, /WHOLESALE_PRICE_TAX_EXCL/);
  assert.match(importer, /BASE_PRICE_PRICE_TAX_INCL/);
  assert.match(importer, /public\.product_variants/);
  assert.match(importer, /pg_try_advisory_lock/);
  assert.doesNotMatch(importer, /b2b_feed\.php\?key=/);
});

test("technical SEO exposes public catalog pages and protects transactional routes", async () => {
  const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  const robots = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
  const product = await readFile(new URL("../app/produkty/[slug]/page.tsx", import.meta.url), "utf8");

  assert.match(sitemap, /\.eq\("status", "active"\)/);
  assert.match(sitemap, /\/produkty\/\$\{product\.slug\}/);
  for (const route of ["/admin", "/api/", "/kosik", "/pokladna", "/platba/"]) {
    assert.match(robots, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(product, /alternates: \{ canonical:/);
  assert.match(product, /"@type": "Product"/);
  assert.match(product, /"@type": "BreadcrumbList"/);
  assert.match(product, /if \(!workingProduct\)/);
});

test("cart removal is a distinct accessible control", async () => {
  const cart = await readFile(new URL("../app/kosik/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(cart, /className="cart-remove-button"/);
  assert.match(cart, /aria-label=\{`Odstrániť \$\{item\.name\} z košíka`\}/);
  assert.match(cart, /className="cart-item-actions"/);
  assert.match(cart, /<strong>\{money\.format\(item\.price \* item\.quantity\)\}<\/strong><button/);
  assert.match(cart, /> Odstrániť<\/button>/);
  assert.match(styles, /\.cart-item \.cart-remove-button/);
  assert.match(styles, /:focus-visible/);
});

test("admin shows private XML import history", async () => {
  const admin = await readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260810092331_add_admin_feed_import_history.sql", import.meta.url), "utf8");

  assert.match(admin, /admin_feed_import_history/);
  assert.match(admin, /História importov partnerov/);
  assert.match(migration, /with \(security_invoker = true\)/);
  assert.match(migration, /revoke all on public\.admin_feed_import_history from anon, authenticated/);
  assert.match(migration, /grant select on public\.admin_feed_import_history to service_role/);
});

test("admin product editing is protected, audited, and feed-safe", async () => {
  const action = await readFile(new URL("../app/admin/produkty/actions.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/admin/produkty/[id]/page.tsx", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260811075249_add_product_manual_editing.sql", import.meta.url), "utf8");
  const policies = await readFile(new URL("../supabase/migrations/20260811080330_add_admin_editing_rls_policies.sql", import.meta.url), "utf8");
  const svorto = await readFile(new URL("../scripts/import-svorto-feed.mjs", import.meta.url), "utf8");
  const diawin = await readFile(new URL("../scripts/import-partner-feed.mjs", import.meta.url), "utf8");

  assert.match(action, /requireChatGPTUser/);
  assert.match(action, /admin_update_product/);
  assert.match(page, /action=\{updateProduct\}/);
  assert.match(migration, /security invoker/);
  assert.match(migration, /admin_audit_log/);
  assert.match(migration, /revoke all on function public\.admin_update_product/);
  assert.match(policies, /to service_role/);
  assert.match(policies, /with check \(true\)/);
  assert.match(svorto, /product_manual_overrides/);
  assert.match(diawin, /product_manual_overrides/);
});

test("test checkout persists orders without activating payment integrations", async () => {
  const checkout = await readFile(new URL("../app/pokladna/page.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/objednavky/skusobna/route.ts", import.meta.url), "utf8");
  const admin = await readFile(new URL("../app/admin/objednavky/page.tsx", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260811114500_add_test_order_checkout.sql", import.meta.url), "utf8");

  assert.match(checkout, /\/api\/objednavky\/skusobna/);
  assert.match(checkout, /Platba, fakturácia ani expedícia neboli spustené/);
  assert.match(route, /diawinWorkingCatalog/);
  assert.match(route, /callOrdersService/);
  assert.match(admin, /requireChatGPTUser\("\/admin\/objednavky"\)/);
  assert.match(migration, /is_test boolean not null default false/);
  assert.match(migration, /security invoker/);
  assert.match(migration, /revoke all on function public\.create_test_order.*from public, anon, authenticated/);
  assert.doesNotMatch(route, /comgate|superfaktura|heureka/i);
});

test("product detail blocks unavailable size and width combinations", async () => {
  const configurator = await readFile(new URL("../components/product-configurator.tsx", import.meta.url), "utf8");
  const detail = await readFile(new URL("../app/produkty/[slug]/page.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/objednavky/skusobna/route.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260815062112_add_variant_width_and_diawin_stock.sql", import.meta.url), "utf8");

  assert.match(detail, /width_code,width_label,stock_quantity,is_active/);
  assert.match(configurator, /disabled=\{!available\}/);
  assert.match(configurator, /Variant nie je dostupný/);
  assert.match(configurator, /variant-unavailable/);
  assert.match(route, /candidate\.width_code/);
  assert.match(route, /candidate\.stock_quantity >= item\.quantity/);
  assert.match(migration, /add column if not exists width_code/);
  assert.match(migration, /private\.supplier_variants/);
});

test("checkout offers personal pickup, Packeta point selection and GLS", async () => {
  const checkout = await readFile(new URL("../app/pokladna/page.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/objednavky/skusobna/route.ts", import.meta.url), "utf8");
  const gls = await readFile(new URL("../lib/server/gls.ts", import.meta.url), "utf8");
  assert.match(checkout, /Osobný odber v kamennej predajni/);
  assert.match(checkout, /Packeta\.Widget\.pick/);
  assert.match(checkout, /Kuriér GLS na adresu/);
  assert.match(route, /Vyberte platné výdajné miesto Packety/);
  assert.match(gls, /GLS_CLIENT_NUMBER/);
  assert.doesNotMatch(gls, /hravosdetmi/i);
});

test("test orders prepare unsent customer and admin email previews", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260811202722_add_test_order_email_previews.sql", import.meta.url), "utf8");
  const detail = await readFile(new URL("../app/admin/objednavky/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(migration, /audience in \('customer', 'admin'\)/);
  assert.match(migration, /status text not null default 'draft'/);
  assert.match(migration, /if not new\.is_test then return new/);
  assert.match(detail, /Skúšobný režim – tieto správy sa neodosielajú/);
});
