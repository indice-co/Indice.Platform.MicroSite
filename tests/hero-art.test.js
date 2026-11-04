'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/hero-art.js'), 'utf8');

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

function fixture({ reduced = false, observerAvailable = true, missingArt = false } = {}) {
  const art = new Events();
  const classes = new Set();
  art.classList = {
    add: value => classes.add(value), remove: value => classes.delete(value),
    toggle: (value, force) => force ? classes.add(value) : classes.delete(value),
    contains: value => classes.has(value),
  };
  const toggle = new Events();
  const attributes = new Map();
  toggle.setAttribute = (name, value) => attributes.set(name, value);
  toggle.getAttribute = name => attributes.get(name);
  art.querySelector = () => toggle;
  let top = 100;
  art.getBoundingClientRect = () => ({ top, bottom: top + 500, left: 850, right: 1300, width: 450, height: 500 });
  const document = new Events();
  document.hidden = false;
  document.querySelector = () => missingArt ? null : art;
  const browser = new Events();
  const media = new Events();
  media.matches = reduced;
  const observers = [];
  const sandbox = { document, AbortController, innerHeight: 900, innerWidth: 1400,
    matchMedia: () => media, addEventListener: browser.addEventListener.bind(browser) };
  if (observerAvailable) sandbox.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: 'js/hero-art.js' });
  return { art, toggle, document, browser, media, observers, setTop: value => { top = value; },
    running: () => art.classList.contains('is-animating') };
}

test('hero arrival and color playback pause offscreen and in hidden tabs, while user pause persists', () => {
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
  page.toggle.dispatch('click');
  assert(!page.running());
  assert.equal(page.toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(page.toggle.getAttribute('aria-label'), 'Resume hero artwork animation');
  page.observers[0].callback([{ target: page.art, isIntersecting: false }]);
  page.observers[0].callback([{ target: page.art, isIntersecting: true }]);
  page.document.dispatch('visibilitychange');
  assert(!page.running(), 'visibility changes cannot override user pause');
  page.toggle.dispatch('click');
  assert(page.running());
  assert.equal(page.toggle.getAttribute('aria-pressed'), 'false');
  assert.equal(page.toggle.getAttribute('aria-label'), 'Pause hero artwork animation');
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

test('page lifecycle releases listeners and observers and restores a paused page exactly once', () => {
  const page = fixture();
  page.toggle.dispatch('click');
  page.browser.dispatch('pagehide');
  assert(!page.running());
  assert(page.observers[0].disconnected);
  assert.equal(page.toggle.count('click'), 0);
  assert.equal(page.document.count('visibilitychange'), 0);
  assert.equal(page.media.count('change'), 0);
  assert.equal(page.browser.count('resize'), 0);
  page.browser.dispatch('pageshow', { persisted: true });
  page.browser.dispatch('pageshow', { persisted: true });
  assert.equal(page.toggle.count('click'), 1);
  assert.equal(page.media.count('change'), 1);
  assert.equal(page.observers.length, 2);
  assert(!page.running(), 'user pause survives BFCache restore');
  page.toggle.dispatch('click');
  assert(page.running());
});

test('a page without hero artwork remains usable without registering motion listeners', () => {
  const page = fixture({ missingArt: true });
  assert.equal(page.toggle.count('click'), 0);
  assert.equal(page.browser.count('resize'), 0);
});
