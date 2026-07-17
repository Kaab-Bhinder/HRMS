# 01 · Requirements & Module Extraction

**Primary source:** `HRMS_Solution_Proposal (1).docx` (Modules Document) — reconciled with your web-app instructions.
**Scope of this app:** the **Web Admin Application** only (administrators & managers). Employee mobile self-service is a separate client that consumes the same API.

---

## 1. Modules extracted from the Modules Document

The document defines **12 numbered modules + an AI layer + RBAC + security + integrations**, delivered across 4 phases. Mapped to the admin app:

| # | Module (document) | In this admin app | Phase |
|---|---|---|---|
| 1 | Authentication & User Management | ✅ Users, roles, permissions, MFA, sessions | 1 |
| 2 | Employee Management | ✅ Profiles, org hierarchy, history, bulk import | 1 |
| 3 | Attendance Management | ✅ Monitoring, regularization review, shifts, geofence flags | 1 |
| 4 | Leave Management | ✅ Types, balances, approval chains, calendar | 1 |
| 5 | Payroll Management | ⚠️ Read/config surfaces (see assumption A4) | 1/2 |
| 6 | Business Travel | ✅ Schema ready (`approval_steps` reused) | 2 |
| 7 | Asset Management | ✅ Schema-ready (files + custom fields) | 2 |
| 8 | Document Management | ✅ `files`, OCR metadata | 2 |
| 9 | Digital Signature | ⚙️ Schema-extensible | 2 |
| 10 | Employee Self-Service | ➡️ separate client; admin configures it | 1 |
| 11 | Reporting & Analytics | ✅ Dashboard, `saved_reports`, exports | 1 |
| 12 | Notification Center | ✅ Templates, channels, preferences | 1 |
| — | AI HR Assistant / Analytics | 🔮 additive services on same data | 2/3 |

## 2. Modules requested in your web-app instructions

Every item you listed maps to a documented module or a cross-cutting concern — nothing you asked for falls outside the document:

Employee, Department, **Role & Permission**, **Task Management / Assignment / Monitoring**, Attendance monitoring, Performance tracking, Analytics dashboard, Reports, Notifications, **Audit logs**, Settings, Profile, **Organization management**.

> **New vs document:** *Task Management* (assignment/monitoring) and an explicit *Organization Management* surface are emphasised more strongly in your instructions than in the document. Both are first-class in the schema (`tasks`, `task_assignments`, `task_activity`, `organizations`, `locations`). **Per your directive, your instructions win where they extend the document** — while still implementing every documented feature.

## 3. Consolidated admin module list (what we build)

**Core (Phase 1):** Auth · Users · Roles & Permissions · Organization · Departments · Designations · Employees (+ custom fields) · Attendance monitoring · Leave · Tasks · Notifications · Analytics dashboard · Reports · Audit logs · Settings · Profile.

**Phase 2+ (schema already present):** Performance · Goals/KPIs · Documents/Files · Business Travel · Assets · Digital Signature · AI assistant hooks.

## 4. Actor roles (from document §6)

Super Admin · HR Manager · Department Manager · Finance Officer · Employee. The first four use this admin app; "Employee" is read-mostly and primarily uses the mobile/self-service client. Roles are **data**, not code (see `roles`/`permissions`) so new roles need no deploy.
