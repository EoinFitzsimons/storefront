"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const engine = require("../packages/guidance-core/src/guidance-engine.js");

const tenantDirectory = path.join(__dirname, "..", "examples", "storefronts");
const loadTenant = (id) => JSON.parse(fs.readFileSync(path.join(tenantDirectory, id, "tenant.v1.json"), "utf8"));
const spirit = loadTenant("spirit");
const oakClay = loadTenant("oak-clay");

test("all checked-in tenant configuration files validate against the runtime contract", () => {
  for (const dir of fs.readdirSync(tenantDirectory).filter((name) => fs.existsSync(path.join(tenantDirectory, name, "tenant.v1.json")))) {
    assert.doesNotThrow(() => engine.validateConfiguration(loadTenant(dir)));
  }
});

test("configuration validation rejects invalid versions, duplicate choices, and broken routes", () => {
  const wrongVersion = structuredClone(spirit);
  wrongVersion.schemaVersion = 2;
  assert.throws(() => engine.validateConfiguration(wrongVersion), /schemaVersion/);

  const duplicateAnswer = structuredClone(spirit);
  duplicateAnswer.questions[0].options[1].id = duplicateAnswer.questions[0].options[0].id;
  assert.throws(() => engine.validateConfiguration(duplicateAnswer), /must be unique/);

  const brokenRoute = structuredClone(spirit);
  brokenRoute.routing.defaultNext.q1_goal = "missing-question";
  assert.throws(() => engine.validateConfiguration(brokenRoute), /unknown question/);

  const routeCycle = structuredClone(spirit);
  routeCycle.routing.defaultNext.q9_hesitations = "q1_goal";
  assert.throws(() => engine.validateConfiguration(routeCycle), /cycle/);

  const unsafeCheckout = structuredClone(spirit);
  unsafeCheckout.catalog.products[0].checkoutUrl = "javascript:alert(1)";
  assert.throws(() => engine.validateConfiguration(unsafeCheckout), /HTTP or HTTPS/);
});

test("spirit journey follows the configured default path and short-circuits therapy referrals", () => {
  assert.deepEqual(engine.getJourneyPath(spirit, {}), spirit.questions.map((question) => question.id));
  assert.deepEqual(engine.getJourneyPath(spirit, { q1_goal: "support", q2_context: "professional" }), ["q1_goal", "q2_context"]);

  const result = engine.evaluate(spirit, { q1_goal: "support", q2_context: "professional" });
  assert.equal(result.status, "blocked");
  assert.match(result.message, /verified talking-therapy service/);
  assert.deepEqual(result.recommendations, []);
});

test("tenant routing can skip questions based on an answer", () => {
  assert.deepEqual(engine.getJourneyPath(oakClay, {}), ["interest", "format", "price"]);
  assert.deepEqual(engine.getJourneyPath(oakClay, { interest: "gift" }), ["interest", "price"]);
});

test("recommendation policy ranks matching products and respects declared capability exclusions", () => {
  const answers = {
    q1_goal: "unwind",
    q2_context: "everyday_pressure",
    q3_outcome: "rest",
    q4_worldview: "secular",
    q5_experience: "sensory",
    q6_format: "one_to_one",
    q7_commitment: "once",
    q8_price: "entry"
  };
  const result = engine.evaluate(spirit, answers);
  assert.equal(result.status, "recommended");
  assert.deepEqual(result.recommendations.map((product) => product.id), ["example_aromatherapy"]);
  assert.equal(result.recommendations[0].score, 29 / 30);
  assert.equal(result.recommendations[0].reasons.length, 7);
});

test("no-match result avoids inventing a recommendation", () => {
  const result = engine.evaluate(spirit, {
    q1_goal: "support",
    q3_outcome: "heard",
    q4_worldview: "open",
    q5_experience: "talk"
  });
  assert.equal(result.status, "no_match");
  assert.deepEqual(result.recommendations, []);
});

test("recommendations are capped by the tenant policy", () => {
  const result = engine.evaluate(spirit, {
    q1_goal: "clarity",
    q3_outcome: "perspective",
    q4_worldview: "spiritual",
    q5_experience: "symbolic"
  });
  assert.equal(result.status, "recommended");
  assert.equal(result.recommendations.length, 2);
});

test("recommendations use the selected tenant's product data and policies", () => {
  const result = engine.evaluate(oakClay, { interest: "workshop", format: "hands_on", price: "accessible" });
  assert.equal(result.status, "recommended");
  assert.equal(result.recommendations.length, 2);
  const catalog = new Map(oakClay.catalog.products.map((product) => [product.id, product]));
  assert.ok(result.recommendations.every(({ id }) => catalog.get(id)?.capabilities.includes("workshop")));
});
