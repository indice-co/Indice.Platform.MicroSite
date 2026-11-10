const fs = require('node:fs');
const path = require('node:path');
const { copy, products, config } = globalThis.INDICE_DATA;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const down = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.5"/></svg>';
const demo = (classes = '') => `<button class="button demo-button ${classes}" type="button" data-demo>${copy.navigation.demo}${arrow}</button>`;
const logo = (product, cls = '') => {
  const svg = fs.readFileSync(path.join(__dirname, '..', product.logo), 'utf8');
  const [, width, height] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return `<img class="product-logo ${cls}" src="${escape(product.logo)}" width="${width}" height="${height}" alt="${escape(product.name)}" loading="lazy" decoding="async">`;
};
function navigation(homeBase = config.homeBase) {
  const sectionLink = p => `<a href="${homeBase}#${p.id}" data-pillar="${p.id}">${p.label}</a>`;
  return `<nav class="floating-nav" id="site-nav" aria-label="Main navigation">
    <div class="products-panel" id="products-panel" role="region" aria-label="${escape(copy.navigation.products)}" hidden>
      <div class="panel-section-links" aria-label="Sections">${copy.hero.pillars.map(sectionLink).join('')}</div>
      <div class="panel-heading"><span>Suite Solutions</span></div>
      <div class="panel-product-grid">${products.map(p => p.destination
    ? `<a class="panel-product" href="${escape(p.destination)}"${homeBase && p.id === 'cases' ? ' aria-current="page"' : ''}>${logo(p)}<p>${p.tagline}</p></a>`
    : `<div class="panel-product">${logo(p)}<p>${p.tagline}</p></div>`).join('')}</div>
      <a class="text-link panel-explore" id="panel-explore-all" href="${homeBase}#products">${copy.navigation.exploreAll}${down}</a>
    </div>
    <div class="desktop-nav-links">${sectionLink(copy.hero.pillars[0])}<button id="products-trigger" type="button" aria-controls="products-panel" aria-expanded="false" data-pillar="products">${copy.navigation.products}<svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true"><path d="m3 7 3-3 3 3" stroke="currentColor" stroke-width="1.3"/></svg></button>${sectionLink(copy.hero.pillars[2])}</div>
    <button class="mobile-menu-trigger" id="menu-trigger" type="button" aria-controls="products-panel" aria-expanded="false">${copy.navigation.menu}<span aria-hidden="true">+</span></button>
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
module.exports = { escape, arrow, down, demo, logo, navigation, designs, designRibbon };
