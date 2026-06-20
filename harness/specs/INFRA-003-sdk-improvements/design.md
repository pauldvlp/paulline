# Design — INFRA-003: SDK Improvements (const as const)

**Feature ID:** INFRA-003
**Status:** in_progress

## Contexto

`packages/sdk/src/PaulineClient.ts` declara dos constantes de path de recurso sin
`as const`. Sin el assertion, TypeScript las infiere como `string` (tipo ancho),
perdiendo precisión. El cambio las literaliza a `'machines'` y `'tunnels'`.

## Decisión

Añadir `as const` a las declaraciones. No se requieren cambios en
`ResourceClient.ts`: su constructor acepta `resourcePath: string`, y un literal
type (`'machines'`) es asignable a `string`, por lo que sigue type-checkeando sin
ajustes.

## Alcance

- Compile-time only. Runtime sin cambios (los valores string son idénticos).
- Sin nuevos tests: la inferencia de tipos la cubre el compilador en strict mode.

## Trade-offs

- No se estrecha el tipo del parámetro de `ResourceClient` a una unión cerrada de
  paths; queda fuera de alcance de esta feature menor y no aporta valor inmediato.
