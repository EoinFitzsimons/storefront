"use strict";

const fs = require("node:fs");
const path = require("node:path");
const engine = require("../guidance-engine.js");

const tenantDirectory = path.join(__dirname, "..", "config", "tenants");
const files = fs.readdirSync(tenantDirectory)
  .filter((file) => file.endsWith(".v1.json"))
  .sort();

if (files.length === 0) throw new Error("No versioned tenant configurations found");

for (const file of files) {
  const config = JSON.parse(fs.readFileSync(path.join(tenantDirectory, file), "utf8"));
  engine.validateConfiguration(config);
  const expectedId = file.slice(0, -".v1.json".length);
  if (config.tenant.id !== expectedId) {
    throw new Error(`${file} declares tenant ID "${config.tenant.id}", expected "${expectedId}"`);
  }
  console.log(`${config.tenant.id}@${config.revision}: valid`);
}
