/* Shared behaviour for the homepage proposals: per-proposal themes, page chrome around Proposal A's pinned Solutions
   slider, reveals and motion, menus, dialogs, tabs, screen galleries, the screen viewer and expanders.
   Content stays usable without it; motion is skipped when the visitor prefers reduced motion. */
(() => {
  'use strict';

  const root = document.documentElement;
  const KEY = `indice-proposal-${root.dataset.proposal || 'default'}-theme`;
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

  /* ---------- Theme: each proposal remembers its own choice and otherwise uses its default ---------- */
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

  /* ---------- Scroll-linked chrome: pinned slider, progress, back to top, section highlighting, parallax ---------- */
  const showcase = document.getElementById('product-showcase');
  const progress = document.querySelector('[data-progress]');
  const toTop = [...document.querySelectorAll('[data-to-top]')];
  const spyLinks = [...document.querySelectorAll('[data-spy]')];
  const spySections = spyLinks.map(link => document.getElementById(link.dataset.spy));
  // data-parallax="speed": positive values lag behind the page, negative values move ahead of it.
  const parallax = [...document.querySelectorAll('[data-parallax]')]
    .map(element => ({ element, speed: Number.parseFloat(element.dataset.parallax) || 0.15 }));
  // data-scrub: --scrub runs from 0 (element enters at the bottom) to 1 (element leaves at the top).
  const scrubs = [...document.querySelectorAll('[data-scrub]')];
  function update() {
    frame = 0;
    const y = scrollY;
    root.classList.toggle('is-scrolled', y > 8);
    let pinned = false;
    if (showcase) {
      const bounds = showcase.getBoundingClientRect();
      // Enhanced: the stage fills the viewport. Stacked (mobile, reduced motion): its product navigation sticks to the top.
      pinned = showcase.classList.contains('story-enhanced')
        ? bounds.top <= 1 && bounds.bottom >= innerHeight - 1
        : showcase.classList.contains('story-products') && bounds.top <= 0 && bounds.bottom > 0;
      root.classList.toggle('is-story-pinned', pinned);
    }
    const max = root.scrollHeight - innerHeight;
    const fraction = max > 0 ? clamp(y / max, 0, 1) : 0;
    if (progress) progress.style.setProperty('--progress', fraction.toFixed(4));
    toTop.forEach(link => link.style.setProperty('--progress', fraction.toFixed(4)));
    root.classList.toggle('show-to-top', y > innerHeight * 0.9 && !pinned);
    if (spyLinks.length) {
      const probe = innerHeight * 0.35;
      let active = -1;
      spySections.forEach((section, index) => {
        if (!section) return;
        const box = section.getBoundingClientRect();
        if (box.top <= probe && box.bottom > probe) active = index;
      });
      spyLinks.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
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

  /* On narrow screens the design ribbon scrolls sideways; bring this proposal's button into view without moving the page. */
  const ribbonList = document.querySelector('.design-ribbon ul');
  const ribbonCurrent = ribbonList?.querySelector('a[aria-current="page"]');
  if (ribbonCurrent && ribbonList.scrollWidth > ribbonList.clientWidth) {
    ribbonList.scrollLeft = ribbonCurrent.parentElement.offsetLeft - ribbonList.offsetLeft - 12;
  }

  /* ---------- Reveals, counters and scrambled labels, started when they scroll into view ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>+#';
  function scramble(element) {
    if (!motion() || element.dataset.scrambling) return;
    const text = element.dataset.scrambleText || element.textContent;
    element.dataset.scrambleText = text;
    element.dataset.scrambling = 'true';
    const start = performance.now();
    const duration = Math.min(900, 300 + text.length * 28);
    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(text.length * t);
      let output = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) output += /\s/.test(text[i]) ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      element.textContent = output;
      if (t < 1) requestAnimationFrame(step);
      else { element.textContent = text; delete element.dataset.scrambling; }
    };
    requestAnimationFrame(step);
  }
  function countUp(element) {
    const target = Number(element.dataset.count);
    if (!motion() || !Number.isFinite(target)) return;
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / 1400);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // data-scramble="hover": the label scrambles when the pointer enters it or the link or button around it.
  on(document, 'pointerover', event => {
    const host = event.target.closest('a, button, [data-scramble="hover"]');
    const label = host?.matches('[data-scramble="hover"]') ? host : host?.querySelector('[data-scramble="hover"]');
    if (label && !host.contains(event.relatedTarget)) scramble(label);
  });

  let observer = null;
  let onceObserver = null;
  function prepareReveals() {
    observer?.disconnect();
    onceObserver?.disconnect();
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
    onceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.matches('[data-count]')) countUp(entry.target);
        if (entry.target.matches('[data-scramble]')) scramble(entry.target);
        onceObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count], [data-scramble]').forEach(element => onceObserver.observe(element));
    root.classList.add('reveal-ready');
  }
  on(reducedMotion, 'change', prepareReveals);
  prepareReveals();

  /* ---------- Pointer effects (mouse only): spotlight, magnetic buttons, tilting cards ---------- */
  let magnet = null;
  let tilted = null;
  const magnetOffset = new WeakMap();
  const release = element => {
    if (!element) return;
    element.style.removeProperty('--magnet-x');
    element.style.removeProperty('--magnet-y');
    magnetOffset.delete(element);
  };
  const untilt = element => {
    if (!element) return;
    element.style.removeProperty('--rx');
    element.style.removeProperty('--ry');
    element.classList.remove('is-tilting');
  };
  on(document, 'pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) return;
    const spot = event.target.closest('[data-spotlight]');
    if (spot) {
      const box = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${(event.clientX - box.left).toFixed(0)}px`);
      spot.style.setProperty('--my', `${(event.clientY - box.top).toFixed(0)}px`);
    }
    if (!motion()) return;
    const nextMagnet = event.target.closest('[data-magnetic]');
    if (nextMagnet !== magnet) { release(magnet); magnet = nextMagnet; }
    if (magnet) {
      // Measure without the current pull so the element does not chase the pointer.
      const box = magnet.getBoundingClientRect();
      const [ox, oy] = magnetOffset.get(magnet) || [0, 0];
      const strength = Number.parseFloat(magnet.dataset.magnetic) || 0.3;
      const x = clamp((event.clientX - (box.left - ox + box.width / 2)) * strength, -14, 14);
      const yOffset = clamp((event.clientY - (box.top - oy + box.height / 2)) * strength, -10, 10);
      magnetOffset.set(magnet, [x, yOffset]);
      magnet.style.setProperty('--magnet-x', `${x.toFixed(1)}px`);
      magnet.style.setProperty('--magnet-y', `${yOffset.toFixed(1)}px`);
    }
    const nextTilt = event.target.closest('[data-tilt]');
    if (nextTilt !== tilted) { untilt(tilted); tilted = nextTilt; }
    if (tilted) {
      const box = tilted.getBoundingClientRect();
      const max = Number.parseFloat(tilted.dataset.tilt) || 5;
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      tilted.classList.add('is-tilting');
      tilted.style.setProperty('--ry', `${(px * max * 2).toFixed(2)}deg`);
      tilted.style.setProperty('--rx', `${(-py * max * 2).toFixed(2)}deg`);
    }
  }, { passive: true });
  on(document, 'pointerout', event => {
    if (event.relatedTarget) return;
    release(magnet); magnet = null;
    untilt(tilted); tilted = null;
  });

  /* A trailing ring that follows the mouse (data-cursor) and grows over controls. The system cursor stays visible. */
  const cursor = document.querySelector('[data-cursor]');
  if (cursor) {
    let x = 0; let y = 0; let cx = 0; let cy = 0; let cursorFrame = 0;
    const follow = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      cursorFrame = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(follow) : 0;
    };
    on(document, 'pointermove', event => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || !motion()) { cursor.classList.remove('is-visible'); return; }
      x = event.clientX; y = event.clientY;
      if (!cursor.classList.contains('is-visible')) { cx = x; cy = y; cursor.classList.add('is-visible'); }
      cursor.classList.toggle('is-active', Boolean(event.target.closest('a[href], button:not([disabled]), summary, [data-shot-open]')));
      if (!cursorFrame) cursorFrame = requestAnimationFrame(follow);
    }, { passive: true });
    on(document, 'pointerout', event => { if (!event.relatedTarget) cursor.classList.remove('is-visible'); });
    on(document, 'pointerdown', () => cursor.classList.add('is-pressed'));
    on(document, 'pointerup', () => cursor.classList.remove('is-pressed'));
  }

  /* ---------- Disclosure menus (nonmodal) ---------- */
  const menus = [...document.querySelectorAll('[data-menu-toggle]')];
  const panelOf = button => document.getElementById(button.getAttribute('aria-controls'));
  function closeMenu(button, restoreFocus = false) {
    const panel = panelOf(button);
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    root.classList.remove(`menu-open-${panel.id}`);
    if (restoreFocus) button.focus({ preventScroll: true });
  }
  function openMenu(button, viaKeyboard) {
    menus.filter(other => other !== button).forEach(other => closeMenu(other));
    const panel = panelOf(button);
    if (!panel) return;
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    root.classList.add(`menu-open-${panel.id}`);
    if (viaKeyboard) panel.querySelector('a[href], button:not([disabled])')?.focus({ preventScroll: true });
  }
  menus.forEach(button => {
    on(button, 'click', event => {
      const panel = panelOf(button);
      if (panel?.hidden) openMenu(button, event.detail === 0); else closeMenu(button);
    });
  });
  on(document, 'keydown', event => {
    if (event.key !== 'Escape') return;
    const open = menus.find(button => !panelOf(button)?.hidden);
    if (open) { event.preventDefault(); closeMenu(open, true); }
  });
  on(document, 'pointerdown', event => {
    menus.forEach(button => {
      const panel = panelOf(button);
      if (panel && !panel.hidden && !panel.contains(event.target) && !button.contains(event.target)) closeMenu(button);
    });
  });
  on(document, 'click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    menus.forEach(button => { if (panelOf(button)?.contains(link)) closeMenu(button); });
  });

  /* ---------- Dialogs (modal overlays with native focus handling) ---------- */
  // Capture phase: a link inside an open modal dialog closes it before any other handler runs. While the dialog is
  // open the page is inert, so js/showcase.js could not focus a chapter; closing also returns focus to the opener,
  // which can scroll the page, so other in-page links are followed here within the same frame.
  on(document, 'click', event => {
    const dialog = event.target.closest('dialog[open]');
    const link = dialog && event.target.closest('a[href^="#"]');
    if (!link) return;
    dialog.close();
    root.classList.remove('dialog-open');
    if (showcase && link.matches('[data-product-link]')) {
      // js/showcase.js selects and scrolls to the chapter. The clicked link has gone with the dialog, and a pinned
      // chapter only becomes visible over the next frames, so move focus to it once it can take focus.
      const chapter = document.getElementById(`product-${link.dataset.productLink}`);
      const focusChapter = (attempts = 0) => {
        if (!chapter || chapter.contains(document.activeElement)) return;
        chapter.setAttribute('tabindex', '-1');
        chapter.focus({ preventScroll: true });
        if (document.activeElement !== chapter && attempts < 30) requestAnimationFrame(() => focusChapter(attempts + 1));
      };
      requestAnimationFrame(() => focusChapter());
      return;
    }
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

  /* ---------- Expanders: a button reveals a panel; the panel's own CSS stages the reveal ---------- */
  document.querySelectorAll('[data-expand]').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    const label = button.querySelector('[data-expand-label]');
    let animation = null;
    on(button, 'click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? label.dataset.open : label.dataset.closed;
      animation?.cancel();
      animation = null;
      if (open) {
        panel.classList.remove('is-closing');
        panel.classList.add('is-open');
        if (!motion()) return;
        animation = panel.animate([{ height: '0px' }, { height: `${panel.scrollHeight}px` }], { duration: 760, easing: 'cubic-bezier(.76, 0, .24, 1)' });
        animation.onfinish = () => {
          animation = null;
          // Bring the opened screens into view, without scrolling the button that opened them off the top.
          const box = panel.getBoundingClientRect();
          const distance = Math.min(box.bottom - innerHeight + 24, button.getBoundingClientRect().top - 96);
          if (distance > 0) scrollBy({ top: distance, behavior: 'smooth' });
        };
        return;
      }
      if (!motion()) { panel.classList.remove('is-open'); return; }
      panel.classList.add('is-closing');
      animation = panel.animate([{ height: `${panel.getBoundingClientRect().height}px` }, { height: '0px' }], { duration: 520, easing: 'cubic-bezier(.76, 0, .24, 1)' });
      animation.onfinish = () => { panel.classList.remove('is-open', 'is-closing'); animation = null; };
    });
  });

  /* ---------- Tabs (all panels stay visible without JavaScript); --tab-* positions an optional indicator ---------- */
  document.querySelectorAll('[data-tabs]').forEach(container => {
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const tablist = container.querySelector('[role="tablist"]');
    const indicate = () => {
      const tab = tabs.find(item => item.getAttribute('aria-selected') === 'true');
      if (!tab || !tablist) return;
      tablist.style.setProperty('--tab-x', `${tab.offsetLeft}px`);
      tablist.style.setProperty('--tab-y', `${tab.offsetTop}px`);
      tablist.style.setProperty('--tab-w', `${tab.offsetWidth}px`);
      tablist.style.setProperty('--tab-h', `${tab.offsetHeight}px`);
    };
    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
      indicate();
    };
    container.classList.add('tabs-ready');
    tabs.forEach((tab, index) => {
      on(tab, 'click', () => select(index, false));
      on(tab, 'keydown', event => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (event.key in keys) { event.preventDefault(); select((index + keys[event.key] + tabs.length) % tabs.length, true); }
        if (event.key === 'Home') { event.preventDefault(); select(0, true); }
        if (event.key === 'End') { event.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    const fromHash = () => {
      const index = panels.findIndex(panel => panel && `#${panel.id}` === location.hash);
      if (index >= 0) { select(index, false); panels[index].scrollIntoView({ block: 'start' }); }
    };
    select(Math.max(0, panels.findIndex(panel => panel && `#${panel.id}` === location.hash)), false);
    on(window, 'hashchange', fromHash);
    on(document, 'click', event => {
      const link = event.target.closest('a[href^="#"]');
      const index = link ? panels.findIndex(panel => panel && `#${panel.id}` === link.getAttribute('href')) : -1;
      if (index >= 0) select(index, false);
    });
    if (tablist && 'ResizeObserver' in window) new ResizeObserver(indicate).observe(tablist);
    document.fonts?.ready.then(indicate);
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

  /* ---------- Demo buttons: intentionally unwired, like the original homepage ---------- */
  on(document, 'click', event => {
    const button = event.target.closest('[data-demo]');
    const action = globalThis.INDICE_DATA?.config?.demoAction;
    if (button && typeof action === 'function') action(event);
  });
})();
