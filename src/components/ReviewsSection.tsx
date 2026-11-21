import { Star } from 'lucide-react';
import { REVIEWS_ROW_ONE, REVIEWS_ROW_TWO } from '../data/agencyData';
import type { ClientReviewItem } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { KineticHeading } from './MotionPrimitives';

export function ReviewsSection() {
  const { t } = useLocale();
  const rowOne = t.reviews.rowOne.length > 0 ? t.reviews.rowOne : REVIEWS_ROW_ONE;
  const rowTwo = t.reviews.rowTwo.length > 0 ? t.reviews.rowTwo : REVIEWS_ROW_TWO;

  return (
    <section className="relative z-10 py-16 sm:py-20" aria-labelledby="reviews-heading">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-[760px]">
          <p className="eyebrow">{t.reviews.eyebrow}</p>
          <KineticHeading
            id="reviews-heading"
            className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.06] font-extrabold text-[var(--ink)]"
            segments={[
              { text: t.reviews.headingLead },
              { text: t.reviews.headingHighlight, highlight: true },
            ]}
          />
        </div>

        <div className="rounded-[28px] glass-panel border border-[var(--border)] px-6 py-5 flex items-center gap-5 shrink-0 self-start lg:self-auto shadow-[var(--shadow-card)]">
          <span className="font-display font-extrabold text-[2.75rem] leading-none text-[var(--ink)] tabular-nums">
            4.9
          </span>
          <div>
            <div className="flex items-center gap-1 text-[#F26B1D]" aria-label={t.reviews.starsAria}>
              {[0, 1, 2, 3, 4].map((idx) => (
                <Star key={idx} className="w-4 h-4 fill-[#F26B1D] stroke-[2]" aria-hidden="true" />
              ))}
            </div>
            <p className="mt-1 text-[14px] font-medium text-[var(--muted)]">
              {t.reviews.summaryText}
            </p>
          </div>
        </div>
      </div>

      {/* Row 1 scrolling left */}
      <div className="mt-12 marquee-container marquee-mask overflow-hidden py-2">
        <div className="marquee-track-left gap-5 px-3">
          {rowOne.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {rowOne.map((review) => (
            <ReviewCard key={`${review.id}-dup`} review={review} isDuplicate />
          ))}
        </div>
      </div>

      {/* Row 2 scrolling right */}
      <div className="mt-4 marquee-container marquee-mask overflow-hidden py-2">
        <div className="marquee-track-right gap-5 px-3">
          {rowTwo.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {rowTwo.map((review) => (
            <ReviewCard key={`${review.id}-dup`} review={review} isDuplicate />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: ClientReviewItem;
  isDuplicate?: boolean;
}

function ReviewCard({ review, isDuplicate = false }: ReviewCardProps) {
  return (
    <article
      aria-hidden={isDuplicate || undefined}
      className="shine-card w-[330px] sm:w-[390px] shrink-0 rounded-[28px] bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-7 flex flex-col justify-between min-h-[220px] card-gloss transition-transform duration-200 hover:-translate-y-1"
    >
      <p className="text-[15.5px] leading-[1.55] text-[var(--ink)]">
        &ldquo;{review.quote}&rdquo;
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center justify-center font-display font-bold text-[13px] text-[var(--ink)] shrink-0"
          aria-hidden="true"
        >
          {review.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[var(--ink)] truncate">{review.name}</p>
          <p className="text-[13px] text-[var(--muted)] truncate">{review.business}</p>
        </div>
      </div>
    </article>
  );
}
