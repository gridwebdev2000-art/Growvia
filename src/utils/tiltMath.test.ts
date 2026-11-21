import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCardTilt } from './tiltMath';

test('computeCardTilt returns neutral center angles when pointer is at card center', () => {
  const res = computeCardTilt(250, 150, { left: 100, top: 50, width: 300, height: 200 });
  assert.equal(res.rotateX, 0);
  assert.equal(res.rotateY, 0);
  assert.equal(res.glareX, 50);
  assert.equal(res.glareY, 50);
});

test('computeCardTilt computes clamped corner angles with expected 3D sign conventions', () => {
  const rect = { left: 0, top: 0, width: 400, height: 200 };

  // Top-left corner -> rotateX positive (top edge tilts back), rotateY negative (left edge tilts back)
  const topLeft = computeCardTilt(0, 0, rect, { maxRotateX: 4, maxRotateY: 5 });
  assert.equal(topLeft.rotateX, 4);
  assert.equal(topLeft.rotateY, -5);
  assert.equal(topLeft.glareX, 0);
  assert.equal(topLeft.glareY, 0);

  // Bottom-right beyond bounds -> clamped to max angles
  const bottomRight = computeCardTilt(999, 999, rect, { maxRotateX: 4, maxRotateY: 5 });
  assert.equal(bottomRight.rotateX, -4);
  assert.equal(bottomRight.rotateY, 5);
  assert.equal(bottomRight.glareX, 100);
  assert.equal(bottomRight.glareY, 100);
});

test('computeCardTilt handles zero-sized rects safely without NaN', () => {
  const res = computeCardTilt(50, 50, { left: 0, top: 0, width: 0, height: 0 });
  assert.deepEqual(res, { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
});
