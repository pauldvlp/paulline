# Paulline — Visión (North Star)

> A dónde queremos llevar Paulline a largo plazo. Esto orienta todas las fases del `roadmap.md`; cambia poco.

## El problema

Configurar tuneles de Cloudflare manualmente para múltiples máquinas locales es tedioso, repetitivo y propenso a errores. Los desarrolladores necesitan exponer servicios en máquinas heterogéneas (home server, cloud instance, local dev) bajo un dominio compartido, pero Cloudflare Tunnel no ofrece un panel centralizado — todo se configura por máquina.

## Para quién

Desarrolladores de todos los ecosistemas (Node, Python, Go, Rust, etc.) que necesitan exponer servicios locales vía dominios públicos, desde una única máquina central, sin gestionar tuneles manualmente en cada host.

## La propuesta de valor

Una web app centralizada e instalable localmente que:
- **Agrega máquinas remotas** (via SSH) desde una sola interfaz
- **Crea y gestiona tuneles de Cloudflare** sin configuración manual por máquina
- **Muestra estado, uptime y métricas** de todos los servicios en un dashboard unificado
- **Es reproducible en cualquier entorno** via Docker

## Por qué ahora

Cloudflare Tunnel es gratis y poderoso, pero la UX es baja: hoy requiere SSH a cada máquina + configurar `cloudflared` manualmente. Hay una brecha clara entre la herramienta y la experiencia del usuario — Paulline cierra esa brecha.

## Métricas de éxito

1. **Velocidad de setup:** un usuario puede crear un tunel completo en < 1 minuto desde el dashboard
2. **Observabilidad en tiempo real:** el dashboard muestra estado + uptime de todos los tuneles sin retrasos
3. **Adopción:** devs de múltiples ecosistemas usan Paulline como su herramienta estándar para exponer servicios locales
4. **Confiabilidad:** uptime > 99% de Paulline en el host central; tuneles se recuperan automáticamente si se caen
