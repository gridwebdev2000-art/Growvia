import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Mic,
  RotateCcw,
  Square,
  X,
} from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { trapFocusOnKeyDown } from '../utils/focusTrap';
import {
  BUDGET_OPTIONS,
  INITIAL_QUOTE_DATA,
  QUOTE_DRAFT_STORAGE_KEY,
  SERVICE_OPTIONS,
  buildQuoteMailtoHref,
  formatStepCounter,
  getPrevStep,
  getProgressPercent,
  hasQuoteProgress,
  mergeQuoteDraftWithPrefill,
  parseQuoteDraft,
  serializeQuoteDraft,
  toggleServiceSelection,
  validateQuoteStep,
} from '../utils/quoteLogic';
import type { BudgetOption, QuoteFormData, ServiceOption } from '../utils/quoteLogic';

interface QuoteModalProps {
  isOpen: boolean;
  preselectedService?: ServiceOption | null;
  preselectedServices?: ServiceOption[];
  prefillBusinessName?: string;
  prefillIndustry?: string;
  prefillNotes?: string;
  onClose: () => void;
}

export function QuoteModal({
  isOpen,
  preselectedService,
  preselectedServices,
  prefillBusinessName = '',
  prefillIndustry = '',
  prefillNotes = '',
  onClose,
}: QuoteModalProps) {
  const { locale, t } = useLocale();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>(INITIAL_QUOTE_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Initialize or restore saved draft synchronously before paint when opened
  useLayoutEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setErrors({});
      setSubmitError(null);
      setSubmittedId(null);
      setVoiceHint(null);

      const initialServices =
        preselectedServices && preselectedServices.length > 0
          ? preselectedServices
          : preselectedService
            ? [preselectedService]
            : [];

      let savedDraft = null;
      try {
        savedDraft = parseQuoteDraft(window.sessionStorage.getItem(QUOTE_DRAFT_STORAGE_KEY));
      } catch {
        savedDraft = null;
      }

      const merged = mergeQuoteDraftWithPrefill(savedDraft, {
        services: initialServices,
        businessName: prefillBusinessName,
        industry: prefillIndustry,
        notes: prefillNotes,
      });

      setStep(merged.step);
      setFormData(merged.data);
      setDraftRestored(Boolean(savedDraft && hasQuoteProgress(savedDraft.data, savedDraft.step)));
    } else {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
        setVoiceActive(false);
      }
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [
    isOpen,
    preselectedService,
    preselectedServices,
    prefillBusinessName,
    prefillIndustry,
    prefillNotes,
  ]);

  // Persist quote draft in sessionStorage across accidental backdrop closes
  useEffect(() => {
    if (!isOpen || step >= 5) return;
    try {
      if (hasQuoteProgress(formData, step)) {
        window.sessionStorage.setItem(
          QUOTE_DRAFT_STORAGE_KEY,
          serializeQuoteDraft(step, formData)
        );
      } else {
        window.sessionStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors in restricted contexts
    }
  }, [isOpen, step, formData]);

  // Move focus into step body when modal opens or step changes
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      const container = modalRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(
        '[data-autofocus], input:not([type="hidden"]), button[data-step-control]'
      );
      target?.focus();
    }, 20);
    return () => window.clearTimeout(timer);
  }, [isOpen, step]);

  // Handle Escape key + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const progressPct = getProgressPercent(step, 5);
  const counterLabel = formatStepCounter(step, 5);
  const canStartFresh = step < 5 && hasQuoteProgress(formData, step);

  const handleResetDraft = () => {
    try {
      window.sessionStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setFormData(INITIAL_QUOTE_DATA);
    setStep(1);
    setErrors({});
    setSubmitError(null);
    setVoiceHint(null);
    setDraftRestored(false);
  };

  const handleToggleService = (service: ServiceOption) => {
    setFormData((prev) => ({
      ...prev,
      services: toggleServiceSelection(prev.services, service),
    }));
    setErrors((prev) => ({ ...prev, services: '' }));
  };

  const handleSelectBudget = (budget: BudgetOption) => {
    setFormData((prev) => ({ ...prev, monthlyBudget: budget }));
    setErrors((prev) => ({ ...prev, monthlyBudget: '' }));
  };

  const handleNextOrSubmit = async () => {
    if (step === 5) {
      onClose();
      return;
    }

    const check = validateQuoteStep(step, formData, locale);
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }
    setErrors({});

    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    // Step 4 -> submit to /api/quote and advance to Step 5
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = (await response.json()) as { ok?: boolean; id?: string; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || 'Could not save your quote request. Please check your details and try again.'
        );
      }
      try {
        window.sessionStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }
      setDraftRestored(false);
      setSubmittedId(result.id ?? 'received');
      setStep(5);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Connection issue while sending. You can also send via email below.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setErrors({});
    setSubmitError(null);
    setStep((s) => getPrevStep(s));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleNextOrSubmit();
  };

  const handleKeyDownInsideModal = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      trapFocusOnKeyDown(e, modalRef.current);
      return;
    }
    if (e.key === 'Enter' && e.target instanceof HTMLButtonElement) {
      if (e.target.type !== 'submit') {
        return;
      }
    }
    if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      void handleNextOrSubmit();
    }
  };

  const handleVoiceBriefToggle = async () => {
    if (voiceActive && recorderRef.current) {
      recorderRef.current.stop();
      setVoiceActive(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceHint(t.quoteModal.voiceNoteUnavailable);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setVoiceBusy(true);
        setVoiceHint(t.quoteModal.voiceNoteTranscribing);
        try {
          const reader = new FileReader();
          const audioBase64: string = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const s = typeof reader.result === 'string' ? reader.result : '';
              resolve(s.includes(',') ? s.split(',')[1] : s);
            };
            reader.onerror = () => reject(new Error('Failed to read audio'));
            reader.readAsDataURL(blob);
          });
          const res = await fetch('/api/ai/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: recorder.mimeType || 'audio/webm',
            }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            businessName?: string;
            industry?: string;
            transcript?: string;
            error?: string;
          };
          if (!res.ok || !data.ok) {
            throw new Error(data.error || 'Could not transcribe voice note.');
          }
          setFormData((prev) => ({
            ...prev,
            businessName: data.businessName || prev.businessName,
            industry: data.industry || prev.industry,
          }));
          setVoiceHint(
            data.transcript ? `${t.aiLab.heardPrefix} "${data.transcript}"` : t.quoteModal.voiceNoteDone
          );
        } catch (err) {
          setVoiceHint(err instanceof Error ? err.message : 'Transcription failed.');
        } finally {
          setVoiceBusy(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setVoiceActive(true);
      setVoiceHint(t.quoteModal.voiceNoteListening);
    } catch {
      setVoiceHint(t.quoteModal.voiceNoteDenied);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1F16]/75 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-heading"
        onKeyDown={handleKeyDownInsideModal}
        className="w-full max-w-[580px] rounded-[32px] glass-panel border border-[var(--border)] shadow-2xl p-6 sm:p-8 text-[var(--ink)] relative max-h-[92vh] overflow-y-auto"
      >
        {/* Top bar: Counter + Progress + Start fresh + Close */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-display font-bold text-[14px] text-[#F26B1D] tabular-nums shrink-0">
            {counterLabel}
          </span>

          <div
            className="flex-1 h-2 rounded-full bg-[var(--sage-tint)] overflow-hidden"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={step}
            aria-label={`${t.quoteModal.progressAriaPrefix} ${step} / 5`}
          >
            <div
              className="h-full bg-[#F26B1D] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {canStartFresh && (
            <button
              type="button"
              onClick={handleResetDraft}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--sage-tint)] transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.quoteModal.startFresh}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label={t.quoteModal.closeAria}
            className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--ink)] flex items-center justify-center hover:bg-[#F26B1D] hover:text-[#1A2E20] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Selected-service context strip on steps 2-4 */}
        {step >= 2 && step <= 4 && formData.services.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {formData.services.map((svc) => (
              <span
                key={svc}
                className="rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--ink)]"
              >
                {t.quoteModal.serviceLabels[svc] ?? svc}
              </span>
            ))}
            {draftRestored && (
              <span className="text-[12px] text-[var(--muted)] ml-1">{t.quoteModal.draftRestored}</span>
            )}
          </div>
        )}

        <form onSubmit={handleFormSubmit} noValidate className="mt-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2
                id="quote-modal-heading"
                className="text-[1.65rem] sm:text-[1.95rem] leading-[1.12] font-extrabold text-[var(--ink)]"
              >
                {t.quoteModal.step1Title}
              </h2>
              <p className="mt-2 text-[15.5px] text-[var(--muted)]">
                {t.quoteModal.step1Subtitle}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_OPTIONS.map((service, idx) => {
                  const selected = formData.services.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      data-step-control={idx === 0 ? 'true' : undefined}
                      aria-pressed={selected}
                      onClick={() => handleToggleService(service)}
                      className={`rounded-[20px] px-4 py-4 text-left font-bold text-[15px] border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        selected
                          ? 'bg-[var(--sage-tint)] border-[#F26B1D] text-[var(--ink)]'
                          : 'bg-[var(--bg)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--sage)]'
                      }`}
                    >
                      <span>{t.quoteModal.serviceLabels[service] ?? service}</span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          selected
                            ? 'bg-[#F26B1D] border-[#F26B1D] text-[#1A2E20]'
                            : 'border-[var(--border)] bg-[var(--surface)]'
                        }`}
                        aria-hidden="true"
                      >
                        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors.services && (
                <p
                  role="alert"
                  className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--error-text)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{errors.services}</span>
                </p>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2
                id="quote-modal-heading"
                className="text-[1.65rem] sm:text-[1.95rem] leading-[1.12] font-extrabold text-[var(--ink)]"
              >
                {t.quoteModal.step2Title}
              </h2>
              <p className="mt-2 text-[15.5px] text-[var(--muted)]">
                {t.quoteModal.step2Subtitle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleVoiceBriefToggle}
                  disabled={voiceBusy}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    voiceActive
                      ? 'bg-[#F26B1D] text-[#1A2E20] border-[#F26B1D]'
                      : 'bg-[var(--sage-tint)] text-[var(--ink)] border-[var(--border)] hover:border-[#F26B1D]'
                  }`}
                >
                  {voiceActive ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>{t.quoteModal.voiceNoteStop}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{voiceBusy ? t.quoteModal.voiceNoteTranscribing : t.quoteModal.voiceNoteFill}</span>
                    </>
                  )}
                </button>
                {voiceHint && <span className="text-[13px] text-[var(--muted)]">{voiceHint}</span>}
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="quote-business-name"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.quoteModal.businessNameLabel}
                  </label>
                  <input
                    id="quote-business-name"
                    data-autofocus
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, businessName: e.target.value }));
                      setErrors((er) => ({ ...er, businessName: '' }));
                    }}
                    placeholder={t.quoteModal.businessNamePlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                  {errors.businessName && (
                    <p
                      role="alert"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--error-text)]"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{errors.businessName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quote-industry"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.quoteModal.industryLabel}
                  </label>
                  <input
                    id="quote-industry"
                    type="text"
                    value={formData.industry}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, industry: e.target.value }));
                      setErrors((er) => ({ ...er, industry: '' }));
                    }}
                    placeholder={t.quoteModal.industryPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                  {errors.industry && (
                    <p
                      role="alert"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--error-text)]"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{errors.industry}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quote-notes"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.quoteModal.notesLabel}
                  </label>
                  <input
                    id="quote-notes"
                    type="text"
                    value={formData.notes ?? ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, notes: e.target.value }))
                    }
                    placeholder={t.quoteModal.notesPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2
                id="quote-modal-heading"
                className="text-[1.65rem] sm:text-[1.95rem] leading-[1.12] font-extrabold text-[var(--ink)]"
              >
                {t.quoteModal.step3Title}
              </h2>
              <p className="mt-2 text-[15.5px] text-[var(--muted)]">
                {t.quoteModal.step3Subtitle}
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="quote-contact-name"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.quoteModal.contactNameLabel}
                  </label>
                  <input
                    id="quote-contact-name"
                    data-autofocus
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, contactName: e.target.value }));
                      setErrors((er) => ({ ...er, contactName: '' }));
                    }}
                    placeholder={t.quoteModal.contactNamePlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                  {errors.contactName && (
                    <p
                      role="alert"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--error-text)]"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{errors.contactName}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-email"
                      className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                    >
                      {t.quoteModal.emailLabel}
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, email: e.target.value }));
                        setErrors((er) => ({ ...er, email: '' }));
                      }}
                      placeholder="you@business.ca"
                      className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                    />
                    {errors.email && (
                      <p
                        role="alert"
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--error-text)]"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-phone"
                      className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                    >
                      {t.quoteModal.phoneLabel}
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, phone: e.target.value }));
                        setErrors((er) => ({ ...er, phone: '' }));
                      }}
                      placeholder="(416) 555-0192"
                      className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                    />
                    {errors.phone && (
                      <p
                        role="alert"
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--error-text)]"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h2
                id="quote-modal-heading"
                className="text-[1.65rem] sm:text-[1.95rem] leading-[1.12] font-extrabold text-[var(--ink)]"
              >
                {t.quoteModal.step4Title}
              </h2>
              <p className="mt-2 text-[14.5px] text-[var(--muted)]">
                {t.quoteModal.step4Subtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {BUDGET_OPTIONS.map((budget, idx) => {
                  const selected = formData.monthlyBudget === budget;
                  return (
                    <button
                      key={budget}
                      type="button"
                      data-step-control={idx === 0 ? 'true' : undefined}
                      aria-pressed={selected}
                      onClick={() => handleSelectBudget(budget)}
                      className={`rounded-full px-5 py-3 text-[15px] font-bold border-2 transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#F26B1D] border-[#F26B1D] text-[#1A2E20]'
                          : 'bg-[var(--bg)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--sage)]'
                      }`}
                    >
                      {t.quoteModal.budgetLabels[budget] ?? budget}
                    </button>
                  );
                })}
              </div>

              {errors.monthlyBudget && (
                <p
                  role="alert"
                  className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--error-text)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{errors.monthlyBudget}</span>
                </p>
              )}

              {submitError && (
                <div
                  role="alert"
                  className="mt-4 rounded-[18px] bg-[var(--sage-tint)] border border-[#F26B1D] p-4 text-[14px]"
                >
                  <p className="font-bold text-[var(--ink)]">{submitError}</p>
                  <a
                    href={buildQuoteMailtoHref(formData)}
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#F26B1D] underline"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span>{t.quoteModal.openEmailInstead}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full bg-[var(--sage-tint)] border-2 border-[#2E6B45] text-[#2E6B45] dark:text-[#9BC094] flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <Check className="w-8 h-8 stroke-[2.8]" />
              </div>

              <h2
                id="quote-modal-heading"
                className="mt-5 text-[1.85rem] sm:text-[2.15rem] leading-[1.1] font-extrabold text-[var(--ink)]"
              >
                {t.quoteModal.step5HeadingPrefix}{' '}
                {formData.contactName.split(' ')[0] || t.quoteModal.step5FallbackName}!
              </h2>
              <p className="mt-3 text-[16.5px] leading-[1.6] text-[var(--muted)] max-w-[44ch] mx-auto">
                {t.quoteModal.step5BodyPart1}{' '}
                <strong className="text-[var(--ink)]">{formData.businessName}</strong>.{' '}
                {t.quoteModal.step5BodyPart2}{' '}
                <strong className="text-[var(--ink)]">{formData.email}</strong>{' '}
                {t.quoteModal.step5BodyPart3}
              </p>

              <div className="mt-6 rounded-[22px] bg-[var(--bg)] border border-[var(--border)] p-4 text-left text-[14px] space-y-1.5">
                <p>
                  <span className="font-bold text-[var(--ink)]">{t.quoteModal.summaryServices} </span>
                  <span className="text-[var(--muted)]">
                    {formData.services
                      .map((svc) => t.quoteModal.serviceLabels[svc] ?? svc)
                      .join(', ')}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-[var(--ink)]">{t.quoteModal.summaryIndustry} </span>
                  <span className="text-[var(--muted)]">{formData.industry}</span>
                </p>
                <p>
                  <span className="font-bold text-[var(--ink)]">{t.quoteModal.summaryBudget} </span>
                  <span className="text-[var(--muted)]">
                    {formData.monthlyBudget
                      ? (t.quoteModal.budgetLabels[formData.monthlyBudget] ?? formData.monthlyBudget)
                      : ''}
                  </span>
                </p>
                {formData.notes?.trim() && (
                  <p>
                    <span className="font-bold text-[var(--ink)]">{t.quoteModal.summaryNotes} </span>
                    <span className="text-[var(--muted)]">{formData.notes.trim()}</span>
                  </p>
                )}
                {submittedId && (
                  <p>
                    <span className="font-bold text-[var(--ink)]">{t.quoteModal.summaryReference} </span>
                    <span className="text-[var(--muted)] tabular-nums">{submittedId}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  data-autofocus
                  onClick={onClose}
                  className="btn-orange px-8 py-3.5 text-[16px]"
                >
                  {t.quoteModal.doneBtn}
                </button>
                <a
                  href={buildQuoteMailtoHref(formData)}
                  className="btn-outline px-6 py-3.5 text-[15px]"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>{t.quoteModal.sendEmailCopy}</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer Navigation for Steps 1-4 */}
          {step < 5 && (
            <div className="mt-8 pt-5 border-t border-[var(--border)] flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-outline px-5 py-3 text-[15px]"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>{t.quoteModal.backBtn}</span>
                </button>
              ) : (
                <span className="text-[13px] text-[var(--muted)]">
                  {t.quoteModal.takesLess60}
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-orange px-7 py-3 text-[15.5px] disabled:opacity-70"
              >
                <span>
                  {isSubmitting
                    ? t.quoteModal.sendingBtn
                    : step === 4
                      ? t.quoteModal.getMyQuoteBtn
                      : t.quoteModal.continueBtn}
                </span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
