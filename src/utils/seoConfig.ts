export const SITE_ORIGIN = 'https://growvia.ca';
export const SITE_NAME = 'Growvia';
export const OG_IMAGE_URL = `${SITE_ORIGIN}/growvia-digital-marketing-agency-og.jpg`;

export const BUSINESS_PROFILE = {
  name: 'Growvia',
  legalName: 'Growvia Digital Marketing',
  url: SITE_ORIGIN,
  email: 'growviacanada@gmail.com',
  telephone: '+1-604-722-6760',
  phoneDisplay: '(604) 722-6760',
  logo: `${SITE_ORIGIN}/favicon.svg`,
  image: OG_IMAGE_URL,
  founders: ['Muzammil Wahid', 'Omar Irfan', 'Amir Miah'] as const,
  areaServed: ['Canada', 'Ontario', 'British Columbia'] as const,
  socialUrls: [
    'https://instagram.com',
    'https://facebook.com',
    'https://tiktok.com',
    'https://youtube.com',
  ] as const,
};

export const SEO_ROUTE_PATHS = [
  '/',
  '/google-ads-management',
  '/social-media-advertising',
  '/website-design',
  '/content-creation',
  '/industries',
  '/about',
  '/contact',
] as const;

export type SeoRoutePath = (typeof SEO_ROUTE_PATHS)[number];

export interface SeoFaqEntry {
  question: string;
  answer: string;
}

export interface SeoPageConfig {
  path: SeoRoutePath;
  label: string;
  title: string;
  description: string;
  keywordsTheme: string[];
  ogType: 'website' | 'article';
  changefreq: 'weekly' | 'monthly';
  priority: string;
  serviceSchema?: {
    serviceType: string;
    name: string;
    description: string;
  };
  faqs?: SeoFaqEntry[];
}

export const HOME_FAQS: SeoFaqEntry[] = [
  {
    question: 'How much do your services cost?',
    answer:
      'Pricing depends on what you need — whether it is a single channel like Google Ads, a new website, or a full monthly ads + content + web setup. Request a quick quote and we will send clear, flat monthly numbers with no surprise add-ons.',
  },
  {
    question: 'Can I switch from my current marketing team?',
    answer:
      'Yes. We audit your existing Meta, Google Ads, analytics, and website setup cleanly before making changes so your active campaigns never experience downtime during the handoff.',
  },
  {
    question: 'Are there contracts or lock-ins?',
    answer:
      'No long-term lock-in contracts. Ongoing retainers run month-to-month because we want our results — leads, booked calls, and revenue — to be the reason you stay.',
  },
  {
    question: 'What if I want ads but don’t need content production?',
    answer:
      'That works cleanly. You can engage us solely for Google Ads, Meta Ads, or website design and development, or add our photo and video production team whenever you need fresh creative.',
  },
  {
    question: 'Is my ad budget included in your fee?',
    answer:
      'No — your ad spend is paid directly by you to Google or Meta from your own billing profile. Our flat management fee covers strategy, creative, optimization, tracking, and reporting with complete transparency.',
  },
  {
    question: 'Who owns my website, ad accounts and content?',
    answer:
      'You do — 100%. Every ad account, pixel, domain, website codebase, and raw photo or video asset stays in your name from day one.',
  },
  {
    question: 'Where are you based and where do you work?',
    answer:
      'We serve local and multi-location businesses across Ontario and Canada. You can reach our team directly at growviacanada@gmail.com or (604) 722-6760.',
  },
];

export const SEO_PAGES: Record<SeoRoutePath, SeoPageConfig> = {
  '/': {
    path: '/',
    label: 'Home',
    title: 'Growvia | Digital Marketing Agency Ontario & BC',
    description:
      'Growvia helps Canadian home service, dental, and local small businesses grow with Google Ads, Meta ads, content creation, and custom websites.',
    keywordsTheme: [
      'Digital marketing agency Ontario',
      'Small business marketing agency Canada',
      'Home service business marketing',
    ],
    ogType: 'website',
    changefreq: 'weekly',
    priority: '1.0',
    faqs: HOME_FAQS,
  },
  '/google-ads-management': {
    path: '/google-ads-management',
    label: 'Google Ads Management',
    title: 'Google Ads Management Canada | Growvia Agency',
    description:
      'Get qualified local calls across Ontario, BC, and Canada with data-driven Google Search and Local Ads built for contractors, dental, and small businesses.',
    keywordsTheme: [
      'Google Ads management Ontario',
      'Google Ads agency near me',
      'Google Ads for contractors',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.9',
    serviceSchema: {
      serviceType: 'Google Ads Management & Search Advertising',
      name: 'Google Ads Management',
      description:
        'Full-service Google Search, Local Services, and conversion tracking campaigns tailored for Canadian home services, dental clinics, and local businesses.',
    },
    faqs: [
      {
        question: 'How fast can Google Ads start generating phone calls?',
        answer:
          'Search campaigns launch within 7 to 10 business days after keyword mapping, call-tracking setup, and landing page verification, bringing immediate visibility when local customers search.',
      },
      {
        question: 'Do I pay Google directly for ad spend?',
        answer:
          'Yes. Your Google Ads billing card stays on your own account so you keep 100% ownership of campaign history, keyword data, and spend transparency.',
      },
      {
        question: 'Which Canadian markets work best for Google Search Ads?',
        answer:
          'We manage campaigns across Ontario (GTA, Oakville, Burlington, Ottawa, London), British Columbia (Vancouver, Surrey, Lower Mainland), and high-intent regional markets nationwide.',
      },
    ],
  },
  '/social-media-advertising': {
    path: '/social-media-advertising',
    label: 'Facebook & Instagram Ads',
    title: 'Facebook & Instagram Ads Agency Canada | Growvia',
    description:
      'Full-service Meta advertising for Canadian home service businesses, clinics, and retailers. Custom creative, local targeting, and monthly ROI reporting.',
    keywordsTheme: [
      'Facebook advertising agency Canada',
      'Facebook Ads for contractors',
      'Lead generation for home services',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.9',
    serviceSchema: {
      serviceType: 'Facebook & Instagram Paid Social Advertising',
      name: 'Facebook & Instagram Ads Management',
      description:
        'End-to-end Meta advertising covering creative hooks, short-form video ads, geo-targeted lead generation, and retargeting across Canada.',
    },
    faqs: [
      {
        question: 'Why combine custom video creative with Facebook & Instagram Ads?',
        answer:
          'Real footage of your team, trucks, or clinic builds immediate local trust and stops scroll fatigue, lowering cost per lead compared to generic stock templates.',
      },
      {
        question: 'Are Meta Ads effective for plumbers, HVAC, and roofers?',
        answer:
          'Yes — seasonal promotions, replacement offers, and before/after home transformation reels perform strongly across local postal codes when paired with clean qualification forms.',
      },
      {
        question: 'Do I own my Meta Ad Account and Pixel data?',
        answer:
          'Yes. We operate inside your Business Manager with partner access so every audience, pixel event, and creative test belongs permanently to your company.',
      },
    ],
  },
  '/website-design': {
    path: '/website-design',
    label: 'Website Design & Local SEO',
    title: 'Small Business & Contractor Website Design | Growvia',
    description:
      'Fast, mobile-ready websites engineered for local SEO and conversion across Ontario, BC, and Canada. Own your codebase, domain, and leads from day one.',
    keywordsTheme: [
      'Website design for small businesses',
      'Contractor website design',
      'Small business web design Ontario',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.9',
    serviceSchema: {
      serviceType: 'Custom Website Design, Development & Technical SEO',
      name: 'Website Design & Local SEO',
      description:
        'Custom responsive websites built for speed, Core Web Vitals, local Google visibility, and higher quote-form conversions.',
    },
    faqs: [
      {
        question: 'Are your websites built for both Google Ads landing pages and organic SEO?',
        answer:
          'Yes. Every site combines clean semantic HTML, fast mobile load times, structured metadata, and high-clarity quote flows so paid clicks convert and Google ranks your service pages.',
      },
      {
        question: 'Will I own my domain and website code after launch?',
        answer:
          'Always 100%. Your domain, hosting, analytics, and codebase remain completely under your business ownership without proprietary lock-in.',
      },
      {
        question: 'How long does a typical small business website take?',
        answer:
          'Focused lead-generation sites and redesigns typically ship within 3 to 5 weeks from discovery and copy structure to launch and technical SEO indexing.',
      },
    ],
  },
  '/content-creation': {
    path: '/content-creation',
    label: 'Content & Creative',
    title: 'Video & Photo Content Creation Canada | Growvia',
    description:
      'Authentic on-location photo, short-form video reels, and drone creative shot for Canadian contractors, dental clinics, and growing local brands.',
    keywordsTheme: [
      'Commercial video production Ontario',
      'Short-form video creative Canada',
      'Authentic ad photography for local business',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.8',
    serviceSchema: {
      serviceType: 'Commercial Photography, Video Production & Ad Creative',
      name: 'Content & Creative Production',
      description:
        'On-location short-form video reels, brand photography, and drone production engineered for paid advertising and websites.',
    },
    faqs: [
      {
        question: 'Do we have to use actors or stock clips?',
        answer:
          'No. We script simple, natural prompts around your real technicians, dentists, founders, and completed projects so prospective buyers trust the real people showing up.',
      },
      {
        question: 'Can one shoot fuel ads, Instagram, and our website at once?',
        answer:
          'Yes. Every shoot is planned to deliver horizontal web headers, vertical 9:16 Reels ad variations, and crisp high-resolution team and project stills.',
      },
    ],
  },
  '/industries': {
    path: '/industries',
    label: 'Industries We Serve',
    title: 'Marketing for Home Services, Dental & Retail | Growvia',
    description:
      'Tailored Google Ads, Meta ads, and web strategies for plumbers, HVAC, roofers, electricians, dental clinics, and local small businesses across Canada.',
    keywordsTheme: [
      'Marketing for plumbers and HVAC',
      'Marketing agency for contractors',
      'Dental clinic marketing Canada',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.85',
    faqs: [
      {
        question: 'Why specialize in home services, dental clinics, and local small businesses?',
        answer:
          'Local service providers depend on booked calls, trust before a technician or clinician arrives, and measurable cost per lead rather than vanity social impressions.',
      },
      {
        question: 'Which trades and local businesses do you support?',
        answer:
          'We actively build growth systems for HVAC, plumbing, electrical, roofing, landscaping, custom home builders, dental & healthcare clinics, fitness studios, and local retail.',
      },
    ],
  },
  '/about': {
    path: '/about',
    label: 'About Growvia',
    title: 'About Growvia | Canadian Digital Marketing Team',
    description:
      'Meet founders Muzammil Wahid, Omar Irfan, and Amir Miah. A Canadian ads, content, and web team built for transparent reporting and 100% client ownership.',
    keywordsTheme: [
      'About Growvia',
      'Muzammil Wahid Omar Irfan Amir Miah',
      'Canadian digital marketing agency',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.8',
    faqs: [
      {
        question: 'Who does the actual strategy, creative, and development work at Growvia?',
        answer:
          'Founders Muzammil Wahid (Ads & Strategy), Omar Irfan (Creative Director), and Amir Miah (Web & Local SEO) lead execution directly — never handing accounts off to anonymous layers.',
      },
      {
        question: 'Does Growvia work on month-to-month agreements?',
        answer:
          'Yes. Retainers run month-to-month with plain-English reporting tied to qualified leads, calls, and conversion performance.',
      },
    ],
  },
  '/contact': {
    path: '/contact',
    label: 'Contact',
    title: 'Contact Growvia | Request a Free Marketing Quote',
    description:
      'Start a 60-second quote request or reach Growvia directly at growviacanada@gmail.com and (604) 722-6760. Serving Ontario, BC, and businesses across Canada.',
    keywordsTheme: [
      'Contact Growvia Canada',
      'Marketing quote Ontario and BC',
      'Small business marketing consultation',
    ],
    ogType: 'website',
    changefreq: 'monthly',
    priority: '0.85',
    faqs: [
      {
        question: 'How quickly will Growvia reply to a quote inquiry?',
        answer:
          'Every quote submission and email to growviacanada@gmail.com receives a direct response from our founding team within one business day.',
      },
      {
        question: 'Can we call or request a quote outside Ontario and BC?',
        answer:
          'Yes. Call (604) 722-6760 or send a quote brief anytime — we partner with growth-focused local and service businesses across Canada.',
      },
    ],
  },
};

export function normalizeSeoRoute(rawPathname: string): SeoRoutePath | null {
  const pathOnly = rawPathname.split('?')[0]?.split('#')[0] ?? '/';
  if (pathOnly === '' || pathOnly === '/') {
    return '/';
  }
  const trimmed = pathOnly.endsWith('/') ? pathOnly.slice(0, -1) : pathOnly;
  if ((SEO_ROUTE_PATHS as readonly string[]).includes(trimmed)) {
    return trimmed as SeoRoutePath;
  }
  return null;
}

export function buildCanonicalUrl(path: SeoRoutePath): string {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

export interface BreadcrumbItem {
  name: string;
  path: SeoRoutePath;
  url: string;
  position: number;
  isCurrent: boolean;
}

export interface UiBreadcrumbItem {
  name: string;
  path: SeoRoutePath | null;
  url: string | null;
  position: number;
  isCurrent: boolean;
}

export function buildBreadcrumbTrail(routePath: SeoRoutePath): BreadcrumbItem[] {
  if (routePath === '/') {
    return [
      {
        name: 'Home',
        path: '/',
        url: `${SITE_ORIGIN}/`,
        position: 1,
        isCurrent: true,
      },
    ];
  }

  return [
    {
      name: 'Home',
      path: '/',
      url: `${SITE_ORIGIN}/`,
      position: 1,
      isCurrent: false,
    },
    {
      name: SEO_PAGES[routePath].label,
      path: routePath,
      url: buildCanonicalUrl(routePath),
      position: 2,
      isCurrent: true,
    },
  ];
}

export function buildLocalizedBreadcrumbTrail(
  routePath: SeoRoutePath | null,
  labels?: {
    homeLabel?: string;
    currentLabel?: string;
    notFoundLabel?: string;
  }
): UiBreadcrumbItem[] {
  const homeName = labels?.homeLabel?.trim() || 'Home';

  if (routePath === null) {
    return [
      {
        name: homeName,
        path: '/',
        url: `${SITE_ORIGIN}/`,
        position: 1,
        isCurrent: false,
      },
      {
        name: labels?.notFoundLabel?.trim() || labels?.currentLabel?.trim() || 'Page Not Found',
        path: null,
        url: null,
        position: 2,
        isCurrent: true,
      },
    ];
  }

  return buildBreadcrumbTrail(routePath).map((item) => ({
    ...item,
    name:
      item.path === '/'
        ? homeName
        : item.isCurrent && labels?.currentLabel?.trim()
          ? labels.currentLabel.trim()
          : item.name,
  }));
}

export function buildJsonLdGraph(routePath: SeoRoutePath): Record<string, unknown> {
  const page = SEO_PAGES[routePath];
  const canonical = buildCanonicalUrl(routePath);

  const organizationNode: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: BUSINESS_PROFILE.name,
    legalName: BUSINESS_PROFILE.legalName,
    url: `${SITE_ORIGIN}/`,
    logo: BUSINESS_PROFILE.logo,
    email: BUSINESS_PROFILE.email,
    telephone: BUSINESS_PROFILE.telephone,
    founder: BUSINESS_PROFILE.founders.map((name) => ({
      '@type': 'Person',
      name,
    })),
    sameAs: [...BUSINESS_PROFILE.socialUrls],
  };

  const professionalServiceNode: Record<string, unknown> = {
    '@type': 'ProfessionalService',
    '@id': `${SITE_ORIGIN}/#service-business`,
    name: BUSINESS_PROFILE.name,
    url: `${SITE_ORIGIN}/`,
    image: BUSINESS_PROFILE.image,
    email: BUSINESS_PROFILE.email,
    telephone: BUSINESS_PROFILE.telephone,
    priceRange: '$$',
    areaServed: BUSINESS_PROFILE.areaServed.map((area) => ({
      '@type': area === 'Canada' ? 'Country' : 'AdministrativeArea',
      name: area,
    })),
    provider: { '@id': `${SITE_ORIGIN}/#organization` },
  };

  const webPageNode: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: page.title,
    description: page.description,
    inLanguage: 'en-CA',
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    about: { '@id': `${SITE_ORIGIN}/#organization` },
  };

  const graph: Record<string, unknown>[] = [organizationNode, professionalServiceNode, webPageNode];

  if (routePath === '/') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: BUSINESS_PROFILE.name,
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      inLanguage: 'en-CA',
    });
  } else {
    const trail = buildBreadcrumbTrail(routePath);
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  if (page.serviceSchema) {
    graph.push({
      '@type': 'Service',
      name: page.serviceSchema.name,
      serviceType: page.serviceSchema.serviceType,
      description: page.serviceSchema.description,
      provider: { '@id': `${SITE_ORIGIN}/#organization` },
      areaServed: BUSINESS_PROFILE.areaServed.map((area) => ({
        '@type': area === 'Canada' ? 'Country' : 'AdministrativeArea',
        name: area,
      })),
      url: canonical,
    });
  }

  if (page.faqs && page.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildSitemapXml(): string {
  const urls = SEO_ROUTE_PATHS.map((path) => {
    const meta = SEO_PAGES[path];
    const loc = buildCanonicalUrl(path);
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <changefreq>${meta.changefreq}</changefreq>`,
      `    <priority>${meta.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}

function escapeHtmlAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function injectSeoIntoHtml(htmlTemplate: string, rawUrl: string): string {
  const normalized = normalizeSeoRoute(rawUrl);
  const meta = normalized ? SEO_PAGES[normalized] : SEO_PAGES['/'];
  const canonical = normalized ? buildCanonicalUrl(normalized) : buildCanonicalUrl('/');
  const robots = normalized ? 'index, follow' : 'noindex, follow';
  const jsonLd = JSON.stringify(buildJsonLdGraph(normalized ?? '/')).replace(/<\/script/gi, '<\\/script');

  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeCanonical = escapeHtmlAttr(canonical);
  const safeRobots = escapeHtmlAttr(robots);

  let html = htmlTemplate;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta name="description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta name="robots" content="${safeRobots}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    () => `<link rel="canonical" href="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta property="og:url" content="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    () => `<meta name="twitter:description" content="${safeDesc}" />`
  );

  // Remove any previous injected schema script tag before inserting fresh route JSON-LD
  html = html.replace(
    /<script\s+id="growvia-seo-schema"\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/i,
    () => ''
  );

  const schemaTag = `    <script id="growvia-seo-schema" type="application/ld+json">${jsonLd}</script>\n  </head>`;
  return html.replace(/<\/head>/i, () => schemaTag);
}
