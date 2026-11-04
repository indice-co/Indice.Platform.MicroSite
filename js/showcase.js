/* One native-scroll state model for product tiles, story navigation and previews. */
(() => {
  'use strict';

  const products = globalThis.INDICE_DATA?.products || [];
  const section = document.querySelector('#product-showcase');
  const stage = section?.querySelector('.story-stage');
  const panel = section?.querySelector('.preview-panel');
  if (!products.length || !section || !stage || !panel) return;

  const chapters = [...section.querySelectorAll('.product-chapter')];
  const slides = [...panel.querySelectorAll('[data-preview]')];
  const navigation = [...section.querySelectorAll('[data-select-product]')];
  const grid = document.querySelector('#products .product-grid');
  const previewName = panel.querySelector('.preview-product-name');
  const progress = section.querySelector('.story-progress');
  const media = matchMedia('(min-width: 1000px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
  const supportsStory = CSS.supports('position', 'sticky') && 'inert' in HTMLElement.prototype;
  const INTRO = 1.1;
  const PRODUCT = 0.9;
  const state = {
    enhanced: false,
    phase: 'static',
    activeIndex: -1,
    previewIndex: 0,
    visible: false,
    units: 0,
  };
  let dimensions = { start: 0, viewport: innerHeight, width: innerWidth };
  let frame = 0;
  let loop = 0;
  let resizeFrame = 0;
  let disposed = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = value => value * value * (3 - 2 * value);
  const productIndex = id => products.findIndex(product => product.id === id);
  const color = value => {
    const clean = (value || '#201f1e').replace('#', '');
    return [0, 2, 4].map(offset => parseInt(clean.slice(offset, offset + 2), 16));
  };
  const mixColor = (from, to, amount) => from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
  const productColor = index => color(products[index].id === 'messaging' ? products[index].accent : products[index].color);

  function showPreview(index) {
    state.previewIndex = index;
    slides.forEach(slide => {
      const active = slide.dataset.preview === products[index].id;
      slide.classList.toggle('is-active', active);
      // The automatic introduction is decorative, never a live region.
      slide.setAttribute('aria-hidden', String(!active));
    });
    if (previewName) previewName.textContent = products[index].name;
  }

  function stopLoop() {
    clearInterval(loop);
    loop = 0;
  }

  function updateLoop() {
    const canRun = state.enhanced && state.visible && state.activeIndex < 0 &&
      !document.hidden && !disposed;
    if (!canRun) {
      stopLoop();
      return;
    }
    if (!loop) loop = setInterval(() => showPreview((state.previewIndex + 1) % products.length), 4000);
  }

  function releaseGrid() {
    if (!grid) return;
    grid.inert = false;
    grid.classList.remove('is-covered');
  }

  function setActive(index) {
    const changed = state.activeIndex !== index;
    state.activeIndex = index;
    section.dataset.activeProduct = index < 0 ? '' : products[index].id;
    chapters.forEach(chapter => {
      const active = index >= 0 && chapter.dataset.product === products[index].id;
      chapter.classList.toggle('is-active', active);
      if (state.enhanced) {
        chapter.inert = !active;
        chapter.setAttribute('aria-hidden', String(!active));
      } else {
        chapter.inert = false;
        chapter.removeAttribute('aria-hidden');
      }
    });
    navigation.forEach(button => {
      const active = index >= 0 && button.dataset.selectProduct === products[index].id;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (index >= 0) showPreview(index);
    if (changed) updateLoop();
  }

  function render() {
    frame = 0;
    if (!state.enhanced || disposed) return;
    const { start, viewport, width } = dimensions;
    const raw = (scrollY - start) / viewport;
    const units = clamp(raw, 0, INTRO + products.length * PRODUCT);
    state.units = units;
    const arrival = ease(clamp(units / 0.55));
    const transformation = ease(clamp((units - 0.55) / 0.55));
    const reveal = ease(clamp((units - INTRO) / 0.25));
    const phase = units < 0.55 ? 'intro' : units < INTRO ? 'transform' : 'product';
    state.phase = phase;
    section.dataset.phase = phase;

    const panelWidth = Math.min(width * 0.96, 1400, (viewport - 100) * 1.8);
    const finalWidth = Math.min(width * 0.68, 1000);
    panel.style.width = `${panelWidth}px`;
    stage.style.setProperty('--panel-scale', String((0.72 + arrival * 0.28) * (1 + (finalWidth / panelWidth - 1) * transformation)));
    stage.style.setProperty('--panel-x', `${(width * 0.22 + 30) * transformation}px`);
    stage.style.setProperty('--panel-y', `${viewport * (0.16 * (1 - arrival) - 0.07)}px`);
    stage.style.setProperty('--panel-opacity', String(arrival));
    stage.style.setProperty('--copy-opacity', String(reveal));
    stage.style.setProperty('--copy-y', `${24 * (1 - reveal)}px`);
    stage.style.setProperty('--intro-opacity', String(1 - transformation));

    const index = units < INTRO ? -1 : Math.min(products.length - 1, Math.floor((units - INTRO) / PRODUCT));
    setActive(index);
    if (index < 0) {
      // Only the panel obscures the grid, so its overlap is the focusability boundary.
      stage.style.backgroundColor = 'transparent';
    } else {
      const fraction = clamp(((units - INTRO) / PRODUCT - index) / 0.22);
      const from = index === 0 ? [222, 218, 208] : productColor(index - 1);
      const channels = mixColor(from, productColor(index), ease(fraction));
      stage.style.backgroundColor = `rgba(${channels.join(',')},0.12)`;
    }
    if (progress) progress.style.setProperty('--progress', String(clamp((units - INTRO) / (products.length * PRODUCT))));
    const panelRect = panel.getBoundingClientRect();
    state.visible = arrival > 0.15 && panelRect.bottom > 0 && panelRect.top < viewport &&
      panelRect.right > 0 && panelRect.left < width;
    if (grid) {
      const gridRect = grid.getBoundingClientRect();
      const overlap = arrival > 0.15 && gridRect.bottom > panelRect.top && gridRect.top < panelRect.bottom &&
        gridRect.right > panelRect.left && gridRect.left < panelRect.right;
      const focused = grid.contains(document.activeElement);
      // Never cover a focused grid control as a side effect of ordinary scrolling.
      panel.style.visibility = overlap && focused ? 'hidden' : '';
      if (overlap && focused) state.visible = false;
      grid.inert = overlap && !focused;
      grid.classList.toggle('is-covered', grid.inert);
    }
    updateLoop();
  }

  function requestRender() {
    if (!frame && !disposed) frame = requestAnimationFrame(() => {
      if (state.enhanced) render();
      else {
        frame = 0;
        const bounds = section.getBoundingClientRect();
        if (bounds.top >= innerHeight || bounds.bottom <= 0) return;
        const probe = innerHeight * 0.35;
        let index = 0;
        chapters.forEach((chapter, chapterIndex) => {
          if (chapter.getBoundingClientRect().top <= probe) index = chapterIndex;
        });
        setActive(index);
      }
    });
  }

  function measure({ preserve = false } = {}) {
    if (!state.enhanced || disposed) return;
    const wasInside = scrollY >= dimensions.start &&
      scrollY < dimensions.start + dimensions.viewport * (INTRO + products.length * PRODUCT);
    const oldUnits = state.units;
    const oldIndex = state.activeIndex;
    dimensions = {
      start: section.getBoundingClientRect().top + scrollY,
      viewport: innerHeight,
      width: innerWidth,
    };
    section.style.height = `${dimensions.viewport * (1 + INTRO + products.length * PRODUCT)}px`;
    if (preserve && wasInside) {
      const stableUnits = oldIndex >= 0
        ? clamp(oldUnits, INTRO + oldIndex * PRODUCT + 0.01, INTRO + (oldIndex + 1) * PRODUCT - 0.01)
        : oldUnits;
      scrollTo({ top: dimensions.start + stableUnits * dimensions.viewport, behavior: 'instant' });
    }
    render();
  }

  function selectProduct(id, { focus = false, hash = true } = {}) {
    const index = productIndex(id);
    if (index < 0) return;
    const chapter = chapters.find(item => item.dataset.product === id);
    if (!chapter) return;
    if (state.enhanced) {
      const destination = dimensions.start + dimensions.viewport * (INTRO + (index + 0.5) * PRODUCT);
      scrollTo({ top: destination, behavior: 'instant' });
      render();
    } else {
      setActive(index);
      chapter.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    if (hash) {
      try { history.replaceState(null, '', `#product-${id}`); } catch { /* Local file previews may restrict history writes. */ }
    }
    if (focus) {
      // Explicit navigation alone moves focus; scrubbed changes never do.
      chapter.setAttribute('tabindex', '-1');
      chapter.focus({ preventScroll: true });
    }
  }

  function onClick(event) {
    const control = event.target.closest('[data-product-link], [data-select-product]');
    if (!control || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = control.dataset.productLink || control.dataset.selectProduct;
    if (productIndex(id) < 0) return;
    event.preventDefault();
    selectProduct(id, { focus: true });
  }

  function fromHash() {
    const id = location.hash.replace(/^#product-/, '');
    if (productIndex(id) >= 0) selectProduct(id, { hash: false });
  }

  function configure() {
    const next = media.matches && supportsStory;
    if (next === state.enhanced) {
      if (next) measure({ preserve: true });
      else {
        state.phase = 'static';
        section.dataset.phase = 'static';
        requestRender();
      }
      return;
    }
    let selected = state.activeIndex;
    const staticBounds = section.getBoundingClientRect();
    const wasInside = state.enhanced
      ? scrollY >= dimensions.start && scrollY < dimensions.start + dimensions.viewport * (INTRO + products.length * PRODUCT)
      : staticBounds.top < innerHeight * 0.5 && staticBounds.bottom > innerHeight * 0.5;
    if (!state.enhanced && wasInside) {
      selected = chapters.reduce((closest, chapter, index) =>
        Math.abs(chapter.getBoundingClientRect().top - innerHeight * 0.25) <
        Math.abs(chapters[closest].getBoundingClientRect().top - innerHeight * 0.25) ? index : closest, 0);
    }
    state.enhanced = next;
    section.classList.toggle('story-enhanced', next);
    document.documentElement.classList.toggle('has-story', next);
    if (next) {
      measure();
      if (wasInside && selected >= 0) selectProduct(products[selected].id, { hash: false });
    } else {
      stopLoop();
      cancelAnimationFrame(frame);
      frame = 0;
      section.style.height = '';
      stage.removeAttribute('style');
      panel.removeAttribute('style');
      section.dataset.phase = 'static';
      state.phase = 'static';
      releaseGrid();
      setActive(selected);
      if (wasInside && selected >= 0) chapters[selected].scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }

  function onResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      configure();
    });
  }

  function teardown() {
    disposed = true;
    stopLoop();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    frame = 0;
    window.removeEventListener('scroll', requestRender);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', updateLoop);
    document.removeEventListener('click', onClick);
    document.removeEventListener('focusin', requestRender);
    document.removeEventListener('focusout', requestRender);
    window.removeEventListener('hashchange', fromHash);
    window.removeEventListener('load', fromHash);
    media.removeEventListener('change', configure);
    releaseGrid();
  }

  function initialize() {
    disposed = false;
    section.classList.add('story-ready');
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', updateLoop);
    document.addEventListener('click', onClick);
    document.addEventListener('focusin', requestRender);
    document.addEventListener('focusout', requestRender);
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('load', fromHash, { once: true });
    media.addEventListener('change', configure);
    showPreview(state.previewIndex);
    configure();
    if (state.enhanced) measure();
    fromHash();
  }

  globalThis.INDICE_SHOWCASE = Object.freeze({
    selectProduct,
    getState: () => ({ ...state, product: products[state.activeIndex]?.id || null }),
  });
  initialize();
  document.fonts?.ready.then(() => {
    if (!disposed) measure({ preserve: true });
  });
  section.querySelectorAll('img').forEach(image => {
    if (!image.complete) image.addEventListener('load', () => measure({ preserve: true }), { once: true });
  });
  window.addEventListener('pagehide', teardown);
  window.addEventListener('pageshow', event => {
    if (event.persisted && disposed) initialize();
  });
})();
