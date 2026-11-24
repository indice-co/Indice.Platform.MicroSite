'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
// Line endings depend on the checkout (core.autocrlf), so compare text with LF endings.
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const content = require('../scripts/content.js');
const { pages: renderers } = require('../scripts/build.js');
const { darkLogo, darkLogoPath, themeKey } = require('../scripts/shared.js');
const { check } = require('../scripts/check.js');

const unescapeHtml = value => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const visibleText = html => unescapeHtml(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const between = (html, from, to) => {
  const start = html.indexOf(from);
  const end = html.indexOf(to, start);
  assert(start >= 0 && end > start, `Found the part from ${from} to ${to}`);
  return html.slice(start, end);
};
const home = () => read('index.html');

test('the pages and dark-theme logos are generated from the current sources', () => {
  for (const [file, render] of Object.entries(renderers)) assert.equal(render(), read(file), `Run npm run build to refresh ${file}`);
  for (const product of content.products) {
    const svg = read(darkLogoPath(product));
    assert.equal(darkLogo(product).replace(/\r\n/g, '\n'), svg, `Run npm run build to refresh the ${product.id} dark logo`);
    assert(/#F4F4F6/i.test(svg), `${product.id} dark logo lightens its wordmark`);
    const badge = svg.match(/<path\b[^>]*\sd="M[\d.]+ 2\.2202[^>]*>\s*(<path\b[^>]*>)\s*(<path\b[^>]*>)/);
    if (badge) assert(badge.slice(1).every(letter => letter.includes('fill="#1C1A33"')), `${product.id} dark logo keeps the UI letters dark`);
  }
});

test('only the chosen design is left', () => {
  const files = fs.readdirSync(root).filter(file => file.endsWith('.html')).sort();
  assert.deepEqual(files, ['cases-reference.html', 'index.html'], 'Two pages: the homepage and the Cases reference');
  for (const file of files) {
    const html = read(file);
    assert(!/design-ribbon|Design preview|data-proposal/.test(html), `${file} has no design switcher`);
    assert(!/\bproposal\b/i.test(visibleText(html)), `${file} does not call itself a proposal`);
    assert(!/proposal-[abc]|original\.html|terminal|blueprint/.test(html), `${file} does not link to a removed design`);
  }
});

test('the hero leads with what you can build, not with self-hosted .NET', () => {
  const html = home();
  const title = visibleText(between(html, '<h1 id="pb-hero-title">', '</h1>')).trim();
  assert.equal(title, content.hero.title);
  assert(!/self-hosted|\.NET/i.test(title), 'The headline is not about self-hosted .NET');
  assert.match(title, /^Build your own/);
  const hero = between(html, 'id="hero"', 'id="platform"');
  assert(visibleText(hero).includes(content.hero.lede), 'The lede is shown');
  for (const fact of content.hero.facts) assert(visibleText(hero).includes(fact.value), `At a glance: ${fact.label}`);
  assert(/AI/.test(visibleText(hero)), 'AI is visible in the hero');
});

test('the three pillars are presented in order, in the hero and as the first three chapters', () => {
  const html = home();
  const names = ['Platform Foundation', 'Platform Suite', 'Platform Services'];
  assert.deepEqual(content.hero.pillars.map(pillar => pillar.name), names);
  const pillars = between(html, '<ol class="pb-index pb-pillars"', '</ol>');
  assert.deepEqual([...pillars.matchAll(/<a href="#([a-z]+)">/g)].map(match => match[1]), ['platform', 'products', 'services'], 'Each pillar links to its chapter');
  for (const role of ['The mortar', 'The bricks', 'The builder']) assert(pillars.includes(role), `Pillar role: ${role}`);
  const labels = [...html.matchAll(/<header class="pb-chapter-head" data-reveal>\s*<p class="pb-chapter-label"><span class="pb-chapter-no">§ (\d+)<\/span>([^<]+)<\/p>/g)].map(match => `${match[1]} ${match[2]}`);
  assert.deepEqual(labels.slice(0, 3), names.map((name, index) => `0${index + 1} ${name}`));
  assert(html.indexOf('id="platform"') < html.indexOf('id="products"') && html.indexOf('id="products"') < html.indexOf('id="services"'));
});

test('Platform Foundation covers the libraries, engineering expertise and the practices built in', () => {
  const text = visibleText(between(home(), 'id="platform"', '<figure class="pb-plate"'));
  assert.deepEqual(content.foundation.items.slice(0, 2).map(item => item.title), ['Indice open-source libraries', 'Engineering expertise']);
  for (const item of content.foundation.items) assert(text.includes(item.title) && text.includes(item.text), `Foundation: ${item.title}`);
  for (const group of content.foundation.practices.groups) {
    assert(text.includes(group.title), `Practice group: ${group.title}`);
    for (const item of group.items) assert(text.includes(item), `Practice: ${item}`);
  }
  for (const target of ['IIS', 'Nginx', 'Kubernetes', 'AKS', 'EKS', 'Azure Container Apps', 'Azure Web Apps', 'PostgreSQL', 'SQL Server', 'OpenTelemetry']) {
    assert(text.includes(target), `Foundation names ${target}`);
  }
});

test('Platform Suite presents the six products: what each does and its highlights', () => {
  const html = home();
  const order = ['agents', 'cases', 'iam', 'messaging', 'risk', 'workers'];
  assert.deepEqual(content.products.map(product => product.id), order);
  assert.deepEqual([...html.matchAll(/<article class="pb-card"[^>]*aria-labelledby="pb-card-([a-z]+)"/g)].map(match => match[1]), order, 'One card per product');
  assert.deepEqual([...html.matchAll(/<article class="pb-entry" id="spec-([a-z]+)"/g)].map(match => match[1]), order, 'One entry per product');
  for (const product of content.products) {
    const entry = between(html, `id="spec-${product.id}"`, '</article>');
    const text = visibleText(entry);
    assert(text.includes(product.summary), `${product.id}: summary`);
    assert(product.does.length >= 3 && product.does.every(item => text.includes(item)), `${product.id}: what it does`);
    assert(product.features.length >= 4 && product.features.every(feature => text.includes(feature.title) && text.includes(feature.text)), `${product.id}: highlights`);
    assert.equal((entry.match(/<h5>/g) || []).length, 3, `${product.id}: built with, what it does and highlights`);
    assert.equal(product.screens.length, 3, `${product.id}: three screens`);
    for (const screen of product.screens) assert(screen.image && fs.existsSync(path.join(root, screen.image)), `${product.id}: screenshot exists: ${screen.title}`);
  }
  const suite = visibleText(between(html, 'id="products"', 'id="services"'));
  assert(!/The problem|For developers|Key APIs|Architecture|Integrations/.test(suite), 'No problem, developer, API, architecture or integration sections');
  assert(!/<pre|<code|class="pb-code"/.test(between(html, 'id="products"', 'id="services"')), 'No code samples');
});

test('the IAM entry calls out the Duende partnership', () => {
  const html = home();
  const iam = between(html, 'id="spec-iam"', '</article>');
  assert(iam.includes('<aside class="pb-partner"') && iam.includes('official distributor and integrator of Duende Software'));
  assert(iam.includes('href="https://duendesoftware.com/" rel="noopener" target="_blank"'));
  assert.equal((html.match(/class="pb-partner"/g) || []).length, 1, 'Only the IAM entry has a partner panel');
});

test('Platform Services lists the five services', () => {
  const html = home();
  const services = between(html, 'id="services"', 'id="faq"');
  const titles = ['Software development', 'Integration', 'Ongoing support', 'Cloud practices', 'Fintech experience'];
  assert.deepEqual(content.services.items.map(item => item.title), titles);
  assert.deepEqual([...services.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match => match[1]), titles);
  assert(visibleText(services).includes('CVE patching'), 'Ongoing support names CVE patching');
});

test('Technical details is enabled only for Cases, which has a technical reference', () => {
  const html = home();
  const cards = between(html, '<div class="pb-cards">', '<section class="pb-guide"');
  assert.equal((cards.match(/<a href="cases-reference\.html">Technical details/g) || []).length, 1);
  assert.equal((cards.match(/class="pb-link-disabled" role="link" aria-disabled="true"/g) || []).length, content.products.length - 1);
  const reference = read('cases-reference.html');
  assert(reference.includes('<article class="cases-article pbr-article"') && reference.includes('href="index.html#spec-cases"'));
  assert(!reference.includes('article-for-developers'), 'The short "For developers" chapter heading is left out');
  assert(reference.includes('<script defer src="js/cases-article.js"></script>') && reference.includes('<dialog class="flowchart-dialog'));
});

test('Plate I draws one node per product and an open slot for the next', () => {
  const html = home();
  const plate = between(html, '<figure class="pb-plate"', '</figure>');
  assert.equal((plate.match(/class="pb-node-disc"/g) || []).length, content.products.length);
  assert.equal((plate.match(/class="pb-node-ghost"/g) || []).length, 1);
  assert(plate.includes('aria-hidden="true"') && plate.includes('<figcaption class="pb-plate-caption">'));
  assert(html.indexOf('class="pb-plate"') > html.indexOf('id="platform"') && html.indexOf('class="pb-plate"') < html.indexOf('id="products"'));
});

test('both pages offer a light and a dark theme and remember the choice', () => {
  for (const file of Object.keys(renderers)) {
    const html = read(file);
    assert(html.includes('data-default-theme="dark"') && html.includes('data-theme-toggle'), `${file} has the theme control`);
    assert(html.includes(`localStorage.getItem('${themeKey}')`), `${file} applies the stored theme before first paint`);
  }
  assert(read('js/common.js').includes(`const KEY = '${themeKey}';`), 'The script stores the theme under the same key');
  const css = read('css/site.css');
  assert(css.includes('light-dark(') && css.includes('prefers-reduced-motion'));
  assert.match(css, /\.pb-masthead \{\s*position: sticky; top: 0;/, 'The masthead stays in view');
});

test('pages resolve their references and keep basic accessibility', () => {
  check();
});
