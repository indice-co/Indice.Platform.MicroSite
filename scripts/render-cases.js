const fs = require('node:fs');
const path = require('node:path');
const { escape, arrow, demo, logo, navigation } = require('./shared.js');

module.exports = function renderCases() {
  const { config, products, casesPage } = globalThis.INDICE_DATA;
  const cases = products.find(product => product.id === 'cases');
  for (const asset of [casesPage.detailScreenshot, casesPage.guide].filter(Boolean)) {
    if (!fs.existsSync(path.join(__dirname, '..', asset))) throw new Error(`Missing Cases asset: ${asset}`);
  }
  const guide = id => casesPage.guide
    ? `<a class="text-link" href="${escape(casesPage.guide)}" download>Download the Cases product guide${arrow}</a>`
    : `<div class="cases-guide"><button class="text-link" type="button" disabled aria-describedby="${id}">Download the Cases product guide</button><p id="${id}">PDF pending &mdash; download not yet available.</p></div>`;
  const top = (label, number) => `<div class="section-top"><span class="eyebrow">${label}</span><span class="section-number" aria-hidden="true">${number} /</span></div>`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#DEDAD0">
  <meta name="description" content="${escape(cases.description)}">
  <title>INDICE Cases &mdash; Every case. A clear path forward.</title>
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/cases.css">
  <script defer src="js/data.js"></script>
  <script defer src="js/main.js"></script>
</head>
<body class="cases-page" style="--cases-color:${cases.color}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <a class="hero-brand" id="hero-brand" href="index.html" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" fetchpriority="high"></a>
  <main id="main-content" tabindex="-1">
    <section class="cases-hero section-pad" id="cases-hero" aria-labelledby="cases-title">
      <div class="cases-hero-layout">
        <div data-reveal>
          ${logo(cases)}
          <p class="eyebrow cases-category">Case management &amp; back-office workflows</p>
          <h1 id="cases-title">Every case.<br>A clear path forward.</h1>
          <p class="cases-lead">${escape(cases.description)}</p>
          <div class="actions">${demo()}</div>
        </div>
        <figure class="cases-detail" data-reveal style="--reveal-index:1">
          ${casesPage.detailScreenshot
    ? `<img src="${escape(casesPage.detailScreenshot)}" alt="INDICE Cases case detail showing the timeline and available actions">`
    : `<div class="cases-detail-placeholder"><span class="cases-placeholder-label">Case detail screenshot &mdash; awaiting approved asset</span><div class="cases-preview-heading"><span>Case timeline</span><span>Available actions</span></div><div class="cases-preview-body" aria-hidden="true"><div class="cases-preview-timeline"><i></i><i></i><i></i></div><div class="cases-preview-actions"><i></i><i></i></div></div></div>`}
          <figcaption>${casesPage.detailScreenshot ? 'Case detail: timeline and available actions.' : 'Layout placeholder only, not a product screenshot. The supplied dashboard does not show case detail.'}</figcaption>
        </figure>
      </div>
      <p class="cases-hero-note">One case, two views. A shared workflow, with a clear boundary between customer updates and internal work.</p>
    </section>

    <section class="cases-section section-pad" id="cases-challenge" aria-labelledby="challenge-title">
      ${top('The challenge', '01')}
      <div class="cases-intro" data-reveal><h2 id="challenge-title">Clear updates.<br>Space to work privately.</h2><div><p>Requests move between teams and approvals while customers need clear status updates and staff need space to work privately.</p><p>Customers see published updates while internal review steps and notes stay private.</p></div></div>
    </section>

    <section class="cases-section cases-work section-pad" id="cases-how" aria-labelledby="how-title">
      ${top('How it works', '02')}
      <div class="cases-intro" data-reveal><h2 id="how-title">One case, two views.</h2><div><p>Customers can submit requests through a connected website or app, and staff can open cases on their behalf. Both routes feed into the same workflow.</p></div></div>
      <div class="cases-flow" data-reveal>
        <div class="cases-intake"><div><span class="cases-small">01 / Customer submission</span><h3>Connected website or app</h3></div><div><span class="cases-small">02 / Staff-assisted intake</span><h3>Opened on the customer's behalf</h3></div></div>
        <p class="cases-merge"><span aria-hidden="true">&darr;</span> One shared workflow <span aria-hidden="true">&darr;</span></p>
        <ol class="cases-steps" aria-label="Shared case workflow">${['Assignment', 'Review', 'Decision', 'Customer update'].map((step,i) => `<li><span class="cases-small" aria-hidden="true">0${i+1}</span><span>${step}</span></li>`).join('')}</ol>
      </div>
      <div class="cases-views" data-reveal>
        <article class="cases-view cases-customer"><p class="cases-small">Customer view / connected application</p><div class="cases-app-frame"><span class="cases-app-header">Your organisation's website or app</span><h3>Your request</h3><span class="cases-status">In progress</span><p>Published updates and customer-visible information.</p></div></article>
        <article class="cases-view"><p class="cases-small">Staff view / Cases back office</p><div class="cases-app-frame"><span class="cases-app-header">INDICE Cases</span><h3>Internal review</h3><span class="cases-status cases-private">Pending second approval</span><p>Internal review steps and private notes stay with staff.</p></div></article>
      </div>
      <p class="cases-caption">Illustrative views, not product screenshots. The customer view belongs to a connected application; it is not a standalone Cases customer portal.</p>
    </section>

    <section class="cases-section section-pad" id="cases-capabilities" aria-labelledby="capabilities-title">
      ${top('Key capabilities', '03')}
      <h2 id="capabilities-title" data-reveal">The tools behind a clear path.</h2>
      <div class="cases-capabilities">${[
        ['Configurable forms and workflows', 'Shape forms, workflow steps and available actions around each case type.'],
        ['Assignment and independent approvals', 'Route work to staff and require a different person to review and approve it.'],
        ['Controlled visibility and access', 'Keep internal steps and notes private. Customers see published updates; staff access follows their permissions.'],
        ['Case history and workload visibility', 'Follow the case timeline, data versions, comments and attachments. Use case lists and reports to understand the work in hand.']
      ].map(([title, text],i) => `<article data-reveal style="--reveal-index:${i%2}"><span class="cases-small" aria-hidden="true">0${i+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
    </section>

    <section class="cases-section cases-scenarios section-pad" id="cases-fit" aria-labelledby="fit-title">
      ${top('Where it fits', '04')}
      <h2 id="fit-title" data-reveal">Different starting points.<br>The same clarity.</h2>
      <div class="cases-scenario-grid">${[
        ['Customer requests and applications', 'A customer submits a request through a connected website or mobile app and follows published progress.'],
        ['Requests opened by branch or call-centre staff', "A staff member opens a case on the customer's behalf, bringing assisted intake into the same process."],
        ['Processes that require independent review and approval', 'One person prepares the case; another reviews and approves it. Internal approval states stay private.']
      ].map(([title, text],i) => `<article data-reveal style="--reveal-index:${i}"><span class="cases-small">Illustrative scenario / 0${i+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
    </section>

    <section class="cases-section section-pad" id="cases-deployment" aria-labelledby="deployment-title">
      ${top('Deployment and integration', '05')}
      <div class="cases-intro" data-reveal><h2 id="deployment-title">Your environment.<br>A connected experience.</h2><div><p>Cases runs in the organisation's own environment. Customer-facing websites and apps connect to Cases; staff use the back-office interface.</p><p>Detailed architecture, APIs, configuration and code examples belong in the downloadable product guide.</p>${guide('deployment-guide-note')}</div></div>
    </section>

    <section class="cases-final section-pad" id="cases-demo" aria-labelledby="demo-title">
      <div data-reveal><p class="eyebrow">INDICE Cases</p><h2 id="demo-title">Every case.<br>A clear path forward.</h2><div class="cases-final-actions">${demo('button-light')}${guide('final-guide-note')}</div></div>
    </section>
  </main>
  <footer class="site-footer"><a href="index.html" aria-label="INDICE Platform home"><img src="${escape(config.logo)}" width="1490" height="400" alt="INDICE Platform" loading="lazy"></a></footer>
  ${navigation('index.html')}
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, '../cases.html'), html, 'utf8');
  console.log('Rendered INDICE Cases product page.');
};
