/* Approved homepage content. Product analyses are reference material, not page copy. */
globalThis.INDICE_DATA = {
  config: {
    homeBase: '',
    logo: 'assets/logos/indice platform grey.svg',
    logoWhite: 'assets/logos/indice platform white.svg',
    logoIcon: 'assets/logos/indice icon.svg',
    logoTop: 'assets/logos/indice top.svg',
    demoAction() { /* Future demo action intentionally unwired for this phase. */ }
  },
  casesPage: {
    detailScreenshot: null,
    guide: null
  },
  copy: {
    navigation: { foundation: 'Foundation', products: 'Suite', expertise: 'Expertise', menu: 'Menu', close: 'Close', exploreAll: 'Explore all solutions', unavailable: 'Other product pages are not available in this preview.', demo: 'Request a demo', skip: 'Skip to content' },
    hero: { title: 'INDICE Platform', motto: 'Solid foundations. Greater possibilities.', pillars: [
      { id: 'foundation', number: '01', label: 'Foundation', headline: 'Open-source .NET libraries on NuGet and Angular libraries on npm give every product the same ASP.NET Core, EF Core and OpenID Connect base. You extend tested packages and deploy them in your own environment.' },
      { id: 'products', number: '02', label: 'Suite', headline: 'Cases, IAM, Messaging and Risk are products you host inside your own ASP.NET Core applications, each with its own SQL Server database, APIs and Angular admin UI. Adopt one or combine several, and extend them with your own code.' },
      { id: 'expertise', number: '03', label: 'Expertise', headline: 'Our engineers build custom applications on the platform and integrate its products with your existing systems and identity providers. After go-live we provide updates, CVE patching and direct engineering support.' }
    ] },
    foundation: { label: 'Platform Foundation', title: 'A strong foundation for robust digital solutions.', paragraphs: [
      'The technological foundation behind INDICE solutions combines reusable tools, engineering expertise, cloud practices, and in-depth fintech experience.'
    ], items: [
      { title: 'Open-source libraries', description: 'Proven, reusable INDICE tools that enable faster and more secure software development.' },
      { title: 'Engineering expertise', description: 'Years of software development experience supported by established engineering practices.' },
      { title: 'Cloud practices', description: 'Proven approaches to application deployment and continuous monitoring that support stability and availability.' },
      { title: 'Fintech experience', description: 'Deep understanding of the financial sector’s requirements, regulations, and operational complexities.' }
    ], explore: 'Explore the suite' },
    products: { label: 'Platform Suite', title: 'Our solutions. A platform of possibilities.', introduction: 'Our solutions address recurring business and technology needs. Available individually or in combination, they can be adapted to each organisation’s requirements and deployed in its own environment.' },
    expertise: { label: 'Platform Expertise', title: 'From platform capabilities to working solutions.', paragraphs: [
      'INDICE provides the development, integration, and ongoing support to tailor platform capabilities to each organisation.',
      'Implementation expertise and continuous improvement support the full journey, from initial delivery to evolving business requirements.'
    ], items: [
      { title: 'Application development', description: 'Custom applications and solution extensions built around specific business processes and requirements.' },
      { title: 'Solution and system integration', description: 'Selected platform solutions connected with existing applications, systems, and infrastructure.' },
      { title: 'Continuous evolution and support', description: 'New features, regular security updates, vulnerability patching, and direct support from the INDICE team.' }
    ] },
    technologies: { title: 'Engineered with trusted technologies', items: [
      { name: '.net', icon: 'assets/logos/technologies/dotnet.svg' },
      { name: 'angular', icon: 'assets/logos/technologies/angular.svg' },
      { name: 'swift', icon: 'assets/logos/technologies/swift.svg' },
      { name: 'kotlin', icon: 'assets/logos/technologies/kotlin.svg' },
      { name: 'sql server', icon: 'assets/logos/technologies/sqlserver.svg' },
      { name: 'azure', icon: 'assets/logos/technologies/azure.svg' },
      { name: 'elsa', icon: 'assets/logos/technologies/workflow.svg' },
      { name: 'duende', icon: 'assets/logos/technologies/duende.svg' },
      { name: 'openid', icon: 'assets/logos/technologies/openid.svg' },
      { name: 'openapi', icon: 'assets/logos/technologies/api.svg' }
    ] },
    contact: { title: 'The foundation. The solutions. The expertise.', description: 'Discover the capabilities of INDICE Platform through a demonstration focused on relevant business and technology needs.' }
  },
  // Colors are verified SVG icon colors, provisionally used as presentation backgrounds.
  // Add future products only when their approved assets/copy are supplied; the story is data-driven.
  products: [
    { id: 'cases', name: 'Cases', title: 'Every case. A clear path forward.', tagline: 'Case management and business workflows', logo: 'assets/logos/cases logo.svg', color: '#12707A', accent: '#F2B632', description: 'Cases connects customer requests with the teams and workflows that resolve them. Forms, assignments, approvals, and progress come together in one place, with controlled visibility for customers and internal teams.', destination: 'cases-reference.html', preview: 'assets/uis/cases dashboard.png' },
    { id: 'iam', name: 'IAM', title: 'Connected identities. Controlled access.', tagline: 'Identity and access management', logo: 'assets/logos/iam logo.svg', color: '#3D5AFE', accent: '#A3E635', description: 'INDICE IAM brings sign-in, multi-factor authentication, trusted devices, and account management together for customers, employees, and partners. An identity and access management solution deployed within the organisation’s own environment.', destination: null, preview: 'assets/uis/iam dashboard.png' },
    { id: 'messaging', name: 'Messaging', title: 'Multiple channels. One messaging hub.', tagline: 'Multichannel campaigns and notifications', logo: 'assets/logos/messaging logo.svg', color: '#5B4FE0', accent: '#FF7A59', description: 'INDICE Messaging unifies campaigns and transactional notifications across email, SMS, push, and in-app inbox. Personalised content, recipient preferences, and delivery and engagement analytics support coordinated communications through configurable delivery providers.', destination: null, preview: 'assets/uis/messaging dashboard.png' },
    { id: 'risk', name: 'Risk', title: 'Clearer risk insight. Informed decisions.', tagline: 'Risk assessment for transactions and activity', logo: 'assets/logos/risk logo.svg', color: '#0F7C8C', accent: '#FF4F7B', description: 'INDICE Risk evaluates transactions and customer activity against configurable business rules. Consolidated risk scores, detailed assessment records, and adjustable thresholds support consistent decisions across applications.', destination: null, preview: null }
  ]
};
