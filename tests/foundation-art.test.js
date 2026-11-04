'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/foundation-art.js'), 'utf8');

class Events {
  constructor() { this.events = new Map(); }
  addEventListener(type, callback, options = {}) {
    if (options.signal?.aborted) return;
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(callback);
    options.signal?.addEventListener('abort', () => this.events.get(type)?.delete(callback), { once: true });
  }
  dispatch(type, event = {}) {
    for (const callback of [...(this.events.get(type) || [])]) callback(event);
  }
  count(type) { return this.events.get(type)?.size || 0; }
}

function fixture({ reduced = false, fine = true, observers = true } = {}) {
  class Element extends Events {
    constructor() {
      super();
      this.values = new Set();
      this.classList = {
        add: name => this.values.add(name), remove: name => this.values.delete(name),
        contains: name => this.values.has(name),
        toggle: (name, force) => force ? this.values.add(name) : this.values.delete(name),
      };
      this.properties = new Map();
      this.style = { setProperty: (name, value) => this.properties.set(name, value) };
      this.attributes = new Map();
      this.offsetLeft = 100; this.offsetTop = 80;
      this.offsetWidth = 160; this.offsetHeight = 100;
    }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name); }
    closest() { return this.isToggle ? this : null; }
  }
  const art = new Element();
  const toggle = new Element();
  toggle.isToggle = true;
  const pieces = Array.from({ length: 6 }, (_, index) => {
    const piece = new Element();
    piece.offsetLeft += index * 30;
    piece.classList.add(index >= 4 ? 'art-coordinate' : index === 3 ? 'foundation-slash' : 'foundation-plane');
    return piece;
  });
  let top = 200;
  art.getBoundingClientRect = () => ({ left: 100, top, width: 500, height: 330, right: 600, bottom: top + 330 });
  art.querySelectorAll = () => pieces;
  art.querySelector = () => toggle;
  const document = new Events();
  document.hidden = false;
  document.querySelector = () => art;
  const browser = new Events();
  const reducedMedia = new Events();
  const pointerMedia = new Events();
  reducedMedia.matches = reduced;
  pointerMedia.matches = fine;
  const frames = new Map();
  const intersection = [];
  const resize = [];
  let sequence = 0;
  class Observer {
    constructor(callback, list) { this.callback = callback; this.disconnected = false; list.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const sandbox = {
    document, AbortController, innerWidth: 1400, innerHeight: 900,
    matchMedia: query => query.includes('reduced-motion') ? reducedMedia : pointerMedia,
    requestAnimationFrame: callback => { const id = ++sequence; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    addEventListener: browser.addEventListener.bind(browser),
  };
  if (observers) {
    sandbox.IntersectionObserver = class extends Observer { constructor(callback) { super(callback, intersection); } };
    sandbox.ResizeObserver = class extends Observer { constructor(callback) { super(callback, resize); } };
  }
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: 'js/foundation-art.js' });
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); };
  const move = (x = 230, y = top + 130, options = {}) => {
    art.dispatch('pointermove', { clientX: x, clientY: y, target: art, pointerType: 'mouse', ...options });
    flush();
  };
  const offsets = piece => ['--repel-x', '--repel-y'].map(name => parseFloat(piece.properties.get(name) || '0'));
  const zero = () => pieces.every(piece => offsets(piece).every(value => value === 0));
  return { art, toggle, pieces, document, browser, frames, reducedMedia, pointerMedia, intersection, resize,
    flush, move, offsets, zero, setTop: value => { top = value; } };
}

test('hover pushes pieces away from the pointer with bounded displacement and no perpetual frame loop', () => {
  const page = fixture();
  assert(page.art.classList.contains('is-animating'));
  page.move();
  const [x, y] = page.offsets(page.pieces[0]);
  assert(x > 0, 'piece center lies to the right of cursor and moves further right');
  assert.equal(y, 0);
  page.pieces.forEach((piece, index) => {
    const limit = index >= 4 ? 9 : index === 3 ? 55 : 42;
    assert(Math.hypot(...page.offsets(piece)) <= limit + 0.01);
  });
  assert.equal(page.frames.size, 0);
  page.move(280, 330);
  assert(Math.hypot(...page.offsets(page.pieces[0])) > 0, 'exact center has a stable finite escape direction');
});

test('pointer events coalesce and leaving, scrolling, resizing or blurring returns every layer home', () => {
  const page = fixture();
  for (let i = 0; i < 8; i++) page.art.dispatch('pointermove', { clientX: 220 + i, clientY: 330, target: page.art, pointerType: 'mouse' });
  assert.equal(page.frames.size, 1);
  page.flush();
  for (const [target, event] of [[page.art, 'pointerleave'], [page.art, 'pointercancel'], [page.browser, 'scroll'], [page.browser, 'resize'], [page.browser, 'blur']]) {
    page.move();
    assert(!page.zero());
    target.dispatch(event);
    assert(page.zero(), event);
  }
});

test('touch, coarse pointer and reduced-motion modes never repel; reduced motion also stops floating', () => {
  const page = fixture();
  page.move();
  page.move(230, 330, { pointerType: 'touch' });
  assert(page.zero());
  page.pointerMedia.matches = false;
  page.pointerMedia.dispatch('change');
  page.move();
  assert(page.zero());
  page.pointerMedia.matches = true;
  page.reducedMedia.matches = true;
  page.reducedMedia.dispatch('change');
  page.move();
  assert(page.zero());
  assert(!page.art.classList.contains('is-animating'));
  assert(!fixture({ reduced: true }).art.classList.contains('is-animating'));
});

test('pause stops float and interaction and persists across visibility changes until resumed', () => {
  const page = fixture();
  page.move();
  page.toggle.dispatch('click');
  assert.equal(page.toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(page.toggle.getAttribute('aria-label'), 'Resume artwork animation');
  assert(page.zero());
  assert(!page.art.classList.contains('is-animating'));
  page.document.hidden = true;
  page.document.dispatch('visibilitychange');
  page.document.hidden = false;
  page.document.dispatch('visibilitychange');
  assert(!page.art.classList.contains('is-animating'));
  page.move();
  assert(page.zero());
  page.toggle.dispatch('click');
  assert.equal(page.toggle.getAttribute('aria-pressed'), 'false');
  assert.equal(page.toggle.getAttribute('aria-label'), 'Pause artwork animation');
  assert(page.art.classList.contains('is-animating'));
  page.move(230, 330, { target: page.toggle });
  assert(page.zero(), 'hovering the pause control does not disturb the artwork');
});

test('offscreen and hidden artwork pauses and resets without losing the ability to resume', () => {
  const page = fixture();
  page.move();
  page.intersection[0].callback([{ target: page.art, isIntersecting: false }]);
  assert(!page.art.classList.contains('is-animating'));
  assert(page.zero());
  page.intersection[0].callback([{ target: page.art, isIntersecting: true }]);
  assert(page.art.classList.contains('is-animating'));
  page.document.hidden = true;
  page.document.dispatch('visibilitychange');
  assert(!page.art.classList.contains('is-animating'));
  page.document.hidden = false;
  page.document.dispatch('visibilitychange');
  assert(page.art.classList.contains('is-animating'));
});

test('observer-free visibility falls back to native scroll measurements', () => {
  const page = fixture({ observers: false });
  page.setTop(-500);
  page.browser.dispatch('scroll');
  assert(!page.art.classList.contains('is-animating'));
  page.setTop(200);
  page.browser.dispatch('scroll');
  assert(page.art.classList.contains('is-animating'));
});

test('page lifecycle cancels work and observers then reconnects once for a persisted page', () => {
  const page = fixture();
  page.art.dispatch('pointermove', { clientX: 230, clientY: 330, target: page.art, pointerType: 'mouse' });
  assert.equal(page.frames.size, 1);
  page.browser.dispatch('pagehide');
  assert.equal(page.frames.size, 0);
  assert.equal(page.art.count('pointermove'), 0);
  assert.equal(page.toggle.count('click'), 0);
  assert(page.intersection[0].disconnected);
  assert(page.resize[0].disconnected);
  assert(!page.art.classList.contains('is-animating'));
  page.browser.dispatch('pageshow', { persisted: true });
  page.browser.dispatch('pageshow', { persisted: true });
  assert.equal(page.art.count('pointermove'), 1);
  assert.equal(page.toggle.count('click'), 1);
  assert(page.art.classList.contains('is-animating'));
});
