'use strict';

/* Content shared by the alternative homepage designs (terminal.html, blueprint.html).
   Facts come from the product documents (Cases, IAM, Messaging, Risk, platform pillars) and the
   public indice-co GitHub organisation. Features the documents mark "next release" are excluded. */
require('../js/data.js');
const { copy, products } = globalThis.INDICE_DATA;

const byId = id => products.find(product => product.id === id);

const links = {
  github: 'https://github.com/indice-co',
  platform: 'https://github.com/indice-co/Indice.Platform',
  angular: 'https://github.com/indice-co/Indice.Angular',
  nuget: 'https://www.nuget.org/profiles/indice',
  ngConfig: 'https://www.npmjs.com/package/@indice/ng-config',
  ngAuth: 'https://www.npmjs.com/package/@indice/ng-auth',
  ngComponents: 'https://www.npmjs.com/package/@indice/ng-components',
  identityIos: 'https://github.com/indice-co/Indice.Identity.iOS',
  identityAndroid: 'https://github.com/indice-co/Indice.Identity.Android',
  agentsIos: 'https://github.com/indice-co/Indice.Agents.iOS',
  cryptography: 'https://github.com/indice-co/Indice.Cryptography',
  edi: 'https://github.com/indice-co/EDI.Net',
  skills: 'https://github.com/indice-co/Indice.Skills'
};

const pillars = [
  { id: 'foundation', number: '01', label: 'Foundation' },
  { id: 'suite', number: '02', label: 'Suite' },
  { id: 'expertise', number: '03', label: 'Expertise' }
].map(pillar => ({
  ...pillar,
  headline: copy.hero.pillars.find(source => source.label === pillar.label).headline
}));

const intro = 'Open-source .NET and Angular libraries, four products built on them that you deploy on your own infrastructure, and the engineers who integrate and maintain them.';

/* Technology catalogue: ids are shared by the Foundation lists and the product dependency matrix. */
const tech = [
  { id: 'aspnet', label: 'ASP.NET Core', detail: 'Minimal APIs · Razor Pages', matrix: 'ASP.NET Core' },
  { id: 'ef', label: 'EF Core + SQL Server', detail: 'one context per store, own migrations', matrix: 'EF Core · SQL' },
  { id: 'angular', label: 'Angular', detail: 'back-office SPAs served by the API host', matrix: 'Angular SPA' },
  { id: 'oidc', label: 'OIDC / OAuth2', detail: 'ASP.NET Core Identity · Duende IdentityServer', matrix: 'OIDC' },
  { id: 'elsa', label: 'Elsa Workflows 2', detail: 'case workflows, Quartz timers', matrix: 'Elsa 2' },
  { id: 'signalr', label: 'SignalR', detail: 'MFA push-approval hub', matrix: 'SignalR' },
  { id: 'azure', label: 'Azure', detail: 'Storage · Service Bus · Notification Hubs · Functions · Blob', matrix: 'Azure' },
  { id: 'redis', label: 'Redis', detail: 'distributed cache, optional', matrix: 'Redis' }
];

/* req = part of the documented stack, opt = optional or replaceable, '' = not used */
const usage = {
  cases: { aspnet: 'req', ef: 'req', angular: 'req', oidc: 'req', elsa: 'req', signalr: '', azure: '', redis: 'opt' },
  iam: { aspnet: 'req', ef: 'req', angular: 'req', oidc: 'req', elsa: '', signalr: 'req', azure: 'opt', redis: 'opt' },
  messaging: { aspnet: 'req', ef: 'req', angular: 'req', oidc: 'req', elsa: '', signalr: '', azure: 'req', redis: '' },
  risk: { aspnet: 'req', ef: 'req', angular: 'req', oidc: 'req', elsa: '', signalr: '', azure: '', redis: 'opt' }
};

const specs = {
  cases: {
    baseUnit: 'Case type',
    summary: 'A case type is a JSON Schema form, a set of checkpoints and an Elsa workflow that decides who acts next. Customers and back-office staff work on the same record through two APIs.',
    highlights: [
      ['Process as data', 'A new process is a case type (schema, layout, checkpoints) plus a workflow, not a code change. Workflows are edited and published from the designer at /workflow without a redeploy.'],
      ['Two views, one record', 'my/* serves customers, manage/* serves staff. Private checkpoints stay internal; the customer sees the last public checkpoint and the published data version.'],
      ['Actions come from the workflow', 'GET manage/cases/{id}/actions asks the workflow which blocking activities are waiting (assign, edit, approve, custom actions). The SPA renders exactly those.'],
      ['Three-layer access control', 'Roles (CasesUser, CasesManager, CasesAdministrator), record-level access rules, and ownership. Four-eyes approval is a workflow activity: Block previous approver.'],
      ['Everything is a row', 'Checkpoints, data versions, comments and approvals live in CasesDb; the timeline is a query. A PDF per case type renders from a Razor template.']
    ],
    hosting: [
      ['Packages', 'Indice.Features.Cases.{Core, Server, Workflows, UI}'],
      ['Deployment', 'One ASP.NET Core host: API, back-office SPA, Elsa server and designer'],
      ['Databases', 'CasesDb (schema case), WorkflowDb (Elsa). Redis cache optional'],
      ['Auth', 'OIDC client cases-ui, API resource cases']
    ],
    endpoints: [
      ['POST', 'my/cases', 'customer creates a draft, then submits it'],
      ['GET', 'my/case-types', 'case types a customer can open, with translated schema and layout'],
      ['POST', 'manage/cases', 'staff open a case on a customer’s behalf'],
      ['GET', 'manage/cases/{id}/actions', 'workflow-derived actions for the current user'],
      ['GET', 'manage/dashboard/metrics', 'counts per status, assigned, unassigned, stale'],
      ['*', 'manage/workflow-integration/*', 'API the Elsa activities call back into']
    ],
    code: [
      {
        file: 'Program.cs', language: 'csharp', source: `// Indice.Cases/Program.cs
builder.AddCaseServer(options => {
    options.PathPrefix = "/api";
    options.ReferenceNumberEnabled = true;           // human-readable case numbers from a DB sequence
    // options.ConfigureDbContext = …;               // defaults to ConnectionStrings:CasesDb (SQL Server)
    // options.UseContactProviderIdentity(o => …);   // search customers in your Identity Server
});
builder.AddCasesWorkflow(options => {
    options.RegisterAuthentication = true;           // OIDC sign-in for the workflow designer
    options.ConfigureSmtp = builder.Configuration.GetSection("Elsa:Smtp").Bind;
    // options.GetWorkflowAssembly = () => typeof(Program).Assembly;  // code-first workflows + custom activities
});

var app = builder.Build();
app.UseCasesWorkflow();   // Elsa HTTP activities, designer (/workflow), workflow-actions API
app.UseCasesUI();         // embedded back-office SPA
app.MapCases();           // my + manage + workflow-integration + translation endpoints`
      },
      {
        file: 'CaseServerOptions', language: 'csharp', source: `builder.AddCaseServer(options => {
    options.PathPrefix = "/api";
    options.RequiredScope = "cases";
    options.ReferenceNumberEnabled = true;
    options.ByPassAccessRulesForElevatedUsers = true;
    options.GroupIdClaimType = "group_id";          // branch / team of the back-office user
    options.DatabaseSchema = "case";
    options.MapTranslations = true;                  // {prefix}/cases-i18n.{lang}.json + {prefix}/languages
    options.ConfigureLimitUpload = o => {
        o.DefaultMaxFileSizeBytes = 10 * 1024 * 1024;
        o.DefaultAllowedFileExtensions = [".pdf", ".jpg", ".png"];
        o.EnableMagicByteValidation = true;
    };
});`
      }
    ],
    seams: [
      ['IContactProvider', 'customer search for staff-created cases (Identity Server built in)'],
      ['ICaseDataInitializer', 'prefill a new case’s data from your systems'],
      ['ILookupService', 'named dropdown sources (AddLookupService<T>("name"))'],
      ['ICaseAuthorizationService', 'extra list filtering and membership'],
      ['ICasePdfService', 'your HTML-to-PDF engine'],
      ['IPlatformEventHandler<TEvent>', 'react to submitted / message / downloaded events'],
      ['Elsa activities + bookmarks', 'custom workflow steps from your assembly (GetWorkflowAssembly)']
    ],
    docs: { label: 'Technical reference', href: 'cases-reference.html' }
  },
  iam: {
    baseUnit: 'User',
    summary: 'ASP.NET Core Identity stores the users and Duende IdentityServer speaks OIDC / OAuth2. Indice adds the grants, MFA, devices, audit and UI. Workforce, partners and customers sign in through one pipeline.',
    highlights: [
      ['One sign-in pipeline', 'Password or external provider (Apple, Google, Microsoft, Facebook, GovGr), then MFA, then the post-login validation activities, then tokens.'],
      ['Custom grants', 'Five grant types on top of the standard flows: totp, mfa, device_authentication, delegation and urn:indice:guest. The same IExtensionGrantValidator seam is open to you.'],
      ['Six MFA methods', 'SMS, Email, Viber, Authenticator app (TOTP), Trusted device (push approval over the /mfa SignalR hub) and FIDO2 / WebAuthn.'],
      ['Devices and sessions', 'A new device becomes trusted only after TrustActivationDelay (48 hours in the template). Server-side sessions are rows you can revoke; EnforceSingleActiveSession ends older sessions.'],
      ['Hardening and audit', '20 per-endpoint rate-limit rules, reCAPTCHA v3 with v2 fallback, lockout, password history. Two audit trails: sign-in logs with impossible-travel checks, and activity logs.']
    ],
    hosting: [
      ['Packages', 'Indice.Features.Identity.{Core, Server, SignInLogs, UI, AdminUI}, Indice.Features.ActivityLogs'],
      ['Deployment', 'One ASP.NET Core host: login pages, OIDC endpoints, management APIs, /mfa hub and the /admin SPA'],
      ['Databases', 'IdentityDb, ConfigurationDb, OperationalDb, SignInLogsDb, ActivityLogsDb'],
      ['Template', 'Indice.IdentityPages (dotnet new): a complete production wiring of the libraries']
    ],
    endpoints: [
      ['*', 'api/users · api/roles · api/clients', 'management APIs, scope identity and sub-scopes'],
      ['*', 'api/my/devices', 'register, update, delete and request trust for a device'],
      ['*', 'my/account/*', 'self-service profile, email and phone, grants, devices'],
      ['POST', 'account/register', 'public helper, rate-limited'],
      ['WS', '/mfa', 'SignalR hub the browser waits on during push approval'],
      ['*', 'api/app-settings', 'runtime settings stored in the database']
    ],
    code: [
      {
        file: 'Program.cs', language: 'csharp', source: `// Indice.IdentityPages/Program.cs (trimmed)
builder.Services.AddIdentityUI(builder.Configuration, options => {
    options.EnableRegisterPage = true;
    options.AutoProvisionExternalUsers = false;
});
builder.Services
       .AddExtendedIdentityServer(builder.Configuration, builder.Environment, options => {
           options.InitialUsers = UsersSeed.GetInitialUsers();
           options.EnableServerSideSessions = true;
           options.EnforceSingleActiveSession = true;
       })
       .AddGuestGrantValidator()
       .AddExtendedEndpoints(options => options.DisableCache = true)   // management + my/account APIs
       .AddDatabaseSettingEndpoints()                                  // api/app-settings
       .AddDeviceEndpoints(options => options.UsePushNotificationsServiceAzure())
       .AddSignInLogs(options => options.UseEntityFrameworkCoreStore(/* SignInLogsDb */))
       .IdentityBuilder
       .AddAuthenticationMethods(methods => methods.UseInMemoryProvider(m => m
           .AddSms().AddEmail().AddViber().AddAuthenticatorApp().AddTrustedDevice().AddFido2()));

var app = builder.Build();
app.UseRateLimiter();
app.UseIdentityServer();
app.UseAdminUI(options => options.PathPrefix = "admin");
app.MapIdentityServer();                  // management, account and device APIs
app.MapRazorPages();                      // login, register, MFA, profile pages
app.MapMultiFactorAuthentication();       // MFA API
app.MapMultiFactorAuthenticationHub();    // /mfa SignalR hub`
      },
      {
        file: 'appsettings.json', language: 'jsonc', source: `"IdentityOptions": {
  "SignIn": {
    "Mfa": {
      "Policy": "Default",                          // Default (= Optional) · Enforced
      "AllowDowngradeAuthenticationMethod": true,
      "PersistTrustedBrowsers": true,
      "RememberDurationInDays": 90,
      "RememberExpirationType": "Sliding",          // or Absolute
      "RememberTrustedBrowserAcrossSessions": true,
      "RequireWhen": { "UserHasTrustedBrowserButExpiredPassword": true }
    }
  }
}`
      }
    ],
    seams: [
      ['IExtensionGrantValidator', 'new OAuth grant types'],
      ['IIdentityValidationActivity', 'new post-login steps (KYC, consent, profile completion)'],
      ['Add<TAuthenticationMethod>()', 'new MFA / authentication methods'],
      ['ISignInLogEntryEnricher', 'extra sign-in log fields (AddSignInLogEnricher<T>())'],
      ['IActivityLogFromEventConverter', 'activity log entries from your own events'],
      ['IPlatformEventHandler<TEvent>', 'react to user, client, device and login events'],
      ['Razor page / wwwroot overrides', 'replace any page or asset by path in the host']
    ],
    docs: { label: 'Technical reference', href: null }
  },
  messaging: {
    baseUnit: 'Campaign',
    summary: 'A campaign fans out to Inbox, Push, Email and SMS according to its settings and each recipient’s preferences. Transactional messages (OTPs, receipts, alerts) run through the same pipeline.',
    highlights: [
      ['One campaign, four channels', 'MessageChannelKind is a [Flags] enum: Inbox 1, PushNotification 2, Email 4, SMS 8. Content is authored per channel and rendered per recipient with Handlebars (Full, Partial and Layout templates).'],
      ['Preference-aware delivery', 'Channels are resolved per recipient when the campaign is sent: campaign channels, narrowed by the recipient’s preference for the message type, minus what they cannot receive. IgnoreUserPreferences covers true system messages.'],
      ['API enqueues, worker delivers', 'The API accepts and queues; the worker resolves, renders and sends. Systems send through the send API under the narrower messages:send scope and get 202 Accepted.'],
      ['Vendors are configuration', 'Email: SMTP, SendGrid, SparkPost, Brevo, Azure Communication Services. SMS / Viber: Yuboto, Yuboto Omni, Apifon, Twilio, Vonage, SmsUp, KapaTEL, Mstat. Push: Azure Notification Hubs to APNS and FCM v1.'],
      ['Analytics off the hot path', 'Events are queued and batched into MessageEvent records. KPIs: Reached, Engaged, Acted, Coverage. Click tracking rewrites links to /_tracking/… and redirects.']
    ],
    hosting: [
      ['Packages', 'Indice.Features.Messages.{Core, AspNetCore, Worker, Worker.Azure, UI}'],
      ['Deployment', 'API host (MapMessaging + UseMessagesUI) and a worker: Azure Functions or an in-process hosted worker'],
      ['Transport', 'Azure Storage Queues (gzip envelopes) or Azure Service Bus'],
      ['Data', 'MessagesDb (schema cmp) on SQL Server, Blob storage for attachments and media'],
      ['Templates', 'Indice.Messaging (API + admin UI), Indice.Messaging.Workers (Azure Functions)']
    ],
    endpoints: [
      ['*', 'send API', 'transactional send in one request, scope messages:send'],
      ['*', 'MyMessagesApi', 'inbox: list, get, mark read / unread, preferences'],
      ['*', 'analytics/*', 'overview, recipient metrics, event series (output-cached)'],
      ['GET', '/_tracking/…', 'records a Hit, then 302 to the campaign ActionLink']
    ],
    code: [
      {
        file: 'Program.cs', language: 'csharp', source: `// API host (Indice.Messaging/Program.cs)
builder.Services.AddMessaging(options => {
    options.ConfigureDbContext = (sp, db) => db.UseSqlServer(cfg.GetConnectionString("MessagesDb"));
    options.RequiredScope = cfg.GetApiResourceName();   // "messages"
    options.PathPrefix    = "/api";
    options.UseFilesAzure();                            // Blob attachments/media
    options.UseEventDispatcherAzure();                  // Azure Storage Queue transport
    options.UseIdentityContactResolver(o => { /* pull contact data + prefs from Identity */ });
});
app.UseMessagesUI(o => { o.EnableMediaLibrary = true; });
app.MapMessaging();`
      },
      {
        file: 'appsettings.json', language: 'jsonc', source: `"Email": {
  "Provider": "SparkPost",   // Smtp · SendGrid · SparkPost · Brevo · AzureCommunicationServices
  "Sender": "no-reply@your-domain.gr",
  "SmtpHost": "…", "SmtpPort": 587, "UseSSL": true
},
"Sms": {
  "Provider": "Yuboto",      // Yuboto · YubotoOmni · Apifon · Twilio · Vonage · SmsUp · KapaTEL · Mstat
  "ApiKey": "…", "Sender": "MyBrand",
  "TestMode": false          // wire the pipeline without spending on real sends
}`
      }
    ],
    seams: [
      ['IContactResolver', 'your own source of truth for contacts + preferences'],
      ['ICampaignJobHandler<TEvent>', 'react to pipeline events / add processing steps'],
      ['Use* provider builders', 'swap Email / SMS / Push implementations by config'],
      ['IFileService', 'your own storage for attachments and media'],
      ['Template (Partial / Layout)', 'compose content from reusable fragments at render time']
    ],
    docs: { label: 'Technical reference', href: null }
  },
  risk: {
    baseUnit: 'Risk rule',
    summary: 'A risk rule is a C# class that looks at an operation. Its thresholds are settings operators change at runtime. POST api/risk returns one score and one level (None, Low, Medium, High) with a reason per rule.',
    highlights: [
      ['Policy as code plus data', 'Detection logic is reviewed, versioned and unit-tested like the rest of your software. Thresholds, lists and switches live in RiskDb and hot-reload (every 5 seconds in the template) without a redeploy.'],
      ['Configurable scoring', 'Level ranges are configuration (template: 0, 1–1000, 1001–2000, 2001–3000). Aggregation is Sum, where risk accumulates, or Maximum, where the worst rule decides. Overlapping ranges stop the host at startup.'],
      ['Verdicts you can explain', 'Every assessment is stored with its input and per-rule score, level and reason, whether or not the operation goes ahead. A recorded event carries the ResultId of its verdict.'],
      ['History for rules', 'POST api/risk/events records what happened. IRiskEventStore.GetList(subject, names, dates, filters) gives rules velocity, frequency and first-time-beneficiary checks.'],
      ['Offline geolocation', 'MaxMind GeoLite2 databases ship with the product. The IP address resolves to country and coordinates inside the host; nothing leaves it.']
    ],
    hosting: [
      ['Packages', 'Indice.Features.Risk.{Core, Server, UI}, Indice.Features.GeoIP'],
      ['Deployment', 'One ASP.NET Core host: risk API, admin API and the back-office SPA'],
      ['Database', 'RiskDb on SQL Server with NetTopologySuite: RiskEvent, RiskResult, AppSetting. Redis cache optional'],
      ['Auth', 'bearer token with the risk scope, or a system client; operators sign in with OIDC client risk-ui']
    ],
    endpoints: [
      ['POST', 'api/risk', 'assess one operation in real time'],
      ['POST', 'api/risk/events', 'record an operation that happened, with its ResultId'],
      ['GET', 'risk-results', 'paged assessments, filter by date, subject, name, type, IP'],
      ['GET', 'risk-events/session/{sessionId}', 'every event of one session'],
      ['GET', 'risk-rules', 'registered rules with display name and enabled state'],
      ['POST', 'risk-rule/{ruleName}', 'save one rule’s options']
    ],
    code: [
      {
        file: 'LargeTransferRule.cs', language: 'csharp', source: `public class LargeTransferRule(IOptionsSnapshot<LargeTransferRuleOptions> options, IRiskEventStore events)
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
}

public class LargeTransferRuleOptions : MyRuleOptions { public decimal Threshold { get; set; } public int MaxPerDay { get; set; } }

public class LargeTransferRuleOptionsValidator : RuleOptionsValidator<LargeTransferRuleOptions> {
    public LargeTransferRuleOptionsValidator() { RuleFor(x => x.Threshold).GreaterThan(0); }
}`
      },
      {
        file: 'AddRiskEngine', language: 'csharp', source: `builder.Services.AddRiskEngine(options => {
    options.RiskLevelRangeMapping = new RiskLevelRangeDictionary(new Dictionary<RiskLevel, IntegerRange> {
        [RiskLevel.None]   = new IntegerRange(0, 0),
        [RiskLevel.Low]    = new IntegerRange(1, 1000),
        [RiskLevel.Medium] = new IntegerRange(1001, 2000),
        [RiskLevel.High]   = new IntegerRange(2001, 3000)
    });
    options.RiskAggregateScoreResolution = RiskAggregateScoreResolutionType.Maximum;
})
.AddRule<LargeTransferRule, LargeTransferRuleOptions, LargeTransferRuleOptionsValidator>("LargeTransfer")
.AddRule<NewCountryRule, NewCountryRuleOptions, NewCountryRuleOptionsValidator>("NewCountry")
.AddEntityFrameworkCoreStore(db => db.UseSqlServer(cs, sql => sql.UseNetTopologySuite()));`
      }
    ],
    seams: [
      ['RiskRule', 'your fraud logic (AddRule<TRule, TOptions, TValidator>)'],
      ['RuleOptions', 'your thresholds, lists and limits, editable at runtime'],
      ['RuleOptionsValidator<T>', 'your validation of those options (FluentValidation)'],
      ['IRiskEventStore', 'history queries inside rules, or your own event store'],
      ['IRiskResultStore', 'your own result persistence'],
      ['IRuleOptionsStore', 'your own rule-options storage'],
      ['RiskEngineOptions', 'level ranges and aggregation strategy']
    ],
    docs: { label: 'Technical reference', href: null }
  }
};

/* Products listed in the platform pillars document that have no logo or product document yet. */
const pendingProducts = [
  { id: 'agents', name: 'Agents', note: 'Listed in the platform. Logo and product document not provided yet.' },
  { id: 'workers', name: 'Workers', note: 'Listed in the platform. Logo and product document not provided yet.' }
];

const suite = ['cases', 'iam', 'messaging', 'risk'].map(id => {
  const product = byId(id);
  return { id, name: product.name, tagline: product.tagline, logo: product.logo, icon: product.logo.replace(' logo.svg', ' icon.svg'), color: product.color, accent: product.accent, ...specs[id], uses: usage[id] };
});

/* Facts for the Foundation pillar. */
const foundation = {
  libraries: [
    { name: 'Indice.Platform', kind: '.NET libraries', target: 'net8.0', install: 'dotnet add package Indice.AspNetCore', source: 'NuGet', href: links.nuget, note: 'MIT. Indice.AspNetCore, Indice.Common, Indice.EntityFrameworkCore and the Indice.Features.* libraries the products are built from.' },
    { name: 'Indice.Angular', kind: 'Angular libraries', target: 'Angular 20+ · Node 22.19+ · TypeScript 5.9+', install: 'npm install @indice/ng-config', source: 'npm', href: links.ngConfig, note: '@indice/ng-config (runtime configuration), @indice/ng-auth (OpenID Connect with oidc-client-ts), @indice/ng-components (components with Tailwind CSS).' },
    { name: 'Indice.Identity.iOS', kind: 'Swift package', target: 'Swift 6.2 · iOS 13 · macOS 10.15', install: '', source: 'GitHub', href: links.identityIos, note: 'Added with Swift Package Manager. IdentityClient covers authentication, device management, registration and account operations against an Indice identity service.' },
    { name: 'Indice.Identity.Android', kind: 'Kotlin SDK', target: 'Android', install: '', source: 'GitHub', href: links.identityAndroid, note: 'Identity SDK for Android.' },
    { name: 'Indice.Agents.iOS', kind: 'Swift SDK', target: 'iOS', install: '', source: 'GitHub', href: links.agentsIos, note: 'SDK for Agents UI flows and components.' },
    { name: 'Indice.Cryptography', kind: '.NET library', target: 'C#', install: '', source: 'GitHub', href: links.cryptography, note: 'PSD2 starter kit and utilities.' },
    { name: 'EDI.Net', kind: '.NET library', target: 'C#', install: '', source: 'GitHub', href: links.edi, note: 'EDI serializer and deserializer: EDIFACT, X12 and TRADACOMS.' },
    { name: 'Indice.Skills', kind: 'Agent skills', target: 'Python repository', install: '', source: 'GitHub', href: links.skills, note: 'Conventions, libraries and guardrails an AI coding agent needs to write code the way Indice does.' }
  ],
  stack: [
    ['runtime', '.NET 8 (net8.0)'],
    ['web', 'ASP.NET Core: Minimal APIs, Razor Pages'],
    ['data', 'EF Core · SQL Server (+ NetTopologySuite for spatial data) · optional Redis cache'],
    ['identity', 'ASP.NET Core Identity · Duende IdentityServer (OIDC / OAuth2)'],
    ['realtime', 'SignalR (Azure SignalR optional)'],
    ['workflow', 'Elsa Workflows 2 · Quartz timers'],
    ['ui', 'Angular SPAs served by the API host: UseCasesUI · UseAdminUI · UseMessagesUI · UseRisksUI'],
    ['cloud', 'Azure Storage · Service Bus · Notification Hubs · Functions · Blob'],
    ['api docs', 'OpenAPI with Swagger UI or Scalar']
  ],
  notes: [
    'Every product is a deployed system, not a SaaS: your databases, keys, queues, delivery accounts and operations.',
    'Extension points are C# interfaces, not a DSL. Extensions run in your host and debug with the rest of your app.',
    'Every seam ships a safe default, so a fresh host runs before any of them is implemented.',
    'Everything that can be a setting is a setting. Code is for the seams.',
    'Each product ships an Angular admin SPA that your API host serves in-process; there is no separate frontend deployment.',
    'Each store has its own EF Core migrations history; a production host brings its own migrations assembly.'
  ],
  practices: [
    ['CI', 'GitHub Actions build, test and publish to NuGet'],
    ['Static analysis', 'CodeQL on C# and JavaScript'],
    ['Supply chain', 'Dependency review and OpenSSF Scorecard workflows'],
    ['Disclosure', 'SECURITY.md and CONTRIBUTING.md in the Indice.Platform repository']
  ],
  domain: [
    ['Identity', 'GovGr (TaxisNet) login, terms re-acceptance, device trust with an activation delay, two audit trails'],
    ['Delivery', 'Viber OTP and Greek SMS gateways next to global providers'],
    ['Standards', 'PSD2 starter kit (Indice.Cryptography), EDIFACT, X12 and TRADACOMS (EDI.Net)'],
    ['Back office', 'Maker-checker approvals, public / private states, PDF output of every case']
  ]
};

/* Facts for the Expertise pillar. */
const expertise = {
  items: [
    { id: 'development', title: 'Software development', text: 'Custom applications and extensions on the platform libraries, built around your processes and requirements.' },
    { id: 'integration', title: 'Integration', text: 'Suite products connected to your existing systems, APIs, identity providers and delivery accounts.' },
    { id: 'support', title: 'Ongoing support', text: 'New features, regular security updates (CVE patching) and direct technical assistance from the engineers who maintain the code.' }
  ],
  integrationPoints: [
    ['Cases', 'ILookupService', 'dropdown data from your systems'],
    ['Cases', 'IContactProvider', 'customer search, backed by your Identity Server or your own source'],
    ['Cases', 'ICasePdfService', 'your HTML-to-PDF engine'],
    ['IAM', 'IIdentityValidationActivity', 'KYC, consent or profile-completion steps in the sign-in chain'],
    ['IAM', 'Email / Sms settings', 'SMTP, SendGrid, SparkPost, Brevo · Twilio, Apifon, Yuboto, MStat, Vonage'],
    ['Messaging', 'IContactResolver', 'contacts, consent and preferences from your source of truth'],
    ['Messaging', 'Use* provider builders', 'swap email, SMS and push vendors by configuration'],
    ['Risk', 'RiskRule', 'rules resolved from DI can query history or call your own systems'],
    ['Risk', 'POST api/risk', 'called by e-banking, payments and identity flows before the operation']
  ]
};

/* How the products relate, as documented. Read each arrow as "calls / depends on". */
const relations = [
  { from: 'Cases · Messaging · Risk', to: 'IAM', text: 'Sign in with tokens issued by IAM. The IAM template seeds the cases, messages, messages:send, media and agents API resources so the other products authenticate against it.' },
  { from: 'Cases', to: 'IAM', text: 'UseContactProviderIdentity searches customers in your Identity Server.' },
  { from: 'Messaging', to: 'IAM', text: 'UseIdentityContactResolver pulls contact data, consent, locale and preferences from Identity.' },
  { from: 'Calling apps', to: 'Risk', text: 'Web banking, mobile, payments and identity flows call POST api/risk before the operation. Risk returns a level; the app decides, for example Medium → step-up authentication.' }
];

const contact = {
  demo: { label: 'Request a demo', href: null },
  github: { label: 'github.com/indice-co', href: links.github }
};

module.exports = { copy, links, pillars, intro, tech, usage, suite, pendingProducts, foundation, expertise, relations, contact };
