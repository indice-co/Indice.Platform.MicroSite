'use strict';

/* Helpers shared by the three homepage proposals. Each proposal owns its layout, navigation and styles; these
   helpers keep the head, theme handling, logos, screens, the screen viewer and Proposal A's slider consistent. */
const fs = require('node:fs');
const path = require('node:path');
require('../../js/data.js');
const { products, copy: data, config } = globalThis.INDICE_DATA;
const { escape, logo, designRibbon } = require('../shared.js');
const { renderShowcase, casesWorkflowScreen, casesRecordScreen } = require('../showcase-markup.js');
const { highlight } = require('../highlight.js');
const content = require('./content.js');

const root = path.join(__dirname, '..', '..');
const themeKey = id => `indice-proposal-${id}-theme`;
const byId = Object.fromEntries(products.map(product => [product.id, product]));
const solutions = content.solutions.map(solution => ({ ...solution, product: byId[solution.id] }));
const ui = content.ui;

/* Dark-theme product logos: the supplied artwork with its two neutral wordmark colours lightened. */
const darkLogoColours = [['#1C1A33', '#F4F4F6'], ['#777685', '#A9A8B8']];
const darkLogoPath = product => `assets/logos/on-dark/${product.id}-logo.svg`;
function renderDarkLogos() {
  const directory = path.join(root, 'assets', 'logos', 'on-dark');
  fs.mkdirSync(directory, { recursive: true });
  for (const product of products) {
    let svg = fs.readFileSync(path.join(root, product.logo), 'utf8');
    for (const [from, to] of darkLogoColours) svg = svg.replace(new RegExp(from, 'gi'), to);
    fs.writeFileSync(path.join(root, darkLogoPath(product)), svg, 'utf8');
  }
}
const themedLogo = (product, cls = '') => logo(product, `logo-on-light ${cls}`.trim())
  + logo(product, `logo-on-dark ${cls}`.trim()).replace(`src="${escape(product.logo)}"`, `src="${escape(darkLogoPath(product))}"`);

const productIcon = (product, size = 32) =>
  `<img class="product-icon" src="assets/logos/${escape(product.id)} icon.svg" width="${size}" height="${size}" alt="" decoding="async">`;

/* The INDICE wordmark geometry from the supplied logo, drawn in the current text colour. */
const wordmarkPath = fs.readFileSync(path.join(root, config.logo), 'utf8').match(/<path d="([^"]+)"/)[1];
const wordmark = (cls = 'wordmark') =>
  `<svg class="${cls}" viewBox="0 70 1180 252" role="img" aria-label="INDICE"><path fill="currentColor" d="${wordmarkPath}"/></svg>`;

const techIcons = data.technologies.items.map(item => ({
  id: item.name,
  label: content.technologies.labels[item.name] || item.name,
  icon: item.icon
}));
const techIcon = (item, cls = 'tech-icon') =>
  `<span class="${cls}" style="-webkit-mask-image:url('${escape(item.icon)}');mask-image:url('${escape(item.icon)}')" aria-hidden="true"></span>`;

/* Words wrapped for staggered heading animations; the text and its spaces stay intact for assistive technology. */
const splitWords = (text, cls = 'word', start = 0) => escape(text).split(' ')
  .map((word, index) => `<span class="${cls}" style="--w:${start + index}"><span>${word}</span></span>`).join(' ');

const icons = {
  sun: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.6A8.5 8.5 0 0 1 9.4 4a8.5 8.5 0 1 0 10.6 10.6Z"/></svg>',
  arrowRight: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
  arrowLeft: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 10H4M9 5l-5 5 5 5"/></svg>',
  arrowDown: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12M5 11l5 5 5-5"/></svg>',
  arrowUp: '<svg class="icon-arrow" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 16V4M5 9l5-5 5 5"/></svg>',
  arrowUpRight: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 14 14 6M7 6h7v7"/></svg>',
  chevron: '<svg class="icon-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  plus: '<svg class="icon-plus" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
  expand: '<svg class="icon-expand" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3H3v4M13 3h4v4M7 17H3v-4M13 17h4v-4"/></svg>',
  github: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>'
};

function codeBlock(code, cls = 'code') {
  const lines = highlight(code.language, code.source).split('\n').map((line, index) => `<span class="code-line" style="--l:${index}">${line || ' '}</span>`).join('\n');
  return `<figure class="${cls}" data-reveal><figcaption><span>${escape(code.file)}</span><span>${code.language === 'jsonc' ? 'JSON' : 'C#'}</span></figcaption><pre tabindex="0" aria-label="${escape(code.file)} excerpt"><code>${lines}</code></pre></figure>`;
}

const external = (href, label, cls = '') =>
  `<a${cls ? ` class="${cls}"` : ''} href="${escape(href)}" rel="noopener" target="_blank">${label}<span class="sr-only"> (opens in a new tab)</span></a>`;
const demoButton = (cls, label = content.hero.secondary, attributes = '') =>
  `<button type="button" class="${cls}" data-demo${attributes ? ` ${attributes}` : ''}>${escape(label)}</button>`;

/* Where "technical details" links go: the Cases reference page, or the solution's section on the homepage. */
const detailsHref = solution => solution.product.destination || `#spec-${solution.id}`;

/* ---------- Screens: approved screenshot, illustrative mock-up or labelled placeholder ---------- */
const mocks = { workflow: casesWorkflowScreen, record: casesRecordScreen };
const shotMedia = screen => {
  if (screen.image) {
    return `<span class="shot-media"><img src="${escape(screen.image)}" width="1920" height="1080" alt="${escape(screen.alt)}" loading="lazy" decoding="async"></span>`;
  }
  if (screen.mock) {
    return `<div class="shot-media"><span class="shot-badge">${ui.illustrative}</span>${mocks[screen.mock]}</div>`;
  }
  return `<span class="shot-media"><span class="shot-placeholder" role="img" aria-label="${escape(screen.title)}: ${ui.screenPending.toLowerCase()}"><span class="ph-bar" aria-hidden="true"><i></i><i></i></span><span class="ph-side" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ph-main" aria-hidden="true"><span class="ph-row"><i></i><i></i><i></i></span><i class="ph-panel"></i></span><span class="ph-label" aria-hidden="true">${ui.screenPending}</span></span></span>`;
};
/* A figure with a full-cover button that opens the screen viewer. */
const screenFigure = (solution, screen, index, cls) => `<figure class="${cls}" data-shot data-title="${escape(screen.title)}" data-text="${escape(screen.text)}" style="--i:${index}">
            ${shotMedia(screen)}
            <figcaption><b>${escape(screen.title)}</b><span>${escape(screen.text)}</span></figcaption>
            <button type="button" class="shot-open" data-shot-open aria-label="Enlarge ${escape(solution.name)} screen: ${escape(screen.title)}"></button>
          </figure>`;

const lightbox = cls => `<dialog class="lightbox ${cls}" id="screen-viewer" aria-label="${ui.screens}" data-lightbox>
    <div class="lightbox-inner">
      <div class="lightbox-bar"><span class="lightbox-count" data-lightbox-count></span><button type="button" class="lightbox-button" data-dialog-close>${icons.close}<span class="sr-only">${ui.closeViewer}</span></button></div>
      <div class="lightbox-stage">
        <button type="button" class="lightbox-button lightbox-nav lightbox-prev" data-lightbox-step="-1">${icons.arrowLeft}<span class="sr-only">${ui.previousScreen}</span></button>
        <figure class="lightbox-figure" data-lightbox-figure></figure>
        <button type="button" class="lightbox-button lightbox-nav lightbox-next" data-lightbox-step="1">${icons.arrowRight}<span class="sr-only">${ui.nextScreen}</span></button>
      </div>
      <p class="lightbox-caption" data-lightbox-caption aria-live="polite"></p>
    </div>
  </dialog>`;

const backToTop = (cls, inner = icons.arrowUp) =>
  `<a class="to-top ${cls}" href="#hero" data-to-top aria-label="${ui.backToTop}">${inner}</a>`;

/* A GitHub tab fixed to the right edge of the window (a round button above back to top on phones). */
const githubTab = cls => external(content.footer.github,
  `${icons.github}<span class="gh-tab-text"><b>GitHub</b> <span>indice-co</span></span>`, `gh-tab ${cls}`);

const showcase = () => renderShowcase({
  products,
  copy: { chapters: content.slider.chapters, cases: content.slider.cases, unavailable: content.slider.unavailable },
  logo: product => themedLogo(product)
});

/* Runs before first paint: this proposal's stored choice, otherwise its default theme. */
const themeBootstrap = (id, defaultTheme) => `<script>(function(){var d=document.documentElement,t;try{t=localStorage.getItem('${themeKey(id)}')}catch(e){}if(t!=='light'&&t!=='dark')t='${defaultTheme}';d.setAttribute('data-theme',t);d.classList.add('js')})()</script>`;

function head({ id, title, description, defaultTheme, themeColor, mono = false, slider = false, screens = false, stylesheet }) {
  return `<!doctype html>
<html lang="en" data-proposal="${id}" data-default-theme="${defaultTheme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="${defaultTheme === 'dark' ? 'dark light' : 'light dark'}">
  <meta name="theme-color" content="${themeColor}">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)}</title>
  ${themeBootstrap(id, defaultTheme)}
  <link rel="icon" type="image/svg+xml" href="${escape(config.logoIcon)}">
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>${mono ? `
  <link rel="preload" href="assets/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin>` : ''}
  <link rel="stylesheet" href="css/design-ribbon.css">
  <link rel="stylesheet" href="css/proposals/common.css">${slider ? `
  <link rel="stylesheet" href="css/proposals/showcase.css">
  <link rel="stylesheet" href="css/proposals/showcase-theme.css">` : ''}${screens ? `
  <link rel="stylesheet" href="css/proposals/screens.css">` : ''}
  <link rel="stylesheet" href="${stylesheet}">
  <script defer src="js/data.js"></script>${slider ? `
  <script defer src="js/showcase.js"></script>` : ''}
  <script defer src="js/proposals/common.js"></script>
</head>`;
}

module.exports = {
  content, solutions, products, techIcons, icons, escape, designRibbon, showcase, head, wordmark, themedLogo,
  productIcon, techIcon, codeBlock, external, demoButton, detailsHref, renderDarkLogos, darkLogoPath, themeKey,
  splitWords, shotMedia, screenFigure, lightbox, backToTop, githubTab
};
