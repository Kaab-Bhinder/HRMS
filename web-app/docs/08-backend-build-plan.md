# 08 · Backend Build Plan (NestJS + Prisma + PostgreSQL)

**Framework:** NestJS (TypeScript on Node). Chosen over Express/FastAPI because it *is* Node, shares types with the React admin app, matches the existing schema/docs, and provides guards/DI/validation for the RBAC+audit spec out of the box. Mobile is **Flutter** → we expose **OpenAPI/Swagger** and generate a Dart client from it (no type-sharing needed with mobile).

**Source of truth transition:** `db/schema.sql` remains the reference design; `apps/api/prisma/schema.prisma` becomes the operational source of truth (Prisma migrations create/evolve the DB). Models are added phase by phase.

---

## Phase 0 — Foundation & DevEx
- NestJS app, `ConfigModule` with env validation, versioned API (`/api/v1`), Helmet, CORS allowlist, cookie-parser.
- Prisma + PostgreSQL connection, `PrismaService` lifecycle.
- Global `ValidationPipe` (whitelist + forbid unknown), `AllExceptionsFilter` (uniform error envelope), `TransformInterceptor` (uniform success envelope), request-id + structured logging.
- Swagger at `/api/v1/docs`, `/health` endpoint, Throttler (rate limiting).

## Phase 1 — Auth & RBAC
- `users`, Argon2id hashing, JWT **access (15m)** + **refresh (7d) with rotation & reuse detection**.
- Endpoints: `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`; password reset; MFA (TOTP) stub.
- `roles`, `permissions`, `role_permissions`, `user_roles`; `@RequirePermissions()` + `PermissionsGuard` + `JwtAuthGuard`; `@Public()`, `@CurrentUser()`.
- **Seed**: permission catalog, 5 system roles (Super Admin, HR Manager, Dept Manager, Finance, Employee), one super-admin user.

## Phase 2 — Organization & People
- Organizations, locations; departments (self-referencing hierarchy) + designations.
- Employees: CRUD, filters/search/pagination, soft delete, bulk CSV import, employment history.
- **Employee documents**: `files` (polymorphic), presigned S3 upload, MIME/size/scan validation.
- **Custom Fields engine**: `custom_field_definitions` CRUD + `CustomFieldValidatorService` (type/required/regex/unique/options) validating the JSONB `custom_fields` on write; filter/search support.

## Phase 3 — Time & Work
- Attendance: records (one/day), shifts/rosters, geofence + face-match fields, regularization approvals.
- Leave: types, balances, requests + **generic `approval_steps` engine** (reused by travel later).
- **Tasks**: create + **assign to employees** (`task_assignments`), comments, activity log, and the **assignee-scoped `PATCH /tasks/:id/status` "mark complete"** endpoint the Flutter app calls (guarded so an employee can only update their own assigned tasks).

## Phase 4 — Insights & System
- Performance (review cycles, reviews, goals); Notifications (templates + channels + BullMQ delivery + preferences); Reports (saved defs + async export to file); Analytics (dashboard aggregates, cached); **Audit interceptor** → `audit_logs`; Settings.

## Phase 5 — Integrations, AI & Hardening
- S3 storage; SES email / SMS / WhatsApp via BullMQ workers; Rekognition (face match/liveness), Textract (OCR), Bedrock (AI assistant, RAG over employee-scoped data + policy docs).
- Generate **Flutter/Dart client** from OpenAPI; e2e + unit tests; CI/CD (GitHub Actions); deploy to AWS (per the infra blueprint).

## Then: connect the admin dashboard
Flip `USE_MOCKS=false` in `apps/web/src/services/client.ts`, implement `http()`, swap each mock service body for the matching endpoint. UI unchanged.

---

### DB setup (run once, with your Postgres superuser password)
```bash
sudo -u postgres psql -c "CREATE ROLE wms LOGIN PASSWORD 'wms';"
sudo -u postgres psql -c "CREATE DATABASE wms OWNER wms;"
# then in apps/api:  npx prisma migrate dev --name init  &&  npx prisma db seed
```
