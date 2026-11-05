/* Pause the closing sequence offscreen and in hidden tabs without resetting it. */
(() => {
  'use strict';

  const section = document.querySelector('#contact');
  if (!section) return;
  const heading = section.querySelector('#contact-title');
  if (!heading) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let controller;
  let observer;
  let connected = false;
  let visible = false;
  let started = false;

  function update() {
    section.classList.toggle('contact-playing', connected && started && visible && !document.hidden && !reduced.matches);
  }

  function measure() {
    const bounds = section.getBoundingClientRect();
    visible = bounds.top < innerHeight - 24 && bounds.bottom > 0;
    const titleBounds = heading.getBoundingClientRect();
    // Wait until all three lines are in view, not just the section's top edge.
    if (titleBounds.top >= 0 && titleBounds.bottom <= innerHeight - 24 ||
        titleBounds.height > innerHeight - 48 && titleBounds.top <= 24 && titleBounds.bottom > 24) started = true;
    update();
  }

  function connect() {
    if (connected) return;
    connected = true;
    controller = new AbortController();
    const { signal } = controller;
    section.classList.add('contact-ready');
    measure();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(measure, { threshold: [0, 1], rootMargin: '0px 0px -24px 0px' });
      observer.observe(section);
      observer.observe(heading);
    } else {
      window.addEventListener('scroll', measure, { passive: true, signal });
    }
    window.addEventListener('resize', measure, { passive: true, signal });
    document.addEventListener('visibilitychange', update, { signal });
    reduced.addEventListener('change', update, { signal });
  }

  function disconnect() {
    connected = false;
    controller?.abort();
    observer?.disconnect();
    update();
  }

  window.addEventListener('pagehide', disconnect);
  window.addEventListener('pageshow', event => {
    if (event.persisted) connect();
  });
  connect();
})();
