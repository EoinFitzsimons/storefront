"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.GuidedCommerceQuestionBuilder = api;
}(globalThis, function () {
  const MAX_STARTING_POINTS = 10;
  const MAX_QUESTIONS_PER_PATH = 5;
  const FLEXIBLE_ANSWER = "__any__";

  function buildJourney(products, pageContext = "") {
    const starts = authoredStartingPoints(products);
    const entryPoints = starts.length ? starts : inferredStartingPoints(products, pageContext);
    const limitedStarts = entryPoints.slice(0, MAX_STARTING_POINTS);
    const routes = Object.create(null);
    const questionUsage = new Map();

    for (const start of limitedStarts) {
      const productKeys = new Set(start.productKeys);
      const candidates = products.filter((product) => productKeys.has(productKey(product)));
      routes[start.id] = {
        candidateKeys: [...productKeys],
        questions: buildQuestions(candidates, `${pageContext} ${start.label}`)
      };
      for (const question of routes[start.id].questions) {
        questionUsage.set(question.key, (questionUsage.get(question.key) || 0) + 1);
      }
    }

    return {
      title: "What brings you here today?",
      intro: "Choose the reason that feels closest. Different paths can lead to the same useful next question.",
      starts: limitedStarts.map(({ productKeys: _productKeys, ...start }) => start),
      sharedQuestionKeys: [...questionUsage].filter(([, count]) => count > 1).map(([key]) => key),
      routes
    };
  }

  function buildQuestions(products, pageContext = "") {
    if (!Array.isArray(products) || products.length < 2) return [];
    const fields = [];
    const categoryValues = products.map((product) => product.category || attribute(product, "Offer type") || "");
    const context = String(pageContext).toLowerCase();
    const categoryPrompt = /studio|workshop|class|learn|clay|pottery/.test(context)
      ? "Which direction feels closer to what you have in mind?"
      : /gift|present/.test(context)
        ? "How would you like the gift to work?"
        : "Which kind of outcome are you leaning toward?";
    addField(fields, "category", categoryPrompt, categoryValues, products);

    const attributeNames = [...new Set(products.flatMap((product) => Object.keys(product.attributes || {})))];
    for (const name of attributeNames) {
      if (/^(starting point|brand|name|description|price|availability|stock)$/i.test(name)) continue;
      const values = products.map((product) => attribute(product, name));
      addField(fields, `attribute:${name.toLowerCase()}`, promptFor(name), values, products);
    }

    const prices = products.map((product) => product.price).filter((price) => Number.isFinite(price));
    const currencies = [...new Set(products.map((product) => product.currency).filter(Boolean))];
    if (prices.length >= 2 && new Set(prices).size >= 2 && currencies.length <= 1) {
      const sorted = [...prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const currency = currencies[0] || "";
      fields.push(withFlexibleOption({
        key: "price",
        title: "What price range should we keep in mind?",
        options: [
          { label: `Up to ${money(median, currency)}`, value: { max: median } },
          { label: `Over ${money(median, currency)}`, value: { min: median } }
        ]
      }));
    }

    const hasOutcome = fields.some((field) => field.key === "attribute:outcome");
    return fields
      .filter((field) => !(hasOutcome && field.key === "category"))
      .sort((a, b) => priority(a.key) - priority(b.key))
      .slice(0, MAX_QUESTIONS_PER_PATH);
  }

  function authoredStartingPoints(products) {
    const grouped = new Map();
    for (const product of products || []) {
      const values = product.startingPoints || attribute(product, "Starting point");
      for (const value of asArray(values)) {
        const label = String(value || "").trim();
        const normalized = normalize(label);
        if (!normalized) continue;
        if (!grouped.has(normalized)) grouped.set(normalized, { id: slug(normalized), label, productKeys: new Set() });
        grouped.get(normalized).productKeys.add(productKey(product));
      }
    }
    return [...grouped.values()].map((entry) => ({ ...entry, productKeys: [...entry.productKeys] }));
  }

  function inferredStartingPoints(products, pageContext) {
    const templates = [
      { id: "make-learn", label: "I want to make or learn something", terms: ["make", "learn", "workshop", "class", "course", "skill", "craft", "studio"] },
      { id: "shared-experience", label: "I want an experience to share", terms: ["together", "friend", "group", "couple", "workshop", "session", "class", "experience"] },
      { id: "gift", label: "I’m choosing a gift for someone", terms: ["gift", "present", "voucher", "gift card"] },
      { id: "home", label: "I’m looking for something for my home", terms: ["home", "room", "decor", "furniture", "vase", "planter", "ceramic", "pottery"] },
      { id: "rest-perspective", label: "I want a pause or a new perspective", terms: ["rest", "calm", "relax", "reflection", "perspective", "wellbeing", "tarot", "astrology"] },
      { id: "ready-to-use", label: "I want something ready to use", terms: ["ready-made", "everyday", "use", "mug", "bowl", "tool", "kit"] }
    ];
    const allKeys = (products || []).map(productKey);
    const starts = [];
    for (const template of templates) {
      const matches = (products || []).filter((product) => {
        const text = productEvidence(product);
        return template.terms.some((term) => containsTerm(text, term));
      });
      if (matches.length) starts.push({ ...template, productKeys: matches.map(productKey) });
    }
    starts.push({ id: "specific", label: "I have a direction, but need help choosing the right option", productKeys: allKeys });
    starts.push({ id: "explore", label: "I’m exploring and could use a good place to start", productKeys: allKeys });
    starts.push({ id: "not-sure", label: "I’m not sure yet", productKeys: allKeys });
    return starts.slice(0, MAX_STARTING_POINTS);
  }

  function addField(fields, key, title, rawValues, products) {
    const groups = new Map();
    const productKeysByValue = new Map();
    rawValues.forEach((rawValue, index) => {
      for (const raw of asArray(rawValue)) {
        const normalized = normalize(raw);
        if (!normalized) continue;
        if (!groups.has(normalized)) groups.set(normalized, String(raw).trim());
        if (!productKeysByValue.has(normalized)) productKeysByValue.set(normalized, new Set());
        productKeysByValue.get(normalized).add(productKey(products[index]));
      }
    });
    if (groups.size < 2 || groups.size > 7) return;
    const distinctProducts = new Set([...productKeysByValue.values()].flatMap((keys) => [...keys]));
    if (distinctProducts.size < 2) return;
    fields.push(withFlexibleOption({
      key,
      title,
      options: [...groups].map(([value, label]) => ({ label, value }))
    }));
  }

  function withFlexibleOption(question) {
    return { ...question, options: [...question.options, { label: "I’m open to any of these", value: FLEXIBLE_ANSWER }] };
  }

  function attribute(product, name) {
    const target = String(name).toLowerCase();
    const entry = Object.entries(product.attributes || {}).find(([key]) => key.toLowerCase() === target);
    return entry?.[1] || "";
  }

  function promptFor(name) {
    const prompts = {
      outcome: "What would you like to get out of it?",
      purpose: "What are you hoping to do?",
      format: "How would you prefer to experience it?",
      approach: "Which approach feels comfortable to you?",
      "price band": "What price range feels right?",
      "making style": "How would you like to work with clay?",
      use: "What would you like the piece to do?",
      "piece type": "What kind of piece are you looking for?",
      "gift approach": "How would you like the gift to feel?",
      "experience type": "What kind of experience sounds right?",
      pace: "How would you like the time to feel?",
      company: "Who will you enjoy this with?"
    };
    return prompts[String(name).toLowerCase()] || `What matters most about ${String(name).toLowerCase()}?`;
  }

  function priority(key) {
    const order = ["attribute:outcome", "attribute:purpose", "attribute:making style", "attribute:use", "attribute:piece type", "attribute:gift approach", "attribute:experience type", "attribute:company", "attribute:pace", "attribute:format", "attribute:approach", "attribute:price band", "price", "category"];
    const index = order.indexOf(key);
    return index < 0 ? 20 : index;
  }

  function productEvidence(product) {
    const attributes = Object.values(product.attributes || {}).flatMap(asArray).join(" ");
    return normalize([product.name, product.description, product.category, product.brand, attributes].join(" "));
  }

  function containsTerm(text, term) {
    const escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped.replace(/\s+/g, "\\s+")}([^a-z0-9]|$)`, "i").test(text);
  }

  function productKey(product) { return `${normalize(product.name)}|${product.url || product.sourceUrl || product.id || ""}`; }
  function asArray(value) { return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]; }
  function slug(value) { return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function normalize(value) { return String(value || "").trim().toLowerCase(); }

  function money(value, currency) {
    try {
      if (currency) return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
    } catch {}
    return `${currency ? currency + " " : ""}${value}`;
  }

  return { buildJourney, buildQuestions, FLEXIBLE_ANSWER };
}));
