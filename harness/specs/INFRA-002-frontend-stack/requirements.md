# Requirements — INFRA-002: Frontend Stack Setup (shadcn/ui + React Hook Form)

**Feature ID:** INFRA-002  
**Status:** spec_ready  
**Severity:** Bloqueante  
**Blocker for:** AUTH-001, any form-based feature  

## Descripción

Las convenciones requieren `shadcn/ui` + `react-hook-form` para todos los formularios. Ambas librerías están ausentes en `apps/web/package.json`. Feature instala dependencias, configura shadcn registry, crea componentes base, y demuestra patrón con ejemplo LoginForm.

## Requisitos Funcionales (EARS)

**FR-1: Dependencias instaladas**
- GIVEN `pnpm install` ejecutado en repo root 
- WHEN se inspeccionan `apps/web/package.json` y `node_modules/` 
- THEN existen: react-hook-form, @hookform/resolvers, @radix-ui/react-dialog, @radix-ui/react-label, class-variance-authority, clsx

**FR-2: shadcn/ui scaffold**
- GIVEN la carpeta `apps/web/src/components/ui/` 
- WHEN se inspeccionan los archivos 
- THEN existen componentes base: Button.tsx, Input.tsx, Label.tsx, FormField.tsx (wrapper RHF)

**FR-3: Patrón LoginForm demostrando React Hook Form + Zod**
- GIVEN el archivo `apps/web/src/components/organisms/LoginForm.tsx` 
- WHEN se renderiza el componente 
- THEN: form maneja input validation, muestra errores, submit invoca pauline.auth().login()

**FR-4: Tipos y schemas en sync**
- GIVEN cambio en `packages/schemas/src/auth.ts` (LoginSchema) 
- WHEN regeneran tipos (z.infer) 
- THEN LoginForm usa tipo correcto (z.infer<typeof LoginSchema>)

## Requisitos No Funcionales (EARS)

**NFR-1: Accesibilidad**
- shadcn/ui components son accesibles out-of-box (Radix UI primitives)

**NFR-2: Estilos Tailwind**
- Todos los componentes usan solo Tailwind utilities (sin custom CSS)

**NFR-3: Performance**
- Componentes memoizados donde necesario; no re-renders innecesarios

## Criterios de Aceptación

- [ ] `pnpm install` en `apps/web/` resuelve sin errores; todas las deps en package.json
- [ ] `apps/web/src/components/ui/` contiene: Button, Input, Label, FormField (shadcn)
- [ ] `apps/web/src/components/organisms/LoginForm.tsx` usa useForm() + zodResolver(loginSchema)
- [ ] LoginForm renderiza input fields, validation errors, submit button
- [ ] `apps/web/src/components/molecules/FormGroup.tsx` (auxiliar para form layout) presente
- [ ] LoginForm test pasa (form state, validation, submit)
- [ ] App.tsx importa LoginForm (comentado si no aplica aún)
- [ ] `pnpm -r lint` y `pnpm -r typecheck` verdes en web/
- [ ] No hay broken imports en otros packages

## Trazabilidad

| FR/NFR | Test | Verificación |
|--------|------|--------------|
| FR-1 | pnpm install | Deps in package.json + node_modules |
| FR-2 | (estructura) | Files exist in components/ui/ |
| FR-3 | LoginForm.test.tsx | Form renders, validates, submits |
| FR-4 | (types) | No TS errors; z.infer used |
| NFR-1 | (accessibility) | Visual inspection (Radix primitives) |
| NFR-2 | (styles) | Grep for custom classes: 0 found |
| NFR-3 | (perf) | React DevTools profiler |
