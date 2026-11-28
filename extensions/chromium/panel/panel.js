"use strict";

(function () {
  const reader = window.GuidedCommerceSiteReader;
  const journeyBuilder = window.GuidedCommerceQuestionBuilder;
  const ranker = window.GuidedCommerceProductRanker;
  const session = {
    origin: "",
    siteName: "",
    siteKey: "",
    pages: [],
    products: [],
    questionsContext: "",
    journey: null,
    activeStartId: "",
    answers: Object.create(null),
    questionIndex: 0
  };

  const analyzeButton = document.querySelector("#analyze-button");
  const status = document.querySelector("#status");
  const pageList = document.querySelector("#page-list");
  const questionArea = document.querySelector("#question-area");
  const resultsArea = document.querySelector("#results-area");
  const guideSection = document.querySelector("#guide-section");

  analyzeButton.addEventListener("click", analyzeCurrentPage);
  document.querySelector("#reset-button").addEventListener("click", returnToStartingPoints);
  document.querySelector("#clear-shop-button").addEventListener("click", clearShop);
  updateCurrentTabLabel();

  async function analyzeCurrentPage() {
    analyzeButton.disabled = true;
    status.dataset.error = "false";
    setStatus("Reading the current page you chose…");
    let switchedShop = "";
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) throw new Error("No active browser tab was found. Open the shop in a tab and try again.");
      const [originResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => location.origin
      });
      const pageOrigin = originResult?.result;
      if (!pageOrigin) throw new Error("The current tab did not provide a page address. Try a regular shop page.");
      if (session.origin && pageOrigin !== session.origin) {
        throw new Error("This guide is for one shop at a time. Choose Clear shop before adding pages from another website.");
      }

      const [extracted] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: reader.extractCurrentPage
      });
      const page = extracted?.result;
      if (!page) throw new Error("The current page did not return readable details.");
      if (page.origin !== pageOrigin) throw new Error("The page changed while it was being analyzed. Try again.");

      const pageSiteKey = siteKey(page.siteName) || siteKey(pageOrigin);
      if (session.siteKey && pageSiteKey !== session.siteKey) {
        switchedShop = page.siteName || "a different shop";
        clearSessionData();
      }
      if (!session.origin) session.origin = pageOrigin;
      if (!session.siteKey) {
        session.siteName = page.siteName || new URL(page.url).hostname;
        session.siteKey = pageSiteKey;
      }

      mergePage(page);
      session.journey = journeyBuilder.buildJourney(session.products, session.questionsContext);
      session.activeStartId = "";
      session.answers = Object.create(null);
      session.questionIndex = 0;
      guideSection.hidden = false;
      renderPages();
      renderGuide();
      const offerCount = session.products.length;
      const siteLabel = session.siteName ? ` for ${session.siteName}` : "";
      setStatus(switchedShop
        ? `Started a separate guide for ${switchedShop}. The previous shop’s products were cleared.`
        : `Found ${offerCount} offer${offerCount === 1 ? "" : "s"}${siteLabel}. Add another page from this shop, or choose a starting point.`);
      analyzeButton.textContent = "Add this page to the guide";
    } catch (error) {
      status.dataset.error = "true";
      setStatus(error.message || "This tab could not be read. Try a regular shop page.");
    } finally {
      analyzeButton.disabled = false;
      await updateCurrentTabLabel();
    }
  }

  function mergePage(page) {
    const existingIndex = session.pages.findIndex((item) => item.url === page.url);
    const entry = {
      url: page.url,
      title: page.title,
      siteName: page.siteName,
      description: page.description,
      headings: page.headings,
      context: page.context,
      productCount: page.products.length
    };
    if (existingIndex >= 0) session.pages[existingIndex] = entry;
    else session.pages.push(entry);

    const byKey = new Map(session.products.map((product) => [productKey(product), product]));
    for (const product of page.products) byKey.set(productKey(product), product);
    session.products = [...byKey.values()];
    session.questionsContext = session.pages
      .map((item) => [item.siteName, item.description, ...(item.headings || []), item.context].join(" "))
      .join(" ")
      .slice(0, 18000);
  }

  function renderPages() {
    document.querySelector("#page-count").textContent = String(session.pages.length);
    document.querySelector("#clear-shop-button").hidden = session.pages.length === 0;
    pageList.replaceChildren();
    for (const page of session.pages) {
      const item = document.createElement("li");
      item.className = "page-item";
      const title = document.createElement("strong");
      title.textContent = page.title;
      const detail = document.createElement("span");
      detail.textContent = `${page.productCount} offers found · ${new URL(page.url).pathname}`;
      item.append(title, detail);
      pageList.append(item);
    }
    pageList.hidden = session.pages.length === 0;
  }

  function renderGuide() {
    const guideTitle = document.querySelector("#guide-title");
    const guideContext = document.querySelector("#guide-context");
    const resetButton = document.querySelector("#reset-button");
    questionArea.replaceChildren();
    resultsArea.replaceChildren();
    resetButton.hidden = !session.activeStartId;
    if (!session.pages.length) {
      guideTitle.textContent = "Your guide";
      guideContext.textContent = "Analyze a shop page to see several ways into the catalogue.";
      return;
    }
    if (!session.products.length) {
      guideTitle.textContent = "Pages reviewed";
      guideContext.textContent = "I found this shop’s description, but no product offers yet.";
      appendMessage(questionArea, "Open a collection or product page on this same shop, then choose “Add this page to the guide”. Pages are never followed automatically.");
      return;
    }
    if (!session.journey?.starts?.length) {
      guideTitle.textContent = "Not enough detail to guide you yet";
      guideContext.textContent = "The pages reviewed do not expose enough distinct offer information to build useful routes.";
      return;
    }

    const selectedStart = session.journey.starts.find((start) => start.id === session.activeStartId);
    if (!selectedStart) {
      guideTitle.textContent = "Choose a starting point";
      guideContext.textContent = `${session.siteName || "This shop"} has ${session.products.length} offers and ${session.journey.starts.length} ways to start. The paths share useful questions where they overlap.`;
      renderStartingPoints();
      return;
    }

    guideTitle.textContent = "Follow your path";
    guideContext.textContent = `Starting from: ${selectedStart.label}`;
    const route = session.journey.routes[selectedStart.id];
    if (!route || !route.questions.length || session.questionIndex >= route.questions.length) {
      renderResults(selectedStart, route);
      return;
    }
    renderQuestion(selectedStart, route, route.questions[session.questionIndex]);
  }

  function renderStartingPoints() {
    const heading = document.createElement("h3");
    heading.className = "start-heading";
    heading.textContent = session.journey.title;
    const intro = document.createElement("p");
    intro.className = "start-intro";
    intro.textContent = session.journey.intro;
    const list = document.createElement("div");
    list.className = "starting-points";
    session.journey.starts.forEach((start, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "starting-point";
      const number = document.createElement("span");
      number.className = "start-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const label = document.createElement("span");
      label.className = "start-label";
      label.textContent = start.label;
      const arrow = document.createElement("span");
      arrow.className = "start-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "→";
      button.append(number, label, arrow);
      button.addEventListener("click", () => chooseStartingPoint(start.id));
      list.append(button);
    });
    questionArea.append(heading, intro, list);
  }

  function chooseStartingPoint(startId) {
    session.activeStartId = startId;
    session.answers = Object.create(null);
    session.questionIndex = 0;
    renderGuide();
  }

  function returnToStartingPoints() {
    session.activeStartId = "";
    session.answers = Object.create(null);
    session.questionIndex = 0;
    renderGuide();
  }

  function renderQuestion(start, route, question) {
    const step = document.createElement("p");
    step.className = "question-counter";
    step.textContent = "A helpful detail to narrow this path";
    const card = document.createElement("div");
    card.className = "question-card";
    const title = document.createElement("h3");
    title.textContent = question.title;
    const choices = document.createElement("div");
    choices.className = "answer-list";
    const selected = session.answers[question.key];

    for (const option of question.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-choice";
      button.textContent = option.label;
      button.setAttribute("aria-pressed", String(sameValue(selected, option.value)));
      button.addEventListener("click", () => {
        session.answers[question.key] = option.value;
        for (const choice of choices.children) choice.setAttribute("aria-pressed", String(choice === button));
        next.disabled = false;
      });
      choices.append(button);
    }

    const controls = document.createElement("div");
    controls.className = "question-controls";
    const back = document.createElement("button");
    back.type = "button";
    back.textContent = session.questionIndex === 0 ? "Change start" : "Back";
    back.addEventListener("click", () => {
      if (session.questionIndex === 0) returnToStartingPoints();
      else {
        session.questionIndex -= 1;
        renderGuide();
      }
    });
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Continue";
    next.disabled = selected === undefined;
    next.addEventListener("click", () => advancePath(start, route));
    controls.append(back, next);
    card.append(step, title, choices, controls);
    questionArea.append(card);
  }

  function advancePath(start, route) {
    const questionsBeforeNext = route.questions.slice(0, session.questionIndex + 1);
    const currentCandidates = ranker.rankProducts(routeProducts(route), questionsBeforeNext, session.answers)
      .map((entry) => entry.product);
    for (const later of route.questions.slice(session.questionIndex + 1)) {
      if (questionStillMatters(later, currentCandidates)) {
        session.questionIndex = route.questions.indexOf(later);
        renderGuide();
        return;
      }
    }
    session.questionIndex = route.questions.length;
    renderResults(start, route);
  }

  function questionStillMatters(question, products) {
    if (products.length < 2) return false;
    if (question.key.startsWith("attribute:")) {
      const name = question.key.slice("attribute:".length);
      const values = new Set(products.flatMap((product) => asArray(attribute(product, name))).map(normalize).filter(Boolean));
      return values.size > 1;
    }
    if (question.key === "category") {
      const values = new Set(products.map((product) => normalize(product.category || attribute(product, "Offer type"))).filter(Boolean));
      return values.size > 1;
    }
    if (question.key === "price") return new Set(products.map((product) => product.price).filter(Number.isFinite)).size > 1;
    return false;
  }

  function renderResults(start, route) {
    const title = document.createElement("h3");
    title.className = "results-title";
    title.textContent = "A useful place to start";
    const lead = document.createElement("p");
    lead.className = "result-lead";
    lead.textContent = `You started with “${start.label}”. These offers are the closest matches from the pages you chose.`;
    resultsArea.append(title, lead);
    const ranked = ranker.rankProducts(routeProducts(route), route.questions, session.answers);
    if (!ranked.length) {
      appendMessage(resultsArea, "Those answers do not fit the offers on these pages. Choose another starting point or add another page from this shop.");
      return;
    }
    for (const result of ranked.slice(0, 4)) {
      const card = document.createElement("article");
      card.className = "result-card";
      const category = document.createElement("p");
      category.className = "result-type";
      category.textContent = result.product.category || result.product.attributes?.["Offer type"] || "Offer found on this shop";
      const name = document.createElement("h3");
      name.textContent = result.product.name;
      const description = document.createElement("p");
      description.textContent = result.product.description || "The page did not include a description.";
      const unknown = document.createElement("p");
      unknown.className = "unknown-facts";
      unknown.textContent = `${result.product.price === null ? "Price not shown" : formatPrice(result.product.price, result.product.currency)} · ${result.product.availability || "Availability not verified"}`;
      card.append(category, name, description, unknown);
      if (result.reasons.length) {
        const reasons = document.createElement("p");
        reasons.className = "reason";
        reasons.textContent = `Why it fits this path: ${result.reasons.join(" · ")}`;
        card.append(reasons);
      }
      if (result.product.url && isSameOrigin(result.product.url)) {
        const link = document.createElement("a");
        link.className = "merchant-link";
        link.href = result.product.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View offer on the shop site ↗";
        card.append(link);
      }
      resultsArea.append(card);
    }
  }

  function routeProducts(route) {
    const keys = new Set(route.candidateKeys);
    return session.products.filter((product) => keys.has(productKey(product)));
  }

  function clearShop() {
    clearSessionData();
    renderPages();
    guideSection.hidden = true;
    analyzeButton.textContent = "Analyze this page";
    setStatus("Reviewed pages and offers cleared. Analyze the current shop page to begin again.");
  }

  function clearSessionData() {
    session.origin = "";
    session.siteName = "";
    session.siteKey = "";
    session.pages = [];
    session.products = [];
    session.questionsContext = "";
    session.journey = null;
    session.activeStartId = "";
    session.answers = Object.create(null);
    session.questionIndex = 0;
  }

  async function updateCurrentTabLabel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const label = document.querySelector("#current-tab");
      label.textContent = tab?.title ? `Current tab: ${tab.title}` : "Ready to inspect the current tab.";
    } catch {}
  }

  function appendMessage(parent, message) {
    const empty = document.createElement("p");
    empty.className = "empty-guide";
    empty.textContent = message;
    parent.append(empty);
  }

  function productKey(product) { return `${normalize(product.name)}|${product.url || product.sourceUrl || product.id || ""}`; }
  function siteKey(name) { return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
  function sameValue(left, right) {
    if (left === right) return true;
    if (left === undefined || right === undefined) return false;
    try { return JSON.stringify(left) === JSON.stringify(right); } catch { return false; }
  }
  function asArray(value) { return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]; }
  function normalize(value) { return String(value || "").trim().toLowerCase(); }
  function attribute(product, name) {
    const target = String(name).toLowerCase();
    return Object.entries(product.attributes || {}).find(([key]) => key.toLowerCase() === target)?.[1] || "";
  }
  function isSameOrigin(candidate) {
    try { return new URL(candidate).origin === session.origin; } catch { return false; }
  }
  function formatPrice(value, currency) {
    try { return currency ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value) : String(value); }
    catch { return String(value); }
  }
  function setStatus(message) { status.textContent = message; }
}());
