import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKING_STATUSES, TENTATIVE_STATUS, isBlockingStatus, isHoldActive, HOLD_HOURS } from '../lib/booking.ts';

test('blocking statuses are paid and confirmed', () => {
  assert.deepEqual(BLOCKING_STATUSES, ['paid', 'confirmed']);
  assert.equal(isBlockingStatus('paid'), true);
  assert.equal(isBlockingStatus('confirmed'), true);
  assert.equal(isBlockingStatus('pending'), false);
  assert.equal(isBlockingStatus(null), false);
});

test('HOLD_HOURS is 24', () => assert.equal(HOLD_HOURS, 24));

test('isHoldActive: fresh timestamp is active', () => {
  const now = new Date('2026-11-18T00:00:00Z');
  const fresh = new Date(now.getTime() - 60_000).toISOString();
  assert.equal(isHoldActive(fresh, now), true);
});

test('isHoldActive: 24h+1s old is expired', () => {
  const now = new Date('2026-11-18T00:00:00Z');
  const old = new Date(now.getTime() - 24*3600*1000 - 1000).toISOString();
  assert.equal(isHoldActive(old, now), false);
});

test('isHoldActive: boundary inclusive at exactly 24h', () => {
  const now = new Date('2026-11-18T00:00:00Z');
  const exact = new Date(now.getTime() - 24*3600*1000).toISOString();
  assert.equal(isHoldActive(exact, now), true);
});

test('isHoldActive: junk input is inactive', () => {
  assert.equal(isHoldActive('garbage'), false);
  assert.equal(isHoldActive(null), false);
});
