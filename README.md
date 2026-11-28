# Guided Commerce

Guided Commerce helps someone who knows the outcome they want, but not which product or service to choose. The first product surface is a Chromium browser extension: customers open it when they want help, review pages from one shop, answer a few questions based on the differences in that catalogue, and get an explained shortlist.

The sample shop is a fixture for the extension. Oak & Clay and Spirit are example merchant catalogues; they are not the product definition. The earlier embedded questionnaire is preserved at `/guided-experience.html` as a separate example.

## Try the demo

Requires Node.js 18 or newer. From the repository root:

```sh
npm run build:storefront
npm run build:examples
npm run build:extension
npm run dev
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) for the Oak & Clay sample shop. Use the example picker to switch to Spirit, or visit `/about.html?tenant=oak-clay` to see the separate About page. The local server only serves the demo site, example catalogue data, and shared guidance code needed by the preserved embedded example.

## Load the extension

1. In Chromium, open `chrome://extensions` and turn on **Developer mode**.
2. Choose **Load unpacked** and select `extensions/chromium`.
3. Open the local demo shop and click the Guided Commerce extension icon.
4. Choose **Analyze this page**. To include the About page or another page from the same shop, navigate there and choose **Add this page to the guide**.
5. Answer the short, locally generated questions and review the matching offers.

The extension uses Manifest V3 and requests `activeTab`, `scripting`, and `sidePanel`. The toolbar action opens the panel through its click handler, granting temporary access to that tab; the panel reads it only after the customer chooses **Analyze this page**. It does not request access to all websites. Pages are added one at a time, limited to the same origin, and the collected data and answers remain in the panel's memory. Nothing is sent to a service. Page content is treated as untrusted text, not instructions. The programmatic `sidePanel.open()` action requires Chrome 116 or newer.

The first site reader understands Product JSON-LD, basic Product microdata, and explicit product-card markers. It does not crawl links or claim facts the site does not publish. Unknown price and availability remain unknown. The sample catalogue intentionally has no live prices, inventory, booking availability, or checkout.

## Project layout

```text
apps/demo-storefront/       Sample merchant site and its HTML partials
extensions/chromium/        Chromium Manifest V3 extension and side panel
packages/site-reader/       Page extraction, question generation, ranking
packages/guidance-core/     Shared configuration and catalogue engine
examples/storefronts/       Spirit and Oak & Clay example configuration
scripts/                    Build and local demo server commands
tests/                      Existing guidance-core and catalogue tests
PRODUCT_PLAN.md              Product and architecture plan
```

`apps/demo-storefront/index.html` is generated from `index.template.html` and `partials/`. Edit the partials or template, then run `npm run build:storefront`. Tenant JSON files live at `examples/storefronts/<tenant>/tenant.v1.json`; after editing those, run `npm run build:examples` to refresh the browser bundle.

## Commands

```sh
npm run dev
npm run build:storefront
npm run build:examples
npm run build:extension
npm run validate:configs
npm test
```

`PRODUCT_PLAN.md` records the user-selected extension-first direction, trade-offs, permission boundary, prototype limitations, and later options for merchant integrations.
