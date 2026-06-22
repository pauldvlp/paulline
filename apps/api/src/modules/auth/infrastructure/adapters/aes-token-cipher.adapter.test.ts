import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { AesTokenCipherAdapter } from './aes-token-cipher.adapter';
import type { ConfigService } from '../../../../config/config.service';

const buildConfig = (encryptionKey: string): ConfigService =>
  ({ authEncryptionKey: encryptionKey }) as ConfigService;

const validKey = randomBytes(32).toString('base64');

describe('AesTokenCipherAdapter', () => {
  it('round-trips a value: decrypt(encrypt(x)) === x', () => {
    const cipher = new AesTokenCipherAdapter(buildConfig(validKey));
    const plain = 'cf-secret-token-value';

    const encrypted = cipher.encrypt(plain);
    expect(cipher.decrypt(encrypted)).toBe(plain);
  });

  it('never stores the plaintext in the payload', () => {
    const cipher = new AesTokenCipherAdapter(buildConfig(validKey));
    const plain = 'cf-secret-token-value';

    const encrypted = cipher.encrypt(plain);
    expect(encrypted).not.toContain(plain);
  });

  it('produces a different ciphertext on each encryption (random IV)', () => {
    const cipher = new AesTokenCipherAdapter(buildConfig(validKey));
    const plain = 'cf-secret-token-value';

    const first = cipher.encrypt(plain);
    const second = cipher.encrypt(plain);

    expect(first).not.toBe(second);
    expect(cipher.decrypt(first)).toBe(plain);
    expect(cipher.decrypt(second)).toBe(plain);
  });

  it('fails to decrypt a tampered payload (auth tag verification)', () => {
    const cipher = new AesTokenCipherAdapter(buildConfig(validKey));
    const encrypted = cipher.encrypt('cf-secret-token-value');

    const [iv, authTag, ciphertext] = encrypted.split(':');
    const tampered = [iv, authTag, Buffer.from('tampered').toString('base64')].join(':');

    expect(() => cipher.decrypt(tampered)).toThrow();
  });

  it('fails to decrypt with a different key', () => {
    const cipher = new AesTokenCipherAdapter(buildConfig(validKey));
    const encrypted = cipher.encrypt('cf-secret-token-value');

    const otherCipher = new AesTokenCipherAdapter(buildConfig(randomBytes(32).toString('base64')));
    expect(() => otherCipher.decrypt(encrypted)).toThrow();
  });
});
