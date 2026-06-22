import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { ITokenCipher } from '../../domain/ports/token-cipher.port';
import { ConfigService } from '../../../../config/config.service';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTE_LENGTH = 12;
const PAYLOAD_SEPARATOR = ':';
const PAYLOAD_PART_COUNT = 3;
const BASE64 = 'base64';
const UTF8 = 'utf8';

@Injectable()
export class AesTokenCipherAdapter implements ITokenCipher {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    this.key = Buffer.from(this.config.authEncryptionKey, BASE64);
  }

  encrypt(plain: string): string {
    const iv = randomBytes(IV_BYTE_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    const ciphertext = Buffer.concat([cipher.update(plain, UTF8), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString(BASE64),
      authTag.toString(BASE64),
      ciphertext.toString(BASE64),
    ].join(PAYLOAD_SEPARATOR);
  }

  decrypt(payload: string): string {
    const parts = payload.split(PAYLOAD_SEPARATOR);

    if (parts.length !== PAYLOAD_PART_COUNT) {
      throw new Error('Malformed encrypted payload');
    }

    const [iv, authTag, ciphertext] = parts;
    const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(iv, BASE64));
    decipher.setAuthTag(Buffer.from(authTag, BASE64));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, BASE64)),
      decipher.final(),
    ]);

    return decrypted.toString(UTF8);
  }
}
