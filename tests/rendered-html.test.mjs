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
