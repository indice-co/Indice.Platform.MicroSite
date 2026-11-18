'use strict';

/* Terminal design: the Cases technical reference (cases-product.md) inside the terminal.html IDE shell.
   Same text as cases-reference.html; js/terminal.js supplies the explorer, scroll-spy, copy buttons and palette,
   js/terminal-reference.js adds chapter links and the Mermaid diagrams. */
const fs = require('node:fs');
const path = require('node:path');
const { Marked } = require('marked');
const { links } = require('./tech-content.js');
const { highlight, escapeHtml } = require('./highlight.js');
const { designRibbon, escape, headerGithub } = require('./shared.js');

const { products, casesPage } = globalThis.INDICE_DATA;
const cases = products.find(product => product.id === 'cases');
const leadingEmoji = /^(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?\s*)+/u;
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const svgSize = file => {
  const [, width, height] = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return `width="${width}" height="${height}"`;
};
const placeholder = (label, title) =>
  `<span class="ph" role="link" aria-disabled="true" title="${escape(title)}">${escape(label)}<small>placeholder</small></span>`;
const linkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const expandIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M14 10l7-7M9 21H3v-6m0 6 7-7M3 9V3h6M3 3l7 7m11 5v6h-6m6 0-7-7"/></svg>';
const lines = html => html.split('\n').map(line => `<span class="line">${line || ' '}</span>`).join('\n');

/* Parses the Markdown once; returns the article body and the chapters (h1/h2 of the source) grouped like the original contents. */
function article(source) {
  const groups = [];
  const headingIds = new Set();
  let currentHeading = '';
  let currentFile = '';
  let mermaidCount = 0;
  const markdown = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens).replace(leadingEmoji, '');
        const label = tokens.map(token => token.text || '').join('').replace(/[^\p{L}\p{N}\s&.-]/gu, '').trim();
        currentHeading = label;
        const base = `article-${slug(label)}`;
        let id = base;
        let suffix = 2;
        while (headingIds.has(id)) id = `${base}-${suffix++}`;
        headingIds.add(id);
        const level = Math.min(depth + 1, 6);
        const mark = `<span class="h-mark" aria-hidden="true">${'#'.repeat(depth)} </span>`;
        if (depth > 2) return `<h${level} id="${id}">${mark}${text}</h${level}>\n`;

        if (depth === 1) {
          const developers = /developer/i.test(label);
          groups.push({ dir: developers ? 'developers' : 'product', title: developers ? 'Developer reference' : 'Product', items: [] });
        }
        const group = groups.at(-1);
        const file = depth === 1 ? (group.dir === 'developers' ? 'for-developers.md' : 'overview.md') : `${slug(label)}.md`;
        currentFile = file;
        group.items.push({ id, file, label: depth === 1 ? (group.dir === 'developers' ? 'For developers' : 'Overview') : label.replace(/^\d+(?:\.\d+)*\.\s*/, '') });
        return `<header class="doc-head">
          <p class="crumb">cases / ${group.dir} / ${file}</p>
          <h${level} id="${id}" class="doc-chapter"><span class="doc-chapter-text">${mark}${text}</span><button class="copy chapter-link" type="button" data-copy-anchor data-copy-title="${escape(label)}" aria-label="Copy link to ${escape(label)}" title="Copy link">${linkIcon}<span>link</span></button></h${level}>
        </header>\n`;
      },
      code({ text, lang }) {
        if (lang === 'mermaid') {
          const index = mermaidCount++;
          const orientation = /\bflowchart\s+(?:TD|TB)\b/.test(text) ? 'vertical' : 'horizontal';
          const source = index === 1 ? `%%{init: {"themeVariables": {"fontSize": "10px"}}}%%\n${text}` : text;
          return `<figure class="codeblock diagram">
          <figcaption><span class="file">${escape(slug(currentHeading))}.mmd</span><span class="lang">mermaid</span><button class="copy diagram-open" type="button" data-diagram-open data-diagram-orientation="${orientation}" data-diagram-title="${escape(currentHeading)}" aria-label="Open larger view of ${escape(currentHeading)}" title="Open larger view">${expandIcon}<span>expand</span></button></figcaption>
          <pre class="mermaid" aria-label="${escape(currentHeading)} diagram">${escape(source)}</pre>
        </figure>\n`;
        }
        const language = lang === 'csharp' ? 'csharp' : 'text';
        const file = `${slug(currentHeading)}.${language === 'csharp' ? 'cs' : 'txt'}`;
        return `<figure class="codeblock">
          <figcaption><span class="file">${escape(file)}</span><span class="lang">${language === 'csharp' ? 'c#' : 'text'}</span></figcaption>
          <pre class="code" tabindex="0"><code${lang ? ` class="language-${escape(lang)}"` : ''}>${lines(language === 'csharp' ? highlight('csharp', text) : escapeHtml(text))}</code></pre>
        </figure>\n`;
      },
      table(token) {
        const heading = token.header.map(cell => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`).join('');
        const rows = token.rows.map(row => `<tr>${row.map(cell => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`).join('');
        return `<div class="scroll doc-table" role="region" aria-label="Product reference table" tabindex="0"><table><thead><tr>${heading}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      }
    }
  });
  const body = markdown.parse(fs.readFileSync(path.join(__dirname, '..', source), 'utf8'));
  return { body, groups };
}

const caseWindow = () => casesPage.detailScreenshot
  ? `<figure class="case-window"><img src="${escape(casesPage.detailScreenshot)}" alt="Cases case detail showing the timeline and available actions"><figcaption>Case detail: timeline and available actions.</figcaption></figure>`
  : `<figure class="case-window">
              <div class="case-bar" aria-hidden="true"><i></i><i></i><i></i><em>Cases</em></div>
              <div class="case-body">
                <p class="case-label">Case detail screenshot &mdash; awaiting approved asset</p>
                <div class="case-title"><div><small>Illustrative case / 0248</small><b>Customer request</b></div><span class="case-status">In progress</span></div>
                <ol class="case-stages" aria-label="Illustrative workflow stages"><li class="is-done">Assigned</li><li class="is-current">In review</li><li>Decision</li></ol>
                <div class="case-cols">
                  <div><p class="case-sub">Case timeline</p><ol class="case-timeline"><li><b>Request received</b><span>Customer submission</span></li><li><b>Assigned to a team</b><span>Internal review</span></li><li><b>Pending second approval</b><span>Private checkpoint</span></li></ol></div>
                  <div><p class="case-sub">Available actions</p><details><summary>Review case</summary><p>Illustration only. Staff review the case before a decision.</p></details><details><summary>View history</summary><p>The timeline keeps case updates and internal steps together.</p></details><p class="case-private">Staff view &middot; Internal notes stay private</p></div>
                </div>
              </div>
              <figcaption>Layout placeholder only, not a product screenshot. The supplied dashboard does not show case detail.</figcaption>
            </figure>`;

function render() {
  const { body, groups } = article('cases-product.md');
  const chapters = groups.flatMap(group => group.items.map(item => ({ ...item, group })));
  const repositoryLink = headerGithub.replace('class="header-github"', 'class="explorer-github" target="_blank" rel="noopener"');
  const explorerLink = (href, label) => `<a href="${href}" data-spy-link="${href.slice(1)}">${label}</a>`;
  const casesIcon = cases.logo.replace(' logo.svg', ' icon.svg');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0a0d12">
  <meta name="description" content="${escape(cases.description)}">
  <title>Cases technical reference &mdash; INDICE Platform Terminal</title>
  <link rel="icon" type="image/svg+xml" href="assets/logos/indice icon.svg">
  <link rel="preload" href="assets/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/design-ribbon.css">
  <link rel="stylesheet" href="css/terminal.css">
  <link rel="stylesheet" href="css/terminal-reference.css">
  <script>document.documentElement.classList.add('js')</script>
  <script defer src="js/terminal.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js"></script>
  <script defer src="js/terminal-reference.js"></script>
</head>
<body class="tm tm-reference">
  <a class="skip-link" href="#main">Skip to content</a>
  ${designRibbon('terminal')}
  <div class="ide">
    <header class="titlebar">
      <button class="explorer-toggle" type="button" aria-controls="explorer" aria-expanded="false"><span aria-hidden="true">☰</span><span class="sr-only">Toggle explorer</span></button>
      <a class="brand" href="terminal.html" aria-label="INDICE Platform, Terminal home"><img src="assets/logos/indice platform white.svg" width="1490" height="400" alt="INDICE Platform"></a>
      ${repositoryLink}
    </header>
    <div class="shell">
      <aside class="explorer" id="explorer" aria-label="Explorer">
        <div class="explorer-header">
          <a class="brand explorer-brand" href="terminal.html" aria-label="INDICE Platform, Terminal home"><img src="assets/logos/indice platform white.svg" width="1490" height="400" alt="INDICE Platform"></a>
          ${repositoryLink}
        </div>
        <p class="explorer-title">Explorer</p>
        <nav aria-label="Technical reference sections">
          <ul class="tree">
            <li class="dir"><span>indice-platform</span>
              <ul>
                <li><a class="tree-up" href="terminal.html#cases"><span aria-hidden="true">../</span>02-suite<span class="sr-only"> (back to the suite on the Terminal homepage)</span></a></li>
                <li class="dir"><span><img src="${escape(casesIcon)}" alt="" width="14" height="14">cases</span><ul>
                  <li>${explorerLink('#top', 'README.md')}</li>
                  ${groups.map(group => `<li class="dir"><span>${group.dir}</span><ul>
                    ${group.items.map(item => `<li>${explorerLink(`#${item.id}`, escape(item.file))}</li>`).join('\n                    ')}
                  </ul></li>`).join('\n                  ')}
                </ul></li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
      <div class="scrim" data-scrim hidden></div>

      <main class="editor" id="main" tabindex="-1">
        <section class="hero ref-hero" id="top" aria-labelledby="cases-title">
          <div class="hero-left">
            <p class="prompt"><span class="ps">~/indice-platform/02-suite/cases</span></p>
            <p class="cmd"><span class="dollar" aria-hidden="true">$</span> <span class="typed">cat README.md</span><span class="caret" aria-hidden="true"></span></p>
            <span class="plate ref-plate"><img src="${escape(cases.logo)}" ${svgSize(cases.logo)} alt="${escape(cases.name)}" decoding="async"></span>
            <p class="ref-category">Case management &amp; back-office workflows</p>
            <h1 id="cases-title"><span class="h-mark" aria-hidden="true"># </span>Every case.<br>A clear path forward.</h1>
            <p class="lead">${escape(cases.description)}</p>
            <p class="ref-actions">${placeholder('Request a demo', 'Placeholder: demo request link not provided yet')}<a class="doc-link" href="terminal.html#cases">&larr; Back to the suite</a></p>
          </div>
          <div class="hero-right">
            ${caseWindow()}
            <ul class="case-notes">
              <li><span class="case-dot" aria-hidden="true"></span><span><small>Illustrative customer update</small><b>In progress</b><span class="dim">In your connected application</span></span></li>
              <li><span class="case-lock" aria-hidden="true">&#9679;</span><span>One case. Controlled visibility.</span></li>
            </ul>
          </div>
        </section>
        <p class="ref-note"><span class="h-mark" aria-hidden="true">// </span>One case, two views. A shared workflow, with a clear boundary between customer updates and internal work.</p>

        <article class="doc" aria-labelledby="${chapters[0].id}">
${body}        <p class="sr-only" id="chapter-copy-status" role="status" aria-live="polite" aria-atomic="true"></p>
        </article>
      </main>
    </div>

    <footer class="statusbar" aria-label="Status bar">
      <span class="sb-path" data-sb-path>indice-platform › cases</span>
      <span class="sb-sep"></span>
      <span class="sb-item">.NET 8</span><span class="sb-item">Elsa 2</span><span class="sb-item">SQL Server</span><span class="sb-item">OIDC</span>
      <span class="sb-item sb-hint">Ctrl K</span>
    </footer>
  </div>

  <dialog class="diagram-dialog" aria-labelledby="diagram-dialog-title">
    <div class="diagram-dialog-shell">
      <header class="diagram-dialog-head"><p class="crumb">Workflow diagram</p><h2 id="diagram-dialog-title"></h2><button class="copy diagram-close" type="button" aria-label="Close diagram">esc</button></header>
      <div class="diagram-dialog-canvas" aria-live="polite"></div>
    </div>
  </dialog>

  <dialog class="palette" id="palette" aria-label="Go to">
    <form method="dialog" class="palette-box">
      <label class="sr-only" for="palette-input">Go to section or link</label>
      <input id="palette-input" type="text" autocomplete="off" spellcheck="false" placeholder="Go to section or link…" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list">
      <ul id="palette-list" role="listbox" aria-label="Results"></ul>
      <p class="palette-help dim"><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</p>
    </form>
  </dialog>
  <script type="application/json" id="palette-data">${JSON.stringify([
    { label: 'README.md', hint: 'cases', href: '#top' },
    ...chapters.map(item => ({ label: item.file, hint: `${item.group.title.toLowerCase()} · ${item.label}`, href: `#${item.id}` })),
    { label: 'terminal.html', hint: 'Terminal homepage · suite', href: 'terminal.html#cases' },
    { label: 'cases-reference.html', hint: 'Original design', href: 'cases-reference.html' },
    { label: 'github.com/indice-co/Indice.Platform', hint: 'external', href: links.platform }
  ]).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;
}

module.exports = render;
