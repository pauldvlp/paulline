# Paulline — Charter

> Goal: Crear un panel centralizado para orquestar tuneles de Cloudflare desde múltiples máquinas.
> Visión a largo plazo → `vision.md` · Fases del producto → `roadmap.md`

## Milestone actual: v0.1 — MVP

**Objetivo de esta fase:** Entregar un panel funcional que permite a un usuario autenticado agregar máquinas remotas, crear y gestionar tuneles de Cloudflare, y monitorear estado + uptime desde un dashboard unificado.

### Alcance de esta fase

1. **Auth Cloudflare:** Integración via API key; usuario ingresa la clave en la interfaz
2. **Gestión de máquinas:**
   - Agregar máquina: IP, validar conectividad SSH (sin contraseña, key-based)
   - Paulline ayuda a generar/instalar SSH keys en la máquina remota
   - Ver lista de máquinas, eliminar máquina
3. **Gestión de tuneles (CRUD completo):**
   - Crear: seleccionar máquina → puerto → dominio Cloudflare → subdominio
   - Ver lista de todos los tuneles (máquina, puerto, dominio, estado)
   - Editar: cambiar puerto, dominio, subdominio
   - Eliminar tunel
   - Pausar/reanudar tunel
4. **Dashboard:**
   - Status actual de cada tunel (online/offline)
   - Gráfico de uptime histórico (últimas 24h) por tunel
   - Información: máquina, puerto, dominio público, última comprobación
5. **Persistencia:** SQLite local (máquinas, tuneles, configuración)
6. **Autenticación local:** usuario + contraseña (single-user)
7. **Dockerización:** app completamente dockerizada desde el inicio

### NO-objetivos de esta fase (explícito)

Lo que **deliberadamente NO entra en v0.1**, se pospone:
- Logs detallados por tunel
- Alertas / notificaciones
- Soporte multi-proveedor (Ngrok, etc.)
- Multi-usuario / RBAC
- Respaldos / snapshots de configuración
- Métricas avanzadas (latencia, ancho de banda)
- Integración con otros servicios

## Estrategia (cómo abordamos esta fase)

1. **Arquitectura:** Backend centralizado (API REST) + frontend web (SPA). Backend orquesta:
   - Conexiones SSH a máquinas remotas (valida, genera keys)
   - Llamadas a Cloudflare API (crea/edita/elimina tuneles)
   - Monitoreo de uptime (checks periódicos)
2. **Stack recomendado:** Node.js + TypeScript (backend), React/Vue (frontend), SQLite (BD), Docker (deployment)
3. **Modularidad:** diseñar abstracción de "provider" desde v0.1 para facilitar multi-proveedor en v1
4. **Observabilidad:** logs de operaciones (creación de tunel, cambios de máquina), pero no logs de tráfico aún
5. **Desarrollo:** TDD/E2E para flujos críticos (auth, crear tunel, uptime)

## Restricciones

- **Plazos:** Sin plazos definidos; ritmo autoimpuesto
- **Presupuesto / tope de gasto IA:** Sin límite presupuestario
- **Integraciones obligatorias:** Cloudflare API (v0 usa solo su API estándar; future: Cloudflare GraphQL si escala)
- **Compliance / privacidad:** Datos de usuarios (API keys, máquinas, tuneles) almacenados localmente en SQLite; no hay cloud sync inicial
- **Idioma de dominio:** Código, UI, BD, errores → **inglés**
- **Equipo:** Solo desarrollador (el usuario); código abierto

## Riesgos / incógnitas

1. **Orquestar SSH en máquinas heterogéneas:** sistemas operativos diferentes, configuraciones SSH variables, permisos de firewall. **Mitigación:** validaciones exhaustivas, mensajes de error claros, documentación de requerimientos SSH.
2. **Sincronización de estado con Cloudflare API:** tuneles creados manualmente en Cloudflare fuera de Paulline, o cambios en la API. **Mitigación:** resync on-demand, logs de cambios, validación periódica.
3. **Monitoreo de uptime en tiempo real:** mantener checks frecuentes sin sobrecargar la máquina central. **Mitigación:** rate limiting inteligente, cachés de estado, workers background.
4. **Escalabilidad futura:** pasar de single-machine a multi-proveedor sin refactorizar toda la arquitectura. **Mitigación:** abstraer "provider" desde v0.1.

## Backlog inicial de esta fase (esbozo)

Será detallado y priorizado tras Fase 1 (decisiones técnicas) y aprobación de charter:

1. **Setup (infraestructura):** Monorepo (backend + frontend + shared), toolchain, Docker, CI/CD base
2. **Core - Auth:** Integración Cloudflare API key, validación, rotación
3. **Core - Máquinas:** Backend para CRUD, SSH connectivity validator, key generation/installation wizard
4. **Core - Tuneles:** Backend CRUD, Cloudflare API wrapper, estados (online/offline/paused)
5. **Core - Uptime:** Checker background, almacenamiento de datos 24h, cálculos de porcentaje
6. **UI - Dashboard:** Layout principal, lista de tuneles, lista de máquinas, status indicators, uptime gráficas
7. **UI - Forms:** Auth form, add machine form, create tunnel form, settings
8. **Integration & Polish:** E2E tests, error handling, docs, Docker image, initial GitHub release
