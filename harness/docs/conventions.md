# Convenciones — Paulline

## Núcleo de proceso (fijo)

- **Un artefacto por archivo** (una función/clase/componente/`type`/`const`).
- **Sin magic numbers / magic strings de negocio**: extrae a constantes los valores con significado (límites, claves, configs). **No sobre-constantices:** las **clases CSS** y los **textos estáticos de UI** van **inline en el markup** (HTML/JSX), nunca en `const`.
- **Conjuntos cerrados como `const ... as const`** + tipo derivado. **Nunca `enum` de TypeScript; nunca enums nativos de la BD** (usar `varchar` + CHECK).
- **Variables de entorno solo vía esquema validado.** Nunca acceso directo (`process.env.X` sin validar).
- **Higiene de commits:** Conventional Commits; **nunca `Co-Authored-By`**; rebase nunca merge con grafo.
- **Comentarios:** prohibido cualquier comentario que revele autoría de IA (claude/codex/harness/tasks). Comentarios de código que explican algo SÍ se permiten, **solo cuando son estrictamente necesarios** (con Clean Code casi nunca hacen falta).
- **Tooling por defecto `pnpm` / `pnpm dlx`** (no npm/npx).
- **Memoria externa:** documenta en `progress/current.md` mientras trabajas.

## Idioma

- **Código, identificadores, commits, keys del API:** inglés
- **BD (nombres físicos), UI y mensajes de error de usuario:** inglés (globalmente accesible)
- **Forma de error del API:** `{ "error": { "code": "ERROR_CODE", "message": "User-friendly message" } }`

## Naming y tipos

### Backend (NestJS + Hexagonal)

- **Clases de dominio:** PascalCase (singular): `Machine`, `Tunnel`, `AuthToken`
- **Interfaces/puertos:** prefijo `I` + PascalCase: `ICloudflarePort`, `IMachineRepository`, `ISshValidator`
- **Servicios:** PascalCase + `Service`: `AuthService`, `MachineService`, `TunnelService`
- **Controllers:** PascalCase + `Controller`: `AuthController`, `MachinesController`, `TunnelsController`
- **DTOs:** PascalCase + `Dto`: `CreateMachineDto`, `UpdateTunnelDto`, `LoginDto`
- **Decoradores:** camelCase: `@ValidateIp()`, `@CheckSshKey()`
- **Utilidades:** camelCase + función: `mapEntityToResponse()`, `generateUptimeGradient()`
- **Enums:** PascalCase, valores const-as-const: `const MachineStatus = { ONLINE: 'online', OFFLINE: 'offline' } as const`

### Frontend (React + Atomic Design)

- **Componentes:** PascalCase (siempre): `Button`, `Card`, `Header`, `DashboardPage`
- **Hooks:** camelCase + `use`: `useAuth`, `useTunnels`, `useMachines`, `useUptimeData`
- **Contextos:** PascalCase + `Context`: `AuthContext`, `AppContext`
- **Funciones utilitarias:** camelCase: `formatUptime()`, `getTunnelStatusColor()`, `validateIpAddress()`
- **Archivos de componentes:** PascalCase (siempre): `Button.tsx`, `Header.tsx`, `DashboardPage.tsx`

### Esquemas & Tipos

- **Esquemas Zod:** PascalCase + `Schema`: `LoginSchema`, `CreateMachineSchema`, `TunnelResponseSchema`
- **Tipos inferidos:** PascalCase (desnudo, sin sufijo): `Login`, `Machine`, `Tunnel`, `UptimeData`
- **Tipos de unión cerrados:** `const Status = { ... } as const; type Status = typeof Status[keyof typeof Status]`

## Contratos y validación

- **Zod es la fuente única:** esquemas en `packages/schemas/` definen la verdad
- **Backend:** validación de params/body contra esquemas Zod (`@Body() body: LoginSchema`)
- **Frontend:** validación de formularios contra esquemas Zod (librerías como react-hook-form + Zod)
- **Tipos compartidos:** inferidos de esquemas (`type Login = z.infer<typeof LoginSchema>`)

## Backend — Hexagonal Architecture

- **SOLID + Clean Code:** S(ingle Responsibility), O(pen/Closed), L(iskov), I(nterface Segregation), D(ependency Inversion)
- **Repositorios = puertos** (`IRepository`): definidos en `domain/` como interfaces, implementados en `infrastructure/`
- **Entidades de dominio ≠ modelos ORM:** mapeo explícito (p. ej. `mapPrismaUserToEntity()`)
- **Regla de capas:** domain → application → infrastructure (nunca hacia atrás)

## Frontend — React + Atomic Design + React Hook Form + Zod

### Estructura Atomic
- `atoms/` → primitivas (Button, Input, Badge, Icon…) — **sin business logic, sin form state**
- `molecules/` → combos simples (FormGroup, Card…) — **display-only, no form logic**
- `organisms/` → secciones complejas (Header, Sidebar, Dashboard, forms…) — **form state + RHF vive aquí**
- `templates/` → layouts (MainLayout, AuthLayout…)
- `pages/` → vistas completas (route components)

### Componentes & shadcn/ui
- **Usar shadcn siempre** para Button, Input, Card, Select, Checkbox, etc.
- **No crear propios** salvo que shadcn no lo provea; entonces, construir sobre primitivas de shadcn (Radix UI)
- **Estilos:** solo Tailwind utilities; sin custom classes salvo casos justificados (p. ej. font-face, documentados)

### Forms: React Hook Form + Zod Pattern
**Todos los formularios siguen este patrón:**

1. **Esquema Zod en `@paulline/schemas`** (single source of truth)
   ```typescript
   // packages/schemas/src/machines.ts
   export const createMachineSchema = z.object({
     ip: z.string().ip("Invalid IP address"),
     name: z.string().min(1, "Name is required"),
   });
   export type CreateMachineInput = z.infer<typeof createMachineSchema>;
   ```

2. **Componente forma (Organism) usa React Hook Form + Zod resolver**
   ```typescript
   // apps/web/src/components/organisms/AddMachineForm.tsx
   import { useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { createMachineSchema } from "@paulline/schemas";
   import { Form, FormField } from "@/components/ui/form"; // shadcn Form wrapper
   
   export function AddMachineForm() {
     const form = useForm({
       resolver: zodResolver(createMachineSchema),
       defaultValues: { ip: "", name: "" },
     });
   
     async function onSubmit(data: CreateMachineInput) {
       await paulline.machines().add(data);
     }
   
     return (
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField control={form.control} name="ip" render={...} />
           <FormField control={form.control} name="name" render={...} />
           <Button type="submit">Add Machine</Button>
         </form>
       </Form>
     );
   }
   ```

3. **Molecule FormGroup (opcional, para reutilización)**
   ```typescript
   // apps/web/src/components/molecules/FormGroup.tsx
   interface FormGroupProps {
     label: string;
     error?: string;
     children: ReactNode;
   }
   export function FormGroup({ label, error, children }: FormGroupProps) {
     return (
       <div className="flex flex-col gap-1">
         <Label>{label}</Label>
         {children}
         {error && <span className="text-sm text-red-600">{error}</span>}
       </div>
     );
   }
   ```

- **No en carpetas compartidas:** estados compartidos via Context o TanStack Query, no archivos

## Tests

- **Runner:** Vitest
- **Librería:** Testing Library
- **E2E:** Playwright (para flujos críticos)
- **TDD obligatorio:** red → green → refactor
- **Cobertura:**
  - Servicios y casos de uso: unit tests (mocks de puertos)
  - Componentes React: tests + visual (shadcn es accesible out-of-box)
  - Flujos E2E: login → crear tunel → ver en dashboard
- **Ninguna task cierra sin test** (coverage > 80% en áreas críticas)

## Archivos & Estructura

### Backend

```
apps/api/
├── src/
│   ├── modules/
│   │   └── <domain>/
│   │       ├── domain/
│   │       │   ├── entities/           # Domain entities
│   │       │   ├── ports/              # Interfaces (IRepository, etc.)
│   │       │   └── errors/             # Domain-specific errors
│   │       ├── application/
│   │       │   ├── services/           # Use cases
│   │       │   ├── dtos/               # Data transfer objects
│   │       │   └── mappers/            # Entity ↔ DTO
│   │       ├── infrastructure/
│   │       │   ├── adapters/           # Implementations (Prisma, Cloudflare, SSH)
│   │       │   ├── controllers/        # HTTP controllers (NestJS)
│   │       │   └── interceptors/       # Response formatting
│   │       └── <domain>.module.ts      # NestJS module
│   ├── common/
│   │   ├── filters/                   # Exception handlers
│   │   ├── interceptors/              # Request/response interceptors
│   │   ├── pipes/                     # Validation pipes
│   │   └── utils/                     # Shared utilities
│   ├── config/                        # Config module (env validation)
│   └── main.ts                        # Bootstrap
```

### Frontend

```
apps/web/
├── src/
│   ├── components/
│   │   ├── atoms/                    # Button, Input, Icon, Badge, Link…
│   │   ├── molecules/                # FormGroup, Card, NavBar…
│   │   ├── organisms/                # Header, Sidebar, DashboardSection…
│   │   ├── templates/                # MainLayout, AuthLayout…
│   │   └── pages/                    # Auth, Dashboard, Machines, Tunnels…
│   ├── hooks/                        # useAuth, useTunnels, useMachines…
│   ├── context/                      # AuthContext, AppContext…
│   ├── utils/                        # Helpers, formatters
│   ├── types/                        # (or import from @paulline/types)
│   ├── App.tsx
│   └── main.tsx
```

## Git Workflow

- **Branch:** main (default); `feat/<name>` para features grandes/riesgosas
- **Commits:** Conventional Commits
  - `feat(auth): add Cloudflare API key validation`
  - `fix(tunnels): correct uptime calculation`
  - `refactor(sdk): simplify PaulineClient interface`
  - `test(machines): add SSH validator tests`
  - `docs(architecture): update Hexagonal diagram`
- **Merge:** rebase never merge-graph (clean linear history)
- **Un solo commit por feature:** en la puerta de commit (review + OK humano)
- **Push:** solo tras OK humano explícito (acción hacia afuera)

## Variables de entorno

Valida todas via esquema (en backend, con `dotenv-safe` o `zod`):

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  DATABASE_URL: z.string().url(),
  CLOUDFLARE_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

**Nunca:** `process.env.CLOUDFLARE_API_KEY` directo. Siempre: `env.CLOUDFLARE_API_KEY` (validado).

## Performance & Optimization

- **Frontend:** lazy load páginas con React.lazy, suspense; memoizar componentes costosos (React.memo, useMemo)
- **Backend:** cachés en-memory para datos que cambian poco (lista de máquinas, tuneles), invalidar on-change; rate-limit requests a Cloudflare API
- **DB:** indices en campos de búsqueda frecuente (machine.ip, tunnel.cloudflare_domain); lazy-load relaciones con Prisma

## Seguridad

- **Never log secrets** (API keys, tokens, passwords). Log: ID, action, status.
- **HTTPS en producción.** SSH keys en Backend: manage via files (never in DB).
- **CORS:** solo origen del frontend local en dev; restricción en producción.
- **CSRF:** token en headers (si aplica).
- **SQLi:** Prisma maneja parametrización; **nunca SQL crudo.**
