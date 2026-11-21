import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowRight, Pause, Play, Search } from 'lucide-react';
import { SERVICES } from '../data/agencyData';
import type { ServiceCardData } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import type { ServiceOption } from '../utils/quoteLogic';
import { computeCardTilt } from '../utils/tiltMath';
import { computeRevealDelayMs } from '../utils/scrollReveal';
import { KineticHeading, ScrollReveal, SpringAudioVisualizer } from './MotionPrimitives';

interface ServicesSectionProps {
  onOpenQuoteWithService: (service: ServiceOption) => void;
}

export function ServicesSection({ onOpenQuoteWithService }: ServicesSectionProps) {
  const { t } = useLocale();
  const items = t.services.items.length > 0 ? t.services.items : SERVICES;

  return (
    <section
      id="services"
      className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto scroll-mt-24"
      aria-labelledby="services-heading"
    >
      <ScrollReveal testId="reveal-services-header" className="max-w-[820px]">
        <p className="eyebrow">{t.services.eyebrow}</p>
        <KineticHeading
          id="services-heading"
          className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.06] font-extrabold text-[var(--ink)]"
          segments={[
            { text: t.services.headingLead },
            { text: t.services.headingHighlight, highlight: true },
          ]}
        />
      </ScrollReveal>

      <div className="mt-12 space-y-6 md:space-y-12 pb-2">
        {items.map((service, index) => (
          <ServiceCard
            key={service.number}
            service={service}
            index={index}
            learnMoreLabel={t.services.learnMore}
            onLearnMore={() => onOpenQuoteWithService(service.serviceOption)}
          />
        ))}
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: ServiceCardData;
  index: number;
  learnMoreLabel: string;
  onLearnMore: () => void;
}

function ServiceCard({ service, index, learnMoreLabel, onLearnMore }: ServiceCardProps) {
  const isVisualLeft = index % 2 === 1;
  const stickyTopPx = 94 + index * 18;
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawGlareX = useMotionValue(50);
  const rawGlareY = useMotionValue(50);

  const rotateX = useSpring(rawRotateX, { stiffness: 210, damping: 22, mass: 0.55 });
  const rotateY = useSpring(rawRotateY, { stiffness: 210, damping: 22, mass: 0.55 });
  const glareX = useSpring(rawGlareX, { stiffness: 220, damping: 26, mass: 0.5 });
  const glareY = useSpring(rawGlareY, { stiffness: 220, damping: 26, mass: 0.5 });

  // Subtle depth parallax for the visual illustration layer inside the card
  const visualShiftX = useTransform(rotateY, [-3.4, 3.4], [-4, 4]);
  const visualShiftY = useTransform(rotateX, [-2.8, 2.8], [3, -3]);

  const specularSheen = useMotionTemplate`radial-gradient(480px circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22), rgba(242, 107, 29, 0.05) 38%, transparent 72%)`;

  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const canTilt = !reducedMotion && isFinePointer;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const rect = cardRef.current.getBoundingClientRect();
    const tilt = computeCardTilt(e.clientX, e.clientY, rect, {
      maxRotateX: 2.8,
      maxRotateY: 3.4,
    });
    rawRotateX.set(tilt.rotateX);
    rawRotateY.set(tilt.rotateY);
    rawGlareX.set(tilt.glareX);
    rawGlareY.set(tilt.glareY);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    setHovered(true);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawGlareX.set(50);
    rawGlareY.set(50);
  };

  return (
    <article
      className="md:sticky"
      style={{ top: `${stickyTopPx}px`, zIndex: index + 1 }}
    >
      <ScrollReveal
        delayMs={computeRevealDelayMs(index, 65, 195)}
        testId={`reveal-services-card-${index + 1}`}
      >
        <motion.div
          ref={cardRef}
        data-testid={`service-card-tilt-${index + 1}`}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={canTilt ? { scale: 1.008 } : undefined}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={
          canTilt
            ? {
                transformPerspective: 1150,
                rotateX,
                rotateY,
              }
            : undefined
        }
        className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 lg:p-12 card-gloss will-change-transform"
      >
        {/* Subtle cursor-following specular sheen */}
        {canTilt && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-200"
            style={{
              background: specularSheen,
              opacity: hovered ? 1 : 0,
            }}
          />
        )}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Text Side */}
          <div className={isVisualLeft ? 'lg:order-2' : 'lg:order-1'}>
            <p className="font-display text-[15.5px] font-bold text-[#F26B1D] tabular-nums">
              {service.number}
            </p>
            <h3 className="mt-3 text-[1.75rem] sm:text-[2.2rem] leading-[1.12] font-bold text-[var(--ink)]">
              {service.title}
            </h3>
            <p className="mt-4 text-[17.5px] sm:text-[18.5px] leading-[1.6] text-[var(--muted)]">
              {service.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-4 py-1.5 text-[13.5px] font-semibold text-[var(--ink)] whitespace-nowrap shadow-[inset_0_1px_0_var(--bevel-top)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-7">
              <button
                type="button"
                onClick={onLearnMore}
                className="inline-flex items-center gap-2 font-bold text-[16.5px] text-[var(--ink)] border-b-2 border-[#F26B1D] pb-1 hover:text-[#F26B1D] transition-colors cursor-pointer group"
              >
                <span>{learnMoreLabel}</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Mock Illustration Side with subtle 3D inner parallax */}
          <motion.div
            style={canTilt ? { x: visualShiftX, y: visualShiftY } : undefined}
            className={`relative overflow-hidden rounded-[24px] bg-[var(--sage-tint)] p-4 sm:p-8 lg:p-10 flex items-center justify-center min-h-[290px] sm:min-h-[340px] border border-[var(--border)] shadow-[inset_0_1px_0_var(--bevel-top)] ${
              isVisualLeft ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 26% 18%, rgba(255,255,255,0.42), transparent 62%), radial-gradient(circle at 82% 84%, rgba(242,107,29,0.08), transparent 52%)',
              }}
            />
            <div className="relative z-10 w-full flex items-center justify-center">
              {service.visualType === 'meta' && <MetaAdMock />}
              {service.visualType === 'google' && <GoogleAdMock />}
              {service.visualType === 'content' && <ContentVideoMock />}
              {service.visualType === 'website' && <WebsiteMock />}
            </div>
          </motion.div>
        </div>
        </motion.div>
      </ScrollReveal>
    </article>
  );
}

function MetaAdMock() {
  const { t } = useLocale();

  return (
    <div className="shine-card w-full max-w-[380px] rounded-[22px] bg-[var(--surface)] border border-[var(--border)] overflow-hidden card-gloss">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E6B45] to-[#17301F] flex items-center justify-center text-[#EEF0E4] font-display font-bold text-sm shrink-0 shadow-sm">
          YB
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[var(--ink)] leading-tight truncate">
            {t.services.metaMock.yourBusiness}
          </p>
          <p className="text-[12px] text-[var(--muted)] leading-tight">
            {t.services.metaMock.sponsored}
          </p>
        </div>
      </div>

      {/* Green image block with stylized tree */}
      <div className="h-[146px] bg-gradient-to-br from-[#17301F] via-[#1F4D33] to-[#2E6B45] flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            background:
              'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.22), transparent 55%)',
          }}
          aria-hidden="true"
        />
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <circle cx="44" cy="44" r="38" fill="#5E8F63" opacity="0.28" />
          <path d="M44 68V42M44 50L35 43M44 47L53 41" stroke="#6B4A2F" strokeWidth="4" strokeLinecap="round" />
          <circle cx="33" cy="36" r="12" fill="#2E6B45" />
          <circle cx="55" cy="36" r="12" fill="#5E8F63" />
          <circle cx="44" cy="26" r="13" fill="#A9BFA3" />
          <circle cx="52" cy="29" r="3.5" fill="#F26B1D" />
        </svg>
      </div>

      <div className="px-3.5 sm:px-4 py-3 flex items-center justify-between gap-2.5 bg-[var(--surface)]">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted)] truncate">
            yourbusiness.ca
          </p>
          <p className="text-[12.5px] sm:text-[13px] leading-tight font-bold text-[var(--ink)]">
            {t.services.metaMock.ctaTitle}
          </p>
        </div>
        <span className="rounded-full bg-[#F26B1D] text-[#1A2E20] px-3 sm:px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap shrink-0 shadow-[inset_0_1px_0_rgba(255,240,224,0.5)]">
          {t.services.metaMock.learnMore}
        </span>
      </div>
    </div>
  );
}

function GoogleAdMock() {
  const { t } = useLocale();

  return (
    <div className="w-full max-w-[400px] space-y-3">
      {/* Search bar */}
      <div className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 flex items-center gap-2.5 card-gloss">
        <Search className="w-4 h-4 text-[#F26B1D] shrink-0" aria-hidden="true" />
        <span className="text-[14px] text-[var(--ink)] truncate">
          {t.services.googleMock.searchText}
        </span>
      </div>

      {/* Sponsored Ad Result */}
      <div className="shine-card rounded-[20px] bg-[var(--surface)] border border-[var(--border)] p-4 card-gloss">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="rounded-full bg-[var(--sage-tint)] px-2 py-0.5 font-bold text-[var(--ink)]">
            {t.services.googleMock.adBadge}
          </span>
          <span aria-hidden="true" className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)] truncate">yourbusiness.ca</span>
        </div>
        <p className="mt-1.5 font-display font-bold text-[16px] text-[#2E6B45] dark:text-[#9BC094]">
          {t.services.googleMock.headline}
        </p>
        <p className="mt-1 text-[13px] text-[var(--muted)] leading-snug">
          {t.services.googleMock.description}
        </p>
      </div>

      {/* Dimmed Organic Result */}
      <div className="rounded-[18px] bg-[var(--surface)]/55 border border-[var(--border)]/70 p-3.5 opacity-60">
        <div className="h-2.5 w-28 rounded-full bg-[var(--sage)]/60" />
        <div className="mt-2 h-3.5 w-52 rounded-full bg-[var(--muted)]/40" />
        <div className="mt-2 h-2.5 w-full rounded-full bg-[var(--sage)]/45" />
      </div>
    </div>
  );
}

function ContentVideoMock() {
  const { t } = useLocale();
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(14);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setSeconds((prev) => (prev >= 45 ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const progressPct = Math.round((seconds / 45) * 100);
  const timeLabel = `00:${String(seconds).padStart(2, '0')} / 00:45`;

  return (
    <div
      className="shine-card w-full max-w-[400px] rounded-[22px] bg-gradient-to-br from-[#17301F] via-[#1C3D28] to-[#13291B] text-[#EEF0E4] p-5 sm:p-6 border border-white/15 flex flex-col justify-between min-h-[245px]"
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 34px -18px rgba(23, 48, 31, 0.65)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-wider uppercase">
          <span
            className={`w-2.5 h-2.5 rounded-full bg-[#F26B1D] ${playing ? 'hero-orange-dot' : ''}`}
            aria-hidden="true"
          />
          REC
        </span>
        <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[11.5px] text-[#E3EAD9] font-medium">
          {t.services.contentMock.shootBadge}
        </span>
      </div>

      <div className="my-5 flex items-center justify-center gap-4">
        <SpringAudioVisualizer active={playing} barCount={4} tone="dark" />

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? t.services.contentMock.pauseAria : t.services.contentMock.playAria}
          className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FF7E33] to-[#F26B1D] text-[#1A2E20] flex items-center justify-center shadow-[inset_0_1.5px_0_rgba(255,240,224,0.6),0_8px_20px_rgba(242,107,29,0.45)] hover:scale-105 transition-transform cursor-pointer"
        >
          {playing ? (
            <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-[1px]" aria-hidden="true" />
          )}
        </button>

        <SpringAudioVisualizer active={playing} barCount={5} tone="dark" />
      </div>

      <div>
        <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-[#F26B1D] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-[#E3EAD9] tabular-nums">
          <span>{t.services.contentMock.reelTitle}</span>
          <span>{timeLabel}</span>
        </div>
      </div>
    </div>
  );
}

function WebsiteMock() {
  const { t } = useLocale();

  return (
    <div className="shine-card w-full max-w-[400px] rounded-[22px] bg-[var(--surface)] border border-[var(--border)] overflow-hidden card-gloss">
      <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)] opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)] opacity-45" />
        </div>
        <div className="flex-1 rounded-full bg-[var(--sage-tint)] px-3 py-1 text-[11px] font-medium text-[var(--muted)] truncate">
          https://yourbusiness.ca
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-[16px] bg-gradient-to-br from-[#1F4D33] via-[#265C3E] to-[#17301F] p-4 text-[#EEF0E4] relative overflow-hidden">
          <div
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)',
            }}
            aria-hidden="true"
          />
          <p className="text-[11px] uppercase tracking-wider text-[#A9BFA3]">
            {t.services.websiteMock.eyebrow}
          </p>
          <p className="mt-1 font-display font-bold text-[17px] leading-tight">
            {t.services.websiteMock.headline}
          </p>
          <span className="mt-3 inline-block rounded-full bg-[#F26B1D] text-[#1A2E20] px-3.5 py-1 text-[11px] font-bold shadow-[inset_0_1px_0_rgba(255,240,224,0.5)]">
            {t.services.websiteMock.cta}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {t.services.websiteMock.badges.map((badge) => (
            <div
              key={badge}
              className="h-8 rounded-xl bg-[var(--sage-tint)] border border-[var(--border)]/60 flex items-center justify-center text-[11px] font-bold text-[var(--ink)] px-1 text-center truncate"
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
