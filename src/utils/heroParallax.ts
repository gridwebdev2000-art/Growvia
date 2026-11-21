import { clamp01 } from './treeMath';

export interface ParallaxAxisRange {
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
}

export const MAX_SCROLL_VELOCITY = 2400; // px/sec clamp for trackpad/wheel flick bursts
export const VELOCITY_MULTIPLIER_GAIN = 0.55;

export const HERO_PARALLAX_LAYERS = {
  glow: {
    y: [0, 14] as const,
  },
  tree: {
    y: [0, 26] as const,
    scale: [1, 0.982] as const,
  },
  leaves: {
    y: [0, -18] as const,
  },
  cardMeta: {
    x: [0, -7],
    y: [0, -30],
  } satisfies ParallaxAxisRange,
  cardGoogle: {
    x: [0, 9],
    y: [0, -36],
  } satisfies ParallaxAxisRange,
  cardContent: {
    x: [0, -6],
    y: [0, -18],
  } satisfies ParallaxAxisRange,
  cardWebsite: {
    x: [0, 8],
    y: [0, -22],
  } satisfies ParallaxAxisRange,
} as const;

export const HERO_VELOCITY_PROFILES = {
  glow: { weight: 0.2, pushX: 0, pushY: 4 },
  tree: { weight: 0.32, pushX: 0, pushY: 7 },
  leaves: { weight: 0.52, pushX: 0, pushY: -7 },
  cardMeta: { weight: 0.74, pushX: -3, pushY: -9 },
  cardGoogle: { weight: 0.88, pushX: 4, pushY: -11 },
  cardContent: { weight: 0.62, pushX: -2.5, pushY: -6 },
  cardWebsite: { weight: 0.68, pushX: 3.5, pushY: -7.5 },
} as const;

export interface HeroParallaxOffsets {
  glowY: number;
  treeY: number;
  treeScale: number;
  leavesY: number;
  cardMeta: { x: number; y: number };
  cardGoogle: { x: number; y: number };
  cardContent: { x: number; y: number };
  cardWebsite: { x: number; y: number };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function lerp(start: number, end: number, t: number): number {
  return round3(start + (end - start) * t);
}

export function normalizeSignedVelocity(velocityPxPerSec: number): number {
  if (!Number.isFinite(velocityPxPerSec)) return 0;
  const clamped = Math.max(-MAX_SCROLL_VELOCITY, Math.min(MAX_SCROLL_VELOCITY, velocityPxPerSec));
  return clamped / MAX_SCROLL_VELOCITY;
}

export function computeVelocitySpeedMultiplier(
  velocityPxPerSec: number,
  depthWeight: number
): number {
  const speedRatio = Math.abs(normalizeSignedVelocity(velocityPxPerSec));
  return round3(1 + speedRatio * depthWeight * VELOCITY_MULTIPLIER_GAIN);
}

export function computeVelocityAxisOffset(
  baseStart: number,
  baseEnd: number,
  scrollProgress: number,
  velocityPxPerSec: number,
  depthWeight: number,
  velocityPushPx: number
): number {
  const t = clamp01(scrollProgress);
  const base = baseStart + (baseEnd - baseStart) * t;
  const multiplier = computeVelocitySpeedMultiplier(velocityPxPerSec, depthWeight);
  const signedNorm = normalizeSignedVelocity(velocityPxPerSec);
  return round3(base * multiplier + signedNorm * velocityPushPx);
}

export function computeHeroParallaxOffsets(
  rawProgress: number,
  reducedMotion = false,
  velocityPxPerSec = 0
): HeroParallaxOffsets {
  if (reducedMotion) {
    return {
      glowY: 0,
      treeY: 0,
      treeScale: 1,
      leavesY: 0,
      cardMeta: { x: 0, y: 0 },
      cardGoogle: { x: 0, y: 0 },
      cardContent: { x: 0, y: 0 },
      cardWebsite: { x: 0, y: 0 },
    };
  }

  const p = clamp01(rawProgress);
  const v = velocityPxPerSec;

  const treeScaleBoost = Math.abs(normalizeSignedVelocity(v)) * 0.006;

  return {
    glowY: computeVelocityAxisOffset(
      HERO_PARALLAX_LAYERS.glow.y[0],
      HERO_PARALLAX_LAYERS.glow.y[1],
      p,
      v,
      HERO_VELOCITY_PROFILES.glow.weight,
      HERO_VELOCITY_PROFILES.glow.pushY
    ),
    treeY: computeVelocityAxisOffset(
      HERO_PARALLAX_LAYERS.tree.y[0],
      HERO_PARALLAX_LAYERS.tree.y[1],
      p,
      v,
      HERO_VELOCITY_PROFILES.tree.weight,
      HERO_VELOCITY_PROFILES.tree.pushY
    ),
    treeScale: round3(
      lerp(HERO_PARALLAX_LAYERS.tree.scale[0], HERO_PARALLAX_LAYERS.tree.scale[1], p) -
        treeScaleBoost
    ),
    leavesY: computeVelocityAxisOffset(
      HERO_PARALLAX_LAYERS.leaves.y[0],
      HERO_PARALLAX_LAYERS.leaves.y[1],
      p,
      v,
      HERO_VELOCITY_PROFILES.leaves.weight,
      HERO_VELOCITY_PROFILES.leaves.pushY
    ),
    cardMeta: {
      x: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardMeta.x[0],
        HERO_PARALLAX_LAYERS.cardMeta.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardMeta.weight,
        HERO_VELOCITY_PROFILES.cardMeta.pushX
      ),
      y: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardMeta.y[0],
        HERO_PARALLAX_LAYERS.cardMeta.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardMeta.weight,
        HERO_VELOCITY_PROFILES.cardMeta.pushY
      ),
    },
    cardGoogle: {
      x: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardGoogle.x[0],
        HERO_PARALLAX_LAYERS.cardGoogle.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardGoogle.weight,
        HERO_VELOCITY_PROFILES.cardGoogle.pushX
      ),
      y: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardGoogle.y[0],
        HERO_PARALLAX_LAYERS.cardGoogle.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardGoogle.weight,
        HERO_VELOCITY_PROFILES.cardGoogle.pushY
      ),
    },
    cardContent: {
      x: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardContent.x[0],
        HERO_PARALLAX_LAYERS.cardContent.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardContent.weight,
        HERO_VELOCITY_PROFILES.cardContent.pushX
      ),
      y: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardContent.y[0],
        HERO_PARALLAX_LAYERS.cardContent.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardContent.weight,
        HERO_VELOCITY_PROFILES.cardContent.pushY
      ),
    },
    cardWebsite: {
      x: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardWebsite.x[0],
        HERO_PARALLAX_LAYERS.cardWebsite.x[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardWebsite.weight,
        HERO_VELOCITY_PROFILES.cardWebsite.pushX
      ),
      y: computeVelocityAxisOffset(
        HERO_PARALLAX_LAYERS.cardWebsite.y[0],
        HERO_PARALLAX_LAYERS.cardWebsite.y[1],
        p,
        v,
        HERO_VELOCITY_PROFILES.cardWebsite.weight,
        HERO_VELOCITY_PROFILES.cardWebsite.pushY
      ),
    },
  };
}

export const MOBILE_BREAKPOINT_PX = 640;
export const MOBILE_TREE_MIN_VH = 540;
export const MOBILE_TREE_MAX_VH = 900;
export const MOBILE_TREE_MIN_SCALE = 0.68;
export const MOBILE_TREE_MAX_SCALE = 0.96;
export const MOBILE_TREE_MIN_HEIGHT_PX = 165;
export const MOBILE_TREE_MAX_HEIGHT_PX = 270;

export interface MobileTreeViewportLayout {
  isMobile: boolean;
  viewportScale: number;
  maxHeightPx: number | null;
}

export function computeMobileTreeViewportLayout(
  viewportWidth: number,
  viewportHeight: number
): MobileTreeViewportLayout {
  if (
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(viewportHeight) ||
    viewportWidth >= MOBILE_BREAKPOINT_PX
  ) {
    return {
      isMobile: false,
      viewportScale: 1,
      maxHeightPx: null,
    };
  }

  const normalizedHeight = clamp01(
    (viewportHeight - MOBILE_TREE_MIN_VH) / (MOBILE_TREE_MAX_VH - MOBILE_TREE_MIN_VH)
  );

  return {
    isMobile: true,
    viewportScale: round3(
      MOBILE_TREE_MIN_SCALE + (MOBILE_TREE_MAX_SCALE - MOBILE_TREE_MIN_SCALE) * normalizedHeight
    ),
    maxHeightPx: Math.round(
      MOBILE_TREE_MIN_HEIGHT_PX +
        (MOBILE_TREE_MAX_HEIGHT_PX - MOBILE_TREE_MIN_HEIGHT_PX) * normalizedHeight
    ),
  };
}
