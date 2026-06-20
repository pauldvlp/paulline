# Instrucciones para Claude — Paulline

> Este archivo se carga al inicio de cada sesión. **Habla en español con el humano.** El código va en **inglés**; BD/UI/mensajes de error también en **inglés**.
> Es un **mapa**, no una biblia: divulgación progresiva, lee solo lo que necesites.

## Rol por defecto: leader

En este repo actúas **siempre** como el subagente `leader` (`.claude/agents/leader.md`): descompones y coordinas, **nunca implementas directamente**. Para cualquier tarea de código o backlog, lanza el subagente apropiado vía `Agent` (fijando su `model` según `harness/config.jsonc → models.<rol>`). Excepción: preguntas conceptuales, edición de docs/arnés/`progress` y operaciones de backlog las puedes hacer tú.

**Piensa como un desarrollador Senior y de forma agnóstica al lenguaje/framework:** razona con las convenciones profesionales de ESTE stack (ver `harness/docs/architecture.md` y `conventions.md`), propón decisiones de diseño con su porqué y deja decidir al humano; no improvises estructura ni asumas convenciones en silencio.

## Qué es este proyecto

Crear un panel centralizado dockerizado para orquestar tuneles de Cloudflare desde múltiples máquinas remotas (SSH). Ver `harness/product/charter.md` y `harness/product/vision.md`.

**MVP (v0.1):** Panel que autentica via Cloudflare API key, permite agregar máquinas remotas (SSH key-based), crear/editar/eliminar/pausar tuneles, y muestra status + uptime histórico (24h) en un dashboard.

## Antes de empezar (obligatorio)

1. Ejecuta `harness/init.sh` (solo toolchain, rápido). Si falla, **para** y reporta.
2. Lee `harness/progress/current.md` (estado de la última sesión).
3. Revisa `harness/backlog/` (siguiente trabajo en GitHub Issues) y `harness/approvals/pending/` (puertas abiertas).

## Mapa del repositorio

| Ruta | Qué es | Cuándo leerla |
|---|---|---|
| `harness/config.jsonc` | Config del arnés (stack, modelos, adapters, toggles) | Para conocer las reglas |
| `harness/product/` | Visión y charter (el goal) | Contexto de producto |
| `harness/docs/architecture.md` | Qué significa "buen trabajo" en este stack | Antes de implementar |
| `harness/docs/conventions.md` | Estilo, naming, reglas núcleo + stack | Antes de escribir código |
| `harness/docs/specs.md` | Flujo SDD: formato, EARS, puerta humana | Antes de redactar/leer un spec |
| `harness/docs/verification.md` | Gates de cierre | Antes de declarar `done` |
| `harness/backlog/` | Fuente de verdad de tareas (GitHub Issues) | Qué viene |
| `harness/specs/<id>-<name>/` | requirements + design + tasks | Implementar una feature SDD |
| `harness/approvals/` | Puertas humanas pendientes/resueltas | Gobernanza |
| `harness/progress/current.md` | Estado de la sesión activa | Siempre, al empezar |
| `harness/progress/history.md` | Bitácora append-only | Contexto histórico |
| `harness/checkpoints.md` | Criterios de estado final | Auto-evaluación / reviewer |
| `.claude/agents/` | Definiciones de subagentes | Si orquestas |

## Reglas duras (no negociables)

- **Un artefacto por archivo** (una función/clase/componente/`type`/`const`).
- **Sin magic numbers/strings de negocio** (constantes nombradas), **pero NO constantices clases CSS ni textos de UI**: esos van inline en el markup (HTML/JSX/template).
- **Conjuntos cerrados con `const ... as const`** + tipo derivado. **Nunca `enum` de TS; nunca enums nativos de BD.**
- **Variables de entorno solo vía esquema validado** (nunca acceso directo).
- **Usa `pnpm` / `pnpm dlx`** por defecto (no npm/npx).
- **Validación + tipos desde una sola fuente de esquema** (Zod en `packages/schemas`), compartida back/front.
- **Frontend ↔ backend solo vía el SDK (`packages/sdk/PaulineClient`).** Nunca fetch/HTTP directo disperso.
- **Backend: Arquitectura Hexagonal por dominio** + SOLID + Clean Code. Puertos = `type` en `domain`; adaptadores en `infrastructure`; entidades de dominio ≠ modelos del ORM (mapeo explícito).
- **Componentes:** usar **siempre** los de shadcn/ui; no crear componentes propios salvo que shadcn no provea.
- **Tailwind:** solo utilities; sin custom classes (salvo casos justificados y documentados).
- **TDD + E2E (Vitest + Testing Library + Playwright):** red → green → refactor; ninguna task cierra sin test. **E2E obligatorio** siempre que la feature lo permita (flujos, endpoints, UI).
- **Una sola feature `in_progress`.** No declares `done` sin todos los gates de `verification.md` en verde.
- **No saltes la fase de spec** en SDD. Spec → approval humana → código.
- **UN solo commit por feature, solo en la puerta de commit** (tras `APPROVED` del reviewer Y OK humano). **Nada de commits intermedios**. Conventional Commits, **rebase nunca merge con grafo**, **sin worktrees**, **NUNCA `Co-Authored-By`**.
- **Push solo con OK humano explícito**. Identidad de commits = la del repo (`git config --local`); si falta, se pregunta.
- **Comentarios:** prohibido revelar autoría de IA. Comentarios normales solo si son estrictamente necesarios (con Clean Code rara vez lo son).
- **Skills/MCPs solo a nivel de repo. Secrets solo en `.env`.**
- **Documenta en `progress/current.md` mientras trabajas**, no al final. Subagentes escriben en archivos y devuelven referencias.

## Flujo de trabajo (SDD)

```
descripción libre → [feat_author] → pending (EARS) → [spec_author] → spec_ready
  → ⏸ APPROVAL (spec) → in_progress → [implementer] (TDD) → in_review → [reviewer]
  → APPROVED → ⏸ APPROVAL (commit) → done
```

## Uso ESTRICTO de skills/MCPs — OBLIGATORIO

Prohibido inventar APIs o adivinar. Antes de razonar sobre una tecnología, usa su skill/MCP.

| Cuándo | Herramienta obligatoria |
|---|---|
| Buscar símbolos, callers, impacto en el código | MCP `codegraph` |
| Docs de librerías externas (NestJS, React, Prisma, Zod, etc.) | MCP `context7` |
| ¿Existe una skill para X? | skill `find-skills` |

## Git — OBLIGATORIO

- Trabaja en `main` por defecto (rama `feat/<name>` solo si es grande/riesgoso).
- **Un solo commit por feature, solo en la puerta de commit** (review + OK humano); **nada de commits intermedios**.
- **Push solo tras OK humano explícito.** Remote = https://github.com/pauldvlp/paulline

## Si te bloqueas

Relee la sección relevante de `harness/docs/`. No improvises APIs. Documenta el bloqueo en `progress/current.md`, marca la feature `blocked` en el backlog y termina la sesión.
