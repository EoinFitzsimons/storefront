"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = path.join(root, "packages", "site-reader", "src");
const output = path.join(root, "extensions", "chromium", "panel", "lib");
const modules = ["extract-page.js", "build-questions.js", "rank-products.js"];

JSON.parse(fs.readFileSync(path.join(root, "extensions", "chromium", "manifest.json"), "utf8"));
fs.mkdirSync(output, { recursive: true });
for (const fileName of modules) fs.copyFileSync(path.join(source, fileName), path.join(output, fileName));
console.log("Built the Chromium panel modules from packages/site-reader/src.");
