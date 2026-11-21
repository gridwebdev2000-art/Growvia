export type HeroCameraPresetId = 'hero' | 'canopy' | 'roots' | 'aerial';
export type HeroLightingMoodId = 'morning' | 'golden' | 'emerald';

export interface Vec3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface HeroCameraPreset {
  id: HeroCameraPresetId;
  label: string;
  position: Vec3Tuple;
  target: Vec3Tuple;
  fov: number;
}

export interface HeroLightingMood {
  id: HeroLightingMoodId;
  label: string;
  swatchHex: string;
  skyHex: number;
  fogHex: number;
  fogDensity: number;
  keyColorHex: number;
  keyIntensity: number;
  keyPosition: Vec3Tuple;
  fillSkyHex: number;
  fillGroundHex: number;
  fillIntensity: number;
  rimColorHex: number;
  rimIntensity: number;
  exposure: number;
  isDarkBackdrop: boolean;
}

export const HERO_CAMERA_PRESETS: Record<HeroCameraPresetId, HeroCameraPreset> = {
  hero: {
    id: 'hero',
    label: 'Hero',
    position: { x: 0.55, y: 2.95, z: 13.5 },
    target: { x: 0.0, y: 1.95, z: 0.0 },
    fov: 38,
  },
  canopy: {
    id: 'canopy',
    label: 'Canopy',
    position: { x: 2.65, y: 4.1, z: 5.2 },
    target: { x: 0.0, y: 3.1, z: 0.0 },
    fov: 37,
  },
  roots: {
    id: 'roots',
    label: 'Roots',
    position: { x: -2.05, y: 1.32, z: 4.75 },
    target: { x: 0.0, y: 1.05, z: 0.0 },
    fov: 38,
  },
  aerial: {
    id: 'aerial',
    label: 'Aerial',
    position: { x: 3.25, y: 6.1, z: 6.65 },
    target: { x: 0.0, y: 2.1, z: 0.0 },
    fov: 40,
  },
};

export const HERO_LIGHTING_MOODS: Record<HeroLightingMoodId, HeroLightingMood> = {
  morning: {
    id: 'morning',
    label: 'Morning',
    swatchHex: '#E9ECD9',
    skyHex: 0xf4f0e4,
    fogHex: 0xf2eee1,
    fogDensity: 0.02,
    keyColorHex: 0xfff1d6,
    keyIntensity: 2.65,
    keyPosition: { x: 6.5, y: 9.8, z: 5.8 },
    fillSkyHex: 0xcfe2d8,
    fillGroundHex: 0x5c6d4e,
    fillIntensity: 1.12,
    rimColorHex: 0xd9ecd4,
    rimIntensity: 1.1,
    exposure: 1.08,
    isDarkBackdrop: false,
  },
  golden: {
    id: 'golden',
    label: 'Golden',
    swatchHex: '#F2C086',
    skyHex: 0xf5ead7,
    fogHex: 0xf3e5ce,
    fogDensity: 0.022,
    keyColorHex: 0xffc67d,
    keyIntensity: 2.9,
    keyPosition: { x: -7.5, y: 6.2, z: 5.5 },
    fillSkyHex: 0xd7dde2,
    fillGroundHex: 0x5a4c39,
    fillIntensity: 0.96,
    rimColorHex: 0xffb169,
    rimIntensity: 1.32,
    exposure: 1.1,
    isDarkBackdrop: false,
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    swatchHex: '#1F4D33',
    skyHex: 0x13261b,
    fogHex: 0x13261b,
    fogDensity: 0.024,
    keyColorHex: 0xffdeb0,
    keyIntensity: 2.55,
    keyPosition: { x: 5.8, y: 8.4, z: 5.2 },
    fillSkyHex: 0x5e8f75,
    fillGroundHex: 0x142419,
    fillIntensity: 0.9,
    rimColorHex: 0x9bd39c,
    rimIntensity: 1.45,
    exposure: 1.06,
    isDarkBackdrop: true,
  },
};

export const TREE_MOUND_RADIUS = 3.2;

/**
 * Shared deterministic ground elevation so the tree root collar, moss boulders,
 * contact shadows, and grass blades sit flush on the terrain without floating.
 */
export function groundHeightAt(x: number, z: number): number {
  const distSq = x * x + z * z;
  const dist = Math.sqrt(distSq);
  // Central mossy mound peaks softly around 0.24 under the trunk collar
  const mound = 0.24 * Math.exp(-distSq / (TREE_MOUND_RADIUS * 1.45));
  // Subtle asymmetric organic earth ripples outside the trunk root flare
  const ripple =
    dist > 0.35
      ? (Math.sin(x * 1.15 + z * 0.65) * 0.038 + Math.cos(z * 1.35 - x * 0.5) * 0.028) *
        Math.min(1, (dist - 0.35) / 1.2)
      : 0;
  // Distant rolling meadow hills starting past r = 6.5
  const horizonRidge =
    dist > 6.5 ? Math.sin(x * 0.22 + 0.6) * Math.cos(z * 0.2 - 0.4) * 0.55 * Math.min(1, (dist - 6.5) / 7) : 0;

  return mound + ripple + horizonRidge;
}

/**
 * Classifies GPU renderer strings to detect headless/CPU software WebGL
 * without ever checking navigator.userAgent.
 */
export function detectSoftwareRenderer(rendererString: string): boolean {
  if (!rendererString) return false;
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererString);
}

/**
 * Shifts the camera orbit target toward the left on wide desktop screens so
 * the 3D tree naturally anchors inside the right-hand showcase column while
 * sunlit sky and rolling horizon fill behind the left headline.
 */
export function computeResponsiveTargetX(viewportWidth: number, presetId: HeroCameraPresetId): number {
  if (presetId !== 'hero') {
    return 0;
  }
  if (viewportWidth >= 1280) return -1.96;
  if (viewportWidth >= 1024) return -1.65;
  return 0;
}

/**
 * Frame-rate independent exponential smoothing factor: 1 - exp(-lambda * dt).
 */
export function expDampAlpha(lambda: number, deltaSeconds: number): number {
  const safeDt = Math.max(0, Math.min(deltaSeconds, 0.1));
  return 1 - Math.exp(-lambda * safeDt);
}

export function seededNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
