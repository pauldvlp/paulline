import { describe, it, expect, vi } from 'vitest';
import { PrismaCredentialRepository } from './prisma-credential.repository';
import type { PrismaClient } from '@paulline/database';

const buildRow = (encryptedToken: string) => ({
  id: 'cred-1',
  encryptedToken,
  createdAt: new Date('2026-06-22T00:00:00.000Z'),
  updatedAt: new Date('2026-06-22T00:00:00.000Z'),
});

describe('PrismaCredentialRepository', () => {
  it('saveActive removes prior records and creates the new one, returning a domain entity', async () => {
    const created = buildRow('iv:tag:cipher');
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const create = vi.fn().mockResolvedValue(created);
    const prisma = {
      authCredential: { deleteMany, create },
    } as unknown as PrismaClient;

    const repository = new PrismaCredentialRepository(prisma);
    const entity = await repository.saveActive({ encryptedToken: 'iv:tag:cipher' });

    expect(deleteMany).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({ data: { encryptedToken: 'iv:tag:cipher' } });
    expect(entity).toEqual({
      id: 'cred-1',
      encryptedToken: 'iv:tag:cipher',
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  });

  it('findActive returns the mapped entity when a record exists', async () => {
    const row = buildRow('iv:tag:cipher');
    const findFirst = vi.fn().mockResolvedValue(row);
    const prisma = {
      authCredential: { findFirst },
    } as unknown as PrismaClient;

    const repository = new PrismaCredentialRepository(prisma);
    const entity = await repository.findActive();

    expect(entity?.id).toBe('cred-1');
    expect(entity?.encryptedToken).toBe('iv:tag:cipher');
  });

  it('findActive returns null when no record exists', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const prisma = {
      authCredential: { findFirst },
    } as unknown as PrismaClient;

    const repository = new PrismaCredentialRepository(prisma);
    expect(await repository.findActive()).toBeNull();
  });

  it('clear removes all records', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      authCredential: { deleteMany },
    } as unknown as PrismaClient;

    const repository = new PrismaCredentialRepository(prisma);
    await repository.clear();

    expect(deleteMany).toHaveBeenCalledOnce();
  });
});
