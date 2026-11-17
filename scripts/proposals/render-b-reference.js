'use strict';

/* Proposal B's Cases technical reference (proposal-b-cases-reference.html): the same text and content as
   cases-reference.html, set in Proposal B's editorial design. The article comes from the same parser as the original
   page (scripts/render-cases-article.js), and js/cases-article.js adds the contents highlighting, chapter links and
   the Mermaid diagrams. Only Proposal B links here; the other designs keep cases-reference.html. */
const S = require('./shared.js');
const { content: c, themedLogo, githubRepo } = require('./content-b.js');
const { parseArticle } = require('../render-cases-article.js');
const { escape, icons } = S;
const ui = c.ui;

const { copy } = globalThis.INDICE_DATA;
const cases = c.solutions.find(solution => solution.id === 'cases').product;

const words = text => escape(text).split(' ')
  .map((word, index) => `<span class="pb-w" style="--w:${index}"><span>${word}</span></span>`).join(' ');

const masthead = () => `<header class="pb-masthead">
    <a class="pb-brand" href="proposal-b.html" aria-label="INDICE Platform overview">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
    <p class="pb-masthead-note">Cases technical reference</p>
    <div class="pb-masthead-actions">
      <button type="button" class="pb-theme" data-theme-toggle aria-pressed="true" aria-label="${ui.themeToggle}">${icons.sun}${icons.moon}</button>
      <a class="pb-contents-button pbr-back" href="proposal-b.html#spec-cases">${icons.arrowLeft}<span>Overview</span></a>
    </div>
  </header>`;

const hero = () => `<section class="pb-hero pbr-hero" id="hero" aria-labelledby="cases-title" tabindex="-1">
      <div class="pb-hero-main pbr-hero-main">
        <div class="pbr-logo">${themedLogo(cases)}</div>
        <p class="pb-kicker">Case management &amp; back-office workflows</p>
        <h1 id="cases-title">${words('Every case.')}<br>${words('A clear path forward.')}</h1>
        <p class="pb-lede">${escape(cases.description)}</p>
        <div class="pb-actions">${S.demoButton('pb-btn pb-btn-solid', copy.navigation.demo)}</div>
      </div>
      <p class="pbr-note"><span aria-hidden="true">//</span>One case, two views. A shared workflow, with a clear boundary between customer updates and internal work.</p>
    </section>`;

const reference = () => {
  const { body, contents, contentGroups } = parseArticle('cases-product.md');
  const toc = contentGroups.map(group => `<section class="cases-toc-group"><h3 class="cases-toc-category">${escape(group.title)}</h3><ul>${group.items.map(({ id, label }) => `<li><a class="cases-toc-link" href="#${id}">${escape(label)}</a></li>`).join('')}</ul></section>`).join('');
  return `<div class="pbr-layout">
      <aside class="cases-article-toc pbr-toc"><nav class="cases-toc-nav" aria-label="Technical reference sections"><h2 class="cases-toc-title">On this page</h2>${toc}</nav></aside>
      <article class="cases-article pbr-article" aria-labelledby="${contents[0].id}">${body}<p class="sr-only" id="chapter-copy-status" role="status" aria-live="polite" aria-atomic="true"></p></article>
    </div>`;
};

const dialog = () => `<dialog class="flowchart-dialog pbr-dialog" aria-labelledby="flowchart-dialog-title"><div class="flowchart-dialog-shell"><header class="flowchart-dialog-header"><div><p class="flowchart-dialog-eyebrow">Workflow diagram</p><h2 class="flowchart-dialog-title" id="flowchart-dialog-title"></h2></div><button class="flowchart-dialog-close" type="button" aria-label="Close diagram">${icons.close}</button></header><div class="flowchart-dialog-canvas" aria-live="polite"></div></div></dialog>`;

const colophon = () => `<footer class="pb-colophon pbr-colophon">
    <div class="pb-colophon-meta">
      <a class="pb-brand" href="proposal-b.html" aria-label="INDICE Platform overview">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
      <p>${escape(c.footer.note)}</p>
      <ul><li>${S.external(c.footer.github, 'GitHub')}</li></ul>
    </div>
  </footer>`;

module.exports = function renderProposalBReference() {
  const head = S.head({
    id: 'b',
    title: 'Cases technical reference — INDICE Platform · Proposal B',
    description: cases.description,
    defaultTheme: 'dark',
    themeColor: '#0f1115',
    mono: true,
    stylesheet: 'css/proposals/proposal-b.css'
  }).replace('</head>', `  <link rel="stylesheet" href="css/proposals/proposal-b-reference.css">
  <script defer src="https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js"></script>
  <script defer src="js/cases-article.js"></script>
</head>`);
  return `${head}
<body class="pb pb-reference">
  <a class="skip-link" href="#main">Skip to content</a>
  ${S.designRibbon('proposal-b')}
  <div class="pb-progress" data-progress aria-hidden="true"></div>
  ${masthead()}
  <main id="main" tabindex="-1">
    ${hero()}
    ${reference()}
  </main>
  ${colophon()}
  ${dialog()}
  ${S.githubTab('pb-gh').replace(`href="${c.footer.github}"`, `href="${githubRepo}"`)}
  ${S.backToTop('pb-to-top', `${icons.arrowUp}<span aria-hidden="true">${ui.backToTop}</span>`)}
</body>
</html>
`;
};
