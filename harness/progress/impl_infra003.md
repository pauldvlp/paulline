# Impl log — INFRA-003: SDK Improvements (const as const)

**Rol:** implementer
**Estado:** in_review
**Fecha:** 2026-06-19

## Cambio aplicado

`packages/sdk/src/PaulineClient.ts` (líneas 5-6):

```diff
-const MACHINES_RESOURCE_PATH = 'machines';
-const TUNNELS_RESOURCE_PATH = 'tunnels';
+const MACHINES_RESOURCE_PATH = 'machines' as const;
+const TUNNELS_RESOURCE_PATH = 'tunnels' as const;
```

Ahora ambas constantes tienen tipo literal (`'machines'` / `'tunnels'`) en lugar
de `string`. Cumple FR-1 y FR-2.

## ResourceClient

Sin cambios. `constructor(... resourcePath: string ...)` acepta literal types
(asignable a `string`). No se requiere ajuste.

## Verificación

- `tsc --noEmit` (packages/sdk): 0 errores (EXIT 0).
- `vitest run` (PaulineClient.test.ts): 5/5 tests pasan.
- Runtime sin cambios (compile-time only).

## Notas

- No existe script `typecheck` en el paquete sdk; se verificó con
  `pnpm exec tsc --noEmit` directamente. Sugerencia opcional (fuera de alcance):
  añadir script `typecheck` al `package.json` del sdk.
- TDD: no se añadieron tests; la inferencia de tipos la cubre el compilador en
  strict mode (acorde a la spec).
