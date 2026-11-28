"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const questions = require("../packages/site-reader/src/build-questions.js");
const ranker = require("../packages/site-reader/src/rank-products.js");

const products = [
  { name: "Workshop", category: "Workshop", price: null, attributes: { Outcome: "Learn a skill", Format: "In the studio", "Price band": "Lower-cost" } },
  { name: "Vase", category: "Handmade pottery", price: null, attributes: { Outcome: "Find a piece for home", Format: "Ready-made pottery", "Price band": "Considered" } },
  { name: "Gift card", category: "Gift", price: null, attributes: { Outcome: "Give a flexible choice", Format: "Gift card", "Price band": "Lower-cost" } }
];

test("question builder derives a short intent-led path from published offer differences", () => {
  const built = questions.buildQuestions(products, "Oak & Clay is a pottery studio with beginner workshops and gifts.");

  assert.deepEqual(built.map((question) => question.key), ["attribute:outcome", "attribute:format", "attribute:price band"]);
  assert.equal(built[0].title, "What would be useful to you?");
  assert.equal(built[0].options.length, 3);
  assert.equal(built[2].options.length, 2);
});

test("product ranker filters answers and gives a reason for the remaining offer", () => {
  const built = questions.buildQuestions(products);
  const answers = {
    "attribute:outcome": "find a piece for home",
    "attribute:format": "ready-made pottery",
    "attribute:price band": "considered"
  };
  const ranked = ranker.rankProducts(products, built, answers);

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].product.name, "Vase");
  assert.equal(ranked[0].reasons.length, 3);
});

test("question builder does not invent a journey for a single offer", () => {
  assert.deepEqual(questions.buildQuestions([products[0]]), []);
});
