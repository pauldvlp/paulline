# Requirements — DASHBOARD-001: Dashboard UI & Status Display

## Context

Central hub showing all machines, tunnels, real-time status, and 24-hour uptime graphs.

## Functional Requirements

### FR-1: Dashboard displays machines
- **GIVEN** user is authenticated
- **WHEN** user navigates to dashboard
- **THEN** list of machines displayed with IP, name, SSH status (online/offline)

### FR-2: Dashboard displays tunnels
- **GIVEN** machines exist
- **WHEN** dashboard loads
- **THEN** list of tunnels displayed with name, linked machine, domain, status (active/inactive)

### FR-3: Tunnel status color-coded
- **GIVEN** tunnel status in database
- **WHEN** dashboard renders
- **THEN** tunnel status displayed with color: green (active), red (inactive), yellow (warning)

### FR-4: Uptime graph for 24 hours
- **GIVEN** uptime data exists for tunnel
- **WHEN** user hovers over tunnel or clicks "details"
- **THEN** 24-hour uptime graph displayed (timeline with up/down bars)

### FR-5: Uptime percentage displayed
- **GIVEN** uptime records exist
- **WHEN** dashboard queries last 24h data
- **THEN** uptime percentage displayed: "99.5% uptime (24h)"

### FR-6: Quick actions available
- **GIVEN** tunnel visible on dashboard
- **WHEN** user hovers over tunnel card
- **THEN** action buttons displayed: edit, delete, pause/resume

### FR-7: Real-time updates
- **GIVEN** user on dashboard
- **WHEN** backend uptime status changes
- **THEN** dashboard auto-refreshes (websocket or polling every 5 seconds)

### FR-8: Empty state for new users
- **GIVEN** user has no machines or tunnels
- **WHEN** dashboard loads
- **THEN** helpful message displayed: "Add a machine to get started" with link to machines page

## Non-Functional Requirements

- Dashboard load time: < 2 seconds
- Graph render with 1440+ data points: < 1 second
- Auto-refresh: 5 seconds max latency
- Support up to 100 machines + 50 tunnels displayed
- Mobile-responsive (>320px width)

## Acceptance Criteria

- [ ] Dashboard layout: machines section + tunnels section
- [ ] Machines displayed as list/cards (IP, name, status)
- [ ] Tunnels displayed as cards (name, machine, domain, status)
- [ ] Status color-coded (green/red/yellow)
- [ ] 24h uptime graph renders with data
- [ ] Uptime percentage calculated + displayed
- [ ] Action buttons (edit, delete, pause) present
- [ ] Quick links to add machine/tunnel
- [ ] Real-time updates via polling or websocket
- [ ] Empty state for new users
- [ ] Responsive design (mobile-friendly)
- [ ] Tests cover rendering + interactions

## Scope

- Dashboard React component (Atomic Design)
- Machines list/cards
- Tunnels list/cards
- 24h uptime graph (Chart.js or Recharts)
- Status indicators
- Quick actions
- Real-time updates (polling)

## Non-Scope

- Advanced analytics (v1)
- Tunnel logs view (v1)
- Custom dashboards (v1)
- Alerts configuration UI (v1)
- Dark mode (v1)

## Dependencies

- Blocks: POLISH-001 (E2E tests)
- Blocked by: AUTH-001, MACHINES-001, TUNNELS-001, MONITORING-001
