export type IssuedSession = {
  sessionToken: string;
  expiresAt: string;
};

export type VerifiedSession = {
  subjectId: string;
};

export interface ISessionIssuer {
  issue(subjectId: string): Promise<IssuedSession>;
  verify(sessionToken: string): Promise<VerifiedSession>;
}

export const SESSION_ISSUER = Symbol('ISessionIssuer');
