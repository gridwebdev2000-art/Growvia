import type { Context } from '@netlify/functions';
import { validateQuoteStep } from '../../src/utils/quoteLogic.ts';
import type { QuoteFormData } from '../../src/utils/quoteLogic.ts';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: Partial<QuoteFormData>;
  try {
    body = (await req.json()) as Partial<QuoteFormData>;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

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
      return Response.json({ ok: false, step, errors: check.errors }, { status: 400 });
    }
  }

  const id = `gv_${Date.now().toString(36)}`;
  const receivedAt = new Date().toISOString();

  return Response.json({ ok: true, id, receivedAt }, { status: 201 });
}

export const config = { path: '/api/quote' };
