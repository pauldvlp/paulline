# Tasks — INFRA-002: Frontend Stack

Estado: implementado (in_review). TDD: red → green → refactor.

| # | Tarea | FR | Verificación | Estado |
|---|-------|----|--------------|--------|
| T1 | Instalar deps: `react-hook-form`, `@hookform/resolvers`, `@radix-ui/react-label`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` en `@paulline/web` | FR-1 | deps en `apps/web/package.json` + lockfile | done |
| T2 | Instalar dev dep `@testing-library/user-event` para tests de interacción | FR-3 | dep en package.json | done |
| T3 | Crear util `cn` (clsx + tailwind-merge) en `src/lib/cn.ts` | FR-2 | typecheck | done |
| T4 | Componente `ui/Button.tsx` (cva + Slot, variants/sizes) | FR-2 | render en tests | done |
| T5 | Componente `ui/Input.tsx` (forwardRef) | FR-2 | render en tests | done |
| T6 | Componente `ui/Label.tsx` (radix Label) | FR-2 | render en tests | done |
| T7 | Componente `ui/FormField.tsx` (Controller RHF + Label + Input + error a11y) | FR-2, FR-3, NFR-1 | tests validación | done |
| T8 | Molecule `molecules/FormGroup.tsx` (layout `<form>`) | AC | render en tests | done |
| T9 | Definir `loginSchema` real en `packages/schemas/src/auth.ts` + `LoginInput` en `packages/types` (fuente única) | FR-4 | typecheck monorepo | done |
| T10 | Test `organisms/LoginForm.test.tsx` (render, validación, submit) — RED primero | FR-3 | 3 tests verdes | done |
| T11 | Organism `organisms/LoginForm.tsx` (useForm + zodResolver(loginSchema), prop onSubmit) — GREEN | FR-3, FR-4 | tests verdes | done |
| T12 | Verificación: `pnpm -r lint`, `tsc --noEmit` monorepo, suite completa, grep custom CSS; referenciar LoginForm en App.tsx (comentado) | AC, NFR-2 | todo verde | done |

## Resultados de verificación
- Tests web: 4/4 verdes (App 1, LoginForm 3).
- Suite monorepo: 16/16 verdes.
- `pnpm -r exec tsc --noEmit`: 0 errores.
- `pnpm -r lint`: 6/6 proyectos OK.
- Custom CSS / `@apply`: 0 encontrados.
