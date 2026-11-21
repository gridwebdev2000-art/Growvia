import type {
  CampaignTile,
  ClientResultItem,
  ClientReviewItem,
  FaqItem,
  ServiceCardData,
  TeamMember,
  WebsiteShowcaseItem,
} from '../data/agencyData';
import {
  CAMPAIGN_TILES,
  CLIENT_RESULTS,
  FAQ_ITEMS,
  REVIEWS_ROW_ONE,
  REVIEWS_ROW_TWO,
  SERVICES,
  TEAM_MEMBERS,
  WEBSITE_MOCKS,
} from '../data/agencyData';
import { SEO_SUBPAGES } from '../data/seoPagesData';
import type { SeoSubpageContent } from '../data/seoPagesData';
import type { BudgetOption, ServiceOption } from './quoteLogic';
import type { SeoFaqEntry, SeoRoutePath } from './seoConfig';
import { SEO_PAGES } from './seoConfig';

export type Locale = 'en' | 'fr';

export const LOCALE_STORAGE_KEY = 'growvia_locale_v1';

export function normalizeLocale(input: string | null | undefined): Locale | null {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase();
  if (cleaned === 'en' || cleaned.startsWith('en-')) return 'en';
  if (cleaned === 'fr' || cleaned.startsWith('fr-')) return 'fr';
  return null;
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}

export function resolveInitialLocale({
  search = '',
  stored = null,
  navigatorLanguage = '',
}: {
  search?: string;
  stored?: string | null;
  navigatorLanguage?: string;
}): Locale {
  if (search) {
    try {
      const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
      const fromQuery = normalizeLocale(params.get('lang'));
      if (fromQuery) return fromQuery;
    } catch {
      // Ignore malformed query strings
    }
  }

  const fromStorage = normalizeLocale(stored);
  if (fromStorage) return fromStorage;

  const fromNav = normalizeLocale(navigatorLanguage);
  if (fromNav) return fromNav;

  return 'en';
}

export interface ServiceMenuItem {
  label: string;
  href: string;
}

export interface SiteMessages {
  navbar: {
    homeAria: string;
    primaryNavAria: string;
    servicesButton: string;
    work: string;
    results: string;
    about: string;
    faq: string;
    getQuote: string;
    languageGroupAria: string;
    switchToEnglishAria: string;
    switchToFrenchAria: string;
    serviceMenuLinks: ServiceMenuItem[];
  };
  hero: {
    badge: string;
    titleLead: string;
    titleGrow: string;
    titleSecondLine: string;
    subtitle: string;
    getQuote: string;
    exploreWork: string;
    treeAlt: string;
    treeFallbackAria: string;
    trustHeading: string;
    sectors: readonly string[];
    scrollWorkAria: string;
    cardAriaPrefix: string;
    metaCardTitle: string;
    yourBusiness: string;
    sponsored: string;
    learnMore: string;
    googleCardTitle: string;
    googleSearchQuery: string;
    googleAdTag: string;
    contentCardTitle: string;
    websiteCardTitle: string;
    websiteCardHeadline: string;
    websiteCardCta: string;
  };
  campaigns: {
    regionAria: string;
    heading: string;
    scrollCue: string;
    modalEyebrow: string;
    closeAria: string;
    adAngleLabel: string;
    creativeBriefLabel: string;
    deliverablesLabel: string;
    closeBtn: string;
    quoteForPrefix: string;
    tiles: CampaignTile[];
  };
  services: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    learnMore: string;
    items: ServiceCardData[];
    metaMock: {
      yourBusiness: string;
      sponsored: string;
      ctaTitle: string;
      learnMore: string;
    };
    googleMock: {
      searchText: string;
      adBadge: string;
      headline: string;
      description: string;
    };
    contentMock: {
      shootBadge: string;
      reelTitle: string;
      playAria: string;
      pauseAria: string;
    };
    websiteMock: {
      eyebrow: string;
      headline: string;
      cta: string;
      badges: [string, string, string];
    };
  };
  results: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    subtitle: string;
    items: ClientResultItem[];
  };
  reviews: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    starsAria: string;
    summaryText: string;
    rowOne: ClientReviewItem[];
    rowTwo: ClientReviewItem[];
  };
  websites: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    subtitle: string;
    requestQuote: string;
    bottomCta: string;
    items: WebsiteShowcaseItem[];
  };
  aiLab: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    headingEnd: string;
    subtitle: string;
    tablistAria: string;
    tabs: {
      blueprint: string;
      audit: string;
      advisor: string;
    };
    presetsLabel: string;
    presets: {
      label: string;
      businessName: string;
      industry: string;
      city: string;
      goal: string;
    }[];
    voiceBrief: string;
    stopRecording: string;
    transcribing: string;
    uploadAudio: string;
    micUnavailable: string;
    micListening: string;
    micDenied: string;
    heardPrefix: string;
    noSpeech: string;
    businessNameLabel: string;
    businessNamePlaceholder: string;
    industryLabel: string;
    industryPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    cityDefault: string;
    goalLabel: string;
    goalPlaceholder: string;
    buildPlanBtn: string;
    buildingPlanBtn: string;
    strategySummary: string;
    sendPlanToQuote: string;
    metaCardLabel: string;
    suggestedButton: string;
    googleCardLabel: string;
    localKeywords: string;
    videoCardLabel: string;
    voiceSelectLabel: string;
    voices: { Kore: string; Puck: string; Charon: string; Zephyr: string };
    listenVoiceover: string;
    generatingAudio: string;
    websiteCardLabel: string;
    localSeoCardLabel: string;
    checkInAudit: string;
    targetAreas: string;
    searchPhrases: string;
    auditUrlLabel: string;
    auditUrlPlaceholder: string;
    auditQueryLabel: string;
    auditQueryPlaceholder: string;
    auditGroundingHint: string;
    runAuditBtn: string;
    scanningMarketBtn: string;
    auditFallbackNote: string;
    groundedSources: string;
    auditCtaPrompt: string;
    auditToQuoteBtn: string;
    advisorStarters: string[];
    advisorGreeting: string;
    advisorInputAria: string;
    advisorPlaceholder: string;
    advisorThinking: string;
    advisorSend: string;
    advisorSending: string;
    advisorCtaPrompt: string;
    advisorCustomQuoteBtn: string;
  };
  difference: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    body: string;
    strengths: string[];
    team: TeamMember[];
  };
  faq: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    headingEnd: string;
    items: FaqItem[];
  };
  ctaAndFooter: {
    ctaEyebrow: string;
    ctaHeadingLead: string;
    ctaHeadingHighlight: string;
    ctaBody: string;
    ctaButton: string;
    backToTopAria: string;
    footerTagline: string;
    servicesColTitle: string;
    servicesLinks: {
      meta: string;
      google: string;
      content: string;
      website: string;
    };
    companyColTitle: string;
    companyLinks: {
      industries: string;
      about: string;
      contact: string;
      work: string;
      faq: string;
    };
    contactColTitle: string;
    emailLabel: string;
    phoneLabel: string;
    areaBadge: string;
    serviceAreasTitle: string;
    copyright: string;
    servingCanada: string;
  };
  quoteModal: {
    progressAriaPrefix: string;
    startFresh: string;
    closeAria: string;
    draftRestored: string;
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    voiceNoteFill: string;
    voiceNoteStop: string;
    voiceNoteTranscribing: string;
    voiceNoteListening: string;
    voiceNoteUnavailable: string;
    voiceNoteDenied: string;
    voiceNoteDone: string;
    businessNameLabel: string;
    businessNamePlaceholder: string;
    industryLabel: string;
    industryPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    step3Title: string;
    step3Subtitle: string;
    contactNameLabel: string;
    contactNamePlaceholder: string;
    emailLabel: string;
    phoneLabel: string;
    step4Title: string;
    step4Subtitle: string;
    step5HeadingPrefix: string;
    step5FallbackName: string;
    step5BodyPart1: string;
    step5BodyPart2: string;
    step5BodyPart3: string;
    summaryServices: string;
    summaryIndustry: string;
    summaryBudget: string;
    summaryNotes: string;
    summaryReference: string;
    doneBtn: string;
    sendEmailCopy: string;
    openEmailInstead: string;
    backBtn: string;
    takesLess60: string;
    continueBtn: string;
    getMyQuoteBtn: string;
    sendingBtn: string;
    serviceLabels: Record<ServiceOption, string>;
    budgetLabels: Record<BudgetOption, string>;
  };
  subpage: {
    breadcrumbAria: string;
    homeLabel: string;
    notFoundBreadcrumb: string;
    notFoundEyebrow: string;
    notFoundTitle: string;
    notFoundBody: string;
    returnHomeBtn: string;
    requestQuoteBtn: string;
    tryAiLabBtn: string;
    directEmailLabel: string;
    phoneTextLabel: string;
    whoFitsBestEyebrow: string;
    faqHeading: string;
    relatedHeading: string;
    backToOverviewLink: string;
  };
  scrollWidget: {
    backToTopTitle: string;
    ariaPrefix: string;
    ariaSuffix: string;
  };
}

export const MESSAGES: Record<Locale, SiteMessages> = {
  en: {
    navbar: {
      homeAria: 'Growvia home',
      primaryNavAria: 'Primary navigation',
      servicesButton: 'Services',
      work: 'Work',
      results: 'Results',
      about: 'About',
      faq: 'FAQ',
      getQuote: 'Get a quote',
      languageGroupAria: 'Language selector',
      switchToEnglishAria: 'Switch language to English',
      switchToFrenchAria: 'Switch language to French',
      serviceMenuLinks: [
        { label: 'Google Ads Management', href: '/google-ads-management' },
        { label: 'Facebook & Instagram Ads', href: '/social-media-advertising' },
        { label: 'Website Design & Local SEO', href: '/website-design' },
        { label: 'Content & Creative', href: '/content-creation' },
        { label: 'Industries We Serve', href: '/industries' },
        { label: 'All Services Overview', href: '/#services' },
      ],
    },
    hero: {
      badge: 'Now accepting new clients',
      titleLead: 'Built to',
      titleGrow: 'grow.',
      titleSecondLine: 'Designed to perform.',
      subtitle: 'Websites, advertising and content that move your business forward.',
      getQuote: 'Get a quote',
      exploreWork: 'Explore our work',
      treeAlt:
        'Growvia digital marketing agency botanical tree illustration framed by Google Ads, Facebook and Instagram Ads, video production, and website design cards',
      treeFallbackAria: 'Growvia botanical tree digital marketing agency graphic',
      trustHeading: 'Built for ambitious Canadian businesses.',
      sectors: [
        'Local Businesses',
        'Fitness & Wellness',
        'Dental Clinics',
        'Healthcare',
        'Home Services',
      ],
      scrollWorkAria: 'Scroll to recent campaigns',
      cardAriaPrefix: 'Request quote for',
      metaCardTitle: 'Facebook & Instagram Ads',
      yourBusiness: 'Your Business',
      sponsored: 'Sponsored',
      learnMore: 'Learn more',
      googleCardTitle: 'Google Ads',
      googleSearchQuery: 'your business near me',
      googleAdTag: 'Ad',
      contentCardTitle: 'Content & Creative',
      websiteCardTitle: 'Website Design & Development',
      websiteCardHeadline: 'Grow your business.',
      websiteCardCta: 'Get started',
    },
    campaigns: {
      regionAria: 'Our recent campaigns',
      heading: 'Our recent campaigns',
      scrollCue: 'Scroll',
      modalEyebrow: 'Case study brief',
      closeAria: 'Close campaign preview',
      adAngleLabel: 'Ad angle',
      creativeBriefLabel: 'Creative brief',
      deliverablesLabel: 'Included deliverables',
      closeBtn: 'Close',
      quoteForPrefix: 'Quote for',
      tiles: CAMPAIGN_TILES,
    },
    services: {
      eyebrow: 'Our services',
      headingLead: 'Four ways we help your business',
      headingHighlight: 'grow.',
      learnMore: 'Learn more',
      items: SERVICES,
      metaMock: {
        yourBusiness: 'Your business',
        sponsored: 'Sponsored',
        ctaTitle: 'Book your local estimate',
        learnMore: 'Learn more',
      },
      googleMock: {
        searchText: 'trusted local service near me',
        adBadge: 'Ad',
        headline: 'Your Business — Serving Ontario Homes & Teams',
        description:
          'Fast local response, upfront pricing, and verified workmanship across Ontario. Request a free quote online today.',
      },
      contentMock: {
        shootBadge: '4K · Ontario Shoot',
        reelTitle: 'Brand story reel',
        playAria: 'Play sample video preview',
        pauseAria: 'Pause sample video preview',
      },
      websiteMock: {
        eyebrow: 'Built to convert',
        headline: 'Clear offer. Fast load. Local Google SEO.',
        cta: 'Get a free estimate',
        badges: ['0.8s Load', 'Local SEO', '+64% Leads'],
      },
    },
    results: {
      eyebrow: 'Client results',
      headingLead: 'Our recent client',
      headingHighlight: 'success stories.',
      subtitle:
        'Measured 90-day outcomes across paid search, Meta ads, and conversion-focused web builds in Ontario.',
      items: CLIENT_RESULTS,
    },
    reviews: {
      eyebrow: 'Client reviews',
      headingLead: 'Hear what clients say about',
      headingHighlight: 'working with us.',
      starsAria: '4.9 out of 5 stars',
      summaryText: 'Average across 48 Google reviews',
      rowOne: REVIEWS_ROW_ONE,
      rowTwo: REVIEWS_ROW_TWO,
    },
    websites: {
      eyebrow: 'Websites',
      headingLead: 'The websites behind the',
      headingHighlight: 'brands & results.',
      subtitle:
        'Ads only work as well as the page they land on. We design fast, plain-English websites built to rank across Ontario and turn clicks into phone calls and quote requests.',
      requestQuote: 'Request quote',
      bottomCta: 'Get a quote for yours',
      items: WEBSITE_MOCKS,
    },
    aiLab: {
      eyebrow: 'Growvia AI Lab',
      headingLead: 'Preview your',
      headingHighlight: 'growth plan',
      headingEnd: 'before we talk.',
      subtitle:
        'Generate tailored Meta & Google ad copy, listen to an AI voiceover of a 30-second video script, run a live local search audit, or ask our marketing advisor anything.',
      tablistAria: 'Growvia AI tools',
      tabs: {
        blueprint: 'Campaign Blueprint',
        audit: 'Site & Market Audit',
        advisor: 'Ask Advisor',
      },
      presetsLabel: 'Try an example:',
      presets: [
        {
          label: 'Oakville HVAC · Furnace tune-ups',
          businessName: 'Halton Comfort Heating',
          industry: 'HVAC & Home Services',
          city: 'Oakville, Ontario',
          goal: 'Book 25 seasonal furnace tune-ups and emergency repair calls per month.',
        },
        {
          label: 'Toronto Dental · New patients',
          businessName: 'Cedar & Elm Dental',
          industry: 'Dental Clinic',
          city: 'Toronto, Ontario',
          goal: 'Attract local families for cleanings, Invisalign, and checkups.',
        },
        {
          label: 'London Landscaper · Backyard builds',
          businessName: 'Thames Stone & Turf',
          industry: 'Landscaping & Hardscaping',
          city: 'London, Ontario',
          goal: 'Generate qualified spring patio and interlocking quote requests.',
        },
      ],
      voiceBrief: 'Voice brief',
      stopRecording: 'Stop recording',
      transcribing: 'Transcribing...',
      uploadAudio: 'Upload audio',
      micUnavailable:
        'Browser microphone recording is unavailable here — try uploading an audio note instead.',
      micListening: 'Listening... click Stop when finished.',
      micDenied:
        'Microphone permission was denied. You can type your details or upload an audio clip.',
      heardPrefix: 'Heard:',
      noSpeech: 'Audio processed, but no speech was detected.',
      businessNameLabel: 'Business name',
      businessNamePlaceholder: 'e.g. Halton Comfort Heating',
      industryLabel: 'Industry',
      industryPlaceholder: 'e.g. HVAC, Dental, Retail',
      cityLabel: 'Ontario city or region',
      cityPlaceholder: 'e.g. Oakville, GTA, Ottawa',
      cityDefault: 'Ontario',
      goalLabel: 'What do you want to grow most?',
      goalPlaceholder: 'e.g. Book 25 local quote requests a month',
      buildPlanBtn: 'Build my growth plan',
      buildingPlanBtn: 'Building plan...',
      strategySummary: 'Strategy summary',
      sendPlanToQuote: 'Send plan to quote',
      metaCardLabel: '01 · Facebook & Instagram Ad',
      suggestedButton: 'Suggested button:',
      googleCardLabel: '02 · Google Search Ad',
      localKeywords: 'Local keywords:',
      videoCardLabel: '03 · Video Reel Script',
      voiceSelectLabel: 'Voiceover narrator',
      voices: {
        Kore: 'Voice: Kore (Warm)',
        Puck: 'Voice: Puck (Upbeat)',
        Charon: 'Voice: Charon (Steady)',
        Zephyr: 'Voice: Zephyr (Clear)',
      },
      listenVoiceover: 'Listen to AI voiceover',
      generatingAudio: 'Generating audio...',
      websiteCardLabel: '04 · Website Landing Page',
      localSeoCardLabel: '05 · Ontario Local SEO & Service Areas',
      checkInAudit: 'Check in Market Audit →',
      targetAreas: 'Target Ontario service areas',
      searchPhrases: 'Regional Ontario search phrases',
      auditUrlLabel: 'Your website URL (optional)',
      auditUrlPlaceholder: 'https://yourbusiness.ca',
      auditQueryLabel: 'Ontario local search topic',
      auditQueryPlaceholder: 'e.g. Best emergency plumber in Mississauga',
      auditGroundingHint: 'Uses live web page reading & Google Search grounding.',
      runAuditBtn: 'Run live audit',
      scanningMarketBtn: 'Scanning live market...',
      auditFallbackNote:
        'Strategic Ontario market review (live web search grounding is temporarily throttled).',
      groundedSources: 'Grounded sources',
      auditCtaPrompt: 'Want our team to act on these findings for your site and local ads?',
      auditToQuoteBtn: 'Turn this audit into a quote',
      advisorStarters: [
        'Should I start with Google Ads or Facebook & Instagram Ads?',
        'How much ad spend do small Ontario businesses usually start with?',
        'Do I need a brand new website before running paid ads?',
      ],
      advisorGreeting:
        'Hi! Ask me anything about Facebook & Instagram ads, Google Ads, local SEO, video shoots, or ad budgets in Ontario.',
      advisorInputAria: 'Ask Growvia Advisor a question',
      advisorPlaceholder: 'Ask about ad budgets, local SEO, websites, or video shoots...',
      advisorThinking: 'Thinking...',
      advisorSend: 'Ask',
      advisorSending: 'Replying...',
      advisorCtaPrompt: 'Ready for tailored numbers and a rollout timeline?',
      advisorCustomQuoteBtn: 'Get a custom quote',
    },
    difference: {
      eyebrow: 'Our difference',
      headingLead: 'We are in it to help you',
      headingHighlight: 'grow yours',
      body: 'Founded in Ontario by Muzammil Wahid, Omar Irfan, and Amir Miah, Growvia brings paid advertising, on-location photo and video production, and custom web design under one roof so local business owners work directly with the people doing the work.',
      strengths: [
        'One team for ads, content, and web — nothing gets lost between agencies',
        'Plain-English reporting tied to real leads and revenue, never vanity clicks',
        'You keep 100% ownership of your website, ad accounts, and every video file',
      ],
      team: TEAM_MEMBERS,
    },
    faq: {
      eyebrow: 'FAQ',
      headingLead: 'Questions we',
      headingHighlight: 'get asked',
      headingEnd: 'a lot.',
      items: FAQ_ITEMS,
    },
    ctaAndFooter: {
      ctaEyebrow: 'Get a quote',
      ctaHeadingLead: 'Ready to grow your business with',
      ctaHeadingHighlight: 'a team that does it all?',
      ctaBody:
        'Tell us what you are looking for in 60 seconds. We will reply with a straight-up quote and a simple plan for your market in Ontario.',
      ctaButton: 'Get a free quote',
      backToTopAria: 'Back to top of Growvia',
      footerTagline:
        'An Ontario marketing agency helping small and mid-size businesses grow with ads, websites, and real content.',
      servicesColTitle: 'Services',
      servicesLinks: {
        meta: 'Facebook & IG Ads',
        google: 'Google Ads',
        content: 'Content & Creative',
        website: 'Web Design & SEO',
      },
      companyColTitle: 'Company',
      companyLinks: {
        industries: 'Industries',
        about: 'About us',
        contact: 'Contact',
        work: 'Work',
        faq: 'FAQ',
      },
      contactColTitle: 'Contact',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      areaBadge: 'Ontario, BC & across Canada',
      serviceAreasTitle: 'Service areas',
      copyright: `© ${new Date().getFullYear()} Growvia. All rights reserved.`,
      servingCanada: 'Serving Canada · Ontario & BC',
    },
    quoteModal: {
      progressAriaPrefix: 'Step',
      startFresh: 'Start fresh',
      closeAria: 'Close quote popup',
      draftRestored: 'Draft restored',
      step1Title: 'What can we help you with?',
      step1Subtitle: 'Pick as many as you need — we build custom plans around your goals.',
      step2Title: 'Tell us about the business',
      step2Subtitle: 'So we can look up your market and prepare relevant ideas before replying.',
      voiceNoteFill: 'Fill by voice note',
      voiceNoteStop: 'Stop voice note',
      voiceNoteTranscribing: 'Transcribing...',
      voiceNoteListening: 'Listening... click Stop when finished.',
      voiceNoteUnavailable: 'Microphone recording is unavailable in this browser.',
      voiceNoteDenied: 'Microphone permission denied — please type your details below.',
      voiceNoteDone: 'Voice note processed.',
      businessNameLabel: 'Business name',
      businessNamePlaceholder: 'e.g. Maple Ridge Plumbing',
      industryLabel: 'Industry',
      industryPlaceholder: 'e.g. Home services, Dental, Retail, Trades',
      notesLabel: 'Project notes or timeline (optional)',
      notesPlaceholder: 'e.g. Launching a spring campaign in Ottawa next month',
      step3Title: 'Where do we send the quote?',
      step3Subtitle: 'No automated spam — a real person on our Ontario team will follow up.',
      contactNameLabel: 'Your name',
      contactNamePlaceholder: 'Alex Taylor',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      step4Title: 'Roughly what can you put behind ads each month?',
      step4Subtitle: 'Note: This goes directly to Meta and Google for your ad clicks, not to us.',
      step5HeadingPrefix: 'Thanks,',
      step5FallbackName: 'there',
      step5BodyPart1: 'We received your quote request for',
      step5BodyPart2: 'Our Ontario team will review your details and email',
      step5BodyPart3: 'within one business day.',
      summaryServices: 'Services:',
      summaryIndustry: 'Industry:',
      summaryBudget: 'Monthly ad spend:',
      summaryNotes: 'Notes:',
      summaryReference: 'Reference:',
      doneBtn: 'Done',
      sendEmailCopy: 'Send copy via email',
      openEmailInstead: 'Open in your email app instead',
      backBtn: 'Back',
      takesLess60: 'Takes less than 60 seconds',
      continueBtn: 'Continue',
      getMyQuoteBtn: 'Get my quote',
      sendingBtn: 'Sending...',
      serviceLabels: {
        'Facebook & Instagram Ads': 'Facebook & Instagram Ads',
        'Google Ads': 'Google Ads',
        Website: 'Website',
        'Content & Creative': 'Content & Creative',
      },
      budgetLabels: {
        'Under $1,000': 'Under $1,000',
        '$1,000 to $3,000': '$1,000 to $3,000',
        '$3,000 to $5,000': '$3,000 to $5,000',
        '$5,000+': '$5,000+',
        'Not sure yet': 'Not sure yet',
      },
    },
    subpage: {
      breadcrumbAria: 'Breadcrumb',
      homeLabel: 'Home',
      notFoundBreadcrumb: 'Page not found',
      notFoundEyebrow: 'Page not found',
      notFoundTitle: 'That Growvia page could not be found.',
      notFoundBody:
        'Head back to our homepage or explore our Google Ads, Meta Ads, Content & Creative, and Website Design pages below.',
      returnHomeBtn: 'Return to Growvia Home',
      requestQuoteBtn: 'Request a quote',
      tryAiLabBtn: 'Try AI Growth Plan Preview',
      directEmailLabel: 'Direct Email',
      phoneTextLabel: 'Phone & Text',
      whoFitsBestEyebrow: 'Who this fits best',
      faqHeading: 'Frequently asked questions',
      relatedHeading: 'Explore more Growvia capabilities',
      backToOverviewLink: 'Back to homepage overview →',
    },
    scrollWidget: {
      backToTopTitle: 'Back to top',
      ariaPrefix: 'Page scroll progress',
      ariaSuffix: 'Click to scroll back to top.',
    },
  },
  fr: {
    navbar: {
      homeAria: 'Accueil Growvia',
      primaryNavAria: 'Navigation principale',
      servicesButton: 'Services',
      work: 'Réalisations',
      results: 'Résultats',
      about: 'À propos',
      faq: 'FAQ',
      getQuote: 'Obtenir un devis',
      languageGroupAria: 'Sélecteur de langue',
      switchToEnglishAria: 'Passer le site en anglais',
      switchToFrenchAria: 'Passer le site en français',
      serviceMenuLinks: [
        { label: 'Gestion Google Ads', href: '/google-ads-management' },
        { label: 'Publicités Facebook & Instagram', href: '/social-media-advertising' },
        { label: 'Conception Web & SEO local', href: '/website-design' },
        { label: 'Contenu & Création', href: '/content-creation' },
        { label: 'Secteurs desservis', href: '/industries' },
        { label: 'Tous nos services', href: '/#services' },
      ],
    },
    hero: {
      badge: 'Ouvert aux nouveaux clients',
      titleLead: 'Conçu pour',
      titleGrow: 'croître.',
      titleSecondLine: 'Pensé pour performer.',
      subtitle: 'Sites web, publicités et contenu qui font avancer votre entreprise.',
      getQuote: 'Obtenir un devis',
      exploreWork: 'Voir nos réalisations',
      treeAlt:
        'Illustration botanique d’arbre de l’agence de marketing numérique Growvia encadrée par des cartes Google Ads, Facebook et Instagram Ads, production vidéo et conception de sites web',
      treeFallbackAria: 'Graphique d’arbre botanique de l’agence Growvia',
      trustHeading: 'Pensé pour les entreprises canadiennes ambitieuses.',
      sectors: [
        'Entreprises locales',
        'Conditionnement & Bien-être',
        'Cliniques dentaires',
        'Santé',
        'Services à domicile',
      ],
      scrollWorkAria: 'Défiler vers nos campagnes récentes',
      cardAriaPrefix: 'Demander un devis pour',
      metaCardTitle: 'Publicités Facebook & Instagram',
      yourBusiness: 'Votre entreprise',
      sponsored: 'Commandité',
      learnMore: 'En savoir plus',
      googleCardTitle: 'Google Ads',
      googleSearchQuery: 'votre entreprise près de moi',
      googleAdTag: 'Annonce',
      contentCardTitle: 'Contenu & Création',
      websiteCardTitle: 'Design & Développement Web',
      websiteCardHeadline: 'Développez votre entreprise.',
      websiteCardCta: 'Commencer',
    },
    campaigns: {
      regionAria: 'Nos campagnes récentes',
      heading: 'Nos campagnes récentes',
      scrollCue: 'Défiler',
      modalEyebrow: 'Fiche de campagne',
      closeAria: 'Fermer l’aperçu de campagne',
      adAngleLabel: 'Angle publicitaire',
      creativeBriefLabel: 'Brief créatif',
      deliverablesLabel: 'Livrables inclus',
      closeBtn: 'Fermer',
      quoteForPrefix: 'Devis pour',
      tiles: [
        {
          ...CAMPAIGN_TILES[0],
          industry: 'Immobilier',
          type: 'Vidéo immobilière',
          metricBadge: '128k vues',
          targetFormat: 'Reels 9:16 & Film 4K',
          campaignNote:
            'Visite filmée sur place et plans aériens par drone conçus pour la portée organique et la notoriété locale Meta.',
          adAngle:
            'Faites découvrir l’histoire du quartier dans les 3 premières secondes avant de révéler les pièces.',
          creativeBrief:
            'Tournage d’une demi-journée incluant survols au crépuscule, transitions stabilisées et narration du courtier.',
          deliverables: [
            'Film vedette 60 s',
            '3 formats verticaux',
            '24 photos HDR',
            'Plans aériens par drone',
          ],
        },
        {
          ...CAMPAIGN_TILES[1],
          industry: 'Services à domicile',
          type: 'Campagne de prospects',
          metricBadge: '4,8x ROAS',
          targetFormat: 'Formulaire instantané & Page locale',
          campaignNote:
            'Campagne Meta géociblée dans un rayon de 25 km auprès des propriétaires en haute saison.',
          adAngle:
            'Disponibilité la semaine même en Ontario avec diagnostic transparent et zéro frais cachés.',
          creativeBrief:
            'Capsule vidéo de techniciens filmée devant les camions de service avec demande de soumission en 3 champs.',
          deliverables: [
            '3 accroches vidéo',
            'Ciblage local précis',
            'Suivi Pixel de conversion',
            'Pilotage hebdo du budget',
          ],
        },
        {
          ...CAMPAIGN_TILES[2],
          industry: 'Clinique dentaire',
          type: 'Vidéo de confiance',
          metricBadge: '-38 % CPL',
          targetFormat: 'Meta Reels & Vidéo d’accueil',
          campaignNote:
            'Série chaleureuse remplaçant les photos banques d’images par vos vrais dentistes, hygiénistes et salles.',
          adAngle:
            'Découvrez l’équipe et l’ambiance apaisante de la clinique avant de réserver votre première visite.',
          creativeBrief:
            'Tournage en lumière naturelle captant l’accueil des patients, questions-réponses et appel à la réservation.',
          deliverables: [
            'Capsule de présentation',
            'Visite de la clinique',
            'Visuels de reciblage',
            'Médias page rendez-vous',
          ],
        },
        {
          ...CAMPAIGN_TILES[3],
          industry: 'Constructeur sur mesure',
          type: 'Google Search & Site web',
          metricBadge: '3,9x prospects',
          targetFormat: 'Recherche haute intention + Page projet',
          campaignNote:
            'Campagne Google Search en correspondance exacte liée à une page rapide qui pré-qualifie chaque projet.',
          adAngle:
            'Captez les propriétaires recherchant agrandissements et rénovations complètes à Burlington et Oakville.',
          creativeBrief:
            'Pages dédiées par ville avec galerie de réalisations, échéanciers et formulaire qualifié par budget.',
          deliverables: [
            'Campagnes Search locales',
            'Liste de mots-clés exclus',
            'Création page d’atterrissage',
            'Suivi appels & formulaires',
          ],
        },
        {
          ...CAMPAIGN_TILES[4],
          industry: 'Aménagement paysager',
          type: 'Promo saisonnière',
          metricBadge: '+64 % réservations',
          targetFormat: 'Carrousels avant/après & Vidéos',
          campaignNote:
            'Poussée printanière mettant en valeur patios en pavé uni, terrasses en cèdre et cours complètes.',
          adAngle:
            'Réservez votre créneau de printemps avant la fermeture du calendrier de mai en Ontario.',
          creativeBrief:
            'Accélérés de chantier et carrousels mettant de l’avant la finition de pierre pour remplir l’agenda.',
          deliverables: [
            'Créations saisonnières',
            'Mix Carrousel & Reels',
            'Formulaire de qualification',
            'Séquence de reciblage',
          ],
        },
        {
          ...CAMPAIGN_TILES[5],
          industry: 'Commerce local',
          type: 'Lancement e-commerce',
          metricBadge: '4,4x ROAS',
          targetFormat: 'Boutique Shopify & Pubs dynamiques',
          campaignNote:
            'Refonte mobile rapide combinée au reciblage catalogue Meta et à une séance photo produit soignée.',
          adAngle:
            'Pensé pour la navigation à une main, des preuves claires et un passage en caisse plus fluide.',
          creativeBrief:
            'Pages collections repensées accompagnées de photos d’ambiance prêtes pour les publicités sociales.',
          deliverables: [
            'Refonte de boutique',
            'Optimisation du paiement',
            'Photos de collection',
            'Publicités catalogue Meta',
          ],
        },
      ],
    },
    services: {
      eyebrow: 'Nos services',
      headingLead: 'Quatre façons de faire',
      headingHighlight: 'grandir votre entreprise.',
      learnMore: 'En savoir plus',
      items: [
        {
          ...SERVICES[0],
          title: 'Publicités Facebook & Instagram',
          description:
            'Rejoignez les bonnes personnes dans votre zone de service pendant qu’elles naviguent. Nous gérons tout : stratégie, script vidéo, montage publicitaire, ciblage local et gestion quotidienne du budget.',
          tags: ['Génération de prospects', 'E-commerce', 'Reciblage'],
        },
        {
          ...SERVICES[1],
          title: 'Google Ads',
          description:
            'Apparaissez exactement lorsque quelqu’un dans votre ville cherche ce que vous offrez. Nous prenons en charge recherche de mots-clés, configuration, annonces claires, suivi des conversions et optimisation continue.',
          tags: ['Annonces Search', 'Performance Max', 'Annonces locales'],
        },
        {
          ...SERVICES[2],
          title: 'Contenu & Création',
          description:
            'De vraies photos et vidéos courtes tournées pour votre site, vos réseaux sociaux et vos publicités. Fini les clichés génériques — uniquement des visuels authentiques de votre équipe et de votre savoir-faire.',
          tags: ['Vidéo', 'Photographie', 'Drone'],
        },
        {
          ...SERVICES[3],
          title: 'Design & Développement Web',
          description:
            'Des sites rapides et clairs conçus pour représenter votre marque, vous positionner sur Google au Canada et transformer chaque clic publicitaire en appel ou demande de devis.',
          tags: ['Design web', 'Développement', 'SEO'],
        },
      ],
      metaMock: {
        yourBusiness: 'Votre entreprise',
        sponsored: 'Commandité',
        ctaTitle: 'Réservez votre estimation locale',
        learnMore: 'En savoir plus',
      },
      googleMock: {
        searchText: 'service local de confiance près de moi',
        adBadge: 'Annonce',
        headline: 'Votre entreprise — Service local au Canada',
        description:
          'Réponse locale rapide, tarifs clairs et travail garanti en Ontario et partout au pays. Demandez un devis gratuit aujourd’hui.',
      },
      contentMock: {
        shootBadge: '4K · Tournage local',
        reelTitle: 'Vidéo de marque',
        playAria: 'Lire l’aperçu vidéo',
        pauseAria: 'Mettre l’aperçu vidéo en pause',
      },
      websiteMock: {
        eyebrow: 'Conçu pour convertir',
        headline: 'Offre claire. Chargement rapide. SEO local.',
        cta: 'Obtenir une estimation',
        badges: ['0,8 s Charg.', 'SEO local', '+64 % Prospects'],
      },
    },
    results: {
      eyebrow: 'Résultats clients',
      headingLead: 'Nos récentes histoires de',
      headingHighlight: 'réussite client.',
      subtitle:
        'Résultats mesurés sur 90 jours en recherche payante, publicités Meta et sites web orientés conversion au Canada.',
      items: [
        {
          index: '01',
          title: 'Halton Comfort Heating & Cooling',
          industry: 'Services résidentiels · Oakville & Burlington',
          stats: [
            { value: '-42%', label: 'Coût par prospect qualifié' },
            { value: '4.8x', label: 'Retour sur investissement pub' },
            { value: '+64%', label: 'Appels saisonniers réservés' },
          ],
        },
        {
          index: '02',
          title: 'Cedar & Elm Family Dental',
          industry: 'Clinique dentaire · Mississauga & GTA',
          stats: [
            { value: '-38%', label: 'Coût par rendez-vous patient' },
            { value: '5.2x', label: 'Pipeline patient attribué' },
            { value: '+81%', label: 'Appels organiques et pub' },
          ],
        },
        {
          index: '03',
          title: 'Willow & Loom Home Goods',
          industry: 'Commerce local · Guelph & Kitchener',
          stats: [
            { value: '+47%', label: 'Taux de conversion panier' },
            { value: '4.4x', label: 'ROAS combiné Meta & Google' },
            { value: '-31%', label: 'Coût par achat en ligne' },
          ],
        },
      ],
    },
    reviews: {
      eyebrow: 'Avis clients',
      headingLead: 'Ce que nos clients disent de',
      headingHighlight: 'notre collaboration.',
      starsAria: '4,9 sur 5 étoiles',
      summaryText: 'Moyenne sur 48 avis Google',
      rowOne: [
        {
          ...REVIEWS_ROW_ONE[0],
          quote:
            'Avoir une seule équipe pour nos Google Ads, nos pages d’atterrissage et le tournage de nos camions a réduit notre coût par prospect de plus de 40 % avant l’hiver.',
        },
        {
          ...REVIEWS_ROW_ONE[1],
          quote:
            'Des suivis mensuels en langage clair, zéro contrat contraignant et une vidéo d’accueil qui reflète vraiment l’esprit de notre clinique.',
        },
        {
          ...REVIEWS_ROW_ONE[2],
          quote:
            'Notre nouveau site pré-qualifie enfin les demandes de maisons sur mesure et transforme chaque semaine nos clics Google en consultations.',
        },
        {
          ...REVIEWS_ROW_ONE[3],
          quote:
            'Filmer notre propre équipe de maçonnerie a surpassé tous les modèles génériques testés et a rempli notre calendrier printanier très tôt.',
        },
      ],
      rowTwo: [
        {
          ...REVIEWS_ROW_TWO[0],
          quote:
            'Tarification mensuelle simple, accès direct à Muzammil, Omar et Amir, et des inscriptions locales régulières chaque mois.',
        },
        {
          ...REVIEWS_ROW_TWO[1],
          quote:
            'Ils ont refait nos pages de réservation en physio et éliminé les clics Google inutiles dès les trois premières semaines — l’effet a été immédiat.',
        },
        {
          ...REVIEWS_ROW_TWO[2],
          quote:
            'Nous avons conservé 100 % de la propriété de nos comptes publicitaires, notre boutique Shopify et chaque photo et vidéo dès le premier jour.',
        },
        {
          ...REVIEWS_ROW_TWO[3],
          quote:
            'Au lieu de courir après trois pigistes distincts, publicités, création et ajustements web avancent en quelques jours sous un même toit.',
        },
      ],
    },
    websites: {
      eyebrow: 'Sites web',
      headingLead: 'Les sites web derrière les',
      headingHighlight: 'marques et résultats.',
      subtitle:
        'Une publicité ne vaut que par la page où elle mène. Nous concevons des sites rapides et clairs pour vous classer sur Google au Canada et convertir les clics en appels et devis.',
      requestQuote: 'Demander un devis',
      bottomCta: 'Obtenir un devis pour le vôtre',
      items: [
        {
          ...WEBSITE_MOCKS[0],
          eyebrowLabel: 'Projet 01 · Services résidentiels',
          headlineSample: 'Réservation rapide chauffage & climatisation',
          highlights: ['98 PageSpeed', '+64 % Appels devis'],
          industry: 'CVAC & Métiers · Oakville, ON',
        },
        {
          ...WEBSITE_MOCKS[1],
          eyebrowLabel: 'Projet 02 · Santé',
          headlineSample: 'Accueil clinique chaleureux & prise de rendez-vous',
          highlights: ['Réservation 2 clics', '4,9★ SEO local'],
          industry: 'Dentaire & Bien-être · Mississauga',
        },
        {
          ...WEBSITE_MOCKS[2],
          eyebrowLabel: 'Projet 03 · Construction',
          headlineSample: 'Galerie de projets & soumissions qualifiées',
          highlights: ['Portfolio projets', '3,9x Prospects'],
          industry: 'Rénovations sur mesure · Burlington',
        },
      ],
    },
    aiLab: {
      eyebrow: 'Labo IA Growvia',
      headingLead: 'Visualisez votre',
      headingHighlight: 'plan de croissance',
      headingEnd: 'avant même de parler.',
      subtitle:
        'Générez des textes publicitaires Meta & Google sur mesure, écoutez une voix hors champ IA de 30 secondes, lancez un audit SEO local ou posez vos questions à notre conseiller marketing.',
      tablistAria: 'Outils IA Growvia',
      tabs: {
        blueprint: 'Plan de campagne',
        audit: 'Audit site & marché',
        advisor: 'Conseiller IA',
      },
      presetsLabel: 'Essayer un exemple :',
      presets: [
        {
          label: 'CVAC Oakville · Entretien chaudière',
          businessName: 'Halton Comfort Heating',
          industry: 'CVAC & Services résidentiels',
          city: 'Oakville, Ontario',
          goal: 'Obtenir 25 entretiens saisonniers et appels d’urgence par mois.',
        },
        {
          label: 'Dentaire Toronto · Nouveaux patients',
          businessName: 'Cedar & Elm Dental',
          industry: 'Clinique dentaire',
          city: 'Toronto, Ontario',
          goal: 'Attirer les familles locales pour nettoyages, Invisalign et bilans.',
        },
        {
          label: 'Paysagiste London · Cours arrière',
          businessName: 'Thames Stone & Turf',
          industry: 'Aménagement paysager',
          city: 'London, Ontario',
          goal: 'Générer des demandes qualifiées de patios et pavés au printemps.',
        },
      ],
      voiceBrief: 'Brief vocal',
      stopRecording: 'Arrêter l’enregistrement',
      transcribing: 'Transcription...',
      uploadAudio: 'Importer audio',
      micUnavailable:
        'L’enregistrement micro est indisponible ici — importez plutôt un fichier audio.',
      micListening: 'Écoute en cours... cliquez sur Arrêter une fois terminé.',
      micDenied:
        'L’accès au micro a été refusé. Saisissez vos détails ou importez un fichier audio.',
      heardPrefix: 'Entendu :',
      noSpeech: 'Audio traité, mais aucune parole n’a été détectée.',
      businessNameLabel: 'Nom de l’entreprise',
      businessNamePlaceholder: 'ex. Halton Comfort Heating',
      industryLabel: 'Secteur d’activité',
      industryPlaceholder: 'ex. CVAC, Dentaire, Commerce',
      cityLabel: 'Ville ou région canadienne',
      cityPlaceholder: 'ex. Montréal, Ottawa, Vancouver',
      cityDefault: 'Ontario',
      goalLabel: 'Quel est votre objectif prioritaire ?',
      goalPlaceholder: 'ex. Obtenir 25 demandes de devis locales par mois',
      buildPlanBtn: 'Créer mon plan',
      buildingPlanBtn: 'Création du plan...',
      strategySummary: 'Résumé stratégique',
      sendPlanToQuote: 'Envoyer au formulaire devis',
      metaCardLabel: '01 · Publicité Facebook & Instagram',
      suggestedButton: 'Bouton suggéré :',
      googleCardLabel: '02 · Annonce Google Search',
      localKeywords: 'Mots-clés locaux :',
      videoCardLabel: '03 · Script vidéo Reel',
      voiceSelectLabel: 'Narrateur voix hors champ',
      voices: {
        Kore: 'Voix : Kore (Chaleureuse)',
        Puck: 'Voix : Puck (Dynamique)',
        Charon: 'Voix : Charon (Posée)',
        Zephyr: 'Voix : Zephyr (Claire)',
      },
      listenVoiceover: 'Écouter la voix IA',
      generatingAudio: 'Génération audio...',
      websiteCardLabel: '04 · Page d’atterrissage Web',
      localSeoCardLabel: '05 · SEO local & Zones desservies',
      checkInAudit: 'Vérifier dans l’audit marché →',
      targetAreas: 'Zones cibles prioritaires',
      searchPhrases: 'Requêtes locales cibles',
      auditUrlLabel: 'URL de votre site web (facultatif)',
      auditUrlPlaceholder: 'https://votreentreprise.ca',
      auditQueryLabel: 'Sujet de recherche locale',
      auditQueryPlaceholder: 'ex. Meilleur plombier d’urgence à Ottawa',
      auditGroundingHint: 'Utilise la lecture web en direct et la recherche Google.',
      runAuditBtn: 'Lancer l’audit',
      scanningMarketBtn: 'Analyse en direct...',
      auditFallbackNote:
        'Analyse stratégique du marché canadien (la recherche en direct est temporairement limitée).',
      groundedSources: 'Sources vérifiées',
      auditCtaPrompt: 'Vous souhaitez que notre équipe applique ces pistes à votre site et vos pubs ?',
      auditToQuoteBtn: 'Convertir en demande de devis',
      advisorStarters: [
        'Dois-je commencer par Google Ads ou Facebook & Instagram Ads ?',
        'Quel budget publicitaire les PME canadiennes prévoient-elles au départ ?',
        'Faut-il refaire mon site web avant de lancer des publicités payantes ?',
      ],
      advisorGreeting:
        'Bonjour ! Posez-moi vos questions sur les publicités Meta, Google Ads, le SEO local, les tournages vidéo ou les budgets au Canada.',
      advisorInputAria: 'Poser une question au conseiller Growvia',
      advisorPlaceholder: 'Demandez pour les budgets, le SEO local, les sites ou la vidéo...',
      advisorThinking: 'Réflexion...',
      advisorSend: 'Demander',
      advisorSending: 'Réponse...',
      advisorCtaPrompt: 'Prêt pour des chiffres précis et un calendrier de lancement ?',
      advisorCustomQuoteBtn: 'Obtenir un devis sur mesure',
    },
    difference: {
      eyebrow: 'Notre différence',
      headingLead: 'Nous sommes là pour faire',
      headingHighlight: 'grandir la vôtre',
      body: 'Fondée en Ontario par Muzammil Wahid, Omar Irfan et Amir Miah, Growvia réunit publicité payante, production photo et vidéo sur place et conception web sous un même toit pour que les entrepreneurs travaillent directement avec les experts aux commandes.',
      strengths: [
        'Une seule équipe pour pubs, contenu et web — rien ne se perd entre agences',
        'Rapports simples centrés sur les vrais appels et revenus, jamais sur les clics vains',
        'Vous gardez 100 % de la propriété de votre site, vos comptes pub et vos fichiers vidéo',
      ],
      team: [
        {
          ...TEAM_MEMBERS[0],
          focusTag: 'Pubs payantes',
          role: 'Co-fondateur · Pubs & Stratégie',
          bio: 'Pilote la stratégie Meta et Google Ads avec une maîtrise stricte du coût par prospect.',
        },
        {
          ...TEAM_MEMBERS[1],
          focusTag: 'Photo & Vidéo',
          role: 'Co-fondateur · Directeur créatif',
          bio: 'Réalise des tournages sur place authentiques conçus pour capter l’attention locale.',
        },
        {
          ...TEAM_MEMBERS[2],
          focusTag: 'Web & SEO',
          role: 'Co-fondateur · Web & SEO local',
          bio: 'Conçoit des sites rapides optimisés pour convertir et se classer sur Google au Canada.',
        },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      headingLead: 'Les questions qu’on nous',
      headingHighlight: 'pose le plus',
      headingEnd: 'souvent.',
      items: [
        {
          question: 'Combien coûtent vos services ?',
          answer:
            'Les tarifs dépendent de vos besoins — un canal unique comme Google Ads, un nouveau site web ou un forfait mensuel complet pubs + contenu + web. Demandez un devis rapide pour recevoir des tarifs mensuels fixes et transparents sans surprise.',
        },
        {
          question: 'Puis-je transférer depuis mon agence marketing actuelle ?',
          answer:
            'Oui. Nous auditons proprement vos comptes Meta, Google Ads, vos statistiques et votre site avant tout changement afin d’éviter toute interruption de vos campagnes actives.',
        },
        {
          question: 'Y a-t-il des contrats ou engagements à long terme ?',
          answer:
            'Aucun engagement contraignant à long terme. Nos accompagnements fonctionnent au mois, car nos résultats — prospects, appels et ventes — doivent être la seule raison de rester.',
        },
        {
          question: 'Et si je veux seulement des publicités sans production vidéo ?',
          answer:
            'Tout à fait possible. Vous pouvez faire appel à nous uniquement pour Google Ads, Meta Ads ou la conception web, puis ajouter notre équipe photo et vidéo lorsque vous avez besoin de contenu frais.',
        },
        {
          question: 'Mon budget publicitaire est-il inclus dans vos honoraires ?',
          answer:
            'Non — votre budget média est payé directement à Google ou Meta depuis votre propre compte de facturation. Nos honoraires fixes couvrent stratégie, création, optimisation, suivi et rapports.',
        },
        {
          question: 'Qui est propriétaire de mon site, mes comptes pub et mes vidéos ?',
          answer:
            'Vous l’êtes à 100 %. Chaque compte publicitaire, pixel, nom de domaine, code source et fichier photo ou vidéo reste à votre nom dès le premier jour.',
        },
        {
          question: 'Où êtes-vous basés et dans quelles régions travaillez-vous ?',
          answer:
            'Nous accompagnons des entreprises locales partout en Ontario, en Colombie-Britannique et à travers le Canada. Écrivez-nous à growviacanada@gmail.com ou appelez au (604) 722-6760.',
        },
      ],
    },
    ctaAndFooter: {
      ctaEyebrow: 'Obtenir un devis',
      ctaHeadingLead: 'Prêt à faire croître votre entreprise avec',
      ctaHeadingHighlight: 'une équipe qui gère tout ?',
      ctaBody:
        'Dites-nous ce que vous recherchez en 60 secondes. Nous vous répondrons avec un devis clair et un plan simple adapté à votre marché canadien.',
      ctaButton: 'Obtenir un devis gratuit',
      backToTopAria: 'Retour en haut de Growvia',
      footerTagline:
        'Une agence marketing canadienne aidant les PME à croître grâce aux publicités, aux sites web et au contenu authentique.',
      servicesColTitle: 'Services',
      servicesLinks: {
        meta: 'Publicités FB & IG',
        google: 'Google Ads',
        content: 'Contenu & Création',
        website: 'Design Web & SEO',
      },
      companyColTitle: 'Entreprise',
      companyLinks: {
        industries: 'Secteurs',
        about: 'À propos',
        contact: 'Contact',
        work: 'Réalisations',
        faq: 'FAQ',
      },
      contactColTitle: 'Contact',
      emailLabel: 'Courriel',
      phoneLabel: 'Téléphone',
      areaBadge: 'Ontario, C.-B. et partout au Canada',
      serviceAreasTitle: 'Zones desservies',
      copyright: `© ${new Date().getFullYear()} Growvia. Tous droits réservés.`,
      servingCanada: 'Au service du Canada · Ontario & C.-B.',
    },
    quoteModal: {
      progressAriaPrefix: 'Étape',
      startFresh: 'Recommencer',
      closeAria: 'Fermer la fenêtre de devis',
      draftRestored: 'Brouillon restauré',
      step1Title: 'Comment pouvons-nous vous aider ?',
      step1Subtitle:
        'Sélectionnez un ou plusieurs services — nous créons des plans adaptés à vos objectifs.',
      step2Title: 'Parlez-nous de votre entreprise',
      step2Subtitle:
        'Pour analyser votre marché local et préparer des pistes concrètes avant notre réponse.',
      voiceNoteFill: 'Dicter une note vocale',
      voiceNoteStop: 'Arrêter la dictée',
      voiceNoteTranscribing: 'Transcription...',
      voiceNoteListening: 'Écoute en cours... cliquez sur Arrêter quand c’est prêt.',
      voiceNoteUnavailable: 'L’enregistrement vocal n’est pas disponible dans ce navigateur.',
      voiceNoteDenied: 'Permission micro refusée — veuillez saisir vos informations ci-dessous.',
      voiceNoteDone: 'Note vocale traitée.',
      businessNameLabel: 'Nom de l’entreprise',
      businessNamePlaceholder: 'ex. Plomberie Érable',
      industryLabel: 'Secteur d’activité',
      industryPlaceholder: 'ex. Services à domicile, Dentaire, Commerce',
      notesLabel: 'Notes ou échéancier du projet (facultatif)',
      notesPlaceholder: 'ex. Lancement d’une campagne de printemps à Ottawa le mois prochain',
      step3Title: 'Où devons-nous envoyer votre devis ?',
      step3Subtitle: 'Zéro pourriel automatisé — un membre réel de notre équipe vous répondra.',
      contactNameLabel: 'Votre nom',
      contactNamePlaceholder: 'Alex Tremblay',
      emailLabel: 'Courriel',
      phoneLabel: 'Téléphone',
      step4Title: 'Quel budget mensuel prévoyez-vous pour vos publicités ?',
      step4Subtitle:
        'Note : Ce budget va directement à Google et Meta pour vos clics, jamais à nos frais.',
      step5HeadingPrefix: 'Merci,',
      step5FallbackName: 'à vous',
      step5BodyPart1: 'Nous avons bien reçu votre demande de devis pour',
      step5BodyPart2: 'Notre équipe examinera votre dossier et vous écrira à',
      step5BodyPart3: 'd’ici un jour ouvrable.',
      summaryServices: 'Services :',
      summaryIndustry: 'Secteur :',
      summaryBudget: 'Budget pub mensuel :',
      summaryNotes: 'Notes :',
      summaryReference: 'Référence :',
      doneBtn: 'Terminer',
      sendEmailCopy: 'Envoyer une copie par courriel',
      openEmailInstead: 'Ouvrir dans votre messagerie à la place',
      backBtn: 'Retour',
      takesLess60: 'Prend moins de 60 secondes',
      continueBtn: 'Continuer',
      getMyQuoteBtn: 'Recevoir mon devis',
      sendingBtn: 'Envoi...',
      serviceLabels: {
        'Facebook & Instagram Ads': 'Publicités Facebook & Instagram',
        'Google Ads': 'Google Ads',
        Website: 'Site web',
        'Content & Creative': 'Contenu & Création',
      },
      budgetLabels: {
        'Under $1,000': 'Moins de 1 000 $',
        '$1,000 to $3,000': '1 000 $ à 3 000 $',
        '$3,000 to $5,000': '3 000 $ à 5 000 $',
        '$5,000+': '5 000 $ et plus',
        'Not sure yet': 'Pas encore certain',
      },
    },
    subpage: {
      breadcrumbAria: 'Fil d’Ariane',
      homeLabel: 'Accueil',
      notFoundBreadcrumb: 'Page introuvable',
      notFoundEyebrow: 'Page introuvable',
      notFoundTitle: 'Cette page Growvia est introuvable.',
      notFoundBody:
        'Retournez à la page d’accueil ou explorez nos services Google Ads, Publicités Meta, Contenu & Création et Design Web ci-dessous.',
      returnHomeBtn: 'Retour à l’accueil Growvia',
      requestQuoteBtn: 'Demander un devis',
      tryAiLabBtn: 'Tester l’aperçu Plan IA',
      directEmailLabel: 'Courriel direct',
      phoneTextLabel: 'Téléphone & Texto',
      whoFitsBestEyebrow: 'Pour qui est-ce conçu',
      faqHeading: 'Questions fréquentes',
      relatedHeading: 'Découvrir nos autres expertises',
      backToOverviewLink: 'Retour à l’aperçu accueil →',
    },
    scrollWidget: {
      backToTopTitle: 'Haut de page',
      ariaPrefix: 'Progression de lecture',
      ariaSuffix: 'Cliquer pour remonter en haut.',
    },
  },
};

export interface TranslatedSeoSubpageBundle {
  breadcrumbLabel: string;
  content: SeoSubpageContent;
  faqs: SeoFaqEntry[];
}

export function getTranslatedSubpage(
  routePath: Exclude<SeoRoutePath, '/'>,
  locale: Locale
): TranslatedSeoSubpageBundle {
  if (locale === 'en') {
    return {
      breadcrumbLabel: SEO_PAGES[routePath].label,
      content: SEO_SUBPAGES[routePath],
      faqs: SEO_PAGES[routePath].faqs ?? [],
    };
  }

  return FRENCH_SEO_SUBPAGES[routePath];
}

const FRENCH_SEO_SUBPAGES: Record<Exclude<SeoRoutePath, '/'>, TranslatedSeoSubpageBundle> = {
  '/google-ads-management': {
    breadcrumbLabel: 'Gestion Google Ads',
    content: {
      ...SEO_SUBPAGES['/google-ads-management'],
      eyebrow: 'Gestion Google Ads · Ontario, C.-B. & Canada',
      h1Lead: 'Google Ads conçu pour générer',
      h1Highlight: 'des appels locaux qualifiés.',
      intro:
        'Captez propriétaires, patients et acheteurs au moment précis où ils cherchent vos services dans votre ville. Nous structurons des campagnes claires, suivons chaque appel et éliminons les dépenses inutiles chaque semaine.',
      primaryCtaLabel: 'Obtenir un devis Google Ads',
      highlightsHeading: 'Ce que couvre notre gestion Google Ads',
      highlights: [
        {
          tag: 'Intention de recherche',
          title: 'Précision des mots-clés et exclusions',
          body: 'Nous ciblons les requêtes à forte intention d’achat en Ontario, en C.-B. et partout au Canada tout en bloquant les clics hors zone ou non pertinents.',
        },
        {
          tag: 'Attribution',
          title: 'Suivi des appels et formulaires',
          body: 'Chaque appel téléphonique et demande de devis est relié au mot-clé exact afin de connaître votre vrai coût par prospect.',
        },
        {
          tag: 'Pertinence page',
          title: 'Alignement offre & ville',
          body: 'Vos annonces mènent vers des pages rapides adaptées à la requête plutôt que vers une page d’accueil lente et générique.',
        },
      ],
      processHeading: 'Notre méthode de lancement et d’optimisation',
      processSteps: [
        {
          step: '01',
          title: 'Audit du compte & du marché',
          detail: 'Analyse de l’historique des recherches, des enchères locales et de vos services les plus rentables.',
        },
        {
          step: '02',
          title: 'Architecture de campagne propre',
          detail: 'Campagnes Search et locales bien segmentées directement dans votre propre compte Google Ads.',
        },
        {
          step: '03',
          title: 'Balises appels & conversions',
          detail: 'Vérification complète du suivi des appels et soumissions avant d’investir un seul dollar média.',
        },
        {
          step: '04',
          title: 'Ajustement hebdomadaire',
          detail: 'Nettoyage hebdomadaire des requêtes et réallocation du budget vers les campagnes les plus rentables.',
        },
      ],
      idealForHeading: 'Pensé pour les entreprises canadiennes où chaque appel compte',
      idealForItems: [
        'Entrepreneurs CVAC, plomberie, électricité et toiture sur les recherches urgentes « près de moi »',
        'Cliniques dentaires et médicales souhaitant augmenter les consultations de nouveaux patients',
        'Constructeurs, paysagistes et entreprises locales voulant stabiliser leur demande saisonnière',
      ],
      editorialSection: {
        eyebrow: 'Travailler avec Growvia · Google Ads',
        heading: 'Une approche plus claire et humaine de Google Ads',
        intro:
          'La recherche payante ne devrait jamais être une boîte noire qui dépense votre budget sur des mots-clés flous. Voici comment nous accompagnons les PME de l’Ontario et de la Colombie-Britannique.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Vous collaborez directement avec Muzammil et Amir, de la recherche de mots-clés jusqu’à l’optimisation de la page d’atterrissage — sans sous-traitance ni modèle générique.',
            points: [
              'Campagnes montées directement dans votre compte Google Ads',
              'Révision hebdomadaire des requêtes réelles et mots-clés exclus',
              'Alignement précis des annonces et des pages par ville et service',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'En 7 à 10 jours ouvrables, vos campagnes Search, votre suivi d’appels et vos formulaires sont en ligne avec des rapports simples centrés sur les demandes qualifiées.',
            points: [
              'Budget publicitaire payé directement à Google sur votre carte',
              'Bilan mensuel clair du coût par appel et par soumission',
              'Entente mensuelle souple sans aucun contrat contraignant',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Du Grand Toronto, Oakville et Ottawa jusqu’à Vancouver et Surrey, les marchés locaux connaissent de fortes variations saisonnières que les agences généralistes négligent.',
            points: [
              'Ciblage par ville et code postal fidèle à votre rayon de service',
              'Web, création et Google Ads réunis au sein d’une même équipe canadienne',
              'Propriété à 100 % de l’historique, des mots-clés et des données',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Conception Web & SEO local',
          path: '/website-design',
          summary: 'Des pages d’atterrissage rapides qui convertissent mieux vos clics Google.',
        },
        {
          label: 'Publicités Facebook & Instagram',
          path: '/social-media-advertising',
          summary: 'Combinez intention de recherche et visibilité sociale locale.',
        },
        {
          label: 'Secteurs desservis',
          path: '/industries',
          summary: 'Découvrez nos stratégies pour métiers, cliniques et commerces.',
        },
      ],
    },
    faqs: [
      {
        question: 'Combien faut-il prévoir sur Google Ads pour une PME canadienne ?',
        answer:
          'La plupart des entreprises locales en Ontario et en Colombie-Britannique commencent avec un budget média de 1 000 $ à 3 500 $ par mois versé directement à Google, en plus d’honoraires fixes mensuels.',
      },
      {
        question: 'Est-ce que je conserve l’accès et la propriété de mon compte Google Ads ?',
        answer:
          'Oui, à 100 %. Vous êtes propriétaire du compte et de tout l’historique des données dès le premier jour.',
      },
    ],
  },
  '/social-media-advertising': {
    breadcrumbLabel: 'Publicités Facebook & Instagram',
    content: {
      ...SEO_SUBPAGES['/social-media-advertising'],
      eyebrow: 'Publicités Facebook & Instagram · Canada',
      h1Lead: 'Publicité sociale conçue pour',
      h1Highlight: 'générer des prospects locaux.',
      intro:
        'Transformez le défilement quotidien en demandes de soumission régulières en Ontario, en Colombie-Britannique et partout au Canada. Offre, scripts vidéo, montage et ciblage gérés sous un même toit.',
      primaryCtaLabel: 'Obtenir un devis Meta Ads',
      highlightsHeading: 'Notre système publicitaire Facebook & Instagram',
      highlights: [
        {
          tag: 'Accroches fortes',
          title: 'Tests créatifs et vidéos natives',
          body: 'Nous testons de vraies histoires clients et visites de chantiers ou cliniques qui s’intègrent naturellement aux Reels.',
        },
        {
          tag: 'Géociblage',
          title: 'Précision par code postal et rayon',
          body: 'Diffusez vos annonces strictement dans le secteur réel que desservent vos équipes.',
        },
        {
          tag: 'Qualification',
          title: 'Capture de prospects qualifiés',
          body: 'Formulaires intelligents et pages rapides filtrant les curieux pour livrer des demandes concrètes.',
        },
      ],
      processHeading: 'Déroulement de votre campagne Meta',
      processSteps: [
        {
          step: '01',
          title: 'Stratégie d’offre et d’angle',
          detail: 'Création d’offres saisonnières adaptées aux propriétaires et patients locaux.',
        },
        {
          step: '02',
          title: 'Scripts et montage vidéo',
          detail: 'Plans de tournage simples ou production complète avec notre équipe Contenu & Création.',
        },
        {
          step: '03',
          title: 'Pixel Meta & suivi CRM',
          detail: 'Configuration propre des événements de conversion directement dans votre Business Manager.',
        },
        {
          step: '04',
          title: 'Renouvellement créatif continu',
          detail: 'Rotation régulière des accroches avant toute fatigue publicitaire pour maintenir un CPL bas.',
        },
      ],
      idealForHeading: 'Là où Meta & Instagram excellent',
      idealForItems: [
        'Aménagement extérieur, rénovation cuisine/bain, toiture et remplacement CVAC',
        'Cliniques dentaires, physiothérapie et studios bien-être bâtissant une confiance locale',
        'Boutiques indépendantes et marques e-commerce canadiennes visant un ROAS rentable',
      ],
      editorialSection: {
        eyebrow: 'Travailler avec Growvia · Publicité sociale',
        heading: 'Des créations locales authentiques alliées à la rigueur Meta Ads',
        intro:
          'Les propriétaires et les familles ignorent les visuels génériques en une fraction de seconde. Nous jumelons de vraies images de votre équipe avec un ciblage local précis.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Nos équipes publicitaires et créatives travaillent main dans la main dès le premier jour pour planifier offres saisonnières, accroches Reels et reciblage dans votre Business Manager.',
            points: [
              'Tests directs de vos tournages photo et vidéo dans Meta Ads',
              'Questions de qualification filtrant les demandes sérieuses',
              'Renouvellement proactif des accroches avant l’essoufflement',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'Les premiers tests identifient les accroches au meilleur coût par prospect, puis nous optimisons chaque semaine selon les devis réellement générés.',
            points: [
              'Séparation claire entre budget média et honoraires mensuels fixes',
              'Envoi instantané des demandes par courriel avec contexte client',
              'Rapports mensuels concrets sans indicateurs superficiels',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Que ce soit dans la RGT, à Ottawa, à Vancouver ou dans la vallée du Fraser, nous concevons des publicités ancrées dans votre réalité locale.',
            points: [
              'Géociblage strict calé sur vos villes et secteurs desservis',
              'Zéro visuel banal qui rend les pros locaux interchangeables',
              'Propriété complète du Pixel, des audiences et des créations',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Contenu & Création',
          path: '/content-creation',
          summary: 'Reels et photos authentiques tournés sur place pour surpasser les visuels génériques.',
        },
        {
          label: 'Gestion Google Ads',
          path: '/google-ads-management',
          summary: 'Captez les recherches actives en parallèle de vos campagnes sociales.',
        },
        {
          label: 'Contacter Growvia',
          path: '/contact',
          summary: 'Obtenez des tarifs mensuels fixes sans contrat à long terme.',
        },
      ],
    },
    faqs: [
      {
        question: 'Avez-vous besoin de nouvelles vidéos pour lancer des publicités Meta ?',
        answer:
          'Des vidéos authentiques fonctionnent toujours mieux, mais nous pouvons commencer avec vos photos/clips existants tout en planifiant de nouvelles captures avec notre équipe.',
      },
      {
        question: 'Comment évitez-vous les demandes hors de notre zone de service ?',
        answer:
          'Nous verrouillons le ciblage géographique sur vos villes et codes postaux précis et ajoutons des questions de confirmation.',
      },
    ],
  },
  '/website-design': {
    breadcrumbLabel: 'Conception Web & SEO',
    content: {
      ...SEO_SUBPAGES['/website-design'],
      eyebrow: 'Conception Web & SEO local · Ontario, C.-B. & Canada',
      h1Lead: 'Des sites conçus pour la vitesse, le SEO et',
      h1Highlight: 'les demandes de devis.',
      intro:
        'Votre site web est la base de chaque recherche Google et clic publicitaire. Nous concevons des sites rapides, clairs et pensés pour le mobile afin de transformer vos visiteurs en appels et soumissions.',
      primaryCtaLabel: 'Obtenir un devis site web',
      highlightsHeading: 'Ce qui distingue un site Growvia',
      highlights: [
        {
          tag: 'Core Web Vitals',
          title: 'Performance mobile ultra-rapide',
          body: 'Code allégé, images WebP optimisées et zéro constructeur lourd pour charger rapidement sur réseau cellulaire.',
        },
        {
          tag: 'Architecture SEO',
          title: 'SEO technique et local intégré',
          body: 'Pages de services dédiées, hiérarchie H1/H2 propre, plan XML, URLs canoniques et données structurées Schema.org.',
        },
        {
          tag: 'Propriété totale',
          title: 'Votre domaine, hébergement et code',
          body: 'Vous ne louez jamais un modèle bloqué : tout ce que nous bâtissons vous appartient à 100 % dès le départ.',
        },
      ],
      processHeading: 'De l’architecture à l’indexation Google',
      processSteps: [
        {
          step: '01',
          title: 'Plan de site & mots-clés',
          detail: 'Association de pages dédiées aux recherches réelles de vos clients canadiens.',
        },
        {
          step: '02',
          title: 'Rédaction claire & maquettes UX',
          detail: 'Mettez de l’avant vos services, votre territoire, vos preuves et un bouton de devis évident.',
        },
        {
          step: '03',
          title: 'Développement responsive rapide',
          detail: 'Intégration fluide sur téléphone, tablette et ordinateur avec HTML sémantique.',
        },
        {
          step: '04',
          title: 'Lancement Search Console & suivi',
          detail: 'Déploiement du sitemap, balises robots et suivi des conversions prêt pour Google.',
        },
      ],
      idealForHeading: 'Idéal pour remplacer un site vieillissant ou lent',
      idealForItems: [
        'Entrepreneurs et services à domicile perdant des clients à cause d’un site dépassé',
        'Cliniques ayant besoin d’une prise de rendez-vous mobile simple et rassurante',
        'PME préparant une refonte propre avant d’accélérer sur Google ou Meta Ads',
      ],
      editorialSection: {
        eyebrow: 'Travailler avec Growvia · Web & SEO',
        heading: 'Comment nous concevons des sites qui se classent et convertissent',
        intro:
          'Un joli site vitrine ne rapporte rien si vos clients locaux ne vous trouvent pas sur Google ou peinent à demander un devis sur mobile. Nous misons sur clarté, vitesse et propriété.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Nous partons des recherches réelles et des questions de vos clients avant d’embaucher, puis nous rédigeons des pages rapides sans constructeurs alourdis.',
            points: [
              'Hiérarchie sémantique H1/H2/H3 et URLs de services propres',
              'Design pensé pour le mobile et testé sur vrais téléphones',
              'Intégration directe avec vos campagnes publicitaires et suivis',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'Nos sites PME sont livrés en 3 à 5 semaines avec SEO technique complet : balises canoniques, plan XML, données Schema.org et images WebP rapides.',
            points: [
              'Chargement mobile ultra-rapide et solides Core Web Vitals',
              'Formulaires de soumission et rendez-vous visibles sans défiler',
              'Livraison propre avec analytique et Search Console configurées',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Trop d’entrepreneurs canadiens restent prisonniers de locations web où l’agence garde le domaine en otage. Chez Growvia, votre site vous appartient entièrement.',
            points: [
              'Propriété totale du domaine, de l’hébergement, des textes et du code',
              'SEO local calibré pour l’Ontario, la C.-B. et le marché canadien',
              'Mises à jour rapides réalisées par l’équipe qui a bâti le site',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Gestion Google Ads',
          path: '/google-ads-management',
          summary: 'Envoyez du trafic qualifié vers des pages prêtes à convertir.',
        },
        {
          label: 'Secteurs desservis',
          path: '/industries',
          summary: 'Découvrez nos structures adaptées aux métiers, cliniques et commerces.',
        },
        {
          label: 'À propos de Growvia',
          path: '/about',
          summary: 'Rencontrez les co-fondateurs qui dirigent vos projets.',
        },
      ],
    },
    faqs: [
      {
        question: 'Est-ce que je possède entièrement le site conçu par Growvia ?',
        answer:
          'Oui, à 100 %. Votre nom de domaine, votre hébergement, vos textes et votre code source restent strictement les vôtres.',
      },
      {
        question: 'Le SEO technique de base est-il inclus dès le lancement ?',
        answer:
          'Oui — chaque site inclut métadonnées propres, données structurées Schema.org, images optimisées, sitemap XML et performances mobiles élevées.',
      },
    ],
  },
  '/content-creation': {
    breadcrumbLabel: 'Contenu & Création',
    content: {
      ...SEO_SUBPAGES['/content-creation'],
      eyebrow: 'Contenu & Création · Photo, Vidéo & Drone',
      h1Lead: 'Des preuves visuelles réelles pour',
      h1Highlight: 'vos pubs et votre confiance.',
      intro:
        'Les clients engagent les entreprises qu’ils reconnaissent. Nous réalisons sur place vos vidéos courtes, portraits d’équipe, visites de clinique et plans drone optimisés pour Reels, Meta Ads, YouTube et votre site.',
      primaryCtaLabel: 'Planifier un tournage',
      highlightsHeading: 'Des livrables créatifs pensés pour performer',
      highlights: [
        {
          tag: 'Vidéo courte',
          title: 'Accroches scénarisées & Reels 9:16',
          body: 'Capsules de 15 à 45 secondes dynamiques avec sous-titres clairs et ton authentique.',
        },
        {
          tag: 'Photographie de marque',
          title: 'Vraies photos d’équipe et d’atelier',
          body: 'Remplacez les banques d’images par de vrais clichés de vos véhicules, réalisations et espaces.',
        },
        {
          tag: 'Drone & B-roll',
          title: 'Plans aériens et transformations',
          body: 'Mettez en valeur toitures, aménagements paysagers et immeubles avec autorité visuelle.',
        },
      ],
      processHeading: 'Une journée de tournage sans stress',
      processSteps: [
        {
          step: '01',
          title: 'Brief créatif & liste de plans',
          detail: 'Omar Irfan prépare chaque accroche et angle à l’avance pour optimiser votre temps.',
        },
        {
          step: '02',
          title: 'Tournage sur place guidé',
          detail: 'Aucun texte à mémoriser par cœur — un accompagnement naturel devant la caméra.',
        },
        {
          step: '03',
          title: 'Montage multi-formats',
          detail: 'Livraison avec graphismes, sous-titres et variantes d’ouverture prêtes pour les tests A/B.',
        },
        {
          step: '04',
          title: 'Bibliothèque complète remise',
          detail: 'Vous gardez l’ensemble des montages et séquences pour vos réseaux et votre site web.',
        },
      ],
      idealForHeading: 'Quand le contenu authentique fait toute la différence',
      idealForItems: [
        'Entrepreneurs souhaitant que les propriétaires reconnaissent leurs camions et leur équipe',
        'Cliniques dentaires et de santé voulant rassurer les nouveaux patients avant leur visite',
        'Commerces locaux et projets immobiliers lançant des campagnes visuelles percutantes',
      ],
      editorialSection: {
        eyebrow: 'Travailler avec Growvia · Production',
        heading: 'Des tournages sur place adaptés aux horaires chargés',
        intro:
          'Pas besoin d’acteurs ni de trois jours de plateau pour inspirer confiance en ligne. Nous guidons dirigeants, techniciens et équipes cliniques dans des séances efficaces.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Omar prépare d’avance une liste de plans ciblée sur les questions réelles de vos clients afin que la journée de tournage demeure fluide et naturelle.',
            points: [
              'Entretiens guidés simples — aucun télésouffleur rigide',
              'Captation simultanée pour Reels verticaux, site web et photos',
              'Étalonnage couleur et sous-titres alignés sur votre image',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'Une demi-journée de tournage produit une bibliothèque complète de variantes publicitaires, de photos d’accueil et de séquences B-roll prêtes sous deux semaines.',
            points: [
              'Plusieurs accroches de 3 secondes pour tester vos pubs Meta',
              'Photographies nettes de votre équipe, clinique ou chantiers',
              'Remise directe de tous les montages finaux et fichiers bruts',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Contrairement aux vidéastes isolés qui livrent de beaux plans sans stratégie, chaque image est pensée pour convertir sur votre marché local.',
            points: [
              'Création élaborée avec nos stratèges Google et Meta Ads',
              'Décors authentiques partout en Ontario et en Colombie-Britannique',
              'Droits d’utilisation illimités à 100 % sans frais récurrents',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Publicités Facebook & Instagram',
          path: '/social-media-advertising',
          summary: 'Transformez vos nouvelles vidéos et photos en campagnes de prospects.',
        },
        {
          label: 'Conception Web & SEO local',
          path: '/website-design',
          summary: 'Intégrez vos vrais visuels sur des pages d’atterrissage rapides.',
        },
        {
          label: 'Contacter Growvia',
          path: '/contact',
          summary: 'Planifiez un tournage ou un forfait combiné publicités + création.',
        },
      ],
    },
    faqs: [
      {
        question: 'Dois-je mémoriser de longs textes devant la caméra ?',
        answer:
          'Pas du tout. Nous utilisons de courtes questions conversationnelles pour que votre équipe reste naturelle et crédible.',
      },
      {
        question: 'Comment sont utilisés les fichiers après le tournage ?',
        answer:
          'Vous conservez tous les montages et rushs pour vos publicités Meta, votre site web, YouTube et votre fiche Google.',
      },
    ],
  },
  '/industries': {
    breadcrumbLabel: 'Secteurs desservis',
    content: {
      ...SEO_SUBPAGES['/industries'],
      eyebrow: 'Secteurs desservis · Partout au Canada',
      h1Lead: 'Conçu pour les métiers, cliniques dentaires et',
      h1Highlight: 'PME locales.',
      intro:
        'Chaque secteur convertit différemment. Au lieu de formules génériques, Growvia bâtit des tunnels dédiés aux services résidentiels, cliniques et commerces locaux en Ontario, en C.-B. et partout au Canada.',
      primaryCtaLabel: 'Devis adapté à votre secteur',
      highlightsHeading: 'Nos secteurs d’expertise principaux',
      highlights: [
        {
          tag: 'Services à domicile & Métiers',
          title: 'Plombiers, CVAC, Couvreurs, Électriciens & Paysagistes',
          body: 'Captez les appels d’urgence sur Google Search et vos promos saisonnières sur Meta grâce à des pages devis rapides.',
        },
        {
          tag: 'Dentaire & Santé',
          title: 'Dentistes familiaux, Physio, Chiro & Bien-être',
          body: 'Vidéos rassurantes, prise de rendez-vous fluide et SEO local de proximité.',
        },
        {
          tag: 'Entreprises locales',
          title: 'Constructeurs, Immobilier & Commerce indépendant',
          body: 'Alliez intention de recherche, boutiques Shopify claires et création vidéo mémorable.',
        },
      ],
      processHeading: 'Comment nous adaptons le marketing à votre réalité',
      processSteps: [
        {
          step: '01',
          title: 'Équilibre Search et Social',
          detail: 'Les urgences priorisent Google Search ; les projets planifiés et cliniques combinent Search et vidéo Meta.',
        },
        {
          step: '02',
          title: 'Qualification avant l’appel',
          detail: 'Rayon desservi clair, repères tarifaires et formulaires rapides protègent le temps de votre équipe.',
        },
        {
          step: '03',
          title: 'Mesure des mandats concrets',
          detail: 'Suivi du coût par appel et devis réel partout en Ontario, en C.-B. et au Canada.',
        },
        {
          step: '04',
          title: 'Agilité budgétaire saisonnière',
          detail: 'Ajustez la pression publicitaire avant les pointes de chauffage, climatisation ou printemps.',
        },
      ],
      idealForHeading: 'Marchés que nous accompagnons activement',
      idealForItems: [
        'Ontario : Toronto, GTA, Oakville, Burlington, Mississauga, Hamilton, Ottawa, London & Kitchener-Waterloo',
        'Colombie-Britannique : Vancouver, Surrey, Burnaby, Richmond & Lower Mainland',
        'Entreprises de services en croissance partout au Canada',
      ],
      editorialSection: {
        eyebrow: 'Travailler avec Growvia · Secteurs canadiens',
        heading: 'Des stratégies façonnées par les vraies habitudes d’achat locales',
        intro:
          'Un propriétaire face à une fuite d’eau ne cherche pas comme une famille qui choisit un dentiste ou planifie une terrasse. Nous adaptons canaux et messages en conséquence.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Plutôt qu’un forfait rigide identique pour tous, nous dosons recherche Google, preuve sociale Meta et pages locales rapides selon vos marges et votre capacité.',
            points: [
              'Priorité aux appels urgents pour les métiers et dépannages',
              'Mise en valeur rassurante des équipes pour cliniques et santé',
              'Preuves avant/après soignées pour constructeurs et paysagistes',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'Chaque campagne démarre avec un suivi d’attribution fiable et un pilotage budgétaire calé sur la saisonnalité de votre province.',
            points: [
              'Filtres clairs pour concentrer vos équipes sur les vrais clients',
              'Ajustements mensuels selon l’occupation de votre carnet',
              'Ligne directe avec nos fondateurs dès que vos priorités évoluent',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Des banlieues du Grand Toronto et du Lower Mainland jusqu’à Ottawa, London et Guelph, nous maîtrisons les nuances géographiques et attentes locales.',
            points: [
              'Méthodes éprouvées pour services résidentiels, cliniques et commerces',
              'Cohérence complète entre publicités, vidéos et site web',
              'Souplesse mois par mois et propriété intégrale de vos comptes',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Gestion Google Ads',
          path: '/google-ads-management',
          summary: 'Campagnes Search calibrées pour métiers spécialisés et cliniques.',
        },
        {
          label: 'Conception Web & SEO local',
          path: '/website-design',
          summary: 'Sites optimisés pour se classer selon votre spécialité.',
        },
        {
          label: 'À propos de Growvia',
          path: '/about',
          summary: 'Découvrez comment nos co-fondateurs collaborent avec les dirigeants.',
        },
      ],
    },
    faqs: [
      {
        question: 'Travaillez-vous seulement en Ontario ?',
        answer:
          'Nous accompagnons des clients en Ontario, en Colombie-Britannique et partout au Canada avec des stratégies adaptées à chaque marché.',
      },
    ],
  },
  '/about': {
    breadcrumbLabel: 'À propos',
    content: {
      ...SEO_SUBPAGES['/about'],
      eyebrow: 'À propos de Growvia · Fondateurs & Approche',
      h1Lead: 'Une seule équipe dédiée à une',
      h1Highlight: 'croissance locale honnête.',
      intro:
        'Growvia a été fondée par Muzammil Wahid, Omar Irfan et Amir Miah pour résoudre un problème courant chez les PME canadiennes : payer trois fournisseurs déconnectés pour les pubs, le web et le contenu sans clarté sur les résultats.',
      primaryCtaLabel: 'Travailler avec notre équipe',
      highlightsHeading: 'Rencontrez les fondateurs qui pilotent votre compte',
      highlights: [
        {
          tag: 'Pubs payantes · Co-fondateur',
          title: 'Muzammil Wahid — Pubs & Stratégie',
          body: 'Dirige la stratégie Google Ads et Meta avec une attention stricte au coût par prospect et au suivi.',
        },
        {
          tag: 'Création · Co-fondateur',
          title: 'Omar Irfan — Directeur créatif',
          body: 'Réalise des tournages photo et vidéo sur place pensés pour montrer votre vrai savoir-faire.',
        },
        {
          tag: 'Web & SEO · Co-fondateur',
          title: 'Amir Miah — Web & SEO local',
          body: 'Conçoit des sites rapides et accessibles bâtis pour bien se classer sur Google et convertir.',
        },
      ],
      processHeading: 'Nos principes non négociables',
      processSteps: [
        {
          step: '01',
          title: 'Accès direct aux fondateurs',
          detail: 'Vous parlez directement aux personnes qui créent vos campagnes, vidéos et pages.',
        },
        {
          step: '02',
          title: '100 % propriétaire de vos actifs',
          detail: 'Domaine, code du site, comptes publicitaires et vidéos restent strictement à votre nom.',
        },
        {
          step: '03',
          title: 'Liberté mois par mois',
          detail: 'Aucun contrat pluriannuel bloqué — la qualité des prospects justifie notre collaboration.',
        },
        {
          step: '04',
          title: 'Rapports en français et anglais simples',
          detail: 'Des bilans mensuels clairs axés sur les appels, soumissions et retombées concrètes.',
        },
      ],
      idealForHeading: 'Pourquoi les PME réunissent tout chez Growvia',
      idealForItems: [
        'Textes publicitaires, accroches vidéo et pages web partagent une seule stratégie dès le départ',
        'Les modifications et ajustements saisonniers se déploient en jours, pas en semaines',
        'Accompagnement réactif en Ontario, en Colombie-Britannique et partout au Canada',
      ],
      editorialSection: {
        eyebrow: 'Notre approche · Growvia Canada',
        heading: 'À quoi ressemble concrètement la collaboration avec nos fondateurs',
        intro:
          'Nous avons fondé Growvia pour éviter aux dirigeants de PME de courir après trois pigistes distincts ou de déchiffrer des tableaux d’agence obscurs.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Muzammil, Omar et Amir pilotent personnellement votre publicité, votre direction créative et votre développement web dans un plan unifié.',
            points: [
              'Une feuille de route partagée entre Google Ads, Meta, vidéo et web',
              'Contact direct avec les experts qui exécutent votre compte',
              'Réactivité en quelques jours lorsque vos offres ou saisons changent',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'Des estimations honnêtes avant le moindre dollar dépensé, une configuration dans vos propres comptes et des bilans mensuels limpides.',
            points: [
              'Honoraires fixes mensuels distincts du budget publicitaire',
              'Aucun contrat pluriannuel ni frais cachés de résiliation',
              'Rapports clairs centrés sur appels et demandes de devis',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Les dirigeants en Ontario et en Colombie-Britannique nous font confiance parce que nous protégeons leur budget et respectons leur propriété à 100 %.',
            points: [
              'Propriété totale des domaines, sites, comptes pub et fichiers vidéo',
              'Connaissance concrète des métiers, cliniques et commerces locaux',
              'Équipe accessible et ancrée dans la réalité du marché canadien',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Secteurs desservis',
          path: '/industries',
          summary: 'Métiers, cliniques et PME locales que nous accompagnons.',
        },
        {
          label: 'Conception Web & SEO local',
          path: '/website-design',
          summary: 'Découvrez notre ingénierie web rapide et orientée SEO.',
        },
        {
          label: 'Contacter Growvia',
          path: '/contact',
          summary: 'Joignez Muzammil, Omar et Amir par courriel ou téléphone.',
        },
      ],
    },
    faqs: [
      {
        question: 'Comment rejoindre directement l’équipe Growvia ?',
        answer:
          'Écrivez à growviacanada@gmail.com ou appelez au (604) 722-6760 pour échanger directement avec nos fondateurs.',
      },
    ],
  },
  '/contact': {
    breadcrumbLabel: 'Contact',
    content: {
      ...SEO_SUBPAGES['/contact'],
      eyebrow: 'Contacter Growvia · Ligne directe',
      h1Lead: 'Parlez-nous de votre projet —',
      h1Highlight: 'recevez un plan clair.',
      intro:
        'Que vous ayez besoin de Google Ads, de campagnes Meta, d’un tournage vidéo ou d’un nouveau site rapide, joignez-nous par courriel ou téléphone ou lancez notre questionnaire de 60 secondes.',
      primaryCtaLabel: 'Lancer le devis en 60 s',
      highlightsHeading: 'Moyens directs de joindre Growvia',
      highlights: [
        {
          tag: 'Courriel officiel',
          title: 'growviacanada@gmail.com',
          body: 'Envoyez votre site web, vos villes cibles ou vos objectifs. Réponse d’ici un jour ouvrable.',
        },
        {
          tag: 'Téléphone & Texto',
          title: '(604) 722-6760',
          body: 'Appelez-nous pour discuter de votre marché en Ontario, en C.-B. ou ailleurs au Canada sans pression.',
        },
        {
          tag: 'Devis interactif',
          title: 'Formulaire guidé 60 secondes',
          body: 'Choisissez vos services, votre secteur et votre budget mensuel pour recevoir une proposition claire.',
        },
      ],
      processHeading: 'Ce qui se passe après votre message',
      processSteps: [
        {
          step: '01',
          title: 'Revue du site et du marché',
          detail: 'Nous vérifions votre vitesse actuelle, votre SEO local et vos concurrents avant de répondre.',
        },
        {
          step: '02',
          title: 'Devis clair et transparent',
          detail: 'Honoraires de gestion fixes séparés clairement du budget publicitaire recommandé.',
        },
        {
          step: '03',
          title: 'Appel découverte sans pression',
          detail: 'Courte rencontre avec nos fondateurs pour valider objectifs, accès et échéancier.',
        },
        {
          step: '04',
          title: 'Lancement en 7 à 14 jours',
          detail: 'Mise en place rapide du suivi, des créations ou de la refonte sans contrat verrouillé.',
        },
      ],
      idealForHeading: 'Au service des entreprises partout au Canada',
      idealForItems: [
        'Couverture directe des marchés locaux en Ontario et en Colombie-Britannique',
        'Stratégie, conception web et gestion publicitaire à distance dans toutes les provinces',
        'Partenariats mensuels flexibles avec propriété complète de vos comptes',
      ],
      editorialSection: {
        eyebrow: 'Avant de parler · Transparence d’abord',
        heading: 'Zéro discours de vente forcé — uniquement des réponses concrètes',
        intro:
          'Contacter une agence marketing ne devrait jamais déclencher une rafale de relances automatisées. Voici comment se déroule chaque premier échange avec nous.',
        blocks: [
          {
            heading: 'Comment nous travaillons',
            summary:
              'Avant même de planifier un appel, nous analysons votre site actuel, vos résultats Google locaux et vos concurrents pour répondre avec des constats utiles.',
            points: [
              'Revue personnalisée par Muzammil, Omar et Amir sous un jour ouvrable',
              'Avis honnête sur la priorité entre publicités, site web ou les deux',
              'Aucune obligation ni séquence de démarchage automatisée',
            ],
          },
          {
            heading: 'À quoi vous attendre',
            summary:
              'Vous recevez des options d’honoraires mensuels fixes claires ainsi qu’une fourchette réaliste de budget média payé directement à Google ou Meta.',
            points: [
              'Portée claire et calendrier de lancement (souvent 7 à 14 jours)',
              'Réponses franches sur le coût par prospect attendu dans votre ville',
              'Collaboration mois par mois si vous choisissez d’avancer',
            ],
          },
          {
            heading: 'Pourquoi les entreprises de l’Ontario et de la C.-B. nous choisissent',
            summary:
              'Des plombiers et couvreurs aux cliniques dentaires et commerces locaux en Ontario et en C.-B., les propriétaires apprécient notre franchise et notre exécution.',
            points: [
              'Ligne directe canadienne au (604) 722-6760 et par courriel',
              'Équipe intégrée pubs, création et web sans sous-traitance',
              'Propriété intégrale de chaque actif et compte dès le premier jour',
            ],
          },
        ],
      },
      relatedLinks: [
        {
          label: 'Gestion Google Ads',
          path: '/google-ads-management',
          summary: 'Campagnes Search pensées pour capter des demandes immédiates.',
        },
        {
          label: 'Publicités Facebook & Instagram',
          path: '/social-media-advertising',
          summary: 'Génération de prospects locale avec créations sur mesure.',
        },
        {
          label: 'À propos de Growvia',
          path: '/about',
          summary: 'Rencontrez nos fondateurs Muzammil Wahid, Omar Irfan et Amir Miah.',
        },
      ],
    },
    faqs: [
      {
        question: 'Quel est le délai de réponse de Growvia ?',
        answer:
          'Nous répondons généralement aux courriels et demandes de devis en moins d’un jour ouvrable.',
      },
    ],
  },
};
