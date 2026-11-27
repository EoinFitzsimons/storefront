"use strict";

(async function startStorefront() {
  const engine = window.GuidanceEngine;
  const integrations = window.CatalogIntegrations;
  const params = new URLSearchParams(window.location.search);
  const tenantId = params.get("tenant") || "spirit";

  try {
    const config = await integrations.loadTenantConfiguration(tenantId);
    const products = await integrations.loadCatalog(config);
    startJourney(config, products);
  } catch (error) {
    const notice = document.createElement("p");
    notice.id = "app-error";
    notice.setAttribute("role", "alert");
    notice.textContent = `This experience couldn’t be loaded: ${error.message}`;
    document.querySelector("main").prepend(notice);
    console.error("Storefront initialization failed", error);
  }

  function startJourney(config, products) {
    const journey = document.querySelector("#journey");
    const hero = document.querySelector("#top");
    const card = document.querySelector("#discovery-card");
    const optionsEl = document.querySelector("#answer-options");
    const progressEl = document.querySelector("#progress");
    const landscape = document.querySelector("#journey-landscape");
    const routeTrack = document.querySelector("#route-track");
    const landscapeBeacon = document.querySelector("#landscape-beacon");
    const backButton = document.querySelector("#back-button");
    const skipButton = document.querySelector("#skip-button");
    const resultSection = document.querySelector("#result-section");
    const answers = Object.create(null);
    const beaconPositions = [9, 19, 29, 39, 50, 61, 72, 84, 94];
    const beaconHeights = [61, 65, 57, 63, 54, 65, 55, 61, 48];
    let currentQuestionId = config.questions[0].id;

    function questionFor(questionId) {
      return config.questions.find((question) => question.id === questionId);
    }

    function applyTenantContent() {
      document.title = config.content.pageTitle;
      document.querySelector('meta[name="theme-color"]').content = config.theme?.primary || "#213063";
      document.querySelector('meta[name="description"]').content = config.content.heroIntro;
      document.querySelectorAll(".brand-name").forEach((element) => { element.textContent = config.tenant.name; });
      document.querySelector(".topbar .brand").setAttribute("aria-label", `${config.tenant.name} home`);
      document.querySelector("#top h1").textContent = config.content.heroHeading;
      document.querySelector("#top .intro").textContent = config.content.heroIntro;
      document.querySelector("#begin").firstChild.textContent = `${config.content.beginLabel} `;
      document.querySelector("#journey-title").textContent = config.content.journeyTitle;
      document.querySelector("#journey-intro").textContent = config.content.journeyIntro;
      document.querySelector("#integration-note small").textContent = config.content.privacyNote;
      document.querySelector(".result-note").textContent = config.content.resultNote;
      if (config.theme?.primary) document.documentElement.style.setProperty("--navy", config.theme.primary);
      if (config.theme?.accent) document.documentElement.style.setProperty("--violet", config.theme.accent);
    }

    function renderProgress(path) {
      progressEl.replaceChildren();
      const currentIndex = path.indexOf(currentQuestionId);
      path.forEach((questionId, index) => {
        const segment = document.createElement("span");
        if (index <= currentIndex) segment.classList.add("progress-active");
        progressEl.append(segment);
      });
      const label = document.createElement("b");
      label.textContent = `${currentIndex + 1} OF ${path.length}`;
      progressEl.append(label);
      progressEl.setAttribute("aria-label", `Question ${currentIndex + 1} of ${path.length}`);
      landscape.dataset.stage = String(currentIndex);
      const routeProgress = path.length > 1 ? Math.round((currentIndex / (path.length - 1)) * 100) : 100;
      routeTrack.style.strokeDashoffset = String(100 - routeProgress);
      const positionIndex = Math.min(currentIndex, beaconPositions.length - 1);
      landscapeBeacon.style.left = `${beaconPositions[positionIndex]}%`;
      landscapeBeacon.style.top = `${beaconHeights[positionIndex]}%`;
    }

    function renderQuestion() {
      const question = questionFor(currentQuestionId);
      const path = engine.getJourneyPath(config, answers);
      card.classList.remove("question-enter");
      requestAnimationFrame(() => card.classList.add("question-enter"));
      renderProgress(path);
      document.querySelector("#question-step").textContent = `${config.tenant.name.toUpperCase()} DISCOVERY`;
      document.querySelector("#question-counter").textContent = `QUESTION ${String(path.indexOf(currentQuestionId) + 1).padStart(2, "0")}`;
      document.querySelector("#question-title").textContent = question.title;
      document.querySelector("#question-helper").textContent = question.helper || (question.required ? "Choose the answer that feels closest." : "This question is optional.");
      optionsEl.replaceChildren();
      question.options.forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-option";
        button.dataset.option = option.id;
        button.setAttribute("aria-pressed", answers[question.id] === option.id ? "true" : "false");
        const symbol = document.createElement("span");
        symbol.className = "answer-icon";
        symbol.setAttribute("aria-hidden", "true");
        symbol.textContent = ["✧", "☾", "✦", "◌", "✴", "◇", "✳"][optionIndex % 7];
        const copy = document.createElement("span");
        copy.className = "answer-copy";
        const strong = document.createElement("strong");
        strong.textContent = option.label;
        copy.append(strong);
        const arrow = document.createElement("span");
        arrow.className = "answer-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        button.append(symbol, copy, arrow);
        button.addEventListener("click", () => {
          answers[question.id] = option.id;
          landscape.dataset.tone = option.tone || "open";
          advance();
        });
        optionsEl.append(button);
      });
      const currentIndex = path.indexOf(currentQuestionId);
      backButton.hidden = currentIndex <= 0;
      skipButton.hidden = question.required;
      document.querySelector("#integration-note").hidden = false;
    }

    function renderRecommendations(result) {
      const resultsList = document.querySelector("#results-list");
      resultsList.replaceChildren();
      result.recommendations.forEach((product) => {
        const item = document.createElement("article");
        item.className = "result-product";
        const top = document.createElement("div");
        top.className = "result-product-top";
        const name = document.createElement("h3");
        name.textContent = product.name;
        const badge = document.createElement("span");
        badge.textContent = product.checkoutUrl ? "AVAILABLE TO EXPLORE" : "EXAMPLE ONLY · NOT BOOKABLE";
        top.append(name, badge);
        const description = document.createElement("p");
        description.textContent = product.description;
        const reasons = document.createElement("small");
        reasons.textContent = product.reasons.length
          ? `Connects with your choices: ${product.reasons.slice(0, 2).map((reason) => reason.label.toLowerCase()).join("; ")}.`
          : "One option from the supplied catalogue.";
        const planTitle = document.createElement("strong");
        planTitle.className = "sample-plan-title";
        planTitle.textContent = `Sample plan: ${product.planTitle}`;
        const planList = document.createElement("ol");
        planList.className = "sample-plan-steps";
        product.plan.forEach((step) => {
          const listItem = document.createElement("li");
          listItem.textContent = step;
          planList.append(listItem);
        });
        item.append(top, description, reasons, planTitle, planList);
        if (product.checkoutUrl) {
          const link = document.createElement("a");
          link.className = "secondary-button product-link";
          link.href = product.checkoutUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "View offer";
          item.append(link);
        }
        resultsList.append(item);
      });
    }

    function finish() {
      const result = engine.evaluate(config, answers, products);
      journey.hidden = true;
      resultSection.hidden = false;
      document.querySelector("#result-title").textContent = result.title;
      document.querySelector("#result-message").textContent = result.message;
      const activePath = engine.getJourneyPath(config, answers);
      const labels = activePath
        .map((questionId) => questionFor(questionId))
        .filter((question) => answers[question.id])
        .map((question) => question.options.find((option) => option.id === answers[question.id])?.label)
        .filter(Boolean)
        .slice(0, 2);
      document.querySelector("#result-summary").textContent = labels.length
        ? `You said: ${labels.join("; ").toLowerCase()}.`
        : "Your preferences are ready to explore.";
      renderRecommendations(result);
      document.querySelector("#restart-button").focus({ preventScroll: true });
    }

    function advance() {
      const nextQuestionId = engine.getNextQuestionId(config, currentQuestionId, answers);
      if (nextQuestionId === engine.RESULT) {
        finish();
      } else {
        currentQuestionId = nextQuestionId;
        renderQuestion();
        document.querySelector("#question-title").focus({ preventScroll: true });
      }
    }

    function startFresh() {
      for (const key of Object.keys(answers)) delete answers[key];
      currentQuestionId = config.questions[0].id;
      landscape.dataset.tone = "open";
      resultSection.hidden = true;
      hero.hidden = true;
      journey.hidden = false;
      renderQuestion();
      card.focus({ preventScroll: true });
    }

    skipButton.addEventListener("click", () => {
      delete answers[currentQuestionId];
      advance();
    });
    backButton.addEventListener("click", () => {
      const path = engine.getJourneyPath(config, answers);
      const previousIndex = path.indexOf(currentQuestionId) - 1;
      if (previousIndex >= 0) {
        currentQuestionId = path[previousIndex];
        const previousQuestion = questionFor(currentQuestionId);
        const previousOption = previousQuestion.options.find((option) => option.id === answers[currentQuestionId]);
        if (previousOption?.tone) landscape.dataset.tone = previousOption.tone;
        renderQuestion();
        document.querySelector("#question-title").focus({ preventScroll: true });
      }
    });
    document.querySelector("#begin").addEventListener("click", startFresh);
    document.querySelector("#journey-cue").addEventListener("click", startFresh);
    document.querySelector("#journey-link").addEventListener("click", startFresh);
    document.querySelector(".topbar .brand").addEventListener("click", (event) => {
      event.preventDefault();
      journey.hidden = true;
      resultSection.hidden = true;
      hero.hidden = false;
    });
    document.querySelector("#restart-button").addEventListener("click", startFresh);

    document.documentElement.lang = config.tenant.locale || "en";
    card.setAttribute("tabindex", "-1");
    document.querySelector("#question-title").setAttribute("tabindex", "-1");
    applyTenantContent();
    renderQuestion();
  }
}());
