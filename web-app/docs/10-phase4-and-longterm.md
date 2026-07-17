# 10 · Phase 4 & Long-Term Requirements

How the 7 long-term requirements are honored in Phase 4 and the ongoing architecture.

| # | Requirement | How it's designed |
|---|---|---|
| **1** | **Multi-channel notifications** | `NotificationChannel` **strategy interface** (same pattern as attendance providers). `InAppChannel` implemented now; `FcmChannel`, `EmailChannel`, `SmsChannel`, `WhatsAppChannel` are registered by adding a class — the core `NotificationService` never changes. Templates (per event+channel+locale), priorities, scheduling (`scheduledAt`), read/unread (`readAt`), and per-channel **delivery logs** all modeled. |
| **2** | **Reports & Analytics** | Reports: filtering, sorting, pagination + **CSV export now, Excel/PDF via a pluggable `ExportFormatter`**; printing is a client concern (print-friendly views). Analytics endpoints accept **date range, department, branch (location), employee, org** filters; queries use indexed columns + `groupBy`/aggregations and are pagination-bounded. |
| **3** | **Audit & activity logs** | Global `AuditInterceptor` records **actor, action, entityType, entityId, beforeData, afterData, IP, device (user-agent), requestId, timestamp** on every mutation. `AuditService.log()` lets services attach precise before/after. Logs are **searchable/filterable** (actor, action, entity, date, IP). Separate lightweight `activity_logs` powers the dashboard feed. |
| **4** | **Modular settings** | `settings(org, key, value jsonb)` — typed sections (attendance, leave, overtime, schedules, notification prefs, branding, business hours, integrations) configurable **without code changes**. Attendance/leave policies already have dedicated tables; general config is key/value. |
| **5** | **Flutter + React parity** | Every endpoint returns the **same envelope** (`{success, data}` / `{success, data, meta}`), same pagination (`page/limit/sort/order`), same validation-error shape (`{error:{code,message,fields}}`), same JWT + refresh-cookie flow. OpenAPI/Swagger is the single contract both clients generate from. |
| **6** | **Scalability** | Continue one-module-per-domain, DI, repository-via-Prisma, org-scoped, soft-delete. New modules plug into `app.module` only. APIs paginated/filterable; JSONB + indexes for extensibility. |
| **7** | **Indonesian market / i18n-ready** | No translations added. Backend stays **language-neutral**: enums/codes, UTC timestamps, numeric values. The only human text (notification templates) carries a `locale` column so Indonesian content is added as data later — **no backend refactor**. |

Phase 4 modules: **Performance**, **Notifications**, **Reports**, **Analytics**, **Audit**, **Settings** — each integrated with the React admin.
