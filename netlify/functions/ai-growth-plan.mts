import type { Context } from '@netlify/functions';
import { validateGrowthPlanInput } from '../../src/utils/aiHelpers.ts';
import type { GrowthPlanInput } from '../../src/utils/aiHelpers.ts';
import { generateGrowthPlan, mapGeminiError } from '../../server/ai.ts';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: Partial<GrowthPlanInput>;
  try {
    body = (await req.json()) as Partial<GrowthPlanInput>;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateGrowthPlanInput(body);
  if (!validation.valid) {
    return Response.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    const plan = await generateGrowthPlan({
      businessName: body.businessName!.trim(),
      industry: body.industry!.trim(),
      city: body.city!.trim(),
      goal: body.goal!.trim(),
    });
    return Response.json({ ok: true, plan });
  } catch (err) {
    const mapped = mapGeminiError(err);
    return Response.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}

export const config = { path: '/api/ai/growth-plan' };
