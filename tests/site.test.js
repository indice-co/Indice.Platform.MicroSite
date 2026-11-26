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
const { logoSvg, logoPath, darkLogo, darkLogoPath, themeKey } = require('../scripts/shared.js');
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

test('the Agents logo is shown without the line "Knowledge assistant"', () => {
  const agents = content.products.find(product => product.id === 'agents');
  assert.deepEqual(content.products.filter(product => product.logoDescriptor === false), [agents], 'Only the Agents logo is a generated copy');
  assert(read(agents.logo).includes('fill-opacity="0.45"'), 'The supplied logo is left as it is');
  for (const file of [logoPath(agents), darkLogoPath(agents)]) {
    const svg = read(file);
    assert(!svg.includes('fill-opacity'), `${file} has no descriptor line`);
    assert.match(svg, /^<svg width="70" height="30" viewBox="0 0 70 30"/, `${file} is cropped to the icon and the name`);
    assert.equal((svg.match(/<path transform="translate\(0 7\.55\)"/g) || []).length, 3, `${file} centres the three letters of the name on the icon`);
  }
  assert.equal(logoSvg(agents).replace(/\r\n/g, '\n'), read(logoPath(agents)), 'Run npm run build to refresh the Agents logo');
  const html = home();
  assert(html.includes(`src="${logoPath(agents)}"`) && !html.includes('dex logo.svg'), 'The page shows the generated copy');
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
  for (const pillar of content.hero.pillars) assert(pillars.includes(`<span class="pb-index-role">${pillar.role}</span>`), `What the pillar is: ${pillar.name}`);
  assert(/DevOps/.test(content.hero.pillars[2].role), 'Platform Services names DevOps');
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
    assert.equal((entry.match(/<h5>/g) || []).length, product.technical ? 4 : 3, `${product.id}: built with, what it does and highlights`);
    assert.equal(product.screens.length, 3, `${product.id}: three screens`);
    for (const screen of product.screens) assert(screen.image && fs.existsSync(path.join(root, screen.image)), `${product.id}: screenshot exists: ${screen.title}`);
  }
  const suite = visibleText(between(html, 'id="products"', 'id="services"'));
  assert(!/The problem|For developers|Key APIs|Architecture|Integrations/.test(suite), 'No problem, developer, API, architecture or integration sections');
  assert(!/<pre|class="pb-code"/.test(between(html, 'id="products"', 'id="services"')), 'No code samples');
});

test('Agents is a tool for creating, configuring and automating agents and workflows', () => {
  const agents = content.products.find(product => product.id === 'agents');
  for (const text of [agents.action, agents.summary]) assert.match(text, /creat\w+, configur\w+ and automat\w+ AI agents and workflows/i);
  assert(agents.stack.some(item => item.includes('Microsoft Agent Framework')), 'Built with Microsoft Agent Framework');
  const entry = visibleText(between(home(), 'id="spec-agents"', '</article>'));
  for (const item of agents.stack) assert(entry.includes(item), `Built with: ${item}`);
  assert(!/knowledge assistant|iOS|Android/i.test(entry), 'Not presented as a knowledge assistant only');
});

test('only the IAM entry keeps a technical summary', () => {
  const html = home();
  assert.deepEqual(content.products.filter(product => product.technical).map(product => product.id), ['iam']);
  assert.equal((html.match(/class="pb-entry-specs"/g) || []).length, 1);
  const iam = between(html, 'id="spec-iam"', '</article>');
  const { technical } = content.products.find(product => product.id === 'iam');
  assert(iam.includes(`<h5>${technical.title}</h5>`));
  // Code is inline, so drop its tags before reading the text; otherwise "name." reads as "name ."
  const text = visibleText(iam.replace(/<\/?code>/g, ''));
  for (const item of technical.items) {
    assert(iam.includes(`<dt>${item.term}</dt>`), `Technical summary: ${item.term}`);
    assert(text.includes(item.text.replace(/`/g, '')), `Technical summary text: ${item.term}`);
  }
  for (const grant of ['totp', 'mfa', 'device_authentication', 'delegation', 'urn:indice:guest']) assert(iam.includes(`<code>${grant}</code>`), `Grant type: ${grant}`);
  assert(!iam.includes('`'), 'Backticks in the copy are rendered as code');
  const others = html.replace(iam, '');
  assert(!/<code/.test(between(others, 'id="products"', 'id="services"')), 'No code in the other entries');
});

test('the page does not use the mortar, bricks and builder analogy', () => {
  // The Cases reference has `builder` in its code samples, so the word is checked on the homepage only.
  for (const file of Object.keys(renderers)) assert(!/mortar|brick/i.test(read(file)), `${file}: no mortar or bricks, in the text or in class names`);
  assert(!/\bbuilder\b/i.test(visibleText(home())), 'The homepage does not call the team the builder');
  for (const file of ['scripts/content.js', 'css/site.css', 'scripts/render-home.js']) assert(!/mortar|brick/i.test(read(file)), `${file} does not keep the analogy`);
});

test('Questions is four questions answered at length, not a list of quick answers', () => {
  const html = between(home(), 'id="faq"', 'class="pb-ticker"');
  const text = visibleText(html);
  assert.equal(content.faq.items.length, 4);
  // The chapter has no title: its label is its heading, and the first question follows.
  assert(!content.faq.title && html.includes('<h2 class="pb-chapter-label" id="pb-faq-title"><span class="pb-chapter-no">§ 04</span>Questions</h2>'), 'The label is the heading');
  assert.equal((html.match(/<h2/g) || []).length, 1, 'No title above the questions');
  assert(!/<a href="#faq">.*?pb-toc-text.*?<\/a>/.test(home().match(/<a href="#faq">.*?<\/a>/)[0]), 'Contents lists the chapter by its name alone');
  assert.deepEqual([...html.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match => unescapeHtml(match[1])), content.faq.items.map(item => item.q));
  for (const item of content.faq.items) {
    assert(text.includes(item.short), `${item.q}: the answer in one line`);
    assert(item.paragraphs.length >= 2 && item.paragraphs.every(paragraph => paragraph.length > 200 && text.includes(paragraph)), `${item.q}: the reasoning`);
    assert(html.includes(`<a class="pb-question-link" href="${item.see.href}">${item.see.label}`), `${item.q}: links to where the page shows it`);
  }
  assert(!/Is this a SaaS/i.test(text));
  const ai = content.faq.items.find(item => /AI/.test(item.q));
  assert.match(ai.paragraphs.join(' '), /agents and workflows/, 'AI is placed as agents and workflows');
});

test('the IAM entry calls out the Duende partnership', () => {
  const html = home();
  const iam = between(html, 'id="spec-iam"', '</article>');
  assert(iam.includes('<aside class="pb-partner"') && iam.includes('official distributor and integrator of Duende Software'));
  assert(iam.includes('href="https://duendesoftware.com/" rel="noopener" target="_blank"'));
  assert.equal((html.match(/class="pb-partner"/g) || []).length, 1, 'Only the IAM entry has a partner panel');
});

test('Platform Services presents the five services, each with what it gives', () => {
  const services = between(home(), 'id="services"', 'id="faq"');
  const text = visibleText(services);
  const titles = ['Software development', 'Integration', 'DevOps', 'Ongoing support', 'Fintech experience'];
  assert.deepEqual(content.services.items.map(item => item.title), titles);
  const list = between(services, '<ol class="pb-service-list">', '</ol>\n      </section>');
  assert.deepEqual([...list.matchAll(/<h4>([^<]+)<\/h4>/g)].map(match => match[1]), titles);
  assert(text.includes(content.services.intro), 'The offer opens the chapter');
  for (const item of content.services.items) {
    assert(text.includes(item.tagline) && text.includes(item.text), `${item.title}: what it is`);
    const points = item.groups ? item.groups.flatMap(group => group.points) : item.points;
    assert(list.includes(`<h5>${item.pointsLabel}</h5>`) && points.length >= 3 && points.every(point => text.includes(point)), `${item.title}: what it gives`);
  }
  assert(text.includes('CVE patching'), 'Ongoing support names CVE patching');
  assert(!/\d+\s*(years|clients|customers|projects|engineers|%)/i.test(visibleText(list)), 'No figures that the sources do not give');
});

test('DevOps is a service of its own, covering cloud, release management and monitoring', () => {
  const devops = content.services.items.find(item => item.title === 'DevOps');
  assert.deepEqual(devops.groups.map(group => group.title), ['Cloud', 'Release management', 'Monitoring']);
  const html = home();
  const row = between(html, '<li class="pb-service pb-service-wide"', '</li>\n          <li class="pb-service"');
  assert.equal((html.match(/class="pb-service pb-service-wide"/g) || []).length, 1, 'Only DevOps is set across the row');
  assert.deepEqual([...row.matchAll(/<h6>([^<]+)<\/h6>/g)].map(match => match[1]), devops.groups.map(group => group.title));
  for (const group of devops.groups) assert(group.points.length >= 3 && group.points.every(point => visibleText(row).includes(point)), `DevOps: ${group.title}`);
  for (const target of ['Kubernetes', 'AKS', 'EKS', 'Azure Container Apps', 'OpenTelemetry', 'Health checks']) assert(visibleText(row).includes(target), `DevOps names ${target}`);
});

test('software development is not tied to a technology', () => {
  const development = content.services.items.find(item => item.title === 'Software development');
  assert(!/\.NET|Angular/.test([development.tagline, development.text, ...development.points].join(' ')));
});

test('Platform Services shows the path of an engagement and ends there, without a call to action', () => {
  const services = between(home(), 'id="services"', 'id="faq"');
  const steps = content.services.process.steps.map(step => step.title);
  assert.deepEqual(steps, ['Consult', 'Design', 'Build', 'Launch', 'Operate']);
  const path = between(services, '<ol class="pb-process">', '</ol>');
  assert.deepEqual([...path.matchAll(/<h4>([^<]+)<\/h4>/g)].map(match => match[1]), steps);
  for (const step of content.services.process.steps) assert(visibleText(path).includes(step.text), `Step: ${step.title}`);
  assert(!services.includes('pb-services-cta') && !/Tell us what you want to build/.test(services) && !content.services.cta, 'No call to action in the chapter');
  assert(!read('css/site.css').includes('pb-services-cta'), 'Nor its styles');
});

test('Plate II places one block per product on the foundation, and the next block is yours', () => {
  const html = home();
  const wall = between(html, '<figure class="pb-wall"', '</figure>');
  assert(html.indexOf('class="pb-wall"') > html.indexOf('id="services"') && html.indexOf('class="pb-wall"') < html.indexOf('id="faq"'));
  const names = [...wall.matchAll(/<text class="pb-block-name"[^>]*>([^<]+)<\/text>/g)].map(match => match[1]);
  assert.deepEqual(names, [...content.products.map(product => product.name), content.services.plate.yours]);
  assert.equal((wall.match(/class="pb-block-yours"/g) || []).length, 1, 'One block is the client\'s');
  assert(wall.includes(`>${content.services.plate.foundation}</text>`), 'The slab is the foundation');
  // Blocks in the same row sit side by side, a joint apart.
  const faces = [...wall.matchAll(/<rect class="pb-block-face" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)].map(match => match.slice(1).map(Number));
  assert.equal(faces.length, content.products.length + 1);
  for (const y of new Set(faces.map(face => face[1]))) {
    const row = faces.filter(face => face[1] === y).sort((a, b) => a[0] - b[0]);
    row.slice(1).forEach(([x], index) => assert(x > row[index][0] + row[index][2], 'Blocks in a row do not overlap'));
  }
  assert(wall.includes('aria-hidden="true"') && visibleText(between(wall, '<figcaption>', '</figcaption>')).includes(content.services.plate.text), 'The caption says what the drawing shows');
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

test('the tighter scrolled masthead takes the same room, so the page does not flicker near the top', () => {
  const css = read('css/site.css');
  const px = (rule, property) => Number(rule.match(new RegExp(`${property}:\\s*([\\d.]+)px`))?.[1] ?? NaN);
  const base = css.match(/\.pb-masthead \{[^}]*\}/)[0];
  const [, top, bottom] = base.match(/padding: (\d+)px [^;]* (\d+)px;/).map(Number);
  const scrolled = css.match(/\.is-scrolled \.pb-masthead \{[^}]*\}/)[0];
  const lost = top - px(scrolled, 'padding-top') + bottom - px(scrolled, 'padding-bottom');
  assert(lost > 0, 'The scrolled masthead is tighter');
  assert.equal(px(scrolled, 'margin-bottom'), lost, 'The margin gives back what the padding loses');
  assert.match(base, /transition: padding ([^,;]+), margin \1;/, 'Padding and margin move together');
});

test('hover bars start at the left edge of their cell and run its full width', () => {
  const css = read('css/site.css');
  for (const selector of ['.pb-practice-grid > li', '.pb-card']) {
    const escaped = selector.replace(/[.>]/g, '\\$&');
    assert.match(css, new RegExp(`${escaped}::before \\{[^}]*left: var\\(--bar-edge\\); width: \\d+px;`), `${selector}: the short rule starts at the cell edge`);
    assert.match(css, new RegExp(`${escaped}:hover::before \\{ width: calc\\(100% - var\\(--bar-edge\\)\\); \\}`), `${selector} fills its cell on hover`);
  }
  for (const row of ['service', 'question']) {
    assert.match(css, new RegExp(`\\.pb-${row}::before \\{[^}]*left: 0; width: \\d+px;`), `A ${row} row: the short rule starts at the row edge`);
    assert.match(css, new RegExp(`\\.pb-${row}:hover::before \\{ width: 100%; \\}`), `A ${row} row fills on hover`);
  }
  assert(!css.includes('--bar-from'), 'No bar starts part-way into its cell');
  assert(!/:hover::before \{[^}]*width: calc\(100% - \d+px\)/.test(css), 'No hover bar stops short of its cell');
});

test('each entry\'s reading meter follows its sticky aside from the start of the text to its end', () => {
  const html = home();
  const entries = content.products.length;
  assert.equal((html.match(/<div class="pb-entry-main" data-scrub>\s*<aside class="pb-entry-aside" data-scrub-pin>\s*<span class="pb-entry-meter" aria-hidden="true"><\/span>/g) || []).length, entries);
  assert.equal((html.match(/data-scrub(?=[ >])/g) || []).length, entries, 'Only the entry text is measured, not the screens below it');
  const script = read('js/common.js');
  assert(script.includes("track.querySelector('[data-scrub-pin]')") && script.includes('clamp(travelled / travel, 0, 1)'));
});

test('pages resolve their references and keep basic accessibility', () => {
  check();
});
