const reflections = {
  direction: { icon: "⌁", title: "You’re allowed to take the next step before you see the whole path.", body: "Clarity often arrives through movement, not before it. You don’t have to solve your whole life today. It may be enough to notice what feels a little more true, a little more open, or a little more like you.", prompt: "If you trusted yourself to choose just one small thing for this week, what would it be?" },
  connection: { icon: "♡", title: "The way back to yourself can start with a little kindness.", body: "Feeling far away from yourself doesn’t mean you’ve lost your way. Sometimes it’s a quiet signal that a part of you would like to be heard. You can meet that feeling gently, without needing to fix it all at once.", prompt: "What is one thing that used to make you feel most like yourself? Could you make a little room for it today?" },
  rest: { icon: "☾", title: "Rest is a place to begin, too.", body: "You don’t have to earn a pause by getting everything done. A slower breath, a glass of water, or a few minutes away from the noise can be a real next step. You’re allowed to meet yourself where you are.", prompt: "What could you set down, even briefly, to give yourself a little breathing room?" },
  curiosity: { icon: "✳", title: "You can follow the questions that make you feel more alive.", body: "You don’t have to know exactly who you’re becoming before you start exploring. Pay attention to what draws your curiosity. Small experiments can teach you more than a perfect plan ever could.", prompt: "What have you been curious about lately that you haven’t given yourself permission to explore?" }
};
const journey = document.querySelector("#journey");
const result = document.querySelector("#result");
document.querySelector("#begin").addEventListener("click", () => journey.scrollIntoView({ behavior: "smooth" }));
document.querySelectorAll(".choice").forEach((button) => button.addEventListener("click", () => {
  const reflection = reflections[button.dataset.key];
  document.querySelector("#result-icon").textContent = reflection.icon;
  document.querySelector("#result-title").textContent = reflection.title;
  document.querySelector("#result-body").textContent = reflection.body;
  document.querySelector("#result-prompt").textContent = reflection.prompt;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth" });
}));
document.querySelector("#restart").addEventListener("click", () => { result.hidden = true; journey.scrollIntoView({ behavior: "smooth" }); });
