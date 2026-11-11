'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/hero-art.js'), 'utf8');

test('hero diagram has no slash artwork and draws the cloud once', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const hero = html.match(/<svg class="hero-diagram"[\s\S]*?<\/svg>\s*<\/div>[\s\S]*?<div class="hero-baseline"/)?.[0];
  assert(hero, 'Hero diagram is present');
  assert(!/hero-slash|INDICE_slashes/.test(hero), 'Hero diagram has no slash artwork');
  assert(!/clip-path|clipPath/.test(hero), 'The cloud no longer needs to be split around the slashes');
  assert.equal((hero.match(/class="hero-cloud"/g) || []).length, 1);
  assert(!/hero-slash/.test(css), 'No hero slash styles remain');
  assert(/class="contact-slash"/.test(html), 'The closing section keeps its own slashes');
});

test('desktop hero centres the title, lays the pillars in three columns and places a wide artwork below', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.match(css, /grid-template-rows:52px 24px max-content max-content max-content max-content/);
  assert.match(css, /@media\(min-width:1000px\) \{\s*\.hero h1#hero-title,\.hero \.hero-baseline \{\s*text-align:center/);
  assert.match(css, /\.hero \.pillar-grid \{\s*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /\.hero \.hero-art \{[^}]*grid-row:5;[^}]*aspect-ratio:9\/4/);
  assert.match(html, /<svg class="hero-diagram" viewBox="0 0 900 400" preserveAspectRatio="xMidYMid meet"/);
  assert.match(css, /@media\(max-width:760px\) \{[\s\S]*?\.hero \.hero-art \{[^}]*width:103\.5%/);
});

test('hero technologies follow the artwork and match the INDICE Platform title style', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const art = html.indexOf('<div class="hero-art">');
  const technologies = html.indexOf('<section class="technologies"');
  const foundation = html.indexOf('<section class="foundation');
  assert(art < technologies && technologies < foundation, 'Technologies are inside the hero and before Foundation');
  assert(!html.slice(technologies, foundation).includes('data-reveal'), 'Hero technologies are not hidden by section reveal effects');
  assert.match(css, /\.hero \.hero-art \{[^}]*grid-row:5;/);
  assert.match(css, /\.hero \.technologies \{\s*grid-column:1;\s*grid-row:6;\s*margin-top:14px/);
  assert.match(css, /\.hero \.technologies \{[^}]*border-top:0/);
  assert.match(css, /\.hero \.technologies h2 \{\s*font-size:16px;\s*font-weight:650;\s*line-height:1\.65;\s*letter-spacing:\.09em/);
  assert.match(css, /\.hero \.pillar-grid \{[\s\S]*?margin-top:34px/);
  assert.match(css, /\.hero::before \{\s*content:'';\s*position:absolute;\s*inset:0 0 auto;\s*height:calc\(100svh - 32px\)/);
  assert.match(css, /\.hero \{\s*grid-template-columns:minmax\(0,1fr\);\s*grid-template-rows:52px 24px max-content max-content max-content max-content;\s*height:auto;\s*min-height:max\(850px,100svh\);\s*max-height:none;\s*row-gap:12px;\s*align-content:center/);
});

test('hero motto uses the accent typography', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const rule = css.match(/^\.hero \.hero-motto \{([^}]+)\}/m)[1];
  assert.match(css, /--accent:#1a7f8e/);
  assert(!/#dc4650|--red\b/.test(css), 'The page no longer uses the old red');
  assert.match(rule, /color:var\(--accent\)/);
  assert.match(rule, /font-size:36px/);
  assert.match(rule, /font-weight:600/);
  assert.match(rule, /letter-spacing:0/);
});

test('homepage section labels share the hero title typography', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const rule = css.match(/\.hero h1#hero-title,:is\(\.foundation,\.products,\.expertise\)>\.section-top>\.eyebrow \{([^}]+)\}/);
  assert(rule);
  assert.match(rule[1], /font-size:16px/);
  assert.match(rule[1], /font-weight:650/);
  assert.match(rule[1], /line-height:1\.65/);
  assert.match(rule[1], /letter-spacing:\.09em/);
});

test('hero pillar titles use a 28px font size', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  assert.match(css, /^\.hero \.pillar-label \{\s*font-size:28px\s*\}/m);
});

test('hero artwork grows by 15% across desktop and mobile while preserving product logo scaling', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const mobile = css.slice(css.lastIndexOf('@media(max-width:760px)'), css.indexOf('@media(prefers-reduced-motion:reduce)'));
  assert.match(mobile, /\.hero \.pillar-grid \{\s*margin-top:34px\s*\}/);
  assert.match(css, /\.hero \.hero-art \{[^}]*width:115%;[^}]*max-width:772\.8px;/);
  assert.match(mobile, /\.hero \.hero-art \{[^}]*width:103\.5%;[^}]*max-width:538\.2px/);
  assert.match(mobile, /\.hero \.hero-node image \{[^}]*transform-origin:center;[^}]*transform:scale\(1\.35\)/);
});

test('mobile hero uses readable title and pillar typography', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const mobile = css.slice(css.lastIndexOf('@media(max-width:760px)'), css.indexOf('@media(prefers-reduced-motion:reduce)'));
  assert.match(mobile, /\.hero \.hero-motto \{\s*font-size:32px\s*\}/);
  assert.match(mobile, /\.hero \.pillar-label \{\s*font-size:24px\s*\}/);
  assert.match(mobile, /\.hero \.pillar-headline \{\s*font-size:16px\s*\}/);
});

test('mobile hero leaves breathing room above the artwork and less space below it', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const mobile = css.slice(css.lastIndexOf('@media(max-width:760px)'), css.indexOf('@media(prefers-reduced-motion:reduce)'));
  assert.match(mobile, /padding-bottom:calc\(48px \+ env\(safe-area-inset-bottom,0px\)\)/);
  assert.match(css, /\.hero \.hero-art \{[^}]*--art-margin-top:50px;[^}]*margin-top:var\(--art-margin-top\)/);
  assert.match(mobile, /\.hero \.hero-art \{[^}]*translate:none;/);
});

test('each hero pillar groups its arrow beside its headline without changing its destination', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const pillars = [...html.matchAll(/<a class="pillar" href="#([^"]+)">([\s\S]*?)<\/a>/g)];
  assert.deepEqual(pillars.map(match => match[1]), ['foundation', 'products', 'expertise']);
  for (const [, , content] of pillars) {
    assert.match(content, /<span class="pillar-content"><span class="pillar-headline">[^<]+<\/span><svg class="arrow"[\s\S]*?<\/svg><\/span>$/);
    assert.match(content, /<path d="M5 5 19 19M5 19h14V5"/, 'Pillar arrow points diagonally down and right');
  }
});

class Events {
  constructor() { this.events = new Map(); }
  addEventListener(type, callback, options = {}) {
    if (options.signal?.aborted) return;
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(callback);
    options.signal?.addEventListener('abort', () => this.events.get(type)?.delete(callback), { once: true });
  }
  dispatch(type, event = {}) { for (const callback of [...(this.events.get(type) || [])]) callback(event); }
  count(type) { return this.events.get(type)?.size || 0; }
}

function fixture({ reduced = false, observerAvailable = true, missingArt = false, interactive = false } = {}) {
  const art = new Events();
  const frames = new Map();
  let sequence = 0;
  const layers = interactive ? ['cloud', 'foundation'].map(() => {
    const properties = new Map();
    return {
      properties,
      parentElement: { getScreenCTM: () => ({ a: 1, b: 0 }) },
      getBBox: () => ({ x: 950, y: 250, width: 150, height: 150 }),
      style: { setProperty: (name, value) => properties.set(name, value) },
    };
  }) : [];
  art.querySelectorAll = selector => selector === '.hero-cloud,.hero-cloud-trace' ? layers.slice(0, 1) : layers.slice(1);
  art.clientWidth = 450;
  art.clientHeight = 500;
  const classes = new Set();
  art.classList = {
    add: value => classes.add(value), remove: value => classes.delete(value),
    toggle: (value, force) => force ? classes.add(value) : classes.delete(value),
    contains: value => classes.has(value),
  };
  let top = 100;
  art.getBoundingClientRect = () => ({ top, bottom: top + 500, left: 850, right: 1300, width: 450, height: 500 });
  const document = new Events();
  document.hidden = false;
  document.querySelector = () => missingArt ? null : art;
  const browser = new Events();
  const media = new Events();
  const pointer = new Events();
  pointer.matches = true;
  media.matches = reduced;
  const observers = [];
  const sandbox = { document, AbortController, innerHeight: 900, innerWidth: 1400,
    requestAnimationFrame: callback => { const id = ++sequence; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    DOMPoint: class {
      constructor(x, y) { this.x = x; this.y = y; }
      matrixTransform() { return this; }
    },
    matchMedia: query => query.includes('reduced-motion') ? media : pointer, addEventListener: browser.addEventListener.bind(browser) };
  if (observerAvailable) sandbox.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: 'js/hero-art.js' });
  return { art, layers, pointer, frames, document, browser, media, observers, setTop: value => { top = value; },
    flush: () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
    running: () => art.classList.contains('is-animating') };
}

test('hero diagram playback pauses offscreen and in hidden tabs without playback controls', () => {
  const page = fixture();
  assert(page.running());
  assert(page.art.classList.contains('art-ready'));
  page.observers[0].callback([{ target: page.art, isIntersecting: false }]);
  assert(!page.running());
  page.observers[0].callback([{ target: page.art, isIntersecting: true }]);
  assert(page.running());
  page.document.hidden = true;
  page.document.dispatch('visibilitychange');
  assert(!page.running());
  page.document.hidden = false;
  page.document.dispatch('visibilitychange');
  assert(page.running());
});

test('cloud and foundation repel gently from the first pointer move and reset on leave, touch and reduced motion', () => {
  const page = fixture({ interactive: true });
  const move = () => {
    page.art.dispatch('pointermove', { clientX: 1000, clientY: 300, pointerType: 'mouse' });
    page.flush();
  };
  const distance = layer => Math.hypot(parseFloat(layer.properties.get('--repel-x')),
    parseFloat(layer.properties.get('--repel-y')));
  move();
  page.layers.forEach((layer, index) => {
    assert(distance(layer) > 0);
    assert(distance(layer) <= (index ? 8 : 10));
  });
  page.art.dispatch('pointerleave');
  page.layers.forEach(layer => assert.equal(distance(layer), 0));
  move();
  page.art.dispatch('pointermove', { pointerType: 'touch' });
  page.layers.forEach(layer => assert.equal(distance(layer), 0));
  move();
  page.media.matches = true;
  page.media.dispatch('change');
  page.layers.forEach(layer => assert.equal(distance(layer), 0));
});

test('reduced motion prevents playback initially and reacts to live preference changes', () => {
  const page = fixture({ reduced: true });
  assert(!page.running());
  page.media.matches = false;
  page.media.dispatch('change');
  assert(page.running());
  page.media.matches = true;
  page.media.dispatch('change');
  assert(!page.running());
});

test('observer-free fallback responds to scroll and resize without scheduling animation frames', () => {
  const page = fixture({ observerAvailable: false });
  assert(page.running());
  page.setTop(-700);
  page.browser.dispatch('scroll');
  assert(!page.running());
  page.setTop(100);
  page.browser.dispatch('resize');
  assert(page.running());
});

test('page lifecycle releases listeners and observers and restores playback exactly once', () => {
  const page = fixture();
  page.browser.dispatch('pagehide');
  assert(!page.running());
  assert(page.observers[0].disconnected);
  assert.equal(page.document.count('visibilitychange'), 0);
  assert.equal(page.media.count('change'), 0);
  assert.equal(page.browser.count('resize'), 0);
  page.browser.dispatch('pageshow', { persisted: true });
  page.browser.dispatch('pageshow', { persisted: true });
  assert.equal(page.media.count('change'), 1);
  assert.equal(page.observers.length, 2);
  assert(page.running());
});

test('a page without hero artwork remains usable without registering motion listeners', () => {
  const page = fixture({ missingArt: true });
  assert.equal(page.browser.count('resize'), 0);
});
