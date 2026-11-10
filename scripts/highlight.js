'use strict';

/* Build-time syntax highlighting for the C# and JSON(C) snippets quoted from the product docs.
   Output is plain spans, so the pages stay readable without JavaScript. */
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const csharpKeywords = new Set(['var', 'new', 'public', 'class', 'override', 'async', 'await', 'return', 'if', 'else',
  'using', 'static', 'readonly', 'internal', 'const', 'null', 'true', 'false', 'string', 'int', 'decimal', 'bool',
  'void', 'this', 'base', 'in', 'is', 'as', 'get', 'set', 'typeof', 'nameof']);

const grammars = {
  csharp: [
    ['comment', /\/\/[^\n]*/y],
    ['string', /\$?"(?:[^"\\\n]|\\.)*"/y],
    ['number', /\b\d[\d_.]*[mMfFdDlL]?\b/y],
    ['word', /@?[A-Za-z_][A-Za-z0-9_]*/y]
  ],
  jsonc: [
    ['comment', /\/\/[^\n]*/y],
    ['key', /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y],
    ['string', /"(?:[^"\\\n]|\\.)*"/y],
    ['number', /-?\b\d[\d.]*\b/y],
    ['word', /\b(?:true|false|null)\b/y]
  ]
};

function highlight(language, source) {
  const rules = grammars[language];
  if (!rules) return escapeHtml(source);
  let output = '';
  let index = 0;
  let plainStart = 0;
  const flush = end => { if (end > plainStart) output += escapeHtml(source.slice(plainStart, end)); };
  while (index < source.length) {
    let matched = null;
    for (const [type, pattern] of rules) {
      pattern.lastIndex = index;
      const match = pattern.exec(source);
      if (match) { matched = [type, match[0]]; break; }
    }
    if (!matched) { index += 1; continue; }
    let [type, text] = matched;
    if (type === 'word') {
      if (language === 'csharp') {
        const next = source.slice(index + text.length).match(/^\s*(<[^>\n]*>)?\s*\(/);
        if (csharpKeywords.has(text)) type = 'keyword';
        else if (/^[A-Z]/.test(text)) type = next ? 'function' : 'type';
        else type = next ? 'function' : null;
      } else {
        type = 'keyword';
      }
    }
    if (!type) { index += text.length; continue; }
    flush(index);
    output += `<span class="tok-${type}">${escapeHtml(text)}</span>`;
    index += text.length;
    plainStart = index;
  }
  flush(source.length);
  return output;
}

module.exports = { highlight, escapeHtml };
