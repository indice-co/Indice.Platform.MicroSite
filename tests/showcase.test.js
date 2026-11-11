'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourceRoot = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(sourceRoot, 'js/data.js'), 'utf8');
const showcaseSource = fs.readFileSync(path.join(sourceRoot, 'js/showcase.js'), 'utf8');

class Events {
  constructor() { this.events = new Map(); }
  addEventListener(type, handler) {
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(handler);
  }
  removeEventListener(type, handler) { this.events.get(type)?.delete(handler); }
  dispatch(type, event = {}) {
    for (const handler of [...(this.events.get(type) || [])]) handler(event);
  }
}

class ClassList {
  constructor() { this.values = new Set(); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const shouldAdd = force === undefined ? !this.contains(value) : force;
    if (shouldAdd) this.add(value); else this.remove(value);
    return shouldAdd;
  }
}

class Style {
  setProperty(name, value) { this[name] = value; }
  getPropertyValue(name) { return this[name] || ''; }
}

function fixture({ enhanced = true, hash = '' } = {}) {
  const browser = new Events();
  const document = new Events();
  const media = new Events();
  const frames = new Map();
  const timers = new Map();
  let sequence = 0;
  const sectionStart = 5000;
  const sandbox = {
    console,
    document,
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 0,
    location: { hash },
    CSS: { supports: () => true },
    HTMLElement: class {},
    matchMedia: () => media,
    requestAnimationFrame: callback => { const id = ++sequence; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    setInterval: callback => { const id = ++sequence; timers.set(id, callback); return id; },
    clearInterval: id => timers.delete(id),
    addEventListener: browser.addEventListener.bind(browser),
    removeEventListener: browser.removeEventListener.bind(browser),
  };
  sandbox.HTMLElement.prototype.inert = false;
  sandbox.window = sandbox;
  sandbox.scrollTo = ({ top }) => { sandbox.scrollY = top; };
  sandbox.history = { replaceState: (_state, _unused, nextHash) => { sandbox.location.hash = nextHash; } };
  media.matches = enhanced;

  class Element extends Events {
    constructor(dataset = {}) {
      super();
      this.dataset = dataset;
      this.classList = new ClassList();
      this.style = new Style();
      this.attributes = new Map();
      this.inert = false;
      this.hidden = false;
      this.children = [];
      this.textContent = '';
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) {
      this.attributes.delete(name);
      if (name === 'style') this.style = new Style();
    }
    querySelector(selector) { return this.selectors?.[selector] || null; }
    querySelectorAll(selector) { return this.collections?.[selector] || []; }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    closest(selector) {
      if (selector.includes('[data-product-link]') && this.dataset.productLink) return this;
      if (selector.includes('[data-select-product]') && this.dataset.selectProduct) return this;
      return null;
    }
    focus() { document.activeElement = this; }
    scrollIntoView() { sandbox.scrollY = this.documentTop || sectionStart; }
    getBoundingClientRect() { return { top: -1000, bottom: -900, left: 0, right: 1000, width: 1000, height: 100 }; }
  }

  const context = vm.createContext(sandbox);
  vm.runInContext(dataSource, context, { filename: 'js/data.js' });
  const products = Array.from(sandbox.INDICE_DATA.products);
  const section = new Element();
  const stage = new Element();
  const panel = new Element();
  const grid = new Element();
  const root = new Element();
  const chapters = products.map((product, index) => {
    const chapter = new Element({ product: product.id });
    chapter.documentTop = sectionStart + index * 800;
    chapter.getBoundingClientRect = () => ({ top: chapter.documentTop - sandbox.scrollY, bottom: chapter.documentTop + 750 - sandbox.scrollY, left: 0, right: 1440 });
    return chapter;
  });
  const slides = products.map(product => new Element({ preview: product.id }));
  const navigation = products.map(product => new Element({ selectProduct: product.id }));
  const tiles = products.map(product => new Element({ productLink: product.id }));
  grid.children = tiles;

  section.selectors = { '.story-stage': stage, '.preview-panel': panel };
  section.collections = { '.product-chapter': chapters, '[data-select-product]': navigation, img: [] };
  panel.collections = { '[data-preview]': slides };
  section.getBoundingClientRect = () => {
    const height = parseFloat(section.style.height) || 4000;
    return { top: sectionStart - sandbox.scrollY, bottom: sectionStart + height - sandbox.scrollY, left: 0, right: sandbox.innerWidth, height };
  };
  panel.getBoundingClientRect = () => {
    const height = parseFloat(section.style.height) || 4000;
    const stageTop = Math.min(Math.max(sectionStart - sandbox.scrollY, 0), sectionStart + height - sandbox.innerHeight - sandbox.scrollY);
    const scale = parseFloat(stage.style.getPropertyValue('--panel-scale')) || 1;
    const width = (parseFloat(panel.style.width) || 1000) * scale;
    const centerX = sandbox.innerWidth / 2 + (parseFloat(stage.style.getPropertyValue('--panel-x')) || 0);
    const centerY = stageTop + sandbox.innerHeight / 2 + (parseFloat(stage.style.getPropertyValue('--panel-y')) || 0);
    return { top: centerY - width / 3.2, bottom: centerY + width / 3.2, left: centerX - width / 2, right: centerX + width / 2, width, height: width / 1.6 };
  };
  document.querySelector = selector => ({ '#product-showcase': section, '#products .product-grid': grid })[selector] || null;
  document.documentElement = root;
  document.hidden = false;
  document.activeElement = null;
  // Font loading is absent in this fixture; resize exercises the same measurement path.
  vm.runInContext(showcaseSource, context, { filename: 'js/showcase.js' });

  function flushFrames() {
    let remaining = 10;
    while (frames.size && remaining-- > 0) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(0));
    }
    assert.equal(frames.size, 0, 'animation frame work settles');
  }
  function scrollTo(top) {
    sandbox.scrollY = top;
    browser.dispatch('scroll');
    flushFrames();
  }
  function click(control) {
    const event = { target: control, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    control.dispatch('click', event);
    document.dispatch('click', event);
    flushFrames();
  }
  function assertSynchronized(id) {
    const current = sandbox.INDICE_SHOWCASE.getState();
    assert.equal(current.product, id);
    assert.equal(products[current.previewIndex].id, id);
    assert.equal(section.dataset.activeProduct, id);
    assert.deepEqual(navigation.filter(item => item.getAttribute('aria-current') === 'true').map(item => item.dataset.selectProduct), [id]);
    assert.deepEqual(slides.filter(item => item.classList.contains('is-active')).map(item => item.dataset.preview), [id]);
    assert.deepEqual(chapters.filter(item => item.classList.contains('is-active')).map(item => item.dataset.product), [id]);
  }

  flushFrames();
  return { sandbox, browser, document, media, products, section, stage, panel, chapters, slides, navigation, tiles, grid, timers, flushFrames, scrollTo, click, assertSynchronized, api: sandbox.INDICE_SHOWCASE, sectionStart };
}

test('only the four supplied products become selectable states', () => {
  const f = fixture();
  assert.deepEqual(Array.from(f.products, product => product.id), ['cases', 'iam', 'messaging', 'risk']);
  assert.equal(f.section.classList.contains('story-products'), false, 'stepper stays hidden during the introduction');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 1.09);
  assert.equal(f.section.classList.contains('story-products'), false, 'stepper stays hidden before Cases begins');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 1.11);
  assert.equal(f.section.classList.contains('story-products'), true, 'stepper appears when Cases begins');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 1.09);
  assert.equal(f.section.classList.contains('story-products'), false, 'stepper hides again before Cases begins');
  for (const product of f.products) {
    f.api.selectProduct(product.id);
    f.assertSynchronized(product.id);
    assert.equal(f.section.classList.contains('story-products'), true, 'stepper appears in product sections');
  }
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 0.2);
  assert.equal(f.section.classList.contains('story-products'), false, 'stepper hides before the Cases section');
  const previousScroll = f.sandbox.scrollY;
  f.api.selectProduct('unavailable-product');
  assert.equal(f.sandbox.scrollY, previousScroll);
  assert.equal(f.api.getState().product, null, 'the selected product clears before the intro');
  assert.equal(f.api.getState().previewIndex, 0, 'the static preview returns to the Cases dashboard');
});

test('product grid fades and becomes inert when the preview covers it', () => {
  const f = fixture();
  f.grid.getBoundingClientRect = () => f.panel.getBoundingClientRect();
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 0.05);
  assert.ok(Number(f.grid.style.opacity) > 0 && Number(f.grid.style.opacity) < 1, 'grid fades with preview arrival');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 0.15);
  assert.equal(f.grid.style.opacity, '0', 'grid is fully faded before the preview is appreciably visible');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 0.2);
  assert.equal(f.grid.classList.contains('is-covered'), true);
  assert.equal(f.grid.inert, true);
});

test('nonlinear grid and local navigation choices survive the next native scroll frame', () => {
  const f = fixture();
  f.click(f.tiles[3]);
  f.assertSynchronized('risk');
  assert.equal(f.document.activeElement, f.chapters[3], 'explicit grid selection focuses its chapter');
  assert.equal(f.sandbox.location.hash, '#product-risk');
  f.scrollTo(f.sandbox.scrollY + 2);
  f.assertSynchronized('risk');
  f.click(f.navigation[1]);
  f.assertSynchronized('iam');
  f.scrollTo(f.sandbox.scrollY + 2);
  f.assertSynchronized('iam');
  assert.equal(f.timers.size, 0, 'product selection bypasses the introduction loop');
});

test('native forward and reverse scrolling synchronize chapters, previews, navigation and product colours', () => {
  const f = fixture();
  const checkpoints = f.products.map(product => {
    f.api.selectProduct(product.id, { hash: false });
    return f.sandbox.scrollY;
  });
  for (const index of [0, 1, 2, 3, 2, 1, 0]) {
    const focusBefore = f.document.activeElement;
    f.scrollTo(checkpoints[index]);
    f.assertSynchronized(f.products[index].id);
    const product = f.products[index];
    const background = product.id === 'messaging' ? product.accent : product.color;
    const channels = background.slice(1).match(/../g).map(value => parseInt(value, 16));
    assert.equal(f.stage.style.backgroundColor, `rgba(${channels.join(',')},0.12)`);
    assert.equal(f.document.activeElement, focusBefore, 'ordinary scrolling does not move keyboard focus');
  }
});

test('Cases tile, local navigation and direct hash land on the fully revealed intake beat', () => {
  const f = fixture();
  for (const control of [f.tiles[0], f.navigation[0]]) {
    f.api.selectProduct('risk');
    f.click(control);
    f.assertSynchronized('cases');
    assert.equal(f.chapters[0].dataset.caseBeat, 'intake');
    assert.equal(f.stage.style.getPropertyValue('--copy-opacity'), '1');
    assert.equal(f.document.activeElement, f.chapters[0]);
    assert.equal(f.sandbox.location.hash, '#product-cases');
    f.scrollTo(f.sandbox.scrollY + 2);
    assert.equal(f.chapters[0].dataset.caseBeat, 'intake', 'the next scroll frame keeps intake visible');
  }
  const direct = fixture({ hash: '#product-cases' });
  direct.assertSynchronized('cases');
  assert.equal(direct.chapters[0].dataset.caseBeat, 'intake');
  assert.equal(direct.stage.style.getPropertyValue('--copy-opacity'), '1');
  direct.api.selectProduct('iam');
  direct.sandbox.location.hash = '#product-cases';
  direct.browser.dispatch('hashchange');
  direct.flushFrames();
  assert.equal(direct.chapters[0].dataset.caseBeat, 'intake');
});

test('introductory preview stays on the Cases dashboard without autoplay', () => {
  const f = fixture();
  assert.equal(f.timers.size, 0, 'offscreen introduction does not autoplay');
  assert.equal(f.api.getState().previewIndex, 0, 'Cases dashboard is the initial preview');
  f.api.selectProduct('cases', { hash: false });
  const firstProductPosition = f.sandbox.scrollY;
  f.scrollTo(f.sectionStart + (firstProductPosition - f.sectionStart) * 0.4);
  assert.equal(f.api.getState().product, null);
  assert.equal(f.section.classList.contains('story-products'), false, 'stepper stays hidden during the introduction');
  assert.equal(f.api.getState().previewIndex, 0, 'the Cases dashboard remains static during the introduction');
  assert.equal(f.timers.size, 0, 'the introductory screen does not autoplay');

  f.document.hidden = true;
  f.document.dispatch('visibilitychange');
  assert.equal(f.timers.size, 0);
  f.document.hidden = false;
  f.document.dispatch('visibilitychange');
  assert.equal(f.timers.size, 0);
  f.scrollTo(0);
  assert.equal(f.timers.size, 0, 'no preview timer runs when the panel leaves the viewport');
  f.api.selectProduct('messaging');
  assert.equal(f.section.classList.contains('story-products'), true);
  assert.equal(f.api.getState().previewIndex, 2, 'selected products still show their matching preview');
  assert.equal(f.timers.size, 0);
});

test('Cases tint starts with its incoming screen and switches immediately to the next product', () => {
  const f = fixture();
  const casesColor = 'rgba(18,112,122,0.12)';
  const iamColor = 'rgba(61,90,254,0.12)';
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 0.8);
  assert.equal(f.stage.style.backgroundColor, casesColor, 'Cases color begins as the dashboard enters');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * (1.1 + 0.9 * 0.12));
  assert.equal(f.chapters[0].dataset.caseBeat, 'intake');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * (1.1 + 0.9 * 0.48));
  assert.equal(f.chapters[0].dataset.caseBeat, 'workflow');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * (1.1 + 0.9 * 0.84));
  assert.equal(f.chapters[0].dataset.caseBeat, 'governance');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * (1.1 + 0.9 * 0.98));
  assert.equal(f.stage.style.backgroundColor, casesColor, 'Cases color remains through its last beat');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * (1.1 + 0.9 * 0.99));
  assert.equal(f.chapters[0].dataset.caseBeat, 'governance', 'the third beat remains until Cases ends');
  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * (1.1 + 0.9 + 0.001));
  assert.equal(f.stage.style.backgroundColor, iamColor, 'the color changes when IAM begins');
});

test('Cases dashboard preview aligns with the intake screenshot at the product handoff', () => {
  const f = fixture();
  const width = f.sandbox.innerWidth;
  const gutter = Math.min(88, Math.max(24, width * 0.05));
  const gap = Math.min(70, Math.max(26, width * 0.04));
  const gridWidth = width - 2 * gutter - gap;
  const screenWidth = gridWidth * 0.61;
  const screenLeft = gutter + gridWidth * 0.39 + gap;
  const expectedX = screenLeft + screenWidth / 2 - width / 2;

  f.scrollTo(f.sectionStart + f.sandbox.innerHeight * 1.1);

  assert.equal(f.chapters[0].dataset.caseBeat, 'intake');
  assert.equal(f.stage.style.getPropertyValue('--panel-x'), `${expectedX}px`);
  assert.equal(f.stage.style.getPropertyValue('--panel-y'), '0px');
  const renderedWidth = Number(f.panel.style.width.replace('px', '')) *
    Number(f.stage.style.getPropertyValue('--panel-scale'));
  assert.ok(Math.abs(renderedWidth - screenWidth) < 0.01, 'preview width matches the intake screenshot window');
  assert.equal(Number.parseFloat(f.panel.style.height), (screenWidth - 2) * 9 / 16 + 46);
});

test('Cases introduction stays opaque and the intake screenshot handoff does not replay an entrance', () => {
  const css = fs.readFileSync(path.join(sourceRoot, 'css/styles.css'), 'utf8');
  assert.match(css, /\.story-enhanced \.product-chapter-cases\.is-active\s*\{\s*opacity:1\s*\}/);
  assert.match(css, /\.story-enhanced \.case-beat\[data-case-beat="intake"\]\.is-current,\s*\.story-enhanced \.case-beat\[data-case-beat="intake"\]\.is-current \.case-screen\s*\{\s*transition:none\s*\}/);
});

test('desktop resize preserves the chosen product and keeps state synchronized', () => {
  const f = fixture();
  f.api.selectProduct('messaging');
  f.sandbox.innerHeight = 760;
  f.sandbox.innerWidth = 1100;
  f.browser.dispatch('resize');
  f.flushFrames();
  f.assertSynchronized('messaging');
  assert.ok(f.panel.getBoundingClientRect().right > f.sandbox.innerWidth, 'preview extends beyond a standard desktop viewport');
  f.scrollTo(f.sandbox.scrollY + 1);
  f.assertSynchronized('messaging');
  f.sandbox.innerWidth = 3200;
  f.browser.dispatch('resize');
  f.flushFrames();
  assert.ok(f.panel.getBoundingClientRect().right > f.sandbox.innerWidth, 'preview extends beyond an ultrawide desktop viewport');
});

test('reduced-motion change restores all semantic chapters and matching static navigation', () => {
  const f = fixture();
  f.api.selectProduct('iam');
  assert.ok(f.chapters.some(chapter => chapter.inert));
  f.media.matches = false;
  f.media.dispatch('change');
  f.flushFrames();
  assert.equal(f.api.getState().enhanced, false);
  assert.equal(f.api.getState().phase, 'static');
  assert.equal(f.section.classList.contains('story-enhanced'), false);
  assert.equal(f.section.style.height, '');
  assert.equal(f.timers.size, 0);
  assert.equal(f.section.classList.contains('story-products'), true, 'the selected product keeps navigation visible in static mode');
  for (const chapter of f.chapters) {
    assert.equal(chapter.inert, false);
    assert.equal(chapter.getAttribute('aria-hidden'), null);
  }
  f.click(f.tiles[3]);
  f.assertSynchronized('risk');
  assert.equal(f.sandbox.scrollY, f.chapters[3].documentTop);
});

test('initial static mode remains readable and direct product hashes resolve correctly', () => {
  const staticView = fixture({ enhanced: false });
  assert.equal(staticView.api.getState().enhanced, false);
  assert.ok(staticView.chapters.every(chapter => !chapter.inert && chapter.getAttribute('aria-hidden') === null));
  staticView.scrollTo(staticView.sectionStart - 500);
  assert.equal(staticView.section.classList.contains('story-products'), false, 'stepper stays hidden before Cases enters the reading area');
  staticView.scrollTo(staticView.sectionStart - 200);
  assert.equal(staticView.section.classList.contains('story-products'), true, 'stepper appears when Cases reaches the reading area');
  const linkedView = fixture({ hash: '#product-risk' });
  linkedView.assertSynchronized('risk');
  assert.equal(linkedView.timers.size, 0);
});

test('page lifecycle releases listeners and restores persisted pages without preview timers', () => {
  const f = fixture();
  f.api.selectProduct('cases');
  const firstProductPosition = f.sandbox.scrollY;
  f.scrollTo(f.sectionStart + (firstProductPosition - f.sectionStart) * 0.4);
  assert.equal(f.timers.size, 0);
  f.browser.dispatch('pagehide');
  assert.equal(f.timers.size, 0);
  assert.equal(f.grid.inert, false);
  assert.equal(f.document.events.get('click').size, 0);
  f.browser.dispatch('pageshow', { persisted: true });
  f.flushFrames();
  assert.equal(f.document.events.get('click').size, 1);
  f.click(f.navigation[2]);
  f.assertSynchronized('messaging');
});
