'use strict';

/* Homepage-only copy for the three homepage proposals (proposal-a/b/c.html).
   Written for technical managers and developers from the supplied product documents (Cases-Product.md,
   Identity-Product.md, Messaging-Product.md, Risk-Product.md) and platform-pillars-en.md. Features the documents
   mark "next release" are excluded. cases-product.md, js/data.js and the Cases technical reference keep their own
   text: nothing here is read by scripts/render-cases*.js. Code samples are verbatim excerpts from the documents. */

const hero = {
  eyebrow: 'INDICE Platform · .NET and Angular',
  title: 'Self-hosted .NET solutions for identity, case workflows, messaging and risk.',
  lede: 'For engineering teams in financial services, fintech and the public sector that keep data, signing keys and operations in their own environment. Each solution runs inside your ASP.NET Core host, on your SQL Server, with REST APIs and an embedded Angular admin UI that your developers extend in C#.',
  audience: [
    { role: 'Technical managers', text: 'Deliver regulated, customer-facing services on proven, reusable building blocks instead of starting each project from scratch.' },
    { role: 'Developers', text: 'Compose NuGet and npm packages in your own host, then extend them through C# interfaces, workflows and rules.' }
  ],
  facts: [
    { label: 'Runs on', value: 'ASP.NET Core · EF Core · SQL Server' },
    { label: 'Sign-in', value: 'OpenID Connect / OAuth2' },
    { label: 'Admin UIs', value: 'Angular, served by each API host' },
    { label: 'Delivered with', value: 'Development, integration and support' }
  ],
  primary: 'Explore the solutions',
  secondary: 'Request a demo'
};

const platform = {
  label: 'Platform foundation',
  title: 'One open-source foundation under every solution.',
  intro: 'Cases, IAM, Messaging and Risk are assembled from the same Indice.Platform libraries, published on NuGet and npm. Your team works with standard ASP.NET Core, EF Core and Angular tooling, not a proprietary runtime.',
  items: [
    { id: 'libraries', title: 'Open-source libraries', meta: 'NuGet · npm', text: 'Indice.Platform packages on NuGet and @indice/ng-* packages on npm provide the APIs, data access, authentication and UI components every solution uses.' },
    { id: 'hosting', title: 'Your host, your data', meta: 'ASP.NET Core · EF Core', text: 'Each solution is a set of libraries you compose in your own ASP.NET Core host, with its own SQL Server database and EF Core migrations. Nothing runs as SaaS.' },
    { id: 'identity', title: 'One identity model', meta: 'OIDC · OAuth2', text: 'Every solution is an OAuth2 API resource with its own scopes, such as cases, messages:send and risk. Operators sign in to each admin UI through your identity server.' },
    { id: 'extensions', title: 'Extension points in C#', meta: 'Interfaces · DI', text: 'Contact providers, lookups, risk rules, sign-in steps, log enrichers and workflow activities are C# interfaces with no-op defaults. Extensions run and debug in your process.' },
    { id: 'admin', title: 'Embedded admin UIs', meta: 'Angular', text: 'Each solution serves its Angular back office from its own API host: the Cases back office, the IAM admin at /admin, and the Messaging and Risk consoles. No separate front-end deployment.' },
    { id: 'regulated', title: 'Regulated requirements as features', meta: 'Fintech experience', text: 'Four-eyes approval, two audit trails, impossible-travel checks, terms re-acceptance and data retention ship as configuration, informed by INDICE\u2019s fintech experience.' }
  ]
};

const technologies = {
  title: 'Built with standard, supported technologies',
  labels: { '.net': '.NET', angular: 'Angular', swift: 'Swift SDK', kotlin: 'Kotlin SDK', 'sql server': 'SQL Server', azure: 'Azure', elsa: 'Elsa Workflows', duende: 'Duende IdentityServer', openid: 'OpenID Connect', openapi: 'OpenAPI' }
};

/* Order matches the slider and the overview grid. */
const solutions = [
  {
    id: 'cases',
    name: 'Cases',
    tagline: 'Case management and back-office workflows',
    action: 'Run applications and approvals as configurable case types.',
    summary: 'Cases runs form-driven processes, such as applications, service requests and approvals, on one record shared by customers and back-office staff. Customers submit from your apps, staff open cases on their behalf, and both follow the same assignment, edit and approval workflow.',
    problem: 'Request-and-approval processes tend to live in inboxes, spreadsheets or one-off screens. Each new process becomes a development project, and it is hard to show who approved what or what the customer was told.',
    how: [
      'Define a case type: a JSON Schema for the data, a JSON Forms layout and the checkpoints the case moves through.',
      'Publish an Elsa 2 workflow tagged with the case type from the designer at /workflow, without a redeploy.',
      'On submit, the workflow decides who acts next. The back office shows only the actions waiting: assign, edit, approve, reject or a custom action.',
      'Private checkpoints and data versions keep internal steps internal; the customer sees the public status and published data.'
    ],
    architecture: 'One ASP.NET Core host runs the Cases API, the Elsa workflow server and designer, and the embedded Angular back office. CasesDb holds cases and WorkflowDb holds workflow state, so a workflow upgrade never touches case data.',
    integrations: [
      'Customer search through IContactProvider, with an Identity Server provider built in',
      'Form prefill from your systems with ICaseDataInitializer',
      'Dropdown values from your systems through named ILookupService sources',
      'Platform events such as CaseSubmittedEvent and a workflow-integration API',
      'SMS, Viber and SMTP notifications from workflow activities',
      'A PDF per case type through ICasePdfService'
    ],
    apis: ['POST my/cases', 'GET manage/cases/{id}/actions', 'GET manage/dashboard/metrics'],
    stack: ['ASP.NET Core', 'EF Core · SQL Server', 'Elsa Workflows 2', 'JSON Schema + JSON Forms', 'Angular'],
    code: {
      file: 'Indice.Cases/Program.cs',
      language: 'csharp',
      source: `var app = builder.Build();
app.UseCasesWorkflow();   // Elsa HTTP activities, designer (/workflow), workflow-actions API
app.UseCasesUI();         // embedded back-office SPA
app.MapCases();           // my + manage + workflow-integration + translation endpoints`
    }
  },
  {
    id: 'iam',
    name: 'IAM',
    tagline: 'Identity and access management',
    action: 'Sign in staff, customers and partners with MFA and device trust.',
    summary: 'IAM is an OpenID Connect and OAuth2 server for workforce, customer and partner sign-in. It builds on ASP.NET Core Identity and Duende IdentityServer and adds sign-in pages, MFA, device trust, audit logs, self-service APIs and an admin UI.',
    problem: 'Teams either rent identity as a service and give up control of user data and signing keys, or rebuild login, MFA, device management and audit for every application.',
    how: [
      'Every sign-in, by password or external provider such as Apple, Google, Microsoft, Facebook or GovGr, runs through one pipeline.',
      'MFA by SMS, email, Viber, authenticator app, push approval on a trusted device, or FIDO2 / WebAuthn, optional or enforced.',
      'A post-login chain handles terms re-acceptance, MFA onboarding, email and phone confirmation and password expiry before tokens are issued.',
      'Sign-in logs record every attempt with device and location and detect impossible travel; activity logs record every change.'
    ],
    architecture: 'One ASP.NET Core host serves the Razor login pages, OIDC endpoints, management and self-service APIs, the /mfa SignalR hub and the Angular admin UI. Identity, configuration, operational, sign-in log and activity log data live in five databases that can share a server or sit apart.',
    integrations: [
      'Your web, mobile and API clients over OpenID Connect and OAuth2',
      'External providers: Apple, Google, Microsoft, Facebook, GovGr and any standard OIDC provider',
      'Delivery providers for SMS, Viber and email, and Azure Notification Hubs for push',
      'Custom grants for device sign-in, delegation, TOTP step-up and guest access',
      'Platform events for users, clients, devices and logins',
      'API resources for Cases and Messaging seeded by the template'
    ],
    apis: ['my/account/*', 'api/my/devices', 'grant_type=device_authentication'],
    stack: ['ASP.NET Core Identity', 'Duende IdentityServer', 'EF Core · SQL Server', 'SignalR', 'Angular'],
    code: {
      file: 'Indice.IdentityPages/Program.cs',
      language: 'csharp',
      source: `app.UseRateLimiter();
app.UseIdentityServer();
app.UseAdminUI(options => options.PathPrefix = "admin");
app.MapIdentityServer();                  // management, account and device APIs
app.MapRazorPages();                      // login, register, MFA, profile pages
app.MapMultiFactorAuthentication();       // MFA API
app.MapMultiFactorAuthenticationHub();    // /mfa SignalR hub`
    }
  },
  {
    id: 'messaging',
    name: 'Messaging',
    tagline: 'Multichannel campaigns and notifications',
    action: 'Send campaigns and transactional messages on every channel.',
    summary: 'Messaging delivers marketing campaigns and transactional messages, such as OTPs, receipts and alerts, over in-app inbox, push, email and SMS or Viber from one pipeline, with templates, audiences, recipient preferences and analytics.',
    problem: 'Campaigns and system notifications often run on separate tools and vendor accounts. Consent and channel preferences are checked inconsistently, and every template is tied to one vendor.',
    how: [
      'A campaign carries per-channel content, target channels, an audience from a distribution list or CSV import, and a schedule. Nothing is sent until it is published.',
      'Your systems send transactional messages with one call under the messages:send scope, through the same pipeline.',
      'A worker resolves each recipient, renders Handlebars templates per channel and keeps only the channels the recipient chose and can receive.',
      'Delivery and engagement events roll up into Reached, Engaged, Acted and Coverage metrics.'
    ],
    architecture: 'The API host enqueues and serves the embedded Angular admin UI; a worker on Azure Functions or an in-process host renders and delivers. Azure Storage Queues or Service Bus connect them, with MessagesDb on SQL Server and Blob storage for attachments.',
    integrations: [
      'Email through SMTP, SendGrid, SparkPost, Brevo or Azure Communication Services',
      'SMS and Viber through Yuboto, Apifon, Twilio, Vonage and other gateways',
      'Push through Azure Notification Hubs to APNS and FCM',
      'Contacts, consent and preferences resolved from your identity server',
      'A transactional send API for other systems',
      'Tracked call-to-action links for click analytics'
    ],
    apis: ['messages:send', 'MyMessages inbox API', 'analytics/*'],
    stack: ['ASP.NET Core', 'EF Core · SQL Server', 'Azure Storage / Service Bus', 'Handlebars.Net', 'Angular'],
    code: {
      file: 'appsettings.json',
      language: 'jsonc',
      source: `"Email": {
  "Provider": "SparkPost",   // Smtp · SendGrid · SparkPost · Brevo · AzureCommunicationServices
  "Sender": "no-reply@your-domain.gr",
  "SmtpHost": "…", "SmtpPort": 587, "UseSSL": true
},
"Sms": {
  "Provider": "Yuboto",      // Yuboto · YubotoOmni · Apifon · Twilio · Vonage · SmsUp · KapaTEL · Mstat
  "ApiKey": "…", "Sender": "MyBrand",
  "TestMode": false          // wire the pipeline without spending on real sends
},`
    }
  },
  {
    id: 'risk',
    name: 'Risk',
    tagline: 'Real-time risk scoring for transactions and activity',
    action: 'Score payments, logins and account changes before they commit.',
    summary: 'Risk scores operations such as payments, transfers, logins and profile changes in real time, before your application commits them. Rules are C# classes; their thresholds are settings that operators change at runtime.',
    problem: 'Fraud checks are often duplicated inside each application or hidden in an external service, so thresholds need a release and decisions cannot be explained afterwards.',
    how: [
      'Before committing an operation, your application calls POST api/risk with the subject, type, amount, IP address and any JSON data.',
      'The engine resolves the IP address to a location with the bundled GeoLite2 databases and runs every enabled rule.',
      'Results combine into one score and level, from None to High, by Sum or Maximum. Your application allows the operation, asks for MFA or blocks it.',
      'Record the completed operation with POST api/risk/events and its ResultId; rules query that history for velocity and new-country checks.'
    ],
    architecture: 'One ASP.NET Core host serves the risk API, the admin API and the embedded Angular console. RiskDb on SQL Server, with spatial support, stores events, results and rule options; options reload every few seconds.',
    integrations: [
      'Calling applications through client-credentials clients with the risk scope',
      'Step-up authentication with your identity server, for example MFA on a Medium score',
      'Offline GeoIP enrichment with bundled MaxMind GeoLite2 data',
      'Custom event, result and rule-option stores',
      'FluentValidation for each rule\u2019s options',
      'An admin API for investigation tools'
    ],
    apis: ['POST api/risk', 'POST api/risk/events', 'GET risk-events/session/{sessionId}'],
    stack: ['ASP.NET Core', 'EF Core · SQL Server', 'NetTopologySuite', 'MaxMind GeoLite2', 'Angular'],
    code: {
      file: 'LargeTransferRule.cs',
      language: 'csharp',
      source: `public class LargeTransferRule(IOptionsSnapshot<LargeTransferRuleOptions> options, IRiskEventStore events)
    : RiskRule("LargeTransfer")
{
    public override async ValueTask<RuleExecutionResult> ExecuteAsync(DbRiskEvent @event) {
        var o = options.Value;
        if (@event.Amount < o.Threshold) return RuleExecutionResult.NoRisk();
        var recent = await events.GetList(@event.SubjectId, ["Transfer"], DateTime.UtcNow.AddHours(-24));
        return recent.Count() >= o.MaxPerDay
            ? RuleExecutionResult.HighRisk($"{recent.Count()} large transfers in 24h.")
            : RuleExecutionResult.MediumRisk($"Transfer above {o.Threshold}.");
    }
}`
    }
  }
];

/* UI screens for the proposals' screen galleries. Only three approved screenshots exist (the Cases, IAM and Messaging
   dashboards). The two Cases illustrations reuse the slider's labelled mock-ups; every other entry is an explicit
   "screenshot pending" placeholder named after a screen the product documents describe. */
const screens = {
  cases: [
    { title: 'Team dashboard', text: 'Open cases by status, unassigned and stale work, and daily intake across the cases each user can see.', image: 'assets/uis/cases dashboard.png', alt: 'Cases operations dashboard showing the case pipeline and team workloads' },
    { title: 'Workflow designer', text: 'Stages, checkpoints and independent approval configured for one case type.', mock: 'workflow' },
    { title: 'Case detail', text: 'Activity history next to what the customer sees and what stays internal.', mock: 'record' },
    { title: 'Case list and saved queries', text: 'Filters by reference number, customer, TIN, group, dates, case and checkpoint types, saved per user.' },
    { title: 'Access rules', text: 'Record-level access for a user, group or role on a case, case type or checkpoint type.' }
  ],
  iam: [
    { title: 'Admin dashboard', text: 'Sign-in activity, failed sign-ins, account security and the accounts that need attention.', image: 'assets/uis/iam dashboard.png', alt: 'IAM admin dashboard with sign-in activity, account security and accounts that need attention' },
    { title: 'Users', text: 'Claims, roles, devices, MFA settings and blocks for each user.' },
    { title: 'Sign-in logs', text: 'Every sign-in attempt with device and location, filters, a map and dashboard series.' },
    { title: 'Clients and resources', text: 'OIDC clients, API and identity resources, scopes and claim types.' },
    { title: 'Sign-in pages', text: 'Razor login, registration and MFA pages, overridable in the host and themed per client.' }
  ],
  messaging: [
    { title: 'Messaging dashboard', text: 'Reached, Engaged, Acted and Coverage, with volume per channel and message type.', image: 'assets/uis/messaging dashboard.png', alt: 'Messaging dashboard with delivery and engagement metrics' },
    { title: 'Campaign builder', text: 'Per-channel content, target channels, audience, schedule and the publish gate.' },
    { title: 'Template designer', text: 'A Handlebars code editor for per-channel templates, partials and layouts.' },
    { title: 'Distribution lists', text: 'Reusable audiences with CSV import and export, unsubscribes and contact merge.' },
    { title: 'Media library', text: 'Folders and uploads for attachments and template images.' }
  ],
  risk: [
    { title: 'Risk results', text: 'Every assessment with level, score, event, subject, amount and IP; the detail shows each rule\u2019s score and reason.' },
    { title: 'Risk events', text: 'Recorded events filtered by subject, IP, country, location, session and source transaction.' },
    { title: 'Rules', text: 'Registered rules, switched on or off, with an options form generated from each rule\u2019s stored settings.' }
  ]
};
solutions.forEach(solution => { solution.screens = screens[solution.id]; });

const suite = {
  label: 'Platform suite',
  title: 'Adopt one solution, or run them together.',
  intro: 'Each solution addresses one recurring need in customer-facing, regulated services. They share hosting, identity and extension patterns, so every solution you add reuses what the first one set up.',
  specsLabel: 'Under the hood',
  specsTitle: 'How each solution works',
  specsIntro: 'The problem each solution addresses, how it works, how it is deployed and what it connects to.'
};

/* Text the Solutions slider displays. Structure mirrors the slider markup in scripts/showcase-markup.js. */
const slider = {
  unavailable: 'Other solution pages are not available in this preview.',
  chapters: {
    iam: {
      title: 'Every sign-in, one pipeline you own.',
      description: 'An OpenID Connect server in your own ASP.NET Core host, built on Duende IdentityServer. Each login runs one pipeline: password or external provider, six MFA methods, then checks such as terms and email confirmation. Devices earn trust after a delay, and sign-in logs flag impossible travel.'
    },
    messaging: {
      title: 'One pipeline for campaigns and alerts.',
      description: 'Operators publish campaigns from the admin UI; your systems call the send API. A worker renders Handlebars templates per channel and delivers to inbox, push, email and SMS or Viber, only on channels each recipient chose and can receive. Vendors are configuration.'
    },
    risk: {
      title: 'Score every operation before it commits.',
      description: 'Your applications call POST api/risk before a payment, login or profile change. The engine adds GeoIP location, runs your C# rules and returns a score, a level and each rule\u2019s reason. Operators change thresholds at runtime, and every verdict is stored for investigation.'
    }
  },
  cases: {
    kicker: 'CASE MANAGEMENT / WORKFLOW ENGINE',
    title: 'A new process is configuration, not a release.',
    intro: 'Each case type pairs a JSON Schema form and checkpoints with an Elsa 2 workflow.',
    intake: {
      index: '01 / INTAKE',
      title: 'One record for customer and staff requests.',
      text: 'Customers submit through the my API from your web and mobile apps; staff open cases for them through the manage API. Both start the same workflow on submit.',
      listTitle: 'Built for',
      list: ['Applications and service requests from your apps.', 'Branch and call-centre cases opened for a customer.', 'Maker-checker processes with independent approval.']
    },
    workflow: {
      index: '02 / WORKFLOW',
      title: 'The workflow decides who acts next.',
      features: [
        { lead: 'Model the process.', text: 'JSON Schema data, a JSON Forms layout and public or private checkpoints per case type.' },
        { lead: 'Act on what is waiting.', text: 'The back office asks the workflow for available actions, such as assign, edit, approve or reject, and resumes it on click.' }
      ]
    },
    governance: {
      index: '03 / GOVERNANCE',
      title: 'Full history, controlled visibility.',
      lines: ['Checkpoints, data versions, comments and approvals are rows in CasesDb.', 'Customers see public status and published data; four-eyes approval is part of the workflow.'],
      ownership: { lead: 'Deploy + extend.', text: 'One ASP.NET Core host, two SQL Server databases and C# extension points for contacts, lookups, PDF and authorization.' },
      cta: 'Explore technical details'
    }
  }
};

const services = {
  label: 'Services',
  title: 'INDICE engineers build, integrate and support it with you.',
  intro: 'INDICE provides the development, integration and ongoing support that turn the solutions into a working service in your environment, from the first case type or login flow to later upgrades.',
  items: [
    { title: 'Application development', text: 'Custom applications and solution extensions on the same .NET and Angular foundation: case types and workflows, risk rules, sign-in steps and message templates.' },
    { title: 'Integration', text: 'The solutions connected to your core systems, identity providers, delivery vendors and hosting, on Azure or your own infrastructure.' },
    { title: 'Support and evolution', text: 'New features, regular security updates with CVE patching, and immediate technical assistance from INDICE engineers.' }
  ]
};

const faq = {
  label: 'Questions',
  title: 'What technical teams ask first',
  items: [
    { q: 'Is this a SaaS solution?', a: 'No. Each solution is a set of .NET libraries and an Angular UI that run in your own ASP.NET Core host, against your own SQL Server databases, signing keys and delivery accounts.' },
    { q: 'What do we need to run it?', a: 'ASP.NET Core hosting, SQL Server and an OpenID Connect identity server, which IAM provides. Redis, Azure Storage, Service Bus and Notification Hubs are used where a solution needs caching, queues or push.' },
    { q: 'Can we start with one solution?', a: 'Yes. Each solution has its own libraries, database and admin UI. Every solution you add reuses the same hosting, identity server and extension patterns.' },
    { q: 'How do we customise behaviour without forking?', a: 'Through C# extension points registered in your host, such as risk rules, workflow activities, sign-in steps, contact providers, lookups and log enrichers, and by overriding IAM pages and back-office UI strings.' },
    { q: 'Where do audit trails and history live?', a: 'In your databases. Cases stores every checkpoint, data version and approval; IAM keeps sign-in and activity logs; Risk stores every assessment with each rule\u2019s reason; Messaging records delivery and engagement events.' },
    { q: 'What does INDICE do after go-live?', a: 'Ongoing support: new features, regular security updates with CVE patching, immediate technical assistance, and development of new extensions as requirements change.' }
  ]
};

const contact = {
  title: 'See it against your own requirements.',
  text: 'Request a technical demonstration focused on your processes, identity setup and integration points.',
  button: 'Request a demo'
};

/* Proposal B's illustrated plate. Drawn from the solution list, so it never states how many solutions there are. */
const plate = {
  label: 'Plate I',
  title: 'One foundation under every solution.',
  text: 'Every INDICE solution is assembled from the same open-source Indice.Platform libraries and runs in your own host. A solution you add later joins the same identity, hosting and extension patterns as the ones you already run.',
  core: ['Indice', 'Platform']
};

const footer = {
  note: 'Homepage proposal for review. Solution facts come from the INDICE solution documents.',
  github: 'https://github.com/indice-co'
};

/* Interface labels shared by the three proposals. */
const ui = {
  nav: { platform: 'Platform', solutions: 'Solutions', specs: 'How it works', services: 'Services', faq: 'FAQ', contents: 'Contents', menu: 'Menu', close: 'Close' },
  skipShowcase: 'Skip the solutions showcase',
  learnMore: 'Learn more',
  details: 'Technical details',
  casesReference: 'Cases technical reference',
  readCasesReference: 'Read the Cases technical reference',
  themeToggle: 'Dark theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeGroup: 'Colour theme',
  github: 'indice-co on GitHub',
  problem: 'The problem',
  how: 'How it works',
  architecture: 'Architecture',
  integrations: 'Integrations',
  apis: 'Key APIs',
  stack: 'Stack',
  code: 'For developers',
  audience: 'Who it is for',
  facts: 'At a glance',
  foundation: 'Foundation',
  infrastructure: 'Your infrastructure',
  mapCaption: 'Every solution on one foundation, deployed in your environment.',
  foundationStack: ['ASP.NET Core', 'EF Core', 'SQL Server', 'OpenID Connect', 'Angular'],
  packages: ['Indice.Features.Cases.Server', 'Indice.Features.Identity.Server', 'Indice.Features.Messages.AspNetCore', 'Indice.Features.Risk.Server', '@indice/ng-auth', '@indice/ng-components'],
  productsHeading: 'Solutions',
  resources: 'Resources',
  mastheadNote: 'Platform overview for technical managers and developers',
  sticker: ['Self-hosted', '.NET + Angular'],
  contactLabel: 'Contact',
  closeContents: 'Close contents',
  colophon: 'Colophon',
  colophonText: 'Set in Manrope. Light by default; your theme choice is remembered for this proposal.',
  backToTop: 'Back to top',
  screens: 'Screens',
  viewScreens: 'View screens',
  hideScreens: 'Hide screens',
  screenPending: 'Screenshot pending',
  illustrative: 'Illustrative',
  galleryHint: 'Point left or right to browse. Select a screen to enlarge it.',
  scrollBack: 'Show previous screens',
  scrollForward: 'Show more screens',
  screensHint: 'Select a screen to enlarge it. In the viewer, the arrow keys move between screens.',
  previousScreen: 'Previous screen',
  nextScreen: 'Next screen',
  closeViewer: 'Close screen viewer',
  readEntry: 'Read the entry',
  underTheHood: 'Under the hood'
};

module.exports = { hero, platform, technologies, solutions, suite, slider, services, faq, contact, plate, footer, ui };
