# Requirements — TUNNELS-001: Tunnels CRUD & Cloudflare Integration

## Context

Users can create, edit, delete, and manage Cloudflare tunnels linked to registered machines.

## Functional Requirements

### FR-1: User can create tunnel
- **GIVEN** user is authenticated and has at least one machine registered
- **WHEN** user enters tunnel name, selects machine, enters cloudflare domain
- **THEN** tunnel created via Cloudflare API + stored in database

### FR-2: Tunnel linked to machine
- **GIVEN** tunnel created
- **WHEN** tunnel record stored
- **THEN** tunnel has reference to machine (foreign key)

### FR-3: Tunnel status tracked
- **GIVEN** tunnel created
- **WHEN** system checks Cloudflare API
- **THEN** tunnel_status field updated (active/inactive/error)

### FR-4: User can list tunnels
- **GIVEN** user on tunnels page
- **WHEN** page loads
- **THEN** all tunnels displayed with name, machine, domain, status

### FR-5: User can edit tunnel
- **GIVEN** tunnel exists
- **WHEN** user modifies name or domain field
- **THEN** changes reflected in database + Cloudflare API

### FR-6: User can delete tunnel
- **GIVEN** tunnel exists
- **WHEN** user clicks delete button
- **THEN** tunnel removed from Cloudflare API + database

### FR-7: User can pause/resume tunnel
- **GIVEN** tunnel exists
- **WHEN** user clicks pause button
- **THEN** tunnel paused (not accepting traffic) + status updated

## Non-Functional Requirements

- Tunnel creation via Cloudflare API: < 3 seconds
- Tunnel status sync: max 30 seconds lag
- Support up to 50 tunnels per user (v0.1 limit)
- Cloudflare API rate limit respected (1 req/sec max)

## Acceptance Criteria

- [ ] Create tunnel form rendered (name, machine, domain fields)
- [ ] Form validates domain format
- [ ] Tunnel created via Cloudflare API
- [ ] Tunnel stored in database with FK to machine
- [ ] Tunnels list displays all records
- [ ] Edit form pre-populated with tunnel data
- [ ] Delete removes from Cloudflare + database
- [ ] Pause/resume toggles tunnel state
- [ ] Status tracked (active/inactive)
- [ ] Error handling for Cloudflare API failures
- [ ] Tests cover happy path + error cases

## Scope

- Tunnel CRUD forms (React Hook Form)
- Cloudflare API integration (create, update, delete, pause)
- Database CRUD (Prisma)
- Tunnels list UI
- Status tracking

## Non-Scope

- Tunnel routing rules (v1)
- Advanced Cloudflare config (v1)
- Tunnel logging (v1)
- Tunnel analytics (v1)
- Multi-region tunnels (v1)

## Dependencies

- Blocks: MONITORING-001, DASHBOARD-001
- Blocked by: AUTH-001, MACHINES-001
