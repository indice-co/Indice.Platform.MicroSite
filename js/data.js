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
  copy: {
    navigation: { foundation: 'Foundation', products: 'Suite', services: 'Services', menu: 'Menu', close: 'Close', exploreAll: 'Explore all products', unavailable: 'Product pages are not available in this preview.', demo: 'Request a demo', skip: 'Skip to content' },
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
      { value: '[XX]', label: 'Organisations using INDICE products' },
      { value: '[XX]', label: 'Production implementations' },
      { value: '[XX]', label: 'Users served across deployments' },
      { value: '[XX]', label: 'Years of platform development' }
    ],
    products: { label: 'Platform Suite', title: 'Six products. A platform of possibilities.', introduction: 'Six products address recurring business and technology needs. Available individually or in combination, they support solutions adapted to each organisation’s requirements and deployed in its own environment.' },
    services: { label: 'Platform Services', title: 'From platform capabilities to working solutions.', paragraphs: [
      'INDICE provides the development, integration, and ongoing support that turn platform products into solutions tailored to each organisation.',
      'Implementation expertise and continuous improvement support the full journey, from initial delivery to evolving business requirements.'
    ], items: [
      { title: 'Application development', description: 'Custom applications and product extensions built around specific business processes and requirements.' },
      { title: 'Product and system integration', description: 'Selected platform products connected with existing applications, systems, and infrastructure.' },
      { title: 'Continuous evolution and support', description: 'New features, regular security updates, vulnerability patching, and direct support from the INDICE team.' }
    ] },
    customers: { title: 'Supporting digital progress across organisations.', placeholder: 'Customer logos — awaiting approved assets.' },
    contact: { title: 'The foundation. The products. The expertise.', description: 'Discover the capabilities of INDICE Platform through a demonstration focused on relevant business and technology needs.' }
  },
  // Colors are verified SVG icon colors, provisionally used as presentation backgrounds.
  // Add future products only when their approved assets/copy are supplied; the story is data-driven.
  products: [
    { id: 'cases', name: 'Cases', tagline: 'Case management and business workflows', logo: 'assets/logos/cases-logo.svg', color: '#12707A', accent: '#F2B632', description: '[Product description — awaiting approved copy.]', destination: null, preview: null },
    { id: 'iam', name: 'IAM', tagline: 'Identity and access management', logo: 'assets/logos/identity-admin-logo.svg', color: '#3D5AFE', accent: '#A3E635', description: '[Product description — awaiting approved copy.]', destination: null, preview: null },
    { id: 'messaging', name: 'Messaging', tagline: 'Multichannel campaigns and notifications', logo: 'assets/logos/messaging-logo.svg', color: '#5B4FE0', accent: '#FF7A59', description: '[Product description — awaiting approved copy.]', destination: null, preview: null },
    { id: 'risk', name: 'Risk', tagline: 'Risk assessment for transactions and activity', logo: 'assets/logos/risk-logo.svg', color: '#0F7C8C', accent: '#FF4F7B', description: '[Product description — awaiting approved copy.]', destination: null, preview: null }
  ]
};
