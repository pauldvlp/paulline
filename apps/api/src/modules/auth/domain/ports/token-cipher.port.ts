export interface ITokenCipher {
  encrypt(plain: string): string;
  decrypt(payload: string): string;
}

export const TOKEN_CIPHER = Symbol('ITokenCipher');
