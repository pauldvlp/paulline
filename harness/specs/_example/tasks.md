# Tasks — Example Feature [#EXAMPLE-001]

> This is a **template** for breaking down a feature into discrete tasks.
> Delete once you have actual features.

## Task 1: Backend — Domain & Ports

**Description:** Define domain entity, repository port, and SSH validator port

**Subtasks:**
1. Create `apps/api/src/modules/machines/domain/entities/Machine.ts`
   - Fields: id (UUID), ip (string), name (string), sshStatus (enum)
2. Create `apps/api/src/modules/machines/domain/ports/IMachineRepository.ts`
   - Methods: save(), findById(), findAll(), delete()
3. Create `apps/api/src/modules/machines/domain/ports/ISshValidator.ts`
   - Method: validate(ip, port): Promise<boolean>
4. Create domain errors: `MachineNotFound`, `DuplicateMachineError`

**Acceptance Criteria:**
- [ ] Machine entity compiles (TS)
- [ ] Ports are interfaces (type, not class)
- [ ] No framework/ORM imports in domain/
- [ ] Unit tests for entity logic

---

## Task 2: Backend — SSH Adapter

**Description:** Implement SshValidator adapter (uses ssh2 library)

**Subtasks:**
1. Create `apps/api/src/modules/machines/infrastructure/adapters/SshValidator.ts`
   - Implements ISshValidator
   - Uses ssh2 library to connect
   - 5-second timeout
   - Returns true (connected) or false (failed)
2. Add error handling (connection refused, timeout, auth failed)
3. Add tests (mock SSH, simulate success/failure)

**Acceptance Criteria:**
- [ ] Adapter implements ISshValidator
- [ ] Connects to IP + port 22 via SSH key
- [ ] Returns boolean (online/offline)
- [ ] Timeout enforced (5s)
- [ ] Unit tests pass (> 80% coverage)

---

## Task 3: Backend — Repository Adapter

**Description:** Implement Prisma-based MachineRepository

**Subtasks:**
1. Add machines table to `packages/database/prisma/schema.prisma`
2. Create migration: `pnpm run db:migrate add create_machines`
3. Create `apps/api/src/modules/machines/infrastructure/adapters/PrismaRepository.ts`
   - Implements IMachineRepository
   - Methods: save(), findById(), findAll(), delete()
   - Map Prisma model ↔ domain entity
4. Unit tests (mock Prisma, test CRUD)

**Acceptance Criteria:**
- [ ] Prisma schema updated
- [ ] Migration created + runs cleanly
- [ ] Repository implements all IMachineRepository methods
- [ ] Entity ↔ Prisma model mapping is explicit
- [ ] Tests pass (> 80% coverage)

---

## Task 4: Backend — Service & Use Cases

**Description:** Create MachineService with business logic

**Subtasks:**
1. Create `apps/api/src/modules/machines/application/services/MachineService.ts`
   - Depends on: IMachineRepository, ISshValidator (constructor injection)
   - Methods:
     - addMachine(ip, name): validate SSH → check duplicate → save
     - listMachines(): return all
     - deleteMachine(id): remove from DB
2. Create DTOs: `CreateMachineDto`, `MachineResponseDto`
3. Tests: service tests (mocked ports), validate business logic

**Acceptance Criteria:**
- [ ] Service depends on ports (not implementations)
- [ ] addMachine() validates SSH before saving
- [ ] Duplicate IP check works
- [ ] listMachines() returns all machines
- [ ] deleteMachine() removes from DB
- [ ] Tests pass (> 80% coverage, mocked ports)

---

## Task 5: Backend — HTTP Controller

**Description:** Create NestJS controller for machines endpoints

**Subtasks:**
1. Create `apps/api/src/modules/machines/infrastructure/controllers/MachinesController.ts`
   - POST /api/machines (create)
   - GET /api/machines (list)
   - DELETE /api/machines/:id (delete)
2. Add Zod validation (via pipes or decorators)
3. Response formatting (error codes + messages)
4. Swagger/OpenAPI docs

**Acceptance Criteria:**
- [ ] Endpoints are HTTP REST compliant
- [ ] Zod validation applied to requests
- [ ] Error responses include code + message
- [ ] Status codes correct (201 create, 200 list, 204 delete)
- [ ] Integration tests pass (call endpoints, mock service)

---

## Task 6: Frontend — Form Component (React Hook Form + Zod)

**Description:** Create "Add Machine" form (Atomic Design + RHF + Zod)

**Subtasks:**
1. Create `apps/web/src/components/atoms/Input.tsx` (shadcn, re-export)
2. Create `apps/web/src/components/atoms/Button.tsx` (shadcn, re-export)
3. Create `apps/web/src/components/molecules/FormGroup.tsx` (label + input + error, display-only)
4. Create `apps/web/src/components/organisms/AddMachineForm.tsx`
   - Uses React Hook Form + Zod resolver
   - Schema from `@paulline/schemas` (createMachineSchema)
   - Fields: ip, name (auto-validated by Zod)
   - Submission: call `paulline.machines().add(data)`
   - Error handling: RHF displays validation errors
   - Success: clear form, callback to parent (MachinesPage)
5. Tests: render form, fill inputs, test validation (invalid IP), submit, verify SDK call

**Acceptance Criteria:**
- [ ] Form renders with IP + name inputs (shadcn components)
- [ ] RHF + Zod resolver validates on blur/submit
- [ ] Invalid IP rejected with error message ("Invalid IP address")
- [ ] Submit calls `paulline.machines().add(data)` with form data
- [ ] Error message displays if add fails (from SDK/API)
- [ ] Form clears and resets after success
- [ ] Submit button disabled while submitting (`form.formState.isSubmitting`)
- [ ] Tests pass (render + validation flow + submission)

---

## Task 7: Frontend — Machines List & Page

**Description:** Display machines in dashboard

**Subtasks:**
1. Create `apps/web/src/components/molecules/MachineCard.tsx`
   - Display: IP, name, status (online/offline)
   - Delete button
2. Create `apps/web/src/components/organisms/MachineList.tsx`
   - Fetch machines via `paulline.machines().list()`
   - Render cards
   - Handle delete
3. Create `apps/web/src/components/pages/MachinesPage.tsx`
   - Layout: AddMachineForm + MachineList
   - Route: /machines
4. Tests: render page, check machines display, test delete

**Acceptance Criteria:**
- [ ] Page loads machines via SDK
- [ ] Machines display as cards (IP, name, status)
- [ ] Delete button works (removes from list)
- [ ] Add form + list visible on same page
- [ ] Tests pass (render + interaction flow)

---

## Task 8: SDK — PaulineClient.machines()

**Description:** Implement machines endpoint in SDK

**Subtasks:**
1. Create `packages/sdk/src/endpoints/machines.ts`
   - Methods: add(), list(), delete()
   - Fluent API: `paulline.machines().add(...)`
2. Add types to `packages/types/` (inferred from Zod schemas)
3. Tests: mock HTTP client, test fluent interface

**Acceptance Criteria:**
- [ ] Fluent API works: `paulline.machines().add()`
- [ ] Requests sent to correct backend endpoint
- [ ] Responses typed correctly
- [ ] Errors mapped to SDK errors (PaulineError)
- [ ] Tests pass

---

## Task 9: Integration Tests & E2E

**Description:** Full flow tests

**Subtasks:**
1. E2E test: login → add machine → see in list → delete
   - Use Playwright or similar
   - Mock or real SSH validator (decide)
2. Integration test: API endpoint → service → repository → DB
3. SDK test: fluent API client → real backend (if test env available)

**Acceptance Criteria:**
- [ ] E2E test covers happy path
- [ ] E2E test covers error cases (duplicate IP, SSH fail)
- [ ] Integration tests pass
- [ ] All acceptance criteria from Feature spec verified

---

## Task 10: Documentation & Polish

**Description:** Update docs, cleanup

**Subtasks:**
1. Update `harness/docs/architecture.md` if changed
2. Update `harness/progress/current.md` (feature complete summary)
3. Cleanup: remove TODOs, verify lint passes
4. Verify: `pnpm build`, `pnpm test`, `pnpm lint` all pass

**Acceptance Criteria:**
- [ ] Architecture docs updated
- [ ] Progress doc updated
- [ ] No TODOs in code
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes (> 80% coverage)
- [ ] `pnpm lint` passes (no warnings)
- [ ] Ready for `in_review` state
