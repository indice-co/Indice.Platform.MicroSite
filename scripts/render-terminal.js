'use strict';

/* Design 2 — "Terminal": a dark IDE shell. Pre-rendered; js/terminal.js only enhances it. */
const fs = require('node:fs');
const path = require('node:path');
const content = require('./tech-content.js');
const { highlight, escapeHtml } = require('./highlight.js');
const { designRibbon, escape } = require('./shared.js');

const { links, pillars, intro, tech, suite, pendingProducts, foundation, expertise, relations, contact } = content;
const techById = Object.fromEntries(tech.map(item => [item.id, item]));
const svgSize = file => {
  const [, width, height] = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return `width="${width}" height="${height}"`;
};

const placeholder = (label, title = 'Placeholder: no link provided yet') =>
  `<span class="ph" role="link" aria-disabled="true" title="${escape(title)}">${escape(label)}<small>placeholder</small></span>`;
const external = (href, label) => `<a class="ext" href="${escape(href)}" rel="noopener" target="_blank">${escape(label)}<span class="sr-only"> (opens in a new tab)</span></a>`;

function codeBlock({ file, language, source }) {
  const lines = highlight(language, source).split('\n').map(line => `<span class="line">${line || ' '}</span>`).join('\n');
  return `<figure class="codeblock">
          <figcaption><span class="file">${escape(file)}</span><span class="lang">${escape(language === 'jsonc' ? 'json' : 'c#')}</span></figcaption>
          <pre class="code" tabindex="0"><code>${lines}</code></pre>
        </figure>`;
}

const dl = rows => `<dl class="kv">${rows.map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;

const matrixTable = () => `<div class="scroll" role="region" aria-label="Product dependency matrix" tabindex="0">
        <table class="matrix">
          <caption>Documented stack per product. ● part of the stack · ○ optional or replaceable</caption>
          <thead><tr><th scope="col">product</th>${tech.map(item => `<th scope="col">${escape(item.matrix)}</th>`).join('')}</tr></thead>
          <tbody>${suite.map(product => `<tr><th scope="row"><img src="${escape(product.icon)}" alt="" width="16" height="16"> ${escape(product.name.toLowerCase())}</th>${tech.map(item => {
    const level = product.uses[item.id];
    return `<td class="${level || 'none'}">${level === 'req' ? '<span aria-hidden="true">●</span><span class="sr-only">used</span>' : level === 'opt' ? '<span aria-hidden="true">○</span><span class="sr-only">optional</span>' : '<span aria-hidden="true">·</span><span class="sr-only">not used</span>'}</td>`;
  }).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;

const riskDemo = `<div class="demo" id="risk-demo">
          <h4>Try the aggregation <span class="dim">(ranges from the template: Low 1–1000 · Medium 1001–2000 · High 2001–3000)</span></h4>
          <form class="demo-form" onsubmit="return false">
            <label>Amount rule score <input id="risk-a" type="number" min="0" max="3000" value="800" inputmode="numeric"></label>
            <label>New-country rule score <input id="risk-b" type="number" min="0" max="3000" value="1500" inputmode="numeric"></label>
            <fieldset>
              <legend>Aggregation</legend>
              <label><input type="radio" name="risk-mode" value="sum" checked> Sum</label>
              <label><input type="radio" name="risk-mode" value="maximum"> Maximum</label>
            </fieldset>
          </form>
          <p class="demo-out" aria-live="polite"><span class="dim">result →</span> <output id="risk-out">2300 · High</output></p>
          <p class="dim demo-note">With Sum, two moderate signals reach High. With Maximum, only the strongest single rule counts (1500 · Medium). Documented example; the rules here are illustrative.</p>
        </div>`;

function productPanel(product, index) {
  const docs = product.docs.href
    ? `<a class="doc-link" href="${escape(product.docs.href)}">${escape(product.docs.label)} →</a>`
    : placeholder(product.docs.label, 'Placeholder: this product’s technical reference page does not exist yet');
  return `<section class="product" id="${product.id}" tabindex="-1" data-product="${product.id}">
      <header class="product-head">
        <span class="plate"><img src="${escape(product.logo)}" ${svgSize(product.logo)} alt="${escape(product.name)}" loading="lazy" decoding="async"></span>
        <p class="tagline">${escape(product.tagline)}</p>
        <p class="meta"><span class="chip">base unit · ${escape(product.baseUnit.toLowerCase())}</span>${docs}</p>
      </header>
      <p class="summary">${escape(product.summary)}</p>
      <h4 class="sub">What it does</h4>
      <ul class="hl">${product.highlights.map(([title, text]) => `<li><b>${escape(title)}</b><span>${escape(text)}</span></li>`).join('')}</ul>
      <div class="cols">
        <div><h4 class="sub">Hosting</h4>${dl(product.hosting)}</div>
        <div><h4 class="sub">Stack</h4><ul class="chips">${tech.filter(item => product.uses[item.id]).map(item => `<li class="${product.uses[item.id]}">${escape(item.label)}${product.uses[item.id] === 'opt' ? ' <small>optional</small>' : ''}</li>`).join('')}</ul></div>
      </div>
      <h4 class="sub">Endpoints</h4>
      <div class="scroll" role="region" aria-label="${escape(product.name)} endpoints" tabindex="0"><table class="endpoints"><thead><tr><th scope="col">method</th><th scope="col">path</th><th scope="col">purpose</th></tr></thead><tbody>${product.endpoints.map(([method, route, purpose]) => `<tr><td><span class="verb verb-${method === '*' ? 'any' : method.toLowerCase()}">${escape(method)}</span></td><td><code>${escape(route)}</code></td><td>${escape(purpose)}</td></tr>`).join('')}</tbody></table></div>
      <h4 class="sub">Code</h4>
      ${product.code.map(codeBlock).join('\n      ')}
      ${product.id === 'risk' ? riskDemo : ''}
      <h4 class="sub">Extension points <span class="dim">C# interfaces, not a DSL</span></h4>
      <ul class="seams">${product.seams.map(([name, description]) => `<li><code>${escape(name)}</code><span>${escape(description)}</span></li>`).join('')}</ul>
    </section>`;
}

const pendingPanel = product => `<section class="product" id="${product.id}" tabindex="-1" data-product="${product.id}">
      <header class="product-head">
        <span class="plate plate-ph" role="img" aria-label="${escape(product.name)} logo placeholder"><span>${escape(product.name)} logo</span></span>
        <p class="tagline">${escape(product.name)}</p>
        <p class="meta"><span class="chip">no product document yet</span>${placeholder('Technical reference', 'Placeholder: no document or page exists yet')}</p>
      </header>
      <p class="summary">${escape(product.note)}</p>
    </section>`;

const explorerLink = (href, label, extra = '') => `<a href="${href}" data-spy-link="${href.slice(1)}"${extra}>${label}</a>`;
const productIcon = product => `<img src="${escape(product.icon)}" alt="" width="14" height="14">`;

function render() {
  const [foundationPillar, suitePillar, expertisePillar] = pillars;
  const typed = text => `<span class="typed">${escape(text)}</span>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0a0d12">
  <meta name="description" content="${escape(intro)}">
  <title>INDICE Platform — Terminal</title>
  <link rel="preload" href="assets/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/design-ribbon.css">
  <link rel="stylesheet" href="css/terminal.css">
  <script>document.documentElement.classList.add('js')</script>
  <script defer src="js/terminal.js"></script>
</head>
<body class="tm">
  <a class="skip-link" href="#main">Skip to content</a>
  ${designRibbon('terminal')}
  <div class="ide">
    <header class="titlebar">
      <button class="explorer-toggle" type="button" aria-controls="explorer" aria-expanded="false"><span aria-hidden="true">☰</span><span class="sr-only">Toggle explorer</span></button>
      <a class="brand" href="#top" aria-label="INDICE Platform"><img src="assets/logos/indice platform white.svg" width="1490" height="400" alt="INDICE Platform"></a>
      <nav class="filetabs" aria-label="Pillars">${pillars.map(pillar => `<a href="#${pillar.id}" data-spy-link="${pillar.id}"><span class="no">${pillar.number}</span>${pillar.id}.md</a>`).join('')}</nav>
      <button class="palette-open" type="button" aria-haspopup="dialog" aria-controls="palette"><span>Go to…</span><kbd>Ctrl K</kbd></button>
    </header>
    <div class="shell">
      <aside class="explorer" id="explorer" aria-label="Explorer">
        <p class="explorer-title">Explorer</p>
        <nav aria-label="Page outline">
          <ul class="tree">
            <li class="dir"><span>indice-platform</span>
              <ul>
                <li class="dir"><span>01-foundation</span><ul>
                  <li>${explorerLink('#foundation', 'overview.md')}</li>
                  <li>${explorerLink('#libraries', 'libraries.md')}</li>
                  <li>${explorerLink('#stack', 'stack.yaml')}</li>
                  <li>${explorerLink('#practices', 'practices.md')}</li>
                </ul></li>
                <li class="dir"><span>02-suite</span><ul>
                  ${suite.map(product => `<li>${explorerLink('#' + product.id, `${productIcon(product)}${product.id}/`, ` data-product-link="${product.id}"`)}</li>`).join('\n                  ')}
                  ${pendingProducts.map(product => `<li>${explorerLink('#' + product.id, `<span class="ico-ph" aria-hidden="true"></span>${product.id}/`, ` data-product-link="${product.id}"`)}</li>`).join('\n                  ')}
                  <li>${explorerLink('#relations', 'relations.md')}</li>
                  <li>${explorerLink('#matrix', 'matrix.md')}</li>
                </ul></li>
                <li class="dir"><span>03-expertise</span><ul>
                  <li>${explorerLink('#expertise', 'overview.md')}</li>
                  ${expertise.items.map(item => `<li>${explorerLink('#' + item.id, item.id + '.md')}</li>`).join('\n                  ')}
                  <li>${explorerLink('#integration-points', 'integration-points.md')}</li>
                </ul></li>
                <li>${explorerLink('#contact', 'contact.md')}</li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
      <div class="scrim" data-scrim hidden></div>

      <main class="editor" id="main" tabindex="-1">

        <section class="hero" id="top" data-spy="top" aria-labelledby="hero-title">
          <div class="hero-left">
            <p class="prompt"><span class="ps">~/indice-platform</span></p>
            <p class="cmd"><span class="dollar" aria-hidden="true">$</span> ${typed('dotnet add package Indice.AspNetCore')}</p>
            <p class="cmd"><span class="dollar" aria-hidden="true">$</span> ${typed('npm install @indice/ng-auth oidc-client-ts')}</p>
            <p class="cmd"><span class="dollar" aria-hidden="true">$</span> ${typed('cat README.md')}<span class="caret" aria-hidden="true"></span></p>
            <h1 id="hero-title"><span class="h-mark" aria-hidden="true"># </span>INDICE <span class="accent">Platform</span></h1>
            <p class="lead">${escape(intro)}</p>
            <ol class="pillar-menu" aria-label="The three pillars">
              <li><a href="#foundation"><span class="no">01</span><b>foundation</b><span class="d">libraries · stack · engineering practices</span></a></li>
              <li><a href="#suite"><span class="no">02</span><b>suite</b><span class="d">cases · iam · messaging · risk</span></a></li>
              <li><a href="#expertise"><span class="no">03</span><b>expertise</b><span class="d">development · integration · support</span></a></li>
            </ol>
          </div>
          <aside class="hero-right" aria-label="Product entry points">
            <figure class="codeblock hero-code">
              <figcaption><span class="file">Program.cs</span><span class="lang">c#</span></figcaption>
              <pre class="code" tabindex="0"><code>${[
    ['Cases: my + manage APIs', 'app.MapCases();'],
    ['IAM: management, account, device APIs', 'app.MapIdentityServer();'],
    ['Messaging: campaigns, contacts, send API', 'app.MapMessaging();'],
    ['Risk: POST api/risk, POST api/risk/events', 'app.MapRisk();']
  ].map(([note, call]) => `<span class="line"><span class="tok-comment">// ${escape(note)}</span></span>\n<span class="line">${highlight('csharp', call)}</span>`).join('\n')}</code></pre>
            </figure>
            <p class="hero-note dim">Each product is mapped into your own ASP.NET Core host with one call. The documents describe each host.</p>
          </aside>
        </section>

        <section class="sec" id="foundation" data-spy="foundation" aria-labelledby="foundation-title">
          <header class="sec-head"><p class="crumb">01-foundation / overview.md</p><h2 id="foundation-title"><span class="h-mark" aria-hidden="true">## </span>${foundationPillar.label}</h2></header>
          <blockquote class="pillar-text">${escape(foundationPillar.headline)}</blockquote>

          <div class="block" id="libraries">
            <h3><span class="h-mark" aria-hidden="true">### </span>Libraries</h3>
            <p class="dim">Public repositories in the ${external(links.github, 'indice-co')} organisation.</p>
            <div class="scroll" role="region" aria-label="Libraries" tabindex="0">
              <table class="libs">
                <thead><tr><th scope="col">name</th><th scope="col">kind</th><th scope="col">target</th><th scope="col">source</th></tr></thead>
                <tbody>${foundation.libraries.map(lib => `<tr>
                  <th scope="row">${external(lib.href, lib.name)}</th><td>${escape(lib.kind)}</td><td>${escape(lib.target)}</td><td>${escape(lib.source)}</td>
                </tr><tr class="note"><td colspan="4">${escape(lib.note)}${lib.install ? ` <code class="install">${escape(lib.install)}</code>` : ''}</td></tr>`).join('')}</tbody>
              </table>
            </div>
          </div>

          <div class="block" id="stack">
            <h3><span class="h-mark" aria-hidden="true">### </span>Stack</h3>
            <figure class="codeblock">
              <figcaption><span class="file">stack.yaml</span><span class="lang">yaml</span></figcaption>
              <pre class="code" tabindex="0"><code>${foundation.stack.map(([key, value]) => `<span class="line"><span class="tok-key">${escapeHtml(key)}</span>: <span class="tok-string">${escapeHtml(value)}</span></span>`).join('\n')}</code></pre>
            </figure>
          </div>

          <div class="block" id="practices">
            <h3><span class="h-mark" aria-hidden="true">### </span>Practices</h3>
            <div class="cols">
              <div><h4 class="sub">Principles</h4><ul class="checks">${foundation.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul></div>
              <div><h4 class="sub">Engineering</h4>${dl(foundation.practices)}<h4 class="sub">Domain</h4>${dl(foundation.domain)}</div>
            </div>
          </div>
        </section>

        <section class="sec" id="suite" data-spy="suite" aria-labelledby="suite-title">
          <header class="sec-head"><p class="crumb">02-suite / overview.md</p><h2 id="suite-title"><span class="h-mark" aria-hidden="true">## </span>${suitePillar.label}</h2></header>
          <blockquote class="pillar-text">${escape(suitePillar.headline)}</blockquote>

          <div class="tabs" id="suite-products">
            <div class="tablist" aria-label="Products">
              ${suite.map(product => `<a class="tab" id="tab-${product.id}" href="#${product.id}"><img src="${escape(product.icon)}" alt="" width="16" height="16">${escape(product.name)}</a>`).join('\n              ')}
              ${pendingProducts.map(product => `<a class="tab tab-ph" id="tab-${product.id}" href="#${product.id}"><span class="ico-ph" aria-hidden="true"></span>${escape(product.name)}</a>`).join('\n              ')}
            </div>
            ${suite.map(productPanel).join('\n    ')}
            ${pendingProducts.map(pendingPanel).join('\n    ')}
          </div>

          <div class="block" id="relations">
            <h3><span class="h-mark" aria-hidden="true">### </span>How the products connect</h3>
            <ul class="relations">${relations.map(relation => `<li><span class="route"><span class="from">${escape(relation.from)}</span><span class="arrow" aria-hidden="true">→</span><span class="to">${escape(relation.to)}</span></span><p>${escape(relation.text)}</p></li>`).join('')}</ul>
          </div>

          <div class="block" id="matrix">
            <h3><span class="h-mark" aria-hidden="true">### </span>Dependency matrix</h3>
            ${matrixTable()}
          </div>
        </section>

        <section class="sec" id="expertise" data-spy="expertise" aria-labelledby="expertise-title">
          <header class="sec-head"><p class="crumb">03-expertise / overview.md</p><h2 id="expertise-title"><span class="h-mark" aria-hidden="true">## </span>${expertisePillar.label}</h2></header>
          <blockquote class="pillar-text">${escape(expertisePillar.headline)}</blockquote>
          <div class="issues">${expertise.items.map((item, index) => `<article class="issue" id="${item.id}"><p class="issue-no">#${index + 1}</p><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></article>`).join('')}</div>
          <div class="block" id="integration-points">
            <h3><span class="h-mark" aria-hidden="true">### </span>Integration points</h3>
            <p class="dim">Where the products meet your systems, as documented. Each is a C# interface or a configuration section in your own host.</p>
            <div class="scroll" role="region" aria-label="Integration points" tabindex="0">
              <table class="libs"><thead><tr><th scope="col">product</th><th scope="col">seam</th><th scope="col">connects</th></tr></thead>
              <tbody>${expertise.integrationPoints.map(([product, seam, text]) => `<tr><td>${escape(product)}</td><th scope="row"><code>${escape(seam)}</code></th><td>${escape(text)}</td></tr>`).join('')}</tbody></table>
            </div>
          </div>
        </section>

        <section class="sec" id="contact" data-spy="contact" aria-labelledby="contact-title">
          <header class="sec-head"><p class="crumb">contact.md</p><h2 id="contact-title"><span class="h-mark" aria-hidden="true">## </span>Talk to the engineers</h2></header>
          <ul class="contact-list">
            <li>${placeholder(contact.demo.label, 'Placeholder: demo request link not provided yet')}<span class="dim">Demo of the suite, focused on your integration points.</span></li>
            <li>${external(contact.github.href, contact.github.label)}<span class="dim">Source of the libraries.</span></li>
            <li>${external(links.nuget, 'nuget.org/profiles/indice')}<span class="dim">NuGet packages.</span></li>
            <li>${external(links.ngConfig, '@indice/ng-*')}<span class="dim">npm packages (ng-config, ng-auth, ng-components).</span></li>
          </ul>
        </section>
      </main>
    </div>

    <footer class="statusbar" aria-label="Status bar">
      <span class="sb-path" data-sb-path>indice-platform</span>
      <span class="sb-sep"></span>
      <span class="sb-item">.NET 8</span><span class="sb-item">ASP.NET Core</span><span class="sb-item">SQL Server</span><span class="sb-item">OIDC</span>
      <span class="sb-item sb-hint">Ctrl K</span>
    </footer>
  </div>

  <dialog class="palette" id="palette" aria-label="Go to">
    <form method="dialog" class="palette-box">
      <label class="sr-only" for="palette-input">Go to section, product or link</label>
      <input id="palette-input" type="text" autocomplete="off" spellcheck="false" placeholder="Go to section, product or link…" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list">
      <ul id="palette-list" role="listbox" aria-label="Results"></ul>
      <p class="palette-help dim"><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</p>
    </form>
  </dialog>
  <script type="application/json" id="palette-data">${JSON.stringify([
    ...pillars.map(pillar => ({ label: `${pillar.id}.md`, hint: `${pillar.number} pillar`, href: `#${pillar.id}` })),
    ...suite.map(product => ({ label: `${product.id}/`, hint: `product · ${product.tagline}`, href: `#${product.id}` })),
    ...pendingProducts.map(product => ({ label: `${product.id}/`, hint: 'product · placeholder', href: `#${product.id}` })),
    { label: 'libraries.md', hint: 'foundation', href: '#libraries' },
    { label: 'stack.yaml', hint: 'foundation', href: '#stack' },
    { label: 'relations.md', hint: 'suite', href: '#relations' },
    { label: 'matrix.md', hint: 'suite', href: '#matrix' },
    { label: 'integration-points.md', hint: 'expertise', href: '#integration-points' },
    { label: 'contact.md', hint: 'contact', href: '#contact' },
    { label: 'cases-reference.html', hint: 'Cases technical reference', href: 'cases-reference.html' },
    { label: 'github.com/indice-co', hint: 'external', href: links.github },
    { label: 'nuget.org/profiles/indice', hint: 'external', href: links.nuget },
    { label: 'Original design', hint: 'design preview', href: 'index.html' },
    { label: 'Blueprint design', hint: 'design preview', href: 'blueprint.html' }
  ]).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;
}

module.exports = render;
