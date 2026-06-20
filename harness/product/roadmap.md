# Paulline — Roadmap

> Las features del backlog se agrupan por `milestone`. El milestone **activo** es el que se construye ahora. Al completarse, se planea el siguiente — Paulline nunca se "queda" en el MVP.

| Fase | Objetivo | Estado | Features (resumen) |
|---|---|---|---|
| **v0.1 — MVP** | Panel funcional: Cloudflare auth, agregar máquinas, CRUD tuneles, dashboard status + uptime 24h | active | Cloudflare API integration, SSH machine management, tunnel CRUD, uptime monitoring, SQLite persistence |
| **v1** | Observabilidad mejorada: logs por tunel, alertas, refinamiento UI/UX | planned | Tunel logs, email alerts, improved dashboard, advanced filtering |
| **v2** | Multi-proveedor: soporte Ngrok y otros; escalabilidad | planned | Ngrok integration, provider abstraction, advanced provisioning |
| **mantenimiento** | Estabilidad, deuda técnica, soporte comunitario | future | Bug fixes, refactoring, community support |

Estados de milestone: `active` · `planned` · `done` · `future`.

## Milestone activo: v0.1 — MVP

**Objetivo:** Crear un panel centralizado funcional que permita a un usuario autenticado agregar máquinas remotas (via SSH), crear tuneles de Cloudflare y ver el estado + uptime 24h de todos los tuneles en un dashboard.

**Criterio de "fase completa":** 
- ✅ Auth Cloudflare via API key funcional
- ✅ CRUD completo de máquinas (agregar, validar SSH, eliminar)
- ✅ CRUD completo de tuneles (crear, editar, eliminar, pausar/reanudar)
- ✅ Dashboard muestra status actual + gráficos de uptime 24h para cada tunel
- ✅ App dockerizada y reproducible
- ✅ Testes de integración para flujos críticos

<!-- Al cerrar todas las features del milestone activo, el leader lo marca `done`, activa v1 y propone con feat_author las features de esa fase. -->
