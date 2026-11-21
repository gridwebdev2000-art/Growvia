import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Phone } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { getTranslatedSubpage } from '../utils/i18n';
import { navigateToRoute } from '../utils/navigation';
import { SeoBreadcrumb } from './SeoBreadcrumb';
import { SEOContentSection } from './SEOContentSection';
import type { SeoRoutePath } from '../utils/seoConfig';
import type { ServiceOption } from '../utils/quoteLogic';

interface SeoSubpageViewProps {
  routePath: Exclude<SeoRoutePath, '/'> | null;
  onOpenQuote: (service?: ServiceOption | null) => void;
}

export function SeoSubpageView({ routePath, onOpenQuote }: SeoSubpageViewProps) {
  const { locale, t } = useLocale();

  if (!routePath) {
    return (
      <section className="relative z-10 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto">
        <SeoBreadcrumb
          routePath={null}
          ariaLabel={t.subpage.breadcrumbAria}
          homeLabel={t.subpage.homeLabel}
          notFoundLabel={t.subpage.notFoundBreadcrumb}
          className="mb-6 max-w-[840px] mx-auto"
        />

        <div className="rounded-[34px] glass-panel border border-[var(--border)] p-8 sm:p-14 text-center max-w-[840px] mx-auto card-gloss">
          <p className="eyebrow">{t.subpage.notFoundEyebrow}</p>
          <h1 className="mt-4 text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.08] text-[var(--ink)]">
            {t.subpage.notFoundTitle}
          </h1>
          <p className="mt-4 text-[17px] text-[var(--muted)] max-w-[52ch] mx-auto leading-[1.6]">
            {t.subpage.notFoundBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateToRoute('/');
              }}
              className="btn-orange px-7 py-3.5 text-[16px]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{t.subpage.returnHomeBtn}</span>
            </a>
            <button
              type="button"
              onClick={() => onOpenQuote(null)}
              className="btn-outline px-6 py-3.5 text-[16px]"
            >
              <span>{t.subpage.requestQuoteBtn}</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  const translated = getTranslatedSubpage(routePath, locale);
  const content = translated.content;
  const faqs = translated.faqs;

  return (
    <div className="relative z-10 pt-24 sm:pt-28 pb-12">
      {/* Hero + Semantic Microdata Breadcrumb */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto" aria-labelledby="subpage-h1">
        <SeoBreadcrumb
          routePath={routePath}
          ariaLabel={t.subpage.breadcrumbAria}
          homeLabel={t.subpage.homeLabel}
          currentLabel={translated.breadcrumbLabel}
        />

        <div className="rounded-[34px] sm:rounded-[40px] glass-panel border border-[var(--border)] p-7 sm:p-12 lg:p-14 card-gloss relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-45 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(145,169,139,0.42), transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-[920px]">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1
              id="subpage-h1"
              className="mt-4 text-[clamp(2.25rem,4.4vw,3.85rem)] font-extrabold leading-[1.06] text-[var(--ink)]"
            >
              {content.h1Lead}{' '}
              <span className="font-serif italic font-bold text-[#719E53] dark:text-[#9EC482] underline decoration-[#F26B1D] decoration-2 underline-offset-4">
                {content.h1Highlight}
              </span>
            </h1>
            <p className="mt-5 text-[18px] sm:text-[19.5px] leading-[1.62] text-[var(--muted)] max-w-[66ch]">
              {content.intro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenQuote(content.quoteService ?? null)}
                className="btn-orange px-8 py-4 text-[17px]"
              >
                <span>{content.primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <a
                href="/#ai-lab"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToRoute('/#ai-lab');
                }}
                className="btn-outline px-7 py-4 text-[16.5px] !bg-[var(--surface)]/80"
              >
                <span>{t.subpage.tryAiLabBtn}</span>
              </a>
            </div>

            {routePath === '/contact' && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[660px]">
                <a
                  href={COMPANY_CONTACT.mailtoHref}
                  className="flex items-center gap-3.5 rounded-[20px] bg-[var(--bg)] border border-[var(--border)] px-5 py-4 hover:border-[#F26B1D] transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center justify-center text-[#2E6B45] dark:text-[#9BC094] shrink-0">
                    <Mail className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {t.subpage.directEmailLabel}
                    </span>
                    <span className="block font-bold text-[15.5px] text-[var(--ink)] break-all">
                      {COMPANY_CONTACT.email}
                    </span>
                  </span>
                </a>
                <a
                  href={COMPANY_CONTACT.phoneHref}
                  className="flex items-center gap-3.5 rounded-[20px] bg-[var(--bg)] border border-[var(--border)] px-5 py-4 hover:border-[#F26B1D] transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center justify-center text-[#2E6B45] dark:text-[#9BC094] shrink-0">
                    <Phone className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {t.subpage.phoneTextLabel}
                    </span>
                    <span className="block font-bold text-[15.5px] text-[var(--ink)] tabular-nums">
                      {COMPANY_CONTACT.phoneDisplay}
                    </span>
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="mt-14 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto" aria-labelledby="subpage-highlights">
        <h2
          id="subpage-highlights"
          className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-[var(--ink)] leading-tight"
        >
          {content.highlightsHeading}
        </h2>
        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] bg-[var(--surface)] border border-[var(--border)] p-7 sm:p-8 card-gloss flex flex-col justify-between"
            >
              <div>
                <span className="inline-block rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-[#2E6B45] dark:text-[#9BC094]">
                  {item.tag}
                </span>
                <h3 className="mt-4 text-[1.35rem] font-bold text-[var(--ink)] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 text-[16px] leading-[1.6] text-[var(--muted)]">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Process + Ideal For */}
      <section className="mt-14 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto" aria-labelledby="subpage-process">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] p-7 sm:p-10 card-gloss">
            <h2
              id="subpage-process"
              className="text-[1.65rem] sm:text-[2rem] font-extrabold text-[var(--ink)] leading-tight"
            >
              {content.processHeading}
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {content.processSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-[22px] bg-[var(--bg)] border border-[var(--border)] p-5"
                >
                  <p className="font-display font-extrabold text-[15px] text-[#F26B1D] tabular-nums">
                    {step.step}
                  </p>
                  <h3 className="mt-1.5 text-[1.1rem] font-bold text-[var(--ink)]">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[var(--muted)]">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="lg:col-span-5 rounded-[32px] border border-[var(--border)] p-7 sm:p-10 flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--panel-green)',
              color: 'var(--panel-green-text)',
            }}
          >
            <div>
              <p className="eyebrow !text-[#E3EAD9]/85">{t.subpage.whoFitsBestEyebrow}</p>
              <h2 className="mt-3 text-[1.65rem] sm:text-[1.95rem] font-extrabold leading-tight text-[#EEF0E4]">
                {content.idealForHeading}
              </h2>
              <ul className="mt-6 space-y-4">
                {content.idealForItems.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[16px] leading-relaxed text-[#E3EAD9]/95">
                    <CheckCircle2 className="w-5 h-5 text-[#F26B1D] mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15">
              <button
                type="button"
                onClick={() => onOpenQuote(content.quoteService ?? null)}
                className="btn-orange px-7 py-3.5 text-[16px] w-full sm:w-auto"
              >
                <span>{content.primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Centered SEO Service Guide (H2 + H3 hierarchy) */}
      <SEOContentSection
        data={content.editorialSection}
        sectionId={`seo-guide-${routePath.slice(1)}`}
      />

      {/* Page-specific FAQ matching JSON-LD FAQPage */}
      {faqs.length > 0 && (
        <section className="mt-14 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto" aria-labelledby="subpage-faq">
          <h2
            id="subpage-faq"
            className="text-[1.75rem] sm:text-[2.2rem] font-extrabold text-[var(--ink)] text-center"
          >
            {t.subpage.faqHeading}
          </h2>
          <div className="mt-8 max-w-[1040px] mx-auto space-y-3.5">
            {faqs.map((faq, idx) => (
              <details
                key={faq.question}
                open={idx === 0}
                className="group rounded-[26px] glass-panel border border-[var(--border)] open:border-[var(--sage)] px-6 py-5"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer font-display font-bold text-[1.125rem] sm:text-[1.2rem] text-[var(--ink)] select-none">
                  <span>{faq.question}</span>
                  <span
                    className="w-8 h-8 rounded-full bg-[var(--sage-tint)] text-[#F26B1D] flex items-center justify-center shrink-0 font-sans text-xl font-bold leading-none"
                    aria-hidden="true"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="mt-3.5 pr-8 text-[16.5px] leading-[1.6] text-[var(--muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Internal Cross-Links */}
      <section className="mt-14 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto" aria-labelledby="subpage-related">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 id="subpage-related" className="text-[1.4rem] sm:text-[1.65rem] font-extrabold text-[var(--ink)]">
            {t.subpage.relatedHeading}
          </h2>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateToRoute('/');
            }}
            className="text-[15px] font-bold text-[#F26B1D] hover:underline"
          >
            {t.subpage.backToOverviewLink}
          </a>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {content.relatedLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              onClick={(e) => {
                e.preventDefault();
                navigateToRoute(link.path);
              }}
              className="rounded-[24px] bg-[var(--surface)] border border-[var(--border)] p-6 hover:border-[#F26B1D] transition-colors group"
            >
              <h3 className="text-[1.1rem] font-bold text-[var(--ink)] group-hover:text-[#F26B1D] transition-colors flex items-center justify-between gap-2">
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-[14.5px] text-[var(--muted)] leading-relaxed">{link.summary}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
