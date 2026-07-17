# 07 · Assumptions & Scalability

## 1. Assumptions made (per your "infer the most scalable option" directive)

| # | Decision | Assumption & rationale | Reversible? |
|---|---|---|---|
| A1 | **Frontend = React + Vite SPA** | Admin panel is auth-gated, no SEO; SPA is simpler/faster than Next.js. Your instruction said "React" (not Next.js), so I followed it literally. | Yes — can wrap in Next later. |
| A2 | **Backend = NestJS** | You said "Node.js"; NestJS is the enterprise-grade Node framework that natively provides the modular/service-repository/middleware structure you required. | Yes — Express fallback keeps same layering. |
| A3 | **ORM = Prisma**, SQL is source of truth | Type-safe, migration-friendly. `db/schema.sql` is authoritative; `prisma db pull` generates client. | Yes — TypeORM/Knex swappable behind repositories. |
| A4 | **Payroll = config/read surfaces only in v1** | Full payroll (tax slabs, bank files) is heavy and partly Phase 2 in the document; schema hooks exist but UI focuses on your listed modules first. | Additive. |
| A5 | **Custom fields = JSONB-hybrid EAV** | Best balance of flexibility, performance, no-migration field creation (see doc 02 §4). | Mirror table already included for reporting. |
| A6 | **Multi-tenant-ready, single-tenant now** | `organization_id` on every table; run one org today, isolate many later with row-level security. | Yes — zero restructuring. |
| A7 | **Self-service/mobile is a separate client** | This repo is the admin app; both share the API. | — |
| A8 | **UUID PKs, soft deletes, audit everywhere** | Enterprise defaults you asked for. | — |

> If any of A1–A4 doesn't match your intent, flag it — they're the only choices that change the shape of the build.

## 2. Scalability & future-proofing (built in now)

- **Schema covers all 4 phases** — performance, goals, travel (via `approval_steps`), assets/documents (via `files` + custom fields), notifications, so new modules need no restructuring.
- **Generic approval engine** (`approval_steps`) serves any future request type.
- **Polymorphic files** and **custom fields** mean new attachable/attributed entities cost zero schema change.
- **Roles/permissions are data** — new roles/permissions without deploys.
- **Queue-based async** (BullMQ/Redis) isolates heavy work (imports, exports, notifications, future payroll/AI) from request latency; the worker scales independently.
- **Stateless API** behind a load balancer → horizontal scale on ECS Fargate (per AWS blueprint).
- **Read scaling**: RDS read replicas for analytics/reports; Redis cache for permissions + dashboard aggregates.
- **`audit_logs` partitioning**: range-partition by month once volume grows; archive cold partitions to S3.

## 3. Recommended improvements (worth adopting)

1. **Row-Level Security (RLS)** in Postgres keyed on `organization_id` — defense-in-depth for the multi-tenant path.
2. **Outbox pattern** for notifications/audit → guarantees delivery + clean event stream for the future AI layer.
3. **OpenAPI-first** — generate the shared TS types (`packages/shared`) and the frontend API client from the spec, so backend/frontend never drift.
4. **Feature flags** (`settings`) to dark-launch Phase 2/3 modules per org.
5. **Materialized views** for expensive dashboard aggregates (headcount trends, attrition), refreshed on a schedule.
6. **CQRS-lite for analytics** — a read model separate from transactional tables once reporting load grows.

## 4. Build order (recommended)

1. Foundation: monorepo, config, Prisma from `schema.sql`, auth + RBAC, seed roles/permissions.
2. Organization → Departments → Designations → **Employees + Custom Fields** (the core spine).
3. Attendance → Leave (+ approvals) → Tasks.
4. Dashboard/Analytics → Reports → Notifications → Audit viewer → Settings/Profile.
5. Phase 2 modules on the existing schema.
