"use strict";

const fs = require("node:fs");
const path = require("node:path");

const tenantDirectory = path.join(__dirname, "..", "examples", "storefronts");
const configurations = {};

for (const fileName of fs.readdirSync(tenantDirectory).sort()) {
  const filePath = path.join(tenantDirectory, fileName, "tenant.v1.json");
  if (!fs.existsSync(filePath)) continue;
  const tenantId = fileName;
  configurations[tenantId] = JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const output = [
  "/* Generated from tenant.v1.json files under examples/storefronts. Run npm run build:examples after editing tenant JSON. */",
  "window.EmbeddedTenantConfigs = Object.freeze(" + JSON.stringify(configurations, null, 2) + ");",
  ""
].join("\n");

fs.writeFileSync(path.join(tenantDirectory, "tenant-configs.js"), output);
