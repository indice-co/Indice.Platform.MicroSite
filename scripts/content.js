'use strict';

/* All copy for the INDICE Platform site, in page order. Edit here, then run `npm run build`.

   The page presents the platform's three pillars:
     01 Platform Foundation  open-source libraries and engineering expertise
     02 Platform Suite       six ready-made products
     03 Platform Services    development, integration, DevOps, support, fintech experience

   Product facts come from the product documents (Indice.Platform/docs/*-Product.md). Features the documents mark
   "next release" are left out. */

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
  /* The three pillars, linked from the hero. `id` is the section each one opens; `role` says what the pillar is. */
  pillars: [
    { id: 'platform', name: 'Platform Foundation', role: 'Open-source libraries', text: 'Open-source Indice libraries and years of engineering practice, under everything we build.' },
    { id: 'products', name: 'Platform Suite', role: 'Six ready-made products', text: 'Agents, Cases, IAM, Messaging, Risk and Workers: six ready-made products for common business needs.' },
    { id: 'services', name: 'Platform Services', role: 'Engineering and DevOps', text: 'Our engineers develop, integrate, release and support alongside your team, from first build to daily operation.' }
  ],
  facts: [
    { label: 'Deploy anywhere', value: 'Cloud or on-premises, on any OS, environment or orchestrator' },
    { label: 'Your data stores', value: 'PostgreSQL, SQL Server, Redis, Elastic' },
    { label: 'Observability', value: 'First-class OpenTelemetry' },
    { label: 'AI built in', value: 'Create, configure and automate AI agents and workflows' },
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
  text: 'Every product in the suite is assembled from the same open-source Indice libraries, so the product you add next, or the one you build yourself, joins the same identity, hosting and extension patterns.',
  core: ['Indice', 'Platform'],
  /* Short labels: they turn around the core, and a long one runs into it. */
  ring: ['.NET', 'Angular', 'OpenID Connect', 'OTel', 'OpenAPI']
};

/* ---------- 02 Platform Suite ---------- */
const suite = {
  label: 'Platform Suite',
  title: 'Six products. No project starts from scratch.',
  intro: 'Ready-made products for common business needs: AI agents, case workflows, identity, messaging, risk scoring and background processing. Adopt one, combine several, or build your own product on top of them.',
  guideLabel: 'Product by product',
  guideTitle: 'What each product does',
  guideIntro: 'What each product does, the features that set it apart and what it looks like in use.'
};

/* Listed in page order. Each product: what it does (`summary`, `does`), its standout features and its screens.
   Optional: `technical` (a short technical summary, IAM only), `partner` and `destination` (a technical reference page). */
const products = [
  {
    id: 'agents',
    name: 'Agents',
    logo: 'assets/logos/dex logo.svg',
    /* The supplied logo reads "Dex, Knowledge assistant". Agents is more than that, so the site shows a generated copy
       without the second line. Remove this flag to show the supplied logo as it is. */
    logoDescriptor: false,
    icon: 'assets/logos/dex icon.svg',
    color: '#E3272A',
    tagline: 'AI agents for assistants, self-service and automation',
    action: 'Create, configure and automate AI agents and workflows, then put them in front of customers and staff.',
    summary: 'Agents is a product for creating, configuring and automating AI agents and workflows, and putting them in front of people. A router picks the right agent for every message: to answer from your documents, act in other systems through tools, or guide someone through a multi-step flow. Dex, the assistant in the screens below, is built with it.',
    does: [
      'Create an agent or a multi-step workflow and register it with a description of what it does. It is routed, served and listed like the built-in agents.',
      'People write in one conversation, in the ready-made chat application, the embeddable widget or your own interface. A router reads each message and picks the agent that fits.',
      'The agent answers from your documents and shows its sources, or calls tools to look things up and carry out tasks in other systems.',
      'When a workflow needs a person, it pauses to ask for a choice, a one-time code or a confirmation, and continues from the same point when the answer arrives.'
    ],
    features: [
      { title: 'Register an agent, get a product', text: 'A new agent is its own logic plus a description. Routing, streaming, history, the chat interface and usage limits are already there.' },
      { title: 'Human in the loop', text: 'A workflow pauses for a choice, a one-time code or a confirmation. The pause survives restarts and resumes when the answer comes.' },
      { title: 'Tools through MCP', text: 'Agents act on other systems through Model Context Protocol servers. Cases and IAM already work as tool servers.' },
      { title: 'Settings, not code', text: 'Prompts, the assistant’s identity and usage limits are templates and settings. So is the model: Azure OpenAI, Azure AI Foundry, OpenAI or one you host.' },
      { title: 'Grounded, cited answers', text: 'The knowledge agent answers from the documents you ingest, lists its sources, and declines when they cannot support an answer.' },
      { title: 'Built to face customers', text: 'Guests get a real, short-lived token. A one-time code comes before any personal record, and personal data is masked before it reaches the model.' }
    ],
    stack: ['.NET', 'Microsoft Agent Framework (MAF)', 'Model Context Protocol (MCP)', 'Azure OpenAI, OpenAI or local models', 'Angular'],
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
    stack: ['.NET', 'Duende IdentityServer', 'ASP.NET Core Identity', 'OpenID Connect and OAuth2', 'Angular'],
    /* IAM is a security product, so its entry keeps a short technical summary; the other entries have none.
       Text between backticks is set as code. */
    technical: {
      title: 'Security in detail',
      items: [
        { term: 'Standards', text: 'OpenID Connect and OAuth2, served by Duende IdentityServer, with users stored in ASP.NET Core Identity.' },
        { term: 'Custom grants', text: 'Five grant types on top of the standard flows: `totp` and `mfa` for step-up, `device_authentication` for registered devices, `delegation` to act on behalf of a user, and `urn:indice:guest` for anonymous app installs.' },
        { term: 'Sessions', text: 'Server-side sessions: the cookie holds only a reference, so a session is revoked by deleting it. A single active session per user can be enforced.' },
        { term: 'Rate limiting', text: 'A rule per endpoint, each with its own limit and window. The reference template ships 20, covering login, registration, forgot-password, one-time codes and every account change.' },
        { term: 'Bots and lockout', text: 'reCAPTCHA v3 on login, registration and forgot-password, falling back to the v2 checkbox on a low score. Repeated failed attempts lock the account.' },
        { term: 'Passwords', text: 'Length and character rules, history, expiry, a blacklist and a common-password check. A password change can revoke the user’s refresh tokens, reference tokens and consents.' },
        { term: 'Tunable defaults', text: 'Device trust after 48 hours, impossible travel above 400 km/h, and sign-in logs kept for 90 days.' },
        { term: 'Keys and data', text: 'Tokens are signed with your own certificate. Users, configuration, grants and both audit logs live in five databases that you host.' },
        { term: 'Extension points', text: 'Interfaces such as `IExtensionGrantValidator` and `IIdentityValidationActivity` let you add grants, post-login steps, MFA methods and log fields as C# classes in your own host.' }
      ]
    },
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
      'A distributed lock keeps a singleton task to one run at a time, however many instances are deployed.',
      'Operators requeue messages, run or pause tasks and release locks from the dashboard.'
    ],
    features: [
      { title: 'Live dashboard', text: 'Enqueued, scheduled, retrying and poison messages, queue depth over time and the tasks that need attention.' },
      { title: 'Poison queues', text: 'Messages that exceed their retry limit are set aside, ready to inspect, edit and requeue.' },
      { title: 'Transactional enqueue', text: 'Messages are enqueued in the same transaction as your data, so the two never disagree.' },
      { title: 'Run now, pause, resume', text: 'Each scheduled task shows its last and next run, its last error and the state it keeps between runs.' },
      { title: 'Health checks', text: 'Report poison messages above a threshold, and tasks that run too long or miss their schedule.' },
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
/* The chapter opens with the offer and Plate II, then the five services and the path an engagement follows. Every point
   under a service is something the foundation or a product document already states, or a practice the team names as
   its own (cloud, release management, monitoring); nothing here is a figure, a client name or a contractual term. */
const services = {
  label: 'Platform Services',
  title: 'A partner from first build to daily operation.',
  intro: 'The team behind the foundation and the suite works on your project. We build your own solutions on top of the platform or beside it, connect them to the systems you already have, release them to the cloud or to your own infrastructure, and keep everything running after go-live.',
  /* Plate II: the products stacked on the foundation, drawn from the product list. The next place is the client's. */
  plate: {
    label: 'Plate II',
    text: 'Six products stand on one foundation. The next one is yours, and we build it with you.',
    foundation: 'Platform Foundation',
    yours: 'Your product'
  },
  listLabel: 'What we do',
  listTitle: 'Five services, one team.',
  listIntro: 'What the partnership covers, and what each part gives you. All of it stands on the foundation and the products described above.',
  /* `pointsLabel` heads what a service gives: a list of `points` beside it, or `groups` of points set across the row
     below it. DevOps has groups, one for each part of the practice. */
  items: [
    {
      title: 'Software development',
      tagline: 'Tailored to you, built on what already works.',
      text: 'Software designed around your needs, on the same foundation as our own products. Identity, messaging, workflows and background jobs are already solved, so the effort goes into what is specific to your business.',
      pointsLabel: 'What you get',
      points: [
        'Your own product, SaaS or ecosystem, on top of the suite or beside it',
        'A single modular application to start, split into services as you grow',
        'Multitenant design, for one organisation or many',
        'AI agents and automated workflows, where they help'
      ]
    },
    {
      title: 'Integration',
      tagline: 'The suite, working inside your systems.',
      text: 'The Platform Suite products connected to your systems and processes, and shaped to the way your organisation works, without forking them.',
      pointsLabel: 'What you get',
      points: [
        'Products fitted to your processes through extension points: risk rules, workflow steps, sign-in steps and message providers',
        'An integration SDK for Apple, GovGR and EU services, and for email, SMS and push providers',
        'APIs described with OpenAPI 3.1, for your own applications to call',
        'Cases and IAM available as tools for your AI agents'
      ]
    },
    {
      title: 'DevOps',
      tagline: 'Released with care, monitored continuously.',
      text: 'How software reaches production matters as much as how it is written. Our DevOps practice covers cloud infrastructure, release management and monitoring: proven methods that keep your applications stable and available, in the cloud or on your own infrastructure.',
      pointsLabel: 'What it covers',
      groups: [
        {
          title: 'Cloud',
          points: [
            'Kubernetes, AKS, EKS, Azure Container Apps and Azure Web Apps',
            'Your own infrastructure as well: IIS or Nginx, on any operating system',
            'Several instances side by side, kept in step by distributed locks and leader election'
          ]
        },
        {
          title: 'Release management',
          points: [
            'Repeatable releases, from development through to production',
            'Database changes delivered as versioned migrations, product by product',
            'Limits, workflows and templates that operators change without a release'
          ]
        },
        {
          title: 'Monitoring',
          points: [
            'Traces, metrics and logs through OpenTelemetry, into the monitoring tools you already use',
            'Health checks on databases, storage and queues',
            'A warning when messages keep failing, or a scheduled task runs long or misses its schedule'
          ]
        }
      ]
    },
    {
      title: 'Ongoing support',
      tagline: 'Still with you after go-live.',
      text: 'Going live is where daily operation starts. We keep your software current and secure, and we are there when something needs attention.',
      pointsLabel: 'What you get',
      points: [
        'New features as your requirements change',
        'Regular security updates, with CVE patching',
        'Immediate technical assistance'
      ]
    },
    {
      title: 'Fintech experience',
      tagline: 'We know the rules you work under.',
      text: 'In-depth knowledge of the sector’s requirements, regulations and particularities. It shows in the platform itself.',
      pointsLabel: 'Where it shows',
      points: [
        'PSD2 and mTLS extensions in the foundation',
        'Multi-factor authentication, device trust and impossible-travel detection in IAM',
        'A risk score before a payment, transfer or login is committed, in Risk',
        'Maker-checker approval and a full history of every case, in Cases'
      ]
    }
  ],
  process: {
    label: 'How we work',
    title: 'Consult with us, design with us, build with us.',
    intro: 'Start with a single product or with a whole solution. The path is the same, and it does not end at go-live.',
    steps: [
      { title: 'Consult', text: 'We start from what you want to build, the systems you already have and the regulations you work under.' },
      { title: 'Design', text: 'Together we shape the solution: which products fit, what is integrated and what is built new.' },
      { title: 'Build', text: 'Our engineers develop and integrate, alongside your team or delivering the whole solution.' },
      { title: 'Launch', text: 'We release it to the cloud or to your own infrastructure, monitored from the first day.' },
      { title: 'Operate', text: 'We stay on with new features, security updates and technical assistance.' }
    ]
  }
};

/* Not a list of quick answers: four questions a decision turns on, each answered at length. A question has the answer
   in one line (`short`), the reasoning (`paragraphs`) and the part of the page that shows it (`see`). The chapter has
   no title: its label is its heading, and the first question follows. Add a `title` to give it one. */
const faq = {
  label: 'Questions',
  items: [
    {
      q: 'Do we adopt a product, or build our own?',
      short: 'Both, in whichever order suits you.',
      paragraphs: [
        'Each product in the suite stands on its own, so you can start with one: IAM for sign-in, Cases for a back-office process, Messaging for notifications. You fit it to your organisation without forking it, through configuration and through extension points such as risk rules, workflow steps, sign-in steps and message providers, and by replacing pages and interface text.',
        'What is specific to your business is built new, on the same open-source foundation the products are built on. Every product you add, and everything you build, reuses the same hosting, identity and extension patterns, so the second step is easier than the first.'
      ],
      see: { href: '#products', label: 'See the Platform Suite' }
    },
    {
      q: 'How much of it stays in our hands?',
      short: 'Where it runs, where the data lives and which vendors it talks to are your decisions.',
      paragraphs: [
        'The platform runs in the cloud or on your own infrastructure, on any operating system, environment or orchestrator. It keeps its data in databases you host: PostgreSQL or SQL Server, with Redis and Elastic where a document store fits. In IAM, tokens are signed with your own certificate. In Risk, IP addresses are resolved on your own servers and lookups never leave the host.',
        'The foundation libraries are open source, published on NuGet and npm and developed in the open. The products speak open standards, OpenID Connect and OAuth2, OpenAPI 3.1, OpenTelemetry and the Model Context Protocol, so standard applications and tools connect to them. Email, SMS and push providers are settings, and so is the AI model.'
      ],
      see: { href: '#platform', label: 'See the Platform Foundation' }
    },
    {
      q: 'Where does AI fit in, and how far can we trust it?',
      short: 'Agents is the suite’s AI product, and it is built to face customers.',
      paragraphs: [
        'Agents is a tool for creating, configuring and automating AI agents and workflows. A router picks the right agent for each message: to answer from your documents and list its sources, to act in your systems through tools, or to guide someone through a multi-step flow. Cases and IAM already work as its tools, and you choose the model: Azure OpenAI, Azure AI Foundry, OpenAI or one you host.',
        'The controls matter as much as the model. The knowledge agent declines when your documents cannot support an answer. A workflow pauses for a person when it needs a choice, a one-time code or a confirmation. A one-time code comes before any personal record, personal data is masked before it reaches the model, and usage limits are settings.'
      ],
      see: { href: '#spec-agents', label: 'See Agents' }
    },
    {
      q: 'What happens after go-live?',
      short: 'We stay on, and much of the daily change never needs a release.',
      paragraphs: [
        'Day-to-day change is in the hands of your own operators. They adjust risk limits from the console, design and publish workflows in the browser, edit message templates beside a live preview, and requeue or pause background work from a dashboard.',
        'The rest we carry with you: releases, monitoring, new features as your requirements change, regular security updates with CVE patching, and immediate technical assistance. Traces, metrics and logs go through OpenTelemetry into the monitoring tools you already use, so your team sees what ours sees.'
      ],
      see: { href: '#services', label: 'See Platform Services' }
    }
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
