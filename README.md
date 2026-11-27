# Guided Storefront

A small, build-free prototype of a guided customer-discovery and product-recommendation system. The same presentation and guidance engine can run different businesses by loading a tenant's versioned questions, routes, eligibility rules, product attributes, recommendation policy, and brand copy.

The included tenants are:

- `spirit`: wellbeing and reflective experiences, including a therapy eligibility boundary.
- `oak-clay`: pottery, studio workshops, and gift cards, with a different question path and catalogue.

This remains a prototype, not a hosted multi-tenant SaaS product. It has no authentication, tenant administration UI, database, analytics, inventory guarantees, or payment processing.

## Run locally

The browser fetches tenant configuration and may fetch an HTTP catalogue, so serve the files over HTTP rather than opening `index.html` directly:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` for Spirit or `http://localhost:8000/?tenant=oak-clay` for Oak & Clay. Tenant IDs are restricted to lowercase letters, digits, underscores, and hyphens before they are used to select a configuration file.

No compile step or third-party JavaScript dependency is required. Node.js 18+ is used for the built-in test runner and configuration checks:

```sh
npm test
npm run validate:configs
```

## Architecture

- `script.js` owns DOM rendering, navigation, and result presentation. It reads content and theme settings from the active tenant instead of defining business rules.
- `guidance-engine.js` is a pure, DOM-independent module for configuration validation, conditional path traversal, eligibility, scoring, and ranking. It runs in the browser and under Node tests.
- `catalog-integrations.js` loads a tenant's versioned config and products. It supports embedded demo products or an HTTP JSON catalogue.
- `config/tenant-config.v1.schema.json` describes the version 1 configuration contract. Tenant files in `config/tenants/` carry both `schemaVersion` and a semver `revision`; make a new schema version for incompatible shape changes and increment a tenant revision when its content or policy changes.
- `tests/` covers tenant validation, routing, recommendation outcomes, capability exclusions, and catalogue loading/failure cases.

Tenant data stays separate from presentation code. Questions declare answer tags, routes declare defaults and conditional next steps, and policies declare scoring weights, result limits, blocked answers, and capability exclusions. Product tags determine relevance; capabilities express hard eligibility constraints. The engine returns an explicit `recommended`, `no_match`, or `blocked` result and does not invent a fallback recommendation.

## Catalogue and checkout integrations

For a live catalogue, set a tenant's `catalog.provider` to:

```json
{
  "type": "http",
  "url": "https://catalog.example.test/api/products"
}
```

The endpoint must return either a product array or an object with a `products` array. Every product must include `id`, `name`, `description`, `planTitle`, `plan`, `capabilities`, and namespaced `tags`; optional `checkoutUrl` values must be absolute HTTP(S) URLs. Invalid data and failed requests are surfaced as errors rather than silently replaced with demo content. The demo tenant files use embedded catalogues.

The checkout integration is intentionally a link seam only: a validated `checkoutUrl` renders a “View offer” link. It does not create orders or verify live price or availability. Production deployments should put authenticated/private catalogue access behind a server-side integration, avoid exposing credentials in tenant JSON, and connect checkout to the business's own transaction and availability systems.

## Privacy and recommendation safety

Answers stay in page memory and are not persisted by this prototype. The Spirit tenant blocks therapy-seeking answers because its sample catalogue contains no verified therapy service, and excludes products with capabilities incompatible with selected spiritual preferences. These are configuration-level examples, not clinical advice or a substitute for validating real providers and offers.

Google Fonts are requested over the network; system font fallbacks are provided.
