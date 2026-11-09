const fs = require('node:fs');
const path = require('node:path');
const { Marked } = require('marked');
const { escape } = require('./shared.js');

function renderArticle({ source }) {
  const contents = [];
  const contentGroups = [];
  const headingIds = new Set();
  let currentHeading = '';
  let mermaidCount = 0;
  const markdown = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const label = tokens.map(token => token.text || '').join('').replace(/[^\p{L}\p{N}\s&.-]/gu, '').trim();
        currentHeading = label;
        const base = `article-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        let id = base;
        let suffix = 2;
        while (headingIds.has(id)) id = `${base}-${suffix++}`;
        headingIds.add(id);
        if (depth <= 2) {
          const item = { id, label, depth };
          contents.push(item);
          if (depth === 1) {
            const isDeveloperSection = /developer/i.test(label);
            contentGroups.push({
              title:isDeveloperSection ? 'Developer reference' : 'Product',
              items:[{ ...item, label:isDeveloperSection ? 'For developers' : 'Overview' }]
            });
          } else {
            contentGroups.at(-1)?.items.push({
              ...item,
              label:label.replace(/^\d+(?:\.\d+)*\.\s*/, '')
            });
          }
        }
        const level = Math.min(depth + 1, 6);
        const headingClasses = [];
        if (depth <= 2) headingClasses.push('article-chapter');
        if (label === 'The back-office action loop') headingClasses.push('flowchart-section-title');
        const classAttribute = headingClasses.length ? ` class="${headingClasses.join(' ')}"` : '';
        const headingText = depth <= 2 && /^\d+(?:\.\d+)*\./.test(label)
          ? text.replace(/^(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?\s*)+/u, '')
          : text;
        const chapterActions = depth <= 2
          ? `<span class="chapter-heading-actions"><button class="chapter-copy" type="button" data-copy-anchor data-copy-title="${escape(label)}" aria-label="Copy link to ${escape(label)}" title="Copy link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button></span>`
          : '';
        return `<h${level} id="${id}"${classAttribute}><span class="chapter-heading-text">${headingText}</span>${chapterActions}</h${level}>\n`;
      },
      code({ text, lang }) {
        if (lang === 'mermaid') {
          const index = mermaidCount++;
          const orientation = /\bflowchart\s+(?:TD|TB)\b/.test(text) ? 'vertical' : 'horizontal';
          const sourceText = index === 1
            ? `%%{init: {"themeVariables": {"fontSize": "10px"}}}%%\n${text}`
            : text;
          const expandButton = `<button class="flowchart-expand" type="button" data-flowchart-open data-flowchart-orientation="${orientation}" data-flowchart-title="${escape(currentHeading)}" aria-label="Open larger view of ${escape(currentHeading)}" title="Open larger view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M14 10l7-7M9 21H3v-6m0 6 7-7M3 9V3h6M3 3l7 7m11 5v6h-6m6 0-7-7"/></svg></button>`;
          return `<figure class="article-flowchart${index === 1 ? ' article-flowchart-compact' : ''}"><pre class="mermaid" aria-label="${escape(currentHeading)} diagram">${escape(sourceText)}</pre>${expandButton}</figure>\n`;
        }
        return `<pre><code${lang ? ` class="language-${escape(lang)}"` : ''}>${escape(text)}</code></pre>\n`;
      },
      table(token) {
        const heading = token.header.map(cell => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`).join('');
        const rows = token.rows.map(row => `<tr>${row.map(cell => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`).join('');
        return `<div class="article-table" role="region" aria-label="Product reference table" tabindex="0"><table><thead><tr>${heading}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      }
    }
  });
  const body = markdown.parse(fs.readFileSync(path.join(__dirname, '..', source), 'utf8'));
  const contentsMarkup = contentGroups.map(group => `<section class="cases-toc-group"><h3 class="cases-toc-category">${escape(group.title)}</h3><ul>${group.items.map(({ id, label }) => `<li><a class="cases-toc-link" href="#${id}">${escape(label)}</a></li>`).join('')}</ul></section>`).join('');
  require('./render-cases.js')({
    filename:'cases-reference.html',
    title:'Cases technical reference',
    navigation:'',
    html: `    <div class="cases-article-layout section-pad">
      <aside class="cases-article-toc"><nav class="cases-toc-nav" aria-label="Technical reference sections"><h2 class="cases-toc-title">On this page</h2>${contentsMarkup}</nav></aside>
      <article class="cases-article" aria-labelledby="${contents[0].id}">${body}<p class="sr-only" id="chapter-copy-status" role="status" aria-live="polite" aria-atomic="true"></p></article>
    </div>
    <dialog class="flowchart-dialog" aria-labelledby="flowchart-dialog-title"><div class="flowchart-dialog-shell"><header class="flowchart-dialog-header"><div><p class="flowchart-dialog-eyebrow">Workflow diagram</p><h2 class="flowchart-dialog-title" id="flowchart-dialog-title"></h2></div><button class="flowchart-dialog-close" type="button" aria-label="Close diagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg></button></header><div class="flowchart-dialog-canvas" aria-live="polite"></div></div></dialog>\n`
  });
}

module.exports = function renderCasesArticle() {
  renderArticle({ source:'cases-product.md' });
  for (const obsoletePage of ['cases.html', 'cases-0.2.html']) {
    fs.rmSync(path.join(__dirname, '..', obsoletePage), { force:true });
  }
};