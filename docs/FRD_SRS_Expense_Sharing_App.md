# Functional Requirements / SRS
**Project:** Open‑Source Splitwise‑Style Expense Sharing App  
**Version:** 0.1 (Template-generated)  
**Audience:** Developers, QA, Security

> 🔰 Beginner tip: Each requirement has a unique ID (e.g., B3‑F2) and testable Acceptance Criteria with concrete examples.

---

## A. System Overview
**Architecture:** Next.js web client (PWA) ↔ REST API ↔ PostgreSQL; Redis for jobs; S3‑compatible storage for receipts.  
**Actors:** End User, Auth Provider (Google/GitHub), Email Service, Object Storage.

---

## B. Functional Requirements
### B1 Authentication & Sessions
- **B1‑F1 (OAuth):** The system **shall** support OAuth login via Google/GitHub.
  - **AC Example:** Given I click “Continue with Google” and approve, I land on **/groups** already logged in.
- **B1‑F2 (Session Cookie):** Session is stored in **httpOnly, SameSite=Strict** cookie.
  - **AC Example:** No access token is readable from JavaScript (`document.cookie` does not show it).
- **B1‑F3 (CSRF):** State‑changing requests **shall** include CSRF protection.
  - **AC Example:** A POST from a third‑party origin without the CSRF token is rejected with **403**.

### B2 Groups
- **B2‑F1 (Create):** Create a group with `name` and `defaultCurrency`.
  - **AC Example:** Missing `name` → 422 validation error with message “Name is required”.
- **B2‑F2 (Members):** Invite/remove members; roles: **owner, admin, member**.
  - **AC Example:** Only **owner/admin** can remove a member; attempt by **member** returns **403**.
- **B2‑F3 (Settings):** Toggle `simplifyDebts` per group.
  - **AC Example:** When enabled, the “Balances” view shows minimized payment paths.

### B3 Expenses
- **B3‑F1 (Create):** Create expense with fields:  
  `{amountMinor, currency, payerIds[], participantIds[], split{mode, ...}, note?, category?, receipt?}`
  - **AC Example:** Negative or zero `amountMinor` → 422 “Amount must be positive”.
- **B3‑F2 (Split Modes):** Support `equal | percent | shares | exact`.
  - **AC Example (percent):** 60/40 for ₹1200 yields ₹720 and ₹480; if totals ≠ 100%, block save.
  - **AC Example (exact):** Exact entries must sum to total; else 422.
- **B3‑F3 (Update/Delete):** Use optimistic concurrency with `version` number.
  - **AC Example:** If client sends outdated version, API returns **409 Conflict**.
- **B3‑F4 (Offline Outbox):** Offline create/update **shall** enqueue to `outbox` and retry on connectivity.
  - **AC Example:** Adding an expense offline shows a “Syncing…” badge; after internet returns, it appears on another device within 1 minute (p95).

### B4 Balances & Debt Simplification
- **B4‑F1:** Compute per‑user balances for a group.
  - **AC Example:** After adding A pays ₹900 for A+B (equal), balances show **B owes A ₹450**.
- **B4‑F2:** Provide deterministic simplification (graph reduction). Log inputs/outputs in `audit_logs`.
  - **AC Example:** Three‑way debts collapse to at most **N‑1** payments without changing totals.

### B5 Settlements
- **B5‑F1:** Record settlement `{fromUser, toUser, amountMinor, currency, method?, note?}`.
  - **AC Example:** Settlement cannot exceed the amount owed; else 422.
- **B5‑F2 (Idempotency):** Prevent duplicates using `Idempotency‑Key`.
  - **AC Example:** Re‑posting the same key returns the original 201 response body, not a duplicate row.

### B6 Internationalization & RTL
- **B6‑F1:** Locale routing `/{locale}/...` with default fallback.
- **B6‑F2:** Format money/dates using **Intl** for the chosen locale.
- **B6‑F3:** Set `dir=ltr|rtl` based on locale.
  - **AC Example:** `ar` renders layout RTL; money shows localized digits if the locale dictates.

### B7 Files / Receipts
- **B7‑F1:** Upload via pre‑signed URL; allowed mime: `image/jpeg`, `image/png`, <limit> MB.
  - **AC Example:** Oversized file → 413 with friendly UI message.
- **B7‑F2:** If offline, store pointer locally; upload when online.

### B8 Exports
- **B8‑F1:** CSV export for any group within a date range.
  - **AC Example:** Generated file name includes group name + date range (e.g., `roommates_2025‑01.csv`).

### B9 Notifications
- **B9‑F1:** Email reminders for recurring bills; user can mute per group.
  - **AC Example:** A muted group sends no reminders until unmuted.

---

## C. API (v1 — Skeleton with Examples)
> Replace `<id>` with UUIDs; use `Idempotency‑Key` header for POST/PUT from offline outbox.

- **POST /v1/groups** → `201 { id: "<uuid>" }`  
  **Request (JSON):** `{ "name":"Roommates", "defaultCurrency":"INR" }`

- **GET /v1/groups/<id>** → `200 { ...Group }`

- **POST /v1/expenses** → `201 { id, version }`  
  **Headers:** `Idempotency‑Key: 3f7c...`  
  **Request:** `{ "groupId":"<id>", "amountMinor": 300000, "currency":"INR", "payerIds":["A"], "participantIds":["A","B","C"], "split":{"mode":"equal"} }`

- **PUT /v1/expenses/<id>** → `200 { version }`  
  **Headers:** `If‑Match: <version>`

- **GET /v1/balances?groupId=<id>** → `200 { perUser: { "A": 150000, "B": -75000, ... } }`

- **POST /v1/settlements** → `201 { id }`  
  **Request:** `{ "groupId":"<id>", "fromUser":"B", "toUser":"A", "amountMinor":75000, "currency":"INR" }`

- **POST /v1/uploads/receipts** → `200 { url, fields }`

**Common errors:** 401 Unauthorized, 403 Forbidden, 409 Conflict (version), 422 Validation, 429 Rate limit.

---

## D. Data Model (MVP)
- **users**(id, email, name, locale, created_at)  
- **groups**(id, name, default_currency, simplify_debts, created_by, created_at)  
- **memberships**(id, group_id, user_id, role, created_at)  
- **expenses**(id, group_id, created_by, amount_minor, currency, category, note, created_at, updated_at, version)  
- **expense_splits**(id, expense_id, user_id, share_minor)  
- **settlements**(id, group_id, from_user, to_user, amount_minor, currency, method, note, created_at)  
- **attachments**(id, owner_type, owner_id, object_key, mime, size, created_at)  
- **audit_logs**(id, actor_id, entity, entity_id, action, before, after, at)

**Indexes:** `(group_id, created_at)`, `(expense_id)`, `(user_id)`.  
**Validation:** `amount_minor > 0`, currency is ISO‑4217, `version` increments on update.

---

## E. Non‑Functional Requirements (measurable)
- **Performance:** p50 < 300ms; p95 < 1000ms for primary endpoints.  
- **Availability:** 99.9% (single region acceptable for MVP).  
- **Security:** OWASP ASVS L1; httpOnly cookies; CSRF; input validation; rate limits.  
- **Privacy:** Store minimal PII offline; configurable data retention.  
- **Accessibility:** WCAG 2.1 AA (form labels, keyboard nav, color contrast).  
- **Observability:** Request IDs; logs with user/session context; Prometheus metrics.

---

## F. Client Offline Behavior
- **Outbox item:** `{ id, op, url, bodyHash, retries, createdAt }`  
- **Retry:** Exponential backoff with jitter; max attempts <N>; surface “Resolve now” if exhausted.  
- **Conflict:** 409 → fetch latest → show merge UI (keep mine/take server).

---

## G. Test Plan (Examples)
- **Unit:** Split math (percent/shares/exact), debt simplification.  
- **API Contract:** Schemathesis on OpenAPI; fuzz invalid inputs.  
- **E2E (Playwright):** Add expense offline → go online → verify balances.  
- **Accessibility:** axe checks on forms and tables.  
- **Performance:** Lighthouse PWA score ≥ 90 on mobile emulation.

---

## H. Risks & Mitigations
- **Duplicate expenses on retry** → Idempotency store keyed by request hash.  
- **Storage quota exceeded** → warn and allow selective purge.  
- **FX rounding disputes** → record applied rate + rounding rule per expense.

---

## I. Change Log
- v0.1 — Initial SRS template with concrete AC examples.