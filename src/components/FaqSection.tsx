import { FAQ_ITEMS } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { KineticHeading } from './MotionPrimitives';

export function FaqSection() {
  const { t } = useLocale();
  const items = t.faq.items.length > 0 ? t.faq.items : FAQ_ITEMS;

  return (
    <section
      id="faq"
      className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto scroll-mt-24"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-[820px] mx-auto text-center">
        <p className="eyebrow">{t.faq.eyebrow}</p>
        <KineticHeading
          id="faq-heading"
          className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.06] font-extrabold text-[var(--ink)]"
          segments={[
            { text: t.faq.headingLead },
            { text: t.faq.headingHighlight, highlight: true },
            { text: t.faq.headingEnd },
          ]}
        />
      </div>

      <div className="mt-12 max-w-[1040px] mx-auto space-y-3.5">
        {items.map((item, idx) => (
          <details
            key={item.question}
            open={idx === 0}
            className="group rounded-[26px] glass-panel border border-[var(--border)] open:border-[var(--sage)] px-6 py-5 transition-all"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer font-display font-bold text-[1.125rem] sm:text-[1.22rem] text-[var(--ink)] select-none">
              <span>{item.question}</span>
              <span
                className="w-8 h-8 rounded-full bg-[var(--sage-tint)] text-[#F26B1D] flex items-center justify-center shrink-0 font-sans text-xl font-bold leading-none"
                aria-hidden="true"
              >
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="mt-3.5 pr-8 text-[16.5px] leading-[1.6] text-[var(--muted)]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
