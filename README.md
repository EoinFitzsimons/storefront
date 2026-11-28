# Guided Commerce

Guided Commerce helps someone who knows what they want to do, but not which product or service to choose. The first product surface is a Chromium browser extension: customers open it when they want help, choose a goal-led starting point, answer only the follow-up questions that distinguish offers on pages they selected, and get an explained shortlist. Different starting paths can share the same useful question, then skip it when it no longer helps.

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

1. In Microsoft Edge, open `edge://extensions` and turn on **Developer mode**. In Chrome, use `chrome://extensions`.
2. Choose **Load unpacked** and select `extensions/chromium`.
3. Open the local demo shop and click the Guided Commerce extension icon.
4. Choose **Analyze this page**. To include the About page or another page from the same shop, navigate there and choose **Add this page to the guide**.
5. Choose one of the shopper-goal starting points, follow its tailored questions, then review the matching offers. Oak & Clay includes ten sample offers and ten distinct starting points so the guide can demonstrate multiple routes and shared follow-up questions.

The extension uses Manifest V3 and requests `activeTab`, `scripting`, and `sidePanel`. The toolbar action opens the panel through its click handler, granting temporary access to that tab; the panel reads it only after the customer chooses **Analyze this page**. It does not request access to all websites. Pages are added one at a time, limited to the same origin, and the collected data and answers remain in the panel's memory. Nothing is sent to a service. Page content is treated as untrusted text, not instructions. The programmatic `sidePanel.open()` action requires Chrome 116 or newer.

The first site reader understands Product JSON-LD, basic Product microdata, and explicit product-card markers. A shop can publish goal-led `startingPoints` as Product `additionalProperty` values; on other sites the extension infers a small set of starting points from each offer’s own description and attributes. It does not crawl links or treat site-wide copy as proof of an individual product feature. Unknown price and availability remain unknown. The sample catalogue intentionally has no live prices, inventory, booking availability, or checkout.

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
