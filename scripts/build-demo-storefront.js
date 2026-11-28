"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const app = path.join(root, "apps", "demo-storefront");
const template = fs.readFileSync(path.join(app, "index.template.html"), "utf8");
const partials = {
  "@@storefront-header@@": "storefront-header.html",
  "@@storefront-hero@@": "storefront-hero.html",
  "@@product-grid@@": "product-grid.html",
  "@@about-section@@": "about-section.html",
  "@@storefront-footer@@": "storefront-footer.html"
};

let output = template;
for (const [marker, fileName] of Object.entries(partials)) {
  output = output.replace(marker, fs.readFileSync(path.join(app, "partials", fileName), "utf8").trim());
}
if (/@@[a-z-]+@@/.test(output)) throw new Error("A storefront partial was not included");
fs.writeFileSync(path.join(app, "index.html"), output);
console.log("Built apps/demo-storefront/index.html from its template and partials.");
