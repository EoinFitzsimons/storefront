"use strict";

(function () {
  const configs = window.EmbeddedTenantConfigs || {};
  const params = new URLSearchParams(location.search);
  const tenantId = Object.hasOwn(configs, params.get("tenant")) ? params.get("tenant") : "oak-clay";
  const config = configs[tenantId];
  document.documentElement.dataset.tenant = tenantId;
  document.documentElement.style.setProperty("--brand", config.theme?.primary || "#315947");
  document.documentElement.style.setProperty("--accent", config.theme?.accent || "#aa684d");
  document.querySelector("meta[name='theme-color']").content = config.theme?.primary || "#315947";
  document.querySelector("meta[name='description']").content = config.content.heroIntro;
  document.title = `About ${config.tenant.name} — Sample shop`;
  document.querySelector("#merchant-name").textContent = config.tenant.name;
  document.querySelector("#footer-merchant-name").textContent = config.tenant.name;
  document.querySelector("#about-title").textContent = tenantId === "oak-clay" ? "A studio for making and finding." : "A space for thoughtful experiences.";
  document.querySelector("#about-copy").textContent = tenantId === "oak-clay"
    ? "Oak & Clay is an example pottery studio catalogue, with a beginner workshop, a handmade piece and a flexible gift. The sample offers show different ways to make, find or share something from the studio."
    : "Spirit is an example wellbeing catalogue. Its sample experiences use different approaches to reflection and sensory enjoyment, so a visitor can see how a guide might help compare them.";
  for (const selector of ["#shop-link", "#browse-link", "#footer-shop-link"]) {
    document.querySelector(selector).href = `/?tenant=${encodeURIComponent(tenantId)}`;
  }
  const select = document.querySelector("#tenant-switcher");
  select.value = tenantId;
  select.addEventListener("change", () => location.assign(`/about.html?tenant=${encodeURIComponent(select.value)}`));
}());
