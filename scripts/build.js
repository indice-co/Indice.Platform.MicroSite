'use strict';

/* Builds the site: the generated product logos and the two pages. Run: npm run build */
const fs = require('node:fs');
const path = require('node:path');
const { renderLogos } = require('./shared.js');

const root = path.join(__dirname, '..');
const pages = {
  'index.html': require('./render-home.js'),
  'cases-reference.html': require('./render-cases-reference.js')
};

function build() {
  renderLogos();
  for (const [file, render] of Object.entries(pages)) fs.writeFileSync(path.join(root, file), render(), 'utf8');
  console.log(`Rendered ${Object.keys(pages).join(', ')}.`);
}

if (require.main === module) build();

module.exports = { pages, build };
