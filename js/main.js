/* Shared page interactions. Content and links remain available without this file. */
(() => {
  'use strict';

  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const brandHomeHref = document.getElementById('hero-brand')?.getAttribute('href');
  let controller;
  let revealObserver;
  let frame = 0;

  function connect() {
    controller = new AbortController();
    const { signal } = controller;
    const panel = document.getElementById('products-panel');
    const navigation = document.getElementById('site-nav');
    const brand = document.getElementById('hero-brand');
    const brandImage = brand?.querySelector('img');
    let previousScroll = 0;
    function updateBrand() {
      if (!brandImage) return;
      const current = Math.max(0, window.scrollY);
      const atTop = current <= 0;
      const { logo, logoIcon, logoTop } = globalThis.INDICE_DATA.config;
      const source = atTop ? logo : current < previousScroll ? logoTop : current > previousScroll ? logoIcon : brandImage.getAttribute('src');
      const topHref = brand.getAttribute('data-top-href');
      if (topHref) {
        const isTopIcon = source === logoTop;
        brand.setAttribute('href', isTopIcon ? topHref : brandHomeHref);
        brand.setAttribute('aria-label', isTopIcon ? 'Back to top' : 'INDICE Platform home');
      }
      if (brandImage.getAttribute('src') !== source) brandImage.setAttribute('src', source);
      brandImage.setAttribute('width', atTop ? '1490' : '400');
      brandImage.setAttribute('height', '400');
      brand.classList.toggle('is-compact', !atTop);
      previousScroll = current;
    }
    window.addEventListener('scroll', updateBrand, { passive: true, signal });
    updateBrand();
    const desktopTrigger = document.getElementById('products-trigger');
    const mobileTrigger = document.getElementById('menu-trigger');
    const triggers = [desktopTrigger, mobileTrigger].filter(Boolean);
    let opener = null;

    const visibleTrigger = () => mobileQuery.matches ? mobileTrigger : desktopTrigger;
    const isOpen = () => panel && !panel.hidden;

    function closePanel(restoreFocus = false) {
      if (!panel) return;
      panel.hidden = true;
      triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
      navigation?.classList.remove('panel-open');
      if (restoreFocus) {
        const target = opener?.getClientRects().length ? opener : visibleTrigger();
        target?.focus({ preventScroll: true });
      }
    }

    function togglePanel(event) {
      if (!panel) return;
      if (isOpen()) {
        closePanel();
        return;
      }
      opener = event.currentTarget;
      panel.setAttribute('aria-label', mobileQuery.matches ? 'Main menu' : globalThis.INDICE_DATA.copy.navigation.products);
      panel.hidden = false;
      triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'true'));
      navigation?.classList.add('panel-open');

      // Keyboard activation enters the nonmodal panel; Tab can leave it normally.
      if (event.detail === 0) {
        const firstLink = Array.from(panel.querySelectorAll('a[href], button:not([disabled])'))
          .find((element) => element.getClientRects().length > 0);
        firstLink?.focus({ preventScroll: true });
      }
    }

    triggers.forEach((trigger) => trigger.addEventListener('click', togglePanel, { signal }));
    closePanel();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        event.preventDefault();
        closePanel(true);
      }
    }, { signal });

    document.addEventListener('pointerdown', (event) => {
      if (!isOpen() || panel.contains(event.target) || triggers.some((trigger) => trigger.contains(event.target))) return;
      closePanel();
    }, { signal });

    document.addEventListener('focusin', (event) => {
      if (!isOpen() || panel.contains(event.target) || triggers.some((trigger) => trigger.contains(event.target))) return;
      closePanel();
    }, { signal });

    mobileQuery.addEventListener('change', () => {
      const needsFocus = panel?.contains(document.activeElement) || triggers.includes(document.activeElement);
      closePanel();
      if (needsFocus) visibleTrigger()?.focus({ preventScroll: true });
    }, { signal });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.matches('[data-product-link]') || link.closest('.product-navigation')) return;
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      closePanel();
      if (!target.hasAttribute('tabindex') && !target.matches('a, button, input, select, textarea')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth', block: 'start' });
      try { history.pushState(null, '', hash); } catch { /* File previews may restrict history writes. */ }
    }, { signal });

    document.querySelectorAll('[data-demo]').forEach((button) => {
      button.addEventListener('click', (event) => {
        // This phase intentionally has no business action, modal, or destination.
        const action = globalThis.INDICE_DATA?.config?.demoAction;
        if (typeof action === 'function') action(event);
      }, { signal });
    });

    const pillarLinks = Array.from(document.querySelectorAll('[data-pillar]'));
    const sections = ['foundation', 'products', 'services'].map((id) => document.getElementById(id));
    function updateActivePillar() {
      frame = 0;
      const [foundation, products, services] = sections;
      if (!foundation || !products || !services) return;
      const probe = window.innerHeight * 0.33;
      const foundationTop = foundation.getBoundingClientRect().top;
      const productsTop = products.getBoundingClientRect().top;
      const servicesRect = services.getBoundingClientRect();
      let active = '';
      if (foundationTop <= probe && productsTop > probe) active = 'foundation';
      else if (productsTop <= probe && servicesRect.top > probe) active = 'products';
      else if (servicesRect.top <= probe && servicesRect.bottom > probe) active = 'services';
      pillarLinks.forEach((link) => {
        const selected = link.dataset.pillar === active;
        link.classList.toggle('is-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function scheduleActivePillar() {
      if (!frame) frame = requestAnimationFrame(updateActivePillar);
    }
    window.addEventListener('scroll', scheduleActivePillar, { passive: true, signal });
    window.addEventListener('resize', scheduleActivePillar, { passive: true, signal });
    updateActivePillar();

    function prepareReveals() {
      revealObserver?.disconnect();
      root.classList.remove('reveal-ready');
      if (motionQuery.matches || !('IntersectionObserver' in window)) return;
      try {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
        document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
        root.classList.add('reveal-ready');
      } catch {
        revealObserver?.disconnect();
        root.classList.remove('reveal-ready');
      }
    }
    prepareReveals();
    motionQuery.addEventListener('change', prepareReveals, { signal });
  }

  function disconnect() {
    controller?.abort();
    revealObserver?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('reveal-ready');
  }

  connect();
  window.addEventListener('pagehide', disconnect);
  window.addEventListener('pageshow', (event) => { if (event.persisted) connect(); });
})();
