'use strict';

/* Writes the alternative homepage designs next to index.html. Run through scripts/render.js. */
const fs = require('node:fs');
const path = require('node:path');

module.exports = function renderVariants() {
  const outputs = {
    'terminal.html': require('./render-terminal.js'),
    'blueprint.html': require('./render-blueprint.js')
  };
  for (const [file, render] of Object.entries(outputs)) {
    fs.writeFileSync(path.join(__dirname, '..', file), render(), 'utf8');
  }
  console.log(`Rendered ${Object.keys(outputs).join(' and ')}.`);
};
