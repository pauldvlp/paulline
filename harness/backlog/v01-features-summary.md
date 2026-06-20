# Paulline v0.1 MVP — Features Summary

**Generated:** 2026-06-19  
**Status:** 🔍 Pending Spec Review & Approval  
**Total Features:** 7  
**Estimated Sessions:** 10-14 (from charter)

---

## Feature Roadmap

| ID | Feature | Purpose | Dependencies | Est. Complexity |
|---|---|---|---|---|
| **SETUP-001** | Monorepo & Docker setup | Foundation | None | ⭐⭐ Medium |
| **AUTH-001** | Cloudflare API auth | Enable tunnel management | SETUP-001 | ⭐⭐ Medium |
| **MACHINES-001** | Machines CRUD + SSH | Register remote machines | SETUP-001 | ⭐⭐⭐ High |
| **TUNNELS-001** | Tunnels CRUD | Create/manage tunnels | AUTH-001, MACHINES-001 | ⭐⭐⭐ High |
| **MONITORING-001** | Uptime monitoring | Track tunnel health | MACHINES-001, TUNNELS-001 | ⭐⭐⭐ High |
| **DASHBOARD-001** | Central dashboard UI | Display status & metrics | All above | ⭐⭐⭐⭐ Very High |
| **POLISH-001** | E2E tests + docs | Release readiness | All above | ⭐⭐⭐ High |

---

## Feature Details

Each feature has:
- ✅ Functional requirements (EARS format: GIVEN/WHEN/THEN)
- ✅ Non-functional requirements (performance, security, UX)
- ✅ Acceptance criteria (measurable, testable)
- ✅ Scope + Non-scope clarity
- ✅ Dependencies + blocking relationships
- ✅ Open design questions (to resolve in spec phase)

**Spec files location:** `harness/specs/<FEATURE-ID>/requirements.md`

---

## Quality Checklist (Spec Review)

Before approval, validate:

- [ ] **Completeness:** Every feature covers all charter requirements (auth, machines, tunnels, dashboard, monitoring, docker, tests)
- [ ] **EARS Format:** All FRs use GIVEN/WHEN/THEN structure (no ambiguity)
- [ ] **Acceptance Criteria:** All measurable, checkbox-able, testable
- [ ] **No Gaps:** No undocumented decisions or "TBD" items
- [ ] **Dependencies Acyclic:** No circular dependencies between features
- [ ] **Scope Boundaries:** Clear IN/OUT boundaries (no creep)
- [ ] **Design Questions:** Captured and respondible (not blocking)

**Approval Decision:**
- [ ] **APPROVE** — Proceed to first feature (SETUP-001)
- [ ] **REQUEST CHANGES** — Specify which features need revision

---

## Next Actions

### If Approved:
1. **Start SETUP-001:** `paulness next` → spec_author writes full spec (design + tasks)
2. **Loop workflow:** spec → approval → implementation (TDD) → review → ship

### If Changes Requested:
1. **Iterate:** Mark features for revision
2. **Continue:** `paulness feature <description>` for new/modified features
3. **Re-review:** Human approves updated specs

---

## Implementation Notes

- **Stack alignment:** All features respect Hexagonal (backend) + Atomic Design (frontend) + React Hook Form + Zod
- **TDD mandatory:** No feature closes without test coverage > 80%
- **SDK boundary:** Frontend ↔ backend only via PaulineClient
- **Conventional commits:** One commit per feature at commit gate
- **E2E coverage:** Critical flows (login → tunnel CRUD → view uptime) tested in Playwright

---

**Status:** Ready for human review and approval. See individual spec files in `harness/specs/*/requirements.md` for details.
