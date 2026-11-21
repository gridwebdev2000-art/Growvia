export const SERVICE_OPTIONS = [
  'Facebook & Instagram Ads',
  'Google Ads',
  'Website',
  'Content & Creative',
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

export const BUDGET_OPTIONS = [
  'Under $1,000',
  '$1,000 to $3,000',
  '$3,000 to $5,000',
  '$5,000+',
  'Not sure yet',
] as const;

export type BudgetOption = (typeof BUDGET_OPTIONS)[number];

export interface QuoteFormData {
  services: ServiceOption[];
  businessName: string;
  industry: string;
  contactName: string;
  email: string;
  phone: string;
  monthlyBudget: BudgetOption | '';
  notes?: string;
}

export const INITIAL_QUOTE_DATA: QuoteFormData = {
  services: [],
  businessName: '',
  industry: '',
  contactName: '',
  email: '',
  phone: '',
  monthlyBudget: '',
  notes: '',
};

export interface QuoteDraftState {
  step: number;
  data: QuoteFormData;
  updatedAt: number;
}

export const QUOTE_DRAFT_STORAGE_KEY = 'growvia_quote_draft_v1';

export interface StepValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function validateQuoteStep(
  step: number,
  data: QuoteFormData,
  locale: 'en' | 'fr' = 'en'
): StepValidationResult {
  const errors: Record<string, string> = {};
  const isFr = locale === 'fr';

  if (step === 1) {
    if (data.services.length === 0) {
      errors.services = isFr
        ? 'Choisissez au moins un service pour commencer.'
        : 'Pick at least one service to get started.';
    }
  } else if (step === 2) {
    if (data.businessName.trim().length < 2) {
      errors.businessName = isFr
        ? 'Veuillez entrer le nom de votre entreprise.'
        : 'Please enter your business name.';
    }
    if (data.industry.trim().length < 2) {
      errors.industry = isFr
        ? 'Veuillez préciser votre secteur (ex. Plomberie, Dentaire, Commerce).'
        : 'Please enter your industry (e.g. Plumbing, Dental, Retail).';
    }
  } else if (step === 3) {
    if (data.contactName.trim().length < 2) {
      errors.contactName = isFr ? 'Veuillez entrer votre nom.' : 'Please enter your name.';
    }
    if (!isValidEmail(data.email)) {
      errors.email = isFr
        ? 'Veuillez entrer une adresse courriel valide.'
        : 'Please enter a valid email address.';
    }
    if (!isValidPhone(data.phone)) {
      errors.phone = isFr
        ? 'Veuillez entrer un numéro de téléphone à 10 chiffres.'
        : 'Please enter a 10-digit phone number.';
    }
  } else if (step === 4) {
    if (!data.monthlyBudget) {
      errors.monthlyBudget = isFr
        ? 'Veuillez sélectionner un budget publicitaire mensuel approximatif.'
        : 'Please select an approximate monthly ad budget.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function toggleServiceSelection(
  current: ServiceOption[],
  option: ServiceOption
): ServiceOption[] {
  if (current.includes(option)) {
    return current.filter((item) => item !== option);
  }
  return [...current, option];
}

export function getNextStep(currentStep: number, totalSteps = 5): number {
  return Math.min(totalSteps, Math.max(1, currentStep + 1));
}

export function getPrevStep(currentStep: number): number {
  return Math.max(1, currentStep - 1);
}

export function formatStepCounter(step: number, totalSteps = 5): string {
  const clamped = Math.min(totalSteps, Math.max(1, step));
  return `${String(clamped).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}`;
}

export function getProgressPercent(step: number, totalSteps = 5): number {
  const clamped = Math.min(totalSteps, Math.max(1, step));
  return Math.round((clamped / totalSteps) * 100);
}

export function hasQuoteProgress(data: QuoteFormData, step = 1): boolean {
  return (
    step > 1 ||
    data.services.length > 0 ||
    data.businessName.trim().length > 0 ||
    data.industry.trim().length > 0 ||
    data.contactName.trim().length > 0 ||
    data.email.trim().length > 0 ||
    data.phone.trim().length > 0 ||
    Boolean(data.monthlyBudget) ||
    Boolean(data.notes?.trim())
  );
}

export function serializeQuoteDraft(step: number, data: QuoteFormData): string {
  const clampedStep = Math.min(4, Math.max(1, step));
  const payload: QuoteDraftState = {
    step: clampedStep,
    data: {
      services: data.services,
      businessName: data.businessName,
      industry: data.industry,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      monthlyBudget: data.monthlyBudget,
      notes: data.notes ?? '',
    },
    updatedAt: Date.now(),
  };
  return JSON.stringify(payload);
}

export function parseQuoteDraft(raw: string | null): QuoteDraftState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<QuoteDraftState>;
    if (!parsed || typeof parsed !== 'object' || !parsed.data) return null;
    const rawData = parsed.data as Partial<QuoteFormData>;
    const validServices = Array.isArray(rawData.services)
      ? rawData.services.filter((item): item is ServiceOption =>
          (SERVICE_OPTIONS as readonly string[]).includes(String(item))
        )
      : [];
    const validBudget = (BUDGET_OPTIONS as readonly string[]).includes(String(rawData.monthlyBudget))
      ? (rawData.monthlyBudget as BudgetOption)
      : '';

    const data: QuoteFormData = {
      services: validServices,
      businessName: typeof rawData.businessName === 'string' ? rawData.businessName : '',
      industry: typeof rawData.industry === 'string' ? rawData.industry : '',
      contactName: typeof rawData.contactName === 'string' ? rawData.contactName : '',
      email: typeof rawData.email === 'string' ? rawData.email : '',
      phone: typeof rawData.phone === 'string' ? rawData.phone : '',
      monthlyBudget: validBudget,
      notes: typeof rawData.notes === 'string' ? rawData.notes : '',
    };

    const step =
      typeof parsed.step === 'number' && Number.isFinite(parsed.step)
        ? Math.min(4, Math.max(1, Math.round(parsed.step)))
        : 1;

    return {
      step,
      data,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export interface QuotePrefillInput {
  services?: ServiceOption[];
  businessName?: string;
  industry?: string;
  notes?: string;
}

export function mergeQuoteDraftWithPrefill(
  draft: QuoteDraftState | null,
  prefill: QuotePrefillInput
): { step: number; data: QuoteFormData } {
  const prefillServices = (prefill.services ?? []).filter((s) =>
    (SERVICE_OPTIONS as readonly string[]).includes(s)
  );
  const hasExplicitPrefill =
    prefillServices.length > 0 ||
    Boolean(prefill.businessName?.trim()) ||
    Boolean(prefill.industry?.trim()) ||
    Boolean(prefill.notes?.trim());

  if (!draft) {
    return {
      step: 1,
      data: {
        ...INITIAL_QUOTE_DATA,
        services: prefillServices,
        businessName: prefill.businessName?.trim() ?? '',
        industry: prefill.industry?.trim() ?? '',
        notes: prefill.notes?.trim() ?? '',
      },
    };
  }

  if (!hasExplicitPrefill) {
    return {
      step: draft.step,
      data: draft.data,
    };
  }

  const mergedServices =
    prefillServices.length > 0
      ? Array.from(new Set([...draft.data.services, ...prefillServices]))
      : draft.data.services;

  return {
    step: 1,
    data: {
      ...draft.data,
      services: mergedServices,
      businessName: prefill.businessName?.trim() || draft.data.businessName,
      industry: prefill.industry?.trim() || draft.data.industry,
      notes: prefill.notes?.trim() || draft.data.notes || '',
    },
  };
}

export function buildQuoteMailtoHref(data: QuoteFormData): string {
  const subject = encodeURIComponent(
    `Growvia Quote Request — ${data.businessName.trim() || 'New Inquiry'}`
  );
  const lines = [
    `Business: ${data.businessName}`,
    `Industry: ${data.industry}`,
    `Contact: ${data.contactName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Services: ${data.services.join(', ')}`,
    `Monthly Ad Spend: ${data.monthlyBudget}`,
  ];
  if (data.notes?.trim()) {
    lines.push(`Notes: ${data.notes.trim()}`);
  }
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:growviacanada@gmail.com?subject=${subject}&body=${body}`;
}
