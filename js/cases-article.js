(() => {
  const article = document.querySelector('.cases-article');
  document.querySelectorAll('.article-flowchart .mermaid').forEach(diagram => {
    diagram.dataset.diagramSource = diagram.textContent;
  });
  const menus = Array.from(document.querySelectorAll('.cases-article-toc nav')).map(navigation =>
    Array.from(navigation.querySelectorAll('a[href^="#"]')).map(link => ({
      link,
      heading:document.getElementById(link.getAttribute('href').slice(1))
    })).filter(item => item.heading)
  );
  let pendingFrame = null;
  function updateActiveSection() {
    pendingFrame = null;
    const anchorOffset = article && window.getComputedStyle
      ? parseFloat(window.getComputedStyle(article).getPropertyValue('--article-scroll-offset')) || 0
      : 0;
    const threshold = anchorOffset + 32;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const articleStarted = article && article.getBoundingClientRect().top <= threshold;
    for (const items of menus) {
      let active = null;
      for (const item of items) {
        if (item.heading.getBoundingClientRect().top <= threshold) active = item;
      }
      if (atBottom && articleStarted) active = items[items.length - 1];
      for (const item of items) {
        if (item === active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }
    }
  }
  function scheduleUpdate() {
    if (pendingFrame === null) pendingFrame = window.requestAnimationFrame(updateActiveSection);
  }
  if (article) {
    window.addEventListener('scroll', scheduleUpdate, { passive:true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    if (window.ResizeObserver) new window.ResizeObserver(scheduleUpdate).observe(article);
    updateActiveSection();
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy-anchor]');
    if (!button) return;
    const title = button.dataset.copyTitle || 'chapter';
    const chapter = button.closest('.article-chapter');
    if (!chapter?.id) return;
    const url = new URL(`#${chapter.id}`, window.location.href).href;
    const status = document.getElementById('chapter-copy-status');
    const originalLabel = `Copy link to ${title}`;
    try {
      if (window.navigator.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        const copied = document.execCommand?.('copy');
        field.remove();
        if (!copied) throw new Error('Clipboard copy was unavailable');
      }
      status.textContent = `Link copied to ${title}.`;
      button.title = 'Link copied';
      button.setAttribute('aria-label', `Copied link to ${title}`);
      window.setTimeout(() => {
        button.title = 'Copy link';
        button.setAttribute('aria-label', originalLabel);
      }, 1800);
    } catch {
      status.textContent = `Could not copy the link to ${title}. Use the chapter anchor instead.`;
    }
  });
  if (!window.mermaid) {
    document.querySelectorAll('[data-flowchart-open]').forEach(button => { button.hidden = true; });
    return;
  }
  window.mermaid.initialize({
    startOnLoad:false,
    securityLevel:'strict',
    theme:'base',
    themeVariables:{
      fontFamily:'Manrope, sans-serif',
      primaryColor:'#f1efe9',
      primaryTextColor:'#201f1e',
      primaryBorderColor:'#5c5953',
      lineColor:'#5c5953',
      secondaryColor:'#dedad0',
      tertiaryColor:'#ffffff'
    },
    flowchart:{ useMaxWidth:true, htmlLabels:false }
  });
  window.mermaid.run({ querySelector:'.cases-article .mermaid', suppressErrors:true });
  const dialog = document.querySelector('.flowchart-dialog');
  const dialogTitle = dialog?.querySelector('#flowchart-dialog-title');
  const dialogCanvas = dialog?.querySelector('.flowchart-dialog-canvas');
  let activeTrigger = null;
  if (dialog && dialogTitle && dialogCanvas) {
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
    });
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      dialog.close();
    });
    document.addEventListener('click', async event => {
      const trigger = event.target.closest('[data-flowchart-open]');
      if (trigger) {
        const figure = trigger.closest('.article-flowchart');
        const source = figure?.querySelector('.mermaid')?.dataset.diagramSource;
        if (!source) return;
        activeTrigger = trigger;
        dialogTitle.textContent = trigger.dataset.flowchartTitle || 'Workflow diagram';
        dialog.dataset.flowchartOrientation = trigger.dataset.flowchartOrientation || 'vertical';
        const diagram = document.createElement('pre');
        diagram.className = 'mermaid';
        diagram.textContent = source.includes('%%{init:')
          ? source
          : `%%{init: {"themeVariables": {"fontSize": "10px"}}}%%\n${source}`;
        dialogCanvas.replaceChildren(diagram);
        dialog.showModal();
        try {
          await window.mermaid.run({ nodes:[diagram], suppressErrors:true });
          const svg = diagram.querySelector('svg') || dialogCanvas.querySelector('svg');
          if (svg) {
            const [, , viewBoxWidth, viewBoxHeight] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
            const scale = 1.5;
            const chartWidth = Math.ceil(viewBoxWidth * scale);
            const chartHeight = Math.ceil(viewBoxHeight * scale);
            svg.style.width = `${chartWidth}px`;
            svg.style.height = 'auto';
            svg.style.maxWidth = 'none';
            svg.style.minWidth = '0';
            if (dialog.dataset.flowchartOrientation === 'horizontal') {
              const header = dialog.querySelector('.flowchart-dialog-header').getBoundingClientRect().height;
              const canvasStyle = window.getComputedStyle(dialogCanvas);
              const verticalPadding = parseFloat(canvasStyle.paddingTop) + parseFloat(canvasStyle.paddingBottom);
              dialog.style.width = `${Math.min(window.innerWidth * .98, chartWidth + 64)}px`;
              dialog.style.height = `${Math.min(window.innerHeight * .9, header + chartHeight + verticalPadding + 36)}px`;
            } else {
              dialog.style.width = `${Math.min(window.innerWidth * .94, 900)}px`;
              dialog.style.height = `${Math.min(window.innerHeight * .9, 1000)}px`;
            }
          }
        } catch {
          diagram.textContent = source;
        }
        dialog.querySelector('.flowchart-dialog-close')?.focus();
        return;
      }
      if (event.target.closest('.flowchart-dialog-close')) dialog.close();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialogCanvas.replaceChildren();
      dialog.removeAttribute('data-flowchart-orientation');
      dialog.style.removeProperty('width');
      dialog.style.removeProperty('height');
      activeTrigger?.focus();
      activeTrigger = null;
    });
  }
})();