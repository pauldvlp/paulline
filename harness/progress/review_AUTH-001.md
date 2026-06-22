# Review — AUTH-001: Cloudflare API Authentication

**Reviewer:** reviewer subagent
**Estado revisado:** `in_review`
**Fecha:** 2026-06-22
**Veredicto final:** ✅ **APPROVED (8/8 gates)**

Revisión contra `requirements.md` + `design.md` (ambos APPROVED) y los 8 gates de
`harness/docs/verification.md`. Se inspeccionó el código fuente real (no solo el log del
implementer) y se re-ejecutaron tests + typecheck localmente.

---

## Gate 1 — Spec Compliance ✅

Todos los FR y NFR implementados y trazables al código:

| Req | Evidencia |
|---|---|
| FR-1 input API key | `LoginForm.tsx` (campo único `apiToken`, type=password) + `POST /auth/login` |
| FR-2 stored encrypted | `AesTokenCipherAdapter` (AES-256-GCM) → `AuthCredential.encryptedToken`; plaintext nunca persistido |
| FR-3 session created | `JwtSessionIssuerAdapter.issue` (HS256, `jose`) + `AuthContext` |
| FR-4 requests include key | `AuthService.getActiveToken()` desencripta para llamadas Cloudflare (plumbing para MACHINES/TUNNELS; ver Hallazgo H1) |
| FR-5 invalid → error | `InvalidApiTokenError` con el mensaje exacto → filtro → SDK → UI; E2E asserta el string literal |
| FR-6 logout | `AuthService.logout()` (`repository.clear()`) + `AuthContext.logout()` limpia localStorage |
| FR-7 persist reload | `AuthProvider` hidrata `paulline.sessionToken` de localStorage en init; E2E reload verde |
| NFR timeout <2s | `VERIFY_TIMEOUT_MS = 2000` con `AbortController` |
| NFR rate limit 1/s | `MIN_CALL_INTERVAL_MS = 1000` throttle in-memory en el adapter |
| NFR no-log | sin `console.*` ni logger en source de auth (verificado repo-wide) |

Acceptance Criteria de `requirements.md`: 10/10 cubiertos.

## Gate 2 — Diseño vs Código ✅

El código respeta `design.md` punto por punto:
- Estructura de carpetas hexagonal **idéntica** a §3 del design.
- AES-256-GCM, IV 12B aleatorio, formato `iv:authTag:ciphertext` base64 (§2.2) ✓
- JWT stateless HS256, `sub` = id de credencial, sin material secreto (§2.3) ✓
- localStorage para persistencia (§2.4) ✓
- Cloudflare `GET /client/v4/user/tokens/verify`, solo `status:"active"` válido (§2.5/§3) ✓
- Prisma `AuthCredential` reemplaza `User`; modelo placeholder eliminado por completo ✓
- Inyección por símbolos de puerto (DI hexagonal) ✓

## Gate 3 — Calidad de Código ✅

- **TDD:** 92 unit tests (api 41, web 16, sdk 21, schemas 14) — re-ejecutados, **todos verdes**.
  Nota: el log decía 81; el conteo real es mayor (más cobertura, no menos).
- **Tests asertivos:** round-trip de cipher con ciphertext distinto por IV, tamper falla en
  decrypt, JWT expirado/manipulado falla, propagación de `InvalidApiTokenError` sin llamar `save`.
- **Domain aislado:** verificado — `domain/` no importa nada externo (ni NestJS, ni jose, ni Prisma).
- **Convenciones:** un artefacto por archivo, constantes nombradas (sin magic numbers), conjuntos
  cerrados sin `enum`, Zod como fuente única en `packages/schemas`, textos de UI inline en JSX.
- **Sin dead code** relevante; `getActiveToken` es plumbing intencional (no dead code, ver H1).
- **Typecheck:** `pnpm lint` (tsc --noEmit) limpio en los 6 workspaces.
- Sin `Co-Authored-By`; sin comentarios que revelen IA/arnés.

## Gate 4 — Integración ✅

- SDK `PaulineClient.auth()` → `AuthClient` dedicado; frontend lo consume vía `AuthContext`.
- Tipos `LoginInput`/`AuthSession` inferidos de Zod en `packages/types`.
- Prisma migración versionada (`20260622161417_auth_credential_init/migration.sql`) presente.
- Env validado vía `ConfigService` getters (nunca `process.env` directo).
- React Hook Form + zodResolver (INFRA-002), shadcn primitives, Playwright (INFRA-004) integrados.

## Gate 5 — Seguridad ✅

- API token NUNCA logueado: sin `console.*`/logger en todo el source de auth/sdk/context (grep repo-wide).
- Encryption reversible (AES, correcto vs hash — el token debe recuperarse para FR-4).
- JWT no contiene secreto (solo `sub`/`iat`/`exp`).
- Filtro de excepciones redacta errores desconocidos a `INTERNAL_ERROR` 500 sin filtrar el mensaje original.
- Guard valida JWT (firma + exp + presencia de `sub`) antes de permitir acceso.
- Validación de entrada server-side vía `ZodValidationPipe` (no confía en cliente).
- E2E asserta que el token no aparece en page content ni en console logs.

## Gate 6 — Performance ✅

- Verify timeout 2000ms con `AbortController` (cumple NFR <2s).
- Throttle 1/s implementado en el adapter (cumple NFR rate-limit).
- Bundle: `vite build` de producción OK (reportado; lint/build verdes).

## Gate 7 — Documentación ✅

- `impl_AUTH-001.md` documenta decisiones técnicas, el bug cazado por E2E (binding de `fetch`),
  cambios de infraestructura justificados (`react-router-dom`, `jose`, vite conditions) y trazabilidad.
- Tests sirven de documentación de contrato de endpoints.

## Gate 8 — Reproducibilidad ✅

- `pnpm test` verde (92 unit, re-ejecutado en esta review).
- `pnpm lint` verde (6 workspaces).
- Migración Prisma versionada y presente.
- E2E (15: 5 escenarios × 3 navegadores) reportado verde; el spec de Playwright revisado cubre
  los 5 escenarios del design §9 con stub determinista offline.

---

## Hallazgos

- **H1 (informativo, no blocker):** `AuthService.getActiveToken()` está implementado y testeado
  pero aún no lo consume ningún endpoint. Es correcto y esperado: el design lo declara explícitamente
  como habilitador de FR-4 para MACHINES/TUNNELS. No es dead code.
- **H2 (informativo):** El conteo de tests real (92) supera al del log del implementer (81). A favor.
- **H3 (informativo):** Warnings de "React Router v7 future flag" en stderr de tests; informativos,
  no afectan comportamiento (ya anotado por el implementer).

## Recomendaciones (hardening futuro, NO blockers)

1. **httpOnly cookie + CSRF** en lugar de localStorage para el JWT (ya anotado en design §10 como
   futura mejora de seguridad). Aceptable para MVP single-user local.
2. **Rotación de credenciales / multi-credential** — explícitamente Non-Scope v0.1.
3. Considerar instrumentar coverage numérico real en una pasada futura (hoy se confía en tests
   asertivos directos, consistente con SETUP-001).
4. Al introducir el primer endpoint protegido (MACHINES-001), añadir un test de integración que
   ejercite `getActiveToken()` end-to-end para cerrar la trazabilidad de FR-4.

---

## Veredicto

**✅ APPROVED (8/8 gates en verde).** Listo para la puerta de commit. Implementación sólida,
hexagonal estricta, segura para el alcance del MVP, sin blockers.
