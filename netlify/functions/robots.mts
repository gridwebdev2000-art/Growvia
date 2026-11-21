import type { Context } from '@netlify/functions';
import { buildRobotsTxt } from '../../src/utils/seoConfig.ts';

export default async function handler(_req: Request, _ctx: Context) {
  return new Response(buildRobotsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export const config = { path: '/robots.txt' };
