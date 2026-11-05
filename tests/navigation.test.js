'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const project = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(project, 'js/main.js'), 'utf8');
const data = fs.readFileSync(path.join(project, 'js/data.js'), 'utf8');

// A small DOM/event fixture exercises the shipped script without introducing a runtime dependency.
class Events {
  constructor() { this.events = new Map(); }
  addEventListener(type, callback, options = {}) {
    if (options.signal?.aborted) return;
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(callback);
    options.signal?.addEventListener('abort', () => this.events.get(type)?.delete(callback), { once: true });
  }
  dispatch(type, event = {}) {
    event.currentTarget = this;
    for (const callback of [...(this.events.get(type) || [])]) callback(event);
  }
  count(type) { return this.events.get(type)?.size || 0; }
}

function fixture({ mobile = false, reduced = false, observerAvailable = true, observerThrows = false } = {}) {
  const document = new Events();
  const browser = new Events();
  const mobileMedia = new Events();
  const motionMedia = new Events();
  const frames = new Map();
  const observed = new Set();
  const historyWrites = [];
  const observers = [];
  let frameId = 0;
  mobileMedia.matches = mobile;
  motionMedia.matches = reduced;

  class Element extends Events {
    constructor(tag = 'div', attributes = {}, children = []) {
      super();
      this.tag = tag;
      this.attributes = new Map(Object.entries(attributes));
      this.dataset = {};
      this.children = children;
      children.forEach(child => { child.parent = this; });
      this.hidden = false;
      this.visible = true;
      this.classes = new Set();
      this.classList = {
        add: value => this.classes.add(value),
        remove: value => this.classes.delete(value),
        contains: value => this.classes.has(value),
        toggle: (value, force) => {
          const add = force === undefined ? !this.classes.has(value) : force;
          if (add) this.classes.add(value); else this.classes.delete(value);
          return add;
        },
      };
      this.focusCalls = [];
      this.scrollCalls = [];
    }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    removeAttribute(name) { this.attributes.delete(name); }
    hasAttribute(name) { return this.attributes.has(name); }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    getClientRects() { return this.visible && !this.hidden ? [{}] : []; }
    querySelectorAll() { return this.focusable || []; }
    matches(selector) {
      if (selector === '[data-product-link]') return this.hasAttribute('data-product-link');
      if (selector === 'a, button, input, select, textarea') return ['a', 'button', 'input', 'select', 'textarea'].includes(this.tag);
      return false;
    }
    closest(selector) {
      if (selector === 'a[href^="#"]' && this.tag === 'a' && this.getAttribute('href')?.startsWith('#')) return this;
      if (selector === '.product-navigation' && this.classes.has('product-navigation')) return this;
      return this.parent?.closest(selector) || null;
    }
    focus(options) {
      this.focusCalls.push(options);
      document.activeElement = this;
      document.dispatch('focusin', { target: this });
    }
    scrollIntoView(options) { this.scrollCalls.push(options); }
    getBoundingClientRect() { return { top: (this.documentTop || 0) - sandbox.scrollY, bottom: (this.documentBottom || 0) - sandbox.scrollY }; }
  }

  const root = new Element();
  const brandImage = new Element('img');
  const brand = new Element('a', {}, [brandImage]);
  brand.querySelector = () => brandImage;
  const outside = new Element('button');
  const firstMobileLink = new Element('a', { href: '#foundation' });
  const exploreAll = new Element('a', { href: '#products' });
  const panel = new Element('div', { 'aria-label': 'Suite' }, [firstMobileLink, exploreAll]);
  panel.hidden = true;
  panel.focusable = [firstMobileLink, exploreAll];
  firstMobileLink.visible = mobile;
  const desktopTrigger = new Element('button');
  const mobileTrigger = new Element('button');
  desktopTrigger.visible = !mobile;
  mobileTrigger.visible = mobile;
  const navigation = new Element('nav', {}, [panel, desktopTrigger, mobileTrigger]);
  const foundation = new Element('section');
  const products = new Element('section');
  const services = new Element('section');
  foundation.documentTop = 900;
  products.documentTop = 2100;
  services.documentTop = 8000;
  services.documentBottom = 9200;
  const pillarLinks = ['foundation', 'products', 'services'].map(pillar => {
    const link = new Element('a', { href: '#' + pillar });
    link.dataset.pillar = pillar;
    return link;
  });
  const reveal = new Element();
  const demoButtons = [new Element('button'), new Element('button')];
  const elements = {
    'hero-brand': brand,
    'products-panel': panel, 'site-nav': navigation, 'products-trigger': desktopTrigger,
    'menu-trigger': mobileTrigger, foundation, products, services,
  };
  document.documentElement = root;
  document.activeElement = outside;
  document.getElementById = id => elements[id] || null;
  document.querySelectorAll = selector => ({ '[data-pillar]': pillarLinks, '[data-demo]': demoButtons, '[data-reveal]': [reveal] })[selector] || [];

  class Observer {
    constructor(callback) {
      if (observerThrows) throw new Error('Observer unavailable');
      this.callback = callback;
      this.disconnected = false;
      observers.push(this);
    }
    observe(element) { observed.add(element); }
    unobserve(element) { observed.delete(element); }
    disconnect() { this.disconnected = true; observed.clear(); }
  }
  const sandbox = {
    console, document, AbortController,
    innerHeight: 900, scrollY: 0,
    matchMedia: query => query.includes('reduced-motion') ? motionMedia : mobileMedia,
    addEventListener: browser.addEventListener.bind(browser),
    requestAnimationFrame: callback => { const id = ++frameId; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    history: { pushState: (_state, _unused, hash) => historyWrites.push(hash) },
  };
  if (observerAvailable) sandbox.IntersectionObserver = Observer;
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(data, context, { filename: 'js/data.js' });
  vm.runInContext(source, context, { filename: 'js/main.js' });

  function event(target, details = {}) {
    return {
      target, button: 0, detail: 1, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...details,
    };
  }
  function click(target, details) {
    const value = event(target, details);
    // Dispatching to an element and then document simulates normal click bubbling.
    target.dispatch('click', value);
    document.dispatch('click', value);
    return value;
  }
  function scroll(top) {
    sandbox.scrollY = top;
    browser.dispatch('scroll');
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback());
  }
  function resizeMobile(next) {
    mobileMedia.matches = next;
    desktopTrigger.visible = !next;
    mobileTrigger.visible = next;
    firstMobileLink.visible = next;
    mobileMedia.dispatch('change');
  }
  return { document, browser, root, brand, brandImage, panel, desktopTrigger, mobileTrigger, outside,
    firstMobileLink, exploreAll, foundation, products, services, pillarLinks, demoButtons,
    reveal, frames, observed, observers, motionMedia, sandbox, historyWrites, Element,
    click, event, scroll, resizeMobile };
}

test('fixed brand swaps assets by scroll direction and restores the main logo at the top', () => {
  const page = fixture();
  assert.equal(page.brandImage.getAttribute('src'), 'assets/logos/indice platform grey.svg');
  page.scroll(500);
  assert.equal(page.brandImage.getAttribute('src'), 'assets/logos/indice icon.svg');
  assert(page.brand.classList.contains('is-compact'));
  page.scroll(300);
  assert.equal(page.brandImage.getAttribute('src'), 'assets/logos/indice top.svg');
  page.scroll(300);
  assert.equal(page.brandImage.getAttribute('src'), 'assets/logos/indice top.svg');
  page.scroll(0);
  assert.equal(page.brandImage.getAttribute('src'), 'assets/logos/indice platform grey.svg');
  assert(!page.brand.classList.contains('is-compact'));
  page.scroll(-5);
  assert.equal(page.brandImage.getAttribute('src'), 'assets/logos/indice platform grey.svg');
});

test('keyboard opening enters the Suite panel and Escape restores its trigger', () => {
  const page = fixture();
  page.desktopTrigger.focus();
  page.click(page.desktopTrigger, { detail: 0 });
  assert.equal(page.panel.hidden, false);
  assert.equal(page.panel.getAttribute('aria-label'), 'Suite');
  assert.equal(page.desktopTrigger.getAttribute('aria-expanded'), 'true');
  assert.equal(page.document.activeElement, page.exploreAll, 'hidden mobile links are skipped');
  const escape = page.event(page.exploreAll, { key: 'Escape' });
  page.document.dispatch('keydown', escape);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(page.panel.hidden, true);
  assert.equal(page.desktopTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(page.document.activeElement, page.desktopTrigger);
});

test('pointer interactions inside the disclosure keep it open; outside closes without stealing focus', () => {
  const page = fixture();
  page.desktopTrigger.focus();
  page.click(page.desktopTrigger);
  assert.equal(page.document.activeElement, page.desktopTrigger, 'pointer opening does not jump focus');
  page.document.dispatch('pointerdown', { target: page.exploreAll });
  assert.equal(page.panel.hidden, false);
  page.document.dispatch('pointerdown', { target: page.desktopTrigger });
  assert.equal(page.panel.hidden, false);
  page.document.dispatch('pointerdown', { target: page.outside });
  assert.equal(page.panel.hidden, true);
  assert.equal(page.document.activeElement, page.desktopTrigger);
});

test('focus can leave the nonmodal panel and closes it without a focus trap', () => {
  const page = fixture();
  page.click(page.desktopTrigger, { detail: 0 });
  page.exploreAll.focus();
  assert.equal(page.panel.hidden, false);
  page.outside.focus();
  assert.equal(page.panel.hidden, true);
  assert.equal(page.document.activeElement, page.outside);
});

test('responsive changes close the panel, preserve usable focus, and name the mobile Main menu', () => {
  const page = fixture();
  page.click(page.desktopTrigger, { detail: 0 });
  page.resizeMobile(true);
  assert.equal(page.panel.hidden, true);
  assert.equal(page.document.activeElement, page.mobileTrigger);
  page.click(page.mobileTrigger, { detail: 0 });
  assert.equal(page.panel.getAttribute('aria-label'), 'Main menu');
  assert.equal(page.document.activeElement, page.firstMobileLink);
  page.resizeMobile(false);
  assert.equal(page.panel.hidden, true);
  assert.equal(page.document.activeElement, page.desktopTrigger);
});

test('working panel anchor closes disclosure, focuses destination, scrolls and updates hash', () => {
  const page = fixture();
  page.click(page.desktopTrigger, { detail: 0 });
  const click = page.click(page.exploreAll);
  assert.equal(click.defaultPrevented, true);
  assert.equal(page.panel.hidden, true);
  assert.equal(page.document.activeElement, page.products);
  assert.equal(page.products.getAttribute('tabindex'), '-1');
  assert.equal(page.products.focusCalls.at(-1).preventScroll, true);
  assert.equal(page.products.scrollCalls.at(-1).behavior, 'smooth');
  assert.deepEqual(page.historyWrites, ['#products']);
});

test('anchor scrolling respects reduced motion and leaves product selection to the showcase', () => {
  const page = fixture({ reduced: true });
  const link = new page.Element('a', { href: '#foundation' });
  assert.equal(page.click(link).defaultPrevented, true);
  assert.equal(page.foundation.scrollCalls.at(-1).behavior, 'instant');
  const tile = new page.Element('a', { href: '#products', 'data-product-link': 'cases' });
  assert.equal(page.click(tile).defaultPrevented, false);
  assert.equal(page.products.scrollCalls.length, 0);
  const localNav = new page.Element('nav');
  localNav.classList.add('product-navigation');
  const localLink = new page.Element('a', { href: '#products' });
  localLink.parent = localNav;
  assert.equal(page.click(localLink).defaultPrevented, false);
});

test('modified links and unavailable anchor targets retain normal browser handling', () => {
  const page = fixture();
  const link = new page.Element('a', { href: '#foundation' });
  assert.equal(page.click(link, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(page.click(link, { button: 1 }).defaultPrevented, false);
  const missing = new page.Element('a', { href: '#missing' });
  assert.equal(page.click(missing).defaultPrevented, false);
  assert.equal(page.historyWrites.length, 0);
  assert.equal(page.foundation.scrollCalls.length, 0);
});

test('demo buttons keep the current phase inert and call only the central future action', () => {
  const page = fixture();
  page.demoButtons.forEach(button => page.click(button));
  assert.equal(page.panel.hidden, true);
  assert.equal(page.document.activeElement, page.outside);
  assert.equal(page.historyWrites.length, 0);
  assert.equal(page.foundation.scrollCalls.length, 0);
  let calls = 0;
  page.sandbox.INDICE_DATA.config.demoAction = () => { calls += 1; };
  page.click(page.demoButtons[0]);
  assert.equal(calls, 1, 'one future action hook per activation');
});

test('pillar state covers the product story and clears in hero and closing sections', () => {
  const page = fixture();
  const current = () => page.pillarLinks.filter(link => link.hasAttribute('aria-current')).map(link => link.dataset.pillar);
  assert.deepEqual(current(), []);
  page.scroll(900);
  assert.deepEqual(current(), ['foundation']);
  page.scroll(2200);
  assert.deepEqual(current(), ['products']);
  page.scroll(6500);
  assert.deepEqual(current(), ['products'], 'the bounded showcase remains part of Products');
  page.scroll(8100);
  assert.deepEqual(current(), ['services']);
  page.scroll(9500);
  assert.deepEqual(current(), []);
  page.scroll(0);
  assert.deepEqual(current(), []);
});

test('reveals stay immediately available with reduced motion or missing animation support', () => {
  for (const options of [{ reduced: true }, { observerAvailable: false }, { observerThrows: true }]) {
    const page = fixture(options);
    assert.equal(page.root.classList.contains('reveal-ready'), false);
    assert.equal(page.observed.size, 0);
  }
  const page = fixture();
  assert.equal(page.root.classList.contains('reveal-ready'), true);
  page.observers[0].callback([{ target: page.reveal, isIntersecting: true }]);
  assert.equal(page.reveal.classList.contains('is-revealed'), true);
  assert.equal(page.observed.has(page.reveal), false);
  page.observers[0].callback([{ target: page.reveal, isIntersecting: false, boundingClientRect: { top: -100 } }]);
  assert.equal(page.reveal.classList.contains('is-revealed'), true, 'scrolling down past content keeps it revealed');
  page.observers[0].callback([{ target: page.reveal, isIntersecting: false, boundingClientRect: { top: 950 } }]);
  assert.equal(page.reveal.classList.contains('is-revealed'), true, 'scrolling up does not reverse its reveal');
  page.observers[0].callback([{ target: page.reveal, isIntersecting: true }]);
  assert.equal(page.reveal.classList.contains('is-revealed'), true, 'content stays visible on re-entry');
  page.motionMedia.matches = true;
  page.motionMedia.dispatch('change');
  assert.equal(page.root.classList.contains('reveal-ready'), false);
});

test('pagehide removes interaction listeners and pending work; bfcache restore reconnects once', () => {
  const page = fixture();
  page.browser.dispatch('scroll');
  assert.equal(page.frames.size, 1);
  page.browser.dispatch('pagehide');
  assert.equal(page.frames.size, 0);
  assert.equal(page.document.count('click'), 0);
  assert.equal(page.document.count('keydown'), 0);
  assert.equal(page.desktopTrigger.count('click'), 0);
  assert.equal(page.root.classList.contains('reveal-ready'), false);
  assert.equal(page.observers[0].disconnected, true);
  page.click(page.desktopTrigger);
  assert.equal(page.panel.hidden, true);
  page.browser.dispatch('pageshow', { persisted: true });
  assert.equal(page.desktopTrigger.count('click'), 1);
  assert.equal(page.document.count('click'), 1);
  page.click(page.desktopTrigger);
  assert.equal(page.panel.hidden, false);
  page.browser.dispatch('pagehide');
  page.browser.dispatch('pageshow', { persisted: true });
  assert.equal(page.desktopTrigger.count('click'), 1);
});
