(function (root, factory) {
  const adapters = factory(root.GuidanceEngine);
  if (typeof module === "object" && module.exports) module.exports = adapters;
  root.CatalogIntegrations = adapters;
}(globalThis, function (engine) {
  "use strict";

  const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

  async function readJson(response, description) {
    if (!response.ok) throw new Error(`${description} request failed (${response.status})`);
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`${description} returned invalid JSON: ${error.message}`);
    }
  }

  async function loadTenantConfiguration(tenantId, fetchImpl = fetch, baseUrl) {
    if (!TENANT_ID_PATTERN.test(tenantId)) throw new Error("Tenant ID must contain only lowercase letters, numbers, underscores, and hyphens");
    const base = baseUrl || (typeof document === "undefined" ? undefined : document.baseURI);
    if (!base) throw new Error("A base URL is required to load tenant configuration outside a browser");
    const url = new URL(`config/tenants/${tenantId}.v1.json`, base);
    const config = await readJson(await fetchImpl(url), `Tenant configuration "${tenantId}"`);
    engine.validateConfiguration(config);
    if (config.tenant.id !== tenantId) throw new Error(`Tenant configuration ID does not match "${tenantId}"`);
    return config;
  }

  async function loadCatalog(config, fetchImpl = fetch) {
    if (config.catalog.provider.type === "embedded") {
      engine.validateProducts(config.catalog.products);
      return config.catalog.products;
    }
    const provider = config.catalog.provider;
    const payload = await readJson(await fetchImpl(provider.url), `Catalog for tenant "${config.tenant.id}"`);
    const products = Array.isArray(payload) ? payload : payload.products;
    engine.validateProducts(products, "catalog response");
    return products;
  }

  return { loadTenantConfiguration, loadCatalog };
}));
