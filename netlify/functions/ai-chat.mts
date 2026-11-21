import type { Context } from '@netlify/functions';
import {
  AiServiceError,
  streamAdvisorReply,
  mapGeminiError,
} from '../../server/ai.ts';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: { history?: unknown; message?: unknown };
  try {
    body = (await req.json()) as { history?: unknown; message?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return Response.json({ ok: false, error: 'Please type a question first.' }, { status: 400 });
  }

  // Stream the response as Server-Sent Events
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      await streamAdvisorReply(body.history, message, (chunkText) => {
        writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`));
      });
      writer.write(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
    } catch (err) {
      const mapped = err instanceof AiServiceError ? err : mapGeminiError(err);
      writer.write(encoder.encode(`data: ${JSON.stringify({ error: mapped.message })}\n\n`));
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export const config = { path: '/api/ai/chat' };
