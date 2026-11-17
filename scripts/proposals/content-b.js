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

/* Agents uses the supplied Dex artwork. Cases links to Proposal B's own copy of its technical reference. */
const referencePage = 'proposal-b-cases-reference.html';
const newProducts = [
  { id: 'agents', name: 'Agents', logo: 'assets/logos/dex logo.svg', icon: 'assets/logos/dex icon.svg', color: '#E3272A', destination: null },
  { id: 'workers', name: 'Workers', logo: 'assets/logos/workers logo.svg', icon: 'assets/logos/workers icon.svg', color: '#F59E0B', destination: null }
];
const byId = Object.fromEntries([
  ...products.map(product => [product.id, {
    ...product,
    icon: `assets/logos/${product.id} icon.svg`,
    destination: product.id === 'cases' ? referencePage : product.destination
  }]),
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

/* Proposal B's Cases screens: only the three supplied screenshots. */
solutions.find(solution => solution.id === 'cases').screens = [
  { title: 'Dashboard', text: 'The case pipeline from waiting to completed, cases that need attention, your own queue, new cases per day and totals by case type and status.', image: 'assets/uis/cases/01.cases.indice.gr_dashboard.png', alt: 'Cases dashboard with the open case pipeline, cases needing attention, my queue, new cases this week and totals by case type and status' },
  { title: 'Case list', text: 'Every case with its customer, case type, checkpoint, assignee and submission date, with search, filters, saved searches and an assigned-to-me switch.', image: 'assets/uis/cases/02.cases.indice.gr_cases.png', alt: 'Cases list showing case number, customer, tax ID, group, case type, checkpoint, assignee and submission date for each case' },
  { title: 'Case details', text: 'The submitted form data next to the case information, the customer and the history, with tabs for attachments, data versions and related cases.', image: 'assets/uis/cases/03.cases.indice.gr_cases_82752196-2740-4a81-85d2-b7cf4a20b6fd_details.png', alt: 'Case details showing the case data form, basic case information, customer information and the case history' }
];

/* Proposal B's Risk screens: only the three supplied screenshots. */
solutions.find(solution => solution.id === 'risk').screens = [
  { title: 'Dashboard', text: 'Events received, high-risk evaluations and active rules, with the evaluations by risk level, the evaluations that need review and the rules that score every event.', image: 'assets/uis/risk/01.risk.indice.gr_dashboard.png', alt: 'Risk dashboard with events received, high risk and active rules, risk evaluations by level, needs review and rules' },
  { title: 'Risk events', text: 'Every transaction and user action reported for evaluation, filtered by date and more. Each event opens with its subject, amount, IP address, source, session and data.', image: 'assets/uis/risk/02.risk.indice.gr_risk-events(rightpane_event_3da35c57-56d0-4fce-8125-22ebcc68f028).png', alt: 'Risk events list with an event open in a side panel showing its type, amount, subject, IP address, source, session and JSON data' },
  { title: 'Risk results', text: 'The outcome of every evaluation, filtered by risk level. Each result opens with its level, score and the score and level of every rule that ran.', image: 'assets/uis/risk/03.risk.indice.gr_risk-results(rightpane_result_fcc9d829-486d-40bf-b5d9-f409287ad4ea)_page=1&filter=riskLevel__eq__None.png', alt: 'Risk results list filtered by risk level, with a result open in a side panel showing its risk level, score, rules executed and each rule\u2019s result' }
];

/* Proposal B's Messaging screens: only the three supplied screenshots. */
solutions.find(solution => solution.id === 'messaging').screens = [
  { title: 'Dashboard', text: 'Dispatched and failed messages, delivery success rate and active campaigns, with dispatches over time, the channel mix, audience reach and recent campaigns.', image: 'assets/uis/messaging/01.messaging.indice.gr_dashboard.png', alt: 'Messaging dashboard with dispatched, failed, delivery success rate and active campaigns, a dispatched versus failed chart, channel mix, audience and reach, and recent campaigns' },
  { title: 'Campaign details', text: 'A campaign\u2019s status, type, duration, call to action, communication channels, distribution list and email sender, with tabs for content, reports and recipients.', image: 'assets/uis/messaging/02.messaging.indice.gr_campaigns_ff73ecec-144d-4659-8520-12b0355d08a5_campaign-details.png', alt: 'Messaging campaign details showing the basic information of a published campaign' },
  { title: 'Template content', text: 'A template\u2019s content per communication channel: email, SMS, push notification and inbox, edited in a code editor next to a live preview.', image: 'assets/uis/messaging/03.messaging.indice.gr_templates_39373841-dd67-40fb-a9cd-4bd449b26739_template-content.png', alt: 'Messaging template editor with channel selection, the email sender, subject and HTML body, and a live preview of the email' }
];

/* Proposal B's IAM screens: only the three supplied screenshots. */
const iam = solutions.find(solution => solution.id === 'iam');
iam.screens = [
  { title: 'Admin dashboard', text: 'Users, sign-ins today, client applications and failed sign-ins, with daily sign-in activity, engagement, account security and the accounts that need attention.', image: 'assets/uis/iam/01.my.indice.gr_admin_dashboard.png', alt: 'IAM admin dashboard with user and sign-in totals, a 30-day sign-in activity chart, engagement, account security and accounts that need attention' },
  { title: 'Claim types', text: 'Every kind of information stored about users, with its display name and value type, and whether users can edit it or must provide it.', image: 'assets/uis/iam/02.my.indice.gr_admin_claim-types.png', alt: 'IAM claim types list showing name, display name, value type, user editable and required for each claim' },
  { title: 'Identity resources', text: 'Groups of user claims, such as email, phone, profile and role, that clients can request, marked required or emphasised.', image: 'assets/uis/iam/03.my.indice.gr_admin_resources_identity.png', alt: 'IAM identity resources list showing each resource with its display name, description and number of claims' }
];

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

module.exports = { content, newProducts, darkLogo, darkLogoPath, renderDarkLogos, themedLogo, referencePage };
