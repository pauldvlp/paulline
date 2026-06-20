# Requirements — MONITORING-001: Uptime Monitoring & Historical Data

## Context

System continuously monitors tunnel uptime and stores 24-hour historical data for display.

## Functional Requirements

### FR-1: Background job monitors tunnel health
- **GIVEN** system is running
- **WHEN** background job runs every 60 seconds
- **THEN** each tunnel checked via HTTP GET to Cloudflare tunnel endpoint

### FR-2: Uptime recorded in database
- **GIVEN** tunnel check completes
- **WHEN** result is success (HTTP 2xx) or failure (timeout/error)
- **THEN** uptime_record created with tunnel_id, timestamp, status, response_time_ms

### FR-3: 24-hour data retained
- **GIVEN** records older than 24 hours exist
- **WHEN** cleanup job runs (hourly)
- **THEN** records older than 24 hours deleted from database

### FR-4: Uptime percentage calculated
- **GIVEN** historical records exist for tunnel
- **WHEN** dashboard requests uptime_percentage for past 24h
- **THEN** percentage calculated: (successful checks / total checks) * 100

### FR-5: Response time tracked
- **GIVEN** tunnel check completes
- **WHEN** response received
- **THEN** response_time_ms recorded (measured end-to-end)

### FR-6: Status aggregated hourly
- **GIVEN** 60 checks per hour (one per minute)
- **WHEN** hour boundary crossed
- **THEN** hourly_summary created: up_count, down_count, avg_response_time

### FR-7: Alerts triggered on degradation
- **GIVEN** uptime drops below 95% in 1-hour window
- **WHEN** threshold crossed
- **THEN** alert flag set in database (displayed to user on dashboard)

## Non-Functional Requirements

- Health checks: 1 per 60 seconds (configurable)
- Check timeout: 10 seconds
- Database query for 24h data: < 500ms
- False positives minimized (2-3 failed checks before marking down)

## Acceptance Criteria

- [ ] Background job scheduled (every 60 seconds)
- [ ] Each tunnel checked via HTTP
- [ ] Uptime records stored (tunnel_id, timestamp, status, response_time_ms)
- [ ] 24-hour data retention enforced
- [ ] Uptime percentage calculated correctly
- [ ] Response times averaged hourly
- [ ] Degradation alerts triggered at 95% threshold
- [ ] Database cleanup removes old records
- [ ] No false positives from transient failures
- [ ] Tests cover check success/failure + data retention

## Scope

- Background job scheduling (NestJS task scheduler or node-cron)
- HTTP health checks
- Uptime data storage (Prisma + SQLite)
- 24-hour retention policy
- Hourly aggregation
- Degradation alerting

## Non-Scope

- Email/SMS notifications (v1)
- Custom check intervals per tunnel (v1)
- TCP/UDP health checks (v1)
- Geographic monitoring (v1)
- Third-party monitoring integration (v1)

## Dependencies

- Blocks: DASHBOARD-001
- Blocked by: TUNNELS-001
