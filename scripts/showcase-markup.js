'use strict';

/* The Solutions slider (#product-showcase), shared by index.html and the homepage proposals.
   js/showcase.js and the slider styles rely on these ids, classes and data attributes, so pages only vary the
   copy and how logos are rendered. index.html passes its original copy; the proposals pass homepage-only copy. */
const { escape, arrow } = require('./shared.js');

const preview = (p, cls = '') => p.preview
  ? `<img class="${cls}" src="${escape(p.preview)}" width="1920" height="1080" alt="${escape(p.name)} solution interface" loading="lazy" decoding="async">`
  : `<div class="preview-placeholder ${cls}" role="img" aria-label="${escape(p.name)} UI screenshot placeholder. Awaiting approved asset."><span class="placeholder-cross" aria-hidden="true"></span><span class="placeholder-caption"><span>${escape(p.name)}</span><span>UI screenshot — awaiting approved asset.</span></span></div>`;
const casesWorkflowScreen = `<div class="case-workflow-ui" role="img" aria-label="Illustrative Cases workflow designer"><div class="workflow-toolbar"><span>WORKFLOW DESIGNER</span><span class="workflow-status">Draft / Published</span></div><div class="workflow-sidebar"><span>CASE TYPE</span><b>Application review</b><span>FORM</span><b>Applicant details</b><span>WORKFLOW</span><b class="workflow-selected">Stages &amp; actions</b><span>PERMISSIONS</span><b>Access rules</b></div><div class="workflow-canvas"><div class="workflow-canvas-heading"><div><span>WORKFLOW / APPLICATION REVIEW</span><b>Default path</b></div><span>2 checkpoints</span></div><div class="workflow-route"><div class="workflow-node"><small>01 / INTAKE</small><b>Request received</b><span>Customer or staff</span></div><span class="workflow-connector"></span><div class="workflow-node"><small>02 / REVIEW</small><b>Team review</b><span>Operations</span></div><span class="workflow-connector"></span><div class="workflow-node workflow-approval"><small>03 / CHECKPOINT</small><b>Independent approval</b><span>Manager</span></div></div><div class="workflow-footer"><span>+ Add stage</span><span>Changes saved</span></div></div></div>`;
const casesRecordScreen = `<div class="case-record-ui" role="img" aria-label="Illustrative Cases record showing activity history and separate customer and internal information"><div class="record-toolbar"><span>CASES / CASE DETAIL</span><span>•••</span></div><div class="record-summary"><div><span>APPLICATION / C-1842</span><b>Review request</b></div><span class="record-status">In review</span></div><div class="record-columns"><div class="record-main"><div class="record-section-heading"><b>Case information</b><span>Updated just now</span></div><div class="record-field"><span>Current stage</span><b>Operations review</b></div><div class="record-field"><span>Assigned team</span><b>Customer Operations</b></div><div class="record-section-heading record-history-heading"><b>Activity history</b><span>3 events</span></div><div class="record-event"><i></i><div><b>Review started</b><span>Maria P. / 10:42</span></div></div><div class="record-event"><i></i><div><b>Application submitted</b><span>Customer portal / 09:18</span></div></div></div><aside class="record-visibility"><span class="record-label">CUSTOMER VIEW</span><b>Published update</b><p>Your application is being reviewed.</p><span class="record-label record-private-label">INTERNAL ONLY</span><b>Approval note</b><p>Supporting checks completed. Awaiting independent approval.</p></aside></div></div>`;

const productChapter = (p, chapter, logo, unavailable) => `<article class="product-chapter" id="product-${p.id}" data-product="${p.id}" style="--product-color:${p.id === 'messaging' ? p.accent : p.color}" aria-labelledby="title-${p.id}" tabindex="-1"><div class="chapter-content"><div class="chapter-logo">${logo(p)}</div><h3 id="title-${p.id}">${escape(chapter.title)}</h3><p class="chapter-description">${escape(chapter.description)}</p>${p.destination ? `<a class="button explore-button" href="${escape(p.destination)}">Explore ${p.name}${arrow}</a>` : `<button type="button" class="button explore-button" disabled aria-describedby="unavailable-${p.id}">Explore ${p.name}${arrow}</button><p class="unavailable-note" id="unavailable-${p.id}">${unavailable}</p>`}</div><div class="static-preview">${preview(p)}</div></article>`;

const casesChapter = (p, story, logo) => {
  const { intake, workflow, governance } = story;
  return `<article class="product-chapter product-chapter-cases" id="product-cases" data-product="cases" style="--product-color:${p.color}" aria-labelledby="title-cases" tabindex="-1">
    <div class="cases-story">
      <header class="cases-story-heading">
        <div class="chapter-logo">${logo(p)}</div>
        <span class="cases-story-kicker">${escape(story.kicker)}</span>
        <h3 id="title-cases">${escape(story.title)}</h3>
        <p>${escape(story.intro)}</p>
      </header>
      <div class="cases-story-beats">
        <section class="case-beat" data-case-beat="intake" aria-label="Case intake">
          <div class="case-beat-copy">
            <span class="case-beat-index">${escape(intake.index)}</span>
            <h4>${escape(intake.title)}</h4>
            <p>${escape(intake.text)}</p>
            <h5>${escape(intake.listTitle)}</h5>
            <ul>
${intake.list.map(item => `              <li>${escape(item)}</li>`).join('\n')}
            </ul>
          </div>
          <figure class="case-screen">
            <figcaption><span>CASES / OPERATIONS</span><b>Team dashboard</b></figcaption>
            <div class="case-screen-window"><img src="${escape(p.preview)}" width="1920" height="1080" alt="Cases operations dashboard showing case pipeline and team workloads" loading="lazy" decoding="async"></div>
          </figure>
        </section>
        <section class="case-beat" data-case-beat="workflow" aria-label="Workflow configuration">
          <div class="case-beat-copy">
            <span class="case-beat-index">${escape(workflow.index)}</span>
            <h4>${escape(workflow.title)}</h4>
            <ul class="case-feature-list">
${workflow.features.map(feature => `              <li><strong>${escape(feature.lead)}</strong> ${escape(feature.text)}</li>`).join('\n')}
            </ul>
          </div>
          <figure class="case-screen">
            <figcaption><span>ILLUSTRATIVE / CONFIGURATION</span><b>Workflow designer</b></figcaption>
            <div class="case-screen-window">${casesWorkflowScreen}</div>
          </figure>
        </section>
        <section class="case-beat" data-case-beat="governance" aria-label="History, visibility and operations">
          <div class="case-beat-copy">
            <span class="case-beat-index">${escape(governance.index)}</span>
            <h4>${escape(governance.title)}</h4>
${governance.lines.map(line => `            <p class="case-visibility-line">${escape(line)}</p>`).join('\n')}
            <p class="case-ownership"><strong>${escape(governance.ownership.lead)}</strong> ${escape(governance.ownership.text)}</p>
            <a class="button explore-button" href="${escape(p.destination)}">${escape(governance.cta)}${arrow}</a>
          </div>
          <figure class="case-screen">
            <figcaption><span>ILLUSTRATIVE / CASE DETAIL</span><b>Controlled visibility</b></figcaption>
            <div class="case-screen-window">${casesRecordScreen}</div>
          </figure>
        </section>
      </div>
    </div>
  </article>`;
};

/* copy: { chapters: { [productId]: { title, description } }, cases: story, unavailable } */
function renderShowcase({ products, copy, logo }) {
  const chapter = p => p.id === 'cases'
    ? casesChapter(p, copy.cases, logo)
    : productChapter(p, copy.chapters[p.id], logo, copy.unavailable);
  return `<section class="product-showcase" id="product-showcase" aria-label="Explore the solutions">
      <div class="story-stage">
        <nav class="product-navigation" aria-label="Solution showcase">${products.map(p => `<button type="button" data-select-product="${p.id}" aria-controls="product-${p.id}">${p.name}</button>`).join('')}</nav>
        <div class="story-copy">${products.map(chapter).join('')}</div>
        <div class="preview-panel" aria-label="Solution UI preview"><div class="preview-viewport">${products.map((p,i) => `<div class="preview-slide${i===0?' is-active':''}" data-preview="${p.id}">${p.id === 'cases' ? `<figure class="case-screen"><figcaption><span>CASES / OPERATIONS</span><b>Team dashboard</b></figcaption><div class="case-screen-window">${preview(p)}</div></figure>` : preview(p)}</div>`).join('')}</div></div>
      </div>
    </section>`;
}

module.exports = { renderShowcase, preview, casesWorkflowScreen, casesRecordScreen };
