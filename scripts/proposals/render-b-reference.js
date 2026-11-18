'use strict';

/* Proposal B's technical reference pages, one per solution with a product document (cases-product.md,
   iam-product.md, messaging-product.md, risk-product.md), set in Proposal B's editorial design. Each article comes from
   the parser of the original Cases reference (scripts/render-cases-article.js), and js/cases-article.js adds the
   contents highlighting, chapter links and the Mermaid diagrams. The Cases page keeps the text of cases-reference.html;
   only Proposal B links to these pages. */
const S = require('./shared.js');
const { content: c, themedLogo, githubRepo, referencePages } = require('./content-b.js');
const { parseArticle } = require('../render-cases-article.js');
const { escape, icons } = S;
const ui = c.ui;

/* The hero of each page: the solution's title and description from js/data.js, a category line and a one-line note
   taken from its product document. */
const heroes = {
  cases: {
    source: 'cases-product.md',
    kicker: 'Case management & back-office workflows',
    note: 'One case, two views. A shared workflow, with a clear boundary between customer updates and internal work.'
  },
  iam: {
    source: 'iam-product.md',
    kicker: 'Identity & access management',
    note: 'Workforce, partners and customers sign in through the same pipeline, are audited by the same logs and follow the same MFA and device-trust rules.'
  },
  messaging: {
    source: 'messaging-product.md',
    kicker: 'Multichannel messaging & campaigns',
    note: 'Marketing broadcasts and transactional messages (OTPs, receipts, alerts) run through the same pipeline, with the same templates, audiences and analytics.'
  },
  risk: {
    source: 'risk-product.md',
    kicker: 'Risk assessment for transactions & customer activity',
    note: 'One engine for every application: web banking, mobile, payments and identity flows all call the same API and follow the same policy.'
  }
};

const words = text => escape(text).split(' ')
  .map((word, index) => `<span class="pb-w" style="--w:${index}"><span>${word}</span></span>`).join(' ');

const masthead = (s) => `<header class="pb-masthead">
    <a class="pb-brand" href="index.html" aria-label="INDICE Platform overview">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
    <p class="pb-masthead-note">${escape(s.name)} technical reference</p>
    <div class="pb-masthead-actions">
      <button type="button" class="pb-theme" data-theme-toggle aria-pressed="true" aria-label="${ui.themeToggle}">${icons.sun}${icons.moon}</button>
      <a class="pb-contents-button pbr-back" href="index.html#spec-${s.id}">${icons.arrowLeft}<span>Overview</span></a>
    </div>
  </header>`;

/* The solution's title, e.g. "Every case. A clear path forward.", set one sentence per line. */
const titleLines = title => title.split(/(?<=\.)\s+/).map(words).join('<br>');
const hero = (s, { kicker, note }) => `<section class="pb-hero pbr-hero" id="hero" aria-labelledby="${s.id}-title" tabindex="-1">
      <div class="pb-hero-main pbr-hero-main">
        <div class="pbr-logo">${themedLogo(s.product)}</div>
        <p class="pb-kicker">${escape(kicker)}</p>
        <h1 id="${s.id}-title">${titleLines(s.product.title)}</h1>
        <p class="pb-lede">${escape(s.product.description)}</p>
      </div>
      <p class="pbr-note"><span aria-hidden="true">//</span>${escape(note)}</p>
    </section>`;

const developersId = 'article-for-developers';
const reference = source => {
  // Tall top-to-bottom diagrams are drawn smaller (in Cases, that is the second diagram, as on the original page).
  const { body: fullBody, contents, contentGroups } = parseArticle(source, { compactDiagram: (index, orientation) => orientation === 'vertical' });
  // Proposal B leaves out the "For developers" chapter (its heading and one-line intro); the developer chapters follow
  // straight after "3. Where Cases shines". Overview sits on its own above the groups. Anchors are unchanged.
  // The chapter table at the top lists both columns of chapters in the same style.
  const body = fullBody.replace(new RegExp(`<h2 id="${developersId}"[\\s\\S]*?(?=<h3 )`), '')
    .replace(/<div class="article-table"(?=[^>]*>\s*<table><thead><tr><th scope="col">[^<]*The product<\/th>)/, '<div class="article-table pbr-chapter-table"')
    // Links to companion documents that are not published here (e.g. Templates.md) keep their text only.
    .replace(/<a href="(?:\.\/)?[^"/]+\.md">([\s\S]*?)<\/a>/g, '$1');
  const groupTitles = { Product: 'The product', 'Developer reference': 'For developers' };
  const [overview, ...groups] = contentGroups.map(group => ({
    ...group, title: groupTitles[group.title] || group.title, items: group.items.filter(item => item.id !== developersId)
  }));
  const link = ({ id, label }) => `<li><a class="cases-toc-link" href="#${id}">${escape(label)}</a></li>`;
  const toc = `<ul class="pbr-toc-overview">${link(overview.items[0])}</ul>`
    + [{ ...overview, items: overview.items.slice(1) }, ...groups]
      .map(group => `<section class="cases-toc-group"><h3 class="cases-toc-category">${escape(group.title)}</h3><ul>${group.items.map(link).join('')}</ul></section>`).join('');
  return `<div class="pbr-layout">
      <aside class="cases-article-toc pbr-toc"><nav class="cases-toc-nav" aria-label="Technical reference sections"><h2 class="cases-toc-title">On this page</h2>${toc}</nav></aside>
      <article class="cases-article pbr-article" aria-labelledby="${contents[0].id}">${body}<p class="sr-only" id="chapter-copy-status" role="status" aria-live="polite" aria-atomic="true"></p></article>
    </div>`;
};

const dialog = () => `<dialog class="flowchart-dialog pbr-dialog" aria-labelledby="flowchart-dialog-title"><div class="flowchart-dialog-shell"><header class="flowchart-dialog-header"><div><p class="flowchart-dialog-eyebrow">Workflow diagram</p><h2 class="flowchart-dialog-title" id="flowchart-dialog-title"></h2></div><button class="flowchart-dialog-close" type="button" aria-label="Close diagram">${icons.close}</button></header><div class="flowchart-dialog-canvas" aria-live="polite"></div></div></dialog>`;

const colophon = () => `<footer class="pb-colophon pbr-colophon">
    <div class="pb-colophon-meta">
      <a class="pb-brand" href="index.html" aria-label="INDICE Platform overview">${S.wordmark('pb-wordmark')}<span class="pb-brand-name" aria-hidden="true">Platform</span></a>
      <p>${escape(c.footer.note)}</p>
      <ul><li>${S.external(c.footer.github, 'GitHub')}</li></ul>
    </div>
  </footer>`;

const render = id => () => {
  const s = c.solutions.find(solution => solution.id === id);
  const page = heroes[id];
  const head = S.head({
    id: 'b',
    title: `${s.name} technical reference — INDICE Platform · Proposal B`,
    description: s.product.description,
    defaultTheme: 'dark',
    themeColor: '#0f1115',
    mono: true,
    stylesheet: 'css/proposals/proposal-b.css'
  }).replace('</head>', `  <link rel="stylesheet" href="css/proposals/proposal-b-reference.css">
  <script defer src="https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js"></script>
  <script defer src="js/cases-article.js"></script>
</head>`);
  return `${head}
<body class="pb pb-reference" style="--tone:${s.product.color}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${S.designRibbon('proposal-b')}
  <div class="pb-progress" data-progress aria-hidden="true"></div>
  ${masthead(s)}
  <main id="main" tabindex="-1">
    ${hero(s, page)}
    ${reference(page.source)}
  </main>
  ${colophon()}
  ${dialog()}
  ${S.githubTab('pb-gh').replace(`href="${c.footer.github}"`, `href="${githubRepo}"`)}
  ${S.backToTop('pb-to-top', `${icons.arrowUp}<span aria-hidden="true">${ui.backToTop}</span>`)}
</body>
</html>
`;
};

/* Page file → renderer, for scripts/proposals/build.js. */
module.exports = {
  pages: Object.fromEntries(Object.keys(heroes).map(id => [referencePages[id], render(id)])),
  sources: Object.fromEntries(Object.entries(heroes).map(([id, page]) => [id, page.source]))
};
