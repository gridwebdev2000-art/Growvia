import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Dumbbell,
  Globe,
  HeartPulse,
  Home,
  Mic,
  MoreHorizontal,
  Play,
  Search,
  Smile,
  Store,
  Video,
  AppWindow,
} from 'lucide-react';
import heroTreeImg from '../assets/images/growvia-digital-marketing-agency-hero.webp';
import {
  HERO_PARALLAX_LAYERS,
  HERO_VELOCITY_PROFILES,
  computeHeroParallaxOffsets,
  computeMobileTreeViewportLayout,
  computeVelocityAxisOffset,
} from '../utils/heroParallax';
import type { ServiceOption } from '../utils/quoteLogic';
import { useLocale } from '../context/LocaleContext';
import { MagneticAnchor, MagneticButton } from './MotionPrimitives';

interface HeroSectionProps {
  onOpenQuote: () => void;
  onSelectService?: (service: ServiceOption) => void;
}

const SECTOR_ICONS = [Store, Dumbbell, Smile, HeartPulse, Home] as const;

const FLOATING_LEAVES = [
  {
    id: 'leaf-canopy-nw',
    wrapperClass: 'hidden sm:block top-[9%] left-[2%] w-[24px] h-[16px]',
    rotateClass: 'rotate-[-26deg]',
    motionClass: 'hero-leaf-float',
    shadowClass: 'hero-leaf-shadow-float',
    delay: '0s',
    opacity: 0.82,
    fill: '#4C7953',
    highlight: '#7EA276',
    vein: '#1F4D33',
    path: 'M2 12 C 8 2, 20 1, 26 7 C 21 15, 10 17, 2 12 Z',
    veinPath: 'M3 11.5 Q 14 7.5 24 7',
  },
  {
    id: 'leaf-canopy-ne',
    wrapperClass: 'hidden sm:block top-[5%] right-[14%] w-[21px] h-[14px]',
    rotateClass: 'rotate-[28deg]',
    motionClass: 'hero-leaf-float-alt',
    shadowClass: 'hero-leaf-shadow-alt',
    delay: '2.1s',
    opacity: 0.78,
    fill: '#6D8D5A',
    highlight: '#9BB58B',
    vein: '#2F4D34',
    path: 'M2 10 C 9 1, 19 2, 26 9 C 19 16, 8 15, 2 10 Z',
    veinPath: 'M3.5 10 Q 14 8 24 9',
  },
  {
    id: 'leaf-canopy-sw',
    wrapperClass: 'hidden sm:block bottom-[31%] left-[1%] w-[26px] h-[17px]',
    rotateClass: 'rotate-[16deg]',
    motionClass: 'hero-leaf-float',
    shadowClass: 'hero-leaf-shadow-float',
    delay: '4.2s',
    opacity: 0.8,
    fill: '#5E865B',
    highlight: '#8FB085',
    vein: '#22442D',
    path: 'M2 13 C 7 3, 18 1, 26 6 C 22 14, 11 17, 2 13 Z',
    veinPath: 'M3 12 Q 14 7.5 24 6.5',
  },
] as const;

export function HeroSection({ onOpenQuote, onSelectService }: HeroSectionProps) {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);
  const [viewportSize, setViewportSize] = useState(() =>
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1280, height: 800 }
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight;
      setViewportSize({ width: window.innerWidth, height: nextHeight });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewport, { passive: true });
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  const mobileTreeLayout = computeMobileTreeViewportLayout(
    viewportSize.width,
    viewportSize.height
  );
  const mobileScaleRaw = useMotionValue(mobileTreeLayout.viewportScale);
  const mobileScaleSpring = useSpring(mobileScaleRaw, {
    stiffness: 170,
    damping: 25,
    mass: 0.45,
  });

  useEffect(() => {
    mobileScaleRaw.set(mobileTreeLayout.viewportScale);
  }, [mobileTreeLayout.viewportScale, mobileScaleRaw]);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const floatX = useSpring(rawX, { stiffness: 105, damping: 20, mass: 0.7 });
  const floatY = useSpring(rawY, { stiffness: 105, damping: 20, mass: 0.7 });

  const tiltRawX = useMotionValue(0);
  const tiltRawY = useMotionValue(0);
  const tiltX = useSpring(tiltRawX, { stiffness: 95, damping: 22 });
  const tiltY = useSpring(tiltRawY, { stiffness: 95, damping: 22 });

  const { scrollY, scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.25,
  });
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 280,
    damping: 42,
    mass: 0.45,
  });

  const glowParallaxY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.glow.y[0],
        HERO_PARALLAX_LAYERS.glow.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.glow.weight,
        HERO_VELOCITY_PROFILES.glow.pushY
      )
  );
  const treeParallaxY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.tree.y[0],
        HERO_PARALLAX_LAYERS.tree.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.tree.weight,
        HERO_VELOCITY_PROFILES.tree.pushY
      )
  );
  const treeParallaxScale = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) => computeHeroParallaxOffsets(p, false, v).treeScale
  );
  const effectiveTreeScale = useTransform<number, number>(
    [treeParallaxScale, mobileScaleSpring],
    ([pScale, mScale]) => Math.round(pScale * mScale * 1000) / 1000
  );
  const leavesParallaxY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.leaves.y[0],
        HERO_PARALLAX_LAYERS.leaves.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.leaves.weight,
        HERO_VELOCITY_PROFILES.leaves.pushY
      )
  );

  const cardMetaX = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardMeta.x[0],
        HERO_PARALLAX_LAYERS.cardMeta.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardMeta.weight,
        HERO_VELOCITY_PROFILES.cardMeta.pushX
      )
  );
  const cardMetaY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardMeta.y[0],
        HERO_PARALLAX_LAYERS.cardMeta.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardMeta.weight,
        HERO_VELOCITY_PROFILES.cardMeta.pushY
      )
  );
  const cardGoogleX = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardGoogle.x[0],
        HERO_PARALLAX_LAYERS.cardGoogle.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardGoogle.weight,
        HERO_VELOCITY_PROFILES.cardGoogle.pushX
      )
  );
  const cardGoogleY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardGoogle.y[0],
        HERO_PARALLAX_LAYERS.cardGoogle.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardGoogle.weight,
        HERO_VELOCITY_PROFILES.cardGoogle.pushY
      )
  );
  const cardContentX = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardContent.x[0],
        HERO_PARALLAX_LAYERS.cardContent.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardContent.weight,
        HERO_VELOCITY_PROFILES.cardContent.pushX
      )
  );
  const cardContentY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardContent.y[0],
        HERO_PARALLAX_LAYERS.cardContent.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardContent.weight,
        HERO_VELOCITY_PROFILES.cardContent.pushY
      )
  );
  const cardWebsiteX = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardWebsite.x[0],
        HERO_PARALLAX_LAYERS.cardWebsite.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardWebsite.weight,
        HERO_VELOCITY_PROFILES.cardWebsite.pushX
      )
  );
  const cardWebsiteY = useTransform<number, number>(
    [smoothScroll, smoothVelocity],
    ([p, v]) =>
      computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardWebsite.y[0],
        HERO_PARALLAX_LAYERS.cardWebsite.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardWebsite.weight,
        HERO_VELOCITY_PROFILES.cardWebsite.pushY
      )
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || !sectionRef.current) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    rawX.set(nx * -12);
    rawY.set(ny * -8);
    tiltRawY.set(nx * 3.2);
    tiltRawX.set(ny * -2.6);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    tiltRawX.set(0);
    tiltRawY.set(0);
  };

  const handleCardSelect = (service: ServiceOption) => {
    if (onSelectService) {
      onSelectService(service);
    } else {
      onOpenQuote();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 overflow-hidden pt-[74px] sm:pt-24 lg:pt-[90px] pb-5 sm:pb-6"
    >
      {/* Top-left subtle sage organic curve */}
      <svg
        viewBox="0 0 420 520"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-[26%] sm:w-[20%] h-[480px] z-0"
      >
        <path
          d="M 0 0 L 210 0 C 120 95, 65 215, 38 340 C 20 420, 8 475, 0 520 Z"
          fill="var(--sage-tint)"
          fillOpacity="0.65"
        />
        <path
          d="M 0 150 C 48 225, 84 315, 72 405 C 62 465, 28 500, 0 520 Z"
          fill="var(--sage)"
          fillOpacity="0.14"
        />
      </svg>

      {/* Top-right sweeping organic sage wave */}
      <svg
        viewBox="0 0 800 540"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[64%] sm:w-[46%] lg:w-[38%] h-[360px] sm:h-[460px] z-0"
      >
        <path
          d="M 220 0 C 335 90, 445 135, 595 178 C 705 210, 768 258, 800 325 L 800 0 Z"
          fill="var(--sage)"
          fillOpacity="0.24"
        />
        <path
          d="M 380 0 C 485 75, 575 110, 710 144 C 760 157, 785 176, 800 205 L 800 0 Z"
          fill="var(--sage-tint)"
          fillOpacity="0.65"
        />
      </svg>

      {/* Lower rolling sage hills blending smoothly into var(--bg) below */}
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-[180px] sm:h-[220px] lg:h-[245px] z-0"
      >
        <defs>
          <linearGradient id="hero-bottom-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bg)" stopOpacity="0" />
            <stop offset="68%" stopColor="var(--bg)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--bg)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M0 132 C 260 46, 565 188, 920 118 C 1175 68, 1325 46, 1440 76 L 1440 280 L 0 280 Z"
          fill="var(--sage-tint)"
          fillOpacity="0.64"
        />
        <path
          d="M0 176 C 320 118, 650 232, 995 158 C 1195 115, 1345 115, 1440 138 L 1440 280 L 0 280 Z"
          fill="var(--sage)"
          fillOpacity="0.22"
        />
        <rect x="0" y="0" width="1440" height="280" fill="url(#hero-bottom-fade)" />
      </svg>

      <div className="relative z-10 max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1.22fr)] items-center gap-4 sm:gap-7 lg:gap-8 xl:gap-12">
          {/* Left Copy Column */}
          <div className="min-w-0 text-center lg:text-left relative z-30">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--sage-tint)]/95 border border-[var(--border)] px-3.5 sm:px-5 py-1.5 sm:py-2 text-[13px] sm:text-[15px] font-medium text-[var(--ink)] shadow-sm">
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#5F8E43] dark:bg-[#9BC094] shrink-0"
                aria-hidden="true"
              />
              <span>{t.hero.badge}</span>
            </div>

            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 sm:mt-5 font-hero-serif text-[clamp(2.15rem,4.05vw,4.25rem)] leading-[1.04] font-bold text-[var(--ink)] mx-auto lg:mx-0"
            >
              {t.hero.titleLead}{' '}
              <span className="relative inline-block italic font-bold text-[#719E4B] dark:text-[#9FD374] pr-[0.06em]">
                {t.hero.titleGrow}
                <svg
                  viewBox="0 0 180 18"
                  fill="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 left-0 w-[92%] h-[12px] sm:h-[14px] overflow-visible"
                >
                  <path
                    d="M 4 12 Q 90 2 174 10"
                    stroke="#F47721"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    className="hero-underline-draw"
                  />
                </svg>
              </span>
              <br />
              <span className="xl:whitespace-nowrap">{t.hero.titleSecondLine}</span>
            </motion.h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 sm:mt-5 max-w-[42ch] mx-auto lg:mx-0 text-[16.5px] sm:text-[19.5px] xl:text-[21px] leading-[1.48] sm:leading-[1.54] text-[#35493C] dark:text-[#CDD9CE]"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4"
            >
              <MagneticButton
                type="button"
                onClick={onOpenQuote}
                className="btn-orange px-6 py-3 sm:px-9 sm:py-4 text-[15.5px] sm:text-[18px]"
              >
                <span>{t.hero.getQuote}</span>
                <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" aria-hidden="true" />
              </MagneticButton>

              <MagneticAnchor
                href="#work"
                className="btn-outline px-5 py-3 sm:px-8 sm:py-4 text-[15px] sm:text-[17.5px] !bg-[var(--surface)]/80 backdrop-blur-sm border-[var(--border)] hover:border-[var(--ink)]"
              >
                <span
                  aria-hidden="true"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[var(--ink)]/55 inline-flex items-center justify-center shrink-0"
                >
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>{t.hero.exploreWork}</span>
              </MagneticAnchor>
            </motion.div>
          </div>

          {/* Right Signature Tree + 4 Floating Interactive Service Mini-Cards */}
          <div className="min-w-0 flex flex-col items-center lg:items-end relative">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={
                reducedMotion
                  ? undefined
                  : {
                      perspective: 1000,
                      rotateX: tiltX,
                      rotateY: tiltY,
                    }
              }
              className="relative w-full max-w-[700px] lg:max-w-[780px] mx-auto lg:ml-auto lg:mr-0 select-none"
            >
              {/* Soft sage atmospheric glow behind the tree canopy */}
              <motion.div
                aria-hidden="true"
                style={reducedMotion ? undefined : { y: glowParallaxY }}
                className="pointer-events-none absolute inset-x-[4%] top-[2%] bottom-[12%] rounded-full blur-3xl opacity-95"
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 48%, rgba(145, 169, 139, 0.45) 0%, rgba(169, 191, 163, 0.38) 38%, rgba(227, 234, 217, 0.25) 62%, transparent 78%)',
                  }}
                />
              </motion.div>

              {/* Subtle inner crown depth glow accentuating foliage layering */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[18%] top-[14%] bottom-[28%] rounded-full blur-2xl opacity-70"
                style={{
                  background:
                    'radial-gradient(circle at 50% 46%, rgba(94, 143, 99, 0.22) 0%, transparent 70%)',
                }}
              />

              {/* Soft mossy horizon glow under grassy base */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[12%] right-[12%] bottom-[2%] h-[14%] rounded-full blur-xl opacity-80"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 50%, rgba(145, 169, 139, 0.38) 0%, rgba(23, 48, 31, 0.14) 45%, transparent 76%)',
                }}
              />

              {/* 3 slowly floating botanical leaf elements with organic silhouette variations */}
              <motion.div
                aria-hidden="true"
                data-testid="hero-parallax-leaves"
                style={reducedMotion ? undefined : { y: leavesParallaxY }}
                className="pointer-events-none absolute inset-0 z-20"
              >
                <motion.div
                  style={reducedMotion ? undefined : { x: floatX, y: floatY }}
                  className="pointer-events-none absolute inset-0"
                >
                  {FLOATING_LEAVES.map((leaf) => (
                    <div
                      key={leaf.id}
                      data-testid={`floating-leaf-${leaf.id}`}
                      className={`absolute ${leaf.wrapperClass}`}
                    >
                      {/* Synchronized animated drop-shadow cast onto the hero background */}
                      <div
                        data-testid={`floating-leaf-shadow-${leaf.id}`}
                        className={`pointer-events-none absolute inset-0 z-0 ${leaf.shadowClass}`}
                        style={{ animationDelay: leaf.delay }}
                      >
                        <svg
                          viewBox="0 0 28 18"
                          className={`w-full h-full overflow-visible ${leaf.rotateClass} blur-[2.5px] opacity-[0.26] dark:opacity-[0.44]`}
                        >
                          <path
                            d={leaf.path}
                            className="fill-[#17301F] dark:fill-[#030A06]"
                          />
                        </svg>
                      </div>

                      {/* Floating botanical leaf layer */}
                      <div
                        className={`relative z-10 w-full h-full ${leaf.motionClass}`}
                        style={{ animationDelay: leaf.delay, opacity: leaf.opacity }}
                      >
                        <svg
                          viewBox="0 0 28 18"
                          className={`w-full h-full overflow-visible ${leaf.rotateClass}`}
                          style={{
                            filter: 'drop-shadow(0 2px 3px rgba(23, 48, 31, 0.14))',
                          }}
                        >
                          <path d={leaf.path} fill={leaf.fill} />
                          <path
                            d={leaf.path}
                            fill={leaf.highlight}
                            fillOpacity="0.32"
                            transform="translate(0, -0.8) scale(0.86)"
                          />
                          <path
                            d={leaf.veinPath}
                            stroke={leaf.vein}
                            strokeWidth="1.15"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Mature editorial botanical tree illustration with background parallax & mobile viewport-height scaling */}
              <div
                data-testid="hero-mobile-tree-frame"
                className={
                  mobileTreeLayout.isMobile
                    ? 'relative z-10 w-full flex items-center justify-center overflow-hidden transition-[max-height] duration-300 ease-out'
                    : 'relative z-10 w-full'
                }
                style={
                  mobileTreeLayout.isMobile && mobileTreeLayout.maxHeightPx
                    ? { maxHeight: `${mobileTreeLayout.maxHeightPx}px` }
                    : undefined
                }
              >
                {!imgFailed ? (
                  <motion.div
                    data-testid="hero-parallax-tree"
                    data-mobile-scaled={mobileTreeLayout.isMobile ? 'true' : 'false'}
                    data-viewport-scale={String(mobileTreeLayout.viewportScale)}
                    style={
                      reducedMotion
                        ? mobileTreeLayout.isMobile
                          ? {
                              scale: mobileTreeLayout.viewportScale,
                              transformOrigin: '50% 45%',
                              maskImage:
                                'linear-gradient(to bottom, #000 0%, #000 90%, transparent 100%)',
                              WebkitMaskImage:
                                'linear-gradient(to bottom, #000 0%, #000 90%, transparent 100%)',
                            }
                          : undefined
                        : {
                            y: treeParallaxY,
                            scale: effectiveTreeScale,
                            transformOrigin: mobileTreeLayout.isMobile ? '50% 45%' : '50% 62%',
                            maskImage:
                              'linear-gradient(to bottom, #000 0%, #000 90%, transparent 100%)',
                            WebkitMaskImage:
                              'linear-gradient(to bottom, #000 0%, #000 90%, transparent 100%)',
                          }
                    }
                    className="relative z-10 w-full aspect-[4/3] px-[4%] pt-[1%] sm:pt-[2%]"
                  >
                    <img
                      src={heroTreeImg}
                      alt={t.hero.treeAlt}
                      width={1200}
                      height={896}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onError={() => setImgFailed(true)}
                      className="w-full h-full object-contain hero-tree-depth"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    data-testid="hero-parallax-tree"
                    data-mobile-scaled={mobileTreeLayout.isMobile ? 'true' : 'false'}
                    data-viewport-scale={String(mobileTreeLayout.viewportScale)}
                    role="img"
                    aria-label={t.hero.treeFallbackAria}
                    style={
                      reducedMotion
                        ? mobileTreeLayout.isMobile
                          ? {
                              scale: mobileTreeLayout.viewportScale,
                              transformOrigin: '50% 45%',
                            }
                          : undefined
                        : {
                            y: treeParallaxY,
                            scale: effectiveTreeScale,
                            transformOrigin: mobileTreeLayout.isMobile ? '50% 45%' : '50% 62%',
                          }
                    }
                    className="relative z-10 w-full aspect-[4/3] rounded-[36px] bg-gradient-to-br from-[var(--sage-tint)] to-[var(--sage)]/30 border border-[var(--border)] flex items-center justify-center p-8"
                  >
                    <svg viewBox="0 0 260 220" className="w-56 h-56" aria-hidden="true">
                      <ellipse cx="130" cy="192" rx="82" ry="12" fill="#91A98B" fillOpacity="0.4" />
                      <path
                        d="M130 190 C128 150, 134 125, 130 92"
                        stroke="#6B4A2F"
                        strokeWidth="14"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle cx="130" cy="76" r="52" fill="#2E6B45" />
                      <circle cx="96" cy="90" r="38" fill="#5E8F63" />
                      <circle cx="164" cy="92" r="38" fill="#1F4D33" />
                      <circle cx="114" cy="68" r="5" fill="#F26B1D" />
                      <circle cx="148" cy="82" r="5" fill="#F26B1D" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Desktop & Tablet: 4 Floating Interactive Service Mini-Cards with layered scroll parallax */}
              <div className="hidden sm:block pointer-events-none absolute inset-0 z-20">
                {/* 1. Facebook & Instagram Ads (Top Left) */}
                <motion.div
                  data-testid="hero-parallax-card-meta"
                  style={reducedMotion ? undefined : { x: cardMetaX, y: cardMetaY }}
                  className="pointer-events-none absolute top-[4%] left-[0%] sm:left-[1%] w-[36%] max-w-[260px]"
                >
                  <button
                    type="button"
                    onClick={() => handleCardSelect('Facebook & Instagram Ads')}
                    aria-label={`${t.hero.cardAriaPrefix} ${t.hero.metaCardTitle}`}
                    className="pointer-events-auto w-full text-left -rotate-[3.5deg] rounded-[18px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] p-2.5 lg:p-3 shadow-[0_18px_36px_-14px_rgba(23,48,31,0.28)] dark:shadow-[0_22px_42px_-12px_rgba(0,0,0,0.65)] hover:scale-[1.03] hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
                  >
                    <MetaMiniCard />
                  </button>
                </motion.div>

                {/* 2. Google Ads (Top Right) */}
                <motion.div
                  data-testid="hero-parallax-card-google"
                  style={reducedMotion ? undefined : { x: cardGoogleX, y: cardGoogleY }}
                  className="pointer-events-none absolute top-[10%] right-[0%] sm:right-[1%] w-[35%] max-w-[242px]"
                >
                  <button
                    type="button"
                    onClick={() => handleCardSelect('Google Ads')}
                    aria-label={`${t.hero.cardAriaPrefix} ${t.hero.googleCardTitle}`}
                    className="pointer-events-auto w-full text-left rotate-[2.5deg] rounded-[18px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] p-2.5 lg:p-3 shadow-[0_18px_36px_-14px_rgba(23,48,31,0.28)] dark:shadow-[0_22px_42px_-12px_rgba(0,0,0,0.65)] hover:scale-[1.03] hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
                  >
                    <GoogleMiniCard />
                  </button>
                </motion.div>

                {/* 3. Content & Creative (Bottom Left) */}
                <motion.div
                  data-testid="hero-parallax-card-content"
                  style={reducedMotion ? undefined : { x: cardContentX, y: cardContentY }}
                  className="pointer-events-none absolute bottom-[8%] left-[1%] sm:left-[2%] w-[36%] max-w-[262px]"
                >
                  <button
                    type="button"
                    onClick={() => handleCardSelect('Content & Creative')}
                    aria-label={`${t.hero.cardAriaPrefix} ${t.hero.contentCardTitle}`}
                    className="pointer-events-auto w-full text-left -rotate-[2.5deg] rounded-[18px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] p-2.5 lg:p-3 shadow-[0_20px_40px_-14px_rgba(23,48,31,0.3)] dark:shadow-[0_24px_46px_-12px_rgba(0,0,0,0.7)] hover:scale-[1.03] hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
                  >
                    <ContentMiniCard />
                  </button>
                </motion.div>

                {/* 4. Website Design & Development (Bottom Right) */}
                <motion.div
                  data-testid="hero-parallax-card-website"
                  style={reducedMotion ? undefined : { x: cardWebsiteX, y: cardWebsiteY }}
                  className="pointer-events-none absolute bottom-[7%] right-[0%] sm:right-[1%] w-[37%] max-w-[268px]"
                >
                  <button
                    type="button"
                    onClick={() => handleCardSelect('Website')}
                    aria-label={`${t.hero.cardAriaPrefix} ${t.hero.websiteCardTitle}`}
                    className="pointer-events-auto w-full text-left rotate-[3deg] rounded-[18px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] p-2.5 lg:p-3 shadow-[0_20px_40px_-14px_rgba(23,48,31,0.3)] dark:shadow-[0_24px_46px_-12px_rgba(0,0,0,0.7)] hover:scale-[1.03] hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
                  >
                    <WebsiteMiniCard />
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Mobile (< 640px): Clean 2x2 grid so mini-cards stay legible & tappable */}
            <div className="sm:hidden mt-3 w-full grid grid-cols-2 gap-2.5 relative z-20">
              <button
                type="button"
                onClick={() => handleCardSelect('Facebook & Instagram Ads')}
                aria-label={`${t.hero.cardAriaPrefix} ${t.hero.metaCardTitle}`}
                className="text-left rounded-[16px] bg-[var(--surface)]/95 border border-[var(--border)] p-2.5 shadow-sm cursor-pointer"
              >
                <MetaMiniCard />
              </button>
              <button
                type="button"
                onClick={() => handleCardSelect('Google Ads')}
                aria-label={`${t.hero.cardAriaPrefix} ${t.hero.googleCardTitle}`}
                className="text-left rounded-[16px] bg-[var(--surface)]/95 border border-[var(--border)] p-2.5 shadow-sm cursor-pointer"
              >
                <GoogleMiniCard />
              </button>
              <button
                type="button"
                onClick={() => handleCardSelect('Content & Creative')}
                aria-label={`${t.hero.cardAriaPrefix} ${t.hero.contentCardTitle}`}
                className="text-left rounded-[16px] bg-[var(--surface)]/95 border border-[var(--border)] p-2.5 shadow-sm cursor-pointer"
              >
                <ContentMiniCard />
              </button>
              <button
                type="button"
                onClick={() => handleCardSelect('Website')}
                aria-label={`${t.hero.cardAriaPrefix} ${t.hero.websiteCardTitle}`}
                className="text-left rounded-[16px] bg-[var(--surface)]/95 border border-[var(--border)] p-2.5 shadow-sm cursor-pointer"
              >
                <WebsiteMiniCard />
              </button>
            </div>
          </div>
        </div>

        {/* Clean Unboxed Trust Strip positioned tightly above the fold */}
        <div className="mt-4 sm:mt-5 lg:mt-3 pt-1 pb-1 text-center relative z-30">
          <div className="flex items-center justify-center gap-4 max-w-[920px] mx-auto">
            <span className="h-px flex-1 bg-[var(--border)]/85" aria-hidden="true" />
            <p className="text-[14.5px] sm:text-[15.5px] font-medium text-[var(--ink)]/85 px-2">
              {t.hero.trustHeading}
            </p>
            <span className="h-px flex-1 bg-[var(--border)]/85" aria-hidden="true" />
          </div>

          <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 lg:gap-x-0 gap-y-2.5">
            {t.hero.sectors.map((label, idx) => {
              const Icon = SECTOR_ICONS[idx % SECTOR_ICONS.length];
              return (
                <div
                  key={label}
                  className={`inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-medium text-[var(--ink)]/85 lg:px-8 xl:px-10 ${
                    idx > 0 ? 'lg:border-l lg:border-[var(--border)]/85' : ''
                  }`}
                >
                  <Icon
                    className="w-[17px] h-[17px] text-[#3E5C45] dark:text-[#9BC094] shrink-0"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-5 flex justify-center">
            <a
              href="#work"
              aria-label={t.hero.scrollWorkAria}
              className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-sm text-[var(--ink)] inline-flex items-center justify-center hover:border-[#F47721] hover:text-[#F47721] transition-colors shadow-sm"
            >
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaMiniCard() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {/* Instagram glyph */}
        <span
          aria-hidden="true"
          className="w-4 h-4 rounded-[4px] flex items-center justify-center text-white shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 55%, #8134AF 100%)',
          }}
        >
          <span className="w-2 h-2 rounded-[2.5px] border-[1.2px] border-white block" />
        </span>
        {/* Facebook glyph */}
        <span
          aria-hidden="true"
          className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-extrabold leading-none inline-flex items-center justify-center shrink-0"
        >
          f
        </span>
        <span className="text-[9.5px] sm:text-[10px] leading-[1.15] font-bold text-[var(--ink)]">
          {t.hero.metaCardTitle}
        </span>
      </div>

      <div className="rounded-[10px] bg-[var(--bg)] border border-[var(--border)]/80 overflow-hidden">
        <div className="px-2 py-1.5 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-4 h-4 rounded-full bg-[#E3EAD9] dark:bg-[#23442E] flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#2E6B45]" />
            </span>
            <div className="min-w-0 leading-none">
              <p className="text-[8.5px] font-bold text-[var(--ink)] truncate">
                {t.hero.yourBusiness}
              </p>
              <p className="text-[7px] text-[var(--muted)] flex items-center gap-0.5 mt-0.5">
                <span>{t.hero.sponsored}</span>
                <span>·</span>
                <Globe className="w-2 h-2 inline" aria-hidden="true" />
              </p>
            </div>
          </div>
          <MoreHorizontal className="w-3 h-3 text-[var(--muted)] shrink-0" aria-hidden="true" />
        </div>

        {/* Mini golden-hour scenic tree banner */}
        <div className="relative h-[58px] overflow-hidden bg-gradient-to-b from-[#DCE5DC] via-[#F2E0BA] to-[#879D68]">
          <svg viewBox="0 0 180 70" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <ellipse cx="90" cy="48" rx="75" ry="22" fill="#F6D58E" fillOpacity="0.55" />
            <path d="M0 54 Q 65 44, 180 56 L 180 70 L 0 70 Z" fill="#5D7843" />
            <path d="M90 54 L 90 34" stroke="#4D3520" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="90" cy="27" rx="22" ry="13" fill="#2E5434" />
            <ellipse cx="81" cy="29" rx="12" ry="8" fill="#467247" />
          </svg>
        </div>

        <div className="px-2 py-1.5 flex items-center justify-between gap-1">
          <span className="text-[7.5px] font-medium text-[var(--muted)] truncate">
            yourbusiness.ca
          </span>
          <span className="rounded-full bg-[#F26B1D] text-[#1A2E20] px-2 py-0.5 text-[7.5px] font-bold whitespace-nowrap shrink-0">
            {t.hero.learnMore}
          </span>
        </div>
      </div>
    </div>
  );
}

function GoogleMiniCard() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {/* Google Ads triangle mark */}
        <svg viewBox="0 0 24 22" className="w-4 h-3.5 shrink-0" aria-hidden="true">
          <path d="M2 18 L9.5 4.5 C10.3 3 12.2 2.5 13.5 3.3 L15 4.2 L7.5 18.8 C6.7 20.2 4.8 20.7 3.4 19.9 C2 19.1 1.5 18.8 2 18 Z" fill="#FBBC04" />
          <path d="M10.5 4.5 L18 18 C18.8 19.4 18.3 21 16.9 21.6 C15.5 22.2 14 21.6 13.2 20.2 L7 8.5 Z" fill="#4285F4" />
          <circle cx="5.2" cy="18.2" r="2.6" fill="#34A853" />
        </svg>
        <span className="text-[10.5px] font-bold text-[var(--ink)] truncate">
          {t.hero.googleCardTitle}
        </span>
      </div>

      <div className="rounded-full bg-[var(--bg)] border border-[var(--border)] px-1.5 xl:px-2 py-1 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <Search className="w-2.5 h-2.5 text-[var(--muted)] shrink-0" aria-hidden="true" />
          <span className="text-[7.5px] xl:text-[8.5px] font-medium text-[var(--ink)] truncate">
            {t.hero.googleSearchQuery}
          </span>
        </div>
        <Mic className="w-2.5 h-2.5 text-[#4285F4] shrink-0" aria-hidden="true" />
      </div>

      <div className="mt-2.5 space-y-1.5 px-0.5">
        <p className="text-[8.5px] font-bold text-[var(--ink)]">
          {t.hero.googleAdTag} <span className="text-[var(--muted)] font-normal">·</span>{' '}
          {t.hero.yourBusiness}
        </p>
        <div className="h-2 w-[88%] rounded-full bg-[var(--sage)]/45" />
        <div className="h-2 w-[72%] rounded-full bg-[var(--sage)]/30" />
        <div className="pt-1.5 flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[var(--sage)]/30 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-1.5 w-[75%] rounded-full bg-[var(--sage)]/35" />
            <div className="h-1.5 w-[55%] rounded-full bg-[var(--sage)]/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentMiniCard() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Video className="w-3.5 h-3.5 text-[var(--ink)] shrink-0" aria-hidden="true" />
        <span className="text-[10.5px] font-bold text-[var(--ink)] truncate">
          {t.hero.contentCardTitle}
        </span>
      </div>

      <div className="relative rounded-[10px] overflow-hidden border border-[var(--border)]/70 bg-[#1B2B22]">
        <svg viewBox="0 0 220 110" className="w-full h-[80px] block" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="mini-lake-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#637466" />
              <stop offset="55%" stopColor="#CBD4C9" />
              <stop offset="100%" stopColor="#859684" />
            </linearGradient>
          </defs>
          <rect width="220" height="110" fill="url(#mini-lake-sky)" />
          <path d="M0 64 L52 28 L98 56 L152 18 L220 62 L220 74 L0 74 Z" fill="#2F4035" />
          <path d="M22 72 L84 44 L132 66 L186 38 L220 66 L220 74 L22 74 Z" fill="#1F2E25" fillOpacity="0.85" />
          <rect x="0" y="72" width="220" height="38" fill="#18261E" fillOpacity="0.9" />
          <path d="M40 74 L95 94 L152 74 Z" fill="#7D9082" fillOpacity="0.28" />
        </svg>

        {/* REC indicator */}
        <span className="absolute top-1.5 right-2 inline-flex items-center gap-1 text-[7.5px] font-bold tracking-wider text-white/95">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
          REC
        </span>

        {/* Center translucent Play circle */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full bg-black/55 backdrop-blur-xs border border-white/25 text-white inline-flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" aria-hidden="true" />
          </span>
        </span>

        {/* Bottom scrubber bar */}
        <div className="px-2 py-1 bg-black/65 flex items-center justify-between gap-2 text-[7px] text-white/90 tabular-nums">
          <span className="inline-flex items-center gap-1 flex-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
            <span className="h-[2px] flex-1 rounded-full bg-white/30 overflow-hidden">
              <span className="block h-full w-1/3 bg-[#F26B1D]" />
            </span>
          </span>
          <span>0:00 / 0:15</span>
        </div>
      </div>
    </div>
  );
}

function WebsiteMiniCard() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <AppWindow className="w-3.5 h-3.5 text-[var(--ink)] shrink-0" aria-hidden="true" />
        <span className="text-[9.5px] sm:text-[10px] leading-[1.15] font-bold text-[var(--ink)]">
          {t.hero.websiteCardTitle}
        </span>
      </div>

      <div className="rounded-[10px] bg-[var(--bg)] border border-[var(--border)]/85 overflow-hidden">
        {/* Browser dots */}
        <div className="px-2 py-1 border-b border-[var(--border)]/70 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]/80" />
        </div>

        {/* Lush green valley hero preview */}
        <div className="relative h-[62px] overflow-hidden bg-[#24422C] px-2.5 py-2 flex flex-col justify-between text-[#FFFDF8]">
          <svg
            viewBox="0 0 220 90"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <rect width="220" height="90" fill="#B6C4B0" />
            <path d="M0 54 Q 55 24, 130 44 T 220 30 L 220 90 L 0 90 Z" fill="#4D7143" />
            <path d="M0 66 Q 80 42, 165 62 T 220 50 L 220 90 L 0 90 Z" fill="#284A30" />
          </svg>
          <p className="relative z-10 font-hero-serif text-[10.5px] leading-[1.08] font-bold max-w-[13ch] drop-shadow-sm">
            {t.hero.websiteCardHeadline}
          </p>
          <span className="relative z-10 inline-block w-fit rounded-full bg-[#F26B1D] text-[#1A2E20] px-2 py-0.5 text-[6.5px] font-bold">
            {t.hero.websiteCardCta}
          </span>
        </div>

        {/* Lower wireframe strips */}
        <div className="p-2 grid grid-cols-3 gap-1.5">
          <div className="h-3 rounded-[4px] bg-[var(--sage-tint)]" />
          <div className="h-3 rounded-[4px] bg-[var(--sage-tint)]" />
          <div className="h-3 rounded-[4px] bg-[var(--sage-tint)]" />
        </div>
      </div>
    </div>
  );
}
