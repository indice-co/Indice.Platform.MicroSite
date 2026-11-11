'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
require('../js/data.js');
const { products, copy } = globalThis.INDICE_DATA;
const content = require('../scripts/tech-content.js');
const { highlight } = require('../scripts/highlight.js');
const { fuzzyRank, riskLevel, aggregate } = require('../js/terminal.js');
const { connectorPaths, selectionSentence } = require('../js/blueprint.js');
const { nearestIndex, clampIndex } = require('../js/carousel.js');

const pages = { original: 'index.html', terminal: 'terminal.html', blueprint: 'blueprint.html' };
const variants = { terminal: 'terminal.html', blueprint: 'blueprint.html' };
const unescapeHtml = value => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const visibleText = html => unescapeHtml(html
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const ids = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);

test('every homepage version carries the design ribbon and marks the current page', () => {
  for (const [name, file] of Object.entries(pages)) {
    const html = read(file);
    const ribbon = html.match(/<nav class="design-ribbon"[\s\S]*?<\/nav>/)?.[0];
    assert(ribbon, `${file} has the ribbon`);
    assert(html.includes('href="css/design-ribbon.css"'), `${file} loads the ribbon styles`);
    assert.deepEqual([...ribbon.matchAll(/<a href="([^"]+)"/g)].map(match => match[1]), ['index.html', 'terminal.html', 'blueprint.html']);
    const current = [...ribbon.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(match => match[1]);
    assert.deepEqual(current, [pages[name]], `${file} marks itself as current`);
    assert(html.indexOf('design-ribbon') < html.indexOf('<main'), 'The ribbon sits at the top of the page');
  }
});

test('the new designs keep the three pillars, in order, with the approved pillar text', () => {
  for (const file of Object.values(variants)) {
    const html = read(file);
    const sections = [...html.matchAll(/<section[^>]* id="(foundation|suite|expertise)"/g)].map(match => match[1]);
    assert.deepEqual(sections, ['foundation', 'suite', 'expertise'], file);
    const text = visibleText(html);
    for (const pillar of copy.hero.pillars) assert(text.includes(pillar.headline), `${file} keeps the ${pillar.label} text`);
  }
});

test('the new designs use the approved product logos and mark missing assets as placeholders', () => {
  for (const file of Object.values(variants)) {
    const html = read(file);
    for (const id of ['cases', 'iam', 'messaging', 'risk']) {
      const product = products.find(item => item.id === id);
      assert(html.includes(`src="${product.logo}"`), `${file} shows the ${id} logo`);
      assert(fs.existsSync(path.join(root, product.logo)));
    }
    for (const name of ['Agents', 'Workers']) {
      assert(new RegExp(`${name} logo`).test(html), `${file} has a ${name} logo placeholder`);
    }
    assert(!/Agents logo.*<img/.test(html), 'Placeholders are not fake images');
  }
});

test('IAM leads both product lists and includes the Duende Software partnership', () => {
  for (const file of Object.values(variants)) {
    const html = read(file);
    const order = file === 'terminal.html'
      ? [...html.matchAll(/<section class="product" id="([^"]+)"/g)].map(match => match[1])
      : [...html.matchAll(/<button class="mod product"[^>]*data-product="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(order.slice(0, 4), ['iam', 'cases', 'messaging', 'risk'], `${file} lists IAM first`);

    const partnership = html.match(/<a class="partner" href="https:\/\/duendesoftware\.com\/" target="_blank" rel="noopener">([\s\S]*?)<\/a>/)?.[1];
    assert(partnership, `${file} links the IAM partnership callout to Duende`);
    assert.match(partnership, /<img src="assets\/logos\/duende logo\.svg"[^>]*alt="Duende Software"/);
    assert.match(partnership, /Indice is an official distributor and integrator of Duende Software\./);
    if (file === 'blueprint.html') {
      assert.match(html, /<figure class="stack" id="stack-diagram" data-selected="iam"/);
      assert.match(html, /data-product="iam"[^>]*aria-pressed="true"/);
    }
  }
});

test('every local reference resolves, ids are unique, and anchors and ARIA targets exist', () => {
  for (const file of Object.values(variants)) {
    const html = read(file);
    const all = ids(html);
    assert.equal(new Set(all).size, all.length, `${file} ids are unique`);
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(all.includes(target), `${file} anchor exists: ${target}`);
    for (const [, refs] of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
      for (const ref of refs.split(' ')) assert(all.includes(ref), `${file} ARIA target exists: ${ref}`);
    }
    for (const [, ref] of html.matchAll(/\b(?:src|href)="((?:assets|css|js)\/[^"#]+|[a-z-]+\.html)"/g)) {
      assert(fs.existsSync(path.join(root, ref)), `${file} local asset exists: ${ref}`);
    }
    for (const [, attrs] of html.matchAll(/<button\b([^>]+)>/g)) assert(/\btype="button"/.test(attrs), `${file} buttons do not submit`);
    for (const [, attrs] of html.matchAll(/<img\b([^>]+)>/g)) assert(/\balt="/.test(attrs), `${file} images have alt text`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file} has one h1`);
    assert(/<html lang="en">/.test(html));
  }
});

test('missing links are visible placeholders and external links are safe and expected', () => {
  for (const file of Object.values(variants)) {
    const html = read(file);
    assert(!/href="#?"/.test(html), 'No empty or dead hrefs');
    const placeholders = [...html.matchAll(/<span class="ph"([^>]*)>/g)];
    assert(placeholders.length >= 4, `${file} lists placeholders`);
    for (const [, attrs] of placeholders) assert(/role="link"/.test(attrs) && /aria-disabled="true"/.test(attrs));
    if (file === 'terminal.html') assert(/Request a demo<small>placeholder<\/small>/.test(html), 'The demo request is a placeholder');
    for (const [tag] of html.matchAll(/<a [^>]*href="https?:\/\/[^"]+"[^>]*>/g)) {
      assert(/rel="noopener"/.test(tag) && /target="_blank"/.test(tag), `External links open safely: ${tag}`);
      assert(/https:\/\/(github\.com\/indice-co|www\.nuget\.org\/profiles\/indice|www\.npmjs\.com\/package\/@indice\/|duendesoftware\.com)/.test(tag), `Only known sources are linked: ${tag}`);
    }
  }
  assert(read('terminal.html').includes('href="cases-reference.html"'), 'Cases links to its real technical reference');
  assert(read('blueprint.html').includes('href="cases-reference.html"'));
});

test('copy is plain and technical: no marketing language, no unreleased features', () => {
  const banned = /\b(seamless(ly)?|robust|cutting[- ]edge|world[- ]class|best[- ]in[- ]class|state[- ]of[- ]the[- ]art|next[- ]generation|revolutionary|game[- ]chang\w*|empower\w*|unlock\w*|supercharge\w*|leverag\w*|synerg\w*|turnkey|holistic|innovative|blazing|effortless\w*|delight\w*)\b/i;
  for (const file of Object.values(variants)) {
    const text = visibleText(read(file));
    assert(!banned.test(text), `${file}: ${text.match(banned)?.[0]}`);
    assert(!/next release/i.test(text), `${file} does not advertise unreleased features`);
  }
});

test('documented facts from the product documents are present on both designs', () => {
  const facts = {
    Cases: ['manage/cases/{id}/actions', 'Block previous approver', 'CasesDb', 'JSON Schema', 'Elsa'],
    IAM: ['urn:indice:guest', 'TrustActivationDelay', '/mfa', 'Duende IdentityServer', 'FIDO2'],
    Messaging: ['messages:send', 'MessageChannelKind', 'Handlebars', 'Azure Service Bus', 'IgnoreUserPreferences'],
    Risk: ['POST api/risk', 'ResultId', 'GeoLite2', 'NetTopologySuite', 'Maximum']
  };
  for (const file of Object.values(variants)) {
    const text = visibleText(read(file));
    for (const [product, tokens] of Object.entries(facts)) {
      for (const token of tokens) assert(text.includes(token), `${file} (${product}) mentions ${token}`);
    }
  }
});

test('highlighted code reproduces the quoted source exactly', () => {
  for (const product of content.suite) {
    for (const block of product.code) {
      const html = highlight(block.language, block.source);
      assert.equal(unescapeHtml(html.replace(/<[^>]+>/g, '')), block.source, `${product.id}/${block.file}`);
    }
  }
  assert.match(highlight('csharp', 'var x = new IntegerRange(0, 0); // note'), /<span class="tok-keyword">var<\/span>.*<span class="tok-function">IntegerRange<\/span>.*<span class="tok-comment">\/\/ note<\/span>/);
  assert.match(highlight('jsonc', '"Policy": "Default", "n": 90'), /<span class="tok-key">&quot;Policy&quot;<\/span>.*<span class="tok-string">&quot;Default&quot;<\/span>.*<span class="tok-number">90<\/span>/);
});

test('both designs work without JavaScript: enhancement classes gate every hiding rule', () => {
  const terminalCss = read('css/terminal.css');
  const blueprintCss = read('css/blueprint.css');
  assert.match(terminalCss, /\.tabs-ready \.product \{[^}]*display: none/);
  assert(!/(^|\n)\.product \{[^}]*display: none/.test(terminalCss), 'Product panels are visible by default');
  assert(!/(^|\n)\.sec \{[^}]*opacity: 0/.test(terminalCss));
  assert.match(terminalCss, /\.reveal-ready \.sec \{[^}]*opacity: 0/);
  assert.match(blueprintCss, /\.bp-anim \.sheet \{[^}]*opacity: 0/);
  assert(!/(^|\n)\.sheet \{[^}]*opacity: 0/.test(blueprintCss));
  assert(!/hidden/.test(read('terminal.html').match(/<div class="tabs"[\s\S]*?<div class="block" id="relations">/)[0].replace(/aria-hidden="true"/g, '')), 'No product panel is hidden in the markup');
  for (const css of [terminalCss, blueprintCss]) assert(css.includes('prefers-reduced-motion'));
  assert(/<details class="ds" id="ds-cases" name="datasheet">/.test(read('blueprint.html')), 'Datasheets are native details elements, all closed initially');
});

test('every suite product has a UI screenshot carousel placeholder on both designs', () => {
  for (const file of Object.values(variants)) {
    const html = read(file);
    assert(html.includes('css/carousel.css') && html.includes('js/carousel.js'), `${file} loads the carousel assets`);
    for (const product of content.suite) {
      const carousel = html.match(new RegExp(`<section class="shots"[^>]*aria-label="${product.name} UI screenshots[\\s\\S]*?</section>`));
      assert(carousel, `${file} has a carousel for ${product.name}`);
      const slides = carousel[0].match(/<li class="shot"/g) || [];
      assert(slides.length >= 2, `${file} ${product.name} carousel has several slides`);
      assert.equal((carousel[0].match(/role="img"/g) || []).length, slides.length, 'each slide is a labelled placeholder image');
      assert(!/<img\b/.test(carousel[0]), 'placeholders do not pretend to be real screenshots');
    }
    assert.equal((html.match(/<section class="shots"/g) || []).length, content.suite.length, `${file} has exactly one carousel per suite product`);
  }
});

test('carousel position helpers snap to the nearest slide and respect the ends', () => {
  assert.equal(nearestIndex([0, 800, 1600], 0, 1600), 0);
  assert.equal(nearestIndex([0, 800, 1600], 430, 1600), 1);
  assert.equal(nearestIndex([0, 800, 1600], 1599.5, 1600), 2);
  assert.equal(nearestIndex([0, 800, 1500], 1500, 1500), 2);
  assert.equal(nearestIndex([], 0, 0), 0);
  assert.equal(clampIndex(-1, 3), 0);
  assert.equal(clampIndex(5, 3), 2);
});

test('Terminal explorer header links to the Platform repository beside the brand', () => {
  const header = read('terminal.html').match(/<div class="explorer-header">([\s\S]*?)<\/div>/)[1];
  assert.match(header, /class="brand explorer-brand"/);
  assert.match(header, /<a class="explorer-github" target="_blank" rel="noopener" href="https:\/\/github\.com\/indice-co\/Indice\.Platform" aria-label="INDICE Platform on GitHub"><svg/);
});

test('Terminal mobile title bar includes the repository link beside the logo', () => {
  const header = read('terminal.html').match(/<header class="titlebar">([\s\S]*?)<\/header>/)[1];
  assert.match(header, /class="brand"/);
  assert.match(header, /<a class="explorer-github" target="_blank" rel="noopener" href="https:\/\/github\.com\/indice-co\/Indice\.Platform" aria-label="INDICE Platform on GitHub"><svg/);
});

test('Blueprint header links to the Platform repository instead of the demo request', () => {
  const header = read('blueprint.html').match(/<header class="sheetbar">([\s\S]*?)<\/header>/)[1];
  assert.match(header, /<a class="sheetbar-github" target="_blank" rel="noopener" href="https:\/\/github\.com\/indice-co\/Indice\.Platform" aria-label="INDICE Platform on GitHub"><svg/);
  assert(!header.includes('Request a demo'), 'The header no longer shows the demo request');
});

test('Blueprint footer is a three-cell title block: project, sheets and code links', () => {
  const footer = read('blueprint.html').match(/<section class="titleblock"[\s\S]*?<dl>([\s\S]*?)<\/dl>/)[1];
  assert.deepEqual([...footer.matchAll(/<dt>([^<]+)<\/dt>/g)].map(match => match[1]), ['Project', 'Sheets', 'Code']);
  for (const href of ['https://github.com/indice-co', 'https://www.nuget.org/profiles/indice', 'https://www.npmjs.com/package/@indice/ng-config']) {
    assert(footer.includes(`href="${href}"`), `Footer links to ${href}`);
  }
});

test('Terminal explorer lists only overview and integration points under expertise', () => {
  const html = read('terminal.html');
  const dir = html.match(/<span>03-expertise<\/span><ul>([\s\S]*?)<\/ul>/)[1];
  assert.deepEqual([...dir.matchAll(/>([a-z-]+\.md)<\/a>/g)].map(match => match[1]), ['overview.md', 'integration-points.md']);
});

test('Terminal explorer opens each pillar with an overview.md that links to its section', () => {
  const html = read('terminal.html');
  for (const [dir, target] of [['01-foundation', 'foundation'], ['02-suite', 'suite'], ['03-expertise', 'expertise']]) {
    const group = html.match(new RegExp(`<span>${dir}</span><ul>([\\s\\S]*?)</ul>`))[1];
    assert(group.trimStart().startsWith(`<li><a href="#${target}" data-spy-link="${target}">overview.md</a>`), `${dir} starts with overview.md`);
  }
});

test('generated pages are up to date with the renderers', () => {
  assert.equal(require('../scripts/render-terminal.js')(), read('terminal.html'), 'Run npm run build to refresh terminal.html');
  assert.equal(require('../scripts/render-blueprint.js')(), read('blueprint.html'), 'Run npm run build to refresh blueprint.html');
});

test('command palette ranks prefix matches first and falls back to hints and subsequences', () => {
  const items = [
    { label: 'libraries.md', hint: 'foundation' },
    { label: 'risk/', hint: 'product · Risk assessment' },
    { label: 'relations.md', hint: 'suite' },
    { label: 'matrix.md', hint: 'suite' }
  ];
  assert.deepEqual(fuzzyRank('', items).map(item => item.label), items.map(item => item.label));
  assert.equal(fuzzyRank('ri', items)[0].label, 'risk/');
  assert.deepEqual(fuzzyRank('rel', items).map(item => item.label), ['relations.md']);
  assert(fuzzyRank('assessment', items).some(item => item.label === 'risk/'), 'matches the hint text');
  assert(fuzzyRank('lbr', items).some(item => item.label === 'libraries.md'), 'matches a subsequence');
  assert.deepEqual(fuzzyRank('zzz', items), []);
});

test('risk aggregation reproduces the documented example with the template ranges', () => {
  assert.deepEqual(['None', 'Low', 'Low', 'Medium', 'Medium', 'High', 'High'], [0, 1, 1000, 1001, 2000, 2001, 5000].map(riskLevel));
  assert.deepEqual(aggregate([800, 1500], 'sum'), { total: 2300, level: 'High' });
  assert.deepEqual(aggregate([800, 1500], 'maximum'), { total: 1500, level: 'Medium' });
  assert.deepEqual(aggregate([NaN, -5], 'sum'), { total: 0, level: 'None' });
});

test('diagram connectors give every target its own channel between the layers', () => {
  const paths = connectorPaths({ x: 100, y: 0 }, [{ x: 40, y: 200 }, { x: 160, y: 200 }, { x: 260, y: 200, optional: true }]);
  assert.equal(paths.length, 3);
  const channels = paths.map(path => Number(path.d.match(/V([\d.]+)H/)[1]));
  assert.deepEqual([...channels].sort((a, b) => a - b), channels, 'channels descend in order');
  assert.equal(new Set(channels).size, 3, 'channels do not overlap');
  assert(channels.every(channel => channel > 0 && channel < 200), 'channels stay between the layers');
  assert.equal(paths[2].optional, true);
  assert.deepEqual(paths[1].end, { x: 160, y: 200 });
  assert.equal(selectionSentence('Risk', ['ASP.NET Core', 'Angular'], ['Redis']), 'Risk uses ASP.NET Core, Angular; optional: Redis.');
  assert.equal(selectionSentence('Messaging', ['Azure'], []), 'Messaging uses Azure.');
});
