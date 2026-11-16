'use strict';

/* Terminal design, Cases technical reference. js/terminal.js runs the shell (explorer, scroll-spy, code copy,
   palette); this adds chapter link copying and Mermaid diagrams in the terminal palette. Without it the
   chapter anchors still work and diagram sources stay readable. */
(() => {
  const status = document.getElementById('chapter-copy-status');

  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.append(area); area.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy failed')); } catch (error) { reject(error); } finally { area.remove(); }
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-copy-anchor]');
    if (!button) return;
    const heading = button.closest('.doc-chapter');
    if (!heading?.id) return;
    const title = button.dataset.copyTitle || 'chapter';
    const label = button.querySelector('span');
    copyText(new URL(`#${heading.id}`, location.href).href)
      .then(() => {
        status.textContent = `Link copied to ${title}.`;
        button.classList.add('is-done');
        if (label) label.textContent = 'copied';
      })
      .catch(() => { status.textContent = `Could not copy the link to ${title}. Use the chapter anchor instead.`; })
      .finally(() => setTimeout(() => {
        button.classList.remove('is-done');
        if (label) label.textContent = 'link';
      }, 1600));
  });

  const diagrams = [...document.querySelectorAll('.doc .mermaid')];
  diagrams.forEach(diagram => { diagram.dataset.diagramSource = diagram.textContent; });
  if (!window.mermaid) {
    document.querySelectorAll('[data-diagram-open]').forEach(button => { button.hidden = true; });
    return;
  }

  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      darkMode: true,
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      background: css('--panel'),
      primaryColor: css('--panel-2'),
      primaryTextColor: css('--text'),
      primaryBorderColor: css('--accent'),
      secondaryColor: css('--panel'),
      tertiaryColor: css('--bg'),
      lineColor: css('--faint'),
      textColor: css('--text'),
      edgeLabelBackground: css('--panel')
    },
    flowchart: { useMaxWidth: true, htmlLabels: false }
  });
  window.mermaid.run({ nodes: diagrams, suppressErrors: true });

  const dialog = document.querySelector('.diagram-dialog');
  const dialogTitle = document.getElementById('diagram-dialog-title');
  const canvas = dialog?.querySelector('.diagram-dialog-canvas');
  if (!dialog || !dialogTitle || !canvas || typeof dialog.showModal !== 'function') {
    document.querySelectorAll('[data-diagram-open]').forEach(button => { button.hidden = true; });
    return;
  }
  let trigger = null;

  document.addEventListener('click', async event => {
    const opener = event.target.closest('[data-diagram-open]');
    if (!opener) return;
    const source = opener.closest('.diagram')?.querySelector('.mermaid')?.dataset.diagramSource;
    if (!source) return;
    trigger = opener;
    dialogTitle.textContent = opener.dataset.diagramTitle || 'Workflow diagram';
    dialog.dataset.orientation = opener.dataset.diagramOrientation || 'vertical';
    const diagram = document.createElement('pre');
    diagram.className = 'mermaid';
    diagram.textContent = source.includes('%%{init:') ? source : `%%{init: {"themeVariables": {"fontSize": "10px"}}}%%\n${source}`;
    canvas.replaceChildren(diagram);
    dialog.showModal();
    dialog.querySelector('.diagram-close')?.focus();
    try {
      await window.mermaid.run({ nodes: [diagram], suppressErrors: true });
      const svg = canvas.querySelector('svg');
      const viewBox = svg?.getAttribute('viewBox')?.split(/\s+/).map(Number);
      if (viewBox) {
        const width = Math.ceil(viewBox[2] * 1.5);
        const height = Math.ceil(viewBox[3] * 1.5);
        svg.style.width = `${width}px`;
        svg.style.height = 'auto';
        svg.style.maxWidth = 'none';
        if (dialog.dataset.orientation === 'horizontal') {
          const head = dialog.querySelector('.diagram-dialog-head').getBoundingClientRect().height;
          const padding = parseFloat(getComputedStyle(canvas).paddingTop) * 2;
          dialog.style.width = `${Math.min(innerWidth * .98, width + 64)}px`;
          dialog.style.height = `${Math.min(innerHeight * .9, head + height + padding + 36)}px`;
        } else {
          dialog.style.width = `${Math.min(innerWidth * .94, 900)}px`;
          dialog.style.height = `${Math.min(innerHeight * .9, 1000)}px`;
        }
      }
    } catch {
      diagram.textContent = source;
    }
  });
  dialog.querySelector('.diagram-close')?.addEventListener('click', () => dialog.close());
  /* Some embedded browsers do not close a modal dialog on Escape by themselves. */
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    canvas.replaceChildren();
    delete dialog.dataset.orientation;
    dialog.style.removeProperty('width');
    dialog.style.removeProperty('height');
    trigger?.focus();
    trigger = null;
  });
})();
