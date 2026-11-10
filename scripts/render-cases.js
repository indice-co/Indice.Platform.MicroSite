const fs = require('node:fs');
const path = require('node:path');
const { escape, arrow, demo, logo, navigation } = require('./shared.js');

module.exports = function renderCases(article) {
  const { config, products, casesPage } = globalThis.INDICE_DATA;
  const cases = products.find(product => product.id === 'cases');
  const slashPath = fs.readFileSync(path.join(__dirname, '../assets/logos/INDICE_slashes.svg'), 'utf8')
    .match(/<path\b[^>]*\/>/g)[1].replace('fill="white"', 'fill="currentColor"');
  for (const asset of [casesPage.detailScreenshot, casesPage.guide].filter(Boolean)) {
    if (!fs.existsSync(path.join(__dirname, '..', asset))) throw new Error(`Missing Cases asset: ${asset}`);
  }
  const guide = id => casesPage.guide
    ? `<a class="text-link" href="${escape(casesPage.guide)}" download>Download the Cases product guide${arrow}</a>`
    : `<div class="cases-guide"><button class="text-link" type="button" disabled aria-describedby="${id}">Download the Cases product guide</button><p id="${id}">PDF pending &mdash; download not yet available.</p></div>`;
  const top = (label, number) => `<div class="section-top"><span class="eyebrow">${label}</span><span class="section-number" aria-hidden="true">${number} /</span></div>`;
  const icons = [
    '<rect x="7" y="5" width="26" height="30" rx="3"/><path d="M13 13h14M13 20h8M13 27h14"/><path d="m27 19 5 5 8-9"/>',
    '<circle cx="13" cy="12" r="5"/><circle cx="31" cy="12" r="5"/><path d="M4 31v-4a9 9 0 0 1 18 0v4M25 22h12M31 16v12"/>',
    '<path d="m22 3 14 6v11c0 10-14 17-14 17S8 30 8 20V9Z"/><rect x="16" y="17" width="12" height="10" rx="2"/><path d="M18 17v-3a4 4 0 0 1 8 0v3"/>',
    '<path d="M7 5v30h30M14 28V18M23 28V10M32 28V15"/><circle cx="14" cy="13" r="2"/><path d="m12 7-5-2"/>'
  ];
  const icon = index => `<svg class="cases-icon" viewBox="0 0 44 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[index]}</svg>`;
  const capabilityArt = index => `<div class="cases-capability-art cases-art-${index}" aria-hidden="true">${icon(index)}<div class="cases-art-lines"><i></i><i></i><i></i></div><span class="cases-art-node">${index === 1 ? '&#10003;' : index === 2 ? '&#9679;' : '0' + (index + 1)}</span></div>`;
  const capabilities = [
    ['Configurable forms and workflows', 'Shape forms, workflow steps and available actions around each case type.'],
    ['Assignment and independent approvals', 'Route work to staff and require a different person to review and approve it.'],
    ['Controlled visibility and access', 'Keep internal steps and notes private. Customers see published updates; staff access follows their permissions.'],
    ['Case history and workload visibility', 'Follow the case timeline, data versions, comments and attachments. Use case lists and reports to understand the work in hand.']
  ];
  let html = `<!doctype html>
  <html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#DEDAD0">
  <meta name="description" content="${escape(cases.description)}">
  <title>Cases &mdash; Every case. A clear path forward.</title>
  <link rel="icon" type="image/svg+xml" href="${escape(config.logoIcon)}">
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/cases.css">
  <script defer src="js/data.js"></script>
  <script defer src="js/main.js"></script>
  <script defer src="js/cases-art.js"></script>
  <script defer src="js/cases-tabs.js"></script>
</head>
<body class="cases-page" style="--cases-color:${cases.color};--cases-gold:${cases.accent}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <a class="hero-brand" id="hero-brand" href="index.html" data-top-href="#cases-hero" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" fetchpriority="high"></a>
  <main id="main-content" tabindex="-1">
    <nav class="cases-page-links" aria-label="On this page"><a href="#cases-how">How it works</a><a href="#cases-capabilities">Capabilities</a><a href="#cases-fit">Where it fits</a><a href="#cases-deployment">Deployment</a></nav>
    <section class="cases-hero section-pad" id="cases-hero" aria-labelledby="cases-title">
      <div class="cases-hero-layout">
        <div data-reveal>
          ${logo(cases)}
          <p class="eyebrow cases-category">Case management &amp; back-office workflows</p>
          <h1 id="cases-title">Every case.<br>A clear path forward.</h1>
          <p class="cases-lead">${escape(cases.description)}</p>
          <div class="actions">${demo()}</div>
        </div>
        <div class="cases-hero-visual" data-reveal style="--reveal-index:1">
        <div class="cases-visual-grid" aria-hidden="true"></div>
        <svg class="cases-hero-slash" width="124.6" height="201.7" viewBox="0 0 124.6 201.7" aria-hidden="true">${slashPath}</svg>
        <figure class="cases-detail">
          <div class="cases-window-bar" aria-hidden="true"><span></span><span></span><span></span><span>Cases</span></div>
          ${casesPage.detailScreenshot
    ? `<img src="${escape(casesPage.detailScreenshot)}" alt="Cases case detail showing the timeline and available actions">`
    : `<div class="cases-detail-placeholder"><span class="cases-placeholder-label">Case detail screenshot &mdash; awaiting approved asset</span><div class="cases-screen-title"><div><span class="cases-small">Illustrative case / 0248</span><strong>Customer request</strong></div><span class="cases-status">In progress</span></div><div class="cases-screen-progress"><div class="cases-progress-track" aria-hidden="true"><span></span></div><ol aria-label="Illustrative workflow stages"><li>Assigned</li><li>In review</li><li>Decision</li></ol></div><div class="cases-preview-heading"><span>Case timeline</span><span>Available actions</span></div><div class="cases-preview-body"><ol class="cases-screen-timeline"><li><strong>Request received</strong><span>Customer submission</span></li><li><strong>Assigned to a team</strong><span>Internal review</span></li><li><strong>Pending second approval</strong><span>Private checkpoint</span></li></ol><div class="cases-screen-actions"><details><summary>Review case</summary><p>Illustration only. Staff review the case before a decision.</p></details><details><summary>View history</summary><p>The timeline keeps case updates and internal steps together.</p></details><span class="cases-screen-private">Staff view &middot; Internal notes stay private</span></div></div></div>`}
          <figcaption>${casesPage.detailScreenshot ? 'Case detail: timeline and available actions.' : 'Layout placeholder only, not a product screenshot. The supplied dashboard does not show case detail.'}</figcaption>
        </figure>
        <div class="cases-hero-update"><span class="cases-update-dot" aria-hidden="true"></span><div><span class="cases-small">Illustrative customer update</span><strong>In progress</strong><span>In your connected application</span></div></div>
        <div class="cases-art-badge" aria-hidden="true">${icon(2)}<span>One case.<br>Controlled visibility.</span></div>
        </div>
      </div>
      <p class="cases-hero-note"><span class="cases-note-mark" aria-hidden="true">//</span>One case, two views. A shared workflow, with a clear boundary between customer updates and internal work.</p>
    </section>

    <section class="cases-section section-pad" id="cases-challenge" aria-labelledby="challenge-title">
      ${top('The challenge', '01')}
      <div class="cases-intro" data-reveal><h2 id="challenge-title">Clear updates.<br>Space to work privately.</h2><ol class="cases-challenge-points" role="list"><li><span aria-hidden="true">01</span><p>Requests move between teams and approvals while customers need clear status updates and staff need space to work privately.</p></li><li><span aria-hidden="true">02</span><p>Customers see published updates while internal review steps and notes stay private.</p></li></ol></div>
    </section>

    <section class="cases-section cases-work section-pad" id="cases-how" aria-labelledby="how-title">
      ${top('How it works', '02')}
      <div class="cases-intro" data-reveal><h2 id="how-title">One case, two views.</h2><div><p>Customers can submit requests through a connected website or app, and staff can open cases on their behalf. Both routes feed into the same workflow.</p></div></div>
      <div class="cases-flow" data-reveal>
        <div class="cases-intake"><div>${icon(0)}<span class="cases-small">01 / Customer submission</span><h3>Connected website or app</h3></div><div>${icon(1)}<span class="cases-small">02 / Staff-assisted intake</span><h3>Opened on the customer's behalf</h3></div></div>
        <p class="cases-merge"><span aria-hidden="true">&darr;</span> One shared workflow <span aria-hidden="true">&darr;</span></p>
        <ol class="cases-steps" aria-label="Shared case workflow">${['Assignment', 'Review', 'Decision', 'Customer update'].map((step,i) => `<li><span class="cases-small" aria-hidden="true">0${i+1}</span><span>${step}</span></li>`).join('')}</ol>
      </div>
      <div class="cases-views" data-reveal>
        <article class="cases-view cases-customer"><p class="cases-small">Customer view / connected application</p><div class="cases-app-frame"><span class="cases-app-header">Your organisation's website or app</span><h3>Your request</h3><span class="cases-status">In progress</span><p>Published updates and customer-visible information.</p></div></article>
        <article class="cases-view"><p class="cases-small">Staff view / Cases back office</p><div class="cases-app-frame"><span class="cases-app-header">Cases</span><h3>Internal review</h3><span class="cases-status cases-private">Pending second approval</span><p>Internal review steps and private notes stay with staff.</p></div></article>
      </div>
      <p class="cases-caption">Illustrative views, not product screenshots. The customer view belongs to a connected application; it is not a standalone Cases customer portal.</p>
    </section>

    <section class="cases-section section-pad" id="cases-capabilities" aria-labelledby="capabilities-title">
      ${top('Key capabilities', '03')}
      <h2 id="capabilities-title" data-reveal">The tools behind a clear path.</h2>
      <div class="cases-capabilities">
        <div class="cases-capability-tabs" role="tablist" aria-label="Key capabilities" aria-orientation="vertical" hidden>${capabilities.map(([title],i) => `<button type="button" role="tab" id="capability-tab-${i}" aria-controls="capability-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span aria-hidden="true">0${i+1}</span><span>${title}</span></button>`).join('')}</div>
        <div class="cases-capability-panels">${capabilities.map(([title, text],i) => `<article id="capability-panel-${i}">${capabilityArt(i)}<div class="cases-capability-copy"><span class="cases-small" aria-hidden="true">0${i+1}</span><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div>
      </div>
    </section>

    <section class="cases-section cases-scenarios section-pad" id="cases-fit" aria-labelledby="fit-title">
      ${top('Where it fits', '04')}
      <h2 id="fit-title" data-reveal">Different starting points.<br>The same clarity.</h2>
      <div class="cases-scenario-grid">${[
        ['Customer requests and applications', 'A customer submits a request through a connected website or mobile app and follows published progress.'],
        ['Requests opened by branch or call-centre staff', "A staff member opens a case on the customer's behalf, bringing assisted intake into the same process."],
        ['Processes that require independent review and approval', 'One person prepares the case; another reviews and approves it. Internal approval states stay private.']
      ].map(([title, text],i) => `<article data-reveal style="--reveal-index:${i}">${icon(i)}<span class="cases-small">Illustrative scenario / 0${i+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
    </section>

    <section class="cases-section section-pad" id="cases-deployment" aria-labelledby="deployment-title">
      ${top('Deployment and integration', '05')}
      <div class="cases-intro" data-reveal><h2 id="deployment-title">Your environment.<br>A connected experience.</h2><div><p>Cases runs in the organisation's own environment. Customer-facing websites and apps connect to Cases; staff use the back-office interface.</p><p>Detailed architecture, APIs, configuration and code examples belong in the downloadable product guide.</p>${guide('deployment-guide-note')}</div></div>
      <div class="cases-deployment-map" data-reveal aria-label="Customer applications connect to Cases in your organisation's environment; staff use the back-office interface."><div class="cases-map-app">${icon(0)}<span>Connected website or app</span></div><span class="cases-map-connector" aria-hidden="true">&rarr;</span><div class="cases-map-environment"><span class="cases-small">Your organisation's environment</span><div class="cases-map-products"><div>${logo(cases)}<span>Shared case workflow</span></div><span class="cases-map-divider" aria-hidden="true">&harr;</span><div>${icon(1)}<span>Staff back office</span></div></div></div></div>
    </section>

    <section class="cases-final section-pad" id="cases-demo" aria-labelledby="demo-title">
      <div data-reveal><p class="eyebrow">Cases</p><h2 id="demo-title">Every case.<br>A clear path forward.</h2><div class="cases-final-actions">${demo('button-light')}${guide('final-guide-note')}</div></div>
    </section>
  </main>
  <footer class="site-footer"><a href="index.html" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" loading="lazy"></a></footer>
  ${article ? '' : navigation('index.html')}
</body>
</html>
`;
  if (article) {
    html = html.replace('<html lang="en">', '<html lang="en" class="cases-reference-page">')
      .replace('<title>Cases &mdash;', `<title>${escape(article.title)} &mdash;`)
      .replace('<body class="cases-page"', '<body class="cases-page cases-article-page"')
      .replace('  <script defer src="js/cases-tabs.js"></script>', '  <script defer src="https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js"></script>\n  <script defer src="js/cases-article.js"></script>')
      .replace('</head>', '  <link rel="stylesheet" href="css/cases-article.css">\n</head>')
      .replace(/<nav class="cases-page-links"[^>]*>[\s\S]*?<\/nav>/, article.navigation)
      .replace(/    <section class="cases-section[\s\S]*?(?=  <\/main>)/, article.html);
  }
  fs.writeFileSync(path.join(__dirname, `../${article.filename}`), html, 'utf8');
  console.log(`Rendered ${article.title}.`);
};
