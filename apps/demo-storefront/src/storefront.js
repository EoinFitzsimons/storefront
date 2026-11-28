"use strict";

(function () {
  const configs = window.EmbeddedTenantConfigs || {};
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("tenant") || "oak-clay";
  const tenantId = Object.hasOwn(configs, requestedId) ? requestedId : "oak-clay";
  const config = configs[tenantId];
  const grid = document.querySelector("#product-grid");
  const select = document.querySelector("#tenant-switcher");
  const theme = config.theme || {};

  document.documentElement.dataset.tenant = tenantId;
  document.documentElement.style.setProperty("--brand", theme.primary || "#315947");
  document.documentElement.style.setProperty("--accent", theme.accent || "#aa684d");
  document.querySelector("meta[name='theme-color']").content = theme.primary || "#315947";
  document.querySelector("meta[name='description']").content = config.content.heroIntro;
  document.title = `${config.tenant.name} — Sample shop`;
  select.value = tenantId;
  select.addEventListener("change", () => {
    const next = new URL(location.href);
    next.searchParams.set("tenant", select.value);
    location.assign(next);
  });
  document.querySelector("#shop-page-link").href = `/?tenant=${encodeURIComponent(tenantId)}`;
  document.querySelector("#about-page-link").href = `/about.html?tenant=${encodeURIComponent(tenantId)}`;

  setText("#merchant-name", config.tenant.name);
  setText("#footer-merchant-name", config.tenant.name);
  setText("#hero-title", config.content.heroHeading);
  setText("#hero-intro", config.content.heroIntro);
  setText("#collection-title", tenantId === "oak-clay" ? "Made, found and shared" : "Experiences to explore");
  setText("#collection-intro", tenantId === "oak-clay"
    ? "A studio session, a one-off piece, or a gift that leaves the choice open."
    : "A few example experiences from the Spirit catalogue. Choose a page and let the extension help you explore.");
  setText("#about-title", tenantId === "oak-clay" ? "A studio for making and finding." : "A space for thoughtful experiences.");
  setText("#about-copy", tenantId === "oak-clay"
    ? "Oak & Clay is an example pottery studio catalogue, with a beginner workshop, a handmade piece and a flexible gift."
    : "Spirit is an example wellbeing catalogue. It shows how a guide might work with a different kind of offer and customer decision.");

  const products = config.catalog.products;
  setText("#product-count", `${products.length} sample ${products.length === 1 ? "offer" : "offers"}`);
  for (const product of products) grid.append(createProductCard(product));
  document.querySelector("#store-catalog-jsonld").textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.tenant.name,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: structuredProduct(product, index)
    }))
  });

  function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.id = `product-${slug(product.id)}`;
    card.dataset.productCard = "";
    card.setAttribute("itemscope", "");
    card.setAttribute("itemtype", "https://schema.org/Product");

    const category = productCategory(product);
    const image = document.createElement("div");
    image.className = `product-art art-${slug(product.id)}`;
    image.setAttribute("aria-hidden", "true");
    const motif = document.createElement("span");
    motif.textContent = product.name.slice(0, 1).toUpperCase();
    image.append(motif);

    const details = document.createElement("div");
    details.className = "product-details";
    const categoryLabel = document.createElement("span");
    categoryLabel.className = "product-category";
    categoryLabel.textContent = category;
    const title = document.createElement("h3");
    title.setAttribute("itemprop", "name");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.setAttribute("itemprop", "description");
    description.textContent = product.description;
    const price = document.createElement("p");
    price.className = "price-unknown";
    price.textContent = "Sample offer · price not provided";
    const link = document.createElement("a");
    link.className = "product-link";
    link.href = `#${card.id}`;
    link.setAttribute("itemprop", "url");
    link.textContent = "View offer";
    details.append(categoryLabel, title, description, price, link);
    card.append(image, details);
    return card;
  }

  function structuredProduct(product, index) {
    const category = productCategory(product);
    const properties = [{ "@type": "PropertyValue", name: "Offer type", value: category }];
    for (const [name, value] of Object.entries(product.attributes || {})) {
      properties.push({ "@type": "PropertyValue", name: attributeLabel(name), value });
    }
    return {
      "@type": "Product",
      name: product.name,
      description: product.description,
      category,
      url: `${location.origin}${location.pathname}#product-${slug(product.id)}`,
      additionalProperty: properties,
      position: index + 1
    };
  }

  function productCategory(product) {
    if (tenantId === "spirit") {
      if (product.name.toLowerCase().includes("aroma")) return "Scent-based session";
      if (product.name.toLowerCase().includes("tarot")) return "Card reading";
      if (product.name.toLowerCase().includes("astrology")) return "Birth-chart reading";
      return "Wellbeing experience";
    }
    if (product.capabilities?.includes("workshop")) return "Workshop";
    if (product.capabilities?.includes("gift")) return "Gift";
    return "Handmade pottery";
  }

  function setText(selector, value) {
    document.querySelector(selector).textContent = value;
  }

  function attributeLabel(value) {
    const labels = { outcome: "Outcome", format: "Format", "price band": "Price band", approach: "Approach" };
    return labels[String(value).toLowerCase()] || value;
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
}());
