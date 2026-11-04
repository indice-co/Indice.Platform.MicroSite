/* CSS owns the one-time arrival and color loop; this controller only pauses playback. */
(() => {
  'use strict';

  const art = document.querySelector('.hero-art');
  const toggle = art?.querySelector('[data-hero-art-toggle]');
  if (!art || !toggle) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let controller;
  let observer;
  let visible = false;
  let paused = false;
  let connected = false;

  function update() {
    art.classList.toggle('is-animating', connected && visible && !paused && !reduced.matches && !document.hidden);
  }

  function measure() {
    const bounds = art.getBoundingClientRect();
    visible = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
    update();
  }

  function onPause() {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume hero artwork animation' : 'Pause hero artwork animation');
    update();
  }

  function connect() {
    if (connected) return;
    connected = true;
    controller = new AbortController();
    const { signal } = controller;
    art.classList.add('art-ready');
    toggle.addEventListener('click', onPause, { signal });
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
    art.classList.remove('is-animating');
    art.classList.remove('art-ready');
  }

  connect();
  window.addEventListener('pagehide', disconnect);
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
})();
