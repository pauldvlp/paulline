# Requirements — INFRA-003: SDK Improvements (const as const)

**Feature ID:** INFRA-003  
**Status:** pending  
**Severity:** Menor  
**Blocker for:** Nada (cosmético)  

## Descripción

Constantes en `packages/sdk/src/PaulineClient.ts` (`MACHINES_RESOURCE_PATH`, `TUNNELS_RESOURCE_PATH`) carecen de `as const`, lo que reduce precisión de tipos. Deben literalizarse para que TypeScript infiera tipos string literales en lugar de `string` genérico.

## Requisitos Funcionales (EARS)

**FR-1: Constantes con tipo literal**
- GIVEN `MACHINES_RESOURCE_PATH` y `TUNNELS_RESOURCE_PATH` 
- WHEN se inspeccionan sus tipos 
- THEN tipo es `'machines'` (literal) no `string`

**FR-2: Tipos actualizados en ResourceClient**
- GIVEN PaulineClient.machines() / .tunnels() 
- WHEN se pasa resourcePath a ResourceClient 
- THEN parámetro type-checks correctamente (literal types)

## Requisitos No Funcionales (EARS)

**NFR-1: Precisión de tipos**
- TypeScript strictNullChecks + strict mode active; sin `@ts-ignore` workarounds

**NFR-2: Compatibilidad**
- Runtime behavior sin cambios (solo tipos)

## Criterios de Aceptación

- [ ] `packages/sdk/src/PaulineClient.ts` líneas 5-6: `as const` añadido a MACHINES_RESOURCE_PATH y TUNNELS_RESOURCE_PATH
- [ ] `packages/sdk/src/ResourceClient.ts` tipos de resourcePath parámetro actualizado si aplica
- [ ] PaulineClient.test.ts pasa (type inference verified)
- [ ] `pnpm -r typecheck` sin errores
- [ ] No hay cambios en runtime behavior

## Trazabilidad

| FR/NFR | Test | Verificación |
|--------|------|--------------|
| FR-1 | (tipo) | TypeScript infer literal type |
| FR-2 | (types) | ResourceClient constructor accepts literal |
| NFR-1 | pnpm typecheck | Strict mode: 0 errors |
| NFR-2 | PaulineClient.test.ts | Tests pass; methods work same |
