# Design — Example Feature [#EXAMPLE-001]

> This is a **template** for design documents. Delete once you have actual features.

## Architecture Overview

How this feature fits into Paulline:

```
Frontend (React Form)
    ↓
    PaulineClient SDK
    ↓
Backend API (NestJS)
    ├→ MachineService (application layer)
    ├→ SshAdapter (infrastructure)
    └→ PrismaRepository (infrastructure)
    ↓
SQLite Database
```

## Data Model

```sql
-- machines table
id              UUID PRIMARY KEY
ip              VARCHAR(15) UNIQUE NOT NULL
name            VARCHAR(255) NOT NULL
ssh_status      ENUM('online', 'offline', 'unknown') DEFAULT 'unknown'
last_check      TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

## API Contract

### Request
```typescript
POST /api/machines
{
  "ip": "192.168.1.10",
  "name": "home-server"
}
```

### Response (Success)
```typescript
{
  "id": "uuid",
  "ip": "192.168.1.10",
  "name": "home-server",
  "ssh_status": "online",
  "created_at": "2026-06-19T10:30:00Z"
}
```

### Response (Error)
```typescript
{
  "error": {
    "code": "MACHINE_ALREADY_EXISTS",
    "message": "A machine with IP 192.168.1.10 already exists"
  }
}
```

## SDK Interface

```typescript
// Usage
const machine = await paulline.machines().add({
  ip: '192.168.1.10',
  name: 'home-server'
});

// List
const machines = await paulline.machines().list();

// Delete
await paulline.machines().delete(machineId);
```

## Backend — Hexagonal Layers

### Domain (`domain/`)
```
entities/
  └─ Machine.ts (domain entity: id, ip, name, status)

ports/
  └─ IMachineRepository.ts (interface)
  └─ ISshValidator.ts (interface)

errors/
  └─ MachineNotFound.ts
  └─ DuplicateMachineError.ts
```

### Application (`application/`)
```
services/
  └─ MachineService.ts (depends on ports, not impls)
      - addMachine()
      - listMachines()
      - deleteMachine()

dtos/
  └─ CreateMachineDto.ts
  └─ MachineResponseDto.ts
```

### Infrastructure (`infrastructure/`)
```
adapters/
  └─ SshValidator.ts (implements ISshValidator)
  └─ PrismaRepository.ts (implements IMachineRepository)

controllers/
  └─ MachinesController.ts (NestJS HTTP controller)
```

## Frontend — Atomic Design + React Hook Form + Zod

```
components/
  atoms/
    └─ Input.tsx (shadcn Input, re-exported)
    └─ Button.tsx (shadcn Button, re-exported)

  molecules/
    └─ FormGroup.tsx (label + input + error display, display-only)
    └─ MachineCard.tsx (display-only card for one machine)

  organisms/
    └─ AddMachineForm.tsx (form organism: RHF + Zod resolver)
    └─ MachineList.tsx (list of cards, calls SDK)

  pages/
    └─ MachinesPage.tsx (route: /machines)

schemas/
  └─ machines.ts (Zod: createMachineSchema, type CreateMachineInput)
```

### Form Implementation (AddMachineForm Organism)
```typescript
// Organism uses React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMachineSchema } from "@paulline/schemas";

export function AddMachineForm() {
  const form = useForm({
    resolver: zodResolver(createMachineSchema),
    defaultValues: { ip: "", name: "" },
  });

  async function onSubmit(data) {
    const machine = await paulline.machines().add(data);
    // Success → form clears, machine appears in list
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Field validation errors auto-display via RHF */}
      <FormField control={form.control} name="ip" render={...} />
      <FormField control={form.control} name="name" render={...} />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Add Machine
      </Button>
    </form>
  );
}
```

## Edge Cases & Error Handling

1. **SSH timeout:** 5 seconds default
   → Error: "SSH connection timed out"

2. **Duplicate IP:**
   → Error: "Machine with this IP already exists"

3. **Invalid IP format:**
   → Validation error (Zod): "Invalid IP address"

4. **SSH key not configured:**
   → Error: "SSH key not found. Install via [link]"

5. **Network unreachable:**
   → Warning: "Machine is offline (unreachable)"

## Dependencies & Assumptions

- Node.js + ssh2 library available
- SQLite accessible
- User has SSH key configured locally
- Frontend can reach backend API
