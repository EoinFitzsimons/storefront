"use strict";

(function () {
  const reader = window.GuidedCommerceSiteReader;
  const questionBuilder = window.GuidedCommerceQuestionBuilder;
  const ranker = window.GuidedCommerceProductRanker;
  const session = { origin: "", pages: [], products: [], questions: [], answers: Object.create(null), context: "" };
  let questionIndex = 0;

  const analyzeButton = document.querySelector("#analyze-button");
  const status = document.querySelector("#status");
  const pageList = document.querySelector("#page-list");
  const questionArea = document.querySelector("#question-area");
  const resultsArea = document.querySelector("#results-area");

  analyzeButton.addEventListener("click", analyzeCurrentPage);
  document.querySelector("#reset-button").addEventListener("click", () => {
    session.answers = Object.create(null);
    questionIndex = 0;
    renderGuide();
  });
  updateCurrentTabLabel();

  async function analyzeCurrentPage() {
    analyzeButton.disabled = true;
    status.dataset.error = "false";
    setStatus("Reading the current tab…");
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) throw new Error("No active browser tab was found. Open a shop page and try again.");
      const [originResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => location.origin
      });
      const pageOrigin = originResult?.result;
      if (!pageOrigin) throw new Error("The current tab did not provide a page address. Try a regular shop page.");
      if (session.origin && pageOrigin !== session.origin) {
        throw new Error("This guide already contains pages from another shop. Start over to inspect a different site.");
      }
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: reader.extractCurrentPage
      });
      if (!result?.result) throw new Error("The current page did not return readable details.");
      if (result.result.origin !== pageOrigin) throw new Error("The page changed while it was being analyzed. Try again.");
      if (!session.origin) session.origin = result.result.origin;
      mergePage(result.result);
      session.questions = questionBuilder.buildQuestions(session.products, session.context);
      session.answers = Object.create(null);
      questionIndex = 0;
      document.querySelector("#guide-section").hidden = false;
      renderPages();
      renderGuide();
      const count = session.products.length;
      setStatus(count ? `Found ${count} offer${count === 1 ? "" : "s"}. Review another page or start the guide.` : "No product details found yet. Try a shop, collection or product page.");
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
      description: page.description,
      headings: page.headings,
      candidateLinks: page.candidateLinks,
      productCount: page.products.length
    };
    if (existingIndex >= 0) session.pages[existingIndex] = entry;
    else session.pages.push(entry);
    const allContext = [page.title, page.description, ...(page.headings || []), page.context].join(" ").slice(0, 18000);
    session.context = `${session.context} ${allContext}`.slice(0, 18000);

    const byKey = new Map(session.products.map((product) => [productKey(product), product]));
    for (const product of page.products) byKey.set(productKey(product), product);
    session.products = [...byKey.values()];
  }

  function renderPages() {
    document.querySelector("#page-count").textContent = String(session.pages.length);
    pageList.replaceChildren();
    for (const page of session.pages) {
      const item = document.createElement("li");
      item.className = "page-item";
      const title = document.createElement("strong");
      title.textContent = page.title;
      const detail = document.createElement("span");
      detail.textContent = `${page.productCount} product${page.productCount === 1 ? "" : "s"} found · ${new URL(page.url).pathname}`;
      item.append(title, detail);
      pageList.append(item);
    }
    pageList.hidden = session.pages.length === 0;
  }

  function renderGuide() {
    const guideContext = document.querySelector("#guide-context");
    questionArea.replaceChildren();
    resultsArea.replaceChildren();
    if (!session.pages.length) {
      guideContext.textContent = "Analyze a page to begin.";
      return;
    }
    guideContext.textContent = session.products.length
      ? `Using ${session.products.length} product${session.products.length === 1 ? "" : "s"} from ${session.pages.length} page${session.pages.length === 1 ? "" : "s"}. Questions are based on the differences the shop publishes.`
      : "I have the shop page context, but not enough product details to build a useful choice yet.";
    if (session.products.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-guide";
      empty.textContent = "Open a collection or product page on this shop, then choose “Add this page to the guide”. Pages are never opened or followed automatically.";
      questionArea.append(empty);
      return;
    }
    if (session.questions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-guide";
      empty.textContent = session.products.length === 1
        ? "I found one offer, but the pages do not show enough alternatives to ask a useful question. Here it is with the facts the shop published."
        : "I found offers, but not enough shared attributes to ask a useful question. Browse the list below.";
      questionArea.append(empty);
      renderResults();
      return;
    }
    if (questionIndex >= session.questions.length) {
      renderResults();
      return;
    }
    renderQuestion(session.questions[questionIndex]);
  }

  function renderQuestion(question) {
    const card = document.createElement("div");
    card.className = "question-card";
    const counter = document.createElement("p");
    counter.className = "question-counter";
    counter.textContent = `Question ${questionIndex + 1} of ${session.questions.length}`;
    const title = document.createElement("h3");
    title.textContent = question.title;
    const choices = document.createElement("div");
    choices.className = "answer-list";
    let selected = session.answers[question.key];
    for (const option of question.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-choice";
      button.textContent = option.label;
      button.setAttribute("aria-pressed", String(selected === option.value));
      button.addEventListener("click", () => {
        selected = option.value;
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
    back.textContent = "Back";
    back.disabled = questionIndex === 0;
    back.addEventListener("click", () => { questionIndex = Math.max(0, questionIndex - 1); renderGuide(); });
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = questionIndex === session.questions.length - 1 ? "Show matches" : "Continue";
    next.disabled = selected === undefined;
    next.addEventListener("click", () => { questionIndex += 1; renderGuide(); });
    controls.append(back, next);
    card.append(counter, title, choices, controls);
    questionArea.append(card);
  }

  function renderResults() {
    const title = document.createElement("h3");
    title.className = "results-title";
    title.textContent = "Possible matches";
    resultsArea.append(title);
    const ranked = ranker.rankProducts(session.products, session.questions, session.answers);
    if (!ranked.length) {
      const empty = document.createElement("p");
      empty.className = "empty-guide";
      empty.textContent = "Those answers do not match the offers found on these pages. Try a different answer or add another product page.";
      resultsArea.append(empty);
      return;
    }
    for (const result of ranked.slice(0, 5)) {
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
        reasons.textContent = `Why it appeared: ${result.reasons.join(" · ")}`;
        card.append(reasons);
      }
      if (result.product.url && isSameOrigin(result.product.url)) {
        const link = document.createElement("a");
        link.className = "merchant-link";
        link.href = result.product.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View on the shop site ↗";
        card.append(link);
      }
      resultsArea.append(card);
    }
  }

  async function updateCurrentTabLabel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const label = document.querySelector("#current-tab");
      label.textContent = tab?.title ? `Current tab: ${tab.title}` : "Ready to inspect the current tab.";
    } catch {}
  }

  function productKey(product) { return `${product.name.toLowerCase()}|${product.url || product.sourceUrl || ""}`; }
  function isSameOrigin(candidate) {
    try { return new URL(candidate).origin === session.origin; } catch { return false; }
  }
  function formatPrice(value, currency) {
    try { return currency ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value) : String(value); }
    catch { return String(value); }
  }
  function setStatus(message) { status.textContent = message; }
}());
