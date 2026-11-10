'use strict';

/* Design 3 — "Blueprint": a cobalt engineering-drawing layout. Pre-rendered; js/blueprint.js only enhances it. */
const fs = require('node:fs');
const path = require('node:path');
const content = require('./tech-content.js');
const { highlight } = require('./highlight.js');
const { designRibbon, escape, screenshotCarousel } = require('./shared.js');

const { links, pillars, intro, tech, suite, pendingProducts, foundation, expertise, relations, contact } = content;
const techLabel = Object.fromEntries(tech.map(item => [item.id, item.label]));
const svgSize = file => {
  const [, width, height] = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return `width="${width}" height="${height}"`;
};
const pad = number => String(number).padStart(2, '0');

const placeholder = (label, title = 'Placeholder: no link provided yet') =>
  `<span class="ph" role="link" aria-disabled="true" title="${escape(title)}">${escape(label)}<small>placeholder</small></span>`;
const external = (href, label) => `<a class="ext" href="${escape(href)}" rel="noopener" target="_blank">${escape(label)}<span class="sr-only"> (opens in a new tab)</span></a>`;

function codeBlock({ file, language, source }) {
  const lines = highlight(language, source).split('\n').map(line => `<span class="line">${line || ' '}</span>`).join('\n');
  return `<figure class="codeblock">
              <figcaption><span class="file">${escape(file)}</span><span class="lang">${language === 'jsonc' ? 'json' : 'c#'}</span></figcaption>
              <pre class="code" tabindex="0"><code>${lines}</code></pre>
            </figure>`;
}

const usesOf = (product, level) => tech.filter(item => product.uses[item.id] === level).map(item => item.id);
const stackSentence = product => {
  const required = usesOf(product, 'req').map(id => techLabel[id]);
  const optional = usesOf(product, 'opt').map(id => techLabel[id]);
  return `${product.name} uses ${required.join(', ')}${optional.length ? `; optional: ${optional.join(', ')}` : ''}.`;
};

/* ---------- Hero: layered system diagram (read bottom-up) ---------- */
const stackDiagram = () => `<figure class="stack" id="stack-diagram" data-selected="cases" aria-labelledby="stack-caption">
        <div class="layer layer-foundation" data-layer="foundation">
          <h3 class="layer-label"><span class="no">01</span>Foundation</h3>
          <ul class="modules techs">${tech.map(item => `<li class="mod tech" data-tech="${item.id}"><b>${escape(item.label)}</b><span>${escape(item.detail)}</span></li>`).join('')}</ul>
          <div class="libs-bar" data-tech="libs"><b>Indice.* libraries</b><span>.NET on NuGet · Angular on npm · Swift and Kotlin SDKs</span></div>
        </div>
        <div class="layer layer-suite" data-layer="suite">
          <h3 class="layer-label"><span class="no">02</span>Suite</h3>
          <ul class="modules products">${suite.map(product => `<li><button class="mod product" type="button" data-product="${product.id}" data-uses="${usesOf(product, 'req').join(' ')}" data-optional="${usesOf(product, 'opt').join(' ')}" aria-pressed="${product.id === 'cases'}">
              <img src="${escape(product.icon)}" alt="" width="28" height="28"><b>${escape(product.name)}</b><span>${escape(product.baseUnit.toLowerCase())}</span></button></li>`).join('')}${pendingProducts.map(product => `<li><div class="mod product product-ph" role="img" aria-label="${escape(product.name)}, placeholder: no logo or product document yet"><span class="ico-ph" aria-hidden="true"></span><b>${escape(product.name)}</b><span>placeholder</span></div></li>`).join('')}</ul>
        </div>
        <div class="layer layer-expertise" data-layer="expertise">
          <h3 class="layer-label"><span class="no">03</span>Expertise</h3>
          <ul class="modules services">${expertise.items.map(item => `<li class="mod service"><b>${escape(item.title)}</b></li>`).join('')}</ul>
        </div>
        <svg class="links" aria-hidden="true" focusable="false"></svg>
        <figcaption id="stack-caption"><span class="legend"><i class="solid"></i>part of the stack <i class="dashed"></i>optional</span><span class="sel" aria-live="polite" data-selection>${escape(stackSentence(suite[0]))}</span></figcaption>
      </figure>`;

/* ---------- Foundation ---------- */
const bom = () => `<div class="scroll" role="region" aria-label="Parts list" tabindex="0">
            <table class="bom">
              <caption>Parts list. Public repositories in the ${external(links.github, 'indice-co')} organisation.</caption>
              <thead><tr><th scope="col">item</th><th scope="col">part</th><th scope="col">kind / target</th><th scope="col">source</th></tr></thead>
              <tbody>${foundation.libraries.map((lib, index) => `<tr>
                <td class="item">01.${pad(index + 1)}</td>
                <th scope="row">${external(lib.href, lib.name)}<p>${escape(lib.note)}</p>${lib.install ? `<code class="install">${escape(lib.install)}</code>` : ''}</th>
                <td>${escape(lib.kind)}<br><span class="dim">${escape(lib.target)}</span></td>
                <td>${escape(lib.source)}</td></tr>`).join('')}</tbody>
            </table>
          </div>`;

const specTable = rows => `<dl class="spec">${rows.map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;

/* ---------- Suite: accordion datasheets ---------- */
function datasheet(product, index) {
  const docs = product.docs.href
    ? `<a class="doc-link" href="${escape(product.docs.href)}">${escape(product.docs.label)} →</a>`
    : placeholder(product.docs.label, 'Placeholder: this product’s technical reference page does not exist yet');
  return `<details class="ds" id="ds-${product.id}" name="datasheet">
          <summary>
            <span class="ds-no">02.${index + 1}</span>
            <span class="plate"><img src="${escape(product.logo)}" ${svgSize(product.logo)} alt="${escape(product.name)}" loading="lazy" decoding="async"></span>
            <span class="ds-tag">${escape(product.tagline)}</span>
            <span class="ds-base"><small>base unit</small>${escape(product.baseUnit.toLowerCase())}</span>
            <span class="ds-pkg"><small>packages</small>${escape(product.hosting[0][1])}</span>
            <span class="ds-toggle" aria-hidden="true"></span>
          </summary>
          <div class="ds-body">
            <div class="ds-left">
              <p class="ds-summary">${escape(product.summary)}</p>
              ${screenshotCarousel(product)}
              <ol class="features">${product.highlights.map(([title, text]) => `<li><b>${escape(title)}</b><span>${escape(text)}</span></li>`).join('')}</ol>
            </div>
            <div class="ds-right">
              <h4>Hosting and auth</h4>${specTable(product.hosting)}
              <p class="ds-docs">${docs}</p>
              <h4>Stack</h4>
              <ul class="chips">${tech.filter(item => product.uses[item.id]).map(item => `<li class="${product.uses[item.id]}">${escape(item.label)}${product.uses[item.id] === 'opt' ? ' <small>optional</small>' : ''}</li>`).join('')}</ul>
              <h4>Endpoints</h4>
              <div class="scroll" role="region" aria-label="${escape(product.name)} endpoints" tabindex="0"><table class="endpoints"><thead><tr><th scope="col">method</th><th scope="col">path</th><th scope="col">purpose</th></tr></thead><tbody>${product.endpoints.map(([method, route, purpose]) => `<tr><td><span class="verb verb-${method === '*' ? 'any' : method.toLowerCase()}">${escape(method)}</span></td><td><code>${escape(route)}</code></td><td>${escape(purpose)}</td></tr>`).join('')}</tbody></table></div>
              <h4>Code</h4>
              ${product.code.map(codeBlock).join('\n              ')}
              <h4>Extension points <span class="dim">C# interfaces, not a DSL</span></h4>
              <ul class="seams">${product.seams.map(([name, description]) => `<li><code>${escape(name)}</code><span>${escape(description)}</span></li>`).join('')}</ul>
            </div>
          </div>
        </details>`;
}

const pendingRow = (product, index) => `<div class="ds ds-pending" id="ds-${product.id}">
          <div class="ds-row">
            <span class="ds-no">02.${suite.length + index + 1}</span>
            <span class="plate plate-ph" role="img" aria-label="${escape(product.name)} logo placeholder"><span>${escape(product.name)} logo</span></span>
            <span class="ds-tag">${escape(product.name)}. ${escape(product.note)}</span>
            <span class="ds-base"><small>base unit</small>—</span>
            <span class="ds-pkg"><small>datasheet</small>${placeholder('Technical reference', 'Placeholder: no document or page exists yet')}</span>
          </div>
        </div>`;

const matrix = () => `<div class="scroll" role="region" aria-label="Product dependency matrix" tabindex="0">
          <table class="matrix" id="matrix-table">
            <caption>Documented stack per product. Filled: part of the stack. Outlined: optional or replaceable.</caption>
            <thead><tr><th scope="col">product</th>${tech.map(item => `<th scope="col">${escape(item.matrix)}</th>`).join('')}</tr></thead>
            <tbody>${suite.map(product => `<tr><th scope="row"><img src="${escape(product.icon)}" alt="" width="18" height="18">${escape(product.name)}</th>${tech.map(item => {
    const level = product.uses[item.id];
    return `<td class="${level || 'none'}"><span class="dot" aria-hidden="true"></span><span class="sr-only">${level === 'req' ? 'used' : level === 'opt' ? 'optional' : 'not used'}</span></td>`;
  }).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`;

function render() {
  const [foundationPillar, suitePillar, expertisePillar] = pillars;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0a1f5c">
  <meta name="description" content="${escape(intro)}">
  <title>INDICE Platform — Blueprint</title>
  <link rel="preload" href="assets/fonts/space-grotesk-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/design-ribbon.css">
  <link rel="stylesheet" href="css/carousel.css">
  <link rel="stylesheet" href="css/blueprint.css">
  <script>document.documentElement.classList.add('js')</script>
  <script defer src="js/carousel.js"></script>
  <script defer src="js/blueprint.js"></script>
</head>
<body class="bp">
  <a class="skip-link" href="#main">Skip to content</a>
  ${designRibbon('blueprint')}
  <header class="sheetbar">
    <a class="brand" href="#overview" aria-label="INDICE Platform"><img src="assets/logos/indice platform white.svg" width="1490" height="400" alt="INDICE Platform"></a>
    <nav class="sheetnav" aria-label="Sheets">
      <ol>${pillars.map(pillar => `<li><a href="#${pillar.id}" data-spy-link="${pillar.id}"><span class="no">${pillar.number}</span>${pillar.label}</a></li>`).join('')}</ol>
    </nav>
    <p class="sheetbar-cta">${placeholder(contact.demo.label, 'Placeholder: demo request link not provided yet')}</p>
  </header>

  <main id="main" tabindex="-1">
    <section class="hero" id="overview" data-spy="overview" aria-labelledby="hero-title">
      <div class="hero-title">
        <p class="eyebrow">Sheet 00 · System overview</p>
        <h1 id="hero-title"><span><i>01</i>Libraries,</span> <span><i>02</i>products,</span> <span><i>03</i>engineers.</span></h1>
      </div>
      <div class="hero-intro">
        <p class="lead">${escape(intro)}</p>
        <ul class="hero-index" aria-label="Pillars">${pillars.map(pillar => `<li><a href="#${pillar.id}"><span class="no">${pillar.number}</span><b>${escape(pillar.label)}</b><span class="d">${pillar.id === 'foundation' ? 'libraries · stack · practices' : pillar.id === 'suite' ? 'cases · iam · messaging · risk' : 'development · integration · support'}</span></a></li>`).join('')}</ul>
      </div>
      <div class="hero-diagram">
        <p class="dimension" aria-hidden="true"><span>read bottom-up · select a product to trace its stack</span></p>
        ${stackDiagram()}
      </div>
    </section>

    <section class="sheet" id="foundation" data-spy="foundation" aria-labelledby="foundation-title">
      <header class="sheet-head">
        <p class="sheet-no" aria-hidden="true">01</p>
        <div><p class="eyebrow">Sheet 01 of 03</p><h2 id="foundation-title">${foundationPillar.label}</h2></div>
        <p class="pillar-text">${escape(foundationPillar.headline)}</p>
      </header>
      <div class="sheet-body">
        <div class="col-main">
          ${bom()}
          <h3 class="block-title">Specification</h3>
          ${specTable(foundation.stack)}
        </div>
        <aside class="col-side">
          <h3 class="block-title">General notes</h3>
          <ol class="notes">${foundation.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ol>
          <h3 class="block-title">Engineering</h3>${specTable(foundation.practices)}
          <h3 class="block-title">Domain</h3>${specTable(foundation.domain)}
        </aside>
      </div>
    </section>

    <section class="sheet" id="suite" data-spy="suite" aria-labelledby="suite-title">
      <header class="sheet-head">
        <p class="sheet-no" aria-hidden="true">02</p>
        <div><p class="eyebrow">Sheet 02 of 03</p><h2 id="suite-title">${suitePillar.label}</h2></div>
        <p class="pillar-text">${escape(suitePillar.headline)}</p>
      </header>
      <h3 class="block-title" id="datasheets-title">Datasheets</h3>
      <div class="datasheets" aria-labelledby="datasheets-title">
        ${suite.map(datasheet).join('\n        ')}
        ${pendingProducts.map(pendingRow).join('\n        ')}
      </div>

      <div class="sheet-body sheet-body-split">
        <div class="col-main" id="matrix">
          <h3 class="block-title">Dependency matrix</h3>
          ${matrix()}
        </div>
        <aside class="col-side" id="interfaces">
          <h3 class="block-title">Interfaces between products</h3>
          <ul class="interfaces">${relations.map(relation => `<li><p class="route"><b>${escape(relation.from)}</b><span aria-hidden="true"></span><b>${escape(relation.to)}</b></p><p>${escape(relation.text)}</p></li>`).join('')}</ul>
        </aside>
      </div>
    </section>

    <section class="sheet" id="expertise" data-spy="expertise" aria-labelledby="expertise-title">
      <header class="sheet-head">
        <p class="sheet-no" aria-hidden="true">03</p>
        <div><p class="eyebrow">Sheet 03 of 03</p><h2 id="expertise-title">${expertisePillar.label}</h2></div>
        <p class="pillar-text">${escape(expertisePillar.headline)}</p>
      </header>
      <ol class="packages">${expertise.items.map((item, index) => `<li id="${item.id}"><p class="wp">WP-${pad(index + 1)}</p><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></li>`).join('')}</ol>
      <h3 class="block-title" id="integration-points">Interface table</h3>
      <p class="dim table-note">Where the products meet your systems, as documented. Each is a C# interface or a configuration section in your own host.</p>
      <div class="scroll" role="region" aria-label="Integration points" tabindex="0">
        <table class="bom">
          <thead><tr><th scope="col">product</th><th scope="col">interface</th><th scope="col">connects</th></tr></thead>
          <tbody>${expertise.integrationPoints.map(([product, seam, text]) => `<tr><td>${escape(product)}</td><th scope="row"><code>${escape(seam)}</code></th><td>${escape(text)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </section>

    <section class="titleblock" id="contact" data-spy="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" class="sr-only">Contact and sources</h2>
      <dl>
        <div><dt>Project</dt><dd>INDICE Platform</dd></div>
        <div><dt>Sheets</dt><dd>3</dd></div>
        <div><dt>Source</dt><dd>Product documents and the public indice-co repositories</dd></div>
        <div><dt>Libraries licence</dt><dd>MIT (Indice.Platform)</dd></div>
        <div class="tb-links"><dt>Contact</dt><dd>${placeholder(contact.demo.label, 'Placeholder: demo request link not provided yet')}</dd></div>
        <div class="tb-links"><dt>Code</dt><dd>${external(contact.github.href, contact.github.label)} ${external(links.nuget, 'NuGet')} ${external(links.ngConfig, 'npm')}</dd></div>
      </dl>
    </section>
  </main>
</body>
</html>
`;
}

module.exports = render;
