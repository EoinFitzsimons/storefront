# Guided Commerce: Product Plan

## The idea in one sentence

Guided Commerce helps a visitor who knows the kind of outcome they want, but
not the product they need, reach a suitable and purchasable offer through a
short, transparent decision journey.

The product is the guidance system. Spirit and Oak & Clay are only demo
backdrops used to prove that the same system can work for very different
catalogues.

## 1. What it is

This is a configurable layer placed between a storefront landing page and a
catalogue or booking flow.

Instead of asking a visitor to browse dozens of products, it asks a small
sequence of questions that progressively turns an unclear intention into a
concrete buying path.

The end state is not simply a recommendation. It is one of four useful
commercial outcomes:

1. **Ready to buy** — show one or more appropriate offers with a direct
   checkout or booking action.
2. **Ready to compare** — show a small, explained shortlist when more than
   one offer could fit.
3. **Not eligible or unavailable** — explain why the system cannot responsibly
   recommend an offer and give an honest next step.
4. **Not ready yet** — preserve the visitor’s direction and offer a low-friction
   way to browse, save, or return without pretending to know the answer.

The system must never create a false sense of personal expertise. It guides
with business-defined rules and real offer data.

## 2. Why it exists

Conventional storefront navigation assumes the visitor already knows the
thing they want to buy:

- a product category;
- a service name;
- a date;
- a price point;
- a size, format, or specification.

That is often untrue. A customer can arrive knowing only:

- “I want to do something creative with a friend.”
- “I need a gift, but I do not know what kind.”
- “I want help with a decision, but I do not know which service applies.”
- “I want something for my home, but I do not know which product will work.”

Without guidance, that visitor faces catalogue fatigue: broad menus, product
pages that require prior knowledge, and a growing chance of leaving before
finding a fit.

Guided Commerce turns the business’s in-person sales conversation into a
repeatable digital decision path. The purpose is to help customers make a
better choice and, where there is a match, make it easy to pay.

## 3. Who it is for

### Customers

People who have a goal but not a SKU. They need orientation before they need
search filters.

### Merchants and service businesses

Businesses with one or more of these characteristics:

- a varied catalogue with overlapping offers;
- products or services that need context before purchase;
- a staff-led sales conversation that is difficult to reproduce online;
- different paths for gifting, self-purchase, booking, and repeat purchase;
- inventory, availability, compatibility, or eligibility constraints.

### The business team

Owners, merchandisers, and sales teams need to express their expertise in
configuration, without hard-coding every product decision into the user
interface.

## 4. The core customer journey

~~~mermaid
flowchart LR
  A[Intent: I want something] --> B[Guided questions]
  B --> C[Customer profile signals]
  C --> D[Rules, availability, and catalogue data]
  D --> E{Outcome}
  E -->|Clear match| F[Recommended offer]
  E -->|Several fits| G[Explained shortlist]
  E -->|No safe or available fit| H[Honest alternative]
  F --> I[Booking or checkout]
  G --> I
~~~

### Stage 1: establish the job to be done

The first question should identify what the visitor is trying to accomplish,
not which product family they think they need.

Examples:

- learn, make, buy, gift, repair, relax, celebrate;
- solve a practical problem, explore a new interest, or choose for someone
  else.

### Stage 2: ask only decision-changing questions

Each later question must either:

- route the visitor to a different path;
- rule out incompatible offers;
- improve ranking between viable offers;
- surface a commercial constraint such as date, budget, location, or delivery;
- produce a detail needed to complete checkout.

If an answer does none of these things, it should not be asked.

### Stage 3: give a legible result

The result must say:

- what the offer is;
- why it fits the answers;
- which practical constraints it satisfies;
- what happens next;
- what it costs or what price range to expect;
- whether it is available now.

The call to action should match the offer: book, add to basket, choose a date,
buy a gift card, request availability, or save the shortlist.

## 5. How the product works

The system has five layers.

| Layer | Responsibility |
| --- | --- |
| Entry experience | Explain the value of being guided and invite the visitor into a short journey. |
| Question flow | Ask business-defined questions and follow conditional routes. |
| Decision engine | Combine answers with product attributes, constraints, exclusions, and ranking policy. |
| Result experience | Explain recommendations and present the correct buying action. |
| Catalogue and checkout seam | Use current product, stock, price, capacity, and fulfilment data; hand off to the merchant’s payment or booking system. |

### Decision model

Each tenant provides:

- a question set and answer vocabulary;
- routes that determine which questions are relevant;
- product tags and structured attributes;
- weighting rules for what matters most;
- exclusions and blocked states;
- result copy and actions;
- visual and interaction tokens.

The shared engine must remain ignorant of individual businesses. It can know how
to process a route, a constraint, a tag, and an action. It must not know the
meaning of a particular service, product, or brand.

### Recommendation model

An eligible product is one that:

1. is available to the visitor under declared rules;
2. does not violate any exclusion;
3. satisfies required constraints;
4. earns a meaningful score from the customer’s signals.

The system should return no result rather than fabricate a poor fit.

## 6. What makes it commercially useful

Guidance should improve the buying journey at measurable points:

| Customer need | System response | Commercial effect |
| --- | --- | --- |
| “I do not know where to start.” | Goal-led entry point | More visitors reach relevant catalogue areas |
| “There are too many choices.” | Small, explained shortlist | Less abandonment and fewer unproductive page views |
| “Will this actually work for me?” | Constraint and fit explanation | Higher confidence before checkout |
| “Can I get it when I need it?” | Availability, date, delivery, or capacity check | Fewer failed checkout attempts |
| “I need a gift, not a product for myself.” | Separate gifting route | A distinct revenue path rather than a generic filter |
| “None of these are right.” | Honest no-match state | Preserves trust and offers a viable fallback |

This is guided conversion, not pressure. The measure of success is a better
decision and a cleaner path to payment, not forcing every visitor into a
recommendation.

## 7. Where it applies

The concept is strongest in categories where a catalogue alone is a poor
salesperson.

| Category | Example starting intention | Guidance outcome |
| --- | --- | --- |
| Workshops and experiences | “I want to make something with friends.” | Select a suitable session, date, and group size |
| Gifts | “I want something meaningful, but do not know what.” | Giftable offer, budget, delivery path |
| Health-adjacent wellbeing | “I want to feel less overwhelmed.” | Suitable non-clinical experience or an honest boundary |
| Furniture and homewares | “I need something for a small room.” | Size, material, lead-time, and style fit |
| Education | “I want to learn a skill.” | Course level, format, schedule, and commitment fit |
| Travel and leisure | “I need a weekend plan.” | Experience mix, budget, accessibility, and date fit |
| Complex services | “I need help with a problem.” | Appropriate service path, intake, or escalation |

The product should not be constrained by the first demo domain. A new tenant
should change the customer conversation and result presentation without
requiring a new decision engine.

## 8. Which prototype behaviours prove the concept

The prototype is persuasive only if it demonstrates differences that matter.

### Required

1. At least two businesses with visibly different brand, question, route, and
   result experiences.
2. At least three outcome paths within one business, such as self-purchase,
   booking, and gifting.
3. Conditional routing that skips irrelevant questions.
4. A result that gives reasons and a direct commercial action.
5. At least one no-match or ineligible state that protects customer trust.
6. Realistic product attributes beyond a title and description: price, timing,
   availability, fulfilment, capacity, stock, level, or compatibility.
7. A clear demo explanation that the experience is configurable rather than a
   bespoke quiz.

### Not required yet

- user accounts;
- payment processing inside this codebase;
- live inventory;
- a tenant administration interface;
- machine-generated recommendations;
- analytics collection.

These can follow once the decision model is proven.

## 9. The role of the demo tenants

Spirit and Oak & Clay are examples, not the product definition.

- **Spirit** should prove a high-consideration journey with preference
  boundaries and respectful no-match behaviour.
- **Oak & Clay** should prove a commerce journey where practical constraints
  lead to a workshop booking, product purchase, or gift transaction.

They should not share a visual metaphor, question density, route shape, result
layout, or conversion action unless that is a genuinely shared platform
component.

The comparison should make one point obvious: the same engine can guide very
different buying decisions.

## 10. Where Guided Commerce lives

“A layer between the landing page and catalogue” describes the customer
journey, but not the software boundary. There are three distinct ways to put
that journey in front of a customer. They are competing first-product choices,
even though a later product could support more than one.

### Option A — Built into a merchant’s website

The merchant adds a Guided Commerce page, component, or script to their own
site. The flow uses a merchant-approved catalogue feed and business-authored
questions and rules.

**Strengths**

- The merchant controls the customer experience and brand.
- Catalogue, price, availability, and checkout can use supported site data.
- The business can review the questions and recommendation rules.
- No browser-wide access is needed.

**Costs**

- Each merchant needs an integration or platform-specific app.
- The merchant has to install, configure, and maintain it.
- It is less convenient to try on arbitrary websites.

**Best fit:** a credible first product and the current demo’s natural next
step.

### Option B — Browser extension that infers guidance from a website

The customer opens an extension on a shopping site. It reads visible product
and about-page information, then generates questions and maps answers to
products.

**Strengths**

- Customers can try guidance on sites that did not install the product.
- It could discover unexpected use cases across many merchants.
- It demonstrates the most novel version of the idea.

**Costs and risks**

- Sites expose inconsistent product data; visible copy is not a reliable
  source for stock, price, compatibility, or fulfilment rules.
- The extension needs permission to read merchant pages. Broad permissions
  are difficult to justify; per-site access adds friction.
- A generated questionnaire can ask irrelevant questions or make unsupported
  product claims unless the system also has structured merchant knowledge.
- Page content must be treated as untrusted input. It cannot define system
  instructions, grant permissions, or silently trigger purchase actions.
- Site changes can break extraction without warning.

**Best fit:** a research prototype or later consumer companion, with explicit
per-site consent and clear extraction limits. It is not a dependable first
merchant product by itself.

### Option C — Merchant integration with an optional extension companion

The merchant installs the trusted catalogue and rules integration from Option
A. An extension can recognise compatible sites and open that merchant-authored
guide. On other sites, it may offer limited, clearly labelled extraction as
a fallback, but it must not present inferred inventory or generated rules as
merchant-approved facts.

**Strengths**

- A real merchant integration supplies reliable product and business rules.
- An extension gives customers a reusable entry point across participating
  stores.
- The product can grow from a dependable core into the more novel discovery
  experience.

**Costs**

- It is the most complex option: website integration, shared protocol,
  extension permissions, compatibility, and two interfaces.
- It should not be attempted as a single first release.

**Best fit:** long-term product direction if merchant reliability and
cross-store access are both important.

### Selected direction: Option B, extension first

The first product is a Chromium browser extension that opens a Guided Commerce
side panel on the customer’s explicit request. It reads the current page,
extracts product and business context that the page exposes, and derives a
short questionnaire from the observed catalogue.

The first prototype should be clear about its limits:

1. Use Manifest V3 with the browser side panel.
2. Request only temporary access to the current tab after the customer invokes
   the extension. Do not request access to all websites.
3. Let the customer explicitly add pages from the same shop, such as About,
   collection, or product pages, to the current guide. Do not silently crawl a
   domain.
4. Keep page data in the extension session and derive the first questionnaire
   locally. Do not send page content to an AI service in this prototype.
5. Treat all page text as untrusted catalogue data. Never follow instructions
   from the page or allow it to define extension behaviour.
6. Label inferred product facts and questions as suggestions. Missing price,
   stock, or suitability data must remain unknown rather than guessed.
7. Use customer answers to filter and explain offers found on the collected
   pages. If extraction produces too little trustworthy data, show that clearly.

This is the chosen product direction, with an intentionally narrow first
implementation. Automatic guidance over arbitrary websites remains uncertain
because each site exposes different data and navigation.

## 11. Proposed project structure

The codebase should show the product and the example site as separate things.
The demo storefront is a customer of Guided Commerce, not the product itself.

~~~text
apps/
  demo-storefront/
    index.html
    index.template.html
    about.html
    partials/
      storefront-header.html
      storefront-hero.html
      product-grid.html
      about-section.html
      storefront-footer.html
    src/
      storefront.js
      about.js
      storefront.css
      storefront-theme.css
      about.css
      guided-experience.js
      guided-experience.css

extensions/
  chromium/
    manifest.json
    service-worker.js
    panel/
      index.html
      panel.js
      panel.css
      panel-overrides.css
      lib/                 generated site-reader modules

packages/
  site-reader/
    src/
      extract-page.js
      build-questions.js
      rank-products.js
  guidance-core/
    src/
      guidance-engine.js
      catalog-integrations.js

examples/
  storefronts/
    tenant-configs.js
    tenant.schema.json
    spirit/
    oak-clay/

scripts/
  build-demo-storefront.js
  build-example-bundle.js
  build-extension.js
  serve-demo.js
  validate-configs.js

tests/
  guidance-engine.test.js
  catalog-integrations.test.js
  site-reader.test.js
~~~

The extension is the product surface. The demo storefront is a fixture used to
show what the extension can read and how its recommendations lead back to an
offer. The site-reader package owns extraction and question generation;
guidance-core owns general decision behaviour.

The sample storefront uses a small Node build script to assemble its HTML
partials into a regular `index.html`, plus a dependency-free local server for
the demo. This keeps the result easy to inspect and usable by the extension
without adding a framework just to split HTML. The earlier embedded
questionnaire remains at `apps/demo-storefront/guided-experience.html` as a
separate example rather than the product's main surface.

### Product page versus demo site

- **Guided Commerce product:** the questionnaire, routing, explanation,
  results, accessibility, and mount/integration contract.
- **Demo storefront:** example navigation, product catalogue, brand identity,
  and checkout handoff. Its purpose is to demonstrate how a merchant uses the
  product.
- **Tenant examples:** business-authored questions, decision rules, and
  product data. These are inputs to the product, not copies of its logic.

## 12. Decisions for the next iteration

The user selected Option B: browser extension first. The current prototype
implements explicit current-page extraction, same-origin page-by-page
collection, local question generation from product differences and page
context, and explainable matching. It uses temporary `activeTab` access and
does not crawl pages, upload content, call remote AI, or persist answers. The
next iteration should validate extraction across varied real sites before
adding merchant-installed integrations, remote AI, persistent storage, or
broad site permissions.

## 13. Delivery sequence

### Phase 1 — Deliver the extension-first prototype

1. Load a Chromium Manifest V3 extension with current-tab access only.
2. Let the customer analyze a shop page and add same-origin pages manually.
3. Extract product details from structured data and visible product markers.
4. Derive a short set of questions from catalogue differences on-device.
5. Explain matches and preserve unknown price or availability instead of
   filling gaps with guesses.
6. Keep the demo storefront and its sample catalogues separate from the
   extension product.

### Phase 2 — Validate where inference helps

1. Try collection, product, and About pages from several kinds of sites.
2. Record which product formats and attributes extraction can read reliably.
3. Identify when there is not enough data to ask a useful question.
4. Compare the generated guide with customer intent and the offers actually
   selected.
5. Add focused extraction and ranking checks before expanding site support.

### Phase 3 — Build credible demonstrations

1. Replace shallow sample catalogues with realistic data.
2. Give each demo its own interaction and visual expression.
3. Make every result commercially actionable.
4. Add unavailable and no-match cases.
5. Test the full path from entry intent through checkout handoff.

### Phase 4 — Prepare a live pilot

1. Connect a live catalogue or booking source through a server-side adapter.
2. Define price, availability, stock, and capacity freshness rules.
3. Connect the merchant checkout or booking system.
4. Measure where guidance helps and where it introduces friction.
5. Create a safe authoring workflow for business rules and copy.

## 14. Design principles

1. Start with the customer’s goal, not the catalogue taxonomy.
2. Every question must change the decision.
3. Explain why a result fits.
4. Prefer an honest no-match over a weak recommendation.
5. Make practical buying details visible before the click to pay.
6. Keep business knowledge in configuration, not presentation code.
7. Make the tenant identity felt in the journey, not just the colours.
8. Treat checkout as the outcome of guidance, not an unrelated handoff.

## 15. Decisions to make before further implementation

1. Who is this prototype intended to convince?
2. Which customer journey best proves guided conversion from intent to payment?
3. Should the next demo prioritise product retail, booking, gifting, or a
   mixture?
4. What minimum live-data realism is necessary for the demo to feel credible?
5. What business rules are important enough to show explicitly as boundaries?
6. What action counts as conversion in the prototype: checkout handoff,
   booking selection, quote request, or saved shortlist?
