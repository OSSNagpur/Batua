# Product Requirements Document (PRD)
**Project:** Open‑Source Splitwise‑Style Expense Sharing App  
**Version:** 0.1 (Template-generated)  
**Owner:** <Your Name / Product>  
**Reviewers:** <Eng Lead, Design, QA, Security>  
**Last Updated:** <YYYY‑MM‑DD>

> 🔰 This PRD is beginner‑friendly. Keep the guidance while drafting, then remove it before publishing.

---

## 1. Summary
**One‑liner:** Track and split expenses fairly with friends and groups, even when offline.  
**Problem:** People forget expenses or can’t add them on poor networks; splitting rules are error‑prone.  
**Outcome:** Simple flows to add expenses, see balances, and settle up confidently.

### Example
- “Rina and her roommates split rent, electricity (percentages), and groceries (exact amounts). Rina can add expenses on the metro and they sync later.”

---

## 2. Goals & Non‑Goals
### 2.1 Goals (MVP)
- Create groups and add shared expenses (equal/percent/shares/exact).
- Show per‑user balances and allow recording settlements.
- Offline‑first: add/edit expenses offline → auto‑sync online.

### 2.2 Stretch (Post‑MVP)
- Itemized receipt splitting (OCR).
- Public, read‑only share link for a trip summary.

### 2.3 Non‑Goals (Not now)
- Bank account connections or auto‑import from statements.
- Credit score or lending products.

---

## 3. Users & Personas
- **Roommates Rina (primary):** monthly bills + reminders.
- **Trip Planner Tanmay (primary):** logs expenses while traveling (often offline).
- **Organizer Olivia (secondary):** exports summaries for reimbursement/accounting.

**Devices:** Low‑end Android to modern iPhone + desktop.  
**Accessibility:** Keyboard navigation, screen readers, color‑contrast AA.

---

## 4. User Stories (with Acceptance Criteria Examples)
> Format: *As a <user>, I want <capability>, so that <benefit>.*  
> Each story includes **clear acceptance criteria (AC)** in a testable way.

### US‑1 Add Equal Expense
**Story:** As a roommate, I want to add an equal split expense so that everyone pays fairly.  
**AC (with examples):**
- ✅ When I enter **₹3000** for **Rent** with **3 participants**, the app auto‑calculates **₹1000** per person.
- ✅ If I remove 1 participant (now 2), each share updates to **₹1500**.
- ✅ If offline, a “Syncing…” status is shown and the expense appears immediately; it syncs automatically when online.
- ❌ I should not be able to save if **amount** is empty or negative (show a friendly error).

### US‑2 Add Percent Expense
**Story:** As a roommate, I want to split by percent for utilities.  
**AC:**
- ✅ When I choose **percent mode**, the sum of percentages must equal **100%** before save.
- ✅ Example: Electricity ₹1200 with 60/40 splits creates shares **₹720** and **₹480**.
- ❌ If the sum is **≠ 100%**, show “Percentages must total 100%” and disable Save.

### US‑3 Add Shares/Exact Expense
**AC:**
- ✅ Shares: If I set shares **A=2, B=1, C=1** for ₹2000, per‑person amounts are ₹1000/₹500/₹500.
- ✅ Exact: Exact amounts must sum to **total** (validation blocks save otherwise).

### US‑4 View Balances
**Story:** As a member, I want to see who owes whom to settle quickly.  
**AC:**
- ✅ After adding expenses, I can see a positive or negative balance for each member in the group.
- ✅ Debt simplification (if enabled) reduces the number of payments without changing totals.

### US‑5 Record Settlement
**AC:**
- ✅ Recording a **₹500** cash settlement from **A → B** reduces A’s debt by ₹500 and B’s credit by ₹500.
- ✅ Duplicate submissions are prevented via an **Idempotency‑Key** (no double payments on retry).

---

## 5. Success Metrics
- **Activation:** ≥ 60% new users create a group + 1 expense within 24h.
- **Reliability:** ≥ 95% offline writes sync within 10 minutes.
- **Support:** ≤ 1% of sessions report “lost expense”.

---

## 6. Feature Scope (Mini‑Specs with AC)
### 6.1 Groups
**Description:** Create/join groups; manage members; default currency.  
**Key Flows:** create group → invite → leave group.  
**AC (examples):**
- ✅ Cannot create a group without a name.  
- ✅ Default currency selection persists (e.g., INR).

### 6.2 Expenses
**Description:** Add/edit/delete expenses; split modes; receipts.  
**AC (examples):**
- ✅ Notes are optional; category selectable (e.g., “Rent”, “Food”).  
- ✅ Receipt upload optional; if offline, queued and uploaded later.  
- ✅ Optimistic UI shows the new expense immediately.

### 6.3 Balances & Settlements
**AC (examples):**
- ✅ Balances recalc after any expense/settlement.  
- ✅ Settlements cannot exceed what is owed to a counter‑party.

---

## 7. UX & Content
- **Tone:** Friendly, concise, action‑oriented.  
- **Empty states:** “Create your first group” with a CTA button.  
- **Mobile‑first:** 360px min width layouts; touch targets ≥ 44px.

---

## 8. Internationalization (i18n) & RTL
**AC (examples):**
- ✅ Locale switch updates currency/date formats (e.g., `₹1,234.50` vs `$1,234.50`).  
- ✅ Arabic/Hebrew flips layout direction to **RTL** without broken visuals.

---

## 9. Constraints & Risks
- **Privacy:** Store only necessary data offline.  
- **Tech:** Network variability; device storage quotas.  
- **Legal:** Currency display disclaimers where required.

---

## 10. Release Plan
- **MVP:** Groups, Expenses, Balances, Settlements, Offline add/sync.  
- **Beta:** CSV export, reminders.  
- **GA:** Localization, accessibility polish, reports.

---

## 11. Appendix — Glossary (Plain Language)
- **Offline‑first:** Works without internet; syncs later.  
- **Service Worker (SW):** Background helper in browser for caching/sync.  
- **IndexedDB (Dexie):** Local database inside the browser.  
- **Idempotency Key:** Prevents double‑processing of the same request.  
- **MVP/Beta/GA:** Release phases from smallest usable to fully launched.