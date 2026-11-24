'use strict';

/* The homepage (index.html): a long-form, dark-first editorial page set in Manrope. A masthead with a full-screen
   Contents dialog and reading progress, then the three pillars as numbered chapters: 01 Platform Foundation,
   02 Platform Suite (product cards, then one entry per product ending in a library of screens) and 03 Platform
   Services, followed by Questions and Contact. All copy comes from scripts/content.js. */
const S = require('./shared.js');
const { escape, icons, content: c } = S;
const { site, products, ui } = c;
const pad = number => String(number).padStart(2, '0');

const chapters = [
  { id: 'platform', title: c.foundation.label, text: c.foundation.title },
  { id: 'products', title: c.suite.label, text: c.suite.title },
  { id: 'services', title: c.services.label, text: c.services.title },
  { id: 'faq', title: c.faq.label, text: c.faq.title },
  { id: 'contact', title: c.contact.label, text: c.contact.title }
];
const chapterNumber = id => pad(chapters.findIndex(chapter => chapter.id === id) + 1);
const entryNumber = index => `${chapterNumber('products')}.${index + 1}`;
// "Technical details" stays inert until that product has a technical reference page.
const detailsLink = p => p.destination
  ? `<a href="${escape(p.destination)}">${ui.details}${icons.arrowRight}<span class="sr-only"> for ${escape(p.name)}</span></a>`
  : `<span class="pb-link-disabled" role="link" aria-disabled="true">${ui.details}${icons.arrowRight}<span class="sr-only"> for ${escape(p.name)}</span></span>`;

/* Words that rise into place; `accent` lists word positions set in the accent colour. */
const words = (text, accent = []) => escape(text).split(' ')
  .map((word, index) => `<span class="pb-w" style="--w:${index}"><span${accent.includes(index) ? ' class="pb-accent"' : ''}>${word}</span></span>`).join(' ');
const lastWord = text => [text.split(' ').length - 1];

const toc = cls => `<ol class="${cls}">${chapters.map((chapter, index) => `<li style="--i:${index}">
          <a href="#${chapter.id}"><span class="pb-toc-no">${pad(index + 1)}</span><span class="pb-toc-title">${escape(chapter.title)}</span><span class="pb-toc-text">${escape(chapter.text)}</span></a>${chapter.id === 'products' ? `
          <ul class="pb-toc-sub">${products.map((p, i) => `<li><a href="#spec-${p.id}"><span>${entryNumber(i)}</span> ${escape(p.name)}</a></li>`).join('')}</ul>` : ''}
        </li>`).join('')}</ol>`;

const masthead = () => `<header class="pb-masthead">
    <a class="pb-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
    <p class="pb-masthead-note">${escape(ui.mastheadNote)}</p>
    <div class="pb-masthead-actions">
      <button type="button" class="pb-theme" data-theme-toggle aria-pressed="true" aria-label="${ui.themeToggle}">${icons.sun}${icons.moon}</button>
      <a class="pb-contents-button" href="#contents" data-dialog-open="pb-contents" aria-haspopup="dialog">${ui.contents}${icons.menu}</a>
    </div>
  </header>
  <dialog class="pb-dialog" id="pb-contents" aria-labelledby="pb-contents-title">
    <div class="pb-dialog-inner">
      <div class="pb-dialog-head">
        <h2 id="pb-contents-title">${ui.contents}</h2>
        <button type="button" class="pb-dialog-close" data-dialog-close>${icons.close}<span class="sr-only">${ui.closeContents}</span></button>
      </div>
      ${toc('pb-toc')}
    </div>
  </dialog>`;

const chapterHead = (id, headingId, title) => `<header class="pb-chapter-head" data-reveal>
        <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber(id)}</span>${escape(chapters.find(chapter => chapter.id === id).title)}</p>
        <h2 id="${headingId}">${words(title)}</h2>
      </header>`;

/* The hero states the offer, then hands over to the three pillars. */
const hero = () => `<section class="pb-hero" id="hero" aria-labelledby="pb-hero-title" tabindex="-1">
      <div class="pb-hero-main">
        <p class="pb-kicker">${escape(c.hero.eyebrow)}</p>
        <h1 id="pb-hero-title">${words(c.hero.title, [0])}</h1>
        <p class="pb-lede">${escape(c.hero.lede)}</p>
        <div class="pb-actions">
          <a class="pb-btn pb-btn-solid" href="#platform">${escape(c.hero.primary)}${icons.arrowDown}</a>
          ${S.demoButton('pb-btn pb-btn-line')}
        </div>
      </div>
      <aside class="pb-glance" aria-labelledby="pb-glance-title">
        <h2 id="pb-glance-title">${ui.facts}</h2>
        <dl>
          ${c.hero.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('\n          ')}
        </dl>
      </aside>
      <ol class="pb-index pb-pillars" aria-label="${ui.pillars}">${c.hero.pillars.map((pillar, index) => `<li style="--i:${index}"><a href="#${pillar.id}"><span class="pb-index-no">${pad(index + 1)}</span><span class="pb-index-name">${escape(pillar.name)}</span><span class="pb-index-role">${escape(pillar.role)}</span><span class="pb-index-text">${escape(pillar.text)}</span></a></li>`).join('')}</ol>
    </section>`;

/* §01: the two parts of the foundation and what it gives a team, then the practices the libraries carry. */
const foundation = () => `<section class="pb-chapter pb-platform" id="platform" aria-labelledby="pb-platform-title" tabindex="-1">
      ${chapterHead('platform', 'pb-platform-title', c.foundation.title)}
      <div class="pb-platform-body">
        <p class="pb-standfirst" data-reveal>${escape(c.foundation.intro)}</p>
        <ol class="pb-points">${c.foundation.items.map((item, index) => `<li data-reveal style="--i:${index % 2}"><span class="pb-point-no">${pad(index + 1)}</span><div><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p><span class="pb-point-meta">${escape(item.meta)}</span></div></li>`).join('')}</ol>
      </div>
      <section class="pb-practices" id="practices" aria-labelledby="pb-practices-title" tabindex="-1">
        <header class="pb-guide-head" data-reveal>
          <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber('platform')}</span>${escape(c.foundation.practices.label)}</p>
          <h3 class="pb-guide-title" id="pb-practices-title">${words(c.foundation.practices.title)}</h3>
          <p class="pb-standfirst">${escape(c.foundation.practices.intro)}</p>
        </header>
        <ul class="pb-practice-grid">${c.foundation.practices.groups.map((group, index) => `<li data-reveal style="--i:${index % 3}"><h4>${escape(group.title)}</h4><ul>${group.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul></li>`).join('')}</ul>
      </section>
    </section>`;

/* A library of screens under each entry: the strip scrolls towards the pointer (data-hover-scroll), the arrows page
   through it, and every screen opens in the viewer with the rest of this product's screens. */
const gallery = p => `<div class="pb-gallery" data-gallery data-shot-group data-reveal>
          <div class="pb-gallery-head">
            <div class="pb-gallery-heading">
              <h5 class="pb-gallery-title" id="pb-gallery-${p.id}">${ui.screens}<span> · ${escape(p.name)}</span></h5>
              <p class="pb-gallery-hint">${ui.galleryHint}</p>
            </div>
            <div class="pb-gallery-nav">
              <button type="button" class="pb-gallery-step" data-scroll-step="-1" aria-controls="pb-strip-${p.id}">${icons.arrowLeft}<span class="sr-only">${ui.scrollBack}: ${escape(p.name)}</span></button>
              <button type="button" class="pb-gallery-step" data-scroll-step="1" aria-controls="pb-strip-${p.id}">${icons.arrowRight}<span class="sr-only">${ui.scrollForward}: ${escape(p.name)}</span></button>
            </div>
          </div>
          <div class="pb-strip-wrap">
            <ul class="pb-strip" id="pb-strip-${p.id}" data-hover-scroll aria-labelledby="pb-gallery-${p.id}">${p.screens.map((screen, index) => `
              <li class="pb-strip-item" style="--i:${index}">${S.screenFigure(p, screen, index, 'pb-shot')}</li>`).join('')}
            </ul>
          </div>
          <div class="pb-gallery-progress" aria-hidden="true"><span></span></div>
        </div>`;

/* A partner called out inside an entry. The logo is a mask filled with the text colour, so it suits both themes. */
const partner = p => `
          <aside class="pb-partner" aria-label="${escape(p.label)}: ${escape(p.name)}" data-reveal>
            <p class="pb-partner-label">${escape(p.label)}</p>
            <span class="pb-partner-logo" role="img" aria-label="${escape(p.name)}" style="-webkit-mask-image:url('${escape(p.logo)}');mask-image:url('${escape(p.logo)}')"></span>
            <p class="pb-partner-text">${escape(p.text)}</p>
            ${S.external(p.href, `${escape(p.site)}${icons.arrowUpRight}`, 'pb-partner-link')}
          </aside>`;

/* One entry per product: what it does and its standout features. The aside and body share their own grid, so the
   sticky aside stops before the full-width screen library. */
const entry = (p, index) => `<article class="pb-entry" id="spec-${p.id}" aria-labelledby="pb-entry-${p.id}" style="--tone:${p.color}" tabindex="-1" data-scrub>
        <div class="pb-entry-main">
        <aside class="pb-entry-aside">
          <span class="pb-entry-meter" aria-hidden="true"></span>
          <p class="pb-entry-no">${entryNumber(index)}</p>
          <div class="pb-entry-logo">${S.themedLogo(p)}</div>
          <h4 id="pb-entry-${p.id}">${escape(p.name)}</h4>
          <p class="pb-entry-tagline">${escape(p.tagline)}</p>
          <h5>${ui.stack}</h5>
          <ul class="pb-entry-stack">${p.stack.map(item => `<li>${escape(item)}</li>`).join('')}</ul>${p.destination ? `
          <a class="pb-entry-link" href="${escape(p.destination)}">${ui.readCasesReference}${icons.arrowRight}</a>` : ''}
        </aside>
        <div class="pb-entry-body">
          <p class="pb-entry-summary" data-reveal>${escape(p.summary)}</p>${p.partner ? partner(p.partner) : ''}
          <h5>${ui.does}</h5>
          <ol class="pb-entry-steps">${p.does.map((step, i) => `<li style="--i:${i}">${escape(step)}</li>`).join('')}</ol>
          <h5>${ui.features}</h5>
          <ul class="pb-entry-features">${p.features.map(feature => `<li><b>${escape(feature.title)}</b><span>${escape(feature.text)}</span></li>`).join('')}</ul>
        </div>
        </div>
        ${gallery(p)}
      </article>`;

/* Plate I: an orbital illustration of the platform. The core, a turning ring of foundation technologies, and an outer
   orbit with one node per product plus an open slot for the next one. Positions come from the product list. */
const plateArt = () => {
  const orbit = 205;
  const nodes = [...products, null];
  const at = (radius, index, count, offset = -90) => {
    const angle = (index * 360 / count + offset) * Math.PI / 180;
    return [radius * Math.cos(angle), radius * Math.sin(angle)].map(value => value.toFixed(1));
  };
  const spokes = nodes.map((p, index) => {
    const [x1, y1] = at(70, index, nodes.length);
    const [x2, y2] = at(orbit - 40, index, nodes.length);
    return `<line class="pb-spoke${p ? '' : ' pb-spoke-ghost'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  const nodeMarks = nodes.map((p, index) => {
    const [x, y] = at(orbit, index, nodes.length);
    const body = p
      ? `<circle class="pb-node-disc" r="34"/><image href="${escape(p.icon)}" x="-18" y="-18" width="36" height="36"/><text class="pb-node-name" y="58">${escape(p.name)}</text>`
      : '<circle class="pb-node-ghost" r="34"/><path class="pb-node-plus" d="M-9 0h18M0-9v18"/>';
    return `<g transform="translate(${x} ${y})"><g class="pb-node-spin"><g class="pb-node" data-repel="12" style="--i:${index}${p ? `;--tone:${p.color}` : ''}">${body}</g></g></g>`;
  }).join('');
  const chips = c.plate.ring.map((label, index) => {
    const [x, y] = at(112, index, c.plate.ring.length, -54);
    return `<g transform="translate(${x} ${y})"><g class="pb-chip-spin"><g data-repel="9"><circle class="pb-chip-dot" r="4"/><text class="pb-chip" y="-11">${escape(label)}</text></g></g></g>`;
  }).join('');
  return `<svg class="pb-plate-svg" viewBox="-300 -300 600 600" aria-hidden="true" focusable="false" data-repel-area>
            <circle class="pb-ticks" r="288" pathLength="360" data-repel="4"/>
            <circle class="pb-ring pb-ring-dashed" r="268" data-repel="5"/>
            <circle class="pb-ring" r="${orbit}" data-repel="6"/>
            <circle class="pb-ring pb-ring-dotted" r="112" data-repel="7"/>
            <g class="pb-orbit">${spokes}${nodeMarks}</g>
            <g class="pb-foundation">${chips}</g>
            <circle class="pb-core-halo" r="84" data-repel="6"/>
            <g data-repel="9">
              <circle class="pb-core" r="66"/>
              <text class="pb-core-text" y="-3">${escape(c.plate.core[0])}</text>
              <text class="pb-core-text pb-core-sub" y="17">${escape(c.plate.core[1])}</text>
            </g>
          </svg>`;
};

const plate = () => `<figure class="pb-plate" data-reveal>
      <div class="pb-plate-inner">
        <figcaption class="pb-plate-caption">
          <p class="pb-plate-label">${escape(c.plate.label)}</p>
          <p class="pb-plate-title">${escape(c.plate.title)}</p>
          <p class="pb-plate-text">${escape(c.plate.text)}</p>
          <ul class="pb-plate-legend">${products.map(p => `<li style="--tone:${p.color}">${escape(p.name)}</li>`).join('')}</ul>
        </figcaption>
        <div class="pb-plate-art" data-parallax="-0.06">
          ${plateArt()}
        </div>
      </div>
    </figure>`;

/* §02 holds the product cards and, below them, what each product does. */
const suite = () => `<section class="pb-chapter pb-suite" id="products" aria-labelledby="pb-suite-title" tabindex="-1">
      ${chapterHead('products', 'pb-suite-title', c.suite.title)}
      <p class="pb-standfirst pb-suite-intro" data-reveal>${escape(c.suite.intro)}</p>
      <div class="pb-cards">${products.map((p, index) => `<article class="pb-card" style="--tone:${p.color};--i:${index}" aria-labelledby="pb-card-${p.id}" data-reveal>
          <p class="pb-card-fig">Fig. ${entryNumber(index)}</p>
          <h3 class="pb-card-logo" id="pb-card-${p.id}">${S.themedLogo(p)}</h3>
          <p class="pb-card-tagline">${escape(p.tagline)}</p>
          <p class="pb-card-action">${escape(p.action)}</p>
          <div class="pb-card-links">
            <a href="#spec-${p.id}">${ui.learnMore}${icons.arrowDown}<span class="sr-only"> about ${escape(p.name)}</span></a>
            ${detailsLink(p)}
          </div>
        </article>`).join('')}</div>
      <section class="pb-guide" id="specs" aria-labelledby="pb-guide-title" tabindex="-1">
        <header class="pb-guide-head" data-reveal>
          <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber('products')}</span>${escape(c.suite.guideLabel)}</p>
          <h3 class="pb-guide-title" id="pb-guide-title">${words(c.suite.guideTitle)}</h3>
          <p class="pb-standfirst">${escape(c.suite.guideIntro)}</p>
        </header>
        ${products.map(entry).join('\n        ')}
      </section>
    </section>`;

const services = () => `<section class="pb-chapter pb-services" id="services" aria-labelledby="pb-services-title" tabindex="-1">
      ${chapterHead('services', 'pb-services-title', c.services.title)}
      <p class="pb-standfirst" data-reveal>${escape(c.services.intro)}</p>
      <ol class="pb-service-list">${c.services.items.map((item, index) => `<li data-reveal style="--i:${index}"><span class="pb-service-no" aria-hidden="true">${pad(index + 1)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></li>`).join('')}</ol>
    </section>`;

const faq = () => `<section class="pb-chapter pb-faq" id="faq" aria-labelledby="pb-faq-title" tabindex="-1">
      ${chapterHead('faq', 'pb-faq-title', c.faq.title)}
      <dl class="pb-qa">${c.faq.items.map((item, index) => `<div data-reveal style="--i:${index % 2}"><dt>${escape(item.q)}</dt><dd>${escape(item.a)}</dd></div>`).join('')}</dl>
    </section>`;

/* A ticker of the product names that runs faster, or backwards, with the scroll (data-velocity). Decorative. */
const tickerWords = [...products.map(p => p.name), ...ui.ticker];
const tickerRun = () => tickerWords.map(word => `<span>${escape(word)}</span><i></i>`).join('');
const ticker = () => `<div class="pb-ticker" aria-hidden="true"><div class="pb-ticker-track" data-velocity><div>${tickerRun()}</div><div>${tickerRun()}</div></div></div>`;

const contact = () => `<section class="pb-contact" id="contact" aria-labelledby="pb-contact-title" tabindex="-1">
      <div class="pb-sun" aria-hidden="true" data-parallax="-0.22"><i></i></div>
      <div class="pb-contact-inner" data-reveal>
        <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber('contact')}</span>${escape(c.contact.label)}</p>
        <h2 id="pb-contact-title">${words(c.contact.title, lastWord(c.contact.title))}</h2>
        <p>${escape(c.contact.text)}</p>
        <div class="pb-actions">${S.demoButton('pb-btn pb-btn-solid', c.contact.button)}</div>
      </div>
    </section>`;

const colophon = () => `<footer class="pb-colophon">
    <nav class="pb-colophon-toc" id="contents" aria-label="${ui.contents}">
      <h2>${ui.contents}</h2>
      ${toc('pb-toc pb-toc-compact')}
    </nav>
    <div class="pb-colophon-meta">
      <a class="pb-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
      <h2>${ui.colophon}</h2>
      <p>${escape(c.footer.colophon)}</p>
      <p>${escape(c.footer.note)}</p>
      <ul><li>${S.external(site.github, 'GitHub')}</li></ul>
    </div>
  </footer>`;

module.exports = function renderHome() {
  return `${S.head({ title: site.title, description: c.hero.lede, scripts: ['js/plate.js'] })}
<body class="pb">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="pb-progress" data-progress aria-hidden="true"></div>
  ${masthead()}
  <main id="main" tabindex="-1">
    ${hero()}
    ${foundation()}
    ${plate()}
    ${suite()}
    ${services()}
    ${faq()}
    ${ticker()}
    ${contact()}
  </main>
  ${colophon()}
  ${S.githubTab('pb-gh')}
  ${S.backToTop('pb-to-top')}
  ${S.lightbox('pb-lightbox')}
</body>
</html>
`;
};
