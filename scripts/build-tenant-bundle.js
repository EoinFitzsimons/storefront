"use strict";

const fs = require("node:fs");
const path = require("node:path");

const tenantDirectory = path.join(__dirname, "..", "config", "tenants");
const configurations = {};

for (const fileName of fs.readdirSync(tenantDirectory).sort()) {
  if (!fileName.endsWith(".v1.json")) continue;
  const tenantId = fileName.slice(0, -".v1.json".length);
  configurations[tenantId] = JSON.parse(fs.readFileSync(path.join(tenantDirectory, fileName), "utf8"));
}

const output = [
  "/* Generated from config/tenants/*.v1.json. Run npm run build:configs after editing tenant JSON. */",
  "window.EmbeddedTenantConfigs = Object.freeze(" + JSON.stringify(configurations, null, 2) + ");",
  ""
].join("\n");

fs.writeFileSync(path.join(__dirname, "..", "config", "tenant-configs.js"), output);
