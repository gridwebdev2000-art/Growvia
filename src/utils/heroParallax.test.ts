import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_VELOCITY_PROFILES,
  MAX_SCROLL_VELOCITY,
  MOBILE_TREE_MAX_SCALE,
  MOBILE_TREE_MIN_SCALE,
  computeHeroParallaxOffsets,
  computeMobileTreeViewportLayout,
  computeVelocitySpeedMultiplier,
} from './heroParallax';

test('computeHeroParallaxOffsets returns neutral zero offsets at scroll progress 0 when stationary', () => {
  const rest = computeHeroParallaxOffsets(0);
  assert.equal(rest.glowY, 0);
  assert.equal(rest.treeY, 0);
  assert.equal(rest.treeScale, 1);
  assert.equal(rest.leavesY, 0);
  assert.deepEqual(rest.cardMeta, { x: 0, y: 0 });
  assert.deepEqual(rest.cardGoogle, { x: 0, y: 0 });
  assert.deepEqual(rest.cardContent, { x: 0, y: 0 });
  assert.deepEqual(rest.cardWebsite, { x: 0, y: 0 });
});

test('computeHeroParallaxOffsets separates tree and foreground cards smoothly without vertical collisions', () => {
  const mid = computeHeroParallaxOffsets(0.5);
  const full = computeHeroParallaxOffsets(1);

  assert.ok(mid.treeY > 0 && full.treeY > mid.treeY);
  assert.ok(full.treeScale < 1 && full.treeScale > 0.95);
  assert.ok(mid.leavesY < 0 && full.leavesY < mid.leavesY);

  assert.ok(full.cardMeta.x < 0 && full.cardContent.x < 0);
  assert.ok(full.cardGoogle.x > 0 && full.cardWebsite.x > 0);

  assert.ok(full.cardMeta.y < full.cardContent.y);
  assert.ok(full.cardGoogle.y < full.cardWebsite.y);
});

test('scroll-velocity multiplier amplifies depth movement proportionally without crossing bounds', () => {
  assert.equal(computeVelocitySpeedMultiplier(0, HERO_VELOCITY_PROFILES.cardGoogle.weight), 1);

  const treeMult = computeVelocitySpeedMultiplier(1200, HERO_VELOCITY_PROFILES.tree.weight);
  const leavesMult = computeVelocitySpeedMultiplier(1200, HERO_VELOCITY_PROFILES.leaves.weight);
  const cardMult = computeVelocitySpeedMultiplier(1200, HERO_VELOCITY_PROFILES.cardGoogle.weight);

  // Foreground cards accelerate faster than midground leaves and background tree
  assert.ok(cardMult > leavesMult && leavesMult > treeMult && treeMult > 1);

  const staticMid = computeHeroParallaxOffsets(0.4, false, 0);
  const fastDown = computeHeroParallaxOffsets(0.4, false, 1400);
  const fastUp = computeHeroParallaxOffsets(0.4, false, -1400);
  const extremeBurst = computeHeroParallaxOffsets(0.4, false, MAX_SCROLL_VELOCITY * 4);
  const clampedBurst = computeHeroParallaxOffsets(0.4, false, MAX_SCROLL_VELOCITY);

  assert.ok(fastDown.treeY > staticMid.treeY);
  assert.ok(Math.abs(fastDown.cardGoogle.y) > Math.abs(staticMid.cardGoogle.y));
  assert.ok(fastDown.cardGoogle.y < fastDown.cardWebsite.y);
  assert.ok(fastUp.cardGoogle.y > staticMid.cardGoogle.y);
  assert.deepEqual(extremeBurst, clampedBurst);
});

test('computeHeroParallaxOffsets clamps out-of-range inputs and honors reducedMotion', () => {
  assert.deepEqual(computeHeroParallaxOffsets(-2), computeHeroParallaxOffsets(0));
  assert.deepEqual(computeHeroParallaxOffsets(4), computeHeroParallaxOffsets(1));
  assert.deepEqual(computeHeroParallaxOffsets(Number.NaN), computeHeroParallaxOffsets(0));
  assert.deepEqual(computeHeroParallaxOffsets(0.75, true, 1800), computeHeroParallaxOffsets(0));
});

test('computeMobileTreeViewportLayout scales tree dynamically by viewport height only below 640px', () => {
  const desktop = computeMobileTreeViewportLayout(1440, 700);
  assert.equal(desktop.isMobile, false);
  assert.equal(desktop.viewportScale, 1);
  assert.equal(desktop.maxHeightPx, null);

  const tablet = computeMobileTreeViewportLayout(640, 620);
  assert.equal(tablet.isMobile, false);
  assert.equal(tablet.viewportScale, 1);

  const shortPhone = computeMobileTreeViewportLayout(375, 580);
  const mediumPhone = computeMobileTreeViewportLayout(375, 667);
  const tallPhone = computeMobileTreeViewportLayout(390, 844);

  assert.equal(shortPhone.isMobile, true);
  assert.ok(shortPhone.viewportScale >= MOBILE_TREE_MIN_SCALE);
  assert.ok(shortPhone.viewportScale < mediumPhone.viewportScale);
  assert.ok(mediumPhone.viewportScale < tallPhone.viewportScale);
  assert.ok(tallPhone.viewportScale <= MOBILE_TREE_MAX_SCALE);
  assert.ok((shortPhone.maxHeightPx ?? 999) < (tallPhone.maxHeightPx ?? 0));
});
