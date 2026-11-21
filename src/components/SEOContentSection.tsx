import { Check } from 'lucide-react';
import type { SeoEditorialSectionData } from '../data/seoPagesData';

interface SEOContentSectionProps {
  data: SeoEditorialSectionData;
  sectionId?: string;
}

export function SEOContentSection({
  data,
  sectionId = 'seo-content-guide',
}: SEOContentSectionProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <section
      className="mt-14 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto"
      aria-labelledby={headingId}
      data-testid="seo-content-section"
    >
      <div className="max-w-[76ch]">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2
          id={headingId}
          className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-[var(--ink)] leading-tight"
        >
          {data.heading}
        </h2>
        <p className="mt-3.5 text-[16.5px] sm:text-[17.5px] leading-[1.65] text-[var(--muted)]">
          {data.intro}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.blocks.map((block, index) => (
          <article
            key={block.heading}
            className="rounded-[28px] bg-[var(--surface)] border border-[var(--border)] p-7 sm:p-8 card-gloss flex flex-col justify-between"
          >
            <div>
              <p className="font-display font-extrabold text-[13px] tracking-wider text-[#F26B1D] tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2.5 text-[1.3rem] sm:text-[1.4rem] font-extrabold text-[var(--ink)] leading-snug">
                {block.heading}
              </h3>
              <p className="mt-3 text-[15.5px] leading-[1.65] text-[var(--muted)]">
                {block.summary}
              </p>
            </div>

            {block.points.length > 0 && (
              <ul className="mt-6 pt-5 border-t border-[var(--border)] space-y-2.5">
                {block.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-[14.5px] leading-[1.55] text-[var(--ink)]/90"
                  >
                    <Check
                      className="w-4 h-4 text-[#5C8947] dark:text-[#9BC094] mt-1 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
