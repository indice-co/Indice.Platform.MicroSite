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
  const css = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  assert(css.includes('--duration:.5s'));
  assert(css.includes('prefers-reduced-motion:reduce'));
  assert(!html.includes('js/showcase.js'));
  assert(!html.includes('js/contact.js'));
});
