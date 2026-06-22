import type { AuthCredential } from '../../domain/entities/auth-credential';

type AuthCredentialRow = {
  id: string;
  encryptedToken: string;
  createdAt: Date;
  updatedAt: Date;
};

export const mapRowToAuthCredential = (row: AuthCredentialRow): AuthCredential => ({
  id: row.id,
  encryptedToken: row.encryptedToken,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
