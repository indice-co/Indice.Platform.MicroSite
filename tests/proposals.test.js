'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
// Line endings depend on the checkout (core.autocrlf), so compare text with LF endings.
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
require('../js/data.js');
const { products } = globalThis.INDICE_DATA;
const content = require('../scripts/proposals/content.js');
const proposalB = require('../scripts/proposals/content-b.js');
const contentFor = file => file === 'index.html' ? proposalB.content : content;
const { pages: renderers } = require('../scripts/proposals/build.js');
const { renderShowcaseCss, renderScreensCss } = require('../scripts/proposals/showcase-css.js');
const { darkLogoPath, themeKey } = require('../scripts/proposals/shared.js');
const { highlight } = require('../scripts/highlight.js');

const proposals = { a: 'proposal-a.html', b: 'index.html', c: 'proposal-c.html' };
const defaultThemes = { a: 'light', b: 'dark', c: 'dark' };
const unescapeHtml = value => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const visibleText = html => unescapeHtml(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const showcaseBlock = html => {
  const start = html.indexOf('<section class="product-showcase"');
  const end = html.indexOf('</div>\n    </section>', start);
  assert(start >= 0 && end > start, 'Slider present');
  return html.slice(start, end + '</div>\n    </section>'.length);
};
/* Structure only: tags, ids, classes and data attributes. Text and logo images (themed per page) are ignored. */
const skeleton = html => html
  .replace(/<img class="product-logo[^>]*>/g, '')
  .match(/<\/?[a-z0-9]+(?:\s[^>]*)?>/g)
  .map(tag => tag.replace(/\s(?!(?:id|class|data-[\w-]+)=)[\w-]+(?:="[^"]*")?/g, '').replace(/ style="[^"]*"/g, ''))
  .join('');

test('proposal pages, slider styles and dark logos are generated from the current sources', () => {
  for (const [file, render] of Object.entries(renderers)) assert.equal(render(), read(file), `Run npm run build to refresh ${file}`);
  assert.equal(renderShowcaseCss(), read('css/proposals/showcase.css'), 'Run npm run build to refresh css/proposals/showcase.css');
  assert.equal(renderScreensCss(), read('css/proposals/screens.css'), 'Run npm run build to refresh css/proposals/screens.css');
  for (const product of products) {
    const svg = read(darkLogoPath(product));
    assert(!/#1C1A33|#777685/i.test(svg), `${product.id} dark logo has light wordmark colours`);
    assert.equal(svg.replace(/#F4F4F6/gi, '#1C1A33').replace(/#A9A8B8/gi, '#777685'), read(product.logo), `${product.id} dark logo only changes the wordmark colours`);
  }
  for (const { product } of proposalB.content.solutions) {
    const svg = read(proposalB.darkLogoPath(product));
    assert.equal(proposalB.darkLogo(product), svg, `Run npm run build to refresh Proposal B's ${product.id} dark logo`);
    const badge = svg.match(/<path\b[^>]*\sd="M[\d.]+ 2\.2202[^>]*>\s*(<path\b[^>]*>)\s*(<path\b[^>]*>)/);
    if (badge) assert(badge.slice(1).every(letter => letter.includes('fill="#1C1A33"')), `Proposal B's ${product.id} dark logo keeps the UI letters dark`);
  }
  assert.match(read(proposalB.darkLogoPath({ id: 'workers' })), /<path d="M12\.32 10\.67[^>]*fill="#1C1A33"/, 'Proposal B keeps the Workers gear dark');
});

test('Proposal B presents IAM, Cases, Messaging, Risk, Agents and Workers, with real copy for every solution', () => {
  const order = ['iam', 'cases', 'messaging', 'risk', 'agents', 'workers'];
  assert.deepEqual(proposalB.content.solutions.map(solution => solution.id), order);
  const html = read(proposals.b);
  assert.deepEqual([...html.matchAll(/<article class="pb-entry" id="spec-([a-z]+)"/g)].map(match => match[1]), order, 'Entries follow the solution order');
  for (const [id, file] of [['agents', 'dex'], ['workers', 'workers']]) {
    assert(html.includes(`src="assets/logos/${file} logo.svg"`) && html.includes(`href="assets/logos/${file} icon.svg"`), `${id} uses its supplied logo and icon`);
    const solution = proposalB.content.solutions.find(item => item.id === id);
    assert(solution.screens.every(screen => screen.image && !screen.mock), `${id} shows its screenshots`);
  }
  assert(!/Placeholder:/i.test(visibleText(html)), 'No placeholder copy is left');
  assert(html.includes('<span>Swift</span></figcaption>'), 'The Swift sample is labelled Swift');
  const iam = html.slice(html.indexOf('id="spec-iam"'), html.indexOf('</article>', html.indexOf('id="spec-iam"')));
  assert(iam.includes('<aside class="pb-partner"') && iam.includes('official distributor and integrator of Duende Software'), 'The IAM entry calls out the Duende partnership');
  assert(iam.includes('href="https://duendesoftware.com/" rel="noopener" target="_blank"'), 'The partnership links to Duende Software');
  assert.equal((html.match(/class="pb-partner"/g) || []).length, 1, 'Only the IAM entry has a partner panel');
});

test('proposals call IAM, Cases, Messaging and Risk "solutions" and never state how many there are', () => {
  for (const file of Object.values(proposals)) {
    const html = read(file);
    const text = visibleText(html);
    const attributes = [...html.matchAll(/(?:aria-label|alt|title|content|data-title|data-text)="([^"]*)"/g)].map(match => unescapeHtml(match[1])).join(' ');
    for (const source of [text, attributes]) {
      assert(!/\bproducts?\b/i.test(source), `${file} says "${source.match(/.{0,40}\bproducts?\b.{0,20}/i)?.[0]}"`);
      assert(!/\b(two|three|four|five|six|seven|eight|nine|ten|[1-9]\d*)\s+(solutions|products)\b/i.test(source), `${file} counts the solutions`);
      assert(!/\b0?\d\s*\/\s*0?\d\b/.test(source.replace(/\b\d+\s*\/\s*\d+\s*screens?\b/gi, '')), `${file} shows an "n / total" counter`);
    }
    assert(!/four(?!-eyes)/i.test(text), `${file} mentions "four" outside "four-eyes"`);
  }
});

test('headings never crop descenders, B keeps its masthead in view and C outlines stay visible', () => {
  for (const id of ['a', 'b', 'c']) {
    const css = read(`css/proposals/proposal-${id}.css`);
    assert(css.includes(`.p${id}-w { display: inline-block; overflow-x: visible; overflow-y: clip; vertical-align: top; padding: .06em 0 .28em; margin: -.06em 0 -.28em; }`), `proposal ${id} word wrappers leave room for descenders`);
    assert(!/text-stroke[^;]*currentColor/.test(css), `proposal ${id} never outlines in currentColor next to transparent text`);
  }
  const b = read('css/proposals/proposal-b.css');
  assert.match(b, /\.pb-masthead \{\s*position: sticky; top: 0;/, 'B masthead is sticky');
  assert.match(b, /scroll-padding-top: calc\(var\(--mast-h\) \+ 20px\)/, 'B anchors land below the masthead');
});

test('Proposals B and C keep a GitHub link fixed on screen', () => {
  for (const [file, cls] of [[proposals.b, 'pb-gh'], [proposals.c, 'pc-gh']]) {
    const html = read(file);
    const repo = file === proposals.b ? proposalB.githubRepo : 'https://github.com/indice-co';
    assert(html.includes(`<a class="gh-tab ${cls}" href="${repo}" rel="noopener" target="_blank">`), `${file} has the GitHub tab`);
    assert(html.indexOf('class="gh-tab') > html.indexOf('</main>'), `${file} GitHub tab sits outside the main content`);
  }
  assert.match(read('css/proposals/common.css'), /\.gh-tab \{\s*position: fixed;[^}]*right: 0; top: 50%;/, 'Fixed to the middle of the right edge');
});

test('Proposal A hero has one call to action, pointing down to the solutions', () => {
  const html = read(proposals.a);
  const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('<figure class="pa-map"'));
  assert(!hero.includes('data-demo'), 'The demo button lives in the header and the closing band, not in the hero');
  assert.match(hero, /<a class="pa-btn [^"]*" href="#products"[^>]*>[^<]+<svg class="icon-arrow"[^>]*><path d="M10 4v12M5 11l5 5 5-5"\/><\/svg><\/a>/, 'Explore the solutions points down');
});

test('Proposal B is decorated with an illustrated plate and a halftone sun drawn from the solution list', () => {
  const html = read(proposals.b);
  const plate = html.slice(html.indexOf('<figure class="pb-plate"'), html.indexOf('</figure>', html.indexOf('<figure class="pb-plate"')));
  assert(plate.includes('<svg class="pb-plate-svg"') && plate.includes('aria-hidden="true"'), 'Decorative diagram hidden from assistive technology');
  assert(plate.includes('<figcaption class="pb-plate-caption">'), 'The plate is captioned');
  assert.equal((plate.match(/class="pb-node-disc"/g) || []).length, proposalB.content.solutions.length, 'One node per solution');
  assert.equal((plate.match(/class="pb-node-ghost"/g) || []).length, 1, 'An open slot for the next solution');
  assert(html.indexOf('class="pb-plate"') > html.indexOf('id="platform"') && html.indexOf('class="pb-plate"') < html.indexOf('id="products"'), 'The plate sits between §01 and §02');
  assert(html.includes('<div class="pb-sun" aria-hidden="true" data-parallax='), 'A sun rises behind the closing section');
  const css = read('css/proposals/proposal-b.css');
  assert.match(css, /\.pb-card-logo \.product-logo \{ width: auto; height: 38px;/, 'Suite logos are 20% larger than the 32px of the previous round');
  assert.match(css, /\.pb-gallery-head \{[^}]*border-top: 1px solid var\(--border\);/, 'The line above each screen library is grey');
  assert.match(css, /\.pb-gallery-progress span \{[^}]*background: var\(--accent-mark\);/, 'The library progress bar is orange');
  assert.match(css, /\.pb-entry \{ padding: 56px 0 0; border-top: 3px solid var\(--rule\); \}/, 'Entries are separated by a heavy dark rule');
  assert.match(css, /\.pb-entry \+ \.pb-entry \{ margin-top: 80px; \}/, '80px below the previous library');
});

test('Proposal A keeps the original Solutions slider structure and behaviour hooks', () => {
  const original = skeleton(showcaseBlock(read('original.html')));
  const html = read(proposals.a);
  assert.equal(skeleton(showcaseBlock(html)), original, 'Proposal A slider markup matches the original structure');
  assert(html.includes('<script defer src="js/data.js"></script>') && html.includes('<script defer src="js/showcase.js"></script>'), 'Proposal A runs the original slider script');
  assert(html.indexOf('js/data.js') < html.indexOf('js/showcase.js'));
  assert(html.includes('href="css/proposals/showcase.css"') && html.includes('href="css/proposals/showcase-theme.css"'));
  assert.match(html, /<ul class="product-grid[^"]*">[\s\S]*<\/section>\s*<a class="skip-showcase" href="#specs">[^<]+<\/a>\s*<section class="product-showcase"/, 'Proposal A enters the slider from the product grid');
  assert.match(html, /<section class="[^"]*" id="products"/, 'Proposal A keeps #products for the slider\u2019s grid handoff');
  assert.deepEqual([...showcaseBlock(html).matchAll(/data-select-product="([^"]+)"/g)].map(match => match[1]), products.map(product => product.id));
});

test('Proposals B and C drop the slider and present how each solution works inside the suite section', () => {
  for (const file of [proposals.b, proposals.c]) {
    const html = read(file);
    assert(!html.includes('product-showcase') && !html.includes('js/showcase.js') && !html.includes('css/proposals/showcase'), `${file} has no Solutions slider`);
    assert(!html.includes('data-product-link'), `${file} links point at sections that exist without the slider`);
    const suiteStart = html.indexOf('id="products"');
    const suiteEnd = html.indexOf('id="services"');
    assert(suiteStart > 0 && suiteEnd > suiteStart);
    for (const id of ['specs', ...content.solutions.map(solution => `spec-${solution.id}`)]) {
      const at = html.indexOf(`id="${id}"`);
      assert(at > suiteStart && at < suiteEnd, `${file} shows #${id} inside the suite section`);
    }
    for (const solution of content.solutions) {
      const learnMore = new RegExp(`<a[^>]*href="#spec-${solution.id}"[^>]*>${content.ui.learnMore}`);
      assert.match(html, learnMore, `${file} ${solution.id} card links to its details`);
      if (file === proposals.b && solution.id !== 'cases') {
        assert(html.includes(`<span class="pb-link-disabled" role="link" aria-disabled="true">${content.ui.details}`), `${file} ${solution.id} technical details are disabled`);
      } else {
        const details = solution.id === 'cases'
          ? file === proposals.b ? proposalB.referencePage : 'cases-reference.html'
          : `#spec-${solution.id}-architecture`;
        assert(html.includes(`href="${details}">${content.ui.details}`), `${file} ${solution.id} technical details link`);
      }
    }
  }
});

test('Proposal B enables Technical details only for Cases', () => {
  const html = read('index.html');
  const cards = html.slice(html.indexOf('<div class="pb-cards">'), html.indexOf('<section class="pb-guide"'));
  const technicalLinks = [...cards.matchAll(/<a href="([^"]+)">Technical details/g)].map(match => match[1]);
  assert.deepEqual(technicalLinks, [proposalB.referencePage]);
  for (const solution of proposalB.content.solutions.filter(solution => solution.id !== 'cases')) {
    const card = cards.match(new RegExp(`<article class="pb-card"[^>]*aria-labelledby="pb-card-${solution.id}"[\\s\\S]*?</article>`))?.[0];
    assert(card?.includes('<span class="pb-link-disabled" role="link" aria-disabled="true">Technical details'), `${solution.name} technical details are disabled`);
    assert(card?.includes(`<span class="sr-only"> for ${solution.name}</span></span>`), `${solution.name} disabled label is associated with its solution`);
  }
});

test('the slider shows homepage-only revised copy in Proposal A and the original copy on original.html', () => {
  const index = read('original.html');
  const { chapters, cases } = content.slider;
  const slider = visibleText(showcaseBlock(read(proposals.a)));
  for (const chapter of Object.values(chapters)) {
    assert(slider.includes(chapter.title) && slider.includes(chapter.description), `Proposal A shows ${chapter.title}`);
  }
  for (const text of [cases.kicker, cases.title, cases.intro, cases.intake.text, ...cases.intake.list, cases.workflow.title,
    ...cases.workflow.features.map(feature => feature.text), cases.governance.title, ...cases.governance.lines, cases.governance.ownership.text]) {
    assert(slider.includes(text), `Proposal A shows revised Cases text: ${text}`);
  }
  for (const product of products) assert(!slider.includes(product.description), `Proposal A no longer shows the original ${product.id} description`);
  assert(!slider.includes('Operational workflows, engineered to evolve.'));
  assert(index.includes('Operational workflows, engineered to evolve.'), 'original.html keeps its slider copy');
  for (const product of products.filter(item => item.id !== 'cases')) {
    assert(visibleText(index).includes(product.description), `original.html keeps the ${product.id} description`);
  }
});

test('the revised Cases slider heading is no longer than the original, so the pinned heading keeps its height', () => {
  // The pinned heading is absolutely positioned above step text that starts at a fixed offset; longer copy overlaps it.
  const original = read('original.html').match(/<h3 id="title-cases">([^<]+)<\/h3>\s*<p>([^<]+)<\/p>/);
  assert(original, 'original.html has the original Cases heading');
  const [, title, intro] = original.map(unescapeHtml);
  assert(content.slider.cases.title.length <= title.length + 4, `Cases slider title fits the original two lines: ${content.slider.cases.title}`);
  assert(content.slider.cases.intro.length <= intro.length, `Cases slider intro is no longer than the original: ${content.slider.cases.intro}`);
});

test('internal Solution pages keep their own sources and text', () => {
  const reference = read('cases-reference.html');
  for (const file of ['scripts/render-cases.js', 'scripts/render-cases-article.js']) assert(!read(file).includes('proposals/'), `${file} does not read proposal copy`);
  for (const text of [content.hero.title, content.slider.cases.title, content.solutions[0].summary, content.solutions[0].problem]) {
    assert(!reference.includes(text), 'The Cases reference does not show homepage-only copy');
  }
  assert(reference.includes('Cases technical reference'));
  for (const file of Object.values(proposals)) {
    const html = read(file);
    const reference = file === proposals.b ? proposalB.referencePage : 'cases-reference.html';
    assert(html.includes(`href="${reference}"`), `${file} links to the Cases reference`);
    assert(!/href="(?!cases-reference\.html|proposal-b-cases-reference\.html|index\.html|original\.html|terminal\.html|blueprint\.html|proposal-[ac]\.html|#|https:\/\/github\.com\/indice-co|https:\/\/duendesoftware\.com\/|css\/|assets\/)/.test(html), `${file} links only to existing pages`);
  }
});

test('Proposal B has its own Cases technical reference with the original page\u2019s text', () => {
  const page = read(proposalB.referencePage);
  const original = read('cases-reference.html');
  const text = (html, start, end) => visibleText(html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start))));
  // Proposal B leaves out the short "For developers" chapter; everything else matches the original page.
  const withoutDevelopers = html => html.replace(/<h2 id="article-for-developers"[\s\S]*?(?=<h3 )/, '').replace(/<li><a class="cases-toc-link" href="#article-for-developers">[^<]*<\/a><\/li>/, '');
  assert(!page.includes('article-for-developers'), 'No "For developers" chapter or contents entry');
  assert.equal(text(page, '<article class="cases-article', '</article>'), text(withoutDevelopers(original), '<article class="cases-article', '</article>'), 'Same article');
  const links = html => [...html.matchAll(/<a class="cases-toc-link" href="(#[^"]+)">([^<]*)<\/a>/g)].map(match => `${match[1]} ${match[2]}`);
  assert.deepEqual(links(page), links(withoutDevelopers(original)), 'Same contents links and anchors');
  assert(page.indexOf('href="#article-cases"') < page.indexOf('<h3 class="cases-toc-category">The product</h3>'), 'Overview sits above the product group');
  assert(page.includes('<h3 class="cases-toc-category">For developers</h3>'), 'The developer group is labelled For developers');
  assert(page.includes('data-default-theme="dark"') && page.includes('href="css/proposals/proposal-b.css"') && page.includes('href="css/proposals/proposal-b-reference.css"'), 'Set in Proposal B\u2019s design');
  assert(page.includes('<script defer src="js/cases-article.js"></script>') && page.includes('<dialog class="flowchart-dialog'), 'Keeps the contents highlighting, chapter links and diagrams');
  for (const file of [proposals.a, proposals.c]) assert(!read(file).includes(proposalB.referencePage), `${file} keeps the original reference`);
});

test('every proposal offers a light and a dark theme, starting from its own default', () => {
  const tokens = ['--bg', '--fg', '--fg-muted', '--border', '--surface-raised', '--surface-sunken', '--focus-ring'];
  for (const [id, file] of Object.entries(proposals)) {
    const html = read(file);
    const css = read(`css/proposals/proposal-${id}.css`);
    for (const token of tokens) assert.match(css, new RegExp(`${token}: light-dark\\(`), `proposal ${id} defines ${token} for both themes`);
    assert.match(css, new RegExp(`^  :root \\{\\n    color-scheme: ${defaultThemes[id]};`, 'm'), `proposal ${id} renders ${defaultThemes[id]} before a theme is chosen`);
    assert.match(css, /:root\[data-theme="light"\] \{ color-scheme: light; \}/);
    assert.match(css, /:root\[data-theme="dark"\] \{ color-scheme: dark; \}/);
    assert.match(css, /^@layer proposal \{/m, `proposal ${id} styles sit in the proposal layer`);
    assert.match(html, new RegExp(`<html lang="en" data-proposal="${id}" data-default-theme="${defaultThemes[id]}">`));
    const head = html.slice(0, html.indexOf('</head>'));
    const bootstrap = head.indexOf(`localStorage.getItem('${themeKey(id)}')`);
    assert(bootstrap > 0 && bootstrap < head.indexOf('<link rel="stylesheet"'), `proposal ${id} applies its own stored theme before styles load`);
    assert(head.includes(`t='${defaultThemes[id]}'`), `proposal ${id} falls back to ${defaultThemes[id]}`);
    assert(!head.includes('prefers-color-scheme'), `proposal ${id} ignores the system theme until the visitor chooses`);
    const toggles = html.match(/<button type="button"[^>]*data-theme-toggle[^>]*aria-pressed="(?:true|false)"/g) || [];
    const segmented = html.match(/data-theme-set="(light|dark)" aria-pressed/g) || [];
    assert(toggles.length || segmented.length === 2, `proposal ${id} has a theme control`);
    assert(html.includes(id === 'b' ? 'assets/logos/on-dark/proposal-b/cases-logo.svg' : 'assets/logos/on-dark/cases-logo.svg'), `proposal ${id} has dark-theme product logos`);
  }
  const runtime = read('js/proposals/common.js');
  assert(runtime.includes("indice-proposal-${root.dataset.proposal || 'default'}-theme") && !runtime.includes('prefers-color-scheme'), 'The runtime keeps one theme per proposal and no system default');
  const theme = read('css/proposals/showcase-theme.css');
  for (const token of ['--ink: var(--fg)', '--muted: var(--fg-muted)', '--paper: var(--surface-raised)', '--beige: var(--surface-sunken)', '--line: var(--border)']) {
    assert(theme.includes(token), `slider token mapped: ${token}`);
  }
});

test('all three proposals are set in Manrope and keep distinct navigation and styles', () => {
  for (const [id, file] of Object.entries(proposals)) {
    const html = read(file);
    const css = read(`css/proposals/proposal-${id}.css`);
    assert(html.includes('<link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>'), `proposal ${id} preloads Manrope`);
    assert.match(css, /@font-face \{\n  font-family: Manrope;\n  src: url\('\.\.\/\.\.\/assets\/fonts\/manrope-variable\.ttf'\)/);
    assert.match(css, /--font-sans: Manrope,/, `proposal ${id} sets text in Manrope`);
    const families = [...css.matchAll(/font-family: ([^;]+);/g)].map(match => match[1].trim());
    assert(families.every(family => /^(Manrope|'JetBrains Mono'|var\(--font-(?:sans|mono)\))$/.test(family)), `proposal ${id} declares only Manrope and JetBrains Mono (for code): ${families}`);
    assert(!/Geist|Instrument|Archivo/.test(css + html), `proposal ${id} no longer uses the first-round typefaces`);
  }
  for (const font of ['geist-variable.woff2', 'instrument-sans-variable.woff2', 'archivo-variable.woff2']) {
    assert(!fs.existsSync(path.join(root, 'assets/fonts', font)), `Unused font removed: ${font}`);
  }
  const a = read(proposals.a); const b = read(proposals.b); const c = read(proposals.c);
  assert(a.includes('class="pa-header"') && a.includes('aria-controls="pa-solutions-menu" data-menu-toggle') && a.includes('data-tabs'), 'A: sticky bar, solutions menu, tabbed specs');
  assert(b.includes('<dialog class="pb-dialog" id="pb-contents"') && b.includes('data-progress') && b.includes('class="pb-entry"'), 'B: contents dialog, reading progress, long-form entries');
  assert(c.includes('data-spy="platform"') && c.includes('<dialog class="pc-menu"') && /<details class="pc-spec" id="spec-cases"[^>]* open>/.test(c), 'C: cell bar with section highlighting, menu dialog, expandable rows');
  assert(!c.includes('data-spy="specs"'), 'C: how each solution works is part of Solutions, not its own section');
});

test('every proposal has a back-to-top control that appears after the first screen', () => {
  for (const file of Object.values(proposals)) {
    const html = read(file);
    const links = html.match(/<a class="to-top [^"]+" href="#hero" data-to-top aria-label="Back to top">/g) || [];
    assert.equal(links.length, 1, `${file} has one back-to-top link`);
    assert(html.indexOf('data-to-top') > html.indexOf('</main>'), `${file} back-to-top sits outside the main content`);
  }
  const common = read('css/proposals/common.css');
  assert.match(common, /\.to-top \{[^}]*position: fixed;[^}]*visibility: hidden;/, 'Hidden at the top of the page');
  assert.match(common, /\.show-to-top \.to-top \{ visibility: visible; opacity: 1;/, 'Shown once the page has scrolled');
  const runtime = read('js/proposals/common.js');
  assert(runtime.includes("root.classList.toggle('show-to-top', y > innerHeight * 0.9 && !pinned)"), 'Shown after the first screen, hidden over the pinned slider');
  assert(runtime.includes("closest('[data-to-top]')") && runtime.includes("behavior: motion() ? 'smooth' : 'instant'"), 'Scrolls home, instantly for reduced motion');
});

test('Proposal A: decorated background, parallax, a full-width row of larger product cards and a full-bleed close', () => {
  const html = read(proposals.a);
  const css = read('css/proposals/proposal-a.css');
  assert(html.includes('<div class="pa-backdrop" aria-hidden="true"></div>'), 'A page-wide decorative layer');
  assert.match(css, /\.pa-backdrop \{\s*position: fixed;[^}]*radial-gradient/, 'A fixed dot pattern behind the page');
  const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('</section>', html.indexOf('id="hero"')));
  const contact = html.slice(html.indexOf('id="contact"'), html.indexOf('</section>', html.indexOf('id="contact"')));
  assert(/data-parallax="/.test(hero) && /data-parallax="/.test(contact), 'Parallax in the hero and in the closing band');
  assert.match(css, /\.pa-suite \{ max-width: none; \}/, 'The suite spans the full width');
  assert.match(css, /\.pa-product-grid \{[^}]*grid-auto-flow: column;/, 'Product cards sit in one row');
  assert(!/\.pa-product-grid \{[^}]*grid-template-columns/.test(css), 'No two-by-two grid');
  const logo = Number(css.match(/\.pa-tile-logo \.product-logo \{ width: auto; height: (\d+)px; \}/)[1]);
  assert(logo >= 36, `Card logos are at least 20% larger than the 30px of the first round: ${logo}px`);
  assert(!/\.pa-contact \{[^}]*max-width/.test(css), 'The closing band runs edge to edge');
  assert(html.includes('class="pa-ring"'), 'Back to top shows reading progress');
  for (const hook of ['data-spotlight', 'data-tilt', 'data-magnetic', 'data-velocity']) assert(html.includes(hook), `A uses ${hook}`);
});

test('Proposal B ends each solution entry with a hover-scrolled library of labelled screens that open in a viewer', () => {
  const html = read(proposals.b);
  assert.equal((html.match(/<dialog class="lightbox [^"]+" id="screen-viewer"/g) || []).length, 1, 'One screen viewer');
  for (const solution of proposalB.content.solutions) {
    const start = html.indexOf(`id="spec-${solution.id}"`);
    const entry = html.slice(start, html.indexOf('</article>', start));
    const strip = entry.match(/<ul class="pb-strip" id="(pb-strip-[a-z]+)" data-hover-scroll aria-labelledby="(pb-gallery-[a-z]+)">/);
    assert(strip, `${solution.id} entry has a gallery strip`);
    assert(entry.includes('data-shot-group'), `${solution.id} screens page through as one group`);
    assert.equal((entry.match(new RegExp(`data-scroll-step="-?1" aria-controls="${strip[1]}"`, 'g')) || []).length, 2, `${solution.id} gallery has back and forward buttons`);
    assert.equal((entry.match(/<figure class="pb-shot" data-shot /g) || []).length, solution.screens.length, `${solution.id} shows every screen`);
    for (const screen of solution.screens) {
      assert(entry.includes(`<figcaption><b>${screen.title.replace(/&/g, '&amp;')}</b><span>`), `${solution.id} screen labelled: ${screen.title}`);
      assert(entry.includes(`aria-label="Enlarge ${solution.name} screen: ${screen.title.replace(/&/g, '&amp;')}"`), `${solution.id} screen opens: ${screen.title}`);
    }
    assert(entry.lastIndexOf('pb-gallery') > entry.indexOf('pb-entry-body'), `${solution.id} gallery closes the entry`);
  }
  const runtime = read('js/proposals/common.js');
  assert(runtime.includes("querySelectorAll('[data-hover-scroll]')") && runtime.includes('const edge = 0.3;'), 'The strip scrolls towards the pointer near either edge');
});

test('Proposal C ends each solution row with a button that expands a panel of its screens', () => {
  const html = read(proposals.c);
  assert.equal((html.match(/<dialog class="lightbox [^"]+" id="screen-viewer"/g) || []).length, 1, 'One screen viewer');
  for (const solution of content.solutions) {
    const start = html.indexOf(`id="spec-${solution.id}"`);
    const row = html.slice(start, html.indexOf('</details>', start));
    assert(row.includes(`<button type="button" class="pc-expand" data-expand aria-expanded="false" aria-controls="pc-screens-${solution.id}">`), `${solution.id} has a screens button`);
    assert(row.includes(`<div class="pc-screens" id="pc-screens-${solution.id}" data-expand-panel`), `${solution.id} has a screens panel`);
    assert(row.indexOf('pc-expand') > row.indexOf('pc-spec-dev'), `${solution.id} button sits at the bottom of the row`);
    assert.equal((row.match(/<figure class="pc-shot" data-shot /g) || []).length, solution.screens.length, `${solution.id} panel shows every screen`);
  }
  const common = read('css/proposals/common.css');
  assert(common.includes('.js [data-expand-panel]:not(.is-open) { display: none; }') && common.includes('html:not(.js) [data-expand] { display: none; }'), 'Panels stay open without JavaScript');
  const css = read('css/proposals/proposal-c.css');
  assert(css.includes('.pc-screens.is-open::after { animation: pc-sweep') && css.includes('.pc-screens.is-open .pc-shot-cell'), 'Opening sweeps the panel and staggers the screens');
});

test('screens are honest: approved screenshots, labelled illustrations or labelled placeholders', () => {
  const approved = ['assets/uis/cases dashboard.png', 'assets/uis/iam dashboard.png', 'assets/uis/messaging dashboard.png'];
  const images = content.solutions.flatMap(solution => solution.screens.filter(screen => screen.image).map(screen => screen.image));
  assert.deepEqual(images.sort(), approved.sort(), 'Only the approved screenshots are used');
  for (const image of approved) assert(fs.existsSync(path.join(root, image)), `${image} exists`);
  for (const file of [proposals.b, proposals.c]) {
    const html = read(file);
    const placeholders = contentFor(file).solutions.flatMap(solution => solution.screens.filter(screen => !screen.image && !screen.mock));
    assert.equal((html.match(/<span class="ph-label" aria-hidden="true">Screenshot pending<\/span>/g) || []).length, placeholders.length, `${file} labels every placeholder`);
    const illustrations = contentFor(file).solutions.flatMap(solution => solution.screens.filter(screen => screen.mock)).length;
    assert.equal((html.match(/<span class="shot-badge">Illustrative<\/span>/g) || []).length, illustrations, `${file} labels every illustration`);
  }
});

test('the hero states what is offered, who it serves and what each solution does', () => {
  for (const file of Object.values(proposals)) {
    const html = read(file);
    const hero = visibleText(html.slice(html.indexOf('id="hero"'), html.indexOf('</section>', html.indexOf('id="hero"'))));
    const { hero: copy, solutions } = contentFor(file);
    assert(hero.includes(copy.title) && hero.includes(copy.lede), `${file} hero has the offer and the audience`);
    for (const solution of solutions) assert(hero.includes(solution.name) && hero.includes(solution.action), `${file} hero lists ${solution.name}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  }
});

test('solution copy explains the problem, how it works, architecture and integrations with documented facts', () => {
  const facts = {
    cases: ['JSON Schema', 'Elsa 2', 'CasesDb', 'WorkflowDb', 'IContactProvider', 'manage/cases/{id}/actions'],
    iam: ['Duende IdentityServer', 'FIDO2', '/mfa', 'impossible travel', 'GovGr', 'my/account/*'],
    messaging: ['messages:send', 'Handlebars', 'Azure Notification Hubs', 'Service Bus', 'Reached, Engaged, Acted and Coverage'],
    risk: ['POST api/risk', 'ResultId', 'GeoLite2', 'Sum or Maximum', 'RiskDb']
  };
  const banned = /\b(seamless(ly)?|robust|cutting[- ]edge|world[- ]class|best[- ]in[- ]class|state[- ]of[- ]the[- ]art|next[- ]generation|revolutionary|game[- ]chang\w*|empower\w*|unlock\w*|supercharge\w*|leverag\w*|synerg\w*|turnkey|holistic|innovative|blazing|effortless\w*|delight\w*)\b/i;
  for (const file of Object.values(proposals)) {
    const html = read(file);
    const text = visibleText(html);
    assert(!banned.test(text), `${file}: ${text.match(banned)?.[0]}`);
    assert(!/next release/i.test(text), `${file} does not advertise unreleased features`);
    for (const solution of content.solutions) {
      const spec = visibleText(html.slice(html.indexOf(`id="spec-${solution.id}"`), html.indexOf(`id="spec-${solution.id}"`) + 20000));
      for (const part of [solution.problem, solution.architecture, ...solution.how, ...solution.integrations]) {
        assert(spec.includes(part), `${file} ${solution.id} spec includes: ${part.slice(0, 40)}`);
      }
      for (const fact of facts[solution.id]) assert(text.includes(fact), `${file} mentions ${fact}`);
    }
  }
  const cases = read('cases-product.md');
  for (const line of content.solutions[0].code.source.split('\n')) assert(cases.includes(line), `Cases code sample is quoted verbatim: ${line}`);
  for (const solution of content.solutions) {
    assert.equal(unescapeHtml(highlight(solution.code.language, solution.code.source).replace(/<[^>]+>/g, '')), solution.code.source);
  }
});

test('proposal pages resolve their references and keep basic accessibility', () => {
  for (const file of Object.values(proposals)) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file} ids are unique`);
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `${file} anchor exists: ${target}`);
    for (const [, refs] of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
      for (const ref of refs.split(' ')) assert(ids.includes(ref), `${file} ARIA target exists: ${ref}`);
    }
    for (const [, ref] of html.matchAll(/\b(?:src|href)="((?:assets|css|js)\/[^"#]+|[a-z-]+\.html)"/g)) {
      assert(fs.existsSync(path.join(root, decodeURI(unescapeHtml(ref)))), `${file} local reference exists: ${ref}`);
    }
    for (const [, url] of html.matchAll(/url\('([^']+)'\)/g)) assert(fs.existsSync(path.join(root, url)), `${file} mask icon exists: ${url}`);
    for (const [, attrs] of html.matchAll(/<button\b([^>]*)>/g)) assert(/\btype="button"/.test(attrs), `${file} buttons do not submit`);
    for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/g)) assert(/\balt="/.test(attrs), `${file} images have alt text`);
    for (const [tag] of html.matchAll(/<a [^>]*href="https?:\/\/[^"]+"[^>]*>/g)) assert(/rel="noopener"/.test(tag) && /target="_blank"/.test(tag), `${file} external link is safe: ${tag}`);
    assert(html.includes('<a class="skip-link" href="#main">') && html.includes('<main id="main"'));
    assert(/<html lang="en"/.test(html));
  }
  for (const id of Object.keys(proposals)) {
    const css = read(`css/proposals/proposal-${id}.css`);
    assert(css.includes('prefers-reduced-motion'), `proposal ${id} respects reduced motion`);
    for (const [, url] of css.matchAll(/url\('([^']+)'\)/g)) assert(fs.existsSync(path.resolve(root, 'css/proposals', url)), `proposal ${id} font exists: ${url}`);
  }
});

test('the generated slider stylesheet covers every slider rule and nothing from the original page design', () => {
  const css = read('css/proposals/showcase.css');
  const source = read('css/styles.css');
  const count = (text, pattern) => (text.match(pattern) || []).length;
  const slider = /\.(story-enhanced|case-beat|preview-panel|product-chapter|product-navigation|cases-story-heading)\b/g;
  assert.equal(count(css, slider), count(source, slider), 'All slider rules are copied');
  assert(!/\.(hero|floating-nav|foundation|expertise|contact|pillar|tile-|technolog)/.test(css), 'No other homepage sections are copied');
  assert(!/^(html|body)\b/m.test(css), 'Page-level rules are not copied');
  assert.match(css, /margin-top:-780px/, 'The panel still enters over the product grid');
});
