# Requirements — MACHINES-001: Machines CRUD & SSH Validation

## Context

Users can register remote machines (servers, dev boxes) via IP + SSH key-based validation.

## Functional Requirements

### FR-1: User can add a machine
- **GIVEN** user is authenticated
- **WHEN** user enters IP, name, and SSH key path
- **THEN** system validates SSH connectivity before saving

### FR-2: SSH connectivity validated via key-based auth
- **GIVEN** user provides machine IP + SSH port (default 22)
- **WHEN** system attempts SSH connection with key-based auth
- **THEN** connection succeeds (machine online) or fails with timeout error (5s)

### FR-3: Machine stored in database
- **GIVEN** SSH validation succeeds
- **WHEN** user submits form
- **THEN** machine record created with id, ip, name, ssh_status, created_at

### FR-4: User can list machines
- **GIVEN** user is on machines page
- **WHEN** page loads
- **THEN** all machines displayed as cards (IP, name, status)

### FR-5: User can delete machine
- **GIVEN** user views machine list
- **WHEN** user clicks delete button
- **THEN** machine removed from database and list

### FR-6: Duplicate IP prevented
- **GIVEN** machine with IP already exists
- **WHEN** user attempts to add machine with same IP
- **THEN** error shown: "Machine with this IP already exists"

### FR-7: SSH status tracked
- **GIVEN** machine added successfully
- **WHEN** backend performs status check
- **THEN** ssh_status field updated (online/offline/unknown)

## Non-Functional Requirements

- SSH validation timeout: 5 seconds
- Form submission response: < 3 seconds
- SSH key never stored in database (local only)
- Support up to 100 machines per user

## Acceptance Criteria

- [ ] Add machine form rendered (IP, name fields, React Hook Form + Zod)
- [ ] IP validation: valid IPv4 format enforced
- [ ] SSH connection validated before save
- [ ] Machine stored in Prisma + SQLite
- [ ] Duplicate IP check implemented
- [ ] Machines list displays all records
- [ ] Delete button removes machine
- [ ] SSH status tracked (online/offline)
- [ ] Error messages clear and helpful
- [ ] Tests cover happy path + error cases (duplicate, SSH fail)

## Scope

- Add machine form (React Hook Form)
- SSH validation (ssh2 library or similar)
- Database CRUD (Prisma)
- Machines list UI (Atomic Design)
- IP + name validation (Zod)

## Non-Scope

- Machine groups / tags (v1)
- Auto-discovery (nmap) (v1)
- Custom SSH ports (hardcoded to 22 v0.1)
- Machine ownership / multi-user (v1)
- SSH password auth (key-based only)

## Dependencies

- Blocks: TUNNELS-001, MONITORING-001, DASHBOARD-001
- Blocked by: SETUP-001, AUTH-001
