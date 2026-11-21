import { CLIENT_RESULTS } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { computeRevealDelayMs } from '../utils/scrollReveal';
import { KineticHeading, ScrollReveal } from './MotionPrimitives';

export function ResultsSection() {
  const { t } = useLocale();
  const items = t.results.items.length > 0 ? t.results.items : CLIENT_RESULTS;

  return (
    <section
      id="results"
      className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto scroll-mt-24"
      aria-labelledby="results-heading"
    >
      <ScrollReveal
        testId="reveal-results-header"
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="max-w-[780px]">
          <p className="eyebrow">{t.results.eyebrow}</p>
          <KineticHeading
            id="results-heading"
            className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.06] font-extrabold text-[var(--ink)]"
            segments={[
              { text: t.results.headingLead },
              { text: t.results.headingHighlight, highlight: true },
            ]}
          />
        </div>
        <p className="text-[15px] text-[var(--muted)] max-w-[38ch]">
          {t.results.subtitle}
        </p>
      </ScrollReveal>

      <div className="mt-12 border-b border-[var(--border)]">
        {items.map((row, idx) => (
          <ScrollReveal
            key={row.index}
            delayMs={computeRevealDelayMs(idx)}
            testId={`reveal-results-row-${idx + 1}`}
          >
            <article className="border-t border-[var(--border)] py-7 sm:py-9 px-4 sm:px-6 -mx-4 sm:-mx-6 rounded-[26px] hover:bg-[var(--surface)]/65 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5 flex items-start gap-4 sm:gap-5">
              <span className="w-10 h-10 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center justify-center font-display font-extrabold text-[15px] text-[#F26B1D] tabular-nums shrink-0 shadow-[inset_0_1px_0_var(--bevel-top)]">
                {row.index}
              </span>
              <div>
                <h3 className="text-[1.35rem] sm:text-[1.55rem] font-bold text-[var(--ink)] leading-snug">
                  {row.title}
                </h3>
                <p className="mt-1 text-[15.5px] text-[var(--muted)]">{row.industry}</p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {row.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[20px] bg-[var(--surface)]/80 border border-[var(--border)] px-5 py-4 shadow-[inset_0_1px_0_var(--bevel-top)]"
                >
                  <p className="font-display font-extrabold text-[clamp(2rem,3.3vw,2.9rem)] leading-none text-[var(--heading-em)] tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[13.5px] text-[var(--muted)] leading-snug">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
