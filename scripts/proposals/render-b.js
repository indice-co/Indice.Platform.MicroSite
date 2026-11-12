'use strict';

/* Proposal B — "Editorial": a long-form, light-first concept set in Manrope (light display weights, bold labels,
   orange accents). A static masthead with a full-screen Contents dialog and reading progress, numbered chapters,
   and field-guide solution entries inside §02. Each entry closes with a library of screens that scrolls towards the
   pointer and opens screens in a viewer. No Solutions slider. */
const S = require('./shared.js');
const { content: c, solutions, escape, icons } = S;
const ui = c.ui;
const pad = number => String(number).padStart(2, '0');

const chapters = [
  { id: 'platform', title: c.platform.label, text: c.platform.title },
  { id: 'products', title: c.suite.label, text: c.suite.title },
  { id: 'services', title: c.services.label, text: c.services.title },
  { id: 'faq', title: c.faq.label, text: c.faq.title },
  { id: 'contact', title: ui.contactLabel, text: c.contact.title }
];
const chapterNumber = id => pad(chapters.findIndex(chapter => chapter.id === id) + 1);
const entryNumber = index => `${chapterNumber('products')}.${index + 1}`;
// "Technical details": the Cases reference page, or the Architecture part of the solution's entry.
const detailsHref = s => s.product.destination || `#spec-${s.id}-architecture`;

/* Words that rise into place; `accent` lists word positions set in the accent colour. */
const words = (text, accent = []) => escape(text).split(' ')
  .map((word, index) => `<span class="pb-w" style="--w:${index}"><span${accent.includes(index) ? ' class="pb-accent"' : ''}>${word}</span></span>`).join(' ');
const lastWord = text => [text.split(' ').length - 1];

const toc = cls => `<ol class="${cls}">${chapters.map((chapter, index) => `<li style="--i:${index}">
          <a href="#${chapter.id}"><span class="pb-toc-no">${pad(index + 1)}</span><span class="pb-toc-title">${escape(chapter.title)}</span><span class="pb-toc-text">${escape(chapter.text)}</span></a>${chapter.id === 'products' ? `
          <ul class="pb-toc-sub">${solutions.map((s, i) => `<li><a href="#spec-${s.id}"><span>${entryNumber(i)}</span> ${escape(s.name)}</a></li>`).join('')}</ul>` : ''}
        </li>`).join('')}</ol>`;

const masthead = () => `<header class="pb-masthead">
    <a class="pb-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
    <p class="pb-masthead-note">${escape(ui.mastheadNote)}</p>
    <div class="pb-masthead-actions">
      <div class="pb-theme" role="group" aria-label="${ui.themeGroup}">
        <button type="button" data-theme-set="light" aria-pressed="true">${icons.sun}<span>${ui.themeLight}</span></button>
        <button type="button" data-theme-set="dark" aria-pressed="false">${icons.moon}<span>${ui.themeDark}</span></button>
      </div>
      <a class="pb-contents-button" href="#contents" data-dialog-open="pb-contents" aria-haspopup="dialog">${ui.nav.contents}${icons.menu}</a>
    </div>
  </header>
  <dialog class="pb-dialog" id="pb-contents" aria-labelledby="pb-contents-title">
    <div class="pb-dialog-inner">
      <div class="pb-dialog-head">
        <h2 id="pb-contents-title">${ui.nav.contents}</h2>
        <button type="button" class="pb-dialog-close" data-dialog-close>${icons.close}<span class="sr-only">${ui.closeContents}</span></button>
      </div>
      ${toc('pb-toc')}
    </div>
  </dialog>`;

const chapterHead = (id, headingId, title) => `<header class="pb-chapter-head" data-reveal>
        <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber(id)}</span>${escape(chapters.find(chapter => chapter.id === id).title)}</p>
        <h2 id="${headingId}">${words(title)}</h2>
      </header>`;

const hero = () => `<section class="pb-hero" id="hero" aria-labelledby="pb-hero-title" tabindex="-1">
      <div class="pb-hero-main">
        <p class="pb-kicker">${escape(c.hero.eyebrow)}</p>
        <h1 id="pb-hero-title">${words(c.hero.title, [0])}</h1>
        <p class="pb-lede">${escape(c.hero.lede)}</p>
        <div class="pb-actions">
          <a class="pb-btn pb-btn-solid" href="#products">${escape(c.hero.primary)}${icons.arrowDown}</a>
          ${S.demoButton('pb-btn pb-btn-line')}
        </div>
      </div>
      <aside class="pb-glance" aria-labelledby="pb-glance-title">
        <h2 id="pb-glance-title">${ui.facts}</h2>
        <dl>
          ${c.hero.audience.map(item => `<div><dt>For ${escape(item.role.toLowerCase())}</dt><dd>${escape(item.text)}</dd></div>`).join('\n          ')}
          ${c.hero.facts.map(fact => `<div class="pb-glance-fact"><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('\n          ')}
        </dl>
      </aside>
      <ol class="pb-index" aria-label="${ui.nav.solutions}">${solutions.map((s, index) => `<li style="--i:${index}"><a href="#spec-${s.id}" style="--tone:${s.product.color}"><span class="pb-index-no">${entryNumber(index)}</span><span class="pb-index-name">${escape(s.name)}</span><span class="pb-index-text">${escape(s.action)}</span></a></li>`).join('')}</ol>
    </section>`;

const platform = () => `<section class="pb-chapter pb-platform" id="platform" aria-labelledby="pb-platform-title" tabindex="-1">
      ${chapterHead('platform', 'pb-platform-title', c.platform.title)}
      <div class="pb-platform-body">
        <p class="pb-standfirst" data-reveal>${escape(c.platform.intro)}</p>
        <ol class="pb-points">${c.platform.items.map((item, index) => `<li data-reveal style="--i:${index % 2}"><span class="pb-point-no">${pad(index + 1)}</span><div><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p><span class="pb-point-meta">${escape(item.meta)}</span></div></li>`).join('')}</ol>
      </div>
    </section>`;

/* A library of screens under each entry: the strip scrolls towards the pointer (data-hover-scroll), the arrows page
   through it, and every screen opens in the viewer with the rest of this solution's screens. */
const gallery = s => `<div class="pb-gallery" data-gallery data-shot-group data-reveal>
          <div class="pb-gallery-head">
            <h5 class="pb-gallery-title" id="pb-gallery-${s.id}">${ui.screens}<span> · ${escape(s.name)}</span></h5>
            <p class="pb-gallery-hint">${ui.galleryHint}</p>
            <div class="pb-gallery-nav">
              <button type="button" class="pb-gallery-step" data-scroll-step="-1" aria-controls="pb-strip-${s.id}">${icons.arrowLeft}<span class="sr-only">${ui.scrollBack}: ${escape(s.name)}</span></button>
              <button type="button" class="pb-gallery-step" data-scroll-step="1" aria-controls="pb-strip-${s.id}">${icons.arrowRight}<span class="sr-only">${ui.scrollForward}: ${escape(s.name)}</span></button>
            </div>
          </div>
          <div class="pb-strip-wrap">
            <ul class="pb-strip" id="pb-strip-${s.id}" data-hover-scroll aria-labelledby="pb-gallery-${s.id}">${s.screens.map((screen, index) => `
              <li class="pb-strip-item" style="--i:${index}">${S.screenFigure(s, screen, index, 'pb-shot')}</li>`).join('')}
            </ul>
          </div>
          <div class="pb-gallery-progress" aria-hidden="true"><span></span></div>
        </div>`;

/* The aside and body share their own grid, so the sticky aside stops before the full-width screen library. */
const entry = (s, index) => `<article class="pb-entry" id="spec-${s.id}" aria-labelledby="pb-entry-${s.id}" style="--tone:${s.product.color}" tabindex="-1" data-scrub>
        <div class="pb-entry-main">
        <aside class="pb-entry-aside">
          <span class="pb-entry-meter" aria-hidden="true"></span>
          <p class="pb-entry-no">${entryNumber(index)}</p>
          <div class="pb-entry-logo">${S.themedLogo(s.product)}</div>
          <h4 id="pb-entry-${s.id}">${escape(s.name)}</h4>
          <p class="pb-entry-tagline">${escape(s.tagline)}</p>
          <h5>${ui.apis}</h5>
          <ul class="pb-entry-apis">${s.apis.map(api => `<li><code>${escape(api)}</code></li>`).join('')}</ul>
          <h5>${ui.stack}</h5>
          <ul class="pb-entry-stack">${s.stack.map(item => `<li>${escape(item)}</li>`).join('')}</ul>${s.product.destination ? `
          <a class="pb-entry-link" href="${escape(s.product.destination)}">${ui.readCasesReference}${icons.arrowRight}</a>` : ''}
        </aside>
        <div class="pb-entry-body">
          <p class="pb-entry-summary" data-reveal>${escape(s.summary)}</p>
          <h5>${ui.problem}</h5>
          <p class="pb-entry-problem">${escape(s.problem)}</p>
          <h5>${ui.how}</h5>
          <ol class="pb-entry-steps">${s.how.map((step, i) => `<li style="--i:${i}">${escape(step)}</li>`).join('')}</ol>
          <h5 id="spec-${s.id}-architecture">${ui.architecture}</h5>
          <p>${escape(s.architecture)}</p>
          <h5>${ui.integrations}</h5>
          <ul class="pb-entry-integrations">${s.integrations.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
          <h5>${ui.code}</h5>
          ${S.codeBlock(s.code, 'pb-code')}
        </div>
        </div>
        ${gallery(s)}
      </article>`;

/* Plate I: an orbital illustration of the platform. The core, a turning ring of foundation technologies, and an outer
   orbit with one node per solution plus an open slot for the next. Positions come from the solution list. */
const plateArt = () => {
  const orbit = 205;
  const nodes = [...solutions, null];
  const at = (radius, index, count, offset = -90) => {
    const angle = (index * 360 / count + offset) * Math.PI / 180;
    return [radius * Math.cos(angle), radius * Math.sin(angle)].map(value => value.toFixed(1));
  };
  const spokes = nodes.map((s, index) => {
    const [x1, y1] = at(70, index, nodes.length);
    const [x2, y2] = at(orbit - 40, index, nodes.length);
    return `<line class="pb-spoke${s ? '' : ' pb-spoke-ghost'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  const nodeMarks = nodes.map((s, index) => {
    const [x, y] = at(orbit, index, nodes.length);
    const body = s
      ? `<circle class="pb-node-disc" r="34"/><image href="assets/logos/${escape(s.id)} icon.svg" x="-18" y="-18" width="36" height="36"/><text class="pb-node-name" y="58">${escape(s.name)}</text>`
      : '<circle class="pb-node-ghost" r="34"/><path class="pb-node-plus" d="M-9 0h18M0-9v18"/>';
    return `<g transform="translate(${x} ${y})"><g class="pb-node-spin"><g class="pb-node" style="--i:${index}${s ? `;--tone:${s.product.color}` : ''}">${body}</g></g></g>`;
  }).join('');
  const chips = ui.foundationStack.map((label, index) => {
    const [x, y] = at(112, index, ui.foundationStack.length, -54);
    return `<g transform="translate(${x} ${y})"><g class="pb-chip-spin"><circle class="pb-chip-dot" r="4"/><text class="pb-chip" y="-11">${escape(label)}</text></g></g>`;
  }).join('');
  return `<svg class="pb-plate-svg" viewBox="-300 -300 600 600" aria-hidden="true" focusable="false">
            <circle class="pb-ticks" r="288" pathLength="360"/>
            <circle class="pb-ring pb-ring-dashed" r="268"/>
            <circle class="pb-ring" r="${orbit}"/>
            <circle class="pb-ring pb-ring-dotted" r="112"/>
            <g class="pb-orbit">${spokes}${nodeMarks}</g>
            <g class="pb-foundation">${chips}</g>
            <circle class="pb-core-halo" r="84"/>
            <circle class="pb-core" r="66"/>
            <text class="pb-core-text" y="-3">${escape(c.plate.core[0])}</text>
            <text class="pb-core-text pb-core-sub" y="17">${escape(c.plate.core[1])}</text>
          </svg>`;
};

const plate = () => `<figure class="pb-plate" data-reveal>
      <div class="pb-plate-inner">
        <figcaption class="pb-plate-caption">
          <p class="pb-plate-label">${escape(c.plate.label)}</p>
          <p class="pb-plate-title">${escape(c.plate.title)}</p>
          <p class="pb-plate-text">${escape(c.plate.text)}</p>
          <ul class="pb-plate-legend">${solutions.map(s => `<li style="--tone:${s.product.color}">${escape(s.name)}</li>`).join('')}</ul>
        </figcaption>
        <div class="pb-plate-art" data-parallax="-0.06">
          ${plateArt()}
        </div>
      </div>
    </figure>`;

/* §02 holds the solution cards and, below them, how each solution works. */
const suite = () => `<section class="pb-chapter pb-suite" id="products" aria-labelledby="pb-suite-title" tabindex="-1">
      ${chapterHead('products', 'pb-suite-title', c.suite.title)}
      <p class="pb-standfirst pb-suite-intro" data-reveal>${escape(c.suite.intro)}</p>
      <div class="pb-cards">${solutions.map((s, index) => `<article class="pb-card" style="--tone:${s.product.color};--i:${index}" aria-labelledby="pb-card-${s.id}" data-reveal>
          <p class="pb-card-fig">Fig. ${entryNumber(index)}</p>
          <h3 class="pb-card-logo" id="pb-card-${s.id}">${S.themedLogo(s.product)}</h3>
          <p class="pb-card-tagline">${escape(s.tagline)}</p>
          <p class="pb-card-action">${escape(s.action)}</p>
          <p class="pb-card-stack">${s.stack.map(escape).join(' · ')}</p>
          <div class="pb-card-links">
            <a href="#spec-${s.id}">${ui.learnMore}${icons.arrowDown}<span class="sr-only"> about ${escape(s.name)}</span></a>
            <a href="${escape(detailsHref(s))}">${ui.details}${icons.arrowRight}<span class="sr-only"> for ${escape(s.name)}</span></a>
          </div>
        </article>`).join('')}</div>
      <section class="pb-guide" id="specs" aria-labelledby="pb-guide-title" tabindex="-1">
        <header class="pb-guide-head" data-reveal>
          <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber('products')}</span>${escape(c.suite.specsLabel)}</p>
          <h3 class="pb-guide-title" id="pb-guide-title">${words(c.suite.specsTitle)}</h3>
          <p class="pb-standfirst">${escape(c.suite.specsIntro)}</p>
        </header>
        ${solutions.map(entry).join('\n        ')}
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

/* A ticker of the solution names that runs faster, or backwards, with the scroll (data-velocity). Decorative. */
const tickerWords = [...solutions.map(s => s.name), ...ui.sticker];
const tickerRun = () => tickerWords.map(word => `<span>${escape(word)}</span><i></i>`).join('');
const ticker = () => `<div class="pb-ticker" aria-hidden="true"><div class="pb-ticker-track" data-velocity><div>${tickerRun()}</div><div>${tickerRun()}</div></div></div>`;

const contact = () => `<section class="pb-contact" id="contact" aria-labelledby="pb-contact-title" tabindex="-1">
      <div class="pb-sun" aria-hidden="true" data-parallax="-0.22"><i></i></div>
      <div class="pb-contact-inner" data-reveal>
        <p class="pb-chapter-label"><span class="pb-chapter-no">§ ${chapterNumber('contact')}</span>${ui.contactLabel}</p>
        <h2 id="pb-contact-title">${words(c.contact.title, lastWord(c.contact.title))}</h2>
        <p>${escape(c.contact.text)}</p>
        <div class="pb-actions">${S.demoButton('pb-btn pb-btn-solid', c.contact.button)}<a class="pb-btn pb-btn-line" href="cases-reference.html">${ui.readCasesReference}</a></div>
      </div>
    </section>`;

const colophon = () => `<footer class="pb-colophon">
    <nav class="pb-colophon-toc" id="contents" aria-label="${ui.nav.contents}">
      <h2>${ui.nav.contents}</h2>
      ${toc('pb-toc pb-toc-compact')}
    </nav>
    <div class="pb-colophon-meta">
      <a class="pb-brand" href="#hero" aria-label="INDICE Platform, back to top">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
      <h2>${ui.colophon}</h2>
      <p>${escape(ui.colophonText)}</p>
      <p>${escape(c.footer.note)}</p>
      <ul><li><a href="cases-reference.html">${ui.casesReference}</a></li><li>${S.external(c.footer.github, 'GitHub')}</li></ul>
    </div>
  </footer>`;

module.exports = function renderProposalB() {
  return `${S.head({
    id: 'b',
    title: 'INDICE Platform — Proposal B · Editorial',
    description: c.hero.lede,
    defaultTheme: 'light',
    themeColor: '#f6f7f9',
    mono: true,
    screens: true,
    stylesheet: 'css/proposals/proposal-b.css'
  })}
<body class="pb">
  <a class="skip-link" href="#main">Skip to content</a>
  ${S.designRibbon('proposal-b')}
  <div class="pb-progress" data-progress aria-hidden="true"></div>
  ${masthead()}
  <main id="main" tabindex="-1">
    ${hero()}
    ${platform()}
    ${plate()}
    ${suite()}
    ${services()}
    ${faq()}
    ${ticker()}
    ${contact()}
  </main>
  ${colophon()}
  ${S.githubTab('pb-gh')}
  ${S.backToTop('pb-to-top', `${icons.arrowUp}<span aria-hidden="true">${ui.backToTop}</span>`)}
  ${S.lightbox('pb-lightbox')}
</body>
</html>
`;
};
