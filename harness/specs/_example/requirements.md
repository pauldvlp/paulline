# Requirements — Example Feature [#EXAMPLE-001]

> **Format:** EARS (Easy Approach to Requirements Syntax)
> This is a **template**. Delete this file once you have actual features.

## Context

This is an example feature for demonstrating EARS format, acceptance criteria, and requirements structure. Use this as a template for all features.

## Functional Requirements

### FR-1: User can add a machine
- **GIVEN** user is authenticated
- **WHEN** user provides IP address and validates SSH connectivity (key-based auth)
- **THEN** machine is created and stored in the database

### FR-2: System validates SSH connectivity
- **GIVEN** user enters machine IP and SSH port
- **WHEN** system attempts SSH connection with key-based auth
- **THEN** connection either succeeds (machine online) or fails (error message)

### FR-3: User can see list of machines
- **GIVEN** user is on the Machines page
- **WHEN** page loads
- **THEN** display all added machines with status (online/offline), IP, name

## Non-Functional Requirements

### NFR-1: Responsiveness
- **GIVEN** user interacts with form
- **WHEN** submitting machine data
- **THEN** response completes within 5 seconds

### NFR-2: Security
- **GIVEN** SSH keys are managed
- **WHEN** keys are stored or transmitted
- **THEN** never log or expose keys in plaintext

## Acceptance Criteria

- ✅ Machine can be added via form (IP, name required)
- ✅ SSH connectivity validated (key-based auth)
- ✅ Machine appears in dashboard immediately after add
- ✅ Machine status shows online/offline
- ✅ Duplicate IPs prevented
- ✅ Delete button removes machine
- ✅ Error messages are clear (not cryptic)
- ✅ Tests cover happy path + error cases

## Scope (v0.1 MVP)

What's IN this feature:
- Add machine (IP + name)
- SSH validation
- List machines
- Delete machine

## Non-Scope

What's NOT in v0.1 (can come later):
- Machine groups / tags
- Automatic discovery (nmap, etc.)
- SSH custom ports (hardcoded to 22 in v0.1)
- Multi-user access control

## Dependencies

- No upstream dependencies (standalone feature)
- Downstream: Tunnels feature depends on this (can't create tunnel without machine)

## Open Questions

- Should we auto-detect machine name from hostname?
- What SSH timeout is acceptable? (current: 5s)
- Can user re-use same IP? (No, but confirm)

## Technical Notes

- Backend: `POST /api/machines`, SSH adapter (node:ssh2 or similar)
- Frontend: Form component (shadcn Form + Zod validation)
- DB: machines table (id, ip, name, ssh_status, created_at, updated_at)
- SDK: `paulline.machines().add()`
