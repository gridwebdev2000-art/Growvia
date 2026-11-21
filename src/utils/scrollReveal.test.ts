import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REVEAL_DEFAULTS,
  buildRevealStyle,
  computeRevealDelayMs,
  shouldImmediateReveal,
} from './scrollReveal';

test('computeRevealDelayMs computes staggered delays capped safely at maxDelayMs', () => {
  assert.equal(computeRevealDelayMs(0), 0);
  assert.equal(computeRevealDelayMs(-1), 0);
  assert.equal(computeRevealDelayMs(1), REVEAL_DEFAULTS.staggerMs);
  assert.equal(computeRevealDelayMs(2), REVEAL_DEFAULTS.staggerMs * 2);
  assert.equal(computeRevealDelayMs(10), REVEAL_DEFAULTS.maxDelayMs);
});

test('shouldImmediateReveal triggers when element is in or above viewport and defers when below fold', () => {
  assert.equal(shouldImmediateReveal({ top: 100, bottom: 400 }, 900), true);
  assert.equal(shouldImmediateReveal({ top: -350, bottom: -50 }, 900), true);
  assert.equal(shouldImmediateReveal({ top: 1100, bottom: 1400 }, 900), false);
});

test('buildRevealStyle transitions cleanly from hidden/shifted to visible/neutral and respects reducedMotion', () => {
  const hidden = buildRevealStyle({ visible: false, delayMs: 80 });
  assert.equal(hidden.opacity, 0);
  assert.equal(hidden.transform, `translate3d(0, ${REVEAL_DEFAULTS.offsetY}px, 0)`);
  assert.ok(String(hidden.transition).includes('80ms'));

  const shown = buildRevealStyle({ visible: true, delayMs: 80 });
  assert.equal(shown.opacity, 1);
  assert.equal(shown.transform, 'translate3d(0, 0, 0)');
  assert.equal(shown.willChange, 'auto');

  const reduced = buildRevealStyle({ visible: false, reducedMotion: true });
  assert.equal(reduced.opacity, 1);
  assert.equal(reduced.transform, undefined);
});
