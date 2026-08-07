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

test("catalog provides shareable search, filters and sorting", async () => {
  const page = await readFile(new URL("../app/produkty/page.tsx", import.meta.url), "utf8");

  for (const field of ["q", "series", "size", "width", "sort"]) {
    assert.match(page, new RegExp(`name=\\"${field}\\"`));
  }
  assert.match(page, /method="get"/);
  assert.match(page, /price-asc/);
  assert.match(page, /price-desc/);
  assert.match(page, /Zrušiť všetky filtre/);
  assert.match(page, /aria-live="polite"/);
});
