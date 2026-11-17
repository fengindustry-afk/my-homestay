import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.SYNC_TOKEN_ENCRYPTION_KEY = 'ab'.repeat(32);
const { encryptToken, decryptToken, sha256 } = await import('../lib/token-crypto.ts');

test('roundtrip preserves plaintext incl. unicode', () => {
  const c = encryptToken('rahasia🔐 token');
  assert.notEqual(c, 'rahasia🔐 token');
  assert.equal(decryptToken(c), 'rahasia🔐 token');
});

test('two encryptions differ (random IV)', () => {
  assert.notEqual(encryptToken('x'), encryptToken('x'));
});

test('tampered blob throws DECRYPT_FAILED', () => {
  const c = encryptToken('secret');
  const bad = c.slice(0, -2) + (c.endsWith('AA') ? 'BB' : 'AA');
  assert.throws(() => decryptToken(bad), /DECRYPT_FAILED/);
});

test('sha256 is stable', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
