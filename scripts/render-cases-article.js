const fs = require('node:fs');
const path = require('node:path');
const { Marked } = require('marked');
const { escape } = require('./shared.js');

function renderArticle({ source, filename, reference = false }) {
  const contents = [];
  const headingIds = new Set();
  const markdown = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const label = tokens.map(token => token.text || '').join('').replace(/[^\p{L}\p{N}\s&.-]/gu, '').trim();
        const base = `article-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        let id = base;
        let suffix = 2;
        while (headingIds.has(id)) id = `${base}-${suffix++}`;
        headingIds.add(id);
        if (depth <= 2) contents.push({ id, label });
        const level = Math.min(depth + 1, 6);
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      code({ text, lang }) {
        if (lang === 'mermaid') return `<pre class="mermaid" aria-label="Process diagram">${escape(text)}</pre>\n`;
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
  const primaryLinks = reference
    ? '<a href="#article-indice-cases">Overview</a><a href="#article-1-core-features-capabilities">Capabilities</a><a href="#article-2-flows">Flows</a><a href="#article-for-developers">For developers</a>'
    : '<a href="#article-why-cases">Why Cases</a><a href="#article-how-it-works">Workflow</a><a href="#article-governance-and-visibility">Governance</a><a href="#article-deployment-and-ownership">Deployment</a><a href="#article-implementation-responsibilities">Implementation</a><a href="#article-technical-reference">Reference</a>';
  require('./render-cases.js')({
    filename,
    title:reference ? 'INDICE Cases technical reference' : 'INDICE Cases 0.2',
    navigation: `<nav class="cases-page-links" aria-label="On this page">${primaryLinks}</nav>`,
    html: `    <div class="cases-article-layout section-pad">
      <aside class="cases-article-toc"><nav aria-label="Article contents"><p class="eyebrow">${reference ? 'Technical reference' : 'Contents'}</p><ol>${contents.map(({ id, label }) => `<li><a href="#${id}">${escape(label)}</a></li>`).join('')}</ol><a class="text-link" href="${reference ? 'cases-0.2.html' : 'cases-reference.html'}">${reference ? 'Cases overview' : 'Technical reference'}</a></nav></aside>
      <article class="cases-article" aria-labelledby="${contents[0].id}">${body}</article>
    </div>\n`
  });
}

module.exports = function renderCasesArticle() {
  renderArticle({ source:'cases-overview.md', filename:'cases-0.2.html' });
  renderArticle({ source:'cases-product.md', filename:'cases-reference.html', reference:true });
};