'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/hero-art.js'), 'utf8');

test('generated hero preserves the official slash geometry and normalizes both outlines for drawing', () => {
  const asset = fs.readFileSync(path.join(__dirname, '../assets/logos/INDICE_slashes.svg'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const hero = html.match(/<svg class="hero-slashes"[\s\S]*?<\/svg>/)?.[0];
  assert(hero, 'Hero includes the official inline SVG');
  assert.equal(hero.match(/viewBox="([^"]+)"/)[1], asset.match(/viewBox="([^"]+)"/)[1]);
  assert.deepEqual([...hero.matchAll(/\bd="([^"]+)"/g)].map(match => match[1]),
    [...asset.matchAll(/\bd="([^"]+)"/g)].map(match => match[1]));
  assert.equal((hero.match(/class="hero-slash-flight"/g) || []).length, 2);
  assert.equal((hero.match(/class="hero-slash-shape" pathLength="1"/g) || []).length, 2);
  assert(!hero.includes('non-scaling-stroke'), 'Normalized perimeter dashes must scale with the official paths');
  assert(!hero.includes('fill="white"'), 'CSS owns the animated fill');
});

test('the right hero slash has 60% opacity while the left retains its existing opacity', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const hero = html.match(/<svg class="hero-slashes"[\s\S]*?<\/svg>/)[0];
  const paths = [...hero.matchAll(/<path class="hero-slash-shape"[^>]* d="([^"]+)"/g)];
  assert.match(paths[0][1], /^M124\.8 /);
  assert.match(paths[1][1], /^M0 /);
  assert.match(css, /\.hero-slashes>\.hero-slash-flight:first-child \.hero-slash-shape \{\s*opacity:\.6\s*\}/);
  assert.match(css, /\.hero-slashes>\.hero-slash-flight:last-child \.hero-slash-shape \{\s*opacity:\.25\s*\}/);
});

test('hero travel and perimeter tracing share a steady timeline, with fill and color deferred until landing', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  for (const name of ['arrive', 'draw']) {
    assert(css.includes(`hero-slash-${name} var(--hero-flight-duration) linear var(--flight-delay) both`));
  }
  assert(css.includes('--hero-fill-delay:calc(var(--hero-flight-delay) + var(--hero-flight-duration))'));
  assert(css.includes('hero-slash-fill .9s ease var(--hero-fill-delay) both'));
  assert(css.includes('hero-slash-color var(--hero-color-duration) ease-in-out calc(var(--hero-fill-delay) + .9s) 1'));
});

test('desktop hero artwork lowers its visible baseline and retains its spacing offsets', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  assert.match(css, /grid-template-rows:50px 24px max-content max-content/);
  assert.match(css, /\.hero \.hero-art \{[^}]*translate:-40px 5%;[^}]*align-self:end;/);
  assert.match(css, /@media\(min-width:1441px\) \{\s*\.hero \.hero-art \{[^}]*translate:-20px 5%/);
  assert.match(css, /@media\(max-width:760px\) \{[\s\S]*?\.hero \.hero-art \{[^}]*translate:none;/);
});

test('hero motto uses the requested red typography', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const rule = css.match(/^\.hero \.hero-motto \{([^}]+)\}/m)[1];
  assert.match(css, /--red:#dc4650/);
  assert.match(rule, /color:var\(--red\)/);
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

test('mobile hero brings pillars closer and reduces the artwork while enlarging product logos', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  const mobile = css.slice(css.lastIndexOf('@media(max-width:760px)'), css.indexOf('@media(prefers-reduced-motion:reduce)'));
  assert.match(mobile, /\.hero \.pillar-grid \{\s*margin-top:24px\s*\}/);
  assert.match(mobile, /\.hero \.hero-art \{[^}]*width:90%;[^}]*max-width:468px;/);
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
  assert.match(mobile, /\.hero \.hero-art \{[^}]*margin-top:40px/);
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
  const flights = [{}, {}];
  const shapes = interactive ? flights.map((flight, index) => {
    const properties = new Map();
    flight.getScreenCTM = () => ({ a: 1, b: 0 });
    return {
      parentElement: flight, properties,
      getBBox: () => ({ x: 900 + index * 100, y: 200, width: 60, height: 200 }),
      style: { setProperty: (name, value) => properties.set(name, value) },
    };
  }) : [];
  const layers = interactive ? ['cloud', 'foundation'].map(() => {
    const properties = new Map();
    return {
      properties,
      parentElement: { getScreenCTM: () => ({ a: 1, b: 0 }) },
      getBBox: () => ({ x: 950, y: 250, width: 150, height: 150 }),
      style: { setProperty: (name, value) => properties.set(name, value) },
    };
  }) : [];
  art.querySelectorAll = selector => selector === '.hero-slash-shape' ? shapes
    : selector === '.hero-cloud,.hero-cloud-trace' ? layers.slice(0, 1) : layers.slice(1);
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
  return { art, shapes, layers, flights, pointer, frames, document, browser, media, observers, setTop: value => { top = value; },
    flush: () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
    running: () => art.classList.contains('is-animating') };
}

test('hero arrival and color playback pause offscreen and in hidden tabs without playback controls', () => {
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

test('slash repulsion waits for both arrivals, then resets on leave, touch and reduced motion', () => {
  const page = fixture({ interactive: true });
  const move = () => {
    page.art.dispatch('pointermove', { clientX: 900, clientY: 300, pointerType: 'mouse' });
    page.flush();
  };
  const displaced = () => page.shapes.some(shape => parseFloat(shape.properties.get('--repel-x')) !== 0);
  move();
  assert(!displaced());
  page.art.dispatch('animationend', { animationName: 'hero-slash-arrive', target: page.flights[0] });
  move();
  assert(!displaced());
  page.art.dispatch('animationend', { animationName: 'hero-slash-arrive', target: page.flights[1] });
  move();
  assert(displaced());
  page.shapes.forEach(shape => assert(Math.abs(parseFloat(shape.properties.get('--repel-x'))) <= 42));
  page.art.dispatch('pointerleave');
  assert(!displaced());
  move();
  page.art.dispatch('pointermove', { pointerType: 'touch' });
  assert(!displaced());
  move();
  page.media.matches = true;
  page.media.dispatch('change');
  assert(!displaced());
});

test('cloud and foundation repel gently and reset with the existing motion lifecycle', () => {
  const page = fixture({ interactive: true });
  const move = () => {
    page.art.dispatch('pointermove', { clientX: 1000, clientY: 300, pointerType: 'mouse' });
    page.flush();
  };
  const distance = layer => Math.hypot(parseFloat(layer.properties.get('--repel-x')),
    parseFloat(layer.properties.get('--repel-y')));
  move();
  page.layers.forEach(layer => assert.equal(distance(layer), 0));
  page.flights.forEach(target => page.art.dispatch('animationend', { animationName: 'hero-slash-arrive', target }));
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
