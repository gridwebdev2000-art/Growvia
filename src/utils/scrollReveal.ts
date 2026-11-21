import type { CSSProperties } from 'react';

export const REVEAL_DEFAULTS = {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px',
  offsetY: 22,
  durationMs: 560,
  staggerMs: 80,
  maxDelayMs: 240,
} as const;

export interface RevealStyleInput {
  visible: boolean;
  offsetY?: number;
  durationMs?: number;
  delayMs?: number;
  reducedMotion?: boolean;
}

export function computeRevealDelayMs(
  index: number,
  staggerMs: number = REVEAL_DEFAULTS.staggerMs,
  maxDelayMs: number = REVEAL_DEFAULTS.maxDelayMs
): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  return Math.min(maxDelayMs, Math.round(index * staggerMs));
}

export function shouldImmediateReveal(
  rect: Pick<DOMRect, 'top' | 'bottom'>,
  viewportHeight: number
): boolean {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return true;
  // Already visible inside viewport OR scrolled past above current viewport
  return rect.top <= viewportHeight * 0.96 || rect.bottom <= 0;
}

export function buildRevealStyle({
  visible,
  offsetY = REVEAL_DEFAULTS.offsetY,
  durationMs = REVEAL_DEFAULTS.durationMs,
  delayMs = 0,
  reducedMotion = false,
}: RevealStyleInput): CSSProperties {
  if (reducedMotion) {
    return {
      opacity: 1,
    };
  }

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${offsetY}px, 0)`,
    transition: `opacity ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
    willChange: visible ? 'auto' : 'opacity, transform',
  };
}
