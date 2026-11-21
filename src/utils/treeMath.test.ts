import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateHeroLeaves,
  HERO_FRUITS,
  computeScrollTreeState,
  MINI_TREE_LEAVES,
} from './treeMath';

test('generateHeroLeaves creates 80 deterministic leaves ordered bottom-up', () => {
  const leavesA = generateHeroLeaves(80);
  const leavesB = generateHeroLeaves(80);
  assert.equal(leavesA.length, 80);
  assert.deepEqual(leavesA, leavesB);

  for (let i = 1; i < leavesA.length; i++) {
    assert.ok(
      leavesA[i - 1].cy >= leavesA[i].cy,
      'leaves should be sorted from bottom (higher cy) to top (lower cy)'
    );
    assert.ok(leavesA[i].delayMs >= leavesA[i - 1].delayMs, 'delays should increase bottom-up');
  }

  const lastLeafDelay = leavesA[leavesA.length - 1].delayMs;
  for (const fruit of HERO_FRUITS) {
    assert.ok(fruit.delayMs > lastLeafDelay, 'orange fruits should appear after all leaves');
  }
});

test('computeScrollTreeState grows trunk, leaves, and fruit across scroll progress', () => {
  const start = computeScrollTreeState(0);
  assert.equal(start.percentage, 0);
  assert.equal(start.trunkProgress, 0);
  assert.equal(start.visibleLeafCount, 0);
  assert.equal(start.showFruit, false);

  const mid = computeScrollTreeState(0.5);
  assert.equal(mid.percentage, 50);
  assert.equal(mid.trunkProgress, 1);
  assert.ok(mid.branchProgress > 0.5);
  assert.ok(mid.visibleLeafCount > 0 && mid.visibleLeafCount < MINI_TREE_LEAVES.length);
  assert.equal(mid.showFruit, false);

  const end = computeScrollTreeState(0.95);
  assert.equal(end.percentage, 95);
  assert.equal(end.trunkProgress, 1);
  assert.equal(end.branchProgress, 1);
  assert.equal(end.visibleLeafCount, MINI_TREE_LEAVES.length);
  assert.equal(end.showFruit, true);

  const clamped = computeScrollTreeState(1.4);
  assert.equal(clamped.percentage, 100);
});
