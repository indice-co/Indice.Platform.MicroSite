'use strict';

/* Design 3 - Blueprint. Everything works without this file; it adds the live dependency links in the
   layered diagram, matrix highlighting, sheet scroll-spy, datasheet deep links and copy buttons. */

/* ---------- Pure helpers (unit-tested) ---------- */

/* Elbow connectors from one point (bottom centre of a product) down to the top centre of each target.
   Each connector gets its own horizontal channel so overlapping runs stay readable. */
function connectorPaths(from, targets) {
  const count = targets.length;
  return targets.map((target, index) => {
    const span = Math.max(0, target.y - from.y);
    const middle = from.y + span * (0.15 + 0.62 * ((index + 1) / (count + 1)));
    const d = `M${round(from.x)} ${round(from.y)}V${round(middle)}H${round(target.x)}V${round(target.y)}`;
    return { d, end: { x: round(target.x), y: round(target.y) }, optional: !!target.optional };
  });
}
function round(value) { return Math.round(value * 10) / 10; }

function selectionSentence(name, required, optional) {
  return `${name} uses ${required.join(', ')}${optional.length ? `; optional: ${optional.join(', ')}` : ''}.`;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { connectorPaths, selectionSentence };

/* ---------- Browser behaviour ---------- */
if (typeof document !== 'undefined') (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* Layered diagram ---------------------------------------------------- */
  const stack = $('#stack-diagram');
  if (stack) {
    const svg = $('.links', stack);
    const caption = $('[data-selection]', stack);
    const products = $$('button.product', stack);
    const techs = $$('.tech[data-tech]', stack);
    const labelOf = id => $(`.tech[data-tech="${id}"] b`, stack)?.textContent || id;
    let pinned = stack.dataset.selected || products[0]?.dataset.product;
    let shown = pinned;

    function draw() {
      const button = products.find(item => item.dataset.product === shown);
      if (!button) return;
      const box = stack.getBoundingClientRect();
      const origin = button.getBoundingClientRect();
      const from = { x: origin.left + origin.width / 2 - box.left, y: origin.bottom - box.top };
      const ids = (button.dataset.uses || '').split(' ').filter(Boolean);
      const optional = (button.dataset.optional || '').split(' ').filter(Boolean);
      const targets = [...ids, ...optional].map(id => {
        const rect = $(`.tech[data-tech="${id}"]`, stack).getBoundingClientRect();
        return { x: rect.left + rect.width / 2 - box.left, y: rect.top - box.top, optional: optional.includes(id) };
      });
      svg.replaceChildren();
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      /* Connectors need every technology on one row; when the grid wraps, the highlight alone carries the meaning. */
      if (new Set(techs.map(tech => Math.round(tech.getBoundingClientRect().top))).size > 1) return;
      connectorPaths(from, targets).forEach(({ d, end, optional: isOptional }) => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('pathLength', '1');
        path.setAttribute('class', isOptional ? 'opt' : 'req');
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y); dot.setAttribute('r', 3.5);
        if (isOptional) dot.setAttribute('class', 'opt');
        svg.append(path, dot);
      });
    }

    function show(id) {
      const button = products.find(item => item.dataset.product === id);
      if (!button) return;
      shown = id;
      const used = (button.dataset.uses || '').split(' ').filter(Boolean);
      const optional = (button.dataset.optional || '').split(' ').filter(Boolean);
      stack.classList.add('has-selection');
      techs.forEach(tech => {
        const key = tech.dataset.tech;
        tech.classList.toggle('is-used', used.includes(key));
        tech.classList.toggle('is-optional', optional.includes(key));
      });
      products.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.product === pinned)));
      const name = $('b', button).textContent;
      caption.textContent = selectionSentence(name, used.map(labelOf), optional.map(labelOf));
      const link = document.createElement('a');
      link.href = `#ds-${id}`;
      link.textContent = 'open datasheet';
      caption.append(link);
      draw();
    }

    products.forEach(button => {
      const id = button.dataset.product;
      button.addEventListener('mouseenter', () => show(id));
      button.addEventListener('focus', () => show(id));
      button.addEventListener('mouseleave', () => show(pinned));
      button.addEventListener('blur', () => show(pinned));
      button.addEventListener('click', () => { pinned = id; show(id); });
    });
    stack.addEventListener('mouseleave', () => show(pinned));
    show(pinned);
    if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(stack);
    else addEventListener('resize', draw, { passive: true });
    document.fonts?.ready.then(draw);

    root.classList.add('bp-anim');
    requestAnimationFrame(() => requestAnimationFrame(() => { stack.classList.add('is-built'); setTimeout(draw, 1100); }));
    if (reduced) { stack.classList.add('is-built'); }
  }

  /* Datasheets: open by hash ---------------------------------------------- */
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target && target.matches('details.ds')) {
      target.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }));
    }
  }
  addEventListener('hashchange', openFromHash);
  openFromHash();

  /* Matrix: highlight the hovered column ---------------------------------------- */
  const matrix = $('#matrix-table');
  if (matrix) {
    const clear = () => $$('.hl', matrix).forEach(cell => cell.classList.remove('hl'));
    matrix.addEventListener('mouseover', event => {
      const cell = event.target.closest('td, th');
      if (!cell || cell.cellIndex === 0) return clear();
      clear();
      $$('tr', matrix).forEach(row => row.cells[cell.cellIndex]?.classList.add('hl'));
    });
    matrix.addEventListener('mouseleave', clear);
  }

  /* Sheet scroll-spy ------------------------------------------------------------------ */
  const sheets = $$('[data-spy]');
  const links = $$('.sheetnav a');
  let frame = 0;
  function spy() {
    frame = 0;
    const probe = $('.sheetbar').offsetHeight + innerHeight * 0.25;
    let current = null;
    sheets.forEach(sheet => { if (sheet.getBoundingClientRect().top <= probe) current = sheet.id; });
    links.forEach(link => {
      const on = link.dataset.spyLink === current;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(spy); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  spy();

  /* Sheet reveal ----------------------------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reduced) {
    root.classList.add('bp-anim');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
    $$('.sheet').forEach(sheet => observer.observe(sheet));
  }

  /* Copy buttons ------------------------------------------------------------------------------ */
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
})();
