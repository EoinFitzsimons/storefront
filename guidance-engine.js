(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  root.GuidanceEngine = engine;
}(globalThis, function () {
  "use strict";

  const RESULT = "results";
  const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
  const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

  function assert(condition, message) {
    if (!condition) throw new Error(`Invalid tenant configuration: ${message}`);
  }

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function validateProducts(products, path = "catalog.products") {
    assert(Array.isArray(products), `${path} must be an array`);
    const ids = new Set();
    products.forEach((product, index) => {
      const itemPath = `${path}[${index}]`;
      assert(isRecord(product), `${itemPath} must be an object`);
      assert(typeof product.id === "string" && ID_PATTERN.test(product.id), `${itemPath}.id is invalid`);
      assert(!ids.has(product.id), `${itemPath}.id must be unique`);
      ids.add(product.id);
      ["name", "description", "planTitle"].forEach((key) => {
        assert(typeof product[key] === "string" && product[key].trim(), `${itemPath}.${key} is required`);
      });
      assert(Array.isArray(product.plan) && product.plan.every((step) => typeof step === "string" && step.trim()), `${itemPath}.plan must contain text steps`);
      ["tags", "capabilities"].forEach((key) => {
        assert(Array.isArray(product[key]) && product[key].every((value) => typeof value === "string"), `${itemPath}.${key} must be a string array`);
      });
      assert(product.tags.every((tag) => /^[a-z][a-z0-9_-]*:[a-z0-9_-]+$/.test(tag)), `${itemPath}.tags must be namespaced strings`);
      if (product.checkoutUrl !== undefined) {
        let url;
        try {
          url = new URL(product.checkoutUrl);
        } catch {
          throw new Error(`Invalid tenant configuration: ${itemPath}.checkoutUrl must be an absolute URL`);
        }
        assert(["http:", "https:"].includes(url.protocol), `${itemPath}.checkoutUrl must use HTTP or HTTPS`);
      }
    });
  }

  function validateConfiguration(config) {
    assert(isRecord(config), "document must be an object");
    assert(config.schemaVersion === 1, "schemaVersion must be 1");
    assert(typeof config.revision === "string" && VERSION_PATTERN.test(config.revision), "revision must be a semantic version");
    assert(isRecord(config.tenant) && typeof config.tenant.id === "string" && ID_PATTERN.test(config.tenant.id), "tenant.id is invalid");
    assert(typeof config.tenant.name === "string" && config.tenant.name.trim(), "tenant.name is required");
    assert(isRecord(config.content), "content is required");
    ["pageTitle", "heroHeading", "heroIntro", "beginLabel", "journeyTitle", "journeyIntro", "privacyNote", "resultNote", "recommendationTitle", "recommendationMessage", "noMatchTitle", "noMatchMessage"].forEach((key) => {
      assert(typeof config.content[key] === "string" && config.content[key].trim(), `content.${key} is required`);
    });
    if (config.theme !== undefined) {
      assert(isRecord(config.theme), "theme must be an object");
      ["primary", "accent"].forEach((key) => {
        if (config.theme[key] !== undefined) assert(/^#[0-9a-fA-F]{6}$/.test(config.theme[key]), `theme.${key} must be a hex color`);
      });
    }
    assert(Array.isArray(config.questions) && config.questions.length > 0, "questions must be a non-empty array");

    const questionIds = new Set();
    const questionsById = new Map();
    config.questions.forEach((question, index) => {
      const path = `questions[${index}]`;
      assert(isRecord(question) && typeof question.id === "string" && ID_PATTERN.test(question.id), `${path}.id is invalid`);
      assert(!questionIds.has(question.id), `${path}.id must be unique`);
      questionIds.add(question.id);
      questionsById.set(question.id, question);
      assert(typeof question.title === "string" && question.title.trim(), `${path}.title is required`);
      assert(typeof question.required === "boolean", `${path}.required must be boolean`);
      assert(Array.isArray(question.options) && question.options.length > 0, `${path}.options must be non-empty`);
      const optionIds = new Set();
      question.options.forEach((option, optionIndex) => {
        const optionPath = `${path}.options[${optionIndex}]`;
        assert(isRecord(option) && typeof option.id === "string" && ID_PATTERN.test(option.id), `${optionPath}.id is invalid`);
        assert(!optionIds.has(option.id), `${optionPath}.id must be unique`);
        optionIds.add(option.id);
        assert(typeof option.label === "string" && option.label.trim(), `${optionPath}.label is required`);
        assert(Array.isArray(option.tags) && option.tags.every((tag) => typeof tag === "string" && /^[a-z][a-z0-9_-]*:[a-z0-9_-]+$/.test(tag)), `${optionPath}.tags must be namespaced strings`);
      });
    });

    assert(isRecord(config.routing) && isRecord(config.routing.defaultNext) && Array.isArray(config.routing.rules), "routing.defaultNext and routing.rules are required");
    config.questions.forEach((question) => {
      const next = config.routing.defaultNext[question.id];
      assert(next === RESULT || questionIds.has(next), `routing.defaultNext.${question.id} points to an unknown question`);
    });
    Object.keys(config.routing.defaultNext).forEach((id) => assert(questionIds.has(id), `routing.defaultNext contains unknown question ${id}`));
    const routeKeys = new Set();
    config.routing.rules.forEach((rule, index) => {
      assert(isRecord(rule) && isRecord(rule.when), `routing.rules[${index}].when is required`);
      const question = questionsById.get(rule.when.questionId);
      assert(question, `routing.rules[${index}] references an unknown question`);
      assert(question.options.some((option) => option.id === rule.when.answerId), `routing.rules[${index}] references an unknown answer`);
      assert(rule.next === RESULT || questionIds.has(rule.next), `routing.rules[${index}].next is invalid`);
      const key = `${rule.when.questionId}:${rule.when.answerId}`;
      assert(!routeKeys.has(key), `routing.rules contains duplicate condition ${key}`);
      routeKeys.add(key);
    });
    const routeEdges = new Map(config.questions.map((question) => [
      question.id,
      [config.routing.defaultNext[question.id], ...config.routing.rules
        .filter((rule) => rule.when.questionId === question.id)
        .map((rule) => rule.next)]
        .filter((next) => next !== RESULT)
    ]));
    const routeState = new Map();
    function visitRoute(questionId) {
      assert(routeState.get(questionId) !== 1, `routing contains a cycle involving ${questionId}`);
      if (routeState.get(questionId) === 2) return;
      routeState.set(questionId, 1);
      routeEdges.get(questionId).forEach(visitRoute);
      routeState.set(questionId, 2);
    }
    config.questions.forEach((question) => visitRoute(question.id));
    const reachable = new Set();
    const pending = [config.questions[0].id];
    while (pending.length) {
      const questionId = pending.pop();
      if (reachable.has(questionId)) continue;
      reachable.add(questionId);
      pending.push(...routeEdges.get(questionId));
    }
    config.questions.forEach((question) => assert(reachable.has(question.id), `question ${question.id} is unreachable from the start`));

    assert(isRecord(config.policies) && isRecord(config.policies.scoring), "policies.scoring is required");
    assert(Number.isInteger(config.policies.scoring.limit) && config.policies.scoring.limit > 0, "policies.scoring.limit must be a positive integer");
    assert(isRecord(config.policies.scoring.weights), "policies.scoring.weights is required");
    Object.entries(config.policies.scoring.weights).forEach(([dimension, weight]) => {
      assert(/^[a-z][a-z0-9_-]*$/.test(dimension) && Number.isFinite(weight) && weight > 0, `scoring weight for ${dimension} must be positive`);
    });
    assert(Array.isArray(config.policies.blockedAnswers) && Array.isArray(config.policies.exclusions), "policies.blockedAnswers and exclusions are required");
    config.policies.blockedAnswers.forEach((rule, index) => {
      const question = questionsById.get(rule.questionId);
      assert(question && question.options.some((option) => option.id === rule.answerId), `blockedAnswers[${index}] references an unknown answer`);
      assert(typeof rule.title === "string" && typeof rule.message === "string", `blockedAnswers[${index}] needs result copy`);
    });
    config.policies.exclusions.forEach((rule, index) => {
      const question = questionsById.get(rule.questionId);
      assert(question && question.options.some((option) => option.id === rule.answerId), `exclusions[${index}] references an unknown answer`);
      assert(Array.isArray(rule.capabilities) && rule.capabilities.every((value) => typeof value === "string"), `exclusions[${index}].capabilities must be a string array`);
    });

    assert(isRecord(config.catalog) && isRecord(config.catalog.provider), "catalog.provider is required");
    if (config.catalog.provider.type === "embedded") {
      validateProducts(config.catalog.products);
    } else if (config.catalog.provider.type === "http") {
      let url;
      try {
        url = new URL(config.catalog.provider.url);
      } catch {
        throw new Error("Invalid tenant configuration: catalog.provider.url must be an absolute URL");
      }
      assert(["http:", "https:"].includes(url.protocol), "catalog.provider.url must use HTTP or HTTPS");
      assert(!Object.hasOwn(config.catalog, "products"), "HTTP catalogs must not include embedded products");
    } else {
      throw new Error("Invalid tenant configuration: catalog.provider.type must be embedded or http");
    }

    return config;
  }

  function questionFor(config, questionId) {
    const question = config.questions.find((item) => item.id === questionId);
    if (!question) throw new Error(`Unknown question: ${questionId}`);
    return question;
  }

  function getNextQuestionId(config, questionId, answers) {
    questionFor(config, questionId);
    const answerId = answers[questionId];
    const matchingRule = config.routing.rules.find((rule) => rule.when.questionId === questionId && rule.when.answerId === answerId);
    return matchingRule ? matchingRule.next : config.routing.defaultNext[questionId];
  }

  function getJourneyPath(config, answers) {
    const path = [];
    let questionId = config.questions[0].id;
    while (questionId !== RESULT) {
      if (path.includes(questionId)) throw new Error(`Routing cycle detected at question: ${questionId}`);
      path.push(questionId);
      questionId = getNextQuestionId(config, questionId, answers);
      if (path.length > config.questions.length) throw new Error("Journey exceeded the configured question count");
    }
    return path;
  }

  function evaluate(config, answers, products = config.catalog.products) {
    const path = getJourneyPath(config, answers);
    const activeAnswers = Object.fromEntries(path.filter((id) => answers[id] !== undefined).map((id) => [id, answers[id]]));
    const blocked = config.policies.blockedAnswers.find((rule) => activeAnswers[rule.questionId] === rule.answerId);
    if (blocked) return { status: "blocked", title: blocked.title, message: blocked.message, recommendations: [] };

    const exclusions = config.policies.exclusions
      .filter((rule) => activeAnswers[rule.questionId] === rule.answerId)
      .flatMap((rule) => rule.capabilities);
    const selectedTags = [];
    for (const [questionId, answerId] of Object.entries(activeAnswers)) {
      const question = questionFor(config, questionId);
      const option = question.options.find((item) => item.id === answerId);
      if (!option) throw new Error(`Unknown answer ${answerId} for question ${questionId}`);
      selectedTags.push({ questionId, answerId, label: option.label, tags: option.tags });
    }
    const dimensions = [...new Set(selectedTags.flatMap((answer) => answer.tags.map((tag) => tag.split(":")[0])))];
    const weights = config.policies.scoring.weights;
    const denominator = dimensions.reduce((sum, dimension) => sum + (weights[dimension] || 0), 0);
    const eligible = products.filter((product) => !product.capabilities.some((capability) => exclusions.includes(capability)));
    const recommendations = eligible.map((product) => {
      const matchedDimensions = dimensions.filter((dimension) =>
        selectedTags.some((answer) =>
          answer.tags.some((tag) => tag.startsWith(`${dimension}:`) && product.tags.includes(tag))
        )
      );
      const reasons = selectedTags.filter((answer) => answer.tags.some((tag) => product.tags.includes(tag)));
      const score = denominator ? matchedDimensions.reduce((sum, dimension) => sum + (weights[dimension] || 0), 0) / denominator : null;
      return { ...product, score, matchedDimensions, reasons: reasons.map(({ questionId, label }) => ({ questionId, label })) };
    }).filter((product) => product.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, config.policies.scoring.limit);

    return recommendations.length
      ? { status: "recommended", title: config.content.recommendationTitle, message: config.content.recommendationMessage, recommendations }
      : { status: "no_match", title: config.content.noMatchTitle, message: config.content.noMatchMessage, recommendations: [] };
  }

  return {
    RESULT,
    validateConfiguration,
    validateProducts,
    getNextQuestionId,
    getJourneyPath,
    evaluate
  };
}));
