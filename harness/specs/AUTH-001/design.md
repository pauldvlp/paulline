# Design — AUTH-001: Cloudflare API Authentication

**Feature ID:** AUTH-001
**Depends on:** SETUP-001, INFRA-001 (hexagonal pattern), INFRA-002 (form stack), INFRA-003 (SDK)
**Blocks:** MACHINES-001, TUNNELS-001, MONITORING-001, DASHBOARD-001

## 1. Overview

Single-user authentication against the Cloudflare API. The user pastes a Cloudflare API
token, the backend verifies it against Cloudflare, and on success stores it **encrypted**
in SQLite. A session token is issued to the client so subsequent protected requests can be
authorized without re-sending the Cloudflare credential. Logout clears the session.

The auth module is the first **real** hexagonal domain module (health was stateless). It
sets the reference pattern for `machines`/`tunnels`/`monitoring`: a domain port for the
external provider (Cloudflare), a port for persistence (repository), and an application
service that orchestrates them.

## 2. Key decisions

### 2.1 Credential: Cloudflare **API Token** (not Global API Key)

The requirement says "API key". We design against the **Cloudflare API Token** (bearer
token via `Authorization: Bearer <token>`), not the legacy Global API Key (which requires
account email + key). Rationale: tokens are scoped, revocable, and verifiable with a single
self-describing endpoint (`GET /client/v4/user/tokens/verify`) without needing an email.
This matches the requirement's error copy ("Check credentials at https://dash.cloudflare.com")
and is Cloudflare's recommended path. The Zod field is named `apiToken` with a UI label of
"Cloudflare API Token".

> The implementer MUST confirm the exact verify endpoint + success shape via context7
> (`/cloudflare/*`) before coding the adapter. Documented contract below is the target.

### 2.2 Encryption: **AES-256-GCM** (reversible), NOT bcrypt/argon2

The API token must be **recovered in plaintext** to call Cloudflare on the user's behalf
(FR-4). Therefore a one-way hash (bcrypt/argon2) is **wrong** here — those are for passwords
you only ever compare, never recover. We use **symmetric authenticated encryption**:
Node `crypto` AES-256-GCM.

- Key: a 32-byte secret from env `AUTH_ENCRYPTION_KEY` (base64, validated by Zod schema).
- Per-encryption random 12-byte IV; store `iv : authTag : ciphertext` (base64, colon-joined)
  in a single SQLite column.
- The auth tag guarantees tamper detection on decrypt.
- The encryption key lives **only** in `.env` (never in DB, never logged).

### 2.3 Session: signed **stateless JWT**, NOT server session store

Single-user, local panel — no need for a server-side session table. On successful auth the
backend issues a short-lived **JWT** signed with `AUTH_JWT_SECRET` (env, min 32 chars).
The JWT carries no secret material (only `sub` = the stored credential record id + `iat`/`exp`).
Protected endpoints verify the JWT signature/expiry via a Nest **guard**; the guard does NOT
re-touch Cloudflare. The Cloudflare token is fetched from the DB (decrypted) only inside use
cases that actually call Cloudflare (FR-4).

> **Resolved ambiguity (JWT vs session):** JWT chosen. Documented here; if the human prefers
> an opaque server-stored session token, this is the single switch point — flagged in the
> Open Questions of requirements is none, so we proceed with JWT as the default.

### 2.4 Client storage: **localStorage** (dev persistence), not cookie

FR-7 requires the session to survive page reload during dev. The SDK is the only HTTP
channel and runs in-browser, so it reads the JWT and sets `Authorization: Bearer`. We store
the JWT in `localStorage` under a namespaced key. Rationale: simplest path that satisfies
FR-7, no CSRF surface to manage for a local single-user tool, and the JWT contains no secret
(the Cloudflare token never leaves the backend). A hardening note (httpOnly cookie) is left
for a future security pass and recorded in Trade-offs.

### 2.5 Rate limiting Cloudflare calls (NFR: max 1/sec)

A small in-memory throttle in the Cloudflare adapter (min interval between outbound calls).
For v0.1 single-user this is sufficient; documented as a `CLOUDFLARE_MIN_CALL_INTERVAL_MS`
constant. No distributed limiter needed.

### 2.6 Never log secrets

The Cloudflare token and encryption key are never passed to any logger. The adapter logs
only action + status (e.g. `cloudflare.verify ok`). A redaction guard in the global
exception filter ensures error payloads never echo the token. Tests assert the token string
never appears in captured stdout for the verify/login paths.

## 3. Backend — Hexagonal module `auth`

```
apps/api/src/modules/auth/
  domain/
    entities/auth-credential.ts          # AuthCredential entity (id, encryptedToken, createdAt)
    value-objects/cloudflare-token.ts     # CloudflareToken VO (non-empty, trimmed)
    ports/cloudflare-verifier.port.ts     # ICloudflareVerifier (verify(token) -> VerifiedAccount)
    ports/credential-repository.port.ts   # ICredentialRepository (save/findActive/clear)
    ports/token-cipher.port.ts            # ITokenCipher (encrypt/decrypt)
    ports/session-issuer.port.ts          # ISessionIssuer (issue(subject)/verify(jwt))
    errors/invalid-api-token.error.ts     # InvalidApiTokenError (domain)
    errors/credential-not-found.error.ts  # CredentialNotFoundError (domain)
  application/
    dtos/login.dto.ts                     # LoginDto (apiToken)
    dtos/auth-session.dto.ts              # AuthSessionDto (sessionToken, expiresAt)
    services/auth.service.ts              # login(), logout(), getActiveToken()
    mappers/auth-credential.mapper.ts     # entity <-> persistence + entity -> response
    services/auth.service.test.ts
  infrastructure/
    adapters/cloudflare-verifier.adapter.ts   # impl ICloudflareVerifier (HTTP -> Cloudflare)
    adapters/aes-token-cipher.adapter.ts       # impl ITokenCipher (AES-256-GCM)
    adapters/prisma-credential.repository.ts   # impl ICredentialRepository (Prisma)
    adapters/jwt-session-issuer.adapter.ts     # impl ISessionIssuer (JWT)
    controllers/auth.controller.ts             # POST /auth/login, POST /auth/logout
    guards/session.guard.ts                    # JWT guard for protected routes
    auth.module.ts                             # NestJS wiring (binds ports -> adapters)
    adapters/*.test.ts
    controllers/auth.controller.test.ts
```

### Dependency rules (enforced)
- `domain` imports nothing external (pure types + port interfaces + domain errors).
- `application` imports only `domain`.
- `infrastructure` imports `application` + `domain` + frameworks.

### Ports (interfaces, `domain/ports`)
- `ICloudflareVerifier.verify(token: CloudflareToken): Promise<VerifiedAccount>` — throws
  `InvalidApiTokenError` on non-active token / network failure within timeout.
- `ICredentialRepository.saveActive(entity) / findActive() / clear()`.
- `ITokenCipher.encrypt(plain: string): string` / `decrypt(payload: string): string`.
- `ISessionIssuer.issue(subjectId: string): AuthSessionDto` / `verify(jwt: string): { subjectId }`.

### AuthService.login flow (application orchestration)
1. Receive validated `LoginDto` (apiToken).
2. Build `CloudflareToken` VO (trim, non-empty).
3. `cloudflareVerifier.verify(token)` → on failure throw `InvalidApiTokenError`.
4. `tokenCipher.encrypt(token.value)` → encrypted payload.
5. `credentialRepository.saveActive(AuthCredential)` (upsert single active record).
6. `sessionIssuer.issue(credential.id)` → `AuthSessionDto`.
7. Return `AuthSessionDto` to controller.

### AuthService.logout flow
- `credentialRepository.clear()` (removes stored encrypted token) → returns void.
- Client discards the JWT (no server session to invalidate; JWT simply expires).

### Cloudflare adapter contract (target)
- `GET https://api.cloudflare.com/client/v4/user/tokens/verify`
  with `Authorization: Bearer <token>`.
- Success: HTTP 200 + `{ success: true, result: { status: "active" } }` → valid.
- Any other status / `result.status !== "active"` / timeout (> `CLOUDFLARE_VERIFY_TIMEOUT_MS`,
  target 2000ms per NFR) → `InvalidApiTokenError`.
- Rate limit: enforce `CLOUDFLARE_MIN_CALL_INTERVAL_MS` between outbound calls.

## 4. Database (Prisma)

Replace the placeholder `User` model with an auth credential model. Single active record
(single-user MVP).

```prisma
model AuthCredential {
  id             String   @id @default(cuid())
  encryptedToken String                       // iv:authTag:ciphertext (base64)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

- Migration added under `packages/database/prisma/migrations/`.
- The plaintext token is **never** stored; only `encryptedToken`.

## 5. Schemas (`packages/schemas`) — single source of truth

New file `packages/schemas/src/auth.ts` (replaces the INFRA-002 placeholder email/password
`loginSchema`, which was a form-stack demo, not the real auth contract):

```ts
// packages/schemas/src/auth.ts
export const loginSchema = z.object({
  apiToken: z.string().trim().min(1, 'Cloudflare API token is required'),
});

export const authSessionSchema = z.object({
  sessionToken: z.string().min(1),
  expiresAt: z.string(),            // ISO-8601
});
```

- Env schemas extended (`packages/schemas/src/api-env.ts`):
  - `AUTH_ENCRYPTION_KEY`: base64 string decoding to exactly 32 bytes.
  - `AUTH_JWT_SECRET`: string min length 32.
  - `AUTH_SESSION_TTL_SECONDS`: coerced positive int (default e.g. 86400).
- Types (`packages/types`): `LoginInput = z.infer<typeof loginSchema>`,
  `AuthSession = z.infer<typeof authSessionSchema>`.

> **Note for implementer:** removing email/password from `loginSchema` will break the
> current `LoginForm.tsx` (INFRA-002 demo). Updating that form to the apiToken field is part
> of this feature (Task 7), and `App.tsx` already anticipates wiring it here.

## 6. SDK (`packages/sdk/PaulineClient`)

Add an `auth()` resource (the SDK currently exposes only `machines()`/`tunnels()` via the
generic `ResourceClient`; auth needs bespoke methods, so a dedicated `AuthClient`).

```ts
client.auth().login(input: LoginInput): Promise<AuthSession>   // POST /auth/login
client.auth().logout(): Promise<void>                          // POST /auth/logout
client.auth().setSessionToken(token: string | null): void      // sets Authorization header
client.auth().getSessionToken(): string | null
```

- On `login` success the SDK keeps the `sessionToken` in memory and attaches
  `Authorization: Bearer <sessionToken>` to subsequent requests.
- Persistence to `localStorage` is done by the frontend `AuthContext` (SDK stays
  environment-agnostic; it only holds the token in memory and exposes get/set).
- Errors map to a typed `PaulineError` with `code` (e.g. `INVALID_API_TOKEN`) so the UI can
  show the required message.

## 7. Frontend (React, Atomic Design)

### Components
- **Organism** `LoginForm.tsx` (exists, repurposed): RHF + `zodResolver(loginSchema)`,
  single `apiToken` field (type=password to mask), submit calls `onSubmit`. Owns form state.
- **Template** `AuthLayout.tsx`: centered card layout for unauthenticated views (uses shadcn
  primitives only, Tailwind utilities inline).
- **Page** `LoginPage.tsx`: composes `AuthLayout` + `LoginForm`, calls `useAuth().login`,
  renders the error message from the auth error, redirects on success.
- **Context** `AuthContext` + hook `useAuth`: holds `{ isAuthenticated, login, logout, error }`,
  wraps `PaulineClient.auth()`, persists/restores the session token from `localStorage`
  (FR-7), and exposes auth state to the route guard.

### Protected routes
- A `RequireAuth` wrapper (router guard) reads `useAuth().isAuthenticated`; if false →
  redirect to `/login`. On mount, `AuthContext` hydrates the token from `localStorage` and
  marks authenticated if a non-expired token exists.

### Error handling (UI)
- Invalid token → `LoginPage` renders exactly:
  `"Invalid API key. Check credentials at https://dash.cloudflare.com"` (string inline in JSX,
  per conventions: UI text not constantized).
- Network/timeout → generic retry message; never leaks token.

## 8. Error handling flow (end to end)

| Stage | Failure | Result |
|---|---|---|
| Cloudflare verify | non-active / timeout / network | `InvalidApiTokenError` → controller maps to `{ error: { code: "INVALID_API_TOKEN", message } }` HTTP 401 |
| JWT guard | missing/expired/invalid JWT | HTTP 401 `{ error: { code: "UNAUTHORIZED", message } }` |
| Decrypt | tamper / wrong key | `CredentialNotFoundError`-style 401, logged as action+status only |
| Frontend | any auth error | mapped to user message; token never rendered/logged |

Global Nest exception filter (in `common/filters`) renders the canonical error shape
`{ error: { code, message } }` and redacts secrets.

## 9. E2E flow (Playwright)

`login → validate → store → redirect`, plus invalid-key and logout:

1. Mock/stub the Cloudflare verify call (or use a test token + intercept) so E2E is
   deterministic and offline.
2. Visit `/login`, type a valid token, submit → expect redirect to `/` (dashboard placeholder)
   and `localStorage` holds a session token.
3. Reload page → still authenticated (FR-7).
4. Type an invalid token → expect the exact error message, no redirect, no token in storage.
5. Click logout → session cleared, redirected to `/login`.
6. Assert the token string never appears in page content or console logs.

## 10. Trade-offs / future hardening
- localStorage JWT is simplest for a local single-user tool; an httpOnly cookie + CSRF token
  is the future hardening path (out of scope v0.1).
- In-memory rate limiter and Cloudflare verify timeout are per-process; fine for single-user.
- Single active `AuthCredential` row; multi-credential/rotation is explicitly v1 (Non-Scope).

## 11. Traceability
- FR-1 → `LoginForm` + `POST /auth/login` + `loginSchema`.
- FR-2 → `AesTokenCipher` (AES-256-GCM) + `AuthCredential.encryptedToken`; never logged.
- FR-3 → `JwtSessionIssuer` + `AuthContext` localStorage persistence.
- FR-4 → `AuthService.getActiveToken()` decrypts for outbound Cloudflare calls; consumed by
  MACHINES/TUNNELS features.
- FR-5 → `InvalidApiTokenError` → exact UI message.
- FR-6 → `AuthService.logout()` + `AuthContext.logout()` clears storage + redirect.
- FR-7 → localStorage hydration on `AuthContext` mount.
- NFR (timeout/rate-limit/no-log) → adapter constants + redaction + log-assertion tests.
