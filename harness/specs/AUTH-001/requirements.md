# Requirements — AUTH-001: Cloudflare API Authentication

## Context

Enable user to authenticate with Cloudflare API key for tunnel management.

## Functional Requirements

### FR-1: User can input Cloudflare API key
- **GIVEN** user is on login page
- **WHEN** user enters valid Cloudflare API key and submits
- **THEN** key is validated against Cloudflare API endpoint

### FR-2: Valid API key is stored securely
- **GIVEN** API key is validated
- **WHEN** validation succeeds
- **THEN** key is stored encrypted in SQLite (never logged or exposed)

### FR-3: User session is created
- **GIVEN** API key validated and stored
- **WHEN** user completes auth
- **THEN** session token created + stored client-side (session storage or cookie)

### FR-4: Subsequent requests include API key
- **GIVEN** user is authenticated
- **WHEN** user requests tunnel list or creates tunnel
- **THEN** backend uses stored API key for Cloudflare API calls

### FR-5: Invalid API key shows error
- **GIVEN** user enters invalid/expired Cloudflare API key
- **WHEN** validation fails
- **THEN** error message displayed: "Invalid API key. Check credentials at https://dash.cloudflare.com"

### FR-6: User can logout
- **GIVEN** user is authenticated
- **WHEN** user clicks logout
- **THEN** session cleared, API key cleared from memory, redirected to login

### FR-7: Auth persists across page reload (for development)
- **GIVEN** user authenticated in dev session
- **WHEN** user reloads page
- **THEN** session restored (no re-login needed during dev)

## Non-Functional Requirements

- API key validation < 2 seconds (timeout on Cloudflare API fail)
- API key never logged in any output
- Session tokens validated on every protected request
- Rate limit Cloudflare API calls (max 1 per second)

## Acceptance Criteria

- [ ] Login page rendered (form + input + submit button)
- [ ] API key validated via Cloudflare API endpoint
- [ ] Invalid key shows error message
- [ ] Valid key stored encrypted in SQLite
- [ ] Session token created + stored in browser
- [ ] Protected routes require valid session
- [ ] Logout clears session + redirects
- [ ] Page reload restores session (dev mode)
- [ ] API key NEVER appears in logs or console
- [ ] Tests cover happy path + error cases

## Scope

- Login page UI (React Hook Form + Zod)
- Cloudflare API key validation
- Session management (local, single-user)
- Error handling

## Non-Scope

- Multi-user RBAC (v1)
- OAuth / OIDC (v1)
- MFA (v1)
- API key rotation (v1)

## Dependencies

- Blocks: MACHINES-001, TUNNELS-001, MONITORING-001, DASHBOARD-001
- Blocked by: SETUP-001
