# Arquitectura — Paulline

## Visión técnica

Paulline es un **monorepo Node.js + TypeScript** con stack moderno y arquitectura hexagonal en backend:

- **Backend (NestJS + Hexagonal):** API REST que orquesta Cloudflare API, SSH a máquinas remotas, y monitoreo de uptime
- **Frontend (React + Atomic Design):** SPA con dashboard centralizado (status, uptime gráficas, CRUD tuneles/máquinas)
- **SDK agnóstico (PaulineClient):** cliente Supabase-like para comunicación frontend ↔ backend y futuros consumidores (CLI, plugins)
- **Base de datos (SQLite):** persistencia local de máquinas, tuneles, configuración
- **Validación centralizada (Zod):** esquemas como fuente única; tipos derivados back/front

Arquitectura modular desde v0.1 para facilitar escalado a multi-proveedor en v1.

## Estructura del repo

```
paulline/
├── apps/
│   ├── web/                           # Frontend React (Atomic Design)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── atoms/             # Button, Input, Badge, Icon, Label, Link…
│   │   │   │   ├── molecules/         # FormGroup, Card, NavBar, SearchBar…
│   │   │   │   ├── organisms/         # Header, Sidebar, Dashboard, TunnelList…
│   │   │   │   ├── templates/         # MainLayout, AuthLayout…
│   │   │   │   └── pages/             # Auth, Dashboard, Machines, Tunnels…
│   │   │   ├── hooks/                 # useAuth, useTunnels, useMachines…
│   │   │   ├── context/               # AuthContext, AppContext…
│   │   │   ├── utils/                 # helpers, formatters…
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                           # Backend NestJS (Hexagonal Architecture)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── domain/        # Entities, value objects, ports (interfaces), domain errors
│       │   │   │   ├── application/   # Use cases, DTOs, services (depend on ports, not impls)
│       │   │   │   └── infrastructure/# HTTP controller, Cloudflare adapter, DB adapter
│       │   │   ├── machines/
│       │   │   │   ├── domain/
│       │   │   │   ├── application/
│       │   │   │   └── infrastructure/
│       │   │   ├── tunnels/
│       │   │   │   ├── domain/
│       │   │   │   ├── application/
│       │   │   │   └── infrastructure/
│       │   │   └── monitoring/
│       │   │       ├── domain/
│       │   │       ├── application/
│       │   │       └── infrastructure/
│       │   ├── common/                # Shared filters, interceptors, pipes, exception handlers
│       │   └── main.ts                # Bootstrap
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Prisma schema (machines, tunnels, monitoring data)
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts               # Export PrismaClient
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── schemas/
│   │   ├── src/
│   │   │   ├── auth.schema.ts         # Zod: LoginRequest, AuthResponse…
│   │   │   ├── machines.schema.ts     # Zod: CreateMachine, UpdateMachine, MachineResponse…
│   │   │   ├── tunnels.schema.ts      # Zod: CreateTunnel, UpdateTunnel, TunnelResponse…
│   │   │   ├── monitoring.schema.ts   # Zod: UptimeData, StatusResponse…
│   │   │   └── index.ts               # Re-export all schemas
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/
│   │   ├── src/
│   │   │   ├── index.ts               # z.infer<typeof AuthResponse>, z.infer<typeof Machine>, etc.
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── sdk/
│       ├── src/
│       │   ├── client.ts              # PaulineClient class (main entry)
│       │   ├── endpoints/
│       │   │   ├── auth.ts            # .auth().login(…), .auth().logout()
│       │   │   ├── machines.ts        # .machines().list(), .machines().add(…), .machines().remove(…)
│       │   │   ├── tunnels.ts         # .tunnels().list(), .tunnels().create(…), .tunnels().update(…)
│       │   │   └── monitoring.ts      # .monitoring().uptime(tunnelId)
│       │   ├── errors.ts              # PaulineError, specific error types
│       │   └── index.ts               # Export PaulineClient
│       ├── package.json
│       └── tsconfig.json
│
├── harness/                           # Harness docs, config, backlog
├── pnpm-workspace.yaml                # Workspace configuration
├── docker-compose.yml                 # Local dev + prod setup
├── .gitignore
├── .env.example
└── README.md
```

**Regla de andamiaje:** cada workspace contiene **solo** lo que su propósito necesita.
- Un paquete de tipos/esquemas = `src/` + `package.json` + `tsconfig.json` — **sin** `app/`, `public/`, `prisma/`, `seeders/`, etc.
- No estampes el mismo esqueleto en todos los paquetes.

## Backend — Hexagonal por dominio

Cada módulo (`auth`, `machines`, `tunnels`, `monitoring`) sigue Hexagonal Architecture:

**`domain/`:** Core business logic (sin dependencias externas)
- Entidades (p. ej. `Machine`, `Tunnel`, `AuthToken`)
- Value objects (p. ej. `MachineIP`, `TunnelStatus`)
- **Puertos (interfaces):** `ICloudflarePort`, `IMachineRepository`, `ISshValidator`
- Errores de dominio: `MachineNotFound`, `InvalidSSHKey`, etc.

**`application/`:** Casos de uso (dependen de puertos, no de implementaciones)
- DTOs (Data Transfer Objects): `CreateMachineDto`, `UpdateTunnelDto`
- Servicios: `AuthService`, `MachineService`, `TunnelService`
- Lógica de orquestación

**`infrastructure/`:** Adaptadores concretos (ORM, HTTP, externos)
- HTTP controller (NestJS `@Controller`)
- Adaptadores: `CloudflareAdapter`, `SshAdapter`, `PrismaRepository`
- Mapeo entidad ↔ modelo ORM (nunca expongas el modelo ORM directamente)

**Regla de capas (boundaries):**
- `domain` no importa nada de afuera
- `application` solo importa `domain` (puertos, entidades)
- `infrastructure` importa `application` y `domain`

## Frontend

- **Framework:** React + TypeScript
- **Librería de componentes:** shadcn/ui (headless, accessible, estilizado con Tailwind)
- **Estilos:** Tailwind CSS (solo utilities; sin custom classes salvo justificación)
- **Arquitectura visual:** Atomic Design
  - **Atoms:** primitivas (Button, Input, Icon, Badge, Label…)
  - **Molecules:** pequeños composites (FormGroup, Card, NavItem…)
  - **Organisms:** secciones grandes (Header, Sidebar, DashboardSection…)
  - **Templates:** layouts (MainLayout, AuthLayout…)
  - **Pages:** vistas completas (Dashboard, Machines, Tunnels…)
- **Estado:** React Context (simple) o TanStack Query (para datos del servidor)
- **Datos:** **Siempre vía PaulineClient (SDK)**. Nada de fetch/HTTP directo en componentes.

## Contratos

**Zod es la fuente única:** esquemas en `packages/schemas/` definen la verdad.
- Backend valida requests/responses contra estos esquemas
- Frontend valida formularios contra estos esquemas
- SDK tipifica con tipos inferidos de Zod (`z.infer<typeof Schema>`)
- Un cambio de contrato se refleja en todas las superficies (schema → tipos → SDK → endpoints → UI)

## Datos

**ORM:** Prisma sobre SQLite
- Migrations versionadas en `packages/database/prisma/migrations/`
- Migraciones aplican limpio sobre BD vacía
- Modelo de datos: máquinas (IP, nombre, SSH status), tuneles (máquina, puerto, dominio, estado, uptimes), datos de monitoreo (24h histórico)

## Decisiones e invariantes

1. **Hexagonal en backend:** independencia de frameworks y detalles de implementación; testeable a nivel dominio
2. **Atomic Design en frontend:** escalabilidad, reutilización, coherencia visual
3. **SDK agnóstico:** PaulineClient es el único canal frontend ↔ backend; facilita multi-platform (CLI, plugins, móvil)
4. **Zod centralizado:** contrato único, validación compartida, DRY
5. **Monorepo con pnpm:** versionado unificado, facilita refactoring cross-package
6. **Dockerización desde v0.1:** reproducible en cualquier entorno (dev, prod, CI)
7. **Provider abstraction desde v0.1:** diseño que anticipa multi-proveedor (Ngrok, etc.) en v1 sin refactores mayores
