/* Keep every capability readable without JavaScript; enhance to manual tabs. */
(() => {
  'use strict';
  const component = document.querySelector('.cases-capabilities');
  if (!component) return;
  const list = component.querySelector('[role="tablist"]');
  const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
      tabs[next].focus();
    });
  });
  select(0);
  component.classList.add('is-tabbed');
  list.hidden = false;
})();
