/* CSS drives the loops; pointer updates only schedule frames when input changes. */
(() => {
  'use strict';
  const art = document.querySelector('.cases-hero-visual');
  if (!art) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let controller;
  let observer;
  let connected = false;
  let visible = false;
  let frame = 0;
  let position;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    art.style.setProperty('--art-x', '0px');
    art.style.setProperty('--art-y', '0px');
  }
  function update() {
    const running = connected && visible && !document.hidden && !reduced.matches;
    art.classList.toggle('is-animating', running);
    if (!running || !pointer.matches) reset();
  }
  function measure() {
    const bounds = art.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < innerHeight;
    update();
  }
  function render() {
    frame = 0;
    const bounds = art.getBoundingClientRect();
    art.style.setProperty('--art-x', `${Math.max(-8, Math.min(8, (position.x - bounds.left) / bounds.width * 16 - 8))}px`);
    art.style.setProperty('--art-y', `${Math.max(-6, Math.min(6, (position.y - bounds.top) / bounds.height * 12 - 6))}px`);
  }
  function connect() {
    if (connected) return;
    connected = true;
    controller = new AbortController();
    const { signal } = controller;
    art.addEventListener('pointermove', event => {
      if (!pointer.matches || reduced.matches || event.pointerType === 'touch' || !art.classList.contains('is-animating')) return;
      position = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(render);
    }, { passive: true, signal });
    for (const event of ['pointerleave', 'pointercancel']) art.addEventListener(event, reset, { signal });
    window.addEventListener('blur', reset, { signal });
    window.addEventListener('scroll', () => { reset(); measure(); }, { passive: true, signal });
    window.addEventListener('resize', measure, { passive: true, signal });
    document.addEventListener('visibilitychange', update, { signal });
    reduced.addEventListener('change', update, { signal });
    pointer.addEventListener('change', update, { signal });
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(measure);
      observer.observe(art);
    }
    measure();
  }
  function disconnect() {
    connected = false;
    controller?.abort();
    observer?.disconnect();
    update();
    reset();
  }
  window.addEventListener('pagehide', disconnect);
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
  connect();
})();
