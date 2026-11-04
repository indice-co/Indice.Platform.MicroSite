/* Decorative float is CSS-driven; pointer work only runs when new input arrives. */
(() => {
  'use strict';

  const art = document.querySelector('.foundation-art');
  const pieces = [...(art?.querySelectorAll('[data-art-piece]') || [])];
  const toggle = art?.querySelector('[data-art-toggle]');
  if (!art || !pieces.length || !toggle) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let controller;
  let visibilityObserver;
  let resizeObserver;
  let frame = 0;
  let pointerPosition = null;
  let centers = [];
  let visible = false;
  let paused = false;
  let connected = false;

  function resetRepulsion() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointerPosition = null;
    pieces.forEach(piece => {
      piece.style.setProperty('--repel-x', '0px');
      piece.style.setProperty('--repel-y', '0px');
    });
  }

  function withinViewport() {
    const bounds = art.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
  }

  function updateMotion() {
    const running = connected && visible && !paused && !reduced.matches && !document.hidden;
    art.classList.toggle('is-animating', running);
    if (!running || !pointer.matches) resetRepulsion();
  }

  function measure() {
    centers = pieces.map(piece => ({
      x: piece.offsetLeft + piece.offsetWidth / 2,
      y: piece.offsetTop + piece.offsetHeight / 2,
    }));
  }

  function renderPointer() {
    frame = 0;
    if (!pointerPosition || !art.classList.contains('is-animating') || !pointer.matches) return;
    const bounds = art.getBoundingClientRect();
    const x = pointerPosition.x - bounds.left;
    const y = pointerPosition.y - bounds.top;
    const radius = Math.max(bounds.width, bounds.height) * 0.78;
    pieces.forEach((piece, index) => {
      const center = centers[index];
      let dx = center.x - x;
      let dy = center.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.01) {
        const angle = index * 2.4 - Math.PI / 2;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
      } else {
        dx /= distance;
        dy /= distance;
      }
      const proximity = Math.max(0, 1 - distance / radius);
      const limit = piece.classList.contains('art-coordinate') ? Math.min(9, bounds.width * 0.025)
        : piece.classList.contains('foundation-slash') ? Math.min(55, bounds.width * 0.12)
        : Math.min(42 - (index % 3) * 4, bounds.width * 0.09);
      const force = limit * proximity ** 1.5;
      piece.style.setProperty('--repel-x', `${(dx * force).toFixed(2)}px`);
      piece.style.setProperty('--repel-y', `${(dy * force).toFixed(2)}px`);
    });
  }

  function onPointerMove(event) {
    if (event.pointerType === 'touch' || !pointer.matches || !art.classList.contains('is-animating') ||
      event.target.closest('[data-art-toggle]')) {
      resetRepulsion();
      return;
    }
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(renderPointer);
  }

  function onLayoutChange() {
    resetRepulsion();
    measure();
    visible = withinViewport();
    updateMotion();
  }

  function onScroll() {
    resetRepulsion();
    if (!visibilityObserver) {
      visible = withinViewport();
      updateMotion();
    }
  }

  function onPause() {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume artwork animation' : 'Pause artwork animation');
    resetRepulsion();
    updateMotion();
  }

  function connect() {
    if (connected) return;
    connected = true;
    controller = new AbortController();
    const { signal } = controller;
    art.classList.add('art-ready');
    art.addEventListener('pointermove', onPointerMove, { passive: true, signal });
    art.addEventListener('pointerleave', resetRepulsion, { signal });
    art.addEventListener('pointercancel', resetRepulsion, { signal });
    toggle.addEventListener('click', onPause, { signal });
    window.addEventListener('scroll', onScroll, { passive: true, signal });
    window.addEventListener('resize', onLayoutChange, { passive: true, signal });
    window.addEventListener('blur', resetRepulsion, { signal });
    document.addEventListener('visibilitychange', updateMotion, { signal });
    reduced.addEventListener('change', updateMotion, { signal });
    pointer.addEventListener('change', updateMotion, { signal });
    measure();
    visible = withinViewport();

    if ('IntersectionObserver' in window) {
      try {
        visibilityObserver = new IntersectionObserver(entries => {
          visible = entries.some(entry => entry.target === art && entry.isIntersecting);
          updateMotion();
        });
        visibilityObserver.observe(art);
      } catch { visibilityObserver = null; }
    }
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(onLayoutChange);
      resizeObserver.observe(art);
    }
    updateMotion();
  }

  function disconnect() {
    connected = false;
    controller?.abort();
    visibilityObserver?.disconnect();
    resizeObserver?.disconnect();
    visibilityObserver = null;
    resizeObserver = null;
    resetRepulsion();
    art.classList.remove('is-animating');
    art.classList.remove('art-ready');
  }

  connect();
  window.addEventListener('pagehide', disconnect);
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
})();
