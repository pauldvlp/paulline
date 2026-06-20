# Design — INFRA-002: Frontend Stack (shadcn/ui + React Hook Form)

## Decisiones de diseño

### D1 — `loginSchema` real en `packages/schemas/src/auth.ts`
`auth.ts` solo tenía `authPlaceholderSchema`. FR-3/FR-4 exigen demostrar el patrón
RHF + Zod con un esquema real (`z.infer<typeof loginSchema>`). Como INFRA-002 es
**bloqueante de AUTH-001**, no puede depender de él; por tanto se introduce aquí un
`loginSchema` mínimo (email + password.min(8)) como **fuente única**. AUTH-001 lo
extenderá (no lo duplicará). Se actualizó `packages/types` para exponer `LoginInput`.

### D2 — `LoginForm` desacoplado del SDK vía prop `onSubmit`
El SDK (`PaulineClient`) aún no expone `.auth().login()` (lo añade AUTH-001). Para no
invadir esa feature ni acoplarnos a una API inexistente, `LoginForm` recibe
`onSubmit: (values: LoginInput) => Promise<void> | void`. AUTH-001 conectará el SDK
pasando `pauline.auth().login` como handler. Patrón estándar, 100% testeable.

### D3 — Imports relativos en lugar de alias `@/`
`tsconfig.base.json` define `paths` para `@paulline/*`. Sobrescribir `paths` en el
tsconfig de `web` para añadir `@/*` eliminaría los alias del monorepo. Se usan imports
relativos en los componentes shadcn (no es obligatorio el alias `@/`).

### D4 — `FormField` como wrapper cohesivo de RHF
En vez del split shadcn (Form/FormItem/FormControl/FormMessage = varios artefactos),
se usa un único `FormField<TFieldValues>` con `Controller` que compone Label + Input +
mensaje de error accesible (`role="alert"`, `aria-invalid`, `aria-describedby`).
Cumple "un artefacto por archivo" y NFR-1 (accesibilidad).

### D5 — Tailwind utilities only (NFR-2)
Ningún `@apply` ni clase custom. Verificado por grep. El tema usa utilities `slate-*`.

## Estructura de componentes (atomic design)

```
ui/Button.tsx      (cva + Slot)            atom
ui/Input.tsx                               atom
ui/Label.tsx       (@radix-ui/react-label) atom
ui/FormField.tsx   (Controller RHF)        atom compuesto
molecules/FormGroup.tsx  (<form> layout)   molecule
organisms/LoginForm.tsx  (useForm+zod)     organism
lib/cn.ts          (clsx + tailwind-merge) util
```

## Flujo de datos

```
loginSchema (@paulline/schemas)
   │ z.infer
   ▼
LoginInput (@paulline/types)
   │
   ▼
useForm<LoginInput>({ resolver: zodResolver(loginSchema) })
   │ handleSubmit(values)
   ▼
props.onSubmit(values)   ← AUTH-001 inyecta pauline.auth().login
```
