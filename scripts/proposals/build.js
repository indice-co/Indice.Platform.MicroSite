'use strict';

/* Builds the homepage proposals: generated slider CSS, dark-theme product logos and the three pages.
   Run through scripts/render.js (npm run build). */
const fs = require('node:fs');
const path = require('node:path');
const { renderShowcaseCss, renderScreensCss } = require('./showcase-css.js');
const { renderDarkLogos } = require('./shared.js');

const root = path.join(__dirname, '..', '..');
const pages = {
  'proposal-a.html': require('./render-a.js'),
  'proposal-b.html': require('./render-b.js'),
  'proposal-c.html': require('./render-c.js')
};

module.exports = function buildProposals() {
  fs.writeFileSync(path.join(root, 'css', 'proposals', 'showcase.css'), renderShowcaseCss(), 'utf8');
  fs.writeFileSync(path.join(root, 'css', 'proposals', 'screens.css'), renderScreensCss(), 'utf8');
  renderDarkLogos();
  for (const [file, render] of Object.entries(pages)) fs.writeFileSync(path.join(root, file), render(), 'utf8');
  console.log(`Rendered ${Object.keys(pages).join(', ')}.`);
};

module.exports.pages = pages;
