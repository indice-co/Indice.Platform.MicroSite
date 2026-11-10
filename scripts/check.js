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
const foundation = html.match(/<section class="foundation\b[\s\S]*?<\/section>/)[0];
const foundationRevealIndices = [...foundation.matchAll(/data-reveal style="--reveal-index:(\d+)"/g)].map(match => Number(match[1]));
assert.deepEqual(foundationRevealIndices, Array.from({ length: 6 + copy.foundation.paragraphs.length + copy.foundation.items.length * 2 }, (_, index) => index), 'Foundation entrances have distinct, sequential delays');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One H1');
assert.deepEqual(products.map(product => product.id), ['cases', 'iam', 'messaging', 'risk']);
assert.equal((html.match(/class="product-chapter"/g) || []).length, 4);
assert.equal((html.match(/data-select-product=/g) || []).length, 4);
assert.equal((html.match(/data-product-link=/g) || []).length, 4);
assert.equal((html.match(/class="button explore-button" disabled/g) || []).length, 3);
assert(html.includes('class="button explore-button" href="cases-reference.html"'), 'Explore Cases opens the technical reference');
assert(fs.existsSync(path.join(root, 'cases-reference.html')), 'Cases technical reference is generated');
assert(!fs.existsSync(path.join(root, 'cases.html')), 'Legacy Cases page is removed');
assert(!fs.existsSync(path.join(root, 'cases-0.2.html')), 'Cases 0.2 page is removed');
assert(!html.includes('Cases 0.2'), 'Homepage does not link to Cases 0.2');
assert.equal((html.match(/data-demo/g) || []).length, 2);
const navigation = html.match(/<nav class="floating-nav"[\s\S]*?<\/nav>/)?.[0];
assert(navigation && !navigation.includes('nav-demo'), 'Screen-level demo CTA stays outside the floating navigation');
assert(!html.includes('nav-demo'), 'Screen-level demo CTA is removed');
assert(!/data-(?:hero-)?art-toggle|art-motion-toggle|preview-toggle|art-(?:pause|play)-icon/.test(html), 'Animation playback controls are not rendered');
assert(!ids.includes('metrics') && !html.includes('data-count-value') && !html.includes('js/metrics.js'), 'Platform metrics are not rendered');
assert(!/Product carousel|reserved for the next phase|coming.soon|Agents/.test(html));
assert.deepEqual([...html.matchAll(/data-suite-placeholder="([^"]+)"/g)].map(match => match[1]), ['workers', 'dex']);
assert.equal((html.match(/class="product-tile /g) || []).length, 6, 'Suite has six visual slots');
assert.equal((html.match(/<div class="product-tile tile-placeholder"/g) || []).length, 2, 'Placeholders are not navigable links');
for (const name of ['iam', 'cases', 'risk', 'messaging']) {
  assert(html.includes(`src="assets/logos/${name} logo.svg"`), `Suite uses the replacement ${name} logo`);
}
assert(html.includes('Our solutions.<br>A platform of possibilities.'), 'Suite title breaks after its first sentence');
assert.deepEqual([...html.matchAll(/data-product-link="([^"]+)"/g)].map(match => match[1]), ['cases', 'iam', 'messaging', 'risk']);
assert.equal((html.match(/<a class="tile-link" /g) || []).length, 4, 'Only product content is interactive, not the surrounding grid cell');
assert(!/href="#"|href="\/products|mailto:|<form\b|<iframe\b/.test(html));
for (const id of ['hero', 'technologies', 'foundation', 'products', 'product-showcase', 'expertise', 'contact']) assert(ids.includes(id));
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `Anchor exists: ${target}`);
for (const [, reference] of html.matchAll(/\b(?:src|href)="((?:assets|css|js)\/[^"#]+)"/g)) assert(fs.existsSync(path.join(root, reference)), `Local asset exists: ${reference}`);
for (const [, reference] of css.matchAll(/url\('([^']+)'\)/g)) assert(fs.existsSync(path.resolve(root, 'css', reference)), `CSS asset exists: ${reference}`);
for (const [, attributes] of html.matchAll(/<button\b([^>]+)>/g)) assert(/\btype="button"/.test(attributes), 'Buttons do not accidentally submit');
for (const [, references] of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) for (const id of references.split(' ')) assert(ids.includes(id), `ARIA reference exists: ${id}`);
const text = html.replace(/<span class="contact-character"[^>]*>(.*?)<\/span>/g, '$1').replace(/<br\s*\/?\s*>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const allCopy = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(allCopy) : Object.values(value).flatMap(allCopy);
// Field IDs and disclosure labels are configuration; substantive approved copy must render verbatim.
for (const sentence of allCopy({ foundation: copy.foundation, products: copy.products, expertise: copy.expertise, technologies: { title: copy.technologies.title }, contact: copy.contact })) assert(text.includes(sentence), `Approved text preserved: ${sentence}`);
assert(!html.includes('clients-logos/'), 'The technologies section replaces the client logos');
assert.equal((html.match(/class="technology"/g) || []).length, copy.technologies.items.length, 'Every technology renders');
const expertise = html.match(/<section class="expertise section-pad"[\s\S]*?<\/section>/)?.[0];
assert(expertise, 'Expertise section is present');
assert.equal((expertise.match(/data-reveal/g) || []).length, 8, 'Expertise labels, heading, paragraphs and rows reveal separately');
assert.deepEqual([...expertise.matchAll(/--reveal-index:(\d+)/g)].map(match => Number(match[1])), [0, 1, 2, 3, 4, 0, 1, 2]);
for (const technology of copy.technologies.items) {
  assert(html.includes(`<span>${technology.name}</span>`), `Technology is labelled: ${technology.name}`);
  assert(html.includes(`src="${technology.icon}"`), `Technology icon is rendered: ${technology.name}`);
}
for (const product of products) {
  assert(text.includes(product.tagline));
  assert(html.includes(`id="product-${product.id}"`));
  assert(html.includes(`data-preview="${product.id}"`));
  assert.equal(product.destination, product.id === 'cases' ? 'cases-reference.html' : null);
  assert.equal(product.preview, previews[product.id]);
  if (product.preview) assert(html.includes(`src="${product.preview}"`));
}
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('Homepage structure, copy, assets, anchors, ARIA targets, and four product states passed.');
