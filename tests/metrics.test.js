'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/metrics.js'), 'utf8');

function fixture(reduced = false) {
  const labels = ['42', '280', '+300.000', '+25'];
  const counters = labels.map(label => ({ dataset: { countValue: label }, textContent: label }));
  const section = { querySelectorAll: () => counters };
  const frames = new Map();
  let sequence = 0;
  let callback;
  const media = { matches: reduced, addEventListener() {} };
  const document = { hidden: false, querySelector: () => section, addEventListener() {} };
  const sandbox = { document, Intl, AbortController, innerHeight: 900,
    matchMedia: () => media,
    requestAnimationFrame: fn => { frames.set(++sequence, fn); return sequence; },
    cancelAnimationFrame: id => frames.delete(id),
    addEventListener() {},
    IntersectionObserver: class {
      constructor(fn) { callback = fn; }
      observe() {}
      disconnect() {}
    },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return {
    counters, frames,
    visible: (visible, top = 100) => callback([{ target: section, isIntersecting: visible, boundingClientRect: { top } }]),
    tick: timestamp => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(timestamp)); },
    values: () => counters.map(counter => counter.textContent),
  };
}

test('metrics count strictly in sequence and preserve prefixes and thousands separators', () => {
  const page = fixture();
  page.visible(true);
  page.tick(0);
  assert.deepEqual(page.values(), ['0', '0', '+0', '+0']);
  page.tick(700);
  assert(Number(page.values()[0]) > 0 && Number(page.values()[0]) < 42);
  assert.equal(page.values()[1], '0');
  page.tick(1400);
  assert.deepEqual(page.values(), ['42', '0', '+0', '+0']);
  page.tick(2800);
  assert.deepEqual(page.values(), ['42', '280', '+0', '+0']);
  page.tick(4200);
  assert.deepEqual(page.values(), ['42', '280', '+300.000', '+0']);
  page.tick(5600);
  assert.deepEqual(page.values(), ['42', '280', '+300.000', '+25']);
  assert.equal(page.frames.size, 0);
  page.visible(false, 950);
  assert.deepEqual(page.values(), ['42', '280', '+300.000', '+25']);
  page.visible(true);
  assert.equal(page.frames.size, 0, 'completed counts do not restart on re-entry');
});

test('reduced motion shows final metrics without scheduling frames', () => {
  const page = fixture(true);
  page.visible(true);
  assert.deepEqual(page.values(), ['42', '280', '+300.000', '+25']);
  assert.equal(page.frames.size, 0);
});
