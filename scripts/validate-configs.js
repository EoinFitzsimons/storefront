"use strict";

const fs = require("node:fs");
const path = require("node:path");
const engine = require("../packages/guidance-core/src/guidance-engine.js");

const examplesDirectory = path.join(__dirname, "..", "examples", "storefronts");
const files = fs.readdirSync(examplesDirectory)
  .filter((name) => fs.existsSync(path.join(examplesDirectory, name, "tenant.v1.json")))
  .sort();

if (files.length === 0) throw new Error("No versioned tenant configurations found");

for (const file of files) {
  const config = JSON.parse(fs.readFileSync(path.join(examplesDirectory, file, "tenant.v1.json"), "utf8"));
  engine.validateConfiguration(config);
  const expectedId = file;
  if (config.tenant.id !== expectedId) {
    throw new Error(`${file} declares tenant ID "${config.tenant.id}", expected "${expectedId}"`);
  }
  console.log(`${config.tenant.id}@${config.revision}: valid`);
}
