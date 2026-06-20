import { describe, it, expect } from 'vitest';
import { PaulineClient } from './PaulineClient';

describe('PaulineClient', () => {
  it('is instantiable with a base URL', () => {
    const client = new PaulineClient({ baseUrl: 'http://localhost:3000' });
    expect(client).toBeInstanceOf(PaulineClient);
  });

  it('exposes a fluent machines resource with the correct endpoint', () => {
    const client = new PaulineClient({ baseUrl: 'http://localhost:3000' });
    expect(client.machines().endpoint).toBe('http://localhost:3000/machines');
  });

  it('exposes a fluent tunnels resource with the correct endpoint', () => {
    const client = new PaulineClient({ baseUrl: 'http://localhost:3000' });
    expect(client.tunnels().endpoint).toBe('http://localhost:3000/tunnels');
  });

  it('normalizes trailing slashes in the base URL', () => {
    const client = new PaulineClient({ baseUrl: 'http://localhost:3000/' });
    expect(client.tunnels().endpoint).toBe('http://localhost:3000/tunnels');
  });

  it('rejects unimplemented resource methods', async () => {
    const client = new PaulineClient({ baseUrl: 'http://localhost:3000' });
    await expect(client.tunnels().list()).rejects.toThrow();
  });
});
