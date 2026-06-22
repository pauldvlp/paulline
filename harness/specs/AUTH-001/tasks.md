# Tasks — AUTH-001: Cloudflare API Authentication

> Estado por tarea: [ ] pendiente · [x] hecha
> TDD obligatorio en cada task con código: red → green → refactor.
> Orden respeta dependencias: schemas/env → DB → domain/ports → adapters → service → controller/guard → SDK → UI → E2E.
> "Confirmar X via context7/codegraph" significa: no inventar APIs (Cloudflare, NestJS, Prisma, jose/jsonwebtoken).

---

- [ ] **Task 1 — Schemas + env (single source of truth)**
  En `packages/schemas/src/auth.ts`: reemplazar el `loginSchema` placeholder (email/password
  de INFRA-002) por `loginSchema = { apiToken: string().trim().min(1) }` y añadir
  `authSessionSchema = { sessionToken, expiresAt }`. Extender `api-env.ts` con
  `AUTH_ENCRYPTION_KEY` (base64 → 32 bytes), `AUTH_JWT_SECRET` (min 32), `AUTH_SESSION_TTL_SECONDS`
  (coerce int, default). Actualizar tipos en `packages/types` (`LoginInput`, `AuthSession`).
  Actualizar `.env.example`.
  **Aceptación:** unit tests Zod (apiToken vacío falla, válido pasa; env key 32-bytes válida/ inválida).
  `pnpm --filter @paulline/schemas test` verde. `tsc --noEmit` OK en schemas+types.

- [ ] **Task 2 — Prisma model + migration**
  Reemplazar el modelo placeholder `User` por `AuthCredential { id, encryptedToken, createdAt, updatedAt }`.
  Generar migración; aplica limpio sobre BD vacía. Regenerar Prisma client.
  **Aceptación:** `prisma migrate` aplica sin error sobre DB vacía; `pnpm --filter @paulline/database build` OK;
  cliente expone `authCredential`.

- [ ] **Task 3 — Domain layer (entities, VOs, ports, errors)**
  `domain/entities/auth-credential.ts`, `domain/value-objects/cloudflare-token.ts`
  (trim + non-empty, lanza si vacío), puertos `ICloudflareVerifier`, `ICredentialRepository`,
  `ITokenCipher`, `ISessionIssuer`, errores `InvalidApiTokenError`, `CredentialNotFoundError`.
  Sin imports externos (solo TS puro).
  **Aceptación:** unit test del VO `CloudflareToken` (vacío lanza, válido normaliza). `domain` no importa nada externo.

- [ ] **Task 4 — AES token cipher adapter**
  `infrastructure/adapters/aes-token-cipher.adapter.ts` implementa `ITokenCipher` con
  AES-256-GCM (Node `crypto`), IV aleatorio 12B, formato `iv:authTag:ciphertext` base64,
  key desde `ConfigService` (`AUTH_ENCRYPTION_KEY`).
  **Aceptación (TDD):** test round-trip `decrypt(encrypt(x)) === x`; cada `encrypt` produce ciphertext
  distinto (IV aleatorio); ciphertext manipulado falla en `decrypt` (auth tag). El plaintext nunca aparece
  en el payload almacenado.

- [ ] **Task 5 — Cloudflare verifier adapter**
  `infrastructure/adapters/cloudflare-verifier.adapter.ts` implementa `ICloudflareVerifier`
  → `GET /client/v4/user/tokens/verify` con `Authorization: Bearer`. Timeout
  `CLOUDFLARE_VERIFY_TIMEOUT_MS` (2000) y throttle `CLOUDFLARE_MIN_CALL_INTERVAL_MS` (1000).
  **Confirmar endpoint + shape de respuesta via context7 (`/cloudflare/*`) antes de codear.**
  **Aceptación (TDD, HTTP mockeado):** `status:"active"` → ok; status≠active / HTTP error / timeout
  → `InvalidApiTokenError`; el token NUNCA se loguea (assert sobre logger/stdout capturado).

- [ ] **Task 6 — JWT session issuer + Prisma repository adapters**
  `jwt-session-issuer.adapter.ts` (`issue` firma JWT con `AUTH_JWT_SECRET`, exp = TTL; `verify`
  valida firma/exp → `{ subjectId }`). `prisma-credential.repository.ts` (`saveActive` upsert único,
  `findActive`, `clear`) + mapper entidad↔Prisma. **Confirmar API jose/jsonwebtoken via context7.**
  **Aceptación (TDD):** issuer round-trip (issue→verify devuelve subjectId; JWT expirado/manipulado falla).
  Repository: save→findActive devuelve la entidad; clear la elimina (Prisma mockeado o test DB).

- [ ] **Task 7 — AuthService (use cases, application)**
  `application/services/auth.service.ts`: `login(LoginDto)` orquesta verify→encrypt→save→issue;
  `logout()` → `repository.clear()`; `getActiveToken()` → `findActive` + `decrypt` (para FR-4).
  DTOs `LoginDto`, `AuthSessionDto`; mapper.
  **Aceptación (TDD, todos los puertos mockeados):** happy path login devuelve `AuthSessionDto` y
  llama save una vez; verifier que lanza → propaga `InvalidApiTokenError` y NO llama save; logout llama clear;
  `getActiveToken` decripta el almacenado. Cobertura > 80% del service.

- [ ] **Task 8 — Controller + Session guard + module wiring**
  `infrastructure/controllers/auth.controller.ts`: `POST /auth/login` (body validado vs `loginSchema`),
  `POST /auth/logout`. `guards/session.guard.ts` (valida JWT vía `ISessionIssuer`). `auth.module.ts`
  bindea puertos→adaptadores (DI). Registrar `AuthModule` en `AppModule`. Filtro de excepciones mapea
  errores de dominio a `{ error: { code, message } }` (401) y redacta secretos.
  **Aceptación (TDD, integración controller↔service al estilo INFRA-001, instanciación manual):**
  login válido → 200 + `{ sessionToken, expiresAt }`; inválido → 401 `INVALID_API_TOKEN`;
  ruta protegida sin JWT → 401 `UNAUTHORIZED`. `tsc --noEmit` OK; `AppModule` compila.

- [ ] **Task 9 — SDK auth client**
  `packages/sdk`: añadir `AuthClient` y `PaulineClient.auth()`. Métodos `login(LoginInput)`,
  `logout()`, `setSessionToken(token|null)`, `getSessionToken()`. `login` guarda el token en memoria
  y adjunta `Authorization: Bearer` a requests posteriores. Errores → `PaulineError` tipado con `code`.
  Exportar tipos. **Aceptación (TDD, fetch mockeado):** login OK setea header en siguiente request;
  401 → `PaulineError` con `code: INVALID_API_TOKEN`; logout limpia el token en memoria.

- [ ] **Task 10 — Frontend: AuthContext + useAuth + protected routes**
  `context/AuthContext.tsx` + `hooks/useAuth.ts`: estado `{ isAuthenticated, login, logout, error }`,
  envuelve `PaulineClient.auth()`, persiste/restaura el `sessionToken` en `localStorage` (FR-7).
  `RequireAuth` (guard de router) redirige a `/login` si no autenticado; hidrata token al montar.
  **Aceptación (TDD, Testing Library):** login exitoso setea `isAuthenticated` y escribe localStorage;
  reload (re-mount con token en storage) → autenticado; logout limpia storage y estado; `RequireAuth`
  redirige cuando no autenticado.

- [ ] **Task 11 — Frontend: AuthLayout + LoginPage + LoginForm (apiToken)**
  Repurposear `organisms/LoginForm.tsx` a campo único `apiToken` (type=password, RHF +
  `zodResolver(loginSchema)`). `templates/AuthLayout.tsx` (card centrado, shadcn + Tailwind utilities).
  `pages/LoginPage.tsx` compone layout+form, llama `useAuth().login`, muestra el mensaje exacto
  `"Invalid API key. Check credentials at https://dash.cloudflare.com"` (inline en JSX) en error,
  redirige en éxito. Wirear en `App.tsx` (descomentar/rutas).
  **Aceptación (TDD, Testing Library):** form inválido (vacío) muestra error de Zod; submit válido llama
  `login`; en error de auth se renderiza el mensaje exacto; en éxito navega. Componentes usan shadcn; sin custom CSS classes.

- [ ] **Task 12 — E2E (Playwright): login → validate → store → redirect**
  `apps/web/e2e/auth.spec.ts` con stub/intercept del verify de Cloudflare (determinista, offline).
  Cubre: (a) token válido → redirect a `/` + token en localStorage; (b) reload mantiene sesión (FR-7);
  (c) token inválido → mensaje exacto, sin redirect, sin token en storage; (d) logout → limpia + redirige a `/login`;
  (e) el token NUNCA aparece en el contenido de la página ni en console logs.
  **Aceptación:** `pnpm --filter web e2e` (o script equivalente) verde con los 5 escenarios.

- [ ] **Task 13 — Verificación final (gates)**
  `pnpm test` (todos los workspaces verdes), `pnpm lint`/`tsc --noEmit` OK en api/web/schemas/sdk/types,
  migración aplica limpio sobre DB vacía, E2E verde. Auditoría: el token NO aparece en ningún log/console
  (grep en salidas de test). Revisar criterios de `harness/docs/verification.md`.
  **Aceptación:** todos los gates de `verification.md` en verde; checklist de Acceptance Criteria de
  `requirements.md` completo.
