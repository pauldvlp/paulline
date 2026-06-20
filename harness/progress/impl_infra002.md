# Impl log — INFRA-002 (implementer)

## Resumen
Frontend stack (shadcn/ui base + React Hook Form + Zod) instalado y demostrado con
LoginForm. TDD red→green→refactor. Sin commits.

## Archivos creados/modificados
- `packages/schemas/src/auth.ts` — `loginSchema` real (reemplaza placeholder). Fuente única.
- `packages/types/src/index.ts` — `LoginInput = z.infer<typeof loginSchema>` (reemplaza AuthPlaceholder).
- `apps/web/package.json` — +RHF, @hookform/resolvers, radix label/slot, cva, clsx, tailwind-merge, user-event.
- `apps/web/src/lib/cn.ts` — util cn.
- `apps/web/src/components/ui/Button.tsx` `Input.tsx` `Label.tsx` `FormField.tsx`.
- `apps/web/src/components/molecules/FormGroup.tsx`.
- `apps/web/src/components/organisms/LoginForm.tsx` + `LoginForm.test.tsx`.
- `apps/web/src/App.tsx` — import LoginForm comentado (lo cablea AUTH-001).
- `harness/specs/INFRA-002-frontend-stack/{tasks.md,design.md}`.

## Verificación (gates)
- Tests web: 4/4 verdes. Suite monorepo: 16/16 verdes.
- `pnpm -r exec tsc --noEmit`: 0 errores.
- `pnpm -r lint`: 6/6 OK.
- Custom CSS/@apply: 0.

## Decisiones que requieren visto bueno del leader
1. **`loginSchema` introducido en INFRA-002** (no placeholder). Necesario para FR-3/FR-4 sin
   depender de AUTH-001 (que INFRA-002 bloquea). AUTH-001 deberá extenderlo, no duplicarlo.
2. **`LoginForm` recibe `onSubmit` por prop** en lugar de llamar `pauline.auth().login()`
   directamente: el SDK aún no expone `.auth()`. AUTH-001 inyectará el handler del SDK.
3. Imports relativos en componentes shadcn (no alias `@/`) para no romper paths del monorepo.

## Estado
in_review (pendiente reviewer + puertas de approval/commit del leader).
