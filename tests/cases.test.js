const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
require('../js/data.js');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'cases-reference.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const { products } = globalThis.INDICE_DATA;

test('Cases has one generated internal page: the technical reference', () => {
  assert(fs.existsSync(path.join(root, 'cases-reference.html')));
  assert(!fs.existsSync(path.join(root, 'cases.html')));
  assert(!fs.existsSync(path.join(root, 'cases-0.2.html')));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert(html.includes('Cases technical reference'));
  assert(!html.includes('Cases by Indice'));
  assert(html.includes('IContactProvider'));
  assert(html.includes('AddTranslationsResource'));
  assert.match(html, /<h2 id="article-for-developers" class="article-chapter">[\s\S]*?<\/h2>\s*<p>This technical reference covers the hosting model, architecture, integration contracts, configuration and extension points your engineering team uses to deploy and operate Cases\.<\/p>/);
  assert(html.includes('(next release)'));
  assert.equal((html.match(/<pre class="mermaid"/g) || []).length, 4);
  assert.equal((html.match(/<table>/g) || []).length, 3);
  assert(html.includes('class="language-csharp"'));
});

test('homepage carousel and Suite panel point to the sole Cases page', () => {
  const cases = products.find(product => product.id === 'cases');
  assert.equal(cases.destination, 'cases-reference.html');
  assert(home.includes('class="button explore-button" href="cases-reference.html"'));
  assert(home.includes('class="panel-product" href="cases-reference.html"'));
  assert(home.includes('<div class="panel-heading"><span>Suite Solutions</span></div>'));
  assert(!home.includes('class="panel-note"'));
  assert(home.includes('Explore all solutions'));
  assert(!home.includes('Cases 0.2'));
  assert(!home.includes('href="cases.html"'));
  assert(!html.includes('class="cases-page-links"'));
  assert.equal((html.match(/class="cases-toc-link"/g) || []).length, 8);
  assert.equal((html.match(/class="chapter-copy"/g) || []).length, 8);
  assert.equal((html.match(/data-copy-anchor/g) || []).length, 8);
  assert(html.includes('id="chapter-copy-status" role="status" aria-live="polite"'));
  const chapters = [...html.matchAll(/<h[23] id="([^"]+)" class="article-chapter">([\s\S]*?)<\/h[23]>/g)];
  assert.equal(chapters.length, 8);
  for (const [, id, content] of chapters) {
    assert.match(content, /<button class="chapter-copy" type="button" data-copy-anchor[^>]*aria-label="Copy link to /, id);
    assert(!content.includes('class="chapter-anchor"'), id);
  }
  assert(html.includes('class="cases-toc-link" href="#article-2-flows"'));
  assert(html.includes('class="cases-toc-category">Product</h3>'));
  assert(html.includes('class="cases-toc-category">Developer reference</h3>'));
  assert(!html.includes('cases-toc-number'));
  assert(html.includes('<nav class="cases-toc-nav" aria-label="Technical reference sections">'));
  assert(!html.includes('class="floating-nav"'));
  assert(!html.includes('id="site-nav"'));
  assert.equal((html.match(/data-flowchart-open/g) || []).length, 4);
  assert.equal((html.match(/data-flowchart-orientation="horizontal"/g) || []).length, 3);
  assert.equal((html.match(/data-flowchart-orientation="vertical"/g) || []).length, 1);
  assert(html.includes('aria-label="Open larger view of 4.1 High-level architecture"'));
  for (const numberedTitle of ['1. Core features &amp; capabilities', '2. Flows', '3. Where Cases shines', '4. Architecture &amp; hosting', '5. Feature internals &amp; integration', '6. Configuration']) {
    assert(html.includes(`<span class="chapter-heading-text">${numberedTitle}</span>`));
  }
  assert(!html.includes('🧰 1. Core features &amp; capabilities'));
  assert(!html.includes('🔄 2. Flows'));
  assert(html.includes('<dialog class="flowchart-dialog"'));
  const articleCss = fs.readFileSync(path.join(root, 'css/cases-article.css'), 'utf8');
  assert(articleCss.includes('.cases-toc-link[aria-current="location"]'));
  assert(articleCss.includes('background:transparent'));
  assert(articleCss.includes('.cases-article tbody tr:hover td'));
  assert(articleCss.includes('.cases-article .mermaid svg g.node:hover .label-container'));
  assert(articleCss.includes('.flowchart-dialog-canvas svg g.node:hover .label-container'));
  assert(articleCss.includes('.flowchart-dialog[data-flowchart-orientation="horizontal"] .flowchart-dialog-canvas'));
  assert(articleCss.includes('overflow-y:hidden'));
  assert(articleCss.includes('border-radius:0'));
  assert(articleCss.includes('font-size:27px'));
  assert(articleCss.includes('letter-spacing:0'));
  assert(articleCss.includes('background:var(--paper)'));
  assert(articleCss.includes('border-left-color:var(--red)'));
  const casesCss = fs.readFileSync(path.join(root, 'css/cases.css'), 'utf8');
  assert.match(casesCss, /\.cases-lead \{\s+max-width:850px/);
  assert.match(casesCss, /\.cases-hero-layout \{\s+display:grid;\s+grid-template-columns:minmax\(0,850px\) minmax\(0,1fr\)/);
  assert.match(casesCss, /@media\(max-width:1375px\)\s*\{\s+\.cases-hero-layout \{\s+grid-template-columns:minmax\(0,850px\)/);
  assert.match(casesCss, /@media\(min-width:1376px\)\s*\{\s+\.cases-hero-visual \{\s+top:130px/);
  assert.match(casesCss, /@media\(min-width:761px\)\s*\{\s*\.cases-hero-layout>div:first-child\s*\{\s+position:relative;\s+top:80px/);
  assert.match(articleCss, /\.cases-toc-link \{[\s\S]*?min-height:40px/);
  assert.match(articleCss, /grid-template-columns:minmax\(0,1fr\) minmax\(0,800px\) minmax\(0,1fr\)/);
  assert.match(articleCss, /\.cases-article \{\s+grid-column:2/);
  assert.match(articleCss, /\.cases-article-toc \{\s+grid-column:3/);
  assert.match(articleCss, /@media\(max-width:1375px\)[\s\S]*justify-content:center/);
  assert.match(html, /id="article-the-back-office-action-loop" class="flowchart-section-title"/);
  assert(html.includes('&quot;fontSize&quot;: &quot;10px&quot;'));
  assert(articleCss.includes('.cases-article .flowchart-section-title'));
  assert(!articleCss.includes('var(--cases-color)'));
  assert(!articleCss.includes('var(--cases-gold)'));
  assert(!articleCss.includes('var(--cases-dark)'));
  const articleScript = fs.readFileSync(path.join(root, 'js/cases-article.js'), 'utf8');
  assert(articleScript.includes("primaryColor:'#f1efe9'"));
  assert(articleScript.includes("primaryTextColor:'#201f1e'"));
  assert(!articleScript.includes('#12707a'));
});

test('technical reference anchors, accessibility references and local assets resolve', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), id);
  for (const [, references] of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    for (const id of references.split(' ')) assert(ids.includes(id), id);
  }
  for (const [, asset] of html.matchAll(/(?:src|href)="((?:assets|js|css)\/[^\"]+)"/g)) {
    assert(fs.existsSync(path.join(root, asset)), asset);
  }
  assert(!html.includes('cases-0.2.html'));
  assert(!html.includes('Cases 0.2'));
});

test('article navigation tracks section scroll in both directions and works at page end', () => {
  const source = fs.readFileSync(path.join(root, 'js/cases-article.js'), 'utf8');
  const listeners = {};
  const frames = [];
  const positions = { overview:1000, capabilities:1400, flows:2000, developers:3000, configuration:4000 };
  const createLink = id => ({
    attributes:{ href:`#${id}` },
    getAttribute(name) { return this.attributes[name]; },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; }
  });
  const contentsLinks = Object.keys(positions).map(createLink);
  const browser = {
    scrollY:0,
    innerHeight:800,
    getComputedStyle:() => ({ getPropertyValue:() => '145px' }),
    addEventListener(name, callback) { listeners[name] = callback; },
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; }
  };
  const article = { getBoundingClientRect:() => ({ top:positions.overview - browser.scrollY }) };
  vm.runInNewContext(source, {
    window:browser,
    document:{
      documentElement:{ scrollHeight:5000 },
      addEventListener() {},
      querySelector:() => article,
      querySelectorAll:selector => selector === '.cases-article-toc nav'
        ? [{ querySelectorAll:() => contentsLinks }]
        : [],
      getElementById:id => ({ getBoundingClientRect:() => ({ top:positions[id] - browser.scrollY }) })
    }
  });
  const active = links => links.filter(link => link.attributes['aria-current'] === 'location').map(link => link.attributes.href);
  const scroll = position => {
    browser.scrollY = position;
    listeners.scroll();
    frames.shift()();
  };
  scroll(900);
  assert.deepEqual(active(contentsLinks), ['#overview']);
  scroll(1900);
  assert.deepEqual(active(contentsLinks), ['#flows']);
  scroll(1300);
  scroll(3100);
  assert.deepEqual(active(contentsLinks), ['#developers']);
  scroll(4200);
  assert.deepEqual(active(contentsLinks), ['#configuration']);
  scroll(0);
  assert.deepEqual(active(contentsLinks), []);
  browser.getComputedStyle = () => ({ getPropertyValue:() => '260px' });
  scroll(1740);
  assert.deepEqual(active(contentsLinks), ['#flows']);
  listeners.resize();
  listeners.scroll();
  assert.equal(frames.length, 1);
});