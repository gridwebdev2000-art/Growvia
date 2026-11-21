import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  REVEAL_DEFAULTS,
  buildRevealStyle,
  shouldImmediateReveal,
} from '../utils/scrollReveal';

function useCanUseFinePointer(): boolean {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine)');
    setIsFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isFine;
}

/**
 * Global soft warm-amber + emerald cursor halo (fine-pointer desktop only, disabled on reduced motion).
 */
export function CursorAmbientHalo() {
  const reducedMotion = useReducedMotion();
  const isFine = useCanUseFinePointer();
  const mouseX = useMotionValue(-600);
  const mouseY = useMotionValue(-600);
  const [visible, setVisible] = useState(false);

  const smoothX = useSpring(mouseX, { stiffness: 180, damping: 24, mass: 0.35 });
  const smoothY = useSpring(mouseY, { stiffness: 180, damping: 24, mass: 0.35 });

  useEffect(() => {
    if (reducedMotion || !isFine) {
      setVisible(false);
      return;
    }

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 240);
      mouseY.set(e.clientY - 240);
      setVisible(true);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [isFine, mouseX, mouseY, reducedMotion]);

  if (reducedMotion || !isFine) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 w-[480px] h-[480px] rounded-full pointer-events-none z-20"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: visible ? 1 : 0,
        background:
          'radial-gradient(circle, rgba(242, 107, 29, 0.10) 0%, rgba(94, 143, 99, 0.08) 42%, transparent 72%)',
        transition: 'opacity 250ms ease',
      }}
    />
  );
}

/**
 * Subtle scroll-linked parallax radial ambient color fields behind the page canvas.
 */
export function ScrollAmbientFields() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const orbOneY = useTransform(scrollYProgress, [0, 1], ['-4%', '28%']);
  const orbOneX = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  const orbTwoY = useTransform(scrollYProgress, [0, 1], ['12%', '-18%']);
  const orbTwoX = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      <motion.div
        className="absolute -top-32 -left-24 w-[620px] h-[620px] rounded-full opacity-55"
        style={{
          y: orbOneY,
          x: orbOneX,
          background:
            'radial-gradient(circle, rgba(169, 191, 163, 0.24) 0%, rgba(94, 143, 99, 0.08) 48%, transparent 72%)',
        }}
      />
      <motion.div
        className="absolute top-[38%] -right-36 w-[560px] h-[560px] rounded-full opacity-45"
        style={{
          y: orbTwoY,
          x: orbTwoX,
          background:
            'radial-gradient(circle, rgba(242, 107, 29, 0.11) 0%, rgba(227, 234, 217, 0.14) 46%, transparent 72%)',
        }}
      />
    </div>
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  strength?: number;
  ariaLabel?: string;
}

/**
 * Primary button with tactile spring magnetic cursor pull on fine-pointer desktops.
 */
export function MagneticButton({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  strength = 0.28,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const isFine = useCanUseFinePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.45 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion || !isFine || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const clampedX = Math.max(-10, Math.min(10, dx * strength));
    const clampedY = Math.max(-8, Math.min(8, dy * strength));
    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

interface MagneticAnchorProps {
  children: ReactNode;
  href: string;
  className?: string;
  strength?: number;
}

export function MagneticAnchor({
  children,
  href,
  className = '',
  strength = 0.28,
}: MagneticAnchorProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();
  const isFine = useCanUseFinePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.45 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !isFine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-10, Math.min(10, dx * strength)));
    y.set(Math.max(-8, Math.min(8, dy * strength)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export interface KineticSegment {
  text: string;
  highlight?: boolean;
  highlightStyle?: React.CSSProperties;
  underlineAccent?: boolean;
}

interface KineticHeadingProps {
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
  segments: KineticSegment[];
  immediate?: boolean;
}

function CurvedOrangeUnderline({ animateStroke }: { animateStroke: boolean }) {
  return (
    <svg
      viewBox="0 0 180 16"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 -bottom-1 w-full h-[9px] sm:h-[11px] overflow-visible"
    >
      <path
        d="M 4 11 Q 88 2 174 8.5"
        stroke="#F26B1D"
        strokeWidth="3.8"
        strokeLinecap="round"
        className={animateStroke ? 'hero-underline-draw' : undefined}
      />
    </svg>
  );
}

/**
 * Word-by-word kinetic staggered slide-up & blur-to-clear reveal for agency display headings.
 */
export function KineticHeading({
  as = 'h2',
  id,
  className = '',
  segments,
  immediate = false,
}: KineticHeadingProps) {
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(headingRef, { once: true, amount: 'some' });
  const shouldReveal = immediate || inView;
  const Tag = as;

  if (reducedMotion) {
    return (
      <Tag id={id} className={className}>
        {segments.map((seg, sIdx) => (
          <Fragment key={sIdx}>
            {sIdx > 0 && ' '}
            {seg.highlight ? (
              <span
                className={`${seg.highlightStyle ? 'italic font-extrabold' : 'heading-em'} ${
                  seg.underlineAccent ? 'relative inline-block pb-1' : ''
                }`}
                style={seg.highlightStyle}
              >
                {seg.text}
                {seg.underlineAccent && <CurvedOrangeUnderline animateStroke={false} />}
              </span>
            ) : (
              seg.text
            )}
          </Fragment>
        ))}
      </Tag>
    );
  }

  let runningIndex = 0;

  return (
    <Tag ref={headingRef} id={id} className={className}>
      {segments.map((seg, segIdx) => {
        const words = seg.text.trim().split(/\s+/);
        return (
          <Fragment key={segIdx}>
            {segIdx > 0 && ' '}
            {seg.highlight ? (
              <span
                className={`${seg.highlightStyle ? 'italic font-extrabold' : 'heading-em'} ${
                  seg.underlineAccent ? 'relative inline-block pb-1' : 'inline'
                }`}
                style={seg.highlightStyle}
              >
                {words.map((word, wIdx) => {
                  const idx = runningIndex++;
                  return (
                    <Fragment key={wIdx}>
                      {wIdx > 0 && ' '}
                      <motion.span
                        className="inline-block"
                        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                        animate={
                          shouldReveal
                            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                            : { opacity: 0, y: 12, filter: 'blur(4px)' }
                        }
                        transition={{
                          duration: 0.36,
                          delay: idx * 0.03,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {word}
                      </motion.span>
                    </Fragment>
                  );
                })}
                {seg.underlineAccent && <CurvedOrangeUnderline animateStroke />}
              </span>
            ) : (
              words.map((word, wIdx) => {
                const idx = runningIndex++;
                return (
                  <Fragment key={wIdx}>
                    {wIdx > 0 && ' '}
                    <motion.span
                      className="inline-block"
                      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                      animate={
                        shouldReveal
                          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                          : { opacity: 0, y: 12, filter: 'blur(4px)' }
                      }
                      transition={{
                        duration: 0.36,
                        delay: idx * 0.03,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {word}
                    </motion.span>
                  </Fragment>
                );
              })
            )}
          </Fragment>
        );
      })}
    </Tag>
  );
}

interface SpringAudioVisualizerProps {
  active: boolean;
  barCount?: number;
  tone?: 'light' | 'dark';
}

const BAR_PROFILES = [0.42, 0.78, 0.56, 0.96, 0.68, 0.88, 0.5, 0.82, 0.45, 0.72, 0.6, 0.86];

/**
 * Dynamic spring-animated audio bar visualizer for video & voiceover players.
 */
export function SpringAudioVisualizer({
  active,
  barCount = 9,
  tone = 'dark',
}: SpringAudioVisualizerProps) {
  const reducedMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % 100);
    }, 170);
    return () => window.clearInterval(id);
  }, [active, reducedMotion]);

  const barColor = tone === 'dark' ? 'bg-[#A9BFA3]' : 'bg-[#F26B1D]';

  return (
    <div className="inline-flex items-end gap-1 h-7" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => {
        const base = BAR_PROFILES[i % BAR_PROFILES.length];
        const wave = active && !reducedMotion
          ? 0.32 + 0.68 * Math.abs(Math.sin(tick * 0.65 + i * 0.9))
          : base * 0.55;

        return (
          <motion.span
            key={i}
            className={`w-1 rounded-full ${barColor} ${active ? 'opacity-95' : 'opacity-60'}`}
            style={{ height: '100%', transformOrigin: 'bottom' }}
            animate={{ scaleY: wave }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 18,
              mass: 0.35,
            }}
          />
        );
      })}
    </div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  offsetY?: number;
  threshold?: number;
  rootMargin?: string;
  testId?: string;
}

/**
 * Subtle IntersectionObserver-triggered fade-in and slide-up reveal wrapper.
 */
export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  offsetY = REVEAL_DEFAULTS.offsetY,
  threshold = REVEAL_DEFAULTS.threshold,
  rootMargin = REVEAL_DEFAULTS.rootMargin,
  testId,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const initialRect = node.getBoundingClientRect();
    if (shouldImmediateReveal(initialRect, window.innerHeight)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= 0) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin, threshold]);

  const isRevealed = reducedMotion || visible;
  const style = buildRevealStyle({
    visible: isRevealed,
    offsetY,
    delayMs,
    reducedMotion,
  });

  return (
    <div
      ref={ref}
      data-testid={testId}
      data-revealed={isRevealed ? 'true' : 'false'}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}
