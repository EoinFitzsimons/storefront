"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
require("../packages/guidance-core/src/guidance-engine.js");
const integrations = require("../packages/guidance-core/src/catalog-integrations.js");

const spiritConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "examples", "storefronts", "spirit", "tenant.v1.json"), "utf8"));
const okResponse = (value) => ({ ok: true, json: async () => value });

test("tenant loader requests the versioned config and validates its tenant identity", async () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "examples", "storefronts", "oak-clay", "tenant.v1.json"), "utf8"));
  let requestedUrl;
  const loaded = await integrations.loadTenantConfiguration("oak-clay", async (url) => {
    requestedUrl = url.href;
    return okResponse(config);
  }, "https://shop.example/");

  assert.equal(requestedUrl, "https://shop.example/examples/storefronts/oak-clay/tenant.v1.json");
  assert.equal(loaded.tenant.id, "oak-clay");
});

test("tenant loader uses a bundled configuration without making a request", async () => {
  const previous = global.EmbeddedTenantConfigs;
  global.EmbeddedTenantConfigs = { spirit: spiritConfig };
  try {
    const loaded = await integrations.loadTenantConfiguration("spirit", async () => {
      throw new Error("bundled configuration should avoid fetching");
    }, "file:///storefront/index.html");
    assert.equal(loaded.tenant.id, "spirit");
    assert.notEqual(loaded, spiritConfig);
  } finally {
    if (previous === undefined) delete global.EmbeddedTenantConfigs;
    else global.EmbeddedTenantConfigs = previous;
  }
});

test("tenant loader rejects unsafe identifiers and mismatched configuration IDs", async () => {
  await assert.rejects(() => integrations.loadTenantConfiguration("../spirit", async () => {
    throw new Error("should not fetch");
  }), /Tenant ID/);
  await assert.rejects(() => integrations.loadTenantConfiguration("spirit", async () => okResponse({
    ...spiritConfig,
    tenant: { ...spiritConfig.tenant, id: "another-tenant" }
  }), "https://shop.example/"), /does not match/);
});

test("embedded catalog adapter validates products and returns tenant examples", async () => {
  const products = await integrations.loadCatalog(spiritConfig);
  assert.deepEqual(products.map((product) => product.id), ["example_aromatherapy", "example_tarot", "example_astrology"]);
});

test("HTTP catalog adapter accepts a products envelope and validates its records", async () => {
  const config = structuredClone(spiritConfig);
  config.catalog = { provider: { type: "http", url: "https://catalog.example/api/products" } };
  const products = [{ ...spiritConfig.catalog.products[0], checkoutUrl: "https://shop.example/products/aroma" }];
  const loaded = await integrations.loadCatalog(config, async (url) => {
    assert.equal(url, config.catalog.provider.url);
    return okResponse({ products });
  });
  assert.equal(loaded[0].checkoutUrl, "https://shop.example/products/aroma");
});

test("HTTP catalog adapter surfaces failed requests and invalid product data", async () => {
  const config = structuredClone(spiritConfig);
  config.catalog = { provider: { type: "http", url: "https://catalog.example/api/products" } };
  await assert.rejects(() => integrations.loadCatalog(config, async () => ({ ok: false, status: 503 })), /failed \(503\)/);
  await assert.rejects(() => integrations.loadCatalog(config, async () => okResponse({ products: [{ id: "bad" }] })), /catalog response/);
});
