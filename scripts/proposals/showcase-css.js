'use strict';

/* Extracts the Solutions slider styles from css/styles.css, so the homepage proposals keep the slider's exact
   layout, sizing, motion and responsive behaviour without loading the original homepage design.
   - Rules whose selectors name a slider class are copied as-is, in source order, inside their @media blocks.
   - Global element rules and the generic classes the slider uses are scoped with :where(.product-showcase), which
     adds no specificity, so the original cascade between them is unchanged.
   The proposals load their own styles in cascade layers; these unlayered rules therefore win inside the slider.
   Theme tokens and dark-theme adjustments live in css/proposals/showcase-theme.css. */
const fs = require('node:fs');
const path = require('node:path');

const SLIDER_CLASS = /\.(?:product-showcase|story-[a-z-]+|preview-[a-z-]+|product-chapter(?:-cases)?|chapter-[a-z-]+|cases-story(?:-[a-z-]+)?|case-[a-z-]+|product-navigation|product-nav-index|static-preview|explore-button|unavailable-note|placeholder-[a-z-]+|workflow-[a-z-]+|record-[a-z-]+)(?![\w-])/;
const GENERIC = new Set(['.button', '.button:hover', '.button:active', '.button .arrow', '.arrow', '.sr-only', '.product-logo']);
const SCOPE = ':where(.product-showcase)';

/* Minimal parser for the project's stylesheet: comments, plain rules, and block at-rules one level deep. */
function parse(css) {
  let index = 0;
  const skip = () => {
    for (;;) {
      while (index < css.length && /\s/.test(css[index])) index++;
      if (css.startsWith('/*', index)) { index = css.indexOf('*/', index + 2) + 2; continue; }
      return;
    }
  };
  const readUntil = stop => {
    let depth = 0;
    let quote = null;
    const start = index;
    for (; index < css.length; index++) {
      const char = css[index];
      if (quote) { if (char === quote && css[index - 1] !== '\\') quote = null; continue; }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (depth === 0 && stop.includes(char)) break;
    }
    return css.slice(start, index);
  };
  const block = () => {
    const nodes = [];
    for (;;) {
      skip();
      if (index >= css.length || css[index] === '}') { index++; return nodes; }
      const prelude = readUntil('{;}').trim();
      if (css[index] === ';') { index++; nodes.push({ type: 'statement', prelude }); continue; }
      index++;
      if (/^@(media|supports|layer)\b/.test(prelude)) {
        nodes.push({ type: 'group', prelude, children: block() });
      } else if (prelude.startsWith('@')) {
        // @keyframes and @font-face are never slider rules; skip them with brace matching.
        const start = index;
        for (let depth = 1; depth > 0 && index < css.length; index++) {
          if (css[index] === '{') depth++;
          else if (css[index] === '}') depth--;
        }
        nodes.push({ type: 'raw', prelude, body: css.slice(start, index - 1) });
      } else {
        const body = readUntil('}');
        index++;
        nodes.push({ type: 'rule', prelude, body });
      }
    }
  };
  return block();
}

const splitSelectors = prelude => {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of prelude) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) { parts.push(current.trim()); current = ''; } else current += char;
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
};

const isElementRule = selector => !/[.#]/.test(selector) && !/^(html|body|:root|::selection)\b/.test(selector);

function sliderSelectors(prelude) {
  const kept = [];
  for (const selector of splitSelectors(prelude)) {
    if (SLIDER_CLASS.test(selector)) kept.push(selector);
    else if (GENERIC.has(selector) || isElementRule(selector)) kept.push(`${SCOPE} ${selector}`);
  }
  return kept;
}

/* Only the illustrative Cases mock-ups (workflow designer and case record), reused by the screen galleries. */
const MOCK_CLASS = /\.(?:case-workflow-ui|workflow-[a-z-]+|case-record-ui|record-[a-z-]+)(?![\w-])/;
const mockSelectors = prelude => splitSelectors(prelude).filter(selector => MOCK_CLASS.test(selector) && !/story-|case-beat|case-screen/.test(selector));

const formatRule = (selectors, body, indent = '') => {
  const declarations = body.trim().split(/\s*;\s*(?![^(]*\))/).map(item => item.trim()).filter(Boolean);
  return `${indent}${selectors.join(',')} {\n${declarations.map(item => `${indent}  ${item}`).join(';\n')}\n${indent}}`;
};

function extract(css, select = sliderSelectors) {
  const output = [];
  for (const node of parse(css)) {
    if (node.type === 'rule') {
      const selectors = select(node.prelude);
      if (selectors.length) output.push(formatRule(selectors, node.body));
    } else if (node.type === 'group' && node.prelude.startsWith('@media')) {
      const rules = node.children.filter(child => child.type === 'rule')
        .map(child => [select(child.prelude), child.body])
        .filter(([selectors]) => selectors.length)
        .map(([selectors, body]) => formatRule(selectors, body, '  '));
      if (rules.length) output.push(`${node.prelude} {\n${rules.join('\n')}\n}`);
    }
  }
  return output.join('\n');
}

const readStyles = () => fs.readFileSync(path.join(__dirname, '..', '..', 'css', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

function renderShowcaseCss() {
  return `/* GENERATED by scripts/proposals/showcase-css.js from css/styles.css. Do not edit; run npm run build.
   The Solutions slider styles used by Proposal A. See css/proposals/showcase-theme.css for theming. */
${extract(readStyles())}
`;
}

function renderScreensCss() {
  return `/* GENERATED by scripts/proposals/showcase-css.js from css/styles.css. Do not edit; run npm run build.
   Styles of the illustrative Cases screens (workflow designer, case record) shown in the screen galleries. */
${extract(readStyles(), mockSelectors)}
`;
}

module.exports = { renderShowcaseCss, renderScreensCss, extract, parse, sliderSelectors, mockSelectors };
