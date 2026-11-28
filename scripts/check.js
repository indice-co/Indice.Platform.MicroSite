'use strict';

/* Structural checks for the generated pages: unique ids, one h1, anchors, ARIA references, local files, safe external
   links and typed buttons. Run: npm run check (also used by the tests). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'cases-reference.html'];
const stylesheets = ['css/common.css', 'css/site.css', 'css/cases-reference.css'];
const unescapeHtml = value => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const exists = file => fs.existsSync(path.join(root, decodeURI(unescapeHtml(file))));

function checkPage(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: ids are unique`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: one h1`);
  assert(/<html lang="en"/.test(html), `${file}: language is set`);
  assert(html.includes('<a class="skip-link" href="#main">') && html.includes('<main id="main"'), `${file}: skip link reaches the main content`);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `${file}: anchor exists: ${target}`);
  for (const [, page, target] of html.matchAll(/href="([a-z-]+\.html)(?:#([^"]+))?"/g)) {
    assert(exists(page), `${file}: page exists: ${page}`);
    if (target) assert(fs.readFileSync(path.join(root, page), 'utf8').includes(`id="${target}"`), `${file}: anchor exists: ${page}#${target}`);
  }
  for (const [, refs] of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
    for (const ref of refs.split(' ')) assert(ids.includes(ref), `${file}: ARIA target exists: ${ref}`);
  }
  for (const [, ref] of html.matchAll(/\b(?:src|href)="((?:assets|css|js)\/[^"#]+)"/g)) assert(exists(ref), `${file}: local file exists: ${ref}`);
  for (const [, url] of html.matchAll(/url\('([^']+)'\)/g)) assert(exists(url), `${file}: mask image exists: ${url}`);
  const preview = html.match(/<meta property="og:image" content="https:\/\/[^/"]+\/([^"?]+)(?:\?[^"]*)?">/);
  assert(preview && exists(preview[1]), `${file}: link preview image is an absolute URL to a local file`);
  for (const [, attrs] of html.matchAll(/<button\b([^>]*)>/g)) assert(/\btype="button"/.test(attrs), `${file}: buttons do not submit`);
  for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/g)) assert(/\balt="/.test(attrs), `${file}: images have alt text`);
  for (const [tag] of html.matchAll(/<a [^>]*href="https?:\/\/[^"]+"[^>]*>/g)) {
    assert(/rel="noopener"/.test(tag) && /target="_blank"/.test(tag), `${file}: external link is safe: ${tag}`);
  }
}

function checkStylesheet(file) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  for (const [, url] of css.matchAll(/url\('([^']+)'\)/g)) {
    assert(fs.existsSync(path.resolve(root, path.dirname(file), url)), `${file}: file exists: ${url}`);
  }
}

function check() {
  pages.forEach(checkPage);
  stylesheets.forEach(checkStylesheet);
}

if (require.main === module) {
  check();
  console.log(`Structure, anchors, ARIA references and local files passed for ${pages.join(' and ')}.`);
}

module.exports = { check, checkPage, checkStylesheet, pages, stylesheets };
