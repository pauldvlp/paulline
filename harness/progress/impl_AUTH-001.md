# Implementation Log — AUTH-001: Cloudflare API Authentication

**Estado:** `in_review`
**Implementer:** TDD (red → green → refactor), 13/13 tasks completadas.
**Sin commits** (puerta de commit pendiente).

## Resultado de verificación (gates)

| Gate | Resultado |
|---|---|
| Unit tests | 81 verdes (schemas 14, sdk 10, api 41, web 16) |
| E2E (Playwright) | 15 verdes (5 escenarios × chromium/firefox/webkit) |
| Typecheck (`pnpm lint`) | 6 workspaces limpios |
| Build (`pnpm build`) | 6 workspaces OK (incl. `vite build` producción) |
| Migración Prisma | aplica limpia sobre DB vacía (`migrate deploy` + `migrate status` up-to-date) |
| Smoke test live API | `/health` 200; login inválido → 401 `INVALID_API_TOKEN`; vacío → 400 `VALIDATION_ERROR` |
| Auditoría de secretos | el token NUNCA aparece en stdout de tests, en logs del api, ni en source (`console.*` ausente en auth/sdk) |

## Decisiones técnicas

1. **Credencial = Cloudflare API Token (Bearer).** Endpoint confirmado contra la doc oficial
   (`GET https://api.cloudflare.com/client/v4/user/tokens/verify`, `Authorization: Bearer`,
   éxito `{ success: true, result: { status: "active" } }`, status ∈ active|disabled|expired).
   Solo `active` válida; cualquier otro estado/HTTP error/timeout → `InvalidApiTokenError`.

2. **Encryption AES-256-GCM (reversible).** `AesTokenCipherAdapter`: IV aleatorio de 12 bytes,
   formato `iv:authTag:ciphertext` (base64, colon-joined). La key se lee de `AUTH_ENCRYPTION_KEY`
   (base64 → 32 bytes) vía `ConfigService`. Auth tag garantiza detección de manipulación.

3. **Sesión = JWT stateless (HS256) con `jose`.** Elegí `jose` (moderno, tipado, sin `@types`)
   sobre `jsonwebtoken`. `JwtSessionIssuerAdapter.issue` firma con `AUTH_JWT_SECRET` y `exp = TTL`;
   `verify` valida firma/exp y devuelve `{ subjectId }`. El JWT no transporta material secreto
   (solo `sub` = id del registro de credencial).

4. **Hexagonal estricto.** `domain` (entidad `AuthCredential`, VO `CloudflareToken`, 4 puertos con
   símbolos de DI, 2 errores de dominio) sin imports externos; `application` (AuthService + DTOs +
   mapper) solo depende de puertos; `infrastructure` (4 adaptadores + controller + guard + módulo).
   Inyección por símbolos (`CLOUDFLARE_VERIFIER`, `TOKEN_CIPHER`, `CREDENTIAL_REPOSITORY`,
   `SESSION_ISSUER`).

5. **Repositorio single-active.** `saveActive` hace `deleteMany` + `create` (semántica de registro
   único MVP). `findActive`/`clear`. Mapper Prisma-row → entidad de dominio explícito.

6. **`AuthService.getActiveToken()`** desencripta el token almacenado para futuras llamadas a
   Cloudflare (FR-4, consumido por MACHINES/TUNNELS). Lanza `CredentialNotFoundError` si no hay
   credencial activa.

7. **Filtro global de excepciones** (`common/filters/domain-exception.filter.ts`): mapea errores de
   dominio a `{ error: { code, message } }` (401), respeta `HttpException` con esa forma (guard 401
   `UNAUTHORIZED`, pipe 400 `VALIDATION_ERROR`), y redacta cualquier error desconocido a 500
   `INTERNAL_ERROR` sin filtrar el mensaje original.

8. **Pipe de validación Zod** (`common/pipes/zod-validation.pipe.ts`) valida el body de login contra
   `loginSchema` (fuente única en `packages/schemas`).

9. **SDK: `AuthClient` dedicado** (no el `ResourceClient` genérico). `login`/`logout`/
   `setSessionToken`/`getSessionToken`; mantiene el `sessionToken` en memoria y adjunta
   `Authorization: Bearer` a requests posteriores. Errores → `PaulineError` tipado con `code`.
   `PaulineClient.auth()` devuelve una instancia singleton (token persiste entre llamadas).

10. **Frontend (Atomic + React Hook Form + Zod):** `LoginForm` repurposeado a campo único
    `apiToken` (type=password); `AuthLayout` (template, card centrado, solo Tailwind utilities);
    `LoginPage` (page) muestra el mensaje exacto de error; `DashboardPage` placeholder con logout.
    `AuthProvider`/`useAuth` envuelven el SDK, persisten/hidratan el token en `localStorage`
    (`paulline.sessionToken`, FR-7). `RequireAuth` redirige a `/login` si no autenticado.
    Routing con `react-router-dom` (dependencia añadida — necesaria para redirect/protected routes).

## Bug encontrado y corregido (lo cazó el E2E)

`AuthClient`/`CloudflareVerifierAdapter` recibían `fetch` como default param y lo llamaban como
`this.fetchFn(...)`, perdiendo el binding de `Window` en el navegador →
`"Failed to execute 'fetch' on 'Window': Illegal invocation"`. Fix: default
`const defaultFetch = (input, init) => fetch(input, init)` en ambos. Los unit tests (Node) no lo
detectaban; el E2E en chromium sí. Tras el fix, 15/15 E2E verdes.

## Cambios de infraestructura (justificados)

- **`react-router-dom`** añadido a `apps/web`: el design especifica redirect a `/login` y rutas
  protegidas; sin router no es implementable de forma limpia.
- **`jose`** añadido a `apps/api`: firma/verificación JWT.
- **`vite.config.ts` → `resolve.conditions: ['development']`**: el `vite build` de producción
  resolvía `@paulline/*` desde `dist` (CJS) y Rollup fallaba la detección de named exports del SDK.
  Resolviendo desde la condición `development` (source TS, igual que en dev y en Vitest) se elimina
  la fragilidad de interop CJS y se mantiene una sola fuente de verdad.
- **`packages/database`**: modelo `User` → `AuthCredential { id, encryptedToken, createdAt,
  updatedAt }`; primera migración versionada (`migrations/.../auth_credential_init`); scripts
  `db:migrate`/`db:deploy` añadidos; `db:reset` ahora usa `migrate reset`.
- **Env nuevas** (`packages/schemas/src/api-env.ts` + `ConfigService` getters + `.env.example`
  root y `apps/api/.env.example`): `AUTH_ENCRYPTION_KEY` (base64→32B), `AUTH_JWT_SECRET` (min 32),
  `AUTH_SESSION_TTL_SECONDS` (coerce int, default 86400). Solo vía `ConfigService` (nunca
  `process.env` directo).

## Trazabilidad de acceptance criteria (requirements.md)

- Login page renderizada (form + input + submit) — ✅ `LoginPage`/`LoginForm` + tests
- API key validada vía endpoint Cloudflare — ✅ adapter + smoke test live (401 real)
- Invalid key → mensaje de error exacto — ✅ filtro + UI + E2E
- Valid key encriptada en SQLite — ✅ AES-256-GCM + `encryptedToken`
- Session token creado + guardado en browser — ✅ JWT + localStorage
- Rutas protegidas requieren sesión — ✅ `SessionGuard` + `RequireAuth`
- Logout limpia sesión + redirige — ✅ `AuthService.logout` + `AuthContext.logout` + E2E
- Reload restaura sesión — ✅ hidratación localStorage + E2E
- API key NUNCA en logs/console — ✅ auditoría (sin `console.*`, sin leak en logs/tests, assert E2E)
- Tests cubren happy path + error — ✅ unit + E2E

## Notas para el reviewer

- El `logout` endpoint es público e idempotente (JWT stateless no se invalida server-side; solo
  limpia el registro de credencial). El cliente descarta el JWT. Documentado en el design (§2.3/§7).
- El `SessionGuard` está exportado y listo para proteger rutas de MACHINES/TUNNELS; en esta feature
  no hay endpoint protegido propio (auth es el habilitador), pero el guard tiene tests unitarios y
  el smoke test del filtro cubre el 401 `UNAUTHORIZED`.
- Warnings de "React Router v7 future flag" en stderr de tests: informativos, no afectan; no se
  opta a los flags para no cambiar comportamiento dentro de esta feature.
- Coverage numérico no instrumentado (igual que SETUP-001): cada servicio/adaptador/componente
  tiene tests asertivos directos sobre comportamiento (no solo "se ejecuta").
