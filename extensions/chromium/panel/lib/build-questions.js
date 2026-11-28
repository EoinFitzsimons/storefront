"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.GuidedCommerceQuestionBuilder = api;
}(globalThis, function () {
  function buildQuestions(products, pageContext = "") {
    if (!Array.isArray(products) || products.length < 2) return [];
    const fields = [];
    const categoryValues = products.map((product) => product.category || attribute(product, "Offer type") || "");
    const context = String(pageContext).toLowerCase();
    const categoryPrompt = /studio|workshop|class|learn/.test(context)
      ? "The pages describe studio and learning offers. Which kind would suit you?"
      : /gift|present/.test(context)
        ? "The shop mentions gifts as well as products. What would you like to find?"
        : "What kind of offer are you looking for?";
    addField(fields, "category", categoryPrompt, categoryValues, products);

    const attributeNames = [...new Set(products.flatMap((product) => Object.keys(product.attributes || {})))];
    for (const attributeName of attributeNames) {
      if (/^(offer type|brand|name|description|price|availability|stock)$/i.test(attributeName)) continue;
      const values = products.map((product) => attribute(product, attributeName));
      const label = friendlyLabel(attributeName);
      addField(fields, `attribute:${attributeName.toLowerCase()}`, promptFor(attributeName, label), values, products);
    }

    const prices = products.map((product) => product.price).filter((price) => Number.isFinite(price));
    const currencies = [...new Set(products.map((product) => product.currency).filter(Boolean))];
    if (prices.length >= 2 && new Set(prices).size >= 2 && currencies.length <= 1) {
      const sorted = [...prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const currency = currencies[0] || "";
      const options = [
        { label: `Up to ${money(median, currency)}`, value: { max: median } },
        { label: `Over ${money(median, currency)}`, value: { min: median } },
        { label: "Show me any price", value: null }
      ];
      fields.push({ key: "price", title: "What price range feels comfortable?", options });
    }
    const hasOutcome = fields.some((field) => field.key === "attribute:outcome");
    const ordered = fields
      .filter((field) => !(hasOutcome && field.key === "category"))
      .sort((a, b) => priority(a.key) - priority(b.key));
    return ordered.slice(0, 3);
  }

  function addField(fields, key, title, rawValues, products) {
    const groups = new Map();
    rawValues.forEach((value, index) => {
      const normalized = normalize(value);
      if (!normalized) return;
      if (!groups.has(normalized)) groups.set(normalized, { label: String(value).trim(), products: [] });
      groups.get(normalized).products.push(products[index]);
    });
    if (groups.size < 2 || groups.size > 6) return;
    fields.push({
      key,
      title,
      options: [...groups].map(([normalized, group]) => ({ label: group.label, value: normalized }))
    });
  }

  function attribute(product, name) {
    const target = String(name).toLowerCase();
    const entry = Object.entries(product.attributes || {}).find(([key]) => key.toLowerCase() === target);
    return entry?.[1] || "";
  }

  function friendlyLabel(value) {
    return String(value).replace(/[_-]+/g, " ").toLowerCase();
  }

  function promptFor(name, label) {
    const prompts = {
      outcome: "What would be useful to you?",
      purpose: "What are you hoping to do?",
      format: "How would you like to experience it?",
      approach: "Which approach feels comfortable to you?",
      "price band": "What price range feels comfortable?"
    };
    return prompts[String(name).toLowerCase()] || `What matters to you about ${label}?`;
  }

  function priority(key) {
    const order = ["attribute:outcome", "attribute:purpose", "attribute:goal", "attribute:format", "attribute:approach", "attribute:price band", "price", "category"];
    const index = order.indexOf(key);
    return index < 0 ? 20 : index;
  }

  function normalize(value) { return String(value || "").trim().toLowerCase(); }

  function money(value, currency) {
    try {
      if (currency) return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
    } catch {}
    return `${currency ? currency + " " : ""}${value}`;
  }

  return { buildQuestions };
}));
