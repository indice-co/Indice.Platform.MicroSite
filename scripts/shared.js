const fs = require('node:fs');
const path = require('node:path');
const { copy, products, config } = globalThis.INDICE_DATA;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const down = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.5"/></svg>';
const headerGithub = '<a class="header-github" href="https://github.com/indice-co/Indice.Platform" aria-label="INDICE Platform on GitHub"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18a4.63 4.63 0 0 1 1.24 3.22c0 4.6-2.8 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg></a>';
const demo = (classes = '') => `<button class="button demo-button ${classes}" type="button" data-demo>${copy.navigation.demo}${arrow}</button>`;
const logo = (product, cls = '') => {
  const svg = fs.readFileSync(path.join(__dirname, '..', product.logo), 'utf8');
  const [, width, height] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return `<img class="product-logo ${cls}" src="${escape(product.logo)}" width="${width}" height="${height}" alt="${escape(product.name)}" loading="lazy" decoding="async">`;
};
function navigation(homeBase = config.homeBase) {
  const sectionLink = p => `<a href="${homeBase}#${p.id}" data-pillar="${p.id}">${p.label}</a>`;
  return `<nav class="header-nav" id="site-nav" aria-label="Main navigation">
    <div class="desktop-nav-links">${sectionLink(copy.hero.pillars[0])}<button id="products-trigger" type="button" aria-controls="products-panel" aria-expanded="false" data-pillar="products">${copy.navigation.products}<svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true"><path d="m3 5 3 3 3-3" stroke="currentColor" stroke-width="1.3"/></svg></button>${sectionLink(copy.hero.pillars[2])}</div>
    <button class="mobile-menu-trigger" id="menu-trigger" type="button" aria-controls="products-panel" aria-expanded="false">${copy.navigation.menu}<span aria-hidden="true">+</span></button>
    ${headerGithub}
    <div class="products-panel" id="products-panel" role="region" aria-label="${escape(copy.navigation.products)}" hidden>
      <div class="panel-section-links" aria-label="Sections">${copy.hero.pillars.map(sectionLink).join('')}</div>
      <div class="panel-heading"><span>Suite Solutions</span></div>
      <div class="panel-product-grid">${products.map(p => p.destination
    ? `<a class="panel-product" href="${escape(p.destination)}"${homeBase && p.id === 'cases' ? ' aria-current="page"' : ''}>${logo(p)}<p>${p.tagline}</p></a>`
    : `<div class="panel-product">${logo(p)}<p>${p.tagline}</p></div>`).join('')}</div>
      <a class="text-link panel-explore" id="panel-explore-all" href="${homeBase}#products">${copy.navigation.exploreAll}${down}</a>
    </div>
  </nav>`;
}
const designs = [
  { id: 'original', href: 'index.html', label: 'Original' },
  { id: 'terminal', href: 'terminal.html', label: 'Terminal' },
  { id: 'blueprint', href: 'blueprint.html', label: 'Blueprint' }
];
const designRibbon = active => `<nav class="design-ribbon" aria-label="Design versions">
  <span class="design-ribbon-title">Design preview</span>
  <ul>${designs.map((design, index) => `<li><a href="${design.href}"${design.id === active ? ' aria-current="page"' : ''}><span class="design-ribbon-index" aria-hidden="true">${index + 1}</span>${design.label}</a></li>`).join('')}</ul>
</nav>`;

/* Placeholder UI-screenshot carousel. Static markup is a scroll-snap strip; js/carousel.js adds the controls. */
const screenshotCarousel = product => {
  const slides = product.highlights.slice(0, 3).map(([title]) => title);
  const name = escape(product.name);
  return `<section class="shots" data-carousel aria-roledescription="carousel" aria-label="${name} UI screenshots (placeholders)">
        <ul class="shots-track" tabindex="0" aria-label="${name} screenshot slides">${slides.map((title, index) => `<li class="shot" id="shots-${product.id}-${index + 1}" aria-roledescription="slide" aria-label="${index + 1} of ${slides.length}">
          <figure>
            <div class="shot-frame" role="img" aria-label="${name} UI screenshot placeholder: ${escape(title)}. Awaiting approved asset.">
              <span class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><em>${escape(product.id)}.example.com</em></span>
              <span class="shot-body" aria-hidden="true"><b>UI screenshot</b><small>placeholder · 1600 × 900</small></span>
            </div>
            <figcaption><span class="shot-no">${String(index + 1).padStart(2, '0')}</span>${name} · ${escape(title)}</figcaption>
          </figure>
        </li>`).join('')}</ul>
      </section>`;
};
module.exports = { escape, arrow, down, headerGithub, demo, logo, navigation, designs, designRibbon, screenshotCarousel };
