import type { Context } from '@netlify/functions';
import { validateAuditInput } from '../../src/utils/aiHelpers.ts';
import type { AuditInput } from '../../src/utils/aiHelpers.ts';
import { runMarketAndSiteAudit, mapGeminiError } from '../../server/ai.ts';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: Partial<AuditInput>;
  try {
    body = (await req.json()) as Partial<AuditInput>;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateAuditInput(body);
  if (!validation.valid) {
    return Response.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    const result = await runMarketAndSiteAudit({
      websiteUrl: (body.websiteUrl ?? '').trim(),
      marketQuery: (body.marketQuery ?? '').trim(),
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const mapped = mapGeminiError(err);
    return Response.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}

export const config = { path: '/api/ai/audit' };
