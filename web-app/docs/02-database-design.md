# 02 · Database Design, Relationships & Custom Fields

Authoritative DDL: [`db/schema.sql`](../db/schema.sql). This doc explains the *why* and the relationships.

---

## 1. Design principles (applied to every table)

| Principle | Implementation |
|---|---|
| **Normalization** | 3NF for transactional data; deliberate JSONB for open-ended attributes (custom fields, settings, report defs). |
| **Primary keys** | `uuid` (`gen_random_uuid()`) everywhere — non-enumerable, safe to merge across shards/tenants. |
| **Foreign keys** | Explicit, with intentional `ON DELETE` (`CASCADE` for owned children, `SET NULL` for references, `RESTRICT` where deletion must be blocked). |
| **Indexes** | Every FK indexed; composite indexes on hot filters (`org_id,status`, `emp_id,date`); GIN on JSONB + trigram for search. |
| **Constraints** | `CHECK` (date ranges, progress 0–100, positive sizes), `UNIQUE` (partial, soft-delete aware). |
| **Unique validation** | Partial unique indexes: `... WHERE deleted_at IS NULL` so a soft-deleted row never blocks re-use of an email/code. |
| **Timestamps** | `created_at` + `updated_at` (auto-maintained by `set_updated_at` trigger) on all mutable tables. |
| **Soft delete** | `deleted_at` (+ `deleted_by`) on business entities; queries filter `deleted_at IS NULL`. |
| **Audit fields** | `created_by` / `updated_by` / `deleted_by` on core entities + global `audit_logs`. |
| **Multi-tenant ready** | `organization_id` on every tenant table — single org today, isolate many later with zero restructuring. |

## 2. Entity map (grouped)

```
organizations ─┬─ locations ─┬─ (geofence attendance)
               ├─ departments (self-ref parent_id, head_employee_id → employees)
               ├─ designations
               ├─ users ─┬─ user_roles ─ roles ─ role_permissions ─ permissions
               │         ├─ refresh_tokens / password_reset_tokens
               │         └─ notification_preferences
               ├─ employees ─┬─ (user_id 1:1 optional)
               │             ├─ manager_id (self-ref reporting line)
               │             ├─ employment_history
               │             ├─ employee_shifts ─ shifts
               │             ├─ attendance_records ─ attendance_regularizations
               │             ├─ leave_balances / leave_requests ─ leave_types
               │             ├─ task_assignments ─ tasks ─ task_comments / task_activity
               │             ├─ performance_reviews ─ review_cycles
               │             └─ goals
               ├─ custom_field_definitions ─ (custom_field_values mirror)
               ├─ holidays / leave_types
               ├─ approval_steps (polymorphic: leave, travel, …)
               ├─ notifications / notification_templates
               ├─ files (polymorphic owner_type/owner_id)
               ├─ saved_reports / settings
               └─ audit_logs / activity_logs
```

## 3. Key relationships explained

- **Users ↔ Employees (1:1 optional).** `users` is the *login identity*; `employees` is the *HR record*. Kept separate because not every user is an employee (external admin, service account) and not every employee has login yet (`user_id` nullable). Prevents auth churn from bleeding into HR data.
- **Departments** self-reference via `parent_id` (unlimited hierarchy) and point to a head via `head_employee_id` (deferred FK because it's a chicken-and-egg with `employees`).
- **RBAC** is a classic 4-table model: `users → user_roles → roles → role_permissions → permissions`. `user_roles.scope_department_id` optionally scopes a role to one department (e.g., a Department Manager only over their team).
- **Approvals** are generic: `approval_steps(subject_type, subject_id, step_order)` drives leave, travel, regularization, and any future request type — one engine, many consumers.
- **Attendance** enforces one record per employee per day (`uq_attendance_day`) and carries geo + face-match fields for anti-fraud (`is_flagged`, `face_match_score`).
- **Files** are polymorphic (`owner_type`,`owner_id`) so documents attach to any entity without a table per relationship; upload security metadata (`checksum`, `is_scanned`, `scan_result`) lives here.
- **Audit** (`audit_logs`) is append-only/immutable (identity PK, no update path) and correlates to requests via `request_id`; `activity_logs` is the lighter human-readable feed for the dashboard.

## 4. Dynamic Custom Fields — the design

**Chosen model: JSONB-hybrid EAV** (metadata table + `jsonb` value column on each entity). Recommended over pure EAV.

**How it works**
1. `custom_field_definitions` holds one row per admin-created field: `entity` (employee/task/…), `field_key`, `label`, `data_type` (14 types incl. select/multiselect/file), validation (`is_required`, `is_unique`, `min/max`, `regex`, `options`), and behaviour (`display_order`, `is_visible`, `is_searchable`, `is_filterable`, `is_encrypted`).
2. Each entity table (`employees`, `tasks`, `departments`, `leave_requests`, …) has a `custom_fields jsonb` column. Values are stored keyed by `field_key`: `{"passport_number":"AB123", "blood_group":"O+"}`.
3. A **GIN index** (`jsonb_path_ops`) on that column makes filtering/search on custom values fast.

**Why JSONB-hybrid, not pure EAV or ALTER TABLE**

| Approach | Verdict |
|---|---|
| `ALTER TABLE` per field | ❌ needs migrations/deploys, schema drift, DDL locks — violates the "no code change" requirement. |
| Pure EAV (row per value) | ⚠️ relationally clean but N-row joins per record, painful reads, hard ordering. |
| **JSONB-hybrid (chosen)** | ✅ one row read, GIN-indexed filter/search, validation driven by the definitions table, no migrations to add a field. Optional `custom_field_values` mirror covers heavy cross-entity reporting. |

**Lifecycle**
- *Create field:* admin defines it in UI → row in `custom_field_definitions`. Instantly available in forms/filters — **no migration, no deploy**.
- *Validate:* API loads definitions for the entity, validates the incoming `custom_fields` payload (type, required, regex, unique, option membership) before write. Uniqueness is enforced in the service layer with a targeted query (JSONB can't express per-key partial-unique cleanly).
- *Search/filter:* only fields flagged `is_searchable`/`is_filterable` are exposed; queries use `custom_fields @> '{"key":"value"}'` (GIN-accelerated) or `->>` extraction for ranges.
- *Encrypt:* fields flagged `is_encrypted` (e.g., passport, license) are encrypted app-side before being placed in JSONB.
- *Seed:* default fields (Name/Email/Phone/Department are native columns; extras like Blood Group can be seeded as `is_system` definitions).

See `05-backend-architecture.md` for the validation service and `10`/API doc for endpoints.

## 5. Indexing & performance summary

- Partial unique indexes for soft-delete-aware uniqueness.
- Composite indexes on `(organization_id, status)` and `(employee_id, date)` — the two most common admin filters.
- GIN trigram index on employee name for global fuzzy search; GIN on `custom_fields`.
- `audit_logs` is a candidate for **monthly range partitioning** at scale (documented in `07`).
