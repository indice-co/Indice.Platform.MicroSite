/* Dependency-free pre-render: content is present without JavaScript. Run: node scripts/render.js */
const fs = require('node:fs');
const path = require('node:path');
require('../js/data.js');
const { copy: c, products, config } = globalThis.INDICE_DATA;
const { escape, arrow, down, demo, logo, navigation, designRibbon } = require('./shared.js');
const { renderShowcase } = require('./showcase-markup.js');
const diagonalDown = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5 19 19M5 19h14V5" stroke="currentColor" stroke-width="1.5"/></svg>';
const suiteProducts = ['cases', 'iam', 'messaging', 'risk'].map(id => products.find(product => product.id === id));
// Original slider copy for index.html; the homepage proposals pass their own (scripts/proposals/content.js).
const casesStory = {
  kicker: 'CASE MANAGEMENT / WORKFLOW PLATFORM',
  title: 'Operational workflows, engineered to evolve.',
  intro: 'Configure forms, approvals and APIs around how work moves, while keeping each decision traceable.',
  intake: { index: '01 / INTAKE', title: 'One record. Every entry point.', text: 'Customer applications and staff-assisted requests follow the same controlled process.', listTitle: 'Built for', list: ['Form-driven requests and applications.', 'Branch and call-centre assisted requests.', 'Approval-heavy operations with independent review.'] },
  workflow: { index: '02 / WORKFLOW', title: 'Shape the process. Coordinate decisions.', features: [
    { lead: 'Configure the work.', text: 'Set forms, workflow stages and available actions for each case type.' },
    { lead: 'Route with intent.', text: 'Move requests between teams and require independent approval where needed.' }
  ] },
  governance: { index: '03 / GOVERNANCE', title: 'Control and visibility.', lines: ['Track changes, comments and attachments in history and dashboards.', 'Customers see updates; roles and ownership checks keep reviews private.'], ownership: { lead: 'Build + operate.', text: 'Staff UI, workflow designer, APIs. You set processes, permissions and integrations; you run hosting, database, backups, upgrades and retention.' }, cta: 'Explore technical details' }
};
const showcase = renderShowcase({
  products,
  copy: { chapters: Object.fromEntries(products.map(p => [p.id, { title: p.title, description: p.description }])), cases: casesStory, unavailable: c.navigation.unavailable },
  logo
});
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
let contactSlashIndex = 0;
const contactSlashes = fs.readFileSync(path.join(__dirname, '../assets/logos/INDICE_slashes.svg'), 'utf8')
  .replace('<svg ', '<svg class="contact-slash" aria-hidden="true" ')
  .replace(/<path /g, () => `<path class="contact-slash-${contactSlashIndex++ === 0 ? 'second' : 'first'}" `)
  .replace(/ fill="white"/g, '');
// Diagram units: 600x480. Solution nodes link to the cloud edge; Workers and DEX keep a dot until their icons exist.
const heroCloud = 'M76.7 345A113 113 0 0 1 192.2 152.3A150 150 0 0 1 449.3 123A128 128 0 0 1 534.4 345Z';
const heroDiagram = `<svg class="hero-diagram" viewBox="0 0 600 480" preserveAspectRatio="xMaxYMid meet" fill="none" aria-hidden="true">
<g class="hero-coordinates"><text class="hero-coordinate" x="65" y="240">+</text><text class="hero-coordinate" x="520" y="60">+</text></g>
<g class="hero-layer hero-layer-expertise"><path class="hero-link" d="M40 110L130.2 181.6"/><path class="hero-link" d="M190 40L257.2 125.5"/><path class="hero-link" d="M410 36L368.4 112.4"/><path class="hero-link" d="M570 120L493.1 178.9"/><path class="hero-link" d="M575 330L518.4 324.3"/><path class="hero-link" d="M20 350L98.9 333.9"/><path class="hero-pulse" pathLength="1" d="M40 110L130.2 181.6" style="--pulse-delay:0s"/><path class="hero-pulse" pathLength="1" d="M190 40L257.2 125.5" style="--pulse-delay:.6s"/><path class="hero-pulse" pathLength="1" d="M410 36L368.4 112.4" style="--pulse-delay:1.2s"/><path class="hero-pulse" pathLength="1" d="M570 120L493.1 178.9" style="--pulse-delay:1.8s"/><path class="hero-pulse" pathLength="1" d="M575 330L518.4 324.3" style="--pulse-delay:2.4s"/><path class="hero-pulse" pathLength="1" d="M20 350L98.9 333.9" style="--pulse-delay:3s"/><g transform="translate(46.35 51.75) scale(.85)"><path class="hero-cloud" pathLength="1" d="${heroCloud}"/><path class="hero-cloud-trace" pathLength="1" d="${heroCloud}"/><path class="hero-cloud-trace" pathLength="1" d="${heroCloud}"/></g></g>
<g class="hero-layer hero-layer-foundation"><path class="hero-rail" pathLength="1" d="M40 416H560" style="--draw-delay:.2s"/><path class="hero-rail" pathLength="1" d="M530 436H70" style="--draw-delay:.35s"/><path class="hero-rail" pathLength="1" d="M100 456H500" style="--draw-delay:.5s"/><path class="hero-pulse" pathLength="1" d="M40 416H560" style="--pulse-delay:.6s"/><path class="hero-pulse" pathLength="1" d="M530 436H70" style="--pulse-delay:1.8s"/><path class="hero-pulse" pathLength="1" d="M100 456H500" style="--pulse-delay:3s"/><rect class="hero-rack" x="84" y="410" width="12" height="12" rx="2"/><rect class="hero-rack" x="249" y="410" width="12" height="12" rx="2"/><rect class="hero-rack" x="424" y="410" width="12" height="12" rx="2"/><rect class="hero-rack" x="504" y="410" width="12" height="12" rx="2"/></g>
<g class="hero-layer hero-layer-products"><g class="hero-node" data-solution="cases" style="--node-index:0"><circle class="hero-node-ring" cx="40" cy="110" r="30"/><image href="assets/logos/cases icon.svg" x="15" y="85" width="50" height="50"/></g><g class="hero-node" data-solution="iam" style="--node-index:1"><circle class="hero-node-ring" cx="190" cy="40" r="30"/><image href="assets/logos/iam icon.svg" x="165" y="15" width="50" height="50"/></g><g class="hero-node" data-solution="messaging" style="--node-index:2"><circle class="hero-node-ring" cx="410" cy="36" r="30"/><image href="assets/logos/messaging icon.svg" x="385" y="11" width="50" height="50"/></g><g class="hero-node" data-solution="risk" style="--node-index:3"><circle class="hero-node-ring" cx="570" cy="120" r="30"/><image href="assets/logos/risk icon.svg" x="545" y="95" width="50" height="50"/></g><g class="hero-node" data-solution="workers" style="--node-index:4"><circle class="hero-node-ring" cx="575" cy="330" r="18"/><circle class="hero-node-core" cx="575" cy="330" r="8"/></g><g class="hero-node" data-solution="dex" style="--node-index:5"><circle class="hero-node-ring" cx="20" cy="350" r="18"/><circle class="hero-node-core" cx="20" cy="350" r="8"/></g></g>
</svg>`;
const pillarGlyphs = {
  foundation: '<path d="M3 7h16M3 11h16M3 15h16"/>',
  products: '<rect x="3.5" y="3.5" width="6" height="6" rx="1.5"/><rect x="12.5" y="3.5" width="6" height="6" rx="1.5"/><rect x="3.5" y="12.5" width="6" height="6" rx="1.5"/><rect x="12.5" y="12.5" width="6" height="6" rx="1.5"/>',
  expertise: '<path d="M6.5 17.5h9.25a3.75 3.75 0 0 0 .55-7.46 5.25 5.25 0 0 0-10.1-.04A3.75 3.75 0 0 0 6.5 17.5Z"/>'
};
const pillarGlyph = id => `<svg class="pillar-glyph" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${pillarGlyphs[id]}</svg>`;
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#DEDAD0">
  <meta name="description" content="${escape(c.foundation.paragraphs[0])}">
  <title>INDICE Platform</title>
  <link rel="icon" type="image/svg+xml" href="${escape(config.logoIcon)}">
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="${escape(config.logoIcon)}" as="image">
  <link rel="preload" href="${escape(config.logoTop)}" as="image">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/design-ribbon.css">
  <script defer src="js/data.js"></script>
  <script defer src="js/main.js"></script>
  <script defer src="js/hero-art.js"></script>
  <script defer src="js/foundation-art.js"></script>
  <script defer src="js/contact.js"></script>
  <script defer src="js/showcase.js"></script>
</head>
<body>
  <a class="skip-link" href="#main-content">${c.navigation.skip}</a>
  ${designRibbon('original')}
  <a class="hero-brand" id="hero-brand" href="#hero" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" fetchpriority="high"></a>
  <main id="main-content" tabindex="-1">
    <section class="hero" id="hero" aria-labelledby="hero-title" tabindex="-1">
      <div class="hero-top"></div>
      <div class="hero-composition">
        <h1 id="hero-title">${escape(c.hero.title).replace(' ', ' <span>')}</span></h1>
        <div class="hero-art">
          ${heroDiagram}
        </div>
        <div class="hero-baseline"><p class="hero-motto">${c.hero.motto.replace('. ', '.<br>')}</p></div>
      </div>
      <div class="pillar-grid">${c.hero.pillars.map(p => `<a class="pillar" href="#${p.id}"><span class="pillar-label">${pillarGlyph(p.id)}${p.label}</span><span class="pillar-content"><span class="pillar-headline">${p.headline}</span>${diagonalDown}</span></a>`).join('')}</div>
    </section>

    <section class="technologies section-pad" id="technologies" aria-labelledby="technologies-title"><h2 id="technologies-title" data-reveal>${c.technologies.title}</h2><ul class="technology-list" aria-label="Technologies">${c.technologies.items.map((t,i) => `<li class="technology" data-reveal style="--reveal-index:${i}"><img src="${escape(t.icon)}" width="48" height="48" alt="" decoding="async"><span>${escape(t.name)}</span></li>`).join('')}</ul></section>

    <section class="foundation section-pad" id="foundation" aria-labelledby="foundation-title" tabindex="-1">
      <div class="section-top"><span class="eyebrow" data-reveal style="--reveal-index:0">${c.foundation.label}</span></div>
      <h2 class="display-heading foundation-heading" id="foundation-title" data-reveal style="--reveal-index:2">${c.foundation.title}</h2>
      <div class="foundation-layout">
        <div class="foundation-art" data-reveal style="--reveal-index:3">
          <div class="foundation-shapes" aria-hidden="true"><div class="foundation-plane plane-one art-piece" data-art-piece></div><div class="foundation-plane plane-two art-piece" data-art-piece></div><div class="foundation-plane plane-three art-piece" data-art-piece></div><div class="foundation-slash art-piece" data-art-piece></div><span class="art-coordinate coordinate-one art-piece" data-art-piece>+</span><span class="art-coordinate coordinate-two art-piece" data-art-piece>+</span></div>
        </div>
        <div class="foundation-text">${c.foundation.paragraphs.map((p,i) => `<p data-reveal style="--reveal-index:${4+i}">${p}</p>`).join('')}<div class="foundation-details">${c.foundation.items.map((item,i) => `<div><h3 data-reveal style="--reveal-index:${4+c.foundation.paragraphs.length+i*2}">${escape(item.title)}</h3><p data-reveal style="--reveal-index:${5+c.foundation.paragraphs.length+i*2}">${escape(item.description)}</p></div>`).join('')}</div><div class="actions"><div data-reveal style="--reveal-index:${4+c.foundation.paragraphs.length+c.foundation.items.length*2}">${demo()}</div><a class="text-link" href="#products" data-reveal style="--reveal-index:${5+c.foundation.paragraphs.length+c.foundation.items.length*2}">${c.foundation.explore}${down}</a></div></div>
      </div>
    </section>

    <section class="products section-pad" id="products" aria-labelledby="products-title" tabindex="-1">
      <div class="section-top" data-reveal><span class="eyebrow">${c.products.label}</span></div>
      <div class="products-introduction"><h2 class="display-heading" id="products-title" data-reveal>${escape(c.products.title).replace('. ', '.<br>')}</h2><p data-reveal>${c.products.introduction}</p></div>
      <div class="product-grid">${suiteProducts.map((p,i) => `<div class="product-tile tile-${p.id}" style="--reveal-index:${i}" data-reveal><a class="tile-link" href="#product-${p.id}" data-product-link="${p.id}"><div class="tile-logo">${logo(p)}</div><span class="tile-description">${p.tagline}</span><span class="tile-learn">Learn more <span aria-hidden="true">&darr;</span></span></a><a class="tile-learn tile-technical" href="${escape(p.destination || `#product-${p.id}`)}"${p.destination ? '' : ` data-product-link="${p.id}"`}>Explore technical details <span aria-hidden="true">&rarr;</span><span class="sr-only"> — ${escape(p.name)}</span></a></div>`).join('')}${['Workers', 'DEX'].map((name,i) => `<div class="product-tile tile-placeholder" data-suite-placeholder="${name.toLowerCase()}" data-reveal style="--reveal-index:${i+4}"><div class="suite-placeholder-logo">Placeholder</div><span class="tile-description">${name} lorem ipsum</span><span class="tile-learn" aria-disabled="true">Learn more <span aria-hidden="true">&darr;</span><span class="sr-only"> — ${name} is a placeholder, not available.</span></span><span class="tile-learn tile-technical" aria-disabled="true">Explore technical details <span aria-hidden="true">&rarr;</span><span class="sr-only"> — ${name} is a placeholder, not available.</span></span></div>`).join('')}</div>
    </section>

    ${showcase}

    <section class="expertise section-pad" id="expertise" aria-labelledby="expertise-title" tabindex="-1">
      <div class="section-top"><span class="eyebrow" data-reveal style="--reveal-index:0">${c.expertise.label}</span></div>
      <div class="expertise-introduction"><h2 class="display-heading" id="expertise-title" data-reveal style="--reveal-index:2">${c.expertise.title}</h2><div>${c.expertise.paragraphs.map((p,i) => `<p data-reveal style="--reveal-index:${i+3}">${p}</p>`).join('')}</div></div>
      <div class="expertise-list">${c.expertise.items.map((s,i) => `<article class="expertise-row" data-reveal style="--reveal-index:${i}"><span class="expertise-number" aria-hidden="true">0${i+1}</span><h3>${s.title}</h3><p>${s.description}</p><span class="expertise-glyph glyph-${i}" aria-hidden="true"><i></i><i></i><i></i></span></article>`).join('')}</div>
    </section>

    <section class="contact section-pad" id="contact" aria-labelledby="contact-title" tabindex="-1" style="--typing-end:${contactTypingTime.toFixed(3)}s">${contactSlashes}<h2 class="display-heading" id="contact-title" aria-label="${escape(c.contact.title)}">${contactLines}</h2><div class="contact-bottom"><p>${c.contact.description}</p>${demo('button-light')}</div></section>
  </main>
  <footer class="site-footer"><a href="#hero" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" loading="lazy"></a></footer>

  ${navigation()}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, '../index.html'), html, 'utf8');
console.log(`Rendered homepage with ${products.length} products.`);
require('./render-cases-article.js')();
require('./render-variants.js')();
require('./proposals/build.js')();
