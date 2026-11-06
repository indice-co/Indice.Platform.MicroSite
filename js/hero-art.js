/* CSS owns arrival and color; pointer repulsion starts only after both slashes land. */
(() => {
  'use strict';

  const originalHero = document.querySelector('.hero');
  let art;
  if (originalHero?.cloneNode) {
    const duplicateHero = originalHero.cloneNode(true);
    originalHero.hidden = true;
    originalHero.style.display = 'none';
    originalHero.id = 'hero-original';
    originalHero.setAttribute('aria-labelledby', 'hero-title-original');
    originalHero.querySelector('h1')?.setAttribute('id', 'hero-title-original');
    originalHero.before(duplicateHero);
    art = duplicateHero.querySelector('.hero-art');
  } else {
    art = document.querySelector('.hero-art');
  }
  if (!art) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const shapes = [...art.querySelectorAll('.hero-slash-shape')];
  const landed = new Set();
  let frame = 0;
  let position = null;
  let controller;
  let observer;
  let visible = false;
  let connected = false;

  function resetPointer() {
    cancelAnimationFrame(frame);
    frame = 0;
    position = null;
    shapes.forEach(shape => {
      shape.style.setProperty('--repel-x', '0px');
      shape.style.setProperty('--repel-y', '0px');
    });
  }

  function renderPointer() {
    frame = 0;
    if (!position) return;
    shapes.forEach(shape => {
      const box = shape.getBBox();
      const matrix = shape.parentElement.getScreenCTM();
      const center = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2).matrixTransform(matrix);
      const dx = center.x - position.x;
      const dy = center.y - position.y;
      const distance = Math.hypot(dx, dy);
      const radius = Math.max(art.clientWidth, art.clientHeight) * .78;
      const force = Math.min(42, art.clientWidth * .09) * Math.max(0, 1 - distance / radius) ** 1.5;
      const scale = Math.hypot(matrix.a, matrix.b);
      shape.style.setProperty('--repel-x', `${(distance ? dx / distance : 0) * force / scale}px`);
      shape.style.setProperty('--repel-y', `${(distance ? dy / distance : -1) * force / scale}px`);
    });
  }

  function onPointerMove(event) {
    if (landed.size !== shapes.length || !pointer.matches || event.pointerType === 'touch' ||
      !art.classList.contains('is-animating')) {
      resetPointer();
      return;
    }
    position = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(renderPointer);
  }

  function update() {
    art.classList.toggle('is-animating', connected && visible && !reduced.matches && !document.hidden);
    if (!art.classList.contains('is-animating') || !pointer.matches) resetPointer();
  }

  function measure() {
    resetPointer();
    const bounds = art.getBoundingClientRect();
    visible = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
    update();
  }

  function connect() {
    if (connected) return;
    connected = true;
    controller = new AbortController();
    const { signal } = controller;
    art.classList.add('art-ready');
    art.addEventListener('animationend', event => {
      if (event.animationName === 'hero-slash-arrive') landed.add(event.target);
    }, { signal });
    art.addEventListener('pointermove', onPointerMove, { passive: true, signal });
    art.addEventListener('pointerleave', resetPointer, { signal });
    art.addEventListener('pointercancel', resetPointer, { signal });
    window.addEventListener('blur', resetPointer, { signal });
    window.addEventListener('scroll', resetPointer, { passive: true, signal });
    pointer.addEventListener('change', update, { signal });
    document.addEventListener('visibilitychange', update, { signal });
    reduced.addEventListener('change', update, { signal });
    window.addEventListener('resize', measure, { passive: true, signal });
    measure();

    if ('IntersectionObserver' in window) {
      try {
        observer = new IntersectionObserver(entries => {
          const entry = entries.find(item => item.target === art);
          if (entry) visible = entry.isIntersecting;
          update();
        });
        observer.observe(art);
      } catch { observer = null; }
    }
    if (!observer) window.addEventListener('scroll', measure, { passive: true, signal });
  }

  function disconnect() {
    connected = false;
    controller?.abort();
    observer?.disconnect();
    observer = null;
    landed.clear();
    resetPointer();
    art.classList.remove('is-animating');
    art.classList.remove('art-ready');
  }

  connect();
  window.addEventListener('pagehide', disconnect);
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
})();
