# Spirit Discovery Experience

Spirit is a responsive storefront prototype for a guided customer-discovery journey. It demonstrates how a short sequence of conversational questions can help someone reflect on what they want and explore potentially relevant experiences. The current version is designed around the Spirit brand and wellbeing/spirituality catalogue; it is a proof of concept, not a configurable product recommendation platform.

## What the experience does

- Guides visitors through nine questions, with progress feedback, back navigation, optional skips, and a restartable results view.
- Uses selected answers to score a small, hard-coded example catalogue and show up to two illustrative suggestions with sample plans.
- Respects selected preferences, including a non-spiritual path, and avoids suggesting therapy because the prototype has no verified therapy service to recommend.
- Presents a responsive, celestial visual design and keyboard-accessible controls for the core journey.

## How recommendations work

Questions, answer tags, product records, eligibility exclusions, and match weights are defined directly in `script.js`. The current matcher compares mapped answer tags with product tags, ranks eligible examples, and displays a short explanation. This is intentionally a small demonstration: it has no live catalogue, product availability, pricing, booking links, or business-specific configuration. Not every question currently changes the recommendation results.

## Run locally

Open `index.html` in a modern browser. No install or build step is needed. Google Fonts are requested over the network; system font fallbacks are provided.

## Prototype and privacy notes

This is a front-end-only prototype. Answers are held in page memory while the journey is open and are not saved or sent to an application backend. The example products and plans are not verified or bookable offers; confirm availability, price, suitability, and provider credentials before relying on any real-world recommendation. The prototype does not provide therapy or assess clinical needs.

The visual direction uses a celestial palette and moon/circle motifs. Komet and PF Marlet Display were named in the supplied brand guide but are not bundled here, so available font fallbacks are used.

## Extending beyond this demo

The journey is currently tailored to one brand and its example catalogue. Reusing it for other businesses would require separating question flows, routing and eligibility rules, product data, and recommendation policies from the presentation code, then adding validation and automated tests for each business configuration. Production use would also require appropriate catalogue and booking integrations, privacy review, and monitoring of recommendation quality.