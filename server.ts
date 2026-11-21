import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { validateQuoteStep } from './src/utils/quoteLogic.ts';
import type { QuoteFormData } from './src/utils/quoteLogic.ts';
import { validateAuditInput, validateGrowthPlanInput } from './src/utils/aiHelpers.ts';
import type { AuditInput, GrowthPlanInput } from './src/utils/aiHelpers.ts';
import {
  AiServiceError,
  generateGrowthPlan,
  generateScriptVoiceover,
  mapGeminiError,
  runMarketAndSiteAudit,
  streamAdvisorReply,
  transcribeVoiceBrief,
} from './server/ai.ts';
import {
  buildRobotsTxt,
  buildSitemapXml,
  injectSeoIntoHtml,
  normalizeSeoRoute,
} from './src/utils/seoConfig.ts';

interface StoredQuote {
  id: string;
  receivedAt: string;
  data: QuoteFormData;
}

const PORT = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUOTES_DATA_FILE = path.resolve(__dirname, 'data', 'quotes.json');
const submittedQuotes: StoredQuote[] = [];
let quoteWriteQueue: Promise<void> = Promise.resolve();

async function hydrateQuotesFromDisk(): Promise<void> {
  try {
    const raw = await fs.readFile(QUOTES_DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      submittedQuotes.splice(0, submittedQuotes.length, ...(parsed as StoredQuote[]));
    }
  } catch {
    // File does not exist yet on first run; created lazily on first submission
  }
}

function persistQuoteRecord(record: StoredQuote): Promise<void> {
  quoteWriteQueue = quoteWriteQueue.then(async () => {
    await fs.mkdir(path.dirname(QUOTES_DATA_FILE), { recursive: true });
    const snapshot = JSON.stringify(submittedQuotes, null, 2);
    const tmpPath = `${QUOTES_DATA_FILE}.tmp`;
    await fs.writeFile(tmpPath, snapshot, 'utf8');
    await fs.rename(tmpPath, QUOTES_DATA_FILE);
  });
  return quoteWriteQueue;
}

async function startServer() {
  await hydrateQuotesFromDisk();

  const app = express();
  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'growvia-web', quoteCount: submittedQuotes.length });
  });

  app.post('/api/quote', async (req: Request, res: Response) => {
    const body = (req.body || {}) as Partial<QuoteFormData>;
    const payload: QuoteFormData = {
      services: Array.isArray(body.services) ? body.services : [],
      businessName: typeof body.businessName === 'string' ? body.businessName.trim() : '',
      industry: typeof body.industry === 'string' ? body.industry.trim() : '',
      contactName: typeof body.contactName === 'string' ? body.contactName.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim() : '',
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      monthlyBudget: typeof body.monthlyBudget === 'string' ? body.monthlyBudget : '',
      notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 800) : '',
    };

    for (const step of [1, 2, 3, 4]) {
      const check = validateQuoteStep(step, payload);
      if (!check.valid) {
        return res.status(400).json({
          ok: false,
          step,
          errors: check.errors,
        });
      }
    }

    const record: StoredQuote = {
      id: `gv_${Date.now().toString(36)}`,
      receivedAt: new Date().toISOString(),
      data: payload,
    };
    submittedQuotes.push(record);

    try {
      await persistQuoteRecord(record);
    } catch (err) {
      console.error('Could not write quote log to disk:', err);
    }

    return res.status(201).json({
      ok: true,
      id: record.id,
      receivedAt: record.receivedAt,
    });
  });

  // AI 1: Custom Growth Blueprint (Ads, Video Script, Website Tips)
  app.post('/api/ai/growth-plan', async (req: Request, res: Response) => {
    const body = (req.body || {}) as Partial<GrowthPlanInput>;
    const validation = validateGrowthPlanInput(body);
    if (!validation.valid) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    try {
      const plan = await generateGrowthPlan({
        businessName: body.businessName!.trim(),
        industry: body.industry!.trim(),
        city: body.city!.trim(),
        goal: body.goal!.trim(),
      });
      return res.json({ ok: true, plan });
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ ok: false, error: mapped.message });
    }
  });

  // AI 2: Grounded Website & Local Ontario Market Audit
  app.post('/api/ai/audit', async (req: Request, res: Response) => {
    const body = (req.body || {}) as Partial<AuditInput>;
    const validation = validateAuditInput(body);
    if (!validation.valid) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    try {
      const result = await runMarketAndSiteAudit({
        websiteUrl: (body.websiteUrl ?? '').trim(),
        marketQuery: (body.marketQuery ?? '').trim(),
      });
      return res.json({ ok: true, ...result });
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ ok: false, error: mapped.message });
    }
  });

  // AI 3: Video Script Text-to-Speech Voiceover (WAV)
  app.post('/api/ai/voiceover', async (req: Request, res: Response) => {
    const body = (req.body || {}) as { scriptText?: unknown; voice?: unknown };
    const scriptText = typeof body.scriptText === 'string' ? body.scriptText : '';
    const voice = typeof body.voice === 'string' ? body.voice : undefined;

    try {
      const result = await generateScriptVoiceover(scriptText, voice);
      return res.json({ ok: true, ...result });
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ ok: false, error: mapped.message });
    }
  });

  // AI 4: Audio Voice-Note Brief Transcription
  app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
    const body = (req.body || {}) as { audioBase64?: unknown; mimeType?: unknown };
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'audio/webm';

    if (!audioBase64) {
      return res.status(400).json({ ok: false, error: 'Missing recorded audio data.' });
    }

    try {
      const result = await transcribeVoiceBrief(audioBase64, mimeType);
      return res.json({ ok: true, ...result });
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ ok: false, error: mapped.message });
    }
  });

  // AI 5: Streaming Growvia Advisor Chat (SSE)
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const body = (req.body || {}) as { history?: unknown; message?: unknown };
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return res.status(400).json({ ok: false, error: 'Please type a question first.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await streamAdvisorReply(body.history, message, (chunkText) => {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      });
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      const mapped = err instanceof AiServiceError ? err : mapGeminiError(err);
      res.write(`data: ${JSON.stringify({ error: mapped.message })}\n\n`);
      res.end();
    }
  });

  // SEO Endpoints: XML Sitemap & Robots.txt
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(buildSitemapXml());
  });

  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(buildRobotsTxt());
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req: Request, res: Response, next) => {
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const rawHtml = await fs.readFile(indexPath, 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const seoHtml = injectSeoIntoHtml(transformed, req.originalUrl);
        const isKnownRoute = normalizeSeoRoute(req.originalUrl) !== null;
        res
          .status(isKnownRoute ? 200 : 404)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .end(seoHtml);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', async (req: Request, res: Response, next) => {
      try {
        const rawHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
        const seoHtml = injectSeoIntoHtml(rawHtml, req.originalUrl);
        const isKnownRoute = normalizeSeoRoute(req.originalUrl) !== null;
        res
          .status(isKnownRoute ? 200 : 404)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .end(seoHtml);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Growvia server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Growvia server:', err);
  process.exit(1);
});
