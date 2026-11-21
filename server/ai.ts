import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import {
  extractGroundingSources,
  parseGrowthPlanJson,
  sanitizeChatHistory,
} from '../src/utils/aiHelpers.ts';
import type {
  AuditInput,
  ChatTurn,
  GroundingSource,
  GrowthPlanInput,
  GrowthPlanResult,
} from '../src/utils/aiHelpers.ts';

export type VoiceChoice = 'Kore' | 'Puck' | 'Charon' | 'Zephyr';

const ALLOWED_VOICES: ReadonlyArray<VoiceChoice> = ['Kore', 'Puck', 'Charon', 'Zephyr'];

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new AiServiceError(
      'GEMINI_API_KEY is not configured yet. Please check your key in Settings > Secrets.',
      503
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: 'v1beta',
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export class AiServiceError extends Error {
  status: number;
  detail?: string;
  constructor(message: string, status = 500, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function mapGeminiError(err: unknown): AiServiceError {
  if (err instanceof AiServiceError) return err;
  const message = err instanceof Error ? err.message : String(err);
  console.error('[Growvia AI error]', message);
  const lower = message.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return new AiServiceError(
      'Unable to authenticate with Gemini. Please verify your API key in Settings > Secrets.',
      403,
      message
    );
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return new AiServiceError(
      'AI requests are momentarily busy. Please wait a few seconds and try again.',
      429,
      message
    );
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return new AiServiceError('Requested Gemini model was unavailable.', 502, message);
  }
  return new AiServiceError(message || 'Something went wrong while generating your AI response.', 500, message);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      const isTransient = msg.includes('503') || msg.includes('500') || msg.includes('429') || msg.includes('temporarily');
      if (!isTransient || attempt === retries) {
        throw mapGeminiError(err);
      }
      await new Promise((r) => setTimeout(r, 450 * (attempt + 1)));
    }
  }
  throw mapGeminiError(lastErr);
}

export async function generateGrowthPlan(input: GrowthPlanInput): Promise<GrowthPlanResult> {
  const ai = getAiClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        `Create a practical, plain-language marketing blueprint for an Ontario small or mid-size business.`,
        `Business Name: ${input.businessName}`,
        `Industry: ${input.industry}`,
        `City / Region in Ontario: ${input.city}`,
        `Primary Goal: ${input.goal}`,
      ].join('\n'),
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          'You are a senior strategist at Growvia, an Ontario marketing agency that runs Facebook/Instagram ads, Google Ads, photo/video content, and websites. Write in friendly, confident, plain English with zero corporate jargon or buzzwords. Keep copy realistic, concise, and tailored to Ontario customers. Recommend 1 to 4 services strictly from: "Facebook & Instagram Ads", "Google Ads", "Website", "Content & Creative". Keep the spokenScript around 45-65 words so it reads naturally in 25-30 seconds. In localSeo, list 3-5 surrounding Ontario cities/regions near the target city and 3-5 realistic Ontario Google search phrases.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'summary',
            'recommendedServices',
            'metaAd',
            'googleAd',
            'videoScript',
            'websiteTips',
            'localSeo',
          ],
          properties: {
            summary: { type: Type.STRING, description: '2-sentence plain-English overview of the plan.' },
            recommendedServices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Subset of: Facebook & Instagram Ads, Google Ads, Website, Content & Creative',
            },
            metaAd: {
              type: Type.OBJECT,
              required: ['hook', 'primaryText', 'cta'],
              properties: {
                hook: { type: Type.STRING },
                primaryText: { type: Type.STRING },
                cta: { type: Type.STRING },
              },
            },
            googleAd: {
              type: Type.OBJECT,
              required: ['headline1', 'headline2', 'description', 'keywords'],
              properties: {
                headline1: { type: Type.STRING },
                headline2: { type: Type.STRING },
                description: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            videoScript: {
              type: Type.OBJECT,
              required: ['title', 'durationLabel', 'spokenScript', 'shotIdeas'],
              properties: {
                title: { type: Type.STRING },
                durationLabel: { type: Type.STRING },
                spokenScript: { type: Type.STRING },
                shotIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            websiteTips: {
              type: Type.OBJECT,
              required: ['heroHeadline', 'conversionChecklist'],
              properties: {
                heroHeadline: { type: Type.STRING },
                conversionChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            localSeo: {
              type: Type.OBJECT,
              required: ['nearbyCities', 'searchPhrases', 'mapPackTip'],
              properties: {
                nearbyCities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 to 5 Ontario cities/neighbourhoods around the business target area',
                },
                searchPhrases: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 to 5 local Ontario SEO & Google Map search phrases',
                },
                mapPackTip: {
                  type: Type.STRING,
                  description: '1 concise plain-English Ontario Google Business Profile or city-page tip',
                },
              },
            },
          },
        },
      },
    })
  );

  return parseGrowthPlanJson(response.text ?? '{}');
}

export async function runMarketAndSiteAudit(input: AuditInput): Promise<{
  report: string;
  sources: GroundingSource[];
  grounded: boolean;
}> {
  const ai = getAiClient();
  const hasUrl = Boolean(input.websiteUrl.trim());
  const tools = hasUrl
    ? [{ urlContext: {} }, { googleSearch: {} }]
    : [{ googleSearch: {} }];

  const promptParts: string[] = [
    'Conduct a practical, plain-English Ontario marketing & conversion review.',
  ];
  if (hasUrl) {
    promptParts.push(`Inspect this website URL: ${input.websiteUrl.trim()}`);
  }
  if (input.marketQuery.trim()) {
    promptParts.push(`Check the local Ontario search landscape for: "${input.marketQuery.trim()}"`);
  }
  promptParts.push(
    'Provide 3 concise sections: (1) What stands out right now, (2) 3 high-impact website or offer fixes, and (3) Best Google & Meta ad angle for this market. Avoid hype and jargon.'
  );

  const systemInstruction =
    'You are an Ontario marketing strategist at Growvia. Use grounded facts from any provided URL and live Google Search results when available. Write clearly in short bullet points and plain language.';

  const callAudit = async (activeTools?: Array<Record<string, unknown>>) => {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: promptParts.join('\n\n'),
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        ...(activeTools ? { tools: activeTools } : {}),
        systemInstruction,
      },
    });
    const report = (response.text ?? 'Unable to generate audit report.').trim();
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = extractGroundingSources(chunks);
    return { report, sources };
  };

  try {
    const res = await withRetry(() => callAudit(tools), 1);
    return { ...res, grounded: true };
  } catch (err) {
    const mapped = mapGeminiError(err);
    if (mapped.status !== 429) {
      throw mapped;
    }

    // If search grounding quota is exhausted on this tier, try URL Context alone first when URL is provided
    if (hasUrl) {
      try {
        const urlOnly = await callAudit([{ urlContext: {} }]);
        return { ...urlOnly, grounded: true };
      } catch {
        // Fall through to ungrounded strategic audit
      }
    }

    const fallback = await withRetry(() => callAudit(undefined), 1);
    return { ...fallback, sources: [], grounded: false };
  }
}

export async function generateScriptVoiceover(
  scriptText: string,
  requestedVoice?: string
): Promise<{ audioBase64: string; voice: VoiceChoice }> {
  const ai = getAiClient();
  const voice: VoiceChoice = ALLOWED_VOICES.includes(requestedVoice as VoiceChoice)
    ? (requestedVoice as VoiceChoice)
    : 'Kore';

  const trimmed = scriptText.trim().slice(0, 1200);
  if (trimmed.length < 10) {
    throw new AiServiceError('Please enter at least 10 characters of script text to voice.', 400);
  }

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmed,
              speechMetadata: {
                style: 'Warm, confident, friendly Canadian small-business video narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    })
  );

  const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) {
    throw new AiServiceError('Voiceover model did not return audio data. Please try again.', 502);
  }
  return { audioBase64, voice };
}

export async function transcribeVoiceBrief(
  audioBase64: string,
  mimeType: string
): Promise<{
  transcript: string;
  businessName: string;
  industry: string;
  goal: string;
}> {
  const ai = getAiClient();
  const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';

  const transcribeResponse = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMime,
              data: audioBase64,
            },
          },
          { text: 'Transcribe this short business marketing inquiry accurately in English.' },
        ],
      },
    })
  );

  const transcript = (transcribeResponse.text ?? '').trim();
  if (!transcript) {
    return { transcript: '', businessName: '', industry: '', goal: '' };
  }

  const extractResponse = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Extract business details from this spoken note if mentioned. If not mentioned, return empty string "".\n\nNote: "${transcript}"`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING },
            industry: { type: Type.STRING },
            goal: { type: Type.STRING },
          },
        },
      },
    })
  );

  let parsed = { businessName: '', industry: '', goal: '' };
  try {
    const obj = JSON.parse((extractResponse.text ?? '{}').trim()) as Partial<typeof parsed>;
    parsed = {
      businessName: typeof obj.businessName === 'string' ? obj.businessName : '',
      industry: typeof obj.industry === 'string' ? obj.industry : '',
      goal: typeof obj.goal === 'string' ? obj.goal : '',
    };
  } catch {
    // Keep transcript even if extraction fallback occurs
  }

  return {
    transcript,
    businessName: parsed.businessName,
    industry: parsed.industry,
    goal: parsed.goal || transcript,
  };
}

export async function streamAdvisorReply(
  history: unknown,
  message: string,
  onChunk: (text: string) => void
): Promise<void> {
  const ai = getAiClient();
  const sanitizedHistory: ChatTurn[] = sanitizeChatHistory(history);

  const chat = ai.chats.create({
    model: 'gemini-4-hydrogen',
    history: sanitizedHistory.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      systemInstruction:
        'You are the Growvia AI Advisor for an Ontario marketing agency that runs Facebook & Instagram ads, Google Ads, photo & video content, and custom websites for small and mid-size businesses. Answer in friendly, plain, honest language (no jargon, no hype). Remind users when helpful that ad spend goes directly to Meta/Google separately from agency fees and that clients keep 100% ownership of their website, ad accounts, and content. Keep answers concise (under 150 words unless asked for detail).',
    },
  });

  const stream = await chat.sendMessageStream({ message: message.trim().slice(0, 1500) });
  for await (const chunk of stream) {
    const c = chunk as GenerateContentResponse;
    if (c.text) {
      onChunk(c.text);
    }
  }
}
