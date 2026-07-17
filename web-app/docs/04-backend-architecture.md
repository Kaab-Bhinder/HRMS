# 04 · Backend Architecture (Node.js)

**Stack decision:** **NestJS** (Node + TypeScript) with **Prisma** over PostgreSQL. NestJS is chosen over bare Express because it gives first-class modules, dependency injection, guards/interceptors/pipes, and DTO validation out of the box — exactly the "modular, service/repository, middleware, validation layer" separation you asked for. (If you prefer Express, the same layering applies; see assumption A2.)

---

## 1. Layered architecture (request lifecycle)

```
HTTP → Middleware (helmet, cors, request-id, pino, rate-limit)
     → Guard  (JwtAuthGuard → PermissionsGuard → ScopeGuard)
     → Pipe   (ValidationPipe: DTO + class-validator/Zod)
     → Controller  (thin: no business logic)
     → Service     (business rules, orchestration, transactions)
     → Repository   (data access via Prisma; the only layer touching the DB)
     → Interceptor (AuditInterceptor, TransformInterceptor, timeout)
     → Exception Filter (uniform error envelope)
```

**Separation of concerns:** controllers map HTTP↔use-cases; services hold logic; repositories isolate persistence (swap Prisma without touching services); DTOs define the contract; guards/interceptors handle cross-cutting concerns.

## 2. Folder structure (`apps/api/src`)

```
src/
├── main.ts                      # bootstrap, versioning, helmet, cors, swagger
├── app.module.ts
├── config/                      # env schema, typed config (ConfigModule)
├── database/                    # PrismaService, transaction helper, seeders
├── common/
│   ├── guards/                  # jwt-auth, permissions, roles, scope
│   ├── decorators/              # @CurrentUser, @RequirePermissions, @Public
│   ├── interceptors/            # audit, transform, timeout, logging
│   ├── filters/                 # all-exceptions filter
│   ├── pipes/                   # zod/validation pipe
│   ├── middleware/              # request-id, pino http
│   └── utils/                   # crypto, pagination, hashing
└── modules/
    ├── auth/         (controller, service, strategies, dto/)
    ├── users/  roles/  permissions/
    ├── organizations/  departments/  designations/
    ├── employees/    # + custom-field validation integration
    ├── custom-fields/  # definitions CRUD + validator service
    ├── attendance/  leave/
    ├── tasks/
    ├── performance/
    ├── notifications/  files/
    ├── reports/  analytics/
    ├── audit/  settings/
    └── ... (each: <name>.module.ts, .controller.ts, .service.ts, .repository.ts, dto/)
```

**Every module is self-contained** (its own controller/service/repository/dto) and declares what it exports — new modules plug in by importing into `app.module.ts`.

## 3. Cross-cutting services

- **PrismaService** — single connection pool, `$transaction` helper for multi-table writes (payroll runs, approvals).
- **CustomFieldValidatorService** — loads `custom_field_definitions` for an entity, validates/normalizes the `custom_fields` payload (type coercion, required, regex, option membership, uniqueness, encryption). Reused by every module that has custom fields.
- **AuditService / AuditInterceptor** — writes `audit_logs` on mutations with before/after diff + `request_id`.
- **NotificationService** — event-driven (`leave.approved` → template → channel fan-out: in_app/email/SMS/WhatsApp), backed by a queue (BullMQ/Redis) so requests never block on delivery.
- **PermissionCacheService** — caches user→permissions in Redis; invalidated on role change.

## 4. Validation layer

Two-tier: **Zod** at the HTTP edge (fast, shared with frontend types via `packages/shared`) + **class-validator DTOs** inside Nest. `ValidationPipe` is global with `whitelist: true, forbidNonWhitelisted: true` (kills mass-assignment).

## 5. Error handling & responses

Uniform envelope:
```json
{ "success": false, "error": { "code": "EMPLOYEE_NOT_FOUND", "message": "…", "details": [] }, "requestId": "uuid" }
```
Success: `{ "success": true, "data": …, "meta": { pagination } }`. A `TransformInterceptor` wraps all successful responses.

## 6. Async & background work

Redis-backed **BullMQ** queues for: notification delivery, report generation/exports, bulk employee import, scheduled reports (cron), and future payroll runs. Keeps the API responsive and lets a `worker` process scale independently (matches the Fargate worker in the AWS blueprint).

## 7. Observability

`pino` structured logs (with `request_id`), health/readiness endpoints, Prometheus metrics, Sentry for errors, OpenAPI/Swagger auto-generated from DTOs at `/api/v1/docs`.
