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
    navigation: { foundation: 'Foundation', products: 'Suite', services: 'Services', menu: 'Menu', close: 'Close', exploreAll: 'Explore all solutions', unavailable: 'Other product pages are not available in this preview.', demo: 'Request a demo', skip: 'Skip to content' },
    hero: { title: 'INDICE Platform', motto: 'Solid foundations. Greater possibilities.', pillars: [
      { id: 'foundation', number: '01', label: 'Foundation', headline: 'Built on experience. Engineered to evolve.' },
      { id: 'products', number: '02', label: 'Suite', headline: 'Focused capabilities. Flexible combinations.' },
      { id: 'services', number: '03', label: 'Services', headline: 'Expertise that brings it all together.' }
    ] },
    foundation: { label: 'Platform Foundation', title: 'A strong foundation for robust digital solutions.', paragraphs: [
      'The technological foundation behind INDICE solutions combines reusable tools, engineering expertise, cloud practices, and in-depth fintech experience.'
    ], items: [
      { title: 'Open-source libraries', description: 'Proven, reusable INDICE tools that enable faster and more secure software development.' },
      { title: 'Engineering expertise', description: 'Years of software development experience supported by established engineering practices.' },
      { title: 'Cloud practices', description: 'Proven approaches to application deployment and continuous monitoring that support stability and availability.' },
      { title: 'Fintech experience', description: 'Deep understanding of the financial sector’s requirements, regulations, and operational complexities.' }
    ], explore: 'Explore the suite' },
    metrics: [
      { value: '42', label: 'Organisations using INDICE solutions' },
      { value: '280', label: 'Production implementations' },
      { value: '+300.000', label: 'Users served across deployments' },
      { value: '+25', label: 'Years of platform development' }
    ],
    products: { label: 'Platform Suite', title: 'Our solutions. A platform of possibilities.', introduction: 'Our solutions address recurring business and technology needs. Available individually or in combination, they can be adapted to each organisation’s requirements and deployed in its own environment.' },
    services: { label: 'Platform Services', title: 'From platform capabilities to working solutions.', paragraphs: [
      'INDICE provides the development, integration, and ongoing support to tailor platform capabilities to each organisation.',
      'Implementation expertise and continuous improvement support the full journey, from initial delivery to evolving business requirements.'
    ], items: [
      { title: 'Application development', description: 'Custom applications and solution extensions built around specific business processes and requirements.' },
      { title: 'Solution and system integration', description: 'Selected platform solutions connected with existing applications, systems, and infrastructure.' },
      { title: 'Continuous evolution and support', description: 'New features, regular security updates, vulnerability patching, and direct support from the INDICE team.' }
    ] },
    customers: { title: 'Supporting digital progress across organisations.', logos: [
      { name: 'ACS', logo: 'assets/logos/clients-logos/ACS.svg' },
      { name: 'Chania', logo: 'assets/logos/clients-logos/Chania.svg' },
      { name: 'doValue', logo: 'assets/logos/clients-logos/doValue.svg' },
      { name: 'ERGO', logo: 'assets/logos/clients-logos/Ergo.svg' }
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
