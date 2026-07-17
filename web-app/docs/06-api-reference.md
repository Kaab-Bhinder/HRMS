# 06 · API Reference (per module)

Conventions: base `/(/api/v1)`, JWT bearer, cursor/offset pagination (`?page=&limit=&sort=&order=`), filtering (`?filter[field]=`, incl. `filter[cf.<key>]=` for custom fields), uniform envelope. Each endpoint is guarded by the noted `resource:action` permission.

---

## Auth `/auth`
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/auth/login` | public | email+password → tokens |
| POST | `/auth/refresh` | cookie | rotate tokens |
| POST | `/auth/logout` | auth | revoke refresh family |
| POST | `/auth/mfa/setup` · `/auth/mfa/verify` | auth | TOTP enrol/verify |
| POST | `/auth/forgot-password` · `/auth/reset-password` | public | reset flow |
| GET | `/auth/me` | auth | current user + perms |

## Organizations `/organizations`, Locations `/locations`
Standard CRUD (`organizations:read/update`, `locations:*`). Org settings at `/organizations/:id/settings`.

## Users / Roles / Permissions
| Method | Path | Permission |
|---|---|---|
| CRUD | `/users` | `users:*` |
| POST | `/users/:id/roles` | `users:assign_role` |
| CRUD | `/roles` (+ `/roles/:id/permissions`) | `roles:*` |
| GET | `/permissions` | `roles:read` |

## Departments `/departments`, Designations `/designations`
CRUD + `GET /departments/tree` (hierarchy), `GET /departments/:id/members`.

## Employees `/employees`
| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/employees` | `employees:read` | paginate, filter (incl. `filter[cf.*]`), search |
| POST | `/employees` | `employees:create` | validates `custom_fields` vs definitions |
| GET/PATCH/DELETE | `/employees/:id` | `employees:read/update/delete` | delete = soft |
| POST | `/employees/:id/restore` | `employees:delete` | undo soft delete |
| POST | `/employees/import` | `employees:import` | bulk CSV (async job) |
| GET | `/employees/export` | `employees:export` | CSV/XLSX |
| GET | `/employees/:id/history` | `employees:read` | employment_history |

## Custom Fields `/custom-fields`
| Method | Path | Permission |
|---|---|---|
| GET | `/custom-fields?entity=employee` | `custom_fields:read` |
| POST | `/custom-fields` | `custom_fields:create` |
| PATCH/DELETE | `/custom-fields/:id` | `custom_fields:update/delete` |
| PATCH | `/custom-fields/reorder` | `custom_fields:update` |

## Attendance `/attendance`
`GET /attendance` (filter by date/dept/employee/flagged), `GET /attendance/summary` (dashboard stats), `GET /attendance/:employeeId`, `PATCH /attendance/:id` (manual correct), regularizations: `GET /attendance/regularizations`, `POST /attendance/regularizations/:id/approve|reject`. Shifts/rosters under `/shifts`, `/employee-shifts`.

## Leave `/leave`
`/leave/types` CRUD · `GET /leave/requests` (filter status) · `POST /leave/requests/:id/approve|reject` · `GET /leave/balances/:employeeId` · `/holidays` CRUD.

## Tasks `/tasks`
CRUD · `POST /tasks/:id/assign` · `GET /tasks/:id/comments` + `POST` · `GET /tasks/:id/activity` · `GET /tasks/board?groupBy=status` (kanban) · monitoring stats `GET /tasks/stats`.

## Performance `/performance`
`/performance/cycles`, `/performance/reviews` CRUD + submit, `/goals` CRUD.

## Notifications `/notifications`
`GET /notifications` (mine) · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` · `/notifications/templates` CRUD · `/notifications/preferences`.

## Analytics `/analytics`
`GET /analytics/overview` (all dashboard KPIs in one call) · `/analytics/attendance` · `/analytics/tasks` · `/analytics/departments` · `/analytics/productivity`. Read-only, cached.

## Reports `/reports`
`GET/POST /reports` (saved definitions) · `POST /reports/:id/run` (async → file) · `GET /reports/:id/download`.

## Audit & Activity `/audit`
`GET /audit/logs` (filter entity/actor/action/date; export) · `GET /activity` (dashboard feed). Read-only; no write/delete endpoints (immutable).

## Settings & Profile
`/settings` (org key/value), `/settings/security`, `/profile` (self: update, change password, avatar), `/files` (`POST /files` secure upload → presigned S3, `GET /files/:id`).

## Files `/files`
`POST /files/presign` → presigned PUT · `POST /files` (register metadata + trigger scan) · `GET /files/:id` (presigned GET). MIME allowlist + size cap + AV scan enforced.

---
**~18 resource groups, ~90 endpoints.** Every list endpoint supports pagination, sort, filter (native + custom fields), and search; every mutation is audited.
