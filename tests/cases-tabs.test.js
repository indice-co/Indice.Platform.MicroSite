const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/cases-tabs.js'), 'utf8');

function fixture() {
  const panels = Array.from({ length: 4 }, () => ({
    hidden: false,
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; }
  }));
  const tabs = panels.map((_, i) => ({
    id: `tab-${i}`,
    attributes: {},
    listeners: {},
    getAttribute() { return String(i); },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    focus() { focused = i; }
  }));
  let focused = -1;
  const list = { hidden: true, querySelectorAll: () => tabs };
  const classes = new Set();
  vm.runInNewContext(source, {
    document: {
      querySelector: () => ({ querySelector: () => list, classList: { add: name => classes.add(name) } }),
      getElementById: index => panels[Number(index)]
    }
  });
  return {
    panels, tabs, list, classes,
    focused: () => focused,
    key(index, key) {
      const event = { key, prevented: false, preventDefault() { this.prevented = true; } };
      tabs[index].listeners.keydown(event);
      return event;
    }
  };
}

test('capability tabs enhance all content to one selected, correctly labelled panel', () => {
  const page = fixture();
  assert(page.classes.has('is-tabbed'));
  assert.equal(page.list.hidden, false);
  assert.deepEqual(page.panels.map(panel => panel.hidden), [false, true, true, true]);
  page.tabs.forEach((tab, i) => {
    assert.equal(page.panels[i].attributes.role, 'tabpanel');
    assert.equal(page.panels[i].attributes['aria-labelledby'], tab.id);
    assert.equal(page.panels[i].tabIndex, 0);
  });
  page.tabs[2].listeners.click();
  assert.deepEqual(page.tabs.map(tab => tab.attributes['aria-selected']), ['false', 'false', 'true', 'false']);
  assert.deepEqual(page.tabs.map(tab => tab.tabIndex), [-1, -1, 0, -1]);
  assert.deepEqual(page.panels.map(panel => panel.hidden), [true, true, false, true]);
});

test('vertical tab navigation wraps, supports Home/End and leaves selection manual', () => {
  const page = fixture();
  assert(page.key(0, 'ArrowUp').prevented);
  assert.equal(page.focused(), 3);
  page.key(3, 'ArrowDown');
  assert.equal(page.focused(), 0);
  page.key(0, 'End');
  assert.equal(page.focused(), 3);
  page.key(3, 'Home');
  assert.equal(page.focused(), 0);
  assert.equal(page.key(0, 'Tab').prevented, false);
  assert.deepEqual(page.panels.map(panel => panel.hidden), [false, true, true, true]);
});
