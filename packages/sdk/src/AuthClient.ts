import type { LoginInput, AuthSession } from '@paulline/types';
import { PaulineError } from './PaulineError';

const LOGIN_PATH = 'auth/login';
const LOGOUT_PATH = 'auth/logout';
const JSON_CONTENT_TYPE = 'application/json';

type FetchFn = typeof fetch;

const defaultFetch: FetchFn = (input, init) => fetch(input, init);

export class AuthClient {
  private sessionToken: string | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: FetchFn = defaultFetch,
  ) {}

  async login(input: LoginInput): Promise<AuthSession> {
    const session = await this.request<AuthSession>(LOGIN_PATH, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.sessionToken = session.sessionToken;
    return session;
  }

  async logout(): Promise<void> {
    await this.request<void>(LOGOUT_PATH, { method: 'POST' });
    this.sessionToken = null;
  }

  setSessionToken(token: string | null): void {
    this.sessionToken = token;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  private async request<TResult>(path: string, init: RequestInit): Promise<TResult> {
    const headers: Record<string, string> = { 'Content-Type': JSON_CONTENT_TYPE };

    if (this.sessionToken) {
      headers.Authorization = `Bearer ${this.sessionToken}`;
    }

    const response = await this.fetchFn(`${this.baseUrl}/${path}`, { ...init, headers });
    const body = await this.parseBody(response);

    if (!response.ok) {
      throw PaulineError.fromResponse(response.status, body);
    }

    return body as TResult;
  }

  private async parseBody(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}
