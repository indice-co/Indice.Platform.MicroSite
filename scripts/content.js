'use strict';

/* All copy for the INDICE Platform site, in page order. Edit here, then run `npm run build`.

   The page presents the platform's three pillars:
     01 Platform Foundation  the mortar   open-source libraries and engineering expertise
     02 Platform Suite       the bricks   six ready-made products
     03 Platform Services    the builder  development, integration, support, cloud practices, fintech experience

   Product facts come from the product documents (Indice.Platform/docs/*-Product.md) and, for Agents and Workers,
   from the Indice.Platform repository. Features the documents mark "next release" are left out. */

const site = {
  title: 'INDICE Platform',
  logo: 'assets/logos/indice platform grey.svg',
  icon: 'assets/logos/indice icon.svg',
  github: 'https://github.com/indice-co/Indice.Platform',
  githubLabel: 'indice-co',
  casesReference: 'cases-reference.html'
};

const hero = {
  eyebrow: 'INDICE Platform',
  title: 'Build your own product, SaaS or ecosystem.',
  lede: 'INDICE Platform brings together what that takes: an open-source foundation, a suite of six ready-made products, and the engineers who build alongside you. Start small and scale, in the cloud or on your own infrastructure.',
  primary: 'Explore the platform',
  secondary: 'Request a demo',
  /* The three pillars, linked from the hero. `id` is the section each one opens. */
  pillars: [
    { id: 'platform', name: 'Platform Foundation', role: 'The mortar', text: 'Open-source Indice libraries and years of engineering practice, under everything we build.' },
    { id: 'products', name: 'Platform Suite', role: 'The bricks', text: 'Agents, Cases, IAM, Messaging, Risk and Workers: six ready-made products for common business needs.' },
    { id: 'services', name: 'Platform Services', role: 'The builder', text: 'Our engineers develop, integrate and support alongside your team, from first build to daily operation.' }
  ],
  facts: [
    { label: 'Deploy anywhere', value: 'Cloud or on-premises, on any OS, environment or orchestrator' },
    { label: 'Your data stores', value: 'PostgreSQL, SQL Server, Redis, Elastic' },
    { label: 'Observability', value: 'First-class OpenTelemetry' },
    { label: 'AI built in', value: 'Assistants that answer from your own knowledge, with sources' },
    { label: 'Built with', value: '.NET and Angular' }
  ]
};

/* ---------- 01 Platform Foundation ---------- */
const foundation = {
  label: 'Platform Foundation',
  title: 'The foundation every solution is built on.',
  intro: 'The technological base of all our solutions: open-source Indice libraries, and the engineering expertise of the team that builds on them every day.',
  items: [
    { title: 'Indice open-source libraries', meta: 'NuGet · npm · GitHub', text: 'Proven, reusable building blocks that make software faster to build and more secure. They are published on NuGet and npm and developed in the open.' },
    { title: 'Engineering expertise', meta: 'Experience · Practices', text: 'Years of software development experience and well-established company practices, carried into every library and every delivery.' },
    { title: 'Start small, then scale', meta: 'Modular monolith · Microservices · Multitenancy', text: 'Begin with a single modular application and split it into services as you grow. Multitenant design is part of the foundation, so the same code can serve one organisation or many.' },
    { title: 'Deploy anywhere', meta: 'Cloud · On-premises', text: 'Any operating system, environment or orchestrator: IIS, Nginx, Kubernetes, AKS, EKS, Azure Container Apps and Azure Web Apps.' },
    { title: 'Your choice of data store', meta: 'Relational · Document', text: 'Use the stores you already run: major relational databases such as PostgreSQL and SQL Server, and document stores such as Redis and Elastic.' },
    { title: 'Observable from day one', meta: 'OpenTelemetry', text: 'Traces, metrics and logs through first-class OpenTelemetry integration, into the monitoring tools you already use.' },
    { title: 'Enterprise-standard technology', meta: '.NET · Angular', text: 'Built on .NET and Angular, technologies your team can hire for, support and keep for the long term.' }
  ],
  practices: {
    label: 'Best practices, built in',
    title: 'Build on what we have already solved.',
    intro: 'Run high-throughput APIs, workers and agents securely. Connect your services to the outside world. Secure and harden your product. The libraries carry the practices, so your team does not rebuild them for every project.',
    groups: [
      { title: 'Security and hardening', items: ['Rate limiting', 'IP restrictions', 'OWASP hardening: HSTS, secure headers, CSP', 'Input validation', 'Cryptography extensions', 'Least privilege'] },
      { title: 'Identity and access', items: ['Authentication extensions', 'Authorization extensions', 'Backend for frontend (BFF)', 'mTLS extensions', 'PSD2'] },
      { title: 'Architecture', items: ['Modular monolith or microservices', 'Multitenant design', 'Outbox', 'Mediator with platform events', 'OpenAPI 3.1 generation', 'SignalR extensions'] },
      { title: 'Background processing', items: ['Job scheduling', 'Pipelines and queues', 'Distributed locks', 'Leader election'] },
      { title: 'Operations and audit', items: ['Native OpenTelemetry', 'Audit logs', 'IP geolocation'] },
      { title: 'Integration SDK', items: ['Apple', 'GovGR and EU services', 'Email providers', 'SMS gateways', 'Push notification providers'] }
    ]
  }
};

/* Plate I: the orbital illustration between the Foundation and the Suite. Drawn from the product list. */
const plate = {
  label: 'Plate I',
  title: 'One foundation under every product.',
  text: 'Mortar and bricks. Every product in the suite is assembled from the same open-source Indice libraries, so the product you add next, or the one you build yourself, joins the same identity, hosting and extension patterns.',
  core: ['Indice', 'Platform'],
  /* Short labels: they turn around the core, and a long one runs into it. */
  ring: ['.NET', 'Angular', 'OpenID Connect', 'OTel', 'OpenAPI']
};

/* ---------- 02 Platform Suite ---------- */
const suite = {
  label: 'Platform Suite',
  title: 'Six products. No project starts from scratch.',
  intro: 'Ready-made products for common business needs: AI assistants, case workflows, identity, messaging, risk scoring and background processing. Adopt one, combine several, or build your own product on top of them.',
  guideLabel: 'Product by product',
  guideTitle: 'What each product does',
  guideIntro: 'What each product does, the features that set it apart and what it looks like in use.'
};

/* Listed in page order. Each product: what it does (`summary`, `does`), its standout features and its screens. */
const products = [
  {
    id: 'agents',
    name: 'Agents',
    logo: 'assets/logos/dex logo.svg',
    icon: 'assets/logos/dex icon.svg',
    color: '#E3272A',
    tagline: 'AI assistants grounded in your own knowledge',
    action: 'Give customers and staff an AI assistant that answers from your own documentation, with sources.',
    summary: 'Agents brings Dex, an AI assistant, to your web and mobile apps. It answers questions from your organisation’s own documentation, cites the sources it used, and says so when the sources do not cover a question.',
    does: [
      'Your documentation is ingested, split into passages and indexed for retrieval.',
      'Each message is routed to the agent best suited to handle it, such as the knowledge agent.',
      'The agent retrieves the most relevant passages and writes an answer with numbered citations.',
      'The answer streams to the user as it is written, and the conversation is saved so it can be continued or searched later.'
    ],
    features: [
      { title: 'Cited answers', text: 'Every answer lists the source sections it drew from, so readers can check it.' },
      { title: 'Strict grounding', text: 'On by default: when your documentation is not enough, the assistant declines instead of guessing.' },
      { title: 'Specialised agents', text: 'An intent router sends each message to the right agent. Auto lets it choose.' },
      { title: 'Connected to your systems', text: 'Through MCP, an operator agent can look up cases and case types, with one-time codes for sensitive steps.' },
      { title: 'Web and mobile, ready-made', text: 'A web chat app, plus iOS and Android SDKs that include a finished chat interface.' },
      { title: 'Rich replies', text: 'Markdown, code, diagrams, images, multiple choice, callouts and confirmations, not only plain text.' }
    ],
    stack: ['.NET', 'Azure OpenAI', 'Angular', 'Swift and Kotlin SDKs'],
    screens: [
      { title: 'New chat', text: 'Ask Dex a question, or start from a suggested prompt. Auto lets the router pick the agent; earlier conversations are listed and searchable on the left.', image: 'assets/uis/agents/01.agents.indice.gr_.png', alt: 'Dex web chat start screen with the question box, the agent selector set to Auto, suggested prompts and an empty conversation list' },
      { title: 'Answer with sources', text: 'A streamed answer drawn from your documentation, with numbered citations in the text and the source sections it used listed below.', image: 'assets/uis/agents/02.agents.indice.gr_ (2).png', alt: 'Dex answer about Indice.Platform with inline citations and two linked source sections below it' },
      { title: 'Rich replies', text: 'Answers can carry markdown, code and diagrams, here a sequence diagram of the IAM sign-in and validation flow.', image: 'assets/uis/agents/03.agents.indice.gr_ (3).png', alt: 'Dex answer containing a sequence diagram of the IAM registration, email confirmation and validation flow' }
    ]
  },
  {
    id: 'cases',
    name: 'Cases',
    logo: 'assets/logos/cases logo.svg',
    icon: 'assets/logos/cases icon.svg',
    color: '#12707A',
    destination: site.casesReference,
    tagline: 'Case management and back-office workflows',
    action: 'Run applications, requests and approvals as configurable case types.',
    summary: 'Cases runs form-driven processes, such as applications, service requests and approvals, on one record shared by customers and back-office staff. A new process is configuration, not a development project.',
    does: [
      'Define a case type: the form, the states a case moves through and the workflow that decides who acts next.',
      'Customers submit cases from your web and mobile apps, and staff open cases on a customer’s behalf. Both follow the same process.',
      'The back office shows each person only the actions waiting for them: assign, edit, approve, reject or a custom action.',
      'Customers follow progress through public statuses, while internal steps and data stay internal.'
    ],
    features: [
      { title: 'Processes as configuration', text: 'A new process is a form, a set of checkpoints and a workflow. No new screens, tables or deployments.' },
      { title: 'Visual workflow designer', text: 'Design and publish workflows in the browser, without a redeploy.' },
      { title: 'Four-eyes approval', text: 'Maker-checker steps, role-limited approvals and translated rejection reasons are part of the workflow.' },
      { title: 'Public and private views', text: 'Customers see public statuses and published data only. Everything else stays with the back office.' },
      { title: 'Full history', text: 'Every state change, data version, comment and approval is recorded, and each case can be produced as a PDF.' },
      { title: 'Record-level access', text: 'Access by role, by rule on a case, case type or checkpoint, and by ownership.' }
    ],
    stack: ['.NET', 'Elsa Workflows', 'JSON Schema and JSON Forms', 'Angular'],
    /* Shown at the top of the Cases technical reference. */
    referenceLede: 'Cases connects customer requests with the teams and workflows that resolve them. Forms, assignments, approvals, and progress come together in one place, with controlled visibility for customers and internal teams.',
    screens: [
      { title: 'Dashboard', text: 'The case pipeline from waiting to completed, cases that need attention, your own queue, new cases per day and totals by case type and status.', image: 'assets/uis/cases/01.cases.indice.gr_dashboard.png', alt: 'Cases dashboard with the open case pipeline, cases needing attention, my queue, new cases this week and totals by case type and status' },
      { title: 'Case list', text: 'Every case with its customer, case type, checkpoint, assignee and submission date, with search, filters, saved searches and an assigned-to-me switch.', image: 'assets/uis/cases/02.cases.indice.gr_cases.png', alt: 'Cases list showing case number, customer, tax ID, group, case type, checkpoint, assignee and submission date for each case' },
      { title: 'Case details', text: 'The submitted form data next to the case information, the customer and the history, with tabs for attachments, data versions and related cases.', image: 'assets/uis/cases/03.cases.indice.gr_cases_82752196-2740-4a81-85d2-b7cf4a20b6fd_details.png', alt: 'Case details showing the case data form, basic case information, customer information and the case history' }
    ]
  },
  {
    id: 'iam',
    name: 'IAM',
    logo: 'assets/logos/iam logo.svg',
    icon: 'assets/logos/iam icon.svg',
    color: '#3D5AFE',
    tagline: 'Identity and access management',
    action: 'Sign in staff, customers and partners with MFA and device trust.',
    summary: 'IAM is your own identity provider: one sign-in for workforce, customers and partners, with multi-factor authentication, trusted devices, audit trails, self-service account pages and an admin console. It speaks OpenID Connect and OAuth2, so any standard application can connect to it.',
    does: [
      'Users sign in with a password or an external provider such as Apple, Google, Microsoft, Facebook or GovGr.',
      'Multi-factor authentication follows where it is required: SMS, email, Viber, authenticator app, push approval on a trusted device, or FIDO2 / WebAuthn.',
      'Before access is granted, a chain of checks handles terms acceptance, MFA enrolment, email and phone confirmation and password expiry.',
      'Every sign-in is logged with its device and location, and every administrative change is audited.'
    ],
    features: [
      { title: 'Six MFA methods', text: 'From SMS and email codes to push approval and FIDO2, optional or enforced.' },
      { title: 'Device trust with a delay', text: 'A newly registered device is not trusted until an activation window has passed.' },
      { title: 'Impossible-travel detection', text: 'Sign-ins from places too far apart in too little time prompt for MFA or are denied.' },
      { title: 'Two audit trails', text: 'Sign-in logs and activity logs, each with its own store and retention.' },
      { title: 'GovGr and social sign-in', text: 'GovGr (TaxisNet), Apple, Google, Microsoft and Facebook built in, plus any standard OpenID Connect provider.' },
      { title: 'Sign-in pages you own', text: 'Themed per client application and replaceable page by page, without forking.' }
    ],
    stack: ['.NET', 'Duende IdentityServer', 'OpenID Connect and OAuth2', 'Angular'],
    partner: {
      label: 'Official partner',
      name: 'Duende Software',
      logo: 'assets/logos/duende logo.svg',
      text: 'INDICE is an official distributor and integrator of Duende Software, the company behind Duende IdentityServer. We license, deploy and integrate IdentityServer as part of IAM, and support it alongside the rest of the platform.',
      href: 'https://duendesoftware.com/',
      site: 'duendesoftware.com'
    },
    screens: [
      { title: 'Admin dashboard', text: 'Users, sign-ins today, client applications and failed sign-ins, with daily sign-in activity, engagement, account security and the accounts that need attention.', image: 'assets/uis/iam/01.my.indice.gr_admin_dashboard.png', alt: 'IAM admin dashboard with user and sign-in totals, a 30-day sign-in activity chart, engagement, account security and accounts that need attention' },
      { title: 'Claim types', text: 'Every kind of information stored about users, with its display name and value type, and whether users can edit it or must provide it.', image: 'assets/uis/iam/02.my.indice.gr_admin_claim-types.png', alt: 'IAM claim types list showing name, display name, value type, user editable and required for each claim' },
      { title: 'Identity resources', text: 'Groups of user claims, such as email, phone, profile and role, that clients can request, marked required or emphasised.', image: 'assets/uis/iam/03.my.indice.gr_admin_resources_identity.png', alt: 'IAM identity resources list showing each resource with its display name, description and number of claims' }
    ]
  },
  {
    id: 'messaging',
    name: 'Messaging',
    logo: 'assets/logos/messaging logo.svg',
    icon: 'assets/logos/messaging icon.svg',
    color: '#5B4FE0',
    tagline: 'Multichannel campaigns and notifications',
    action: 'Send campaigns and transactional messages on every channel.',
    summary: 'Messaging delivers marketing campaigns and transactional messages, such as one-time codes, receipts and alerts, over in-app inbox, push, email and SMS or Viber. Both run through one pipeline, with the same templates, audiences, recipient preferences and analytics.',
    does: [
      'Operators build a campaign with content per channel, an audience from a distribution list or CSV import, and a schedule. Nothing is sent until it is published.',
      'Your other systems send transactional messages through the same pipeline with a single call.',
      'For each recipient, Messaging keeps only the channels they chose and can actually receive.',
      'Delivery and engagement roll up into Reached, Engaged, Acted and Coverage metrics.'
    ],
    features: [
      { title: 'One campaign, four channels', text: 'Inbox, push, email and SMS or Viber on a single campaign, with content written per channel.' },
      { title: 'Preference-aware delivery', text: 'Recipients choose channels per message type: offers by email, alerts by push.' },
      { title: 'Must-deliver messages', text: 'Transactional messages can override preferences, separating “you opted in” from “you must receive this”.' },
      { title: 'Swap vendors by setting', text: 'Email, SMS, Viber and push providers are configuration, with Greek SMS gateways next to the global ones.' },
      { title: 'Templates with live preview', text: 'Reusable templates, partials and layouts per channel, edited next to a live preview.' },
      { title: 'In-app inbox', text: 'A message inbox for your own apps, with read state and real-time notifications.' }
    ],
    stack: ['.NET', 'Queues and background workers', 'Handlebars templates', 'Angular'],
    screens: [
      { title: 'Dashboard', text: 'Dispatched and failed messages, delivery success rate and active campaigns, with dispatches over time, the channel mix, audience reach and recent campaigns.', image: 'assets/uis/messaging/01.messaging.indice.gr_dashboard.png', alt: 'Messaging dashboard with dispatched, failed, delivery success rate and active campaigns, a dispatched versus failed chart, channel mix, audience and reach, and recent campaigns' },
      { title: 'Campaign details', text: 'A campaign’s status, type, duration, call to action, communication channels, distribution list and email sender, with tabs for content, reports and recipients.', image: 'assets/uis/messaging/02.messaging.indice.gr_campaigns_ff73ecec-144d-4659-8520-12b0355d08a5_campaign-details.png', alt: 'Messaging campaign details showing the basic information of a published campaign' },
      { title: 'Template content', text: 'A template’s content per communication channel: email, SMS, push notification and inbox, edited in a code editor next to a live preview.', image: 'assets/uis/messaging/03.messaging.indice.gr_templates_39373841-dd67-40fb-a9cd-4bd449b26739_template-content.png', alt: 'Messaging template editor with channel selection, the email sender, subject and HTML body, and a live preview of the email' }
    ]
  },
  {
    id: 'risk',
    name: 'Risk',
    logo: 'assets/logos/risk logo.svg',
    icon: 'assets/logos/risk icon.svg',
    color: '#0F7C8C',
    tagline: 'Real-time risk scoring for transactions and activity',
    action: 'Score payments, logins and account changes before they commit.',
    summary: 'Risk scores operations such as payments, transfers, logins and profile changes in real time, before your application commits them. The application then lets the operation through, asks for extra verification or blocks it.',
    does: [
      'Before committing an operation, your application sends it to the engine: who, what, how much and from where.',
      'The engine adds the location of the caller’s IP address and runs every enabled rule.',
      'The results combine into one score and one level, from None to High.',
      'Completed operations are recorded, so rules can check history: how often, how much and from which countries.'
    ],
    features: [
      { title: 'Thresholds without a release', text: 'Operators change limits, lists and switches from the console, and rules pick them up within seconds.' },
      { title: 'Explainable decisions', text: 'Every assessment is stored with each rule’s score and reason, long after the decision was made.' },
      { title: 'One policy, every channel', text: 'Web banking, mobile, payments and sign-in flows call the same engine and follow the same rules.' },
      { title: 'Rules as code', text: 'A new fraud pattern is a new rule, reviewed, tested and versioned like the rest of your software.' },
      { title: 'Offline geolocation', text: 'IP addresses resolve to a country and coordinates on your own servers. Lookups never leave the host.' },
      { title: 'Investigation console', text: 'Filter by subject, session, IP, country or transaction, and drill into any decision.' }
    ],
    stack: ['.NET', 'GeoIP and spatial data', 'OAuth2-protected APIs', 'Angular'],
    screens: [
      { title: 'Dashboard', text: 'Events received, high-risk evaluations and active rules, with the evaluations by risk level, the evaluations that need review and the rules that score every event.', image: 'assets/uis/risk/01.risk.indice.gr_dashboard.png', alt: 'Risk dashboard with events received, high risk and active rules, risk evaluations by level, needs review and rules' },
      { title: 'Risk events', text: 'Every transaction and user action reported for evaluation, filtered by date and more. Each event opens with its subject, amount, IP address, source, session and data.', image: 'assets/uis/risk/02.risk.indice.gr_risk-events(rightpane_event_3da35c57-56d0-4fce-8125-22ebcc68f028).png', alt: 'Risk events list with an event open in a side panel showing its type, amount, subject, IP address, source, session and JSON data' },
      { title: 'Risk results', text: 'The outcome of every evaluation, filtered by risk level. Each result opens with its level, score and the score and level of every rule that ran.', image: 'assets/uis/risk/03.risk.indice.gr_risk-results(rightpane_result_fcc9d829-486d-40bf-b5d9-f409287ad4ea)_page=1&filter=riskLevel__eq__None.png', alt: 'Risk results list filtered by risk level, with a result open in a side panel showing its risk level, score, rules executed and each rule’s result' }
    ]
  },
  {
    id: 'workers',
    name: 'Workers',
    logo: 'assets/logos/workers logo.svg',
    icon: 'assets/logos/workers icon.svg',
    color: '#F59E0B',
    tagline: 'Background jobs, queues and scheduling',
    action: 'Run scheduled and queued background work, and watch it from one dashboard.',
    summary: 'Workers runs the background work every system needs: scheduled jobs and queue-driven processing, reliably across several instances. Operators see queues, scheduled tasks, servers and locks on one dashboard, and can requeue or run work themselves.',
    does: [
      'Developers write a job once and trigger it on a schedule or from a queue.',
      'Work is retried when it fails, and messages that keep failing move to a poison queue instead of blocking the rest.',
      'Each worker reports a heartbeat, so the dashboard shows which servers are alive.',
      'Operators requeue messages, run or pause tasks and release locks from the dashboard.'
    ],
    features: [
      { title: 'Live dashboard', text: 'Enqueued, scheduled, retrying and poison messages, queue depth over time and the tasks that need attention.' },
      { title: 'Poison queues', text: 'Messages that exceed their retry limit are set aside, ready to inspect, edit and requeue.' },
      { title: 'Transactional enqueue', text: 'Messages are enqueued in the same transaction as your data, so the two never disagree.' },
      { title: 'Run now, pause, resume', text: 'Each scheduled task shows its last and next run, its last error and the state it keeps between runs.' },
      { title: 'Health checks and metrics', text: 'Health checks for poison messages and stuck tasks, and metrics ready for OpenTelemetry.' },
      { title: 'SQL Server or PostgreSQL', text: 'Queues, tasks, servers and locks live in the relational database you already run.' }
    ],
    stack: ['.NET', 'Quartz', 'SQL Server or PostgreSQL', 'Angular'],
    screens: [
      { title: 'Dashboard', text: 'A live view of enqueued, scheduled, retrying and poison messages, scheduled tasks, running and failing tasks and active locks, with queue depth over time, the busiest queues and the tasks that need attention.', image: 'assets/uis/workers/01.workers.indice.gr_.png', alt: 'Workers dashboard with message and task counters, a live queue depth chart, the busiest queues and tasks needing attention' },
      { title: 'Queue message', text: 'One message with its queue, status, availability, attempts and JSON payload, ready to requeue, edit and requeue, or delete.', image: 'assets/uis/workers/02.workers.indice.gr_messages_e38ce480-dcd2-4024-9ad5-f0363e49b716.png', alt: 'Workers message detail showing the queue, status, available-at time, attempts and JSON payload, with Requeue, Edit and requeue and Delete' },
      { title: 'Scheduled task', text: 'A task’s handler, description, last and next run and run count, its last error and the state it keeps between runs, with Run now and an Enabled switch.', image: 'assets/uis/workers/03.workers.indice.gr_scheduled_samples.report.png', alt: 'Workers scheduled task detail showing its overview, last error and persisted state, with Run now and an Enabled switch' }
    ]
  }
];

/* ---------- 03 Platform Services ---------- */
const services = {
  label: 'Platform Services',
  title: 'A partner from first build to daily operation.',
  intro: 'We help you build your own solutions beside the platform or on top of it, integrate with whatever your business needs, and keep it all running. Consult with us, design with us, and create added value together.',
  items: [
    { title: 'Software development', text: 'Software tailored to your needs, built on the same foundation as our own products.' },
    { title: 'Integration', text: 'The Platform Suite products connected to your systems and processes.' },
    { title: 'Ongoing support', text: 'New features, regular security updates with CVE patching, and immediate technical assistance.' },
    { title: 'Cloud practices', text: 'Proven methods for deploying applications and monitoring them continuously, so they remain stable and available.' },
    { title: 'Fintech experience', text: 'In-depth knowledge of the sector’s requirements, regulations and particularities.' }
  ]
};

const faq = {
  label: 'Questions',
  title: 'What teams ask first',
  items: [
    { q: 'Is this a SaaS?', a: 'No. You deploy the platform in your own environment, in the cloud or on premises, and your data stays with you. It is also what you can build your own SaaS on: multitenant design is part of the foundation.' },
    { q: 'Can we start with one product?', a: 'Yes. Each product stands on its own. Every product you add reuses the same hosting, identity and extension patterns, so the second is easier than the first.' },
    { q: 'Can we build our own product on it?', a: 'Yes. The foundation libraries are open source, and our engineers can build alongside your team or deliver the whole solution.' },
    { q: 'Where can it run?', a: 'On any operating system, environment or orchestrator: IIS, Nginx, Kubernetes, AKS, EKS, Azure Container Apps and Azure Web Apps.' },
    { q: 'Which data stores does it use?', a: 'The ones you already run: major relational databases such as PostgreSQL and SQL Server, and document stores such as Redis and Elastic.' },
    { q: 'Where does AI fit in?', a: 'Agents is the suite’s AI product: assistants that answer from your own documentation with cited sources, and connect to your systems. It is built on the same foundation as the rest of the suite.' },
    { q: 'How do we customise a product without forking it?', a: 'Through extension points registered in your own application, such as risk rules, workflow activities, sign-in steps and message providers, and by replacing pages and interface text.' },
    { q: 'What does INDICE do after go-live?', a: 'Ongoing support: new features, regular security updates with CVE patching, immediate technical assistance, and new development as your requirements change.' }
  ]
};

const contact = {
  label: 'Contact',
  title: 'See it against your own requirements.',
  text: 'Request a demonstration focused on your processes, your systems and what you want to build.',
  button: 'Request a demo'
};

const footer = {
  note: 'Product facts come from the INDICE product documents and the open-source Indice.Platform repository.',
  colophon: 'Set in Manrope. Dark by default; your theme choice is remembered.'
};

/* Interface labels. */
const ui = {
  mastheadNote: 'Foundation · Suite · Services',
  contents: 'Contents',
  closeContents: 'Close contents',
  pillars: 'The three pillars',
  facts: 'At a glance',
  learnMore: 'Learn more',
  details: 'Technical details',
  readCasesReference: 'Read the Cases technical reference',
  does: 'What it does',
  features: 'Highlights',
  stack: 'Built with',
  themeToggle: 'Dark theme',
  colophon: 'Colophon',
  backToTop: 'Back to top',
  screens: 'Screens',
  screenPending: 'Screenshot pending',
  galleryHint: 'Point left or right to browse. Select a screen to enlarge it.',
  scrollBack: 'Show previous screens',
  scrollForward: 'Show more screens',
  previousScreen: 'Previous screen',
  nextScreen: 'Next screen',
  closeViewer: 'Close screen viewer',
  /* Words that follow the product names in the ticker above the contact section. */
  ticker: ['Build your own', 'Open source']
};

module.exports = { site, hero, foundation, plate, suite, products, services, faq, contact, footer, ui };
