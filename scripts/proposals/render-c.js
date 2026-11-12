'use strict';

/* Proposal C — "Modular": a bold, high-contrast concept, dark by default. Manrope in heavy uppercase display and
   plain text, lime accents, a sticky bordered cell bar with section highlighting, a full-screen modular menu on small
   screens, a scroll-driven technology marquee and modular tiles. §02 holds the product cards and, under the hood,
   one row per solution; each row ends with a button that opens a panel of the solution's screens. No slider. */
const S = require('./shared.js');
const { content: c, solutions, escape, icons } = S;
const ui = c.ui;
const pad = number => String(number).padStart(2, '0');

const sections = [
  { id: 'platform', label: ui.nav.platform },
  { id: 'products', label: ui.nav.solutions },
  { id: 'services', label: ui.nav.services },
  { id: 'faq', label: ui.nav.faq }
];
const sectionNumber = id => pad(sections.findIndex(section => section.id === id) + 1);
// "Technical details": the Cases reference page, or the Architecture part of the solution's row.
const detailsHref = s => s.product.destination || `#spec-${s.id}-architecture`;

/* Words that rise into place; words from `markFrom` on also get a lime marker that sweeps in behind them. */
const words = (text, markFrom = Infinity) => escape(text).split(' ')
  .map((word, index) => `<span class="pc-w" style="--w:${index}"><span${index >= markFrom ? ' class="pc-mark"' : ''}>${word}</span></span>`).join(' ');

const bar = () => `<header class="pc-bar">
    <nav class="pc-cells" aria-label="Main navigation">
      <a class="pc-cell pc-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pc-wordmark')}<span aria-hidden="true">Platform</span></a>
      ${sections.map((section, index) => `<a class="pc-cell pc-section-link" href="#${section.id}" data-spy="${section.id}"><span class="pc-cell-no" aria-hidden="true">${pad(index + 1)}</span><span data-scramble="hover">${escape(section.label)}</span></a>`).join('\n      ')}
      <button type="button" class="pc-cell pc-theme" data-theme-toggle aria-pressed="true">${ui.themeToggle}<span class="pc-switch" aria-hidden="true"><i></i></span></button>
      ${S.demoButton('pc-cell pc-cta')}
      <button type="button" class="pc-cell pc-menu-button" data-dialog-open="pc-menu" aria-haspopup="dialog">${ui.nav.menu}${icons.menu}</button>
    </nav>
  </header>
  <dialog class="pc-menu" id="pc-menu" aria-label="${ui.nav.menu}">
    <div class="pc-menu-grid">
      <div class="pc-menu-head">${S.wordmark('pc-wordmark')}<button type="button" class="pc-menu-close" data-dialog-close>${icons.close}<span class="sr-only">${ui.nav.close}</span></button></div>
      ${sections.map((section, index) => `<a class="pc-menu-link" href="#${section.id}" style="--i:${index}"><span class="pc-cell-no">${pad(index + 1)}</span>${escape(section.label)}</a>`).join('\n      ')}
      <ul class="pc-menu-solutions">${solutions.map(s => `<li><a href="#spec-${s.id}" style="--tone:${s.product.color}">${S.productIcon(s.product, 28)}${escape(s.name)}</a></li>`).join('')}</ul>
      <button type="button" class="pc-menu-theme" data-theme-toggle aria-pressed="true">${ui.themeToggle}<span class="pc-switch" aria-hidden="true"><i></i></span></button>
      ${S.demoButton('pc-menu-cta')}
    </div>
  </dialog>`;

const sectionHead = (number, id, label, title, intro) => `<header class="pc-head" data-reveal>
        <p class="pc-head-label"><span class="pc-head-no">${number}</span><span data-scramble>${escape(label)}</span></p>
        <h2 class="pc-display" id="${id}">${words(title)}</h2>
        ${intro ? `<p class="pc-head-intro">${escape(intro)}</p>` : ''}
      </header>`;

const hero = () => {
  const markFrom = c.hero.title.split(' ').indexOf('for') + 1;
  return `<section class="pc-hero" id="hero" aria-labelledby="pc-hero-title" tabindex="-1">
      <div class="pc-hero-top">
        <p class="pc-tag" data-scramble>${escape(c.hero.eyebrow)}</p>
        <p class="pc-sticker" aria-hidden="true" data-magnetic="0.25"><span>${ui.sticker.map(escape).join('<br>')}</span></p>
      </div>
      <h1 class="pc-display pc-hero-title" id="pc-hero-title">${words(c.hero.title, markFrom > 0 ? markFrom : Infinity)}</h1>
      <div class="pc-hero-row">
        <p class="pc-lede">${escape(c.hero.lede)}</p>
        <div class="pc-hero-actions">
          <a class="pc-btn pc-btn-accent" href="#products" data-magnetic>${escape(c.hero.primary)}${icons.arrowDown}</a>
          ${S.demoButton('pc-btn pc-btn-line', c.hero.secondary, 'data-magnetic')}
        </div>
      </div>
      <ul class="pc-modules" aria-label="${ui.nav.solutions}">${solutions.map((s, index) => `<li style="--i:${index}"><a class="pc-module" href="#spec-${s.id}" style="--tone:${s.product.color}">
          <span class="pc-module-top"><span class="pc-label">${pad(index + 1)}</span>${S.productIcon(s.product, 34)}</span>
          <b class="pc-module-name">${escape(s.name)}</b>
          <span class="pc-module-text">${escape(s.action)}</span>
          <code class="pc-module-api">${escape(s.apis[0])}</code>
        </a></li>`).join('')}</ul>
      <dl class="pc-facts">${c.hero.audience.map(item => `<div class="pc-fact-audience"><dt>For ${escape(item.role.toLowerCase())}</dt><dd>${escape(item.text)}</dd></div>`).join('')}${c.hero.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('')}</dl>
    </section>`;
};

/* The technology marquee runs faster, or backwards, with the scroll (data-velocity). */
const marquee = () => {
  const items = S.techIcons.map(item => `<li>${S.techIcon(item, 'pc-tech-icon')}<span>${escape(item.label)}</span></li>`).join('');
  return `<section class="pc-marquee" aria-labelledby="pc-marquee-title">
      <h2 class="sr-only" id="pc-marquee-title">${escape(c.technologies.title)}</h2>
      <div class="pc-marquee-track" data-velocity>
        <ul class="pc-marquee-list">${items}</ul>
        <ul class="pc-marquee-list" aria-hidden="true">${items}</ul>
      </div>
    </section>`;
};

const platform = () => `<section class="pc-section pc-platform" id="platform" aria-labelledby="pc-platform-title" tabindex="-1">
      ${sectionHead(sectionNumber('platform'), 'pc-platform-title', c.platform.label, c.platform.title, c.platform.intro)}
      <ul class="pc-tiles">${c.platform.items.map((item, index) => `<li class="pc-tile" data-reveal style="--i:${index % 3}"><span class="pc-label pc-tile-no">${pad(index + 1)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p><span class="pc-chip">${escape(item.meta)}</span></li>`).join('')}</ul>
    </section>`;

/* A button at the end of each solution row opens a modular panel of its screens; each screen opens in the viewer. */
const screensBlock = s => `<div class="pc-screens-block" data-shot-group>
              <button type="button" class="pc-expand" data-expand aria-expanded="false" aria-controls="pc-screens-${s.id}">
                <span class="pc-expand-icon" aria-hidden="true">${icons.plus}</span>
                <span class="pc-expand-text"><span data-expand-label data-open="${ui.hideScreens}" data-closed="${ui.viewScreens}">${ui.viewScreens}</span><span class="sr-only">: ${escape(s.name)}</span></span>
                <span class="pc-expand-count" aria-hidden="true">${pad(s.screens.length)} ${ui.screens.toLowerCase()}</span>
              </button>
              <div class="pc-screens" id="pc-screens-${s.id}" data-expand-panel role="region" aria-label="${escape(s.name)} ${ui.screens.toLowerCase()}">
                <ul class="pc-shots">${s.screens.map((screen, index) => `
                  <li class="pc-shot-cell" style="--i:${index}">${S.screenFigure(s, screen, index, 'pc-shot')}</li>`).join('')}
                  <li class="pc-shots-note" style="--i:${s.screens.length}"><b>${pad(s.screens.length)}</b><span>${ui.screensHint}</span></li>
                </ul>
              </div>
            </div>`;

const spec = (s, index) => `<details class="pc-spec" id="spec-${s.id}" style="--tone:${s.product.color}"${index === 0 ? ' open' : ''}>
          <summary><span class="pc-label">${pad(index + 1)}</span><span class="pc-spec-name">${escape(s.name)}</span><span class="pc-spec-tagline">${escape(s.tagline)}</span><span class="pc-spec-toggle" aria-hidden="true">${icons.plus}</span></summary>
          <div class="pc-spec-body">
            <p class="pc-spec-summary">${escape(s.summary)}</p>
            <div class="pc-spec-cols">
              <div><h4>${ui.problem}</h4><p>${escape(s.problem)}</p></div>
              <div><h4>${ui.how}</h4><ol class="pc-steps">${s.how.map(step => `<li>${escape(step)}</li>`).join('')}</ol></div>
              <div><h4 id="spec-${s.id}-architecture">${ui.architecture}</h4><p>${escape(s.architecture)}</p></div>
              <div><h4>${ui.integrations}</h4><ul class="pc-bullets">${s.integrations.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div>
            </div>
            <div class="pc-spec-dev">
              <div><h4>${ui.apis}</h4><ul class="pc-apis">${s.apis.map(api => `<li><code>${escape(api)}</code></li>`).join('')}</ul>${s.product.destination ? `<a class="pc-btn pc-btn-line pc-btn-sm" href="${escape(s.product.destination)}">${ui.readCasesReference}${icons.arrowRight}</a>` : ''}</div>
              ${S.codeBlock(s.code, 'pc-code')}
            </div>
            ${screensBlock(s)}
          </div>
        </details>`;

/* §02: the product cards, then under the hood, one row per solution. */
const suite = () => `<section class="pc-section pc-suite" id="products" aria-labelledby="pc-suite-title" tabindex="-1">
      ${sectionHead(sectionNumber('products'), 'pc-suite-title', c.suite.label, c.suite.title, c.suite.intro)}
      <div class="pc-grid">${solutions.map((s, index) => `<article class="pc-product" style="--tone:${s.product.color};--i:${index}" aria-labelledby="pc-product-${s.id}" data-reveal>
          <div class="pc-product-band"><span class="pc-label">${pad(index + 1)}</span>${S.productIcon(s.product, 40)}</div>
          <div class="pc-product-body">
            <h3 class="pc-product-logo" id="pc-product-${s.id}">${S.themedLogo(s.product)}</h3>
            <p class="pc-label pc-product-tagline">${escape(s.tagline)}</p>
            <p class="pc-product-action">${escape(s.action)}</p>
            <ul class="pc-product-stack" aria-label="${ui.stack}">${s.stack.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
          </div>
          <a class="pc-product-link" href="#spec-${s.id}">${ui.learnMore}<span class="sr-only"> about ${escape(s.name)}</span>${icons.arrowDown}</a>
          <a class="pc-product-link" href="${escape(detailsHref(s))}">${ui.details}<span class="sr-only"> for ${escape(s.name)}</span>${icons.arrowRight}</a>
        </article>`).join('')}</div>
      <section class="pc-sub" id="specs" aria-labelledby="pc-specs-title" tabindex="-1">
        <header class="pc-head pc-subhead" data-reveal>
          <p class="pc-head-label"><span class="pc-head-no">${sectionNumber('products')}</span><span data-scramble>${escape(c.suite.specsLabel)}</span></p>
          <h3 class="pc-display" id="pc-specs-title">${words(c.suite.specsTitle)}</h3>
          <p class="pc-head-intro">${escape(c.suite.specsIntro)}</p>
        </header>
        <div class="pc-spec-list">${solutions.map(spec).join('')}</div>
      </section>
    </section>`;

const services = () => `<section class="pc-section pc-services" id="services" aria-labelledby="pc-services-title" tabindex="-1">
      ${sectionHead(sectionNumber('services'), 'pc-services-title', c.services.label, c.services.title, c.services.intro)}
      <ol class="pc-service-list">${c.services.items.map((item, index) => `<li class="pc-service" data-reveal style="--i:${index}"><span class="pc-service-no" aria-hidden="true">${pad(index + 1)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></li>`).join('')}</ol>
    </section>`;

const faq = () => `<section class="pc-section pc-faq" id="faq" aria-labelledby="pc-faq-title" tabindex="-1">
      ${sectionHead(sectionNumber('faq'), 'pc-faq-title', c.faq.label, c.faq.title)}
      <dl class="pc-qa">${c.faq.items.map((item, index) => `<div data-reveal style="--i:${index % 2}"><dt><span class="pc-label">Q${index + 1}</span>${escape(item.q)}</dt><dd>${escape(item.a)}</dd></div>`).join('')}</dl>
    </section>`;

const contact = () => `<section class="pc-contact" id="contact" aria-labelledby="pc-contact-title" tabindex="-1">
      <div class="pc-contact-inner" data-reveal>
        <h2 class="pc-display" id="pc-contact-title">${words(c.contact.title)}</h2>
        <div class="pc-contact-row">
          <p>${escape(c.contact.text)}</p>
          <div class="pc-hero-actions">${S.demoButton('pc-btn pc-btn-ink', c.contact.button, 'data-magnetic')}<a class="pc-btn pc-btn-ink-line" href="cases-reference.html" data-magnetic>${ui.readCasesReference}</a></div>
        </div>
      </div>
    </section>`;

const footer = () => `<footer class="pc-footer">
    <a class="pc-footer-cell pc-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pc-wordmark')}<span aria-hidden="true">Platform</span></a>
    <nav class="pc-footer-cell" aria-label="Footer"><h2 class="pc-label">${ui.nav.platform}</h2><ul>${sections.map(section => `<li><a href="#${section.id}">${escape(section.label)}</a></li>`).join('')}</ul></nav>
    <div class="pc-footer-cell"><h2 class="pc-label">${ui.productsHeading}</h2><ul>${solutions.map(s => `<li><a href="#spec-${s.id}">${escape(s.name)}</a></li>`).join('')}</ul></div>
    <div class="pc-footer-cell"><h2 class="pc-label">${ui.resources}</h2><ul><li><a href="cases-reference.html">${ui.casesReference}</a></li><li>${S.external(c.footer.github, 'GitHub')}</li></ul></div>
    <p class="pc-footer-note">${escape(c.footer.note)}</p>
  </footer>`;

module.exports = function renderProposalC() {
  return `${S.head({
    id: 'c',
    title: 'INDICE Platform — Proposal C · Modular',
    description: c.hero.lede,
    defaultTheme: 'dark',
    themeColor: '#0b0b0a',
    mono: true,
    screens: true,
    stylesheet: 'css/proposals/proposal-c.css'
  })}
<body class="pc">
  <a class="skip-link" href="#main">Skip to content</a>
  ${S.designRibbon('proposal-c')}
  ${bar()}
  <main id="main" tabindex="-1">
    ${hero()}
    ${marquee()}
    ${platform()}
    ${suite()}
    ${services()}
    ${faq()}
    ${contact()}
  </main>
  ${footer()}
  ${S.githubTab('pc-gh')}
  ${S.backToTop('pc-to-top', `<span class="pc-to-top-arrows" aria-hidden="true">${icons.arrowUp}${icons.arrowUp}</span>`)}
  ${S.lightbox('pc-lightbox')}
  <div class="pc-cursor" data-cursor aria-hidden="true"></div>
</body>
</html>
`;
};
