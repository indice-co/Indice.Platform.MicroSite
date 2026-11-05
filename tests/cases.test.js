const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('../js/data.js');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'cases.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const { products, casesPage } = globalThis.INDICE_DATA;

test('Cases has all seven sections in order and preserves supplied product copy', () => {
  assert.deepEqual([...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]), [
    'cases-hero', 'cases-challenge', 'cases-how', 'cases-capabilities', 'cases-fit', 'cases-deployment', 'cases-demo'
  ]);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert(html.includes('Every case.<br>A clear path forward.'));
  assert(html.includes(products.find(product => product.id === 'cases').description));
  assert(!html.includes('Draft copy'));
  assert(!html.includes('Back to the suite'));
  assert(html.includes('In progress'));
  assert(html.includes('Pending second approval'));
  assert(html.includes("Your organisation's website or app"));
  assert(!/next release|Tailwind|daisyUI|manage\/|my\/|Elsa|<pre|<code/.test(html));
});

test('missing detail screenshot and product PDF stay explicitly unavailable', () => {
  assert.equal(casesPage.detailScreenshot, null);
  assert.equal(casesPage.guide, null);
  assert(html.includes('Case detail screenshot &mdash; awaiting approved asset'));
  assert(!html.includes('cases dashboard.png'), 'Do not mislabel a dashboard as a detail screen');
  assert.equal((html.match(/disabled aria-describedby="(?:deployment|final)-guide-note"/g) || []).length, 2);
  assert(!/<a\b[^>]*\bdownload(?:[ >]|=)/.test(html));
  assert.equal((html.match(/type="button" data-demo/g) || []).length, 2);
  assert(!/mailto:|<form|<iframe/.test(html));
});

test('homepage and shared navigation expose Cases while other products remain unavailable', () => {
  assert(home.includes('class="button explore-button" href="cases.html"'));
  assert.equal(products.filter(product => product.destination).length, 1);
  assert(home.includes('class="panel-product" href="cases.html"'));
  assert(html.includes('class="panel-product" href="cases.html" aria-current="page"'));
  for (const id of ['foundation', 'products', 'services']) assert(html.includes(`href="index.html#${id}"`));
  for (const page of [home, html]) {
    assert(page.includes('id="products-trigger"'));
    assert(page.includes('id="menu-trigger"'));
    assert(page.includes('aria-controls="products-panel" aria-expanded="false"'));
  }
});

test('product page IDs, assets, anchors and accessibility references resolve', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), id);
  for (const [, references] of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    for (const id of references.split(' ')) assert(ids.includes(id), id);
  }
  for (const [, asset] of html.matchAll(/(?:src|href)="((?:assets|js|css)\/[^"]+)"/g)) {
    assert(fs.existsSync(path.join(root, asset)), asset);
  }
  assert(html.includes('class="skip-link" href="#main-content"'));
  assert(html.includes('href="index.html" data-top-href="#cases-hero"'));
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  assert(css.includes('--duration:.5s'));
  assert(css.includes('prefers-reduced-motion:reduce'));
  assert(!html.includes('js/showcase.js'));
  assert(!html.includes('js/contact.js'));
});

test('Cases design uses product-specific CTAs and illustrative product visuals', () => {
  assert(html.includes('aria-label="On this page"'));
  assert(html.includes('Illustrative customer update'));
  assert.equal((html.match(/class="cases-capability-art /g) || []).length, 4);
  assert(html.includes('class="cases-deployment-map"'));
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  assert(css.includes('.cases-page .demo-button'));
  assert(css.includes('background:var(--cases-gold)'));
  assert(html.includes('--cases-color:#12707A;--cases-gold:#F2B632'));
});

test('hero screen supplies illustrative progress and keyboard-operable action explanations', () => {
  assert(html.includes('js/cases-art.js'));
  assert(html.includes('aria-label="Illustrative workflow stages"'));
  assert.equal((html.match(/<details><summary>/g) || []).length, 2);
  assert(html.includes('Illustration only.'));
  assert(html.includes('Private checkpoint'));
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  assert(css.includes('cases-progress-grow 9s ease-in-out infinite'));
  assert(css.includes('animation-play-state:var(--art-play)'));
  assert(css.includes('--brand-width:195px'));
});

test('Cases hero reuses an undistorted official homepage slash in product gold', () => {
  const source = fs.readFileSync(path.join(root, 'assets/logos/INDICE_slashes.svg'), 'utf8');
  const officialPath = [...source.matchAll(/<path d="([^"]+)"/g)][1][1];
  assert(html.includes(`viewBox="0 0 124.6 201.7" aria-hidden="true"><path d="${officialPath}" fill="currentColor"/>`));
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  const rule = css.match(/\.cases-hero-slash \{([^}]+)\}/)[1];
  assert(rule.includes('color:var(--cases-gold)'));
  assert(rule.includes('width:auto'));
  assert(!rule.includes('skew'));
  assert(!css.includes('.cases-visual-grid::after'));
});

test('Challenge section uses the dark logo teal with light text and dividers', () => {
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  const rule = css.match(/#cases-challenge \{([^}]+)\}/)[1];
  assert(rule.includes('background:linear-gradient(110deg,#052e36,#14616a,var(--cases-dark),#082f45)'));
  assert(rule.includes('color:var(--white)'));
  assert(rule.includes('--muted:var(--paper)'));
  assert(rule.includes('--line:#ffffff33'));
  assert.match(css, /#cases-challenge \.section-top \{\s+color:inherit/);
  assert(rule.includes('animation:cases-challenge-gradient 10s ease-in-out infinite'));
  assert(!css.includes('#cases-challenge .cases-intro {'));
  assert(html.includes('<ol class="cases-challenge-points" role="list">'));
  assert.equal((html.match(/<li><span aria-hidden="true">0[12]<\/span><p>/g) || []).length, 2);
});

test('Cases section menu sticks outside the clipped hero and reserves anchor clearance', () => {
  assert(html.indexOf('class="cases-page-links"') < html.indexOf('<section class="cases-hero'));
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  const rule = css.match(/\.cases-page-links \{([^}]+)\}/)[1];
  assert(rule.includes('position:sticky'));
  assert(rule.includes('top:0'));
  assert(rule.includes('background:linear-gradient(to right,#ffffff00,var(--white))'));
  assert.match(css, /\.cases-page section \{\s+scroll-margin-top:/);
});

test('capability tabs preserve all four illustrations and readable no-script panels', () => {
  assert(html.includes('js/cases-tabs.js'));
  assert.equal((html.match(/role="tab" id="capability-tab-/g) || []).length, 4);
  assert.equal((html.match(/<article id="capability-panel-\d">/g) || []).length, 4);
  assert(html.includes('aria-orientation="vertical" hidden'));
});
