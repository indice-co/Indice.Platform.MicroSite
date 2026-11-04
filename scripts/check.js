/* Structural checks for the generated, dependency-free homepage. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('../js/data.js');
const { copy, products } = globalThis.INDICE_DATA;
const root = path.resolve(__dirname, '..');
const previews = {
  cases: 'assets/uis/cases dashboard.png',
  iam: 'assets/uis/iam dashboard.png',
  messaging: 'assets/uis/messaging dashboard.png',
  risk: null,
};
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One H1');
assert.deepEqual(products.map(product => product.id), ['cases', 'iam', 'messaging', 'risk']);
assert.equal((html.match(/class="product-chapter"/g) || []).length, 4);
assert.equal((html.match(/data-select-product=/g) || []).length, 4);
assert.equal((html.match(/data-product-link=/g) || []).length, 4);
assert.equal((html.match(/class="button explore-button" disabled/g) || []).length, 4);
assert.equal((html.match(/data-demo/g) || []).length, 3);
assert.equal((html.match(/class="metric-value">\[XX\]/g) || []).length, 4);
assert(!/Product carousel|reserved for the next phase|coming.soon|Agents|Workers/.test(html));
assert(!/href="#"|href="\/products|mailto:|<form\b|<iframe\b/.test(html));
for (const id of ['hero', 'foundation', 'metrics', 'products', 'product-showcase', 'services', 'customers', 'contact']) assert(ids.includes(id));
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `Anchor exists: ${target}`);
for (const [, reference] of html.matchAll(/\b(?:src|href)="((?:assets|css|js)\/[^"#]+)"/g)) assert(fs.existsSync(path.join(root, reference)), `Local asset exists: ${reference}`);
for (const [, reference] of css.matchAll(/url\('([^']+)'\)/g)) assert(fs.existsSync(path.resolve(root, 'css', reference)), `CSS asset exists: ${reference}`);
for (const [, attributes] of html.matchAll(/<button\b([^>]+)>/g)) assert(/\btype="button"/.test(attributes), 'Buttons do not accidentally submit');
for (const [, references] of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) for (const id of references.split(' ')) assert(ids.includes(id), `ARIA reference exists: ${id}`);
const text = html.replace(/<br\s*\/?\s*>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const allCopy = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(allCopy) : Object.values(value).flatMap(allCopy);
// Field IDs and disclosure labels are configuration; substantive approved copy must render verbatim.
for (const sentence of allCopy({ foundation: copy.foundation, metrics: copy.metrics, products: copy.products, services: copy.services, customers: copy.customers, contact: copy.contact })) assert(text.includes(sentence), `Approved text preserved: ${sentence}`);
for (const product of products) {
  assert(text.includes(product.tagline));
  assert(html.includes(`id="product-${product.id}"`));
  assert(html.includes(`data-preview="${product.id}"`));
  assert.equal(product.destination, null);
  assert.equal(product.preview, previews[product.id]);
  if (product.preview) assert(html.includes(`src="${product.preview}"`));
}
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('Homepage structure, copy, assets, anchors, ARIA targets, and four product states passed.');
