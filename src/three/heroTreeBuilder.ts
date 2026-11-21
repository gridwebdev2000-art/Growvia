import * as THREE from 'three';
import { groundHeightAt, seededNoise } from './heroSceneLogic';
import type { HeroProceduralTextures } from './proceduralTextures';

export interface FloatingLeafState {
  basePos: THREE.Vector3;
  orbitRadius: number;
  speed: number;
  phase: number;
  rotSpeedX: number;
  rotSpeedY: number;
  scale: number;
}

export interface SunMoteState {
  basePos: THREE.Vector3;
  speed: number;
  phase: number;
  scale: number;
}

export interface HeroTreeSceneObjects {
  rootGroup: THREE.Group;
  treeGroup: THREE.Group;
  meadowMat: THREE.MeshStandardMaterial;
  grassUniforms: { uTime: { value: number }; uWind: { value: number } };
  leafUniforms: { uTime: { value: number }; uWind: { value: number } };
  floatingLeavesMesh: THREE.InstancedMesh;
  floatingLeafStates: FloatingLeafState[];
  sunMotesMesh: THREE.InstancedMesh;
  sunMoteStates: SunMoteState[];
  horizonPlaneMat: THREE.MeshStandardMaterial;
  setShadowsEnabled: (enabled: boolean) => void;
}

interface BranchTip {
  pos: THREE.Vector3;
  radius: number;
  colorTint: number;
}

/**
 * Generates an organically tapered wooden branch around a CatmullRom spline.
 */
function buildTaperedBranchGeometry(
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radialSegments: number,
  radiusStart: number,
  radiusEnd: number
): THREE.BufferGeometry {
  const geom = new THREE.TubeGeometry(curve, tubularSegments, 1, radialSegments, false);
  const posAttr = geom.attributes.position;
  const ringCount = radialSegments + 1;

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const center = curve.getPointAt(t);
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, Math.pow(t, 0.85));

    for (let j = 0; j < ringCount; j++) {
      const idx = i * ringCount + j;
      const vx = posAttr.getX(idx) - center.x;
      const vy = posAttr.getY(idx) - center.y;
      const vz = posAttr.getZ(idx) - center.z;
      const organicFlute = 1 + 0.08 * Math.sin(j * 2.4 + t * 5.0) * (1 - t);

      posAttr.setXYZ(
        idx,
        center.x + vx * radius * organicFlute,
        center.y + vy * radius * organicFlute,
        center.z + vz * radius * organicFlute
      );
    }
  }
  geom.computeVertexNormals();
  geom.computeTangents();
  return geom;
}

/**
 * Builds the Growvia 3D Botanical Hero Diorama:
 * - Sculpted undulating meadow terrain & moss mound grounded cleanly via groundHeightAt()
 * - Composite multi-part Oak Tree (Lathe root flare + curved root buttresses + primary boughs + twigs + sub-canopy foliage tufts + 780+ instanced veined leaf cards + glossy Growvia citrus fruits)
 * - Natural granite moss boulders, swaying grass blades (custom vertex shader), drifting botanical leaves & sunlit golden pollen motes.
 */
export function buildHeroTreeScene(textures: HeroProceduralTextures): HeroTreeSceneObjects {
  const rootGroup = new THREE.Group();
  const treeGroup = new THREE.Group();
  const shadowCasters: THREE.Object3D[] = [];

  // Shared PBR Materials with crisp roughness & reflectance contrast
  const barkMat = new THREE.MeshStandardMaterial({
    map: textures.barkColor,
    bumpMap: textures.barkBump,
    bumpScale: 0.045,
    roughnessMap: textures.barkRoughness,
    roughness: 0.9,
    metalness: 0.02,
  });

  const twigMat = new THREE.MeshStandardMaterial({
    map: textures.barkColor,
    bumpMap: textures.barkBump,
    bumpScale: 0.025,
    color: new THREE.Color('#6E5238'),
    roughness: 0.84,
    metalness: 0.02,
  });

  const meadowMat = new THREE.MeshStandardMaterial({
    map: textures.mossColor,
    bumpMap: textures.mossBump,
    bumpScale: 0.032,
    color: new THREE.Color('#E3ECD9'),
    roughness: 0.92,
    metalness: 0.0,
  });

  const horizonPlaneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#DDE6D3'),
    roughness: 0.95,
    metalness: 0.0,
  });

  const stoneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#929A8C'),
    bumpMap: textures.stoneBump,
    bumpScale: 0.02,
    roughness: 0.9,
    metalness: 0.04,
  });

  const fruitMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F26B1D'),
    emissive: new THREE.Color('#662100'),
    emissiveIntensity: 0.14,
    roughness: 0.24,
    metalness: 0.02,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18,
  });

  const calyxMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2B4B2F'),
    roughness: 0.72,
    metalness: 0.04,
  });

  const foliageMassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    bumpMap: textures.mossBump,
    bumpScale: 0.035,
    roughness: 0.72,
    metalness: 0.02,
  });

  const leafUniforms = {
    uTime: { value: 0 },
    uWind: { value: 1 },
  };

  const leafCardMat = new THREE.MeshStandardMaterial({
    map: textures.leafColor,
    alphaTest: 0.36,
    side: THREE.DoubleSide,
    roughness: 0.56,
    metalness: 0.02,
  });

  leafCardMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = leafUniforms.uTime;
    shader.uniforms.uWind = leafUniforms.uWind;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uWind;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 worldPivot = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float flutter = sin(uTime * 1.85 + worldPivot.x * 2.1 + worldPivot.y * 1.4 + worldPivot.z * 1.7) * 0.032 * uWind;
        float sway = cos(uTime * 1.1 + worldPivot.z * 0.9) * 0.025 * uWind;
        transformed.x += flutter * (0.4 + uv.y);
        transformed.y += sway * (0.2 + uv.x);`
      );
  };

  // --- PART 1: Unified Continuous Meadow Terrain (Zero Coplanar Z-Fighting) ---
  const terrainGeo = new THREE.PlaneGeometry(54, 54, 110, 110);
  terrainGeo.rotateX(-Math.PI / 2);
  const tPos = terrainGeo.attributes.position;
  const tColors = new Float32Array(tPos.count * 3);
  const innerMoss = new THREE.Color('#476738');
  const midMeadow = new THREE.Color('#7B9762');
  const outerHorizon = new THREE.Color('#CFD9C3');
  const cTmp = new THREE.Color();

  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i);
    const z = tPos.getZ(i);
    tPos.setY(i, groundHeightAt(x, z));

    const r = Math.sqrt(x * x + z * z);
    const tInner = THREE.MathUtils.smoothstep(r, 0.9, 3.3);
    const tOuter = THREE.MathUtils.smoothstep(r, 3.0, 7.2);
    cTmp.copy(innerMoss).lerp(midMeadow, tInner).lerp(outerHorizon, tOuter);
    tColors[i * 3] = cTmp.r;
    tColors[i * 3 + 1] = cTmp.g;
    tColors[i * 3 + 2] = cTmp.b;
  }
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(tColors, 3));
  terrainGeo.computeVertexNormals();
  terrainGeo.computeBoundingSphere();

  horizonPlaneMat.vertexColors = true;
  horizonPlaneMat.map = textures.mossColor;
  horizonPlaneMat.bumpMap = textures.mossBump;
  horizonPlaneMat.bumpScale = 0.025;
  horizonPlaneMat.color.setHex(0xffffff);

  const terrainMesh = new THREE.Mesh(terrainGeo, horizonPlaneMat);
  terrainMesh.receiveShadow = true;
  rootGroup.add(terrainMesh);

  // Soft radial contact shadow decal flush under trunk root flare with polygonOffset
  const treeBaseY = groundHeightAt(0, 0);
  const trunkContactGeo = new THREE.PlaneGeometry(5.2, 5.2);
  trunkContactGeo.rotateX(-Math.PI / 2);
  const trunkContactMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const trunkContactShadow = new THREE.Mesh(trunkContactGeo, trunkContactMat);
  trunkContactShadow.position.set(0, treeBaseY + 0.028, 0);
  rootGroup.add(trunkContactShadow);

  // --- PART 2: Composite Sculpted Oak Trunk + Flared Root Buttresses + Branches ---
  treeGroup.position.set(0, treeBaseY - 0.025, 0);
  rootGroup.add(treeGroup);

  // Flared root collar sculpted with LatheGeometry (swap UV axes so vertical bark matches TubeGeometry)
  const collarPoints: THREE.Vector2[] = [
    new THREE.Vector2(0.76, 0.0),
    new THREE.Vector2(0.56, 0.14),
    new THREE.Vector2(0.39, 0.36),
    new THREE.Vector2(0.30, 0.65),
    new THREE.Vector2(0.25, 0.96),
  ];
  const collarGeo = new THREE.LatheGeometry(collarPoints, 24);
  const collarPos = collarGeo.attributes.position;
  const collarUv = collarGeo.attributes.uv;
  for (let i = 0; i < collarPos.count; i++) {
    const vx = collarPos.getX(i);
    const vy = collarPos.getY(i);
    const vz = collarPos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const flare = 1 + 0.24 * Math.sin(angle * 5 + vy * 1.4) * Math.max(0, 1 - vy * 1.1);
    collarPos.setXYZ(i, vx * flare, vy, vz * flare);
    const uOrig = collarUv.getX(i);
    const vOrig = collarUv.getY(i);
    collarUv.setXY(i, vOrig * 0.8, uOrig * 2.0);
  }
  collarGeo.computeVertexNormals();
  collarGeo.computeTangents();
  const collarMesh = new THREE.Mesh(collarGeo, barkMat);
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  treeGroup.add(collarMesh);
  shadowCasters.push(collarMesh);

  // 5 Spreading Root Buttresses curving naturally into the mossy earth
  for (let r = 0; r < 5; r++) {
    const angle = (r / 5) * Math.PI * 2 + 0.32 + seededNoise(r * 7) * 0.35;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const reach = 0.88 + seededNoise(r * 13) * 0.34;
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(dx * 0.22, 0.42, dz * 0.22),
      new THREE.Vector3(dx * (reach * 0.56), 0.18, dz * (reach * 0.56)),
      new THREE.Vector3(dx * reach, -0.02, dz * reach),
    ]);
    const rootGeo = buildTaperedBranchGeometry(rootCurve, 12, 8, 0.14, 0.035);
    const rootMesh = new THREE.Mesh(rootGeo, barkMat);
    rootMesh.castShadow = true;
    rootMesh.receiveShadow = true;
    treeGroup.add(rootMesh);
    shadowCasters.push(rootMesh);
  }

  // Sculpted Primary Oak Trunk (smooth slight botanical lean)
  const mainTrunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.25, 0),
    new THREE.Vector3(-0.04, 1.05, 0.04),
    new THREE.Vector3(0.06, 1.85, -0.03),
    new THREE.Vector3(0.02, 2.48, 0.02),
  ]);
  const mainTrunkGeo = buildTaperedBranchGeometry(mainTrunkCurve, 20, 14, 0.32, 0.17);
  const mainTrunkMesh = new THREE.Mesh(mainTrunkGeo, barkMat);
  mainTrunkMesh.castShadow = true;
  mainTrunkMesh.receiveShadow = true;
  treeGroup.add(mainTrunkMesh);
  shadowCasters.push(mainTrunkMesh);

  // 5 Primary Forked Boughs + Secondary Sub-branches collecting Canopy Lobe Anchor Tips
  const boughSpecs = [
    { startY: 1.72, dirAngle: 0.45, reach: 1.48, lift: 1.55, rStart: 0.145, colorTint: 0 },
    { startY: 1.84, dirAngle: 1.75, reach: 1.56, lift: 1.48, rStart: 0.14, colorTint: 1 },
    { startY: 1.95, dirAngle: 3.05, reach: 1.45, lift: 1.62, rStart: 0.135, colorTint: 2 },
    { startY: 2.02, dirAngle: 4.35, reach: 1.52, lift: 1.50, rStart: 0.14, colorTint: 0 },
    { startY: 2.18, dirAngle: 5.55, reach: 1.15, lift: 1.88, rStart: 0.13, colorTint: 1 },
  ];

  const canopyTips: BranchTip[] = [
    { pos: new THREE.Vector3(0.04, 3.88, 0.0), radius: 1.12, colorTint: 1 },
    { pos: new THREE.Vector3(-0.22, 3.55, 0.38), radius: 0.94, colorTint: 0 },
    { pos: new THREE.Vector3(0.32, 3.52, -0.34), radius: 0.96, colorTint: 2 },
  ];

  boughSpecs.forEach((b, bIdx) => {
    const bx = Math.cos(b.dirAngle);
    const bz = Math.sin(b.dirAngle);
    const midPos = new THREE.Vector3(bx * b.reach * 0.52, b.startY + b.lift * 0.56, bz * b.reach * 0.52);
    const endPos = new THREE.Vector3(bx * b.reach, b.startY + b.lift, bz * b.reach);

    const boughCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(bx * 0.06, b.startY, bz * 0.06),
      midPos,
      endPos,
    ]);
    const boughGeo = buildTaperedBranchGeometry(boughCurve, 14, 10, b.rStart, 0.055);
    const boughMesh = new THREE.Mesh(boughGeo, barkMat);
    boughMesh.castShadow = true;
    boughMesh.receiveShadow = true;
    treeGroup.add(boughMesh);
    shadowCasters.push(boughMesh);

    canopyTips.push({ pos: endPos.clone(), radius: 0.92, colorTint: b.colorTint });

    // Two secondary forked twigs off each primary bough
    for (let s = 0; s < 2; s++) {
      const subAngle = b.dirAngle + (s === 0 ? -0.58 : 0.62);
      const sx = Math.cos(subAngle);
      const sz = Math.sin(subAngle);
      const origin = s === 0 ? midPos : endPos.clone().lerp(midPos, 0.35);
      const twigReach = 0.72 + seededNoise(bIdx * 11 + s) * 0.38;
      const twigTip = new THREE.Vector3(
        origin.x + sx * twigReach,
        origin.y + 0.45 + seededNoise(bIdx * 5 + s) * 0.35,
        origin.z + sz * twigReach
      );
      const twigCurve = new THREE.CatmullRomCurve3([
        origin,
        origin.clone().lerp(twigTip, 0.5).add(new THREE.Vector3(0, 0.14, 0)),
        twigTip,
      ]);
      const twigGeo = buildTaperedBranchGeometry(twigCurve, 9, 6, 0.062, 0.022);
      const twigMesh = new THREE.Mesh(twigGeo, twigMat);
      twigMesh.castShadow = true;
      treeGroup.add(twigMesh);
      shadowCasters.push(twigMesh);

      canopyTips.push({
        pos: twigTip,
        radius: 0.72 + seededNoise(bIdx * 17 + s) * 0.22,
        colorTint: (b.colorTint + s) % 3,
      });
    }
  });

  // --- PART 3: Layered Botanical Canopy Masses & 1,350 Instanced Veined Leaf Cards ---
  const foliageSphereGeo = new THREE.SphereGeometry(0.52, 24, 18);
  // Subtle smooth organic billowing modulation across sphere crown lobes (zero jagged facets)
  const fPos = foliageSphereGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const vx = fPos.getX(i);
    const vy = fPos.getY(i);
    const vz = fPos.getZ(i);
    const bump = 1 + 0.1 * Math.sin(vx * 5.0 + vy * 3.8) * Math.cos(vz * 4.4);
    fPos.setXYZ(i, vx * bump, vy * 0.78 * bump, vz * bump);
  }
  foliageSphereGeo.computeVertexNormals();

  const canopyMassCount = canopyTips.length * 3;
  const canopyMassMesh = new THREE.InstancedMesh(foliageSphereGeo, foliageMassMat, canopyMassCount);
  canopyMassMesh.castShadow = true;
  canopyMassMesh.receiveShadow = true;
  shadowCasters.push(canopyMassMesh);

  const canopyMassPalette = [
    new THREE.Color('#1E472D'), // Deep interior oak shadow
    new THREE.Color('#275936'), // Mid-interior forest foliage
    new THREE.Color('#346B41'), // Shaded olive leaf depth
  ];

  const canopyPalette = [
    new THREE.Color('#2D5E39'), // Deep oak shade
    new THREE.Color('#3F7546'), // Rich mid botanical green
    new THREE.Color('#578D4F'), // Sunlit sage-oak
    new THREE.Color('#75A65E'), // New upper-crown shoots
  ];

  const dummy = new THREE.Object3D();
  const colorScratch = new THREE.Color();
  let massIndex = 0;

  canopyTips.forEach((tip, tIdx) => {
    for (let k = 0; k < 3; k++) {
      const n1 = seededNoise(tIdx * 19 + k * 3 + 1) - 0.5;
      const n2 = seededNoise(tIdx * 23 + k * 7 + 2) - 0.5;
      const n3 = seededNoise(tIdx * 29 + k * 11 + 3) - 0.5;

      dummy.position.set(
        tip.pos.x + n1 * tip.radius * 0.62,
        tip.pos.y + n2 * tip.radius * 0.28,
        tip.pos.z + n3 * tip.radius * 0.62
      );
      dummy.rotation.set(n1 * 0.5, seededNoise(massIndex) * Math.PI * 2, n3 * 0.5);
      // Compact inner volume so smooth spheres sit recessed beneath crisp veined leaf cards
      const s = tip.radius * (0.48 + seededNoise(massIndex * 4.1) * 0.22);
      dummy.scale.set(s * 1.05, s * 0.78, s * 1.05);
      dummy.updateMatrix();
      canopyMassMesh.setMatrixAt(massIndex, dummy.matrix);

      const baseColor = canopyMassPalette[(tip.colorTint + k) % canopyMassPalette.length];
      colorScratch.copy(baseColor).offsetHSL(n1 * 0.015, 0.02, (dummy.position.y - 3.2) * 0.03);
      canopyMassMesh.setColorAt(massIndex, colorScratch);
      massIndex++;
    }
  });
  canopyMassMesh.instanceMatrix.needsUpdate = true;
  if (canopyMassMesh.instanceColor) canopyMassMesh.instanceColor.needsUpdate = true;
  canopyMassMesh.computeBoundingSphere();
  treeGroup.add(canopyMassMesh);

  // Crisp veined botanical leaf cards distributed densely around outer sunlit crown
  const leafCount = 1650;
  const leafCardGeo = new THREE.PlaneGeometry(0.32, 0.36);
  // Subtle natural cup curvature in leaf blade
  const lcPos = leafCardGeo.attributes.position;
  for (let i = 0; i < lcPos.count; i++) {
    const lx = lcPos.getX(i);
    const ly = lcPos.getY(i);
    lcPos.setZ(i, -(lx * lx * 0.85 + ly * ly * 0.32));
  }
  leafCardGeo.computeVertexNormals();

  const canopyLeavesMesh = new THREE.InstancedMesh(leafCardGeo, leafCardMat, leafCount);
  canopyLeavesMesh.castShadow = true;

  for (let i = 0; i < leafCount; i++) {
    const tip = canopyTips[i % canopyTips.length];
    const theta = seededNoise(i * 1.7 + 201) * Math.PI * 2;
    const phi = seededNoise(i * 2.9 + 307) * Math.PI * 0.82;
    const shellR = tip.radius * (0.42 + seededNoise(i * 4.3 + 409) * 0.66);

    dummy.position.set(
      tip.pos.x + Math.sin(phi) * Math.cos(theta) * shellR,
      tip.pos.y + Math.cos(phi) * shellR * 0.72 + 0.06,
      tip.pos.z + Math.sin(phi) * Math.sin(theta) * shellR
    );
    dummy.rotation.set(
      (seededNoise(i * 5.3) - 0.5) * 1.9,
      seededNoise(i * 7.1) * Math.PI * 2,
      (seededNoise(i * 9.7) - 0.5) * 1.8
    );
    const lScale = 0.78 + seededNoise(i * 11.3) * 0.66;
    dummy.scale.setScalar(lScale);
    dummy.updateMatrix();
    canopyLeavesMesh.setMatrixAt(i, dummy.matrix);

    const pColor = canopyPalette[i % canopyPalette.length];
    colorScratch.copy(pColor).offsetHSL(
      (seededNoise(i * 13.7) - 0.5) * 0.04,
      0.04,
      (dummy.position.y - 3.1) * 0.06 + (seededNoise(i * 17.3) - 0.4) * 0.06
    );
    canopyLeavesMesh.setColorAt(i, colorScratch);
  }
  canopyLeavesMesh.instanceMatrix.needsUpdate = true;
  if (canopyLeavesMesh.instanceColor) canopyLeavesMesh.instanceColor.needsUpdate = true;
  canopyLeavesMesh.computeBoundingSphere();
  treeGroup.add(canopyLeavesMesh);

  // --- PART 4: Signature Ripening Growvia Orange Orchard Fruits (Composite Lathe + Calyx) ---
  const fruitPoints = [
    new THREE.Vector2(0.0, -0.095),
    new THREE.Vector2(0.062, -0.078),
    new THREE.Vector2(0.092, -0.02),
    new THREE.Vector2(0.088, 0.045),
    new THREE.Vector2(0.052, 0.084),
    new THREE.Vector2(0.0, 0.092),
  ];
  const fruitGeo = new THREE.LatheGeometry(fruitPoints, 16);
  fruitGeo.computeVertexNormals();
  const calyxGeo = new THREE.ConeGeometry(0.036, 0.03, 5);

  const fruitCount = 16;
  const fruitsMesh = new THREE.InstancedMesh(fruitGeo, fruitMat, fruitCount);
  const calyxMesh = new THREE.InstancedMesh(calyxGeo, calyxMat, fruitCount);
  fruitsMesh.castShadow = true;
  shadowCasters.push(fruitsMesh);

  for (let i = 0; i < fruitCount; i++) {
    const tip = canopyTips[(i * 3 + 2) % canopyTips.length];
    const ang = seededNoise(i * 19.3 + 77) * Math.PI * 2;
    const rad = tip.radius * (0.55 + seededNoise(i * 23.1) * 0.3);
    const fx = tip.pos.x + Math.cos(ang) * rad;
    const fy = tip.pos.y - 0.14 + (seededNoise(i * 29.7) - 0.5) * 0.42;
    const fz = tip.pos.z + Math.sin(ang) * rad;
    const fScale = 0.85 + seededNoise(i * 31.3) * 0.35;

    dummy.position.set(fx, fy, fz);
    dummy.rotation.set((seededNoise(i) - 0.5) * 0.3, ang, (seededNoise(i + 5) - 0.5) * 0.3);
    dummy.scale.setScalar(fScale);
    dummy.updateMatrix();
    fruitsMesh.setMatrixAt(i, dummy.matrix);

    dummy.position.set(fx, fy + 0.092 * fScale, fz);
    dummy.rotation.set(0, ang, 0);
    dummy.updateMatrix();
    calyxMesh.setMatrixAt(i, dummy.matrix);
  }
  fruitsMesh.instanceMatrix.needsUpdate = true;
  calyxMesh.instanceMatrix.needsUpdate = true;
  fruitsMesh.computeBoundingSphere();
  calyxMesh.computeBoundingSphere();
  treeGroup.add(fruitsMesh);
  treeGroup.add(calyxMesh);

  // --- PART 5: Grounded River-Stone Moss Boulders (spatial hash keeps non-indexed vertices watertight) ---
  const rockGeo = new THREE.DodecahedronGeometry(0.28, 2);
  const rPos = rockGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const vx = rPos.getX(i);
    const vy = rPos.getY(i);
    const vz = rPos.getZ(i);
    const spatialKey =
      Math.round(vx * 40) * 13.7 + Math.round(vy * 40) * 29.3 + Math.round(vz * 40) * 47.1;
    const jitter = 0.88 + seededNoise(spatialKey) * 0.24;
    rPos.setXYZ(i, vx * jitter * 1.18, vy * jitter * 0.68, vz * jitter);
  }
  rockGeo.computeVertexNormals();

  const rockCount = 12;
  const rocksMesh = new THREE.InstancedMesh(rockGeo, stoneMat, rockCount);
  rocksMesh.castShadow = true;
  rocksMesh.receiveShadow = true;
  shadowCasters.push(rocksMesh);

  for (let i = 0; i < rockCount; i++) {
    const a = (i / rockCount) * Math.PI * 2 + seededNoise(i * 9.1) * 0.4;
    const d = 1.05 + seededNoise(i * 15.3) * 1.95;
    const rx = Math.cos(a) * d;
    const rz = Math.sin(a) * d;
    const ry = groundHeightAt(rx, rz);
    const rScale = 0.54 + seededNoise(i * 21.7) * 0.78;

    dummy.position.set(rx, ry + 0.05 * rScale, rz);
    dummy.rotation.set(seededNoise(i * 3) * 0.4, seededNoise(i * 5) * Math.PI * 2, seededNoise(i * 7) * 0.4);
    dummy.scale.set(rScale * 1.1, rScale * 0.78, rScale);
    dummy.updateMatrix();
    rocksMesh.setMatrixAt(i, dummy.matrix);

    colorScratch.setHex(0x8c9788).offsetHSL(0, 0, (seededNoise(i * 11) - 0.5) * 0.12);
    rocksMesh.setColorAt(i, colorScratch);
  }
  rocksMesh.instanceMatrix.needsUpdate = true;
  if (rocksMesh.instanceColor) rocksMesh.instanceColor.needsUpdate = true;
  rocksMesh.computeBoundingSphere();
  rootGroup.add(rocksMesh);

  // --- PART 6: Instanced Meadow Grass Blades with Custom PBR Wind Sway Shader ---
  const grassUniforms = {
    uTime: { value: 0 },
    uWind: { value: 1 },
  };
  const bladeGeo = new THREE.PlaneGeometry(0.052, 0.28, 1, 3);
  bladeGeo.translate(0, 0.14, 0);
  // Clamp yRatio strictly to [0, 1] so Math.pow never produces NaN from tiny negative floats
  const bPos = bladeGeo.attributes.position;
  for (let i = 0; i < bPos.count; i++) {
    const yRatio = THREE.MathUtils.clamp(bPos.getY(i) / 0.28, 0, 1);
    bPos.setX(i, bPos.getX(i) * (1 - Math.pow(yRatio, 1.35)));
    bPos.setZ(i, Math.pow(yRatio, 1.8) * 0.045);
  }
  bladeGeo.computeVertexNormals();
  bladeGeo.computeBoundingSphere();

  const grassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    side: THREE.DoubleSide,
    roughness: 0.74,
    metalness: 0.0,
  });

  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = grassUniforms.uTime;
    shader.uniforms.uWind = grassUniforms.uWind;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uWind;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 worldBase = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float tipWeight = clamp(position.y / 0.28, 0.0, 1.0);
        float breeze = sin(uTime * 2.1 + worldBase.x * 1.45 + worldBase.z * 1.1) * 0.072 * uWind;
        float gust = cos(uTime * 1.35 - worldBase.x * 0.7 + worldBase.z * 0.9) * 0.032 * uWind;
        transformed.x += (breeze + gust) * tipWeight * tipWeight;
        transformed.z += gust * 0.55 * tipWeight * tipWeight;`
      );
  };

  const grassCount = 540;
  const grassMesh = new THREE.InstancedMesh(bladeGeo, grassMat, grassCount);
  grassMesh.receiveShadow = true;

  for (let i = 0; i < grassCount; i++) {
    const angle = seededNoise(i * 4.7 + 12) * Math.PI * 2;
    const rad = 0.45 + Math.pow(seededNoise(i * 6.3 + 34), 0.8) * 2.45;
    const gx = Math.cos(angle) * rad;
    const gz = Math.sin(angle) * rad;
    const gy = groundHeightAt(gx, gz);

    dummy.position.set(gx, gy - 0.015, gz);
    dummy.rotation.set(
      (seededNoise(i * 2.1) - 0.5) * 0.24,
      seededNoise(i * 8.9) * Math.PI * 2,
      (seededNoise(i * 3.3) - 0.5) * 0.24
    );
    const heightScale = 0.65 + seededNoise(i * 5.7) * 0.7;
    dummy.scale.set(0.85 + seededNoise(i) * 0.35, heightScale, 1);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);

    const tone = i % 3 === 0 ? '#3F6A37' : i % 3 === 1 ? '#527E45' : '#6A9252';
    colorScratch.set(tone).offsetHSL(0, 0, (seededNoise(i * 11.7) - 0.5) * 0.04);
    grassMesh.setColorAt(i, colorScratch);
  }
  grassMesh.instanceMatrix.needsUpdate = true;
  if (grassMesh.instanceColor) grassMesh.instanceColor.needsUpdate = true;
  grassMesh.computeBoundingSphere();
  rootGroup.add(grassMesh);

  // --- PART 7: Drifting Aerial Leaves + Sunbeam Pollen Motes (Instanced & Zero-GC Animated) ---
  const floatingLeafGeo = leafCardGeo.clone();
  const floatingLeafMat = new THREE.MeshStandardMaterial({
    map: textures.leafColor,
    alphaTest: 0.36,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.05,
  });

  const floatingCount = 22;
  const floatingLeavesMesh = new THREE.InstancedMesh(floatingLeafGeo, floatingLeafMat, floatingCount);
  floatingLeavesMesh.frustumCulled = false;
  floatingLeavesMesh.castShadow = true;
  shadowCasters.push(floatingLeavesMesh);

  const floatingLeafStates: FloatingLeafState[] = [];
  for (let i = 0; i < floatingCount; i++) {
    const a = (i / floatingCount) * Math.PI * 2;
    const r = 1.65 + seededNoise(i * 13.1) * 2.25;
    const y = 1.15 + seededNoise(i * 17.7) * 2.95;
    const scale = 0.48 + seededNoise(i * 19.3) * 0.42;
    floatingLeafStates.push({
      basePos: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
      orbitRadius: 0.25 + seededNoise(i * 7.3) * 0.35,
      speed: 0.38 + seededNoise(i * 11.9) * 0.45,
      phase: seededNoise(i * 23.7) * Math.PI * 2,
      rotSpeedX: 0.5 + seededNoise(i * 3.9) * 0.8,
      rotSpeedY: 0.7 + seededNoise(i * 5.1) * 1.1,
      scale,
    });
    colorScratch.copy(canopyPalette[(i + 1) % canopyPalette.length]);
    floatingLeavesMesh.setColorAt(i, colorScratch);
  }
  if (floatingLeavesMesh.instanceColor) floatingLeavesMesh.instanceColor.needsUpdate = true;
  rootGroup.add(floatingLeavesMesh);

  // Soft sunlit pollen motes floating cleanly around the upper canopy
  const moteGeo = new THREE.IcosahedronGeometry(0.022, 0);
  const moteMat = new THREE.MeshBasicMaterial({
    color: 0xffe9b5,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });
  const moteCount = 34;
  const sunMotesMesh = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
  sunMotesMesh.frustumCulled = false;

  const sunMoteStates: SunMoteState[] = [];
  for (let i = 0; i < moteCount; i++) {
    const a = seededNoise(i * 3.7 + 10) * Math.PI * 2;
    const r = 0.8 + seededNoise(i * 6.9 + 20) * 3.2;
    const y = 0.7 + seededNoise(i * 9.3 + 30) * 3.8;
    sunMoteStates.push({
      basePos: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
      speed: 0.35 + seededNoise(i * 12.1) * 0.4,
      phase: seededNoise(i * 15.7) * Math.PI * 2,
      scale: 0.65 + seededNoise(i * 18.3) * 0.85,
    });
  }
  rootGroup.add(sunMotesMesh);

  return {
    rootGroup,
    treeGroup,
    meadowMat,
    grassUniforms,
    leafUniforms,
    floatingLeavesMesh,
    floatingLeafStates,
    sunMotesMesh,
    sunMoteStates,
    horizonPlaneMat,
    setShadowsEnabled: (enabled: boolean) => {
      for (const obj of shadowCasters) {
        obj.castShadow = enabled;
      }
      canopyLeavesMesh.castShadow = enabled;
    },
  };
}
