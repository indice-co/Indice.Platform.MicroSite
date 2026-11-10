'use strict';

/* Design 2 - Terminal. Everything works without this file; it adds the typing intro, product tabs,
   scroll-spy, copy buttons, a command palette and the Risk aggregation demo. */

/* ---------- Pure helpers (unit-tested) ---------- */
function fuzzyRank(query, items) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return items.slice();
  const scored = [];
  items.forEach((item, order) => {
    const label = item.label.toLowerCase();
    const hint = (item.hint || '').toLowerCase();
    let score = 0;
    if (label.startsWith(needle)) score = 100 - Math.min(label.length, 40) / 10;
    else if (label.includes(needle)) score = 80 - label.indexOf(needle) / 10;
    else if (hint.includes(needle)) score = 40;
    else {
      let position = 0;
      for (const char of needle) { position = label.indexOf(char, position); if (position === -1) break; position += 1; }
      if (position !== -1) score = 20;
    }
    if (score) scored.push({ item, score, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map(entry => entry.item);
}

/* Ranges from the Risk template: None 0, Low 1-1000, Medium 1001-2000, High 2001-3000.
   A score above the High range counts as High. */
function riskLevel(score) {
  if (!(score > 0)) return 'None';
  if (score <= 1000) return 'Low';
  if (score <= 2000) return 'Medium';
  return 'High';
}
function aggregate(scores, mode) {
  const clean = scores.map(score => (Number.isFinite(score) && score > 0 ? Math.round(score) : 0));
  const total = mode === 'maximum' ? Math.max(0, ...clean) : clean.reduce((sum, score) => sum + score, 0);
  return { total, level: riskLevel(total) };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { fuzzyRank, riskLevel, aggregate };

/* ---------- Browser behaviour ---------- */
if (typeof document !== 'undefined') (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* Product tabs ------------------------------------------------ */
  const tabs = $$('.tab');
  const panels = $$('.product');
  const productIds = panels.map(panel => panel.id);
  let activeProduct = productIds[0];
  let currentFile = null;
  const explorerLinks = $$('.explorer [data-spy-link]');
  /* While the Suite section is current, the active product is the "open file". */
  const fileKey = id => (id === 'suite' ? activeProduct : id);

  function activate(id) {
    if (!productIds.includes(id)) return;
    activeProduct = id;
    tabs.forEach(tab => {
      const on = tab.getAttribute('aria-controls') === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach(panel => panel.classList.toggle('is-active', panel.id === id));
    markExplorer(currentFile);
    updateStatus();
  }

  function goTo(hash) {
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    if (!id) return;
    if (productIds.includes(id)) {
      activate(id);
      const host = $('#suite-products');
      if (host) host.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    }
  }

  if (tabs.length) {
    /* Tab semantics only exist once the tab behaviour does; without this script they are plain in-page links. */
    $('.tablist').setAttribute('role', 'tablist');
    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', tab.getAttribute('href').slice(1));
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${panel.id}`);
    });
    root.classList.add('tabs-ready');
    const fromHash = decodeURIComponent(location.hash.slice(1));
    activate(productIds.includes(fromHash) ? fromHash : productIds[0]);
    tabs.forEach(tab => tab.addEventListener('click', event => {
      event.preventDefault();
      activate(tab.getAttribute('aria-controls'));
      history.replaceState(null, '', `#${tab.getAttribute('aria-controls')}`);
    }));
    $('.tablist').addEventListener('keydown', event => {
      const index = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      const next = tabs[(keys[event.key] + tabs.length) % tabs.length];
      next.focus();
      activate(next.getAttribute('aria-controls'));
    });
    window.addEventListener('hashchange', () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (productIds.includes(id)) goTo(`#${id}`);
    });
    if (productIds.includes(fromHash)) requestAnimationFrame(() => goTo(`#${fromHash}`));
  }
  $$('[data-product-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    goTo(link.getAttribute('href'));
    closeExplorer();
  }));

  /* Scroll-spy: explorer, file tabs and status bar ----------------- */
  const spyLinks = $$('[data-spy-link]');
  const spyIds = [...new Set(spyLinks.map(link => link.dataset.spyLink))].filter(id => !productIds.includes(id));
  const spyTargets = spyIds.map(id => document.getElementById(id)).filter(Boolean)
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  let frame = 0;

  function markExplorer(id) {
    currentFile = id;
    const key = fileKey(id);
    explorerLinks.forEach(link => {
      if (link.dataset.spyLink === key) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function updateStatus() {
    const target = $('[data-sb-path]');
    if (!target) return;
    const key = fileKey(currentFile || 'top');
    const link = explorerLinks.find(item => item.dataset.spyLink === key);
    const dir = link?.closest('li.dir')?.querySelector(':scope > span')?.textContent.trim();
    const file = link?.textContent.trim();
    target.textContent = ['indice-platform', dir, file].filter(Boolean).join(' \u203a ');
  }

  function spy() {
    frame = 0;
    const probe = $('.titlebar').offsetHeight + Math.min(160, innerHeight * 0.2);
    let current = 'top';
    for (const target of spyTargets) {
      if (target.getBoundingClientRect().top <= probe) current = target.id;
    }
    const pillar = document.getElementById(current)?.closest('[data-spy]');
    $$('.filetabs a').forEach(tab => tab.classList.toggle('is-active', !!pillar && tab.dataset.spyLink === pillar.id));
    if (current !== currentFile) markExplorer(current);
    updateStatus();
  }
  const scheduleSpy = () => { if (!frame) frame = requestAnimationFrame(spy); };
  addEventListener('scroll', scheduleSpy, { passive: true });
  addEventListener('resize', scheduleSpy, { passive: true });
  spy();

  /* Explorer drawer (small screens) ---------------------------------- */
  const explorer = $('#explorer');
  const toggle = $('.explorer-toggle');
  const scrim = $('[data-scrim]');
  /* The drawer is fixed, so it follows the title bar even while the design ribbon is still on screen. */
  const placeDrawer = () => { explorer.style.top = `${Math.max(0, $('.titlebar').getBoundingClientRect().bottom)}px`; };
  function closeExplorer() {
    if (!explorer) return;
    explorer.classList.remove('is-open');
    explorer.style.top = '';
    toggle?.setAttribute('aria-expanded', 'false');
    if (scrim) scrim.hidden = true;
  }
  toggle?.addEventListener('click', () => {
    const open = !explorer.classList.contains('is-open');
    explorer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (scrim) scrim.hidden = !open;
    if (open) placeDrawer(); else explorer.style.top = '';
  });
  addEventListener('scroll', () => { if (explorer?.classList.contains('is-open')) placeDrawer(); }, { passive: true });
  scrim?.addEventListener('click', closeExplorer);
  explorer?.addEventListener('click', event => { if (event.target.closest('a')) closeExplorer(); });
  addEventListener('keydown', event => { if (event.key === 'Escape') closeExplorer(); });

  /* Copy buttons ------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.append(area); area.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy failed')); } catch (error) { reject(error); } finally { area.remove(); }
    });
  }
  $$('.codeblock').forEach(block => {
    const caption = $('figcaption', block);
    const code = $('code', block);
    if (!caption || !code) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'copy'; button.textContent = 'copy';
    button.setAttribute('aria-label', `Copy ${$('.file', block)?.textContent || 'code'}`);
    button.addEventListener('click', () => {
      copyText(code.textContent).then(() => { button.textContent = 'copied'; button.classList.add('is-done'); })
        .catch(() => { button.textContent = 'press Ctrl C'; })
        .finally(() => setTimeout(() => { button.textContent = 'copy'; button.classList.remove('is-done'); }, 1600));
    });
    caption.append(button);
  });

  /* Hero typing --------------------------------------------------------- */
  (function typeHero() {
    const spans = $$('.hero .typed');
    const caret = $('.hero .caret');
    if (!spans.length || !caret || reduced) return;
    const lines = spans.map(span => span.closest('.cmd'));
    const texts = spans.map(span => span.textContent);
    spans.forEach(span => { span.textContent = ''; });
    lines.forEach(line => { line.style.visibility = 'hidden'; });
    let index = 0;
    const next = () => {
      if (index >= spans.length) return;
      const span = spans[index];
      const text = texts[index];
      lines[index].style.visibility = 'visible';
      lines[index].append(caret);
      let position = 0;
      const step = () => {
        span.textContent = text.slice(0, ++position);
        if (position < text.length) setTimeout(step, 18 + Math.random() * 26);
        else { index += 1; setTimeout(next, 260); }
      };
      setTimeout(step, 120);
    };
    next();
  })();

  /* Section reveal ---------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reduced) {
    const sections = $$('.sec');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.02 });
    root.classList.add('reveal-ready');
    sections.forEach(section => observer.observe(section));
  }

  /* Risk aggregation demo -------------------------------------------------------- */
  const riskA = $('#risk-a');
  if (riskA) {
    const riskB = $('#risk-b');
    const out = $('#risk-out');
    const update = () => {
      const mode = $('input[name="risk-mode"]:checked')?.value || 'sum';
      const { total, level } = aggregate([parseFloat(riskA.value), parseFloat(riskB.value)], mode);
      out.textContent = `${total} \u00b7 ${level}`;
    };
    $$('#risk-demo input').forEach(input => input.addEventListener('input', update));
    update();
  }

  /* Command palette ------------------------------------------------------------------ */
  const palette = $('#palette');
  const openers = $$('.palette-open');
  if (palette && typeof palette.showModal === 'function') {
    const input = $('#palette-input');
    const list = $('#palette-list');
    const items = JSON.parse($('#palette-data').textContent);
    let results = items;
    let selected = 0;

    const render = () => {
      list.replaceChildren(...(results.length ? results.slice(0, 14).map((item, index) => {
        const li = document.createElement('li');
        li.id = `palette-opt-${index}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(index === selected));
        const name = document.createElement('span');
        name.textContent = item.label;
        const hint = document.createElement('span');
        hint.textContent = item.hint || '';
        li.append(name, hint);
        li.addEventListener('mousemove', () => { if (selected !== index) { selected = index; paint(); } });
        li.addEventListener('click', () => choose(item));
        return li;
      }) : (() => { const li = document.createElement('li'); li.className = 'palette-empty'; li.textContent = 'No matches'; return [li]; })()));
      input.setAttribute('aria-activedescendant', results.length ? `palette-opt-${selected}` : '');
    };
    const paint = () => {
      $$('li[role="option"]', list).forEach((li, index) => li.setAttribute('aria-selected', String(index === selected)));
      input.setAttribute('aria-activedescendant', `palette-opt-${selected}`);
      $(`#palette-opt-${selected}`)?.scrollIntoView({ block: 'nearest' });
    };
    const choose = item => {
      palette.close();
      if (/^https?:/.test(item.href)) window.open(item.href, '_blank', 'noopener');
      else if (item.href.startsWith('#')) goTo(item.href);
      else location.href = item.href;
    };
    const open = () => { input.value = ''; results = items; selected = 0; render(); palette.showModal(); input.focus(); };

    input.addEventListener('input', () => { results = fuzzyRank(input.value, items); selected = 0; render(); });
    input.addEventListener('keydown', event => {
      const count = Math.min(results.length, 14);
      if (event.key === 'ArrowDown') { event.preventDefault(); if (count) { selected = (selected + 1) % count; paint(); } }
      else if (event.key === 'ArrowUp') { event.preventDefault(); if (count) { selected = (selected - 1 + count) % count; paint(); } }
      else if (event.key === 'Enter') { event.preventDefault(); if (results[selected]) choose(results[selected]); }
    });
    palette.addEventListener('click', event => { if (event.target === palette) palette.close(); });
    openers.forEach(button => button.addEventListener('click', open));
    addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (palette.open) palette.close(); else open();
      }
    });
  } else {
    openers.forEach(button => { button.hidden = true; });
  }

  /* Deep links on load */
  if (location.hash && !productIds.includes(decodeURIComponent(location.hash.slice(1)))) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
})();
