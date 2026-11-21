import type { ServiceOption } from './quoteLogic';

export interface GrowthPlanInput {
  businessName: string;
  industry: string;
  city: string;
  goal: string;
}

export interface GrowthPlanResult {
  summary: string;
  recommendedServices: ServiceOption[];
  metaAd: {
    hook: string;
    primaryText: string;
    cta: string;
  };
  googleAd: {
    headline1: string;
    headline2: string;
    description: string;
    keywords: string[];
  };
  videoScript: {
    title: string;
    durationLabel: string;
    spokenScript: string;
    shotIdeas: string[];
  };
  websiteTips: {
    heroHeadline: string;
    conversionChecklist: string[];
  };
  localSeo: {
    nearbyCities: string[];
    searchPhrases: string[];
    mapPackTip: string;
  };
}

export interface AuditInput {
  websiteUrl: string;
  marketQuery: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

const VALID_SERVICES: ServiceOption[] = [
  'Facebook & Instagram Ads',
  'Google Ads',
  'Website',
  'Content & Creative',
];

export function validateGrowthPlanInput(input: Partial<GrowthPlanInput>): {
  valid: boolean;
  error?: string;
} {
  const businessName = (input.businessName ?? '').trim();
  const industry = (input.industry ?? '').trim();
  const city = (input.city ?? '').trim();
  const goal = (input.goal ?? '').trim();

  if (businessName.length < 2) {
    return { valid: false, error: 'Please enter a business name (at least 2 characters).' };
  }
  if (industry.length < 2) {
    return { valid: false, error: 'Please enter your industry.' };
  }
  if (city.length < 2) {
    return { valid: false, error: 'Please enter an Ontario city or region.' };
  }
  if (goal.length < 4) {
    return { valid: false, error: 'Please enter a short marketing goal.' };
  }
  return { valid: true };
}

export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateAuditInput(input: Partial<AuditInput>): {
  valid: boolean;
  error?: string;
} {
  const websiteUrl = (input.websiteUrl ?? '').trim();
  const marketQuery = (input.marketQuery ?? '').trim();

  if (!websiteUrl && !marketQuery) {
    return {
      valid: false,
      error: 'Enter a website URL, a local Ontario search topic, or both.',
    };
  }
  if (websiteUrl && !isHttpUrl(websiteUrl)) {
    return {
      valid: false,
      error: 'Website URL must start with https:// or http:// (e.g. https://yourbusiness.ca).',
    };
  }
  if (!websiteUrl && marketQuery.length < 4) {
    return {
      valid: false,
      error: 'Please enter a slightly longer search topic (at least 4 characters).',
    };
  }
  return { valid: true };
}

export function normalizeServices(raw: unknown): ServiceOption[] {
  if (!Array.isArray(raw)) return ['Facebook & Instagram Ads', 'Google Ads'];
  const filtered = raw.filter((item): item is ServiceOption =>
    typeof item === 'string' && (VALID_SERVICES as string[]).includes(item)
  );
  return filtered.length > 0 ? filtered : ['Facebook & Instagram Ads', 'Google Ads'];
}

export function parseGrowthPlanJson(rawText: string): GrowthPlanResult {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<GrowthPlanResult>;

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'Custom Ontario growth plan.',
    recommendedServices: normalizeServices(parsed.recommendedServices),
    metaAd: {
      hook: parsed.metaAd?.hook ?? 'Stop scrolling — local Ontario service done right.',
      primaryText:
        parsed.metaAd?.primaryText ??
        'Looking for reliable help without the runaround? Book a fast estimate with our local team.',
      cta: parsed.metaAd?.cta ?? 'Get a free quote',
    },
    googleAd: {
      headline1: parsed.googleAd?.headline1 ?? 'Trusted Local Service in Ontario',
      headline2: parsed.googleAd?.headline2 ?? 'Fast Estimates & Clear Pricing',
      description:
        parsed.googleAd?.description ??
        'Work with a dependable local team. Request your quote online in under a minute.',
      keywords: Array.isArray(parsed.googleAd?.keywords)
        ? parsed.googleAd.keywords.filter((k): k is string => typeof k === 'string').slice(0, 6)
        : ['local service ontario', 'free quote near me'],
    },
    videoScript: {
      title: parsed.videoScript?.title ?? '30-Second Local Proof Reel',
      durationLabel: parsed.videoScript?.durationLabel ?? '00:30',
      spokenScript:
        parsed.videoScript?.spokenScript ??
        'If you live in Ontario and want this handled properly the first time, here is exactly how our team works.',
      shotIdeas: Array.isArray(parsed.videoScript?.shotIdeas)
        ? parsed.videoScript.shotIdeas.filter((s): s is string => typeof s === 'string').slice(0, 5)
        : ['Team arriving on site', 'Close-up of craftsmanship', 'Happy customer walkthrough'],
    },
    websiteTips: {
      heroHeadline:
        parsed.websiteTips?.heroHeadline ?? 'Clear Local Help You Can Book in 60 Seconds',
      conversionChecklist: Array.isArray(parsed.websiteTips?.conversionChecklist)
        ? parsed.websiteTips.conversionChecklist
            .filter((t): t is string => typeof t === 'string')
            .slice(0, 5)
        : ['Put your Ontario service area in the hero headline', 'Add one obvious orange quote button'],
    },
    localSeo: {
      nearbyCities: Array.isArray(parsed.localSeo?.nearbyCities)
        ? parsed.localSeo.nearbyCities.filter((c): c is string => typeof c === 'string').slice(0, 6)
        : ['Toronto', 'Mississauga', 'Oakville', 'Hamilton'],
      searchPhrases: Array.isArray(parsed.localSeo?.searchPhrases)
        ? parsed.localSeo.searchPhrases.filter((p): p is string => typeof p === 'string').slice(0, 6)
        : ['trusted local service Ontario', 'best near me Ontario quotes'],
      mapPackTip:
        typeof parsed.localSeo?.mapPackTip === 'string' && parsed.localSeo.mapPackTip.trim()
          ? parsed.localSeo.mapPackTip
          : 'Build dedicated city landing pages and ask every completed customer for a neighbourhood-specific Google review.',
    },
  };
}

export function extractGroundingSources(chunks: unknown): GroundingSource[] {
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of chunks) {
    if (!chunk || typeof chunk !== 'object') continue;
    const web = (chunk as { web?: { uri?: unknown; title?: unknown } }).web;
    if (!web || typeof web.uri !== 'string' || !isHttpUrl(web.uri)) continue;
    if (seen.has(web.uri)) continue;
    seen.add(web.uri);
    sources.push({
      title: typeof web.title === 'string' && web.title.trim() ? web.title.trim() : web.uri,
      url: web.uri,
    });
  }

  return sources.slice(0, 6);
}

export function sanitizeChatHistory(messages: unknown): ChatTurn[] {
  if (!Array.isArray(messages)) return [];
  const valid: ChatTurn[] = [];
  for (const m of messages) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as { role?: unknown }).role;
    const text = (m as { text?: unknown }).text;
    if ((role === 'user' || role === 'model') && typeof text === 'string' && text.trim()) {
      valid.push({ role, text: text.trim().slice(0, 2000) });
    }
  }
  return valid.slice(-12);
}

export function formatAudioDataUrl(base64Wav: string): string {
  return `data:audio/wav;base64,${base64Wav.trim()}`;
}
