import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function getKey(): Buffer {
  const raw = process.env.SYNC_TOKEN_ENCRYPTION_KEY;
  if (!raw || !/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error('TOKEN_CRYPTO_MISCONFIGURED');
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) throw new Error('TOKEN_CRYPTO_MISCONFIGURED');
  return key;
}

export function encryptToken(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

export function decryptToken(blob: string): string {
  try {
    const key = getKey();
    const buf = Buffer.from(blob, 'base64url');
    if (buf.length < 12 + 16) throw new Error('short');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString('utf8');
  } catch {
    throw new Error('DECRYPT_FAILED');
  }
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
