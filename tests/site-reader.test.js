"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const oakClay = require("../examples/storefronts/oak-clay/tenant.v1.json");
const questions = require("../packages/site-reader/src/build-questions.js");
const ranker = require("../packages/site-reader/src/rank-products.js");
const siteReader = require("../packages/site-reader/src/extract-page.js");

function oakOffers() {
  return oakClay.catalog.products.map((product) => ({
    ...product,
    url: `https://oak-clay.example/product/${product.id}`,
    category: product.capabilities.includes("workshop") ? "Workshop" : product.capabilities.includes("gift") ? "Gift" : "Handmade pottery",
    attributes: { ...product.attributes, "Offer type": product.capabilities.includes("workshop") ? "Workshop" : product.capabilities.includes("gift") ? "Gift" : "Handmade pottery", "Starting point": product.startingPoints }
  }));
}

test("Oak & Clay opens with ten shopper-intent starting points, including an all-catalogue unsure route", () => {
  const products = oakOffers();
  const journey = questions.buildJourney(products);
  const labels = journey.starts.map((start) => start.label);

  assert.equal(products.length, 10);
  assert.equal(labels.length, 10);
  assert.ok(labels.includes("I want to make something by hand"));
  assert.ok(labels.includes("I want a creative activity with someone"));
  assert.ok(labels.includes("I need a thoughtful gift"));
  assert.ok(labels.includes("I’m not sure where to begin"));
  assert.equal(journey.routes["i-m-not-sure-where-to-begin"].candidateKeys.length, products.length);
});

test("intent paths branch to different questions and share reusable decision questions", () => {
  const journey = questions.buildJourney(oakOffers());
  const make = journey.starts.find((start) => start.label === "I want to make something by hand");
  const share = journey.starts.find((start) => start.label === "I want a creative activity with someone");
  const home = journey.starts.find((start) => start.label === "I want a handmade piece for my home");
  const makeRoute = journey.routes[make.id];
  const shareRoute = journey.routes[share.id];
  const homeRoute = journey.routes[home.id];

  assert.ok(makeRoute.questions.length >= 3);
  assert.ok(shareRoute.questions.length >= 3);
  assert.ok(homeRoute.questions.length >= 2);
  assert.ok(journey.sharedQuestionKeys.includes("attribute:outcome"));
  assert.notDeepEqual(makeRoute.candidateKeys, homeRoute.candidateKeys);
  assert.ok(makeRoute.questions.some((question) => question.key === "attribute:making style"));
  assert.ok(homeRoute.questions.some((question) => question.key === "attribute:use"));
  assert.ok(shareRoute.questions.some((question) => question.key === "attribute:company"));
  assert.ok(makeRoute.questions.every((question) => question.options.length >= 3));
});

test("answers narrow only the selected intent route and explain matching offer details", () => {
  const products = oakOffers();
  const journey = questions.buildJourney(products);
  const make = journey.starts.find((start) => start.label === "I want to make something by hand");
  const route = journey.routes[make.id];
  const candidates = products.filter((product) => route.candidateKeys.includes(`${product.name.toLowerCase()}|${product.url}`));
  const styleQuestion = route.questions.find((question) => question.key === "attribute:making style");
  const answers = { [styleQuestion.key]: "wheel throwing" };
  const ranked = ranker.rankProducts(candidates, route.questions, answers);

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].product.name, "Pottery wheel workshop");
  assert.ok(ranked[0].reasons.some((reason) => reason.includes("Wheel throwing")));
});

test("question builder creates useful inferred starts when a page has no authored starting points", () => {
  const inferred = questions.buildJourney([
    { name: "Wheel class", description: "Learn to make pottery in a workshop", category: "Workshop", attributes: { Outcome: "Learn a skill", Format: "In the studio" } },
    { name: "Hand-built vase", description: "A handmade ceramic piece for your home", category: "Pottery", attributes: { Outcome: "Find a piece for home", Format: "Ready-made" } },
    { name: "Gift card", description: "A flexible gift for someone", category: "Gift", attributes: { Outcome: "Let them choose", Format: "Gift card" } }
  ], "A local studio for making and finding pottery.");

  assert.ok(inferred.starts.some((start) => start.id === "make-learn"));
  assert.ok(inferred.starts.some((start) => start.id === "gift"));
  assert.ok(inferred.starts.some((start) => start.id === "home"));
});

test("site reader preserves multiple structured starting points and the merchant identity", () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Oak & Clay",
    itemListElement: [{
      "@type": "ListItem",
      item: {
        "@type": "Product",
        name: "Pottery wheel workshop",
        description: "A workshop for learning wheel throwing.",
        category: "Workshop",
        url: "https://shop.example/workshop",
        additionalProperty: [
          { "@type": "PropertyValue", name: "Starting point", value: "I want to make something by hand" },
          { "@type": "PropertyValue", name: "Starting point", value: "I want to learn a new skill" }
        ]
      }
    }]
  };
  const script = { textContent: JSON.stringify(structuredData) };
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  globalThis.location = { href: "https://shop.example/", origin: "https://shop.example" };
  globalThis.document = {
    title: "Shop catalogue",
    body: { innerText: "A local pottery studio." },
    querySelector: () => null,
    querySelectorAll: (selector) => selector.startsWith("script[") ? [script] : []
  };

  try {
    const page = siteReader.extractCurrentPage();
    assert.equal(page.siteName, "Oak & Clay");
    assert.deepEqual(page.products[0].attributes["Starting point"], [
      "I want to make something by hand",
      "I want to learn a new skill"
    ]);
    assert.equal(page.products[0].price, null);
    assert.equal(page.products[0].availability, "");
  } finally {
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else delete globalThis.document;
    if (originalLocation) Object.defineProperty(globalThis, "location", originalLocation);
    else delete globalThis.location;
  }
});
