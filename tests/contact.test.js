const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/contact.js'), 'utf8');

function fixture({ reduced = false, observer = true } = {}) {
  const classes = new Set();
  const listeners = {};
  const documentListeners = {};
  const bounds = { top: 1200, bottom: 1800 };
  const section = {
    querySelector: () => ({ getBoundingClientRect: () => ({ top: bounds.top, bottom: bounds.top + 300, height: 300 }) }),
    classList: {
      add: value => classes.add(value),
      toggle: (value, enabled) => enabled ? classes.add(value) : classes.delete(value),
    },
    getBoundingClientRect: () => bounds,
  };
  const motion = { matches: reduced, addEventListener: (name, callback) => { motion.change = callback; } };
  let intersection;
  const sandbox = {
    document: {
      hidden: false,
      querySelector: () => section,
      addEventListener: (name, callback) => { documentListeners[name] = callback; },
    },
    matchMedia: () => motion,
    innerHeight: 900,
    AbortController,
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  if (observer) sandbox.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {}
    disconnect() {}
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return { classes, sandbox, listeners, documentListeners, bounds, motion, section, enter: () => { bounds.top = 200; intersection(); } };
}

test('closing sequence pauses offscreen, in hidden tabs and on page exit, then resumes', () => {
  const f = fixture();
  assert(f.classes.has('contact-ready'));
  assert(!f.classes.has('contact-playing'));
  f.enter();
  assert(f.classes.has('contact-playing'));
  f.sandbox.document.hidden = true;
  f.documentListeners.visibilitychange();
  assert(!f.classes.has('contact-playing'));
  f.sandbox.document.hidden = false;
  f.documentListeners.visibilitychange();
  assert(f.classes.has('contact-playing'));
  f.listeners.pagehide();
  assert(!f.classes.has('contact-playing'));
  f.bounds.top = 200;
  f.listeners.pageshow({ persisted: true });
  assert(f.classes.has('contact-playing'));
});

test('reduced motion disables playback and observer-free scrolling still works', () => {
  const f = fixture({ reduced: true, observer: false });
  f.bounds.top = 200;
  f.listeners.scroll();
  assert(!f.classes.has('contact-playing'));
  f.motion.matches = false;
  f.motion.change();
  assert(f.classes.has('contact-playing'));
  f.bounds.top = 1200;
  f.listeners.scroll();
  assert(!f.classes.has('contact-playing'));
});

test('three typed lines preserve the accessible title and stagger every character', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const lines = [...html.matchAll(/<span class="contact-line" aria-hidden="true">([\s\S]*?)<\/span><\/span>/g)];
  assert.equal(lines.length, 3);
  assert(html.includes('aria-label="The foundation. The products. The expertise."'));
  const delays = [...html.matchAll(/--character-delay:([\d.]+)s/g)].map(match => Number(match[1]));
  assert.equal(delays.length, 42);
  assert(delays.every((delay, index) => !index || delay > delays[index - 1]));
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  assert.match(css, /opacity:1;\s*animation:contact-type \.04s linear var\(--character-delay\) backwards/);
  assert.match(css, /@keyframes contact-type\s*\{\s*from \{ opacity:0 \}\s*50%,100% \{ opacity:1 \}/);
  assert(!/contact-type[^;\n]*steps\(/.test(css), 'Typing must not depend on a rounded final step');
});

test('typing waits until the entire heading is visible rather than the section edge', () => {
  const f = fixture({ observer: false });
  f.bounds.top = 750;
  f.listeners.scroll();
  assert(!f.classes.has('contact-playing'));
  f.bounds.top = 500;
  f.listeners.scroll();
  assert(f.classes.has('contact-playing'));
});

test('closing slashes preserve the hero geometry and reveal the second after ignition', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, '../assets/logos/INDICE_slashes.svg'), 'utf8');
  const art = html.match(/<svg class="contact-slash"[\s\S]*?<\/svg>/)[0];
  assert(art.includes('viewBox="0 0 250 202"'));
  assert.deepEqual([...art.matchAll(/\bd="([^"]+)"/g)].map(match => match[1]), [...source.matchAll(/\bd="([^"]+)"/g)].map(match => match[1]));
  const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  assert.match(css, /contact-slash-appear \.4s ease calc\(var\(--typing-end\) \+ 3\.2s\) both/);
});
