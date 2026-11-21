import type { Context } from '@netlify/functions';
import { buildSitemapXml } from '../../src/utils/seoConfig.ts';

export default async function handler(_req: Request, _ctx: Context) {
  return new Response(buildSitemapXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

export const config = { path: '/sitemap.xml' };
