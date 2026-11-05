(() => {
  'use strict';

  const section = document.querySelector('#metrics');
  if (!section || !('IntersectionObserver' in window)) return;
  const counters = [...section.querySelectorAll('[data-count-value]')].map(element => {
    const label = element.dataset.countValue;
    return {
      element, label,
      target: Number(label.replace(/[+.]/g, '')),
      prefix: label.startsWith('+') ? '+' : '',
      formatter: new Intl.NumberFormat('de-DE', { useGrouping: label.includes('.') }),
    };
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let controller;
  let frame = 0;
  let elapsed = 0;
  let previous = null;
  let visible = false;
  let connected = false;
  const duration = 1400;

  function paint() {
    counters.forEach((counter, index) => {
      const progress = Math.min(1, Math.max(0, (elapsed - index * duration) / duration));
      counter.element.textContent = progress === 1 ? counter.label
        : counter.prefix + counter.formatter.format(Math.floor(counter.target * (1 - (1 - progress) ** 3)));
    });
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = null;
  }

  function tick(timestamp) {
    frame = 0;
    if (previous !== null) elapsed += timestamp - previous;
    previous = timestamp;
    paint();
    if (elapsed < counters.length * duration) frame = requestAnimationFrame(tick);
  }

  function update() {
    stop();
    if (reduced.matches) {
      counters.forEach(counter => { counter.element.textContent = counter.label; });
    } else if (connected && visible && !document.hidden && elapsed < counters.length * duration) {
      frame = requestAnimationFrame(tick);
    }
  }

  function connect() {
    if (connected) return;
    connected = true;
    controller = new AbortController();
    const { signal } = controller;
    observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === section);
      if (!entry) return;
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.08 });
    observer.observe(section);
    document.addEventListener('visibilitychange', update, { signal });
    reduced.addEventListener('change', update, { signal });
    update();
  }

  connect();
  window.addEventListener('pagehide', () => {
    connected = false;
    stop();
    observer.disconnect();
    controller.abort();
  });
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
})();
