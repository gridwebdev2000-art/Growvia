import type { Context } from '@netlify/functions';
import { transcribeVoiceBrief, mapGeminiError } from '../../server/ai.ts';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: { audioBase64?: unknown; mimeType?: unknown };
  try {
    body = (await req.json()) as { audioBase64?: unknown; mimeType?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'audio/webm';

  if (!audioBase64) {
    return Response.json({ ok: false, error: 'Missing recorded audio data.' }, { status: 400 });
  }

  try {
    const result = await transcribeVoiceBrief(audioBase64, mimeType);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const mapped = mapGeminiError(err);
    return Response.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}

export const config = { path: '/api/ai/transcribe' };
