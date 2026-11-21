import { WEBSITE_MOCKS } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { computeRevealDelayMs } from '../utils/scrollReveal';
import { KineticHeading, MagneticButton, ScrollReveal } from './MotionPrimitives';

interface WebsitesSectionProps {
  onOpenWebsiteQuote: () => void;
}

export function WebsitesSection({ onOpenWebsiteQuote }: WebsitesSectionProps) {
  const { t } = useLocale();
  const items = t.websites.items.length > 0 ? t.websites.items : WEBSITE_MOCKS;

  return (
    <section
      className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto"
      aria-labelledby="websites-heading"
    >
      <ScrollReveal testId="reveal-websites-header" className="max-w-[820px]">
        <p className="eyebrow">{t.websites.eyebrow}</p>
        <KineticHeading
          id="websites-heading"
          className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.06] font-extrabold text-[var(--ink)]"
          segments={[
            { text: t.websites.headingLead },
            { text: t.websites.headingHighlight, highlight: true },
          ]}
        />
        <p className="mt-4 text-[18px] leading-[1.6] text-[var(--muted)]">
          {t.websites.subtitle}
        </p>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((site, idx) => (
          <ScrollReveal
            key={site.id}
            delayMs={computeRevealDelayMs(idx)}
            testId={`reveal-websites-card-${idx + 1}`}
            className="flex"
          >
            <article className="shine-card glass-panel w-full rounded-[28px] border border-[var(--border)] overflow-hidden transition-all duration-200 hover:-translate-y-2 flex flex-col group">
            {/* Browser chrome */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)] opacity-70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)] opacity-45" />
              </div>
              <div className="flex-1 rounded-full bg-[var(--sage-tint)] px-3 py-1 text-[12px] font-medium text-[var(--muted)] truncate">
                {site.siteUrl}
              </div>
            </div>

            {/* Browser viewport mockup */}
            <div className="p-5 sm:p-6 bg-[var(--sage-tint)]/60 flex-1 flex flex-col justify-between gap-4">
              <div
                className="rounded-[18px] p-5 sm:p-6 text-[#EEF0E4] min-h-[175px] sm:min-h-[195px] flex flex-col justify-between relative overflow-hidden border border-white/15"
                style={{ backgroundColor: site.accentTone }}
              >
                <div
                  className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none opacity-35"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.34), transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10 text-[11px] uppercase tracking-wider text-[#A9BFA3]">
                  {site.eyebrowLabel}
                </span>
                <div className="relative z-10">
                  <p className="font-display font-bold text-[18px] leading-snug">
                    {site.headlineSample}
                  </p>
                  <button
                    type="button"
                    onClick={onOpenWebsiteQuote}
                    className="mt-3 inline-block rounded-full bg-[#F26B1D] text-[#1A2E20] px-3.5 py-1.5 text-[11.5px] font-bold shadow-[inset_0_1px_0_rgba(255,240,224,0.5)] hover:brightness-105 active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    {t.websites.requestQuote}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {site.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[inset_0_1px_0_var(--bevel-top)] px-3 flex items-center justify-center text-[12px] font-semibold text-[var(--ink)] truncate"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer label */}
            <div className="px-5 py-4 bg-[var(--surface)] border-t border-[var(--border)]">
              <h3 className="text-[1.05rem] font-bold text-[var(--ink)] group-hover:text-[#F26B1D] transition-colors">
                {site.clientName}
              </h3>
              <p className="text-[14px] text-[var(--muted)] mt-0.5">{site.industry}</p>
            </div>
            </article>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delayMs={120} testId="reveal-websites-cta" className="mt-10 text-center">
        <MagneticButton
          type="button"
          onClick={onOpenWebsiteQuote}
          className="btn-orange px-9 py-4 text-[17px]"
        >
          {t.websites.bottomCta}
        </MagneticButton>
      </ScrollReveal>
    </section>
  );
}
