const questions = [
  { id: "q1_goal", title: "What would feel most helpful right now?", required: true, options: [
    ["unwind", "A chance to slow down"], ["clarity", "A clearer view of something on my mind"], ["understand", "A better sense of my own patterns"], ["support", "Support around a personal situation"], ["discover", "A fresh experience to explore"], ["unsure", "I’m still figuring that out"]
  ], helper: "Choose what feels closest; you can change course as you go." },
  { id: "q2_context", title: "What brings you here today?", required: false, options: [
    ["everyday_pressure", "I’ve been carrying a lot and need breathing room"], ["change", "I’m weighing a choice or change"], ["feelings", "I keep noticing the same feelings or patterns"], ["professional", "I’m looking specifically for qualified therapy"], ["explore", "I’m curious, without a set goal"], ["treat", "I’d like a little time that’s just for me"], ["private", "I’d rather keep that private"]
  ] },
  { id: "q3_outcome", title: "When you leave, what would you like more of?", required: true, options: [
    ["rest", "A bit more settled"], ["heard", "Feeling heard in a kind conversation"], ["perspective", "A new angle on something"], ["insight", "A clearer sense of what matters to me"], ["tools", "One practical next step"], ["enjoy", "The pleasure of trying something different"], ["unsure", "I’m open to seeing what comes up"]
  ] },
  { id: "q4_worldview", title: "Which approaches feel comfortable to you?", required: true, helper: "No experience or belief is expected. Your preference helps shape the options.", options: [
    ["secular", "Keep it grounded and non-spiritual"], ["reflective_no_astrology", "Reflection is welcome; astrology isn’t for me"], ["spiritual", "I’m comfortable with spiritual or intuitive practices"], ["open", "I’m open, depending on what it involves"]
  ] },
  { id: "q5_experience", title: "What kind of moment sounds most like you?", required: true, options: [
    ["talk", "Talking something through with someone"], ["sensory", "A soothing, sensory experience"], ["reflect", "Gentle prompts to help me reflect"], ["symbolic", "Exploring images, symbols or stories"], ["self", "Something I can do in my own time"], ["surprise", "I’m happy to be surprised"]
  ] },
  { id: "q6_format", title: "How would you like to experience it?", required: false, options: [
    ["one_to_one", "One-to-one"], ["group", "With a group"], ["online", "Online"], ["in_person", "In person"], ["self_guided", "On my own, at my pace"], ["either", "I’m flexible"]
  ] },
  { id: "q7_commitment", title: "What kind of commitment fits your life right now?", required: false, options: [
    ["once", "One session or experience"], ["few", "A short series"], ["ongoing", "Ongoing support"], ["flexible", "I’d like to keep my options open"]
  ] },
  { id: "q8_price", title: "What feels comfortable for your budget?", required: false, options: [
    ["entry", "Show me the lower-cost options"], ["mid", "A mid-priced option feels right"], ["premium", "I can consider a higher-priced experience"], ["best_fit", "Show me what fits best, whatever the price"]
  ] },
  { id: "q9_hesitations", title: "What would you like to know before deciding?", required: false, options: [
    ["cost", "What’s included for the price"], ["time", "How long it takes"], ["scepticism", "How the approach works in practice"], ["trust", "Who I’d be meeting"], ["privacy", "How my privacy is respected"], ["none", "I feel ready to explore"]
  ] }
];

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
let currentIndex = 0;
const beaconPositions = [9, 19, 29, 39, 50, 61, 72, 84, 94];
const beaconHeights = [61, 65, 57, 63, 54, 65, 55, 61, 48];

const landscapeTones = {
  unwind: "calm", clarity: "clear", understand: "lilac", support: "warm", discover: "curious", unsure: "open",
  everyday_pressure: "calm", change: "clear", feelings: "lilac", professional: "grounded", explore: "curious", treat: "calm", private: "open",
  rest: "calm", heard: "warm", perspective: "clear", insight: "lilac", tools: "grounded", enjoy: "curious",
  secular: "grounded", reflective_no_astrology: "reflective", spiritual: "cosmic", open: "open",
  talk: "warm", sensory: "calm", reflect: "lilac", symbolic: "cosmic", self: "grounded", surprise: "curious"
};

function renderProgress() {
  progressEl.replaceChildren();
  questions.forEach((question, index) => {
    const segment = document.createElement("span");
    if (index <= currentIndex) segment.classList.add("progress-active");
    progressEl.append(segment);
  });
  const label = document.createElement("b");
  label.textContent = `${currentIndex + 1} OF ${questions.length}`;
  progressEl.append(label);
  progressEl.setAttribute("aria-label", `Question ${currentIndex + 1} of ${questions.length}`);
  landscape.dataset.stage = String(currentIndex);
  const routeProgress = Math.round((currentIndex / (questions.length - 1)) * 100);
  routeTrack.style.strokeDashoffset = String(100 - routeProgress);
  landscapeBeacon.style.left = `${beaconPositions[currentIndex]}%`;
  landscapeBeacon.style.top = `${beaconHeights[currentIndex]}%`;
}

function renderQuestion() {
  const question = questions[currentIndex];
  card.classList.remove("question-enter");
  requestAnimationFrame(() => card.classList.add("question-enter"));
  renderProgress();
  document.querySelector("#question-step").textContent = "A TWO-MINUTE CHECK-IN";
  document.querySelector("#question-counter").textContent = `QUESTION ${String(currentIndex + 1).padStart(2, "0")}`;
  document.querySelector("#question-title").textContent = question.title;
  document.querySelector("#question-helper").textContent = question.helper || (question.required ? "Choose the answer that feels closest." : "This question is optional.");
  optionsEl.replaceChildren();
  question.options.forEach(([id, label], optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.dataset.option = id;
    button.setAttribute("aria-pressed", answers[question.id] === id ? "true" : "false");
    const symbol = document.createElement("span");
    symbol.className = "answer-icon";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = ["✧", "☾", "✦", "◌", "✴", "◇", "✳"][optionIndex % 7];
    const copy = document.createElement("span");
    copy.className = "answer-copy";
    const strong = document.createElement("strong");
    strong.textContent = label;
    copy.append(strong);
    const arrow = document.createElement("span");
    arrow.className = "answer-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    button.append(symbol, copy, arrow);
    button.addEventListener("click", () => {
      answers[question.id] = id;
      landscape.dataset.tone = landscapeTones[id] || "open";
      optionsEl.querySelectorAll(".answer-option").forEach((option) => option.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      advance();
    });
    optionsEl.append(button);
  });
  backButton.hidden = currentIndex === 0;
  skipButton.hidden = question.required;
  document.querySelector("#integration-note").hidden = false;
}

const answerTags = {
  q1_goal: { unwind: "goal:calm", clarity: "goal:clarity", understand: "goal:self_understanding", support: "goal:emotional_support", discover: "goal:curiosity" },
  q2_context: { everyday_pressure: "need:everyday_stress", change: "need:life_transition", feelings: "need:feelings_and_patterns", professional: "need:professional_support", explore: "need:reflective_exploration", treat: "need:relaxation" },
  q3_outcome: { rest: "outcome:relaxation", heard: "outcome:supported_conversation", perspective: "outcome:new_perspective", insight: "outcome:personal_insight", tools: "outcome:practical_tools", enjoy: "outcome:enjoyable_exploration" },
  q4_worldview: { secular: "approach:secular", reflective_no_astrology: "approach:reflective", spiritual: "approach:spiritual" },
  q5_experience: { talk: "experience:conversation", sensory: "experience:sensory", reflect: "experience:structured_reflection", symbolic: "experience:symbolic_reflection", self: "experience:self_guided" },
  q6_format: { one_to_one: "format:one_to_one", group: "format:group", online: "format:online", in_person: "format:in_person", self_guided: "format:self_guided" },
  q7_commitment: { once: "commitment:one_off", few: "commitment:short_series", ongoing: "commitment:ongoing" },
  q8_price: { entry: "price_tier:entry", mid: "price_tier:mid", premium: "price_tier:premium" }
};
const matchWeights = { goal: 5, need: 5, outcome: 4, approach: 6, experience: 5, format: 2, commitment: 2, price_tier: 1 };
const products = [
  { id: "example_aromatherapy", name: "Aromatherapy session", kind: "A scent-based wellbeing experience focused on rest and sensory enjoyment.", planTitle: "Pause & reset", plan: ["Check scent preferences and sensitivities with the practitioner", "Try a guided scent-based wellbeing experience", "Take a moment afterward to notice what felt calming"], capabilities: ["scent_based_experience", "wellbeing_only"], tags: ["goal:calm", "need:everyday_stress", "need:relaxation", "outcome:relaxation", "approach:secular", "approach:reflective", "experience:sensory", "format:one_to_one", "format:in_person", "commitment:one_off", "commitment:short_series"] },
  { id: "example_tarot", name: "Tarot reading", kind: "A practitioner-led card reading for symbolic reflection and fresh perspectives—not predictive certainty.", planTitle: "A question, a new angle", plan: ["Choose one question, decision, or pattern to explore", "Use the cards as prompts for symbolic reflection", "Write down one perspective you want to carry forward"], capabilities: ["divination_content", "symbolic_content"], tags: ["goal:clarity", "goal:self_understanding", "goal:curiosity", "need:life_transition", "need:reflective_exploration", "outcome:new_perspective", "outcome:personal_insight", "outcome:enjoyable_exploration", "approach:reflective", "approach:spiritual", "experience:symbolic_reflection", "experience:structured_reflection", "format:one_to_one", "commitment:one_off"] },
  { id: "example_astrology", name: "Astrology reading", kind: "A birth-chart experience for storytelling, reflection, and personal exploration.", planTitle: "Patterns & perspective", plan: ["Pick a life area or repeating pattern to reflect on", "Explore the birth chart as an interpretive lens", "Note a new perspective and choices you may want to consider"], capabilities: ["astrology_content", "symbolic_content"], tags: ["goal:curiosity", "goal:self_understanding", "goal:clarity", "need:reflective_exploration", "need:life_transition", "outcome:personal_insight", "outcome:new_perspective", "outcome:enjoyable_exploration", "approach:spiritual", "approach:reflective", "experience:symbolic_reflection", "format:one_to_one", "format:online", "commitment:one_off"] }
];

function selectedLabel(questionId) {
  const question = questions.find((item) => item.id === questionId);
  return question?.options.find(([id]) => id === answers[questionId])?.[1];
}

function getRecommendations() {
  const tags = Object.entries(answers).map(([questionId, answerId]) => answerTags[questionId]?.[answerId]).filter(Boolean);
  const excluded = new Set();
  if (answers.q4_worldview === "secular") ["astrology_content", "divination_content", "spiritual_required"].forEach((item) => excluded.add(item));
  if (answers.q4_worldview === "reflective_no_astrology") excluded.add("astrology_content");
  if (answers.q2_context === "professional") excluded.add("talking_support");
  const candidates = answers.q2_context === "professional" ? [] : products.filter((product) => !product.capabilities.some((item) => excluded.has(item)));
  const dimensions = [...new Set(tags.map((tag) => tag.split(":")[0]))];
  const denominator = dimensions.reduce((sum, dimension) => sum + (matchWeights[dimension] || 0), 0);
  return candidates.map((product) => {
    const matched = dimensions.filter((dimension) => tags.some((tag) => tag.startsWith(`${dimension}:`) && product.tags.includes(tag)));
    const score = denominator ? matched.reduce((sum, dimension) => sum + matchWeights[dimension], 0) / denominator : null;
    return { ...product, score, matched };
  }).filter((product) => product.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 2);
}

function finish() {
  journey.hidden = true;
  resultSection.hidden = false;
  const resultTitle = document.querySelector("#result-title");
  const resultMessage = document.querySelector("#result-message");
  const resultSummary = document.querySelector("#result-summary");
  const resultsList = document.querySelector("#results-list");
  const summaryParts = [selectedLabel("q1_goal"), selectedLabel("q5_experience")].filter(Boolean);
  resultSummary.textContent = summaryParts.length ? `You said: ${summaryParts.join("; ").toLowerCase()}.` : "Your preferences are ready to explore.";
  resultsList.replaceChildren();

  if (answers.q2_context === "professional") {
    resultTitle.textContent = "You’re looking for qualified therapy.";
    resultMessage.textContent = "The supplied catalogue doesn’t contain a verified talking-therapy service, so Spirit won’t suggest a substitute.";
  } else if (answers.q4_worldview === "secular") {
    resultTitle.textContent = "You prefer a non-spiritual experience.";
    resultMessage.textContent = "The supplied catalogue doesn’t identify a suitable non-spiritual offer. We won’t show astrology or tarot as a match.";
  } else {
    const matches = getRecommendations();
    if (matches.length) {
      resultTitle.textContent = "These experiences may fit what you’re looking for.";
      resultMessage.textContent = "These example products and sample plans are matched to your answers for the demo. They’re illustrative only, with unknown availability, and aren’t bookable offers.";
      matches.forEach((product, index) => {
        const item = document.createElement("article");
        item.className = "result-product";
        const top = document.createElement("div");
        top.className = "result-product-top";
        const name = document.createElement("h3");
        name.textContent = product.name;
        const badge = document.createElement("span");
        badge.textContent = "EXAMPLE ONLY · NOT BOOKABLE";
        top.append(name, badge);
        const description = document.createElement("p");
        description.textContent = product.kind;
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
        const reason = document.createElement("small");
        const preferenceLabels = product.matched.map((dimension) => {
          const questionId = Object.keys(answerTags).find((id) => answerTags[id][answers[id]]?.startsWith(`${dimension}:`));
          return questionId ? selectedLabel(questionId) : null;
        }).filter(Boolean).slice(0, 2);
        reason.textContent = preferenceLabels.length ? `Connects with your choices: ${preferenceLabels.join("; ").toLowerCase()}.` : "One option from the supplied catalogue.";
        item.append(top, description, reason, planTitle, planList);
        resultsList.append(item);
      });
    } else {
      resultTitle.textContent = "Your preferences are clear; the fit isn’t.";
      resultMessage.textContent = "The supplied catalogue doesn’t describe an eligible option that matches this combination, so Spirit won’t guess. You can try another path or browse the catalogue when it’s connected.";
    }
  }
  document.querySelector("#restart-button").focus({ preventScroll: true });
}

function advance() {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    document.querySelector("#question-title").focus({ preventScroll: true });
  } else finish();
}

skipButton.addEventListener("click", advance);
backButton.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    const previousTone = landscapeTones[answers[questions[currentIndex].id]];
    if (previousTone) landscape.dataset.tone = previousTone;
    renderQuestion();
    document.querySelector("#question-title").focus({ preventScroll: true });
  }
});
function startJourney() {
  hero.hidden = true;
  resultSection.hidden = true;
  journey.hidden = false;
  renderQuestion();
  card.focus({ preventScroll: true });
}
document.querySelector("#begin").addEventListener("click", startJourney);
document.querySelector("#journey-cue").addEventListener("click", startJourney);
document.querySelector("#journey-link").addEventListener("click", startJourney);
document.querySelector(".topbar .brand").addEventListener("click", (event) => {
  event.preventDefault();
  journey.hidden = true;
  resultSection.hidden = true;
  hero.hidden = false;
});
document.querySelector("#restart-button").addEventListener("click", () => {
  for (const key of Object.keys(answers)) delete answers[key];
  currentIndex = 0;
  landscape.dataset.tone = "open";
  resultSection.hidden = true;
  hero.hidden = true;
  journey.hidden = false;
  renderQuestion();
  card.focus({ preventScroll: true });
});

card.setAttribute("tabindex", "-1");
document.querySelector("#question-title").setAttribute("tabindex", "-1");
renderQuestion();
