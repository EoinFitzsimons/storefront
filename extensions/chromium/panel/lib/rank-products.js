"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.GuidedCommerceProductRanker = api;
}(globalThis, function () {
  function rankProducts(products, questions, answers) {
    const ranked = (products || []).map((product) => {
      let score = 0;
      const reasons = [];
      let excluded = false;
      for (const question of questions || []) {
        const answer = answers?.[question.key];
        if (answer === undefined || answer === null || answer === "__any__") continue;
        if (question.key === "category") {
          if (normalize(product.category || attribute(product, "Offer type")) === answer) {
            score += 4;
            reasons.push(`Offer type: ${product.category || attribute(product, "Offer type")}`);
          } else excluded = true;
        } else if (question.key.startsWith("attribute:")) {
          const name = question.key.slice("attribute:".length);
          const match = Object.entries(product.attributes || {}).find(([key]) => key.toLowerCase() === name);
          const values = Array.isArray(match?.[1]) ? match[1] : [match?.[1]];
          if (values.some((value) => normalize(value) === answer)) {
            score += 3;
            reasons.push(`${match[0]}: ${values.find((value) => normalize(value) === answer)}`);
          } else excluded = true;
        } else if (question.key === "price" && typeof answer === "object") {
          if ((answer.max === undefined || product.price <= answer.max) && (answer.min === undefined || product.price > answer.min)) {
            score += 2;
            reasons.push(answer.max === undefined ? `Within ${formatPrice(answer.min, product.currency)}+` : `Up to ${formatPrice(answer.max, product.currency)}`);
          } else excluded = true;
        }
      }
      return { product, score, reasons, excluded };
    }).filter((entry) => !entry.excluded);
    return ranked.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
  }

  function attribute(product, name) {
    const target = String(name).toLowerCase();
    return Object.entries(product.attributes || {}).find(([key]) => key.toLowerCase() === target)?.[1] || "";
  }
  function normalize(value) { return String(value || "").trim().toLowerCase(); }
  function formatPrice(value, currency) {
    try { return currency ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value) : String(value); }
    catch { return String(value); }
  }
  return { rankProducts };
}));
