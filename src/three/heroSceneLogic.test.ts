import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_CAMERA_PRESETS,
  HERO_LIGHTING_MOODS,
  computeResponsiveTargetX,
  detectSoftwareRenderer,
  expDampAlpha,
  groundHeightAt,
  seededNoise,
} from './heroSceneLogic';

test('groundHeightAt peaks smoothly beneath the root collar and stays continuous across distance', () => {
  const centerY = groundHeightAt(0, 0);
  const edgeY = groundHeightAt(2.8, 0);
  assert.ok(centerY > edgeY, 'Mound center should sit cleanly higher than outer meadow');
  assert.ok(Math.abs(centerY - 0.24) < 0.001);
  assert.ok(Number.isFinite(groundHeightAt(12, -9)));
});

test('detectSoftwareRenderer identifies CPU rasterizers via GPU string only', () => {
  assert.equal(detectSoftwareRenderer('Google SwiftShader'), true);
  assert.equal(detectSoftwareRenderer('llvmpipe (LLVM 15.0.6, 256 bits)'), true);
  assert.equal(detectSoftwareRenderer('Microsoft Basic Render Driver'), true);
  assert.equal(detectSoftwareRenderer('ANGLE (Apple, Apple M3 Pro, OpenGL 4.1)'), false);
  assert.equal(detectSoftwareRenderer('NVIDIA GeForce RTX 4070/PCIe/SSE2'), false);
});

test('computeResponsiveTargetX frames hero tree on right visual stage only on desktop wide layouts', () => {
  assert.ok(computeResponsiveTargetX(1440, 'hero') < -1.2);
  assert.ok(computeResponsiveTargetX(1080, 'hero') < -1.0);
  assert.equal(computeResponsiveTargetX(390, 'hero'), 0);
  assert.equal(computeResponsiveTargetX(1440, 'canopy'), 0);
  assert.equal(computeResponsiveTargetX(1440, 'roots'), 0);
});

test('expDampAlpha clamps invalid dt safely and approaches 1 cleanly', () => {
  assert.equal(expDampAlpha(6, 0), 0);
  const a16 = expDampAlpha(8, 1 / 60);
  assert.ok(a16 > 0.1 && a16 < 0.2);
  const clamped = expDampAlpha(8, 5);
  assert.equal(clamped, expDampAlpha(8, 0.1));
});

test('all camera presets and lighting moods have valid finite bounds', () => {
  for (const preset of Object.values(HERO_CAMERA_PRESETS)) {
    assert.ok(preset.fov >= 25 && preset.fov <= 60);
    assert.ok(Number.isFinite(preset.position.x + preset.position.y + preset.position.z));
  }
  for (const mood of Object.values(HERO_LIGHTING_MOODS)) {
    assert.ok(mood.keyIntensity > 0 && mood.fillIntensity > 0);
    assert.ok(mood.fogDensity > 0 && mood.fogDensity < 0.1);
  }
  const n = seededNoise(42);
  assert.ok(n >= 0 && n < 1);
});
