'use strict';

/* Adds previous/next buttons, position markers and arrow-key support to the scroll-snap screenshot strips. */
const nearestIndex = (offsets, scrollLeft, maxScroll) => {
  if (!offsets.length) return 0;
  if (maxScroll > 0 && scrollLeft >= maxScroll - 1) return offsets.length - 1;
  let best = 0;
  offsets.forEach((offset, index) => { if (Math.abs(offset - scrollLeft) < Math.abs(offsets[best] - scrollLeft)) best = index; });
  return best;
};
const clampIndex = (index, count) => Math.min(Math.max(index, 0), Math.max(count - 1, 0));

if (typeof module !== 'undefined' && module.exports) module.exports = { nearestIndex, clampIndex };

if (typeof document !== 'undefined') document.querySelectorAll('[data-carousel]').forEach(root => {
  const track = root.querySelector('.shots-track');
  const slides = [...track.children];
  if (slides.length < 2) return;
  let current = 0;

  const button = (label, text) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.setAttribute('aria-label', label);
    element.textContent = text;
    return element;
  };
  const controls = document.createElement('div');
  controls.className = 'shots-controls';
  const previous = button('Previous screenshot', '\u2190');
  const next = button('Next screenshot', '\u2192');
  const dots = document.createElement('div');
  dots.className = 'shots-dots';
  const dotButtons = slides.map((slide, index) => {
    const dot = button(`Show screenshot ${index + 1} of ${slides.length}`, '');
    dot.addEventListener('click', () => show(index));
    dots.append(dot);
    return dot;
  });
  const count = document.createElement('span');
  count.className = 'shots-count';
  count.setAttribute('aria-live', 'polite');
  controls.append(previous, dots, count, next);
  root.append(controls);

  function render(index) {
    current = index;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    dotButtons.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index)));
    count.textContent = `${index + 1} / ${slides.length}`;
  }
  function show(index) {
    const target = clampIndex(index, slides.length);
    track.scrollTo({ left: slides[target].offsetLeft - track.offsetLeft, behavior: 'auto' });
    render(target);
  }

  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!track.clientWidth) return;
      const index = nearestIndex(slides.map(slide => slide.offsetLeft - track.offsetLeft), track.scrollLeft, track.scrollWidth - track.clientWidth);
      if (index !== current) render(index);
    });
  }, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  render(0);
});
