/* Dependency-free pre-render: content is present without JavaScript. Run: node scripts/render.js */
const fs = require('node:fs');
const path = require('node:path');
require('../js/data.js');
const { copy: c, products, config } = globalThis.INDICE_DATA;
const { escape, arrow, down, demo, logo, navigation } = require('./shared.js');
const diagonalDown = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5 19 19M5 19h14V5" stroke="currentColor" stroke-width="1.5"/></svg>';
const preview = (p, cls = '') => p.preview
  ? `<img class="${cls}" src="${escape(p.preview)}" width="1920" height="1080" alt="${escape(p.name)} product interface" loading="lazy" decoding="async">`
  : `<div class="preview-placeholder ${cls}" role="img" aria-label="${escape(p.name)} UI screenshot placeholder. Awaiting approved asset."><span class="placeholder-cross" aria-hidden="true"></span><span class="placeholder-caption"><span>${escape(p.name)}</span><span>UI screenshot — awaiting approved asset.</span></span></div>`;
const suiteProducts = ['cases', 'iam', 'messaging', 'risk'].map(id => products.find(product => product.id === id));
let contactTypingTime = 0;
const contactLines = c.contact.title.split('. ').map((sentence, index, sentences) => {
  const line = sentence + (index < sentences.length - 1 ? '.' : '');
  const characters = [...line].map(character => {
    const markup = `<span class="contact-character" style="--character-delay:${contactTypingTime.toFixed(3)}s">${escape(character)}</span>`;
    contactTypingTime += .085;
    return markup;
  }).join('');
  contactTypingTime += .45;
  return `<span class="contact-line" aria-hidden="true">${characters}</span>`;
}).join('');
const heroSlashes = fs.readFileSync(path.join(__dirname, '../assets/logos/INDICE_slashes.svg'), 'utf8')
  .replace('<svg ', '<svg class="hero-slashes" aria-hidden="true" ')
  .replace(/<path ([^>]+)\/>/g, (_, attributes) => `<g class="hero-slash-flight"><path class="hero-slash-shape" pathLength="1" ${attributes.replace(' fill="white"', '')}/></g>`);
let contactSlashIndex = 0;
const contactSlashes = fs.readFileSync(path.join(__dirname, '../assets/logos/INDICE_slashes.svg'), 'utf8')
  .replace('<svg ', '<svg class="contact-slash" aria-hidden="true" ')
  .replace(/<path /g, () => `<path class="contact-slash-${contactSlashIndex++ === 0 ? 'second' : 'first'}" `)
  .replace(/ fill="white"/g, '');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#DEDAD0">
  <meta name="description" content="${escape(c.foundation.paragraphs[0])}">
  <title>INDICE Platform</title>
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="${escape(config.logoIcon)}" as="image">
  <link rel="preload" href="${escape(config.logoTop)}" as="image">
  <link rel="stylesheet" href="css/styles.css">
  <script defer src="js/data.js"></script>
  <script defer src="js/main.js"></script>
  <script defer src="js/metrics.js"></script>
  <script defer src="js/hero-art.js"></script>
  <script defer src="js/foundation-art.js"></script>
  <script defer src="js/contact.js"></script>
  <script defer src="js/showcase.js"></script>
</head>
<body>
  <a class="skip-link" href="#main-content">${c.navigation.skip}</a>
  <a class="hero-brand" id="hero-brand" href="#hero" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" fetchpriority="high"></a>
  <main id="main-content" tabindex="-1">
    <section class="hero" id="hero" aria-labelledby="hero-title" tabindex="-1">
      <div class="hero-top"></div>
      <div class="hero-composition">
        <h1 id="hero-title">${escape(c.hero.title).replace(' ', ' <span>')}</span></h1>
        <div class="hero-art">
          ${heroSlashes}
        </div>
        <div class="hero-baseline"><p class="hero-motto">${c.hero.motto.replace('. ', '.<br>')}</p></div>
      </div>
      <div class="pillar-grid">${c.hero.pillars.map(p => `<a class="pillar" href="#${p.id}"><span class="pillar-label"><span>${p.number}</span>${p.label}</span><span class="pillar-content"><span class="pillar-headline">${p.headline}</span>${diagonalDown}</span></a>`).join('')}</div>
    </section>

    <section class="foundation section-pad" id="foundation" aria-labelledby="foundation-title" tabindex="-1">
      <div class="section-top"><span class="eyebrow" data-reveal style="--reveal-index:0">${c.foundation.label}</span><span class="section-number" aria-hidden="true" data-reveal style="--reveal-index:1">01 /</span></div>
      <h2 class="display-heading foundation-heading" id="foundation-title" data-reveal style="--reveal-index:2">${c.foundation.title}</h2>
      <div class="foundation-layout">
        <div class="foundation-art" data-reveal style="--reveal-index:3">
          <div class="foundation-shapes" aria-hidden="true"><div class="foundation-plane plane-one art-piece" data-art-piece></div><div class="foundation-plane plane-two art-piece" data-art-piece></div><div class="foundation-plane plane-three art-piece" data-art-piece></div><div class="foundation-slash art-piece" data-art-piece></div><span class="art-coordinate coordinate-one art-piece" data-art-piece>+</span><span class="art-coordinate coordinate-two art-piece" data-art-piece>+</span></div>
        </div>
        <div class="foundation-text">${c.foundation.paragraphs.map((p,i) => `<p data-reveal style="--reveal-index:${4+i}">${p}</p>`).join('')}<div class="foundation-details">${c.foundation.items.map((item,i) => `<div><h3 data-reveal style="--reveal-index:${4+c.foundation.paragraphs.length+i*2}">${escape(item.title)}</h3><p data-reveal style="--reveal-index:${5+c.foundation.paragraphs.length+i*2}">${escape(item.description)}</p></div>`).join('')}</div><div class="actions"><div data-reveal style="--reveal-index:${4+c.foundation.paragraphs.length+c.foundation.items.length*2}">${demo()}</div><a class="text-link" href="#products" data-reveal style="--reveal-index:${5+c.foundation.paragraphs.length+c.foundation.items.length*2}">${c.foundation.explore}${down}</a></div></div>
      </div>
    </section>

    <section class="metrics" id="metrics" aria-label="Platform metrics">${c.metrics.map((m,i) => `<div class="metric" data-reveal style="--reveal-index:${i}"><span class="metric-value" data-count-value="${escape(m.value)}" aria-label="${escape(m.value)}">${m.value}</span><p>${m.label}</p></div>`).join('')}</section>

    <section class="products section-pad" id="products" aria-labelledby="products-title" tabindex="-1">
      <div class="section-top" data-reveal><span class="eyebrow">${c.products.label}</span><span class="section-number" aria-hidden="true">02 /</span></div>
      <div class="products-introduction"><h2 class="display-heading" id="products-title" data-reveal>${escape(c.products.title).replace('. ', '.<br>')}</h2><p data-reveal>${c.products.introduction}</p></div>
      <div class="product-grid">${suiteProducts.map((p,i) => `<div class="product-tile tile-${p.id}" style="--reveal-index:${i}" data-reveal><a class="tile-link" href="#product-${p.id}" data-product-link="${p.id}"><div class="tile-logo">${logo(p)}</div><span class="tile-description">${p.tagline}</span><span class="tile-learn">Learn more <span aria-hidden="true">&rarr;</span></span></a></div>`).join('')}${['Workers', 'DEX'].map((name,i) => `<div class="product-tile tile-placeholder" data-suite-placeholder="${name.toLowerCase()}" data-reveal style="--reveal-index:${i+4}"><div class="suite-placeholder-logo">Placeholder</div><span class="tile-description">${name} lorem ipsum</span><span class="tile-learn" aria-disabled="true">Learn more <span aria-hidden="true">&rarr;</span><span class="sr-only"> — ${name} is a placeholder, not available.</span></span></div>`).join('')}</div>
    </section>

    <section class="product-showcase" id="product-showcase" aria-label="Explore the products">
      <div class="story-stage">
        <div class="story-topline"><a class="text-link story-continue" id="story-continue" href="#services" hidden>Continue to Services${down}</a></div>
        <nav class="product-navigation" aria-label="Product showcase">${products.map((p,i) => `<button type="button" data-select-product="${p.id}" aria-controls="product-${p.id}"><span class="product-nav-index" aria-hidden="true">0${i+1}</span>${p.name}</button>`).join('')}</nav>
        <div class="story-copy">${products.map((p,i) => `<article class="product-chapter" id="product-${p.id}" data-product="${p.id}" style="--product-color:${p.id === 'messaging' ? p.accent : p.color}" aria-labelledby="title-${p.id}" tabindex="-1"><div class="chapter-content"><div class="chapter-logo">${logo(p)}</div><h3 id="title-${p.id}">${escape(p.title)}</h3><p class="chapter-description">${escape(p.description)}</p>${p.destination ? `<a class="button explore-button" href="${escape(p.destination)}">Explore ${p.name}${arrow}</a>` : `<button type="button" class="button explore-button" disabled aria-describedby="unavailable-${p.id}">Explore ${p.name}${arrow}</button><p class="unavailable-note" id="unavailable-${p.id}">${c.navigation.unavailable}</p>`}</div><div class="static-preview">${preview(p)}</div></article>`).join('')}</div>
        <div class="preview-panel" aria-label="Product UI preview"><div class="preview-viewport">${products.map((p,i) => `<div class="preview-slide${i===0?' is-active':''}" data-preview="${p.id}">${preview(p)}</div>`).join('')}</div></div>
      </div>
    </section>

    <section class="services section-pad" id="services" aria-labelledby="services-title" tabindex="-1">
      <div class="section-top"><span class="eyebrow" data-reveal style="--reveal-index:0">${c.services.label}</span><span class="section-number" aria-hidden="true" data-reveal style="--reveal-index:1">03 /</span></div>
      <div class="services-introduction"><h2 class="display-heading" id="services-title" data-reveal style="--reveal-index:2">${c.services.title}</h2><div>${c.services.paragraphs.map((p,i) => `<p data-reveal style="--reveal-index:${i+3}">${p}</p>`).join('')}</div></div>
      <div class="service-list">${c.services.items.map((s,i) => `<article class="service-row" data-reveal style="--reveal-index:${i}"><span class="service-number" aria-hidden="true">0${i+1}</span><h3>${s.title}</h3><p>${s.description}</p><span class="service-glyph glyph-${i}" aria-hidden="true"><i></i><i></i><i></i></span></article>`).join('')}</div>
    </section>

    <section class="customers section-pad" id="customers" aria-labelledby="customers-title"><h2 id="customers-title" data-reveal>${c.customers.title}</h2><ul class="customer-logos" aria-label="Customers">${c.customers.logos.map((client,i) => `<li data-reveal style="--reveal-index:${i}"><div class="customer-logo">${logo(client, 'client-image')}</div></li>`).join('')}</ul></section>
    <section class="contact section-pad" id="contact" aria-labelledby="contact-title" tabindex="-1" style="--typing-end:${contactTypingTime.toFixed(3)}s">${contactSlashes}<h2 class="display-heading" id="contact-title" aria-label="${escape(c.contact.title)}">${contactLines}</h2><div class="contact-bottom"><p>${c.contact.description}</p>${demo('button-light')}</div></section>
  </main>
  <footer class="site-footer"><a href="#hero" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" loading="lazy"></a></footer>

  ${navigation()}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, '../index.html'), html, 'utf8');
console.log(`Rendered homepage with ${products.length} products.`);
require('./render-cases.js')();
