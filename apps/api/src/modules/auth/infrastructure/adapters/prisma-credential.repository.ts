import { Injectable } from '@nestjs/common';
import { prisma, type PrismaClient } from '@paulline/database';
import type { AuthCredential } from '../../domain/entities/auth-credential';
import type {
  ICredentialRepository,
  SaveCredentialInput,
} from '../../domain/ports/credential-repository.port';
import { mapRowToAuthCredential } from '../../application/mappers/auth-credential.mapper';

@Injectable()
export class PrismaCredentialRepository implements ICredentialRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async saveActive(input: SaveCredentialInput): Promise<AuthCredential> {
    await this.client.authCredential.deleteMany();

    const row = await this.client.authCredential.create({
      data: { encryptedToken: input.encryptedToken },
    });

    return mapRowToAuthCredential(row);
  }

  async findActive(): Promise<AuthCredential | null> {
    const row = await this.client.authCredential.findFirst();
    return row ? mapRowToAuthCredential(row) : null;
  }

  async clear(): Promise<void> {
    await this.client.authCredential.deleteMany();
  }
}
