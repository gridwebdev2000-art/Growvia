import * as THREE from 'three';
import { seededNoise } from './heroSceneLogic';

export interface HeroProceduralTextures {
  barkColor: THREE.CanvasTexture;
  barkBump: THREE.CanvasTexture;
  barkRoughness: THREE.CanvasTexture;
  mossColor: THREE.CanvasTexture;
  mossBump: THREE.CanvasTexture;
  leafColor: THREE.CanvasTexture;
  stoneBump: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D procedural texture context');
  }
  return [canvas, ctx];
}

function configureTexture(
  canvas: HTMLCanvasElement,
  options: { srgb: boolean; repeatX?: number; repeatY?: number; maxAnisotropy: number }
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = options.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (options.repeatX !== undefined && options.repeatY !== undefined) {
    tex.repeat.set(options.repeatX, options.repeatY);
  }
  tex.anisotropy = Math.min(8, Math.max(1, options.maxAnisotropy));
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates procedural PBR maps in browser memory (zero external network fetches).
 */
export function createHeroProceduralTextures(maxAnisotropy: number): HeroProceduralTextures {
  // 1. Furrowed Oak Bark Color + Bump + Roughness (512x512 seamless)
  const [barkC, barkCtx] = makeCanvas(512, 512);
  const [barkBumpC, barkBumpCtx] = makeCanvas(512, 512);
  const [barkRoughC, barkRoughCtx] = makeCanvas(512, 512);

  barkCtx.fillStyle = '#5B402A';
  barkCtx.fillRect(0, 0, 512, 512);
  barkBumpCtx.fillStyle = '#808080';
  barkBumpCtx.fillRect(0, 0, 512, 512);
  barkRoughCtx.fillStyle = '#D8D8D8';
  barkRoughCtx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 360; i++) {
    const x = seededNoise(i * 3.1 + 1) * 512;
    const y = seededNoise(i * 5.7 + 2) * 512;
    // TubeGeometry maps uv.x along branch length and uv.y around circumference
    const lengthSpan = 46 + seededNoise(i * 11.9) * 165;
    const widthSpan = 3.5 + seededNoise(i * 7.3) * 11;
    const isCrevice = i % 3 === 0;

    barkCtx.fillStyle = isCrevice
      ? 'rgba(38, 24, 14, 0.62)'
      : i % 5 === 0
      ? 'rgba(122, 95, 67, 0.36)'
      : 'rgba(102, 74, 50, 0.42)';
    barkCtx.beginPath();
    barkCtx.ellipse(x, y, lengthSpan * 0.5, widthSpan * 0.5, (seededNoise(i) - 0.5) * 0.1, 0, Math.PI * 2);
    barkCtx.fill();

    barkBumpCtx.fillStyle = isCrevice ? 'rgba(24, 24, 24, 0.75)' : 'rgba(218, 218, 218, 0.44)';
    barkBumpCtx.beginPath();
    barkBumpCtx.ellipse(x, y, lengthSpan * 0.5, widthSpan * 0.48, 0, 0, Math.PI * 2);
    barkBumpCtx.fill();

    barkRoughCtx.fillStyle = isCrevice ? 'rgba(248, 248, 248, 0.65)' : 'rgba(178, 178, 178, 0.4)';
    barkRoughCtx.fillRect(x - lengthSpan * 0.4, y - widthSpan * 0.4, lengthSpan * 0.8, widthSpan * 0.8);
  }

  // Subtle lichen/moss flecks clinging to weathered oak grain
  for (let i = 0; i < 65; i++) {
    const x = seededNoise(i * 13.3 + 90) * 512;
    const y = seededNoise(i * 17.1 + 91) * 512;
    const r = 3 + seededNoise(i * 19.7) * 9;
    barkCtx.fillStyle = 'rgba(108, 134, 86, 0.34)';
    barkCtx.beginPath();
    barkCtx.arc(x, y, r, 0, Math.PI * 2);
    barkCtx.fill();
  }

  const barkColor = configureTexture(barkC, { srgb: true, repeatX: 2, repeatY: 3, maxAnisotropy });
  const barkBump = configureTexture(barkBumpC, { srgb: false, repeatX: 2, repeatY: 3, maxAnisotropy });
  const barkRoughness = configureTexture(barkRoughC, { srgb: false, repeatX: 2, repeatY: 3, maxAnisotropy });

  // 2. Loamy Moss & Meadow Ground Map (512x512)
  const [mossC, mossCtx] = makeCanvas(512, 512);
  const [mossBumpC, mossBumpCtx] = makeCanvas(512, 512);

  const grad = mossCtx.createRadialGradient(256, 256, 20, 256, 256, 320);
  grad.addColorStop(0, '#4E6B3E');
  grad.addColorStop(0.55, '#66814E');
  grad.addColorStop(1, '#7B9263');
  mossCtx.fillStyle = grad;
  mossCtx.fillRect(0, 0, 512, 512);

  mossBumpCtx.fillStyle = '#808080';
  mossBumpCtx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 620; i++) {
    const x = seededNoise(i * 2.3 + 31) * 512;
    const y = seededNoise(i * 4.1 + 57) * 512;
    const r = 6 + seededNoise(i * 8.9) * 22;
    const variant = i % 4;
    mossCtx.fillStyle =
      variant === 0
        ? 'rgba(56, 84, 46, 0.14)'
        : variant === 1
        ? 'rgba(128, 149, 98, 0.13)'
        : variant === 2
        ? 'rgba(92, 74, 52, 0.08)'
        : 'rgba(147, 166, 114, 0.12)';
    mossCtx.beginPath();
    mossCtx.arc(x, y, r, 0, Math.PI * 2);
    mossCtx.fill();

    mossBumpCtx.fillStyle = variant % 2 === 0 ? 'rgba(185, 185, 185, 0.18)' : 'rgba(85, 85, 85, 0.18)';
    mossBumpCtx.beginPath();
    mossBumpCtx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    mossBumpCtx.fill();
  }

  const mossColor = configureTexture(mossC, { srgb: true, repeatX: 5, repeatY: 5, maxAnisotropy });
  const mossBump = configureTexture(mossBumpC, { srgb: false, repeatX: 5, repeatY: 5, maxAnisotropy });

  // 3. Botanical Oak Leaf Albedo + Crisp Alpha Card (256x256)
  const [leafC, leafCtx] = makeCanvas(256, 256);
  leafCtx.clearRect(0, 0, 256, 256);

  // Leaf silhouette with delicate organic contour
  const drawLeafShape = () => {
    leafCtx.beginPath();
    leafCtx.moveTo(128, 224);
    leafCtx.bezierCurveTo(64, 202, 42, 138, 66, 76);
    leafCtx.bezierCurveTo(82, 34, 110, 22, 128, 16);
    leafCtx.bezierCurveTo(146, 22, 174, 34, 190, 76);
    leafCtx.bezierCurveTo(214, 138, 192, 202, 128, 224);
    leafCtx.closePath();
  };

  drawLeafShape();
  const leafGrad = leafCtx.createLinearGradient(80, 20, 176, 220);
  leafGrad.addColorStop(0, '#A5C784');
  leafGrad.addColorStop(0.5, '#78A662');
  leafGrad.addColorStop(1, '#4C7A47');
  leafCtx.fillStyle = leafGrad;
  leafCtx.fill();

  // Midrib & lateral veins for crisp close-up canopy realism
  leafCtx.strokeStyle = 'rgba(220, 240, 195, 0.42)';
  leafCtx.lineWidth = 4;
  leafCtx.lineCap = 'round';
  leafCtx.beginPath();
  leafCtx.moveTo(128, 236);
  leafCtx.quadraticCurveTo(126, 128, 128, 24);
  leafCtx.stroke();

  leafCtx.lineWidth = 2;
  for (let v = 0; v < 5; v++) {
    const vy = 62 + v * 30;
    const span = 34 + (v === 2 ? 18 : v === 3 ? 12 : 0);
    leafCtx.beginPath();
    leafCtx.moveTo(128, vy + 10);
    leafCtx.quadraticCurveTo(128 - span * 0.55, vy, 128 - span, vy - 18);
    leafCtx.moveTo(128, vy + 10);
    leafCtx.quadraticCurveTo(128 + span * 0.55, vy, 128 + span, vy - 18);
    leafCtx.stroke();
  }

  const leafColor = new THREE.CanvasTexture(leafC);
  leafColor.colorSpace = THREE.SRGBColorSpace;
  leafColor.anisotropy = Math.min(8, Math.max(1, maxAnisotropy));
  leafColor.needsUpdate = true;

  // 4. Smooth Weathered Limestone/Granite Bump Grain (256x256, zero stippled static)
  const [stoneC, stoneCtx] = makeCanvas(256, 256);
  stoneCtx.fillStyle = '#848484';
  stoneCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 95; i++) {
    const x = seededNoise(i * 3.7 + 5) * 256;
    const y = seededNoise(i * 6.1 + 9) * 256;
    const rx = 12 + seededNoise(i * 9.2) * 32;
    const ry = 8 + seededNoise(i * 11.4) * 22;
    stoneCtx.fillStyle = i % 2 === 0 ? 'rgba(175,175,175,0.12)' : 'rgba(65,65,65,0.12)';
    stoneCtx.beginPath();
    stoneCtx.ellipse(x, y, rx, ry, seededNoise(i) * Math.PI, 0, Math.PI * 2);
    stoneCtx.fill();
  }
  const stoneBump = configureTexture(stoneC, { srgb: false, repeatX: 1, repeatY: 1, maxAnisotropy });

  // 5. Soft Radial Contact Shadow Decal (256x256)
  const [shadowC, shadowCtx] = makeCanvas(256, 256);
  const sGrad = shadowCtx.createRadialGradient(128, 128, 12, 128, 128, 126);
  sGrad.addColorStop(0, 'rgba(14, 28, 18, 0.72)');
  sGrad.addColorStop(0.45, 'rgba(18, 34, 22, 0.36)');
  sGrad.addColorStop(0.78, 'rgba(20, 36, 24, 0.08)');
  sGrad.addColorStop(1, 'rgba(20, 36, 24, 0)');
  shadowCtx.fillStyle = sGrad;
  shadowCtx.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(shadowC);
  contactShadow.colorSpace = THREE.SRGBColorSpace;
  contactShadow.needsUpdate = true;

  return {
    barkColor,
    barkBump,
    barkRoughness,
    mossColor,
    mossBump,
    leafColor,
    stoneBump,
    contactShadow,
    dispose: () => {
      barkColor.dispose();
      barkBump.dispose();
      barkRoughness.dispose();
      mossColor.dispose();
      mossBump.dispose();
      leafColor.dispose();
      stoneBump.dispose();
      contactShadow.dispose();
    },
  };
}
