# Infra Remediation — 4 Features (Opción B: Audit)

**Generado por:** `/paulness audit --fix` (read-only → features draft)  
**Origen:** audit_2026-06-19.md (hallazgos de convenciones)  
**Estado:** pending backlog  

## Features

| ID | Título | Severidad | Requisitos | Estado |
|----|---------|-----------|----|--------|
| INFRA-001 | Arquitectura Hexagonal en módulo Health | Importante | 8 ACs | spec_ready |
| INFRA-002 | Frontend Stack Setup (shadcn/ui + React Hook Form) | Bloqueante | 8 ACs | spec_ready |
| INFRA-003 | SDK Improvements (const as const) | Menor | 4 ACs | spec_ready |
| INFRA-004 | E2E Scaffold (Playwright Setup) | Importante | 9 ACs | spec_ready |

## Orden Recomendado

1. **INFRA-002** primero (bloqueante; desbloquea AUTH-001)
2. **INFRA-001** (arquitectura consistente; independiente)
3. **INFRA-004** (infrastructure; independiente)
4. **INFRA-003** (menor; cosmético; puede ir al final)

## Próximo Paso

Tras confirmación de specs:

```bash
/paulness next
→ INFRA-002 SDD workflow (spec_ready → APPROVAL → in_progress → review → ship)
```

SETUP-001 queda en `APPROVED` estado hasta que remedios completados + single commit de ambos (SETUP-001 + INFRA remediaciones).

## Notas

- **SETUP-001 bloqueado hasta remedios.** Por convención, no se commitea hasta que todas las violaciones (bloqueantes) resueltas.
- Cada feature sigue SDD full: spec → implementer (TDD) → reviewer → approval commit.
- Tras completar 4 features: `/paulness ship` el combo (SETUP-001 + INFRA remediaciones en un commit).
