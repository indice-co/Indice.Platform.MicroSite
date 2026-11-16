'use strict';

/* Proposal B's own content: the shared proposal copy with six solutions in this order, IAM, Cases, Messaging, Risk,
   Agents and Workers. Agents and Workers have no solution documents or screenshots yet, so every text, list, code
   sample and screen for them is a labelled placeholder. Proposals A and C, js/data.js and the main site keep the
   original four solutions. */
const fs = require('node:fs');
const path = require('node:path');
require('../../js/data.js');
const base = require('./content.js');
const { escape, logo } = require('../shared.js');
const { products } = globalThis.INDICE_DATA;

const root = path.join(__dirname, '..', '..');
const order = ['iam', 'cases', 'messaging', 'risk', 'agents', 'workers'];
const placeholder = text => `Placeholder: ${text}`;

/* Agents uses the supplied Dex artwork. */
const newProducts = [
  { id: 'agents', name: 'Agents', logo: 'assets/logos/dex logo.svg', icon: 'assets/logos/dex icon.svg', color: '#E3272A', destination: null },
  { id: 'workers', name: 'Workers', logo: 'assets/logos/workers logo.svg', icon: 'assets/logos/workers icon.svg', color: '#F59E0B', destination: null }
];
const byId = Object.fromEntries([
  ...products.map(product => [product.id, { ...product, icon: `assets/logos/${product.id} icon.svg` }]),
  ...newProducts.map(product => [product.id, product])
]);

const placeholderSolution = (id, name) => ({
  id,
  name,
  tagline: placeholder(`${name} tagline`),
  action: placeholder(`what ${name} does, in one sentence.`),
  summary: placeholder(`a short summary of ${name}: what it is, who uses it and where it runs.`),
  problem: placeholder(`the problem ${name} addresses for technical teams.`),
  how: [1, 2, 3].map(step => placeholder(`how ${name} works, step ${step}.`)),
  architecture: placeholder(`how ${name} is hosted and where its data lives.`),
  integrations: [1, 2, 3, 4].map(item => placeholder(`integration ${item}`)),
  apis: [placeholder('key API')],
  stack: [placeholder('stack')],
  code: { file: `${name}/Program.cs`, language: 'csharp', source: `// Placeholder: a code sample for ${name} will go here.` },
  screens: [1, 2, 3].map(screen => ({ title: `${name} screen ${screen}`, text: placeholder('screen description.') }))
});

const allSolutions = [...base.solutions, placeholderSolution('agents', 'Agents'), placeholderSolution('workers', 'Workers')];
const solutions = order.map(id => ({ ...allSolutions.find(solution => solution.id === id), product: byId[id] }));

/* A partnership called out in a solution's entry. */
solutions.find(solution => solution.id === 'iam').partner = {
  label: 'Official partner',
  name: 'Duende Software',
  logo: 'assets/logos/duende logo.svg',
  text: 'INDICE is an official distributor and integrator of Duende Software, the company behind Duende IdentityServer. We license, deploy and integrate IdentityServer as part of IAM, and support it alongside the rest of the platform.',
  href: 'https://duendesoftware.com/',
  site: 'duendesoftware.com'
};

const content = {
  ...base,
  hero: { ...base.hero, title: 'Self-hosted .NET solutions for identity, case workflows, messaging, risk, agents and workers.' },
  platform: { ...base.platform, intro: base.platform.intro.replace('Cases, IAM, Messaging and Risk', 'IAM, Cases, Messaging, Risk, Agents and Workers') },
  ui: { ...base.ui, colophonText: 'Set in Manrope. Dark by default; your theme choice is remembered for this proposal.' },
  solutions
};

/* Proposal B's own dark-theme logos: the neutral wordmark colours are lightened (Dex draws its wordmark in #1D1F25
   rather than the shared #1C1A33), but the icon and the "UI" letters keep their colours, so the Workers gear and
   the letters inside each coloured badge stay dark. In the supplied artwork the icon is drawn in the first 30px,
   the badge is the path that starts at y 2.2202 and the two paths after it are the letters U and I. */
const darkLogoColours = [['#1C1A33', '#F4F4F6'], ['#1D1F25', '#F4F4F6'], ['#777685', '#A9A8B8']];
const darkLogoPath = product => `assets/logos/on-dark/proposal-b/${product.id}-logo.svg`;
function darkLogo(product) {
  let keep = 0;
  return fs.readFileSync(path.join(root, product.logo), 'utf8').replace(/<path\b[^>]*>/g, tag => {
    if (keep > 0) { keep -= 1; return tag; }
    if (Number(tag.match(/\sd="M([\d.]+)/)?.[1]) < 30) return tag;
    if (/\sd="M[\d.]+ 2\.2202\d*H/.test(tag)) keep = 2;
    return darkLogoColours.reduce((svg, [from, to]) => svg.replace(new RegExp(from, 'gi'), to), tag);
  });
}
function renderDarkLogos() {
  fs.mkdirSync(path.join(root, 'assets', 'logos', 'on-dark', 'proposal-b'), { recursive: true });
  for (const { product } of solutions) fs.writeFileSync(path.join(root, darkLogoPath(product)), darkLogo(product), 'utf8');
}
const themedLogo = product => logo(product, 'logo-on-light')
  + logo(product, 'logo-on-dark').replace(`src="${escape(product.logo)}"`, `src="${escape(darkLogoPath(product))}"`);

module.exports = { content, newProducts, darkLogo, darkLogoPath, renderDarkLogos, themedLogo };
