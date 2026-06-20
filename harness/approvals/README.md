# Approvals — Puertas Humanas

Aquí se documentan aprobaciones requeridas por el arnés: charter, specs, commits, instalaciones.

## Estructura

```
approvals/
├── pending/
│   ├── charter-v0.1.md          # Charter en espera (fase inicial)
│   └── ...
└── resolved/
    ├── charter-v0.1-APPROVED.md  # Charter aprobado (histórico)
    └── ...
```

## Estados

- **pending/:** Abierta, esperando OK humano
- **resolved/:** Cerrada (APPROVED o REJECTED), histórico

## Workflow

1. **Feature propuesta** → spec redactada → approval abierta
2. **Humano revisa** → comentarios/cambios solicitados
3. **Alineación** → cambios aplicados
4. **OK humano** → archivo se mueve a `resolved/` con sufijo `-APPROVED` o `-REJECTED`

## Gates activos (harness/config.jsonc)

- ✅ **charter:** aprobación del charter antes de scaffolding
- ✅ **spec:** aprobación de specs antes de implementar
- ✅ **commit:** revisión + OK humano antes de push
- ✅ **install:** aprobación antes de instalar skills/MCPs
