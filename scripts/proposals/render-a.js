'use strict';

/* Proposal A — "Graphite": a developer-platform concept in Manrope. A sticky translucent bar with a Solutions menu,
   a page-wide dot pattern with layout rails, a hero with parallax depth and an architecture map, a bento foundation
   grid, a full-width row of product cards that hands over to the Solutions slider, tabbed specs with code and a
   full-bleed closing band. Light by default. */
const S = require('./shared.js');
const { content: c, solutions, products, escape, icons } = S;
const ui = c.ui;
const pad = number => String(number).padStart(2, '0');

const [titleLead, titleRest] = (() => {
  const index = c.hero.title.indexOf(' for ');
  return index > 0 ? [c.hero.title.slice(0, index + 4), c.hero.title.slice(index + 5)] : ['', c.hero.title];
})();

// Product colours for the slider's glow, one custom property per product.
const tones = products.map(product => `--tone-${product.id}:${product.color}`).join(';');

const solutionLinks = cls => solutions.map(s => `<li><a class="${cls}" href="#product-${s.id}" data-product-link="${s.id}">${S.productIcon(s.product, 32)}<span><b>${escape(s.name)}</b><small>${escape(s.tagline)}</small></span></a></li>`).join('');

const header = () => `<header class="pa-header">
    <div class="pa-header-inner">
      <a class="pa-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pa-wordmark')}<span class="pa-brand-name" aria-hidden="true">Platform</span></a>
      <nav class="pa-nav" aria-label="Main navigation">
        <ul class="pa-nav-list">
          <li><a href="#platform">${ui.nav.platform}</a></li>
          <li class="pa-nav-solutions">
            <a href="#products">${ui.nav.solutions}</a><button type="button" class="pa-nav-more" aria-expanded="false" aria-controls="pa-solutions-menu" data-menu-toggle><span class="sr-only">Show the solutions menu</span>${icons.chevron}</button>
            <div class="pa-mega" id="pa-solutions-menu" hidden>
              <ul class="pa-mega-list">${solutionLinks('pa-mega-item')}</ul>
              <a class="pa-mega-foot" href="cases-reference.html">${ui.readCasesReference}${icons.arrowRight}</a>
            </div>
          </li>
          <li><a href="#specs">${ui.nav.specs}</a></li>
          <li><a href="#services">${ui.nav.services}</a></li>
          <li><a href="#faq">${ui.nav.faq}</a></li>
        </ul>
      </nav>
      <div class="pa-actions">
        ${S.external(c.footer.github, `${icons.github}<span class="sr-only">${ui.github}</span>`, 'pa-icon-button pa-github')}
        <button type="button" class="pa-icon-button pa-theme" data-theme-toggle aria-pressed="false" aria-label="${ui.themeToggle}">${icons.sun}${icons.moon}</button>
        ${S.demoButton('pa-btn pa-btn-solid pa-btn-sm pa-header-demo')}
        <button type="button" class="pa-icon-button pa-menu-button" aria-expanded="false" aria-controls="pa-mobile-menu" data-menu-toggle><span class="sr-only">${ui.nav.menu}</span>${icons.menu}</button>
      </div>
    </div>
    <div class="pa-mobile" id="pa-mobile-menu" hidden>
      <ul class="pa-mobile-links">
        <li><a href="#platform">${ui.nav.platform}</a></li>
        <li><a href="#products">${ui.nav.solutions}</a></li>
        <li><a href="#specs">${ui.nav.specs}</a></li>
        <li><a href="#services">${ui.nav.services}</a></li>
        <li><a href="#faq">${ui.nav.faq}</a></li>
      </ul>
      <ul class="pa-mobile-solutions">${solutionLinks('pa-mega-item')}</ul>
      ${S.demoButton('pa-btn pa-btn-solid')}
    </div>
  </header>`;

const hero = () => `<section class="pa-hero" id="hero" aria-labelledby="pa-hero-title" tabindex="-1" data-spotlight>
      <div class="pa-aurora" aria-hidden="true" data-parallax="0.32"><i></i><i></i><i></i><i></i></div>
      <div class="pa-grid-bg" aria-hidden="true" data-parallax="0.16"><div class="pa-grid-glow"></div></div>
      <div class="pa-hero-copy">
        <p class="pa-badge"><span class="pa-badge-dot" aria-hidden="true"></span>${escape(c.hero.eyebrow)}</p>
        <h1 id="pa-hero-title"><span class="pa-title-lead">${S.splitWords(titleLead, 'pa-w')}</span> <span class="pa-gradient-text">${escape(titleRest)}</span></h1>
        <p class="pa-lede">${escape(c.hero.lede)}</p>
        <div class="pa-cta-row">
          <a class="pa-btn pa-btn-solid pa-btn-lg pa-btn-down" href="#products" data-magnetic>${escape(c.hero.primary)}${icons.arrowDown}</a>
        </div>
      </div>
      <figure class="pa-map" aria-labelledby="pa-map-caption">
        <figcaption class="pa-map-caption" id="pa-map-caption"><span class="pa-label">${ui.infrastructure}</span><span>${escape(ui.mapCaption)}</span></figcaption>
        <ul class="pa-map-products">${solutions.map((s, index) => `<li style="--i:${index};--tone:${s.product.color}"><a class="pa-map-card" href="#product-${s.id}" data-product-link="${s.id}" data-spotlight>
          <span class="pa-map-head">${S.productIcon(s.product, 28)}<b>${escape(s.name)}</b></span>
          <span class="pa-map-action">${escape(s.action)}</span>
          <code class="pa-map-api">${escape(s.apis[0])}</code>
        </a></li>`).join('')}</ul>
        <div class="pa-map-foundation"><span class="pa-label">${ui.foundation}</span><ul>${ui.foundationStack.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div>
      </figure>
      <div class="pa-hero-meta">
        <ul class="pa-audience" aria-label="${ui.audience}">${c.hero.audience.map(item => `<li><span class="pa-label">${escape(item.role)}</span><p>${escape(item.text)}</p></li>`).join('')}</ul>
        <dl class="pa-facts">${c.hero.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('')}</dl>
      </div>
    </section>`;

const techList = hidden => `<ul class="pa-tech-list"${hidden ? ' aria-hidden="true"' : ''}>${S.techIcons.map(item => `<li>${S.techIcon(item, 'pa-tech-icon')}<span>${escape(item.label)}</span></li>`).join('')}</ul>`;
const tech = () => `<section class="pa-tech" aria-labelledby="pa-tech-title">
      <h2 class="pa-tech-title" id="pa-tech-title">${escape(c.technologies.title)}</h2>
      <div class="pa-marquee"><div class="pa-marquee-track" data-velocity>${techList(false)}${techList(true)}</div></div>
    </section>`;

const sectionHead = (id, label, title, intro) => `<header class="pa-section-head" data-reveal>
        <p class="pa-eyebrow">${escape(label)}</p>
        <h2 id="${id}">${S.splitWords(title, 'pa-w')}</h2>
        ${intro ? `<p class="pa-section-intro">${escape(intro)}</p>` : ''}
      </header>`;

const platform = () => `<section class="pa-section pa-platform" id="platform" aria-labelledby="pa-platform-title" tabindex="-1">
      ${sectionHead('pa-platform-title', c.platform.label, c.platform.title, c.platform.intro)}
      <ul class="pa-bento">${c.platform.items.map((item, index) => `<li class="pa-bento-card pa-bento-${item.id}" data-reveal data-spotlight style="--i:${index}">
          <span class="pa-label">${escape(item.meta)}</span>
          <h3>${escape(item.title)}</h3>
          <p>${escape(item.text)}</p>${item.id === 'libraries' ? `
          <ul class="pa-packages" aria-label="Example packages">${ui.packages.map(name => `<li><code>${escape(name)}</code></li>`).join('')}</ul>` : ''}
        </li>`).join('')}</ul>
    </section>`;

/* Full-width row of product cards. js/showcase.js fades #products .product-grid as the slider panel arrives. */
const suite = () => `<section class="pa-section pa-suite" id="products" aria-labelledby="pa-suite-title" tabindex="-1">
      <div class="pa-wrap">${sectionHead('pa-suite-title', c.suite.label, c.suite.title, c.suite.intro)}</div>
      <ul class="product-grid pa-product-grid">${solutions.map((s, index) => `<li class="pa-tile-cell" data-reveal style="--i:${index}">
        <article class="pa-tile" style="--tone:${s.product.color}" aria-labelledby="pa-tile-${s.id}" data-tilt="3" data-spotlight>
          <img class="pa-tile-mark" src="assets/logos/${escape(s.id)} icon.svg" width="160" height="160" alt="" loading="lazy" decoding="async">
          <div class="pa-tile-top"><h3 class="pa-tile-logo" id="pa-tile-${s.id}">${S.themedLogo(s.product)}</h3><span class="pa-label">${pad(index + 1)}</span></div>
          <p class="pa-tile-tagline">${escape(s.tagline)}</p>
          <p class="pa-tile-action">${escape(s.action)}</p>
          <ul class="pa-chips" aria-label="${ui.stack}">${s.stack.slice(0, 3).map(item => `<li>${escape(item)}</li>`).join('')}</ul>
          <div class="pa-tile-links">
            <a href="#product-${s.id}" data-product-link="${s.id}">${ui.learnMore}${icons.arrowDown}<span class="sr-only"> about ${escape(s.name)}</span></a>
            <a href="${escape(S.detailsHref(s))}">${ui.details}${icons.arrowRight}<span class="sr-only"> for ${escape(s.name)}</span></a>
          </div>
        </article>
      </li>`).join('')}</ul>
    </section>`;

const specs = () => `<section class="pa-section pa-specs" id="specs" aria-labelledby="pa-specs-title" tabindex="-1">
      ${sectionHead('pa-specs-title', c.suite.specsLabel, c.suite.specsTitle, c.suite.specsIntro)}
      <div class="pa-specs-body" data-tabs>
        <div class="pa-tablist" role="tablist" aria-label="Solutions" aria-orientation="vertical">${solutions.map((s, index) => `<button type="button" class="pa-tab" role="tab" id="pa-tab-${s.id}" aria-controls="spec-${s.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" style="--tone:${s.product.color}">${S.productIcon(s.product, 30)}<span><b>${escape(s.name)}</b><small>${escape(s.tagline)}</small></span></button>`).join('')}</div>
        <div class="pa-panels">${solutions.map(s => `<article class="pa-spec" id="spec-${s.id}" role="tabpanel" aria-labelledby="pa-tab-${s.id}" tabindex="0" style="--tone:${s.product.color}">
          <h3 class="pa-spec-title">${escape(s.name)}<span>${escape(s.tagline)}</span></h3>
          <p class="pa-spec-summary">${escape(s.summary)}</p>
          <div class="pa-spec-grid">
            <div>
              <h4>${ui.problem}</h4><p>${escape(s.problem)}</p>
              <h4>${ui.how}</h4><ol class="pa-steps">${s.how.map(step => `<li>${escape(step)}</li>`).join('')}</ol>
            </div>
            <div>
              <h4>${ui.architecture}</h4><p>${escape(s.architecture)}</p>
              <h4>${ui.integrations}</h4><ul class="pa-checks">${s.integrations.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
            </div>
          </div>
          <div class="pa-spec-dev">
            <div><h4>${ui.apis}</h4><ul class="pa-apis">${s.apis.map(api => `<li><code>${escape(api)}</code></li>`).join('')}</ul>${s.product.destination ? `<a class="pa-link" href="${escape(s.product.destination)}">${ui.readCasesReference}${icons.arrowRight}</a>` : ''}</div>
            ${S.codeBlock(s.code, 'pa-code')}
          </div>
        </article>`).join('')}</div>
      </div>
    </section>`;

const services = () => `<section class="pa-section pa-services" id="services" aria-labelledby="pa-services-title" tabindex="-1">
      ${sectionHead('pa-services-title', c.services.label, c.services.title, c.services.intro)}
      <ol class="pa-service-list">${c.services.items.map((item, index) => `<li class="pa-service" data-reveal data-spotlight style="--i:${index}"><span class="pa-service-index">${pad(index + 1)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></li>`).join('')}</ol>
    </section>`;

const faq = () => `<section class="pa-section pa-faq" id="faq" aria-labelledby="pa-faq-title" tabindex="-1">
      ${sectionHead('pa-faq-title', c.faq.label, c.faq.title)}
      <div class="pa-faq-list">${c.faq.items.map(item => `<details class="pa-faq-item"><summary>${escape(item.q)}${icons.plus}</summary><p>${escape(item.a)}</p></details>`).join('')}</div>
    </section>`;

/* Full-bleed closing band: perspective floor, aurora and rings move at different speeds while it scrolls past. */
const contact = () => `<section class="pa-contact" id="contact" aria-labelledby="pa-contact-title" tabindex="-1" data-spotlight>
      <div class="pa-band-bg" aria-hidden="true">
        <div class="pa-aurora pa-band-aurora" data-parallax="-0.14"><i></i><i></i><i></i><i></i></div>
        <div class="pa-band-floor" data-parallax="0.22"></div>
        <div class="pa-band-rings" data-parallax="0.1"><i></i><i></i><i></i></div>
      </div>
      <div class="pa-contact-inner" data-reveal>
        <p class="pa-eyebrow">${ui.contactLabel}</p>
        <h2 id="pa-contact-title">${S.splitWords(c.contact.title, 'pa-w')}</h2>
        <p>${escape(c.contact.text)}</p>
        <div class="pa-cta-row">${S.demoButton('pa-btn pa-btn-solid pa-btn-lg', c.contact.button, 'data-magnetic')}<a class="pa-btn pa-btn-ghost pa-btn-lg" href="cases-reference.html" data-magnetic>${ui.readCasesReference}</a></div>
      </div>
    </section>`;

const footer = () => `<footer class="pa-footer">
    <div class="pa-footer-top">
      <a class="pa-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pa-wordmark')}<span class="pa-brand-name" aria-hidden="true">Platform</span></a>
      <nav class="pa-footer-nav" aria-label="Footer">
        <div><h2>${ui.nav.platform}</h2><ul><li><a href="#platform">${escape(c.platform.label)}</a></li><li><a href="#specs">${ui.nav.specs}</a></li><li><a href="#services">${ui.nav.services}</a></li><li><a href="#faq">${ui.nav.faq}</a></li></ul></div>
        <div><h2>${ui.productsHeading}</h2><ul>${solutions.map(s => `<li><a href="#product-${s.id}" data-product-link="${s.id}">${escape(s.name)}</a></li>`).join('')}</ul></div>
        <div><h2>${ui.resources}</h2><ul><li><a href="cases-reference.html">${ui.casesReference}</a></li><li>${S.external(c.footer.github, 'GitHub')}</li></ul></div>
      </nav>
    </div>
    <p class="pa-footer-note">${escape(c.footer.note)}</p>
    <div class="pa-footer-mark" aria-hidden="true">${S.wordmark('pa-footer-wordmark')}</div>
  </footer>`;

const toTopRing = `<svg class="pa-ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="pa-ring-track" cx="24" cy="24" r="22"/><circle class="pa-ring-value" cx="24" cy="24" r="22" pathLength="100"/></svg>${icons.arrowUp}`;

module.exports = function renderProposalA() {
  return `${S.head({
    id: 'a',
    title: 'INDICE Platform — Proposal A · Graphite',
    description: c.hero.lede,
    defaultTheme: 'light',
    themeColor: '#ffffff',
    mono: true,
    slider: true,
    stylesheet: 'css/proposals/proposal-a.css'
  })}
<body class="pa" style="${tones}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${S.designRibbon('proposal-a')}
  <div class="pa-backdrop" aria-hidden="true"></div>
  ${header()}
  <main id="main" tabindex="-1">
    ${hero()}
    ${tech()}
    ${platform()}
    ${suite()}
    <a class="skip-showcase" href="#specs">${ui.skipShowcase}</a>
    ${S.showcase()}
    ${specs()}
    ${services()}
    ${faq()}
    ${contact()}
  </main>
  ${footer()}
  ${S.backToTop('pa-to-top', toTopRing)}
</body>
</html>
`;
};
