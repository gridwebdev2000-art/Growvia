import type { Context } from '@netlify/functions';
import { generateScriptVoiceover, mapGeminiError } from '../../server/ai.ts';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: { scriptText?: unknown; voice?: unknown };
  try {
    body = (await req.json()) as { scriptText?: unknown; voice?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const scriptText = typeof body.scriptText === 'string' ? body.scriptText : '';
  const voice = typeof body.voice === 'string' ? body.voice : undefined;

  try {
    const result = await generateScriptVoiceover(scriptText, voice);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const mapped = mapGeminiError(err);
    return Response.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}

export const config = { path: '/api/ai/voiceover' };
