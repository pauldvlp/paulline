# Requirements — POLISH-001: E2E Tests, Documentation & Release

## Context

Ensure Paulline MVP is production-ready: comprehensive E2E test coverage, user + developer documentation, and GitHub release.

## Functional Requirements

### FR-1: E2E test: login flow
- **GIVEN** user on login page
- **WHEN** user enters valid Cloudflare API key and submits
- **THEN** user authenticated, redirected to dashboard

### FR-2: E2E test: add machine
- **GIVEN** user authenticated on machines page
- **WHEN** user fills form (IP, name), submits
- **THEN** machine added, appears in list with online/offline status

### FR-3: E2E test: create tunnel
- **GIVEN** user has machine + authenticated
- **WHEN** user creates tunnel (name, machine, domain)
- **THEN** tunnel created, appears in dashboard with active status

### FR-4: E2E test: view uptime graph
- **GIVEN** tunnel exists with 24h monitoring data
- **WHEN** user navigates to dashboard
- **THEN** uptime graph visible + percentage displayed

### FR-5: E2E test: logout
- **GIVEN** user authenticated
- **WHEN** user clicks logout
- **THEN** user redirected to login, session cleared

### FR-6: User documentation
- **GIVEN** README.md exists
- **WHEN** user reads docs
- **THEN** setup, usage, and troubleshooting instructions clear

### FR-7: Developer documentation
- **GIVEN** developer documentation exists
- **WHEN** developer reads harness/docs/*
- **THEN** architecture, conventions, API docs clear

### FR-8: GitHub release prepared
- **GIVEN** v0.1 implementation complete
- **WHEN** release created
- **THEN** changelog.md, release notes, version tag (0.1.0) present

## Non-Functional Requirements

- E2E test suite runs < 5 minutes
- All tests pass consistently (no flakes)
- Code coverage: > 80% for critical paths
- Documentation readable by new developers
- Release automated (GitHub Actions or manual checklist)

## Acceptance Criteria

- [ ] E2E test suite set up (Playwright)
- [ ] 5 critical user flows tested (login, add machine, create tunnel, view uptime, logout)
- [ ] E2E tests pass 100% consistency
- [ ] Unit test coverage > 80%
- [ ] README.md with setup + usage + troubleshooting
- [ ] Developer docs: architecture.md, conventions.md, API reference
- [ ] API documentation generated (Swagger/OpenAPI)
- [ ] Contributing guide written
- [ ] CHANGELOG.md with v0.1 summary
- [ ] Release notes prepared
- [ ] Version bumped to 0.1.0
- [ ] GitHub release created with release notes + link to docs

## Scope

- E2E test suite (Playwright, 5+ critical flows)
- Unit test coverage audit + gap closing
- User documentation (setup, usage, FAQs)
- Developer documentation (architecture, contributing, API)
- API documentation (Swagger/OpenAPI)
- Changelog + release notes
- GitHub release creation
- Version bump + tagging

## Non-Scope

- Performance testing (v0.2)
- Load testing (v0.2)
- Security audit (v0.2)
- Video tutorials (v1)
- Interactive documentation (v1)

## Dependencies

- Blocks: None (final feature, closes v0.1)
- Blocked by: All other v0.1 features (AUTH, MACHINES, TUNNELS, MONITORING, DASHBOARD)
