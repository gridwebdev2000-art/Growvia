import type { Context } from '@netlify/functions';

export default async function handler(_req: Request, _ctx: Context) {
  return Response.json({ ok: true, service: 'growvia-web' });
}

export const config = { path: '/api/health' };
