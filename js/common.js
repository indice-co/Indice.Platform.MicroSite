/* Shared behaviour for both pages: the theme, reading progress, back to top, reveals and motion, dialogs, the screen
   galleries and the screen viewer.
   Content stays usable without it; motion is skipped when the visitor prefers reduced motion. */
(() => {
  'use strict';

  const root = document.documentElement;
  // Must match themeKey in scripts/shared.js, which applies the stored theme before first paint.
  const KEY = 'indice-platform-theme';
  const DEFAULT_THEME = root.dataset.defaultTheme === 'dark' ? 'dark' : 'light';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const { signal } = controller;
  const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { signal, ...options });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const motion = () => !reducedMotion.matches;
  const EASE = 'cubic-bezier(.2, .8, .2, 1)';
  let frame = 0;

  /* ---------- Theme: the visitor's stored choice, otherwise the page's default ---------- */
  const stored = () => {
    try { const value = localStorage.getItem(KEY); return value === 'light' || value === 'dark' ? value : null; } catch { return null; }
  };
  const currentTheme = () => root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) { try { localStorage.setItem(KEY, theme); } catch { /* Private modes may block storage. */ } }
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const dark = theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      const label = button.querySelector('[data-theme-label]');
      if (label) label.textContent = dark ? label.dataset.dark || 'Dark' : label.dataset.light || 'Light';
    });
    document.querySelectorAll('[data-theme-set]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeSet === theme));
    });
    const paint = [document.body, root].map(element => element && getComputedStyle(element).backgroundColor)
      .find(colour => colour && colour !== 'transparent' && colour !== 'rgba(0, 0, 0, 0)');
    if (paint) document.querySelectorAll('meta[name="theme-color"]').forEach(tag => tag.setAttribute('content', paint));
  }
  // The new theme grows as a circle from the control that changed it.
  function switchTheme(theme, origin) {
    if (theme === currentTheme()) return;
    if (!document.startViewTransition || !motion() || !origin) { applyTheme(theme, true); return; }
    const box = origin.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-transition');
    const transition = document.startViewTransition(() => applyTheme(theme, true));
    transition.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    const done = () => root.classList.remove('theme-transition');
    transition.finished.then(done, done);
  }
  on(document, 'click', event => {
    const toggle = event.target.closest('[data-theme-toggle]');
    const set = event.target.closest('[data-theme-set]');
    if (toggle) switchTheme(currentTheme() === 'dark' ? 'light' : 'dark', toggle);
    else if (set) switchTheme(set.dataset.themeSet, set);
  });
  on(window, 'storage', event => {
    if (event.key === KEY) applyTheme(event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : DEFAULT_THEME, false);
  });
  applyTheme(stored() || DEFAULT_THEME, false);

  /* ---------- Scroll-linked chrome: progress, back to top, parallax ---------- */
  const progress = document.querySelector('[data-progress]');
  const toTop = [...document.querySelectorAll('[data-to-top]')];
  // data-parallax="speed": positive values lag behind the page, negative values move ahead of it.
  const parallax = [...document.querySelectorAll('[data-parallax]')]
    .map(element => ({ element, speed: Number.parseFloat(element.dataset.parallax) || 0.15 }));
  // data-scrub: --scrub runs from 0 (element enters at the bottom) to 1 (element leaves at the top).
  const scrubs = [...document.querySelectorAll('[data-scrub]')];
  function update() {
    frame = 0;
    const y = scrollY;
    root.classList.toggle('is-scrolled', y > 8);
    const max = root.scrollHeight - innerHeight;
    const fraction = max > 0 ? clamp(y / max, 0, 1) : 0;
    if (progress) progress.style.setProperty('--progress', fraction.toFixed(4));
    toTop.forEach(link => link.style.setProperty('--progress', fraction.toFixed(4)));
    root.classList.toggle('show-to-top', y > innerHeight * 0.9);
    if (!motion()) return;
    parallax.forEach(({ element, speed }) => {
      const box = (element.parentElement || element).getBoundingClientRect();
      if (box.bottom < -innerHeight || box.top > innerHeight * 2) return;
      element.style.setProperty('--parallax', `${((box.top + box.height / 2 - innerHeight / 2) * -speed).toFixed(1)}px`);
    });
    scrubs.forEach(element => {
      const box = element.getBoundingClientRect();
      element.style.setProperty('--scrub', clamp((innerHeight - box.top) / (innerHeight + box.height), 0, 1).toFixed(4));
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  on(window, 'scroll', schedule, { passive: true });
  on(window, 'resize', schedule, { passive: true });
  on(reducedMotion, 'change', () => {
    parallax.forEach(({ element }) => element.style.removeProperty('--parallax'));
    scrubs.forEach(element => element.style.removeProperty('--scrub'));
    schedule();
  });
  update();

  /* Back to top: scrolls home and moves focus to the top of the page, without leaving a hash behind. */
  on(document, 'click', event => {
    const link = event.target.closest('[data-to-top]');
    if (!link) return;
    event.preventDefault();
    const target = document.getElementById(link.hash.slice(1)) || document.body;
    scrollTo({ top: 0, behavior: motion() ? 'smooth' : 'instant' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  });

  /* Marquees marked data-velocity speed up with scrolling and run backwards while the page scrolls up. */
  const marquees = [...document.querySelectorAll('[data-velocity]')];
  if (marquees.length && 'getAnimations' in Element.prototype) {
    let lastY = scrollY;
    let push = 0;
    let rate = 1;
    let velocityFrame = 0;
    const tick = () => {
      velocityFrame = 0;
      push *= 0.86;
      rate += (1 + clamp(push * 0.1, -5, 5) - rate) * 0.14;
      marquees.forEach(element => element.getAnimations().forEach(animation => { animation.playbackRate = rate; }));
      if (Math.abs(rate - 1) > 0.01 || Math.abs(push) > 0.1) velocityFrame = requestAnimationFrame(tick);
      else marquees.forEach(element => element.getAnimations().forEach(animation => { animation.playbackRate = 1; }));
    };
    on(window, 'scroll', () => {
      const y = scrollY;
      push += y - lastY;
      lastY = y;
      if (motion() && !velocityFrame) velocityFrame = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---------- Reveals, started when they scroll into view ---------- */
  let observer = null;
  function prepareReveals() {
    observer?.disconnect();
    root.classList.remove('reveal-ready');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(element => observer.observe(element));
    root.classList.add('reveal-ready');
  }
  on(reducedMotion, 'change', prepareReveals);
  prepareReveals();

  /* ---------- Dialogs (modal overlays with native focus handling) ---------- */
  // Capture phase: a link inside an open modal dialog closes it before any other handler runs. Closing returns focus
  // to the opener, which can scroll the page, so in-page links are followed here within the same frame.
  on(document, 'click', event => {
    const dialog = event.target.closest('dialog[open]');
    const link = dialog && event.target.closest('a[href^="#"]');
    if (!link) return;
    dialog.close();
    root.classList.remove('dialog-open');
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex') && !target.matches('a, button, summary, input, select, textarea')) target.setAttribute('tabindex', '-1');
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    target.focus({ preventScroll: true });
    if (location.hash !== link.hash) location.hash = link.hash;
  }, { capture: true });
  on(document, 'click', event => {
    const opener = event.target.closest('[data-dialog-open]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.dialogOpen);
      if (dialog?.showModal) {
        event.preventDefault();
        dialog.showModal();
        root.classList.add('dialog-open');
      }
      return;
    }
    const dialog = event.target.closest('dialog[open]');
    if (dialog && (event.target === dialog || event.target.closest('[data-dialog-close]'))) dialog.close();
  });
  document.querySelectorAll('dialog').forEach(dialog => on(dialog, 'close', () => root.classList.remove('dialog-open')));

  /* ---------- Screen viewer: enlarges a screen from a gallery and pages through its group ---------- */
  const viewer = document.querySelector('[data-lightbox]');
  if (viewer?.showModal) {
    const figure = viewer.querySelector('[data-lightbox-figure]');
    const caption = viewer.querySelector('[data-lightbox-caption]');
    const counter = viewer.querySelector('[data-lightbox-count]');
    const steps = [...viewer.querySelectorAll('[data-lightbox-step]')];
    let group = [];
    let index = 0;
    const render = direction => {
      const shot = group[index];
      const media = shot.querySelector('.shot-media').cloneNode(true);
      media.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      figure.replaceChildren(media);
      const title = document.createElement('b');
      title.textContent = shot.dataset.title || '';
      const text = document.createElement('span');
      text.textContent = shot.dataset.text || '';
      caption.replaceChildren(title, text);
      counter.textContent = `${index + 1} / ${group.length}`;
      steps.forEach(button => { button.hidden = group.length < 2; });
      if (direction && motion()) {
        figure.animate([{ opacity: 0, transform: `translateX(${direction * 56}px) scale(.98)` }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: EASE });
      }
    };
    const move = delta => {
      if (group.length < 2) return;
      index = (index + delta + group.length) % group.length;
      render(delta);
    };
    on(document, 'click', event => {
      const shot = event.target.closest('[data-shot-open]')?.closest('[data-shot]');
      if (!shot) return;
      event.preventDefault();
      group = [...(shot.closest('[data-shot-group]') || document).querySelectorAll('[data-shot]')];
      index = Math.max(0, group.indexOf(shot));
      render(0);
      viewer.showModal();
      root.classList.add('dialog-open');
      if (!motion()) return;
      // Grow the enlarged screen out of the thumbnail that was selected.
      const from = shot.querySelector('.shot-media').getBoundingClientRect();
      const to = figure.getBoundingClientRect();
      if (from.width && to.width) {
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        figure.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`, opacity: 0.4 }, { transform: 'none', opacity: 1 }],
          { duration: 560, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      }
      caption.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 180, easing: EASE, fill: 'backwards' });
    });
    on(viewer, 'click', event => {
      const step = event.target.closest('[data-lightbox-step]');
      if (step) move(Number(step.dataset.lightboxStep));
      else if (event.target.matches('.lightbox-inner, .lightbox-stage')) viewer.close();
    });
    on(viewer, 'keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    });
    let swipeX = null;
    on(viewer, 'pointerdown', event => { swipeX = event.pointerType === 'mouse' ? null : event.clientX; });
    on(viewer, 'pointerup', event => {
      if (swipeX === null) return;
      const distance = event.clientX - swipeX;
      swipeX = null;
      if (Math.abs(distance) > 48) move(distance < 0 ? 1 : -1);
    });
    on(viewer, 'close', () => figure.replaceChildren());
  }

  /* ---------- Screen galleries: pointing near either edge scrolls that way; arrow buttons page through ---------- */
  document.querySelectorAll('[data-hover-scroll]').forEach(scroller => {
    const host = scroller.closest('[data-gallery]') || scroller.parentElement;
    const buttons = [...host.querySelectorAll('[data-scroll-step]')];
    let speed = 0;
    let scrollFrame = 0;
    const sync = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      buttons.forEach(button => {
        button.disabled = Number(button.dataset.scrollStep) < 0 ? scroller.scrollLeft <= 2 : scroller.scrollLeft >= max - 2;
      });
      host.style.setProperty('--gallery-progress', max > 2 ? (scroller.scrollLeft / max).toFixed(4) : '1');
      host.classList.toggle('is-scrollable', max > 2);
    };
    const glide = () => {
      scrollFrame = 0;
      if (!speed) return;
      scroller.scrollLeft += speed;
      scrollFrame = requestAnimationFrame(glide);
    };
    const stop = () => {
      speed = 0;
      host.classList.remove('is-gliding', 'is-gliding-left', 'is-gliding-right');
    };
    on(scroller, 'pointermove', event => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || !motion()) return;
      const box = scroller.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const edge = 0.3;
      const t = x < edge ? -(edge - x) / edge : x > 1 - edge ? (x - (1 - edge)) / edge : 0;
      speed = t ? Math.sign(t) * (2 + 20 * t * t) : 0;
      host.classList.toggle('is-gliding', speed !== 0);
      host.classList.toggle('is-gliding-left', speed < 0);
      host.classList.toggle('is-gliding-right', speed > 0);
      if (speed && !scrollFrame) scrollFrame = requestAnimationFrame(glide);
    }, { passive: true });
    on(scroller, 'pointerleave', stop);
    on(scroller, 'pointerdown', stop);
    on(scroller, 'scroll', sync, { passive: true });
    on(window, 'resize', sync, { passive: true });
    buttons.forEach(button => on(button, 'click', () => {
      const direction = Number(button.dataset.scrollStep);
      const left = scroller.scrollLeft;
      const base = scroller.getBoundingClientRect().left;
      const starts = [...scroller.children].map(item => item.getBoundingClientRect().left - base + left);
      // Page to the first item past most of the visible width, or back by about one view.
      const next = direction > 0
        ? starts.find(start => start > left + scroller.clientWidth * 0.6)
        : starts.filter(start => start < left - scroller.clientWidth * 0.4).pop();
      const inset = Number.parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
      const destination = next === undefined ? (direction > 0 ? scroller.scrollWidth : 0) : next - inset;
      scroller.scrollTo({ left: destination, behavior: motion() ? 'smooth' : 'instant' });
    }));
    sync();
  });

  /* ---------- Details groups: <details> stay native; open the one a link points to, or the one containing it ---------- */
  function openDetailsFor(id) {
    const target = id ? document.getElementById(id) : null;
    const details = target?.closest('details');
    if (details) details.open = true;
  }
  on(window, 'hashchange', () => openDetailsFor(decodeURIComponent(location.hash.slice(1))));
  // A repeated click on the same link does not change the hash, so open on click as well.
  on(document, 'click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) openDetailsFor(decodeURIComponent(link.hash.slice(1)));
  });
  openDetailsFor(decodeURIComponent(location.hash.slice(1)));

  /* Demo buttons ([data-demo]) are intentionally unwired until the demo request flow is decided. */
})();
