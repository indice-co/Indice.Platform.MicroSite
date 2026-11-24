'use strict';

/* Helpers shared by the two pages (index.html and cases-reference.html): the head, theme handling, logos, icons,
   screens, the screen viewer and the fixed page controls. */
const fs = require('node:fs');
const path = require('node:path');
const content = require('./content.js');

const { site, products, ui } = content;
const root = path.join(__dirname, '..');
const themeKey = 'indice-platform-theme';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

/* ---------- Product logos ---------- */
const logo = (product, cls = '', src = product.logo) => {
  const svg = fs.readFileSync(path.join(root, product.logo), 'utf8');
  const [, width, height] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return `<img class="product-logo ${cls}" src="${escape(src)}" width="${width}" height="${height}" alt="${escape(product.name)}" loading="lazy" decoding="async">`;
};

/* Dark-theme logos are generated from the supplied artwork: the neutral wordmark colours are lightened (Dex draws its
   wordmark in #1D1F25 rather than the shared #1C1A33), but the icon and the "UI" letters keep their colours, so the
   Workers gear and the letters inside each coloured badge stay dark. In the supplied artwork the icon is drawn in
   the first 30px, the badge is the path that starts at y 2.2202 and the two paths after it are the letters U and I. */
const darkLogoColours = [['#1C1A33', '#F4F4F6'], ['#1D1F25', '#F4F4F6'], ['#777685', '#A9A8B8']];
const darkLogoPath = product => `assets/logos/on-dark/${product.id}-logo.svg`;
function darkLogo(product) {
  let keep = 0;
  return fs.readFileSync(path.join(root, product.logo), 'utf8').replace(/<path\b[^>]*>/g, tag => {
    if (keep > 0) { keep -= 1; return tag; }
    if (Number(tag.match(/\sd="M([\d.]+)/)?.[1]) < 30) return tag;
    if (/\sd="M[\d.]+ 2\.2202\d*H/.test(tag)) keep = 2;
    return darkLogoColours.reduce((svg, [from, to]) => svg.replace(new RegExp(from, 'gi'), to), tag);
  });
}
function renderDarkLogos() {
  fs.mkdirSync(path.join(root, 'assets', 'logos', 'on-dark'), { recursive: true });
  for (const product of products) fs.writeFileSync(path.join(root, darkLogoPath(product)), darkLogo(product), 'utf8');
}
const themedLogo = product => logo(product, 'logo-on-light') + logo(product, 'logo-on-dark', darkLogoPath(product));

/* The INDICE wordmark geometry from the supplied logo, drawn in the current text colour. */
const wordmarkPath = fs.readFileSync(path.join(root, site.logo), 'utf8').match(/<path d="([^"]+)"/)[1];
const wordmark = (cls = 'wordmark') =>
  `<svg class="${cls}" viewBox="0 70 1180 252" role="img" aria-label="INDICE"><path fill="currentColor" d="${wordmarkPath}"/></svg>`;

const icons = {
  sun: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.6A8.5 8.5 0 0 1 9.4 4a8.5 8.5 0 1 0 10.6 10.6Z"/></svg>',
  arrowRight: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
  arrowLeft: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 10H4M9 5l-5 5 5 5"/></svg>',
  arrowDown: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12M5 11l5 5 5-5"/></svg>',
  arrowUp: '<svg class="icon-arrow" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 16V4M5 9l5-5 5 5"/></svg>',
  arrowUpRight: '<svg class="icon-arrow" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 14 14 6M7 6h7v7"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  github: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>'
};

const external = (href, label, cls = '') =>
  `<a${cls ? ` class="${cls}"` : ''} href="${escape(href)}" rel="noopener" target="_blank">${label}<span class="sr-only"> (opens in a new tab)</span></a>`;
/* Demo buttons are deliberately unwired for now (see js/common.js). */
const demoButton = (cls, label = content.hero.secondary) =>
  `<button type="button" class="${cls}" data-demo>${escape(label)}</button>`;

/* ---------- Screens: a supplied screenshot, or a labelled placeholder while one is pending ---------- */
const shotMedia = screen => screen.image
  ? `<span class="shot-media"><img src="${escape(screen.image)}" width="1920" height="1080" alt="${escape(screen.alt)}" loading="lazy" decoding="async"></span>`
  : `<span class="shot-media"><span class="shot-placeholder" role="img" aria-label="${escape(screen.title)}: ${ui.screenPending.toLowerCase()}"><span class="ph-bar" aria-hidden="true"><i></i><i></i></span><span class="ph-side" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ph-main" aria-hidden="true"><span class="ph-row"><i></i><i></i><i></i></span><i class="ph-panel"></i></span><span class="ph-label" aria-hidden="true">${ui.screenPending}</span></span></span>`;
/* A figure with a full-cover button that opens the screen viewer. */
const screenFigure = (product, screen, index, cls) => `<figure class="${cls}" data-shot data-title="${escape(screen.title)}" data-text="${escape(screen.text)}" style="--i:${index}">
            ${shotMedia(screen)}
            <figcaption><b>${escape(screen.title)}</b><span>${escape(screen.text)}</span></figcaption>
            <button type="button" class="shot-open" data-shot-open aria-label="Enlarge ${escape(product.name)} screen: ${escape(screen.title)}"></button>
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

const backToTop = cls =>
  `<a class="to-top ${cls}" href="#hero" data-to-top aria-label="${ui.backToTop}">${icons.arrowUp}<span aria-hidden="true">${ui.backToTop}</span></a>`;

/* A GitHub tab fixed to the right edge of the window (a round button above back to top on phones). */
const githubTab = cls => external(site.github,
  `${icons.github}<span class="gh-tab-text"><b>GitHub</b> <span>${escape(site.githubLabel)}</span></span>`, `gh-tab ${cls}`);

/* Runs before first paint: the visitor's stored choice, otherwise the default theme. */
const themeBootstrap = defaultTheme => `<script>(function(){var d=document.documentElement,t;try{t=localStorage.getItem('${themeKey}')}catch(e){}if(t!=='light'&&t!=='dark')t='${defaultTheme}';d.setAttribute('data-theme',t);d.classList.add('js')})()</script>`;

const defaultTheme = 'dark';
function head({ title, description, stylesheets = [], scripts = [] }) {
  return `<!doctype html>
<html lang="en" data-default-theme="${defaultTheme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="#0f1115">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)}</title>
  ${themeBootstrap(defaultTheme)}
  <link rel="icon" type="image/svg+xml" href="${escape(site.icon)}">
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin>
  ${['css/common.css', 'css/site.css', ...stylesheets].map(href => `<link rel="stylesheet" href="${href}">`).join('\n  ')}
  ${['js/common.js', ...scripts].map(src => `<script defer src="${src}"></script>`).join('\n  ')}
</head>`;
}

module.exports = {
  content, escape, icons, head, wordmark, themedLogo, darkLogo, darkLogoPath, renderDarkLogos, themeKey,
  external, demoButton, shotMedia, screenFigure, lightbox, backToTop, githubTab
};
