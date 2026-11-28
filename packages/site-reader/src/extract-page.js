"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.GuidedCommerceSiteReader = api;
}(globalThis, function () {
  function extractCurrentPage() {
    const pageUrl = location.href;
    const page = {
      url: pageUrl,
      origin: location.origin,
      siteName: findSiteName(),
      title: document.title || "Untitled page",
      description: document.querySelector('meta[name="description"]')?.content || "",
      headings: [...document.querySelectorAll("h1,h2,h3")].map((node) => clean(node.innerText)).filter(Boolean).slice(0, 20),
      context: clean(document.body?.innerText || "").slice(0, 7000),
      products: [],
      candidateLinks: [...document.querySelectorAll("a[href]")]
        .map((link) => ({ label: clean(link.innerText || link.getAttribute("aria-label") || link.title), url: link.href }))
        .filter((link) => link.label && isUsefulPageLink(link.label) && sameOrigin(link.url))
        .slice(0, 12)
    };

    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        collectProducts(JSON.parse(script.textContent || "null"), page.products, pageUrl);
      } catch {
        // Invalid structured data is ignored; extraction never executes page scripts.
      }
    }

    for (const node of document.querySelectorAll('[itemscope][itemtype*="Product"], [data-product-card], [data-product]')) {
      const product = fromNode(node, pageUrl);
      if (product) page.products.push(product);
    }
    page.products = deduplicate(page.products);
    return page;

    function collectProducts(value, output, sourceUrl) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        for (const item of value) collectProducts(item, output, sourceUrl);
        return;
      }
      if (types(value).includes("product")) {
        const product = fromStructuredData(value, sourceUrl);
        if (product) output.push(product);
      }
      for (const [key, nested] of Object.entries(value)) {
        if (key === "item" && nested && typeof nested === "object") collectProducts(nested, output, sourceUrl);
        else if (key === "@graph" || key === "itemListElement" || key === "hasOfferCatalog") collectProducts(nested, output, sourceUrl);
      }
    }

    function fromStructuredData(data, sourceUrl) {
      const name = clean(first(data.name));
      if (!name) return null;
      const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
      const properties = {};
      const additional = Array.isArray(data.additionalProperty) ? data.additionalProperty : data.additionalProperty ? [data.additionalProperty] : [];
      for (const property of additional) {
        const key = clean(first(property?.name));
        const value = clean(first(property?.value));
        if (key && value) addProperty(properties, key, value);
      }
      const brand = clean(first(typeof data.brand === "object" ? data.brand.name : data.brand));
      const priceValue = offers ? first(offers.price) : undefined;
      const price = numeric(priceValue);
      return {
        name,
        description: clean(first(data.description)).slice(0, 700),
        category: clean(first(data.category || data.productGroupID || data.productID || "")),
        brand,
        attributes: properties,
        price,
        currency: price === null ? "" : clean(first(offers.priceCurrency)).toUpperCase(),
        availability: offers ? clean(first(offers.availability)).split("/").pop() : "",
        url: safeProductUrl(first(data.url), sourceUrl),
        sourceUrl
      };
    }

    function fromNode(node, sourceUrl) {
      const read = (key) => {
        const item = node.querySelector(`[itemprop="${key}"]`) || (node.matches(`[itemprop="${key}"]`) ? node : null);
        return item?.content || item?.getAttribute("href") || item?.innerText || "";
      };
      let name = clean(read("name"));
      if (!name) name = clean(node.querySelector("h2,h3,h4,[data-product-name]")?.innerText || "");
      if (!name) return null;
      const description = clean(read("description") || node.querySelector("p")?.innerText || "").slice(0, 700);
      const category = clean(read("category") || node.querySelector("[data-category],.product-category")?.innerText || "");
      const url = read("url") || node.querySelector('a[href]')?.href || "";
      const attributes = {};
      for (const property of node.querySelectorAll('[itemprop="additionalProperty"]')) {
        const key = clean(property.querySelector('[itemprop="name"]')?.content || property.querySelector('[itemprop="name"]')?.innerText || "");
        const value = clean(property.querySelector('[itemprop="value"]')?.content || property.querySelector('[itemprop="value"]')?.innerText || "");
        if (key && value) addProperty(attributes, key, value);
      }
      return { name, description, category, brand: "", attributes, price: numeric(read("price")), currency: clean(read("priceCurrency")).toUpperCase(), availability: clean(read("availability")).split("/").pop(), url: safeProductUrl(url, sourceUrl), sourceUrl };
    }

    function deduplicate(products) {
      const output = [];
      const seen = new Set();
      for (const product of products) {
        const key = `${product.name.toLowerCase()}|${product.url || ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        output.push(product);
      }
      return output;
    }

    function findSiteName() {
      const openGraphName = document.querySelector('meta[property="og:site_name"]')?.content;
      if (openGraphName) return clean(openGraphName);
      const visibleName = clean(document.querySelector("header .brand, header [itemprop='name']")?.innerText || "");
      if (visibleName) return visibleName;
      for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const data = JSON.parse(script.textContent || "null");
          const nodes = Array.isArray(data) ? data : [data];
          for (const node of nodes) {
            if (node && typeof node === "object" && (types(node).some((type) => ["organization", "store", "localbusiness", "itemlist"].includes(type))) && node.name) {
              return clean(first(node.name));
            }
          }
        } catch {}
      }
      return "";
    }

    function addProperty(target, key, value) {
      const current = target[key];
      if (current === undefined) target[key] = value;
      else {
        const values = Array.isArray(current) ? current : [current];
        if (!values.includes(value)) values.push(value);
        target[key] = values;
      }
    }

    function safeProductUrl(candidate, fallback) {
      try {
        const url = new URL(candidate || fallback, fallback);
        return url.origin === location.origin ? url.href : "";
      } catch {
        return "";
      }
    }

    function sameOrigin(candidate) {
      try { return new URL(candidate).origin === location.origin; } catch { return false; }
    }

    function isUsefulPageLink(label) {
      return /about|shop|collection|catalog|catalogue|product|offer|service|workshop|experience/i.test(label);
    }

    function types(value) {
      const raw = value["@type"];
      return (Array.isArray(raw) ? raw : raw ? [raw] : []).map((type) => String(type).split("/").pop().toLowerCase());
    }

    function first(value) { return Array.isArray(value) ? value[0] : value; }
    function numeric(value) {
      if (value === undefined || value === null || value === "") return null;
      const result = Number(String(value).replace(/[^\d.\-]/g, ""));
      return Number.isFinite(result) && result >= 0 ? result : null;
    }
    function clean(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  }

  return { extractCurrentPage };
}));
