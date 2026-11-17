/* Proposal B: pointer repulsion for Plate I, after the hero diagram of the original page (js/hero-art.js).
   Every [data-repel] element inside a [data-repel-area] moves away from the pointer on its own, by up to
   data-repel pixels, more strongly the closer it is. No tilt and no perspective: only flat translations. */
(() => {
  'use strict';

  const areas = [...document.querySelectorAll('[data-repel-area]')];
  if (!areas.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');

  for (const area of areas) {
    const targets = [...area.querySelectorAll('[data-repel]')].map(element => ({
      element, limit: Number.parseFloat(element.dataset.repel) || 8, x: 0, y: 0
    }));
    let position = null;
    let frame = 0;

    const set = (target, x, y) => {
      target.x = x;
      target.y = y;
      target.element.style.setProperty('--repel-x', `${x.toFixed(2)}px`);
      target.element.style.setProperty('--repel-y', `${y.toFixed(2)}px`);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      position = null;
      targets.forEach(target => set(target, 0, 0));
    };

    function render() {
      frame = 0;
      if (!position) return;
      const box = area.getBoundingClientRect();
      const radius = Math.max(box.width, box.height) * .6;
      for (const target of targets) {
        const parent = target.element.parentNode;
        const toLocal = parent.getScreenCTM?.()?.inverse();
        const toScreen = parent.getScreenCTM?.();
        if (!toLocal || !toScreen) continue;
        // The element's centre without its current offset, so the push never feeds back on itself.
        const rect = target.element.getBoundingClientRect();
        const offsetX = toScreen.a * target.x + toScreen.c * target.y;
        const offsetY = toScreen.b * target.x + toScreen.d * target.y;
        const dx = rect.left + rect.width / 2 - offsetX - position.x;
        const dy = rect.top + rect.height / 2 - offsetY - position.y;
        const distance = Math.hypot(dx, dy);
        const force = target.limit * Math.max(0, 1 - distance / radius) ** 1.5;
        const sx = (distance ? dx / distance : 0) * force;
        const sy = (distance ? dy / distance : -1) * force;
        // Screen pixels to the element's own coordinates, which turn with the orbit and scale with the plate.
        set(target, toLocal.a * sx + toLocal.c * sy, toLocal.b * sx + toLocal.d * sy);
      }
    }

    area.addEventListener('pointermove', event => {
      if (!pointer.matches || reduced.matches || event.pointerType === 'touch') { reset(); return; }
      position = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(render);
    }, { passive: true });
    area.addEventListener('pointerleave', reset);
    area.addEventListener('pointercancel', reset);
    addEventListener('blur', reset);
    addEventListener('scroll', () => { if (position) frame ||= requestAnimationFrame(render); }, { passive: true });
    reduced.addEventListener('change', reset);
  }
})();
