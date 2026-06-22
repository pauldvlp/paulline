import type { AuthCredential } from '../entities/auth-credential';

export type SaveCredentialInput = {
  encryptedToken: string;
};

export interface ICredentialRepository {
  saveActive(input: SaveCredentialInput): Promise<AuthCredential>;
  findActive(): Promise<AuthCredential | null>;
  clear(): Promise<void>;
}

export const CREDENTIAL_REPOSITORY = Symbol('ICredentialRepository');
