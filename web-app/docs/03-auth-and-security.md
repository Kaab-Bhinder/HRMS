# 03 · Authentication, Authorization & Security Architecture

Covers your full security checklist. Everything below is enforced server-side; the React app is treated as an untrusted client.

---

## 1. Authentication (JWT + refresh rotation)

```
Login (email+password)
  → Argon2id verify + rate-limit + lockout check
  → issue Access JWT  (15 min, in memory / Authorization header)
  → issue Refresh JWT (7 days, httpOnly + Secure + SameSite=Strict cookie)
  → persist refresh token HASH + family_id in refresh_tokens
Access expires
  → POST /auth/refresh (cookie)
  → verify hash + not revoked → ROTATE (issue new pair, revoke old, link replaced_by)
  → reuse of a revoked token ⇒ whole family_id revoked (theft detection)
Logout → revoke family; clear cookie
```

- **Access token**: short-lived, stateless, carries `sub`, `org_id`, `roles`, `perms` (or a perms hash + cache lookup). Never in localStorage.
- **Refresh token**: opaque to JS (httpOnly cookie), **hashed at rest**, **rotated** on every use, with **reuse detection** via `family_id`.
- **MFA**: TOTP (`users.mfa_secret`, encrypted) + email/SMS OTP; enforced for admin/privileged roles.
- **Password reset**: single-use hashed token (`password_reset_tokens`), short TTL, invalidated on use.

## 2. Authorization (RBAC + permission-based)

Two layers, checked in order by guards:

1. **RBAC** — user → roles (`user_roles`), optionally department-scoped.
2. **Permission-based** — roles → fine-grained permissions (`resource:action`, e.g. `employees:update`, `payroll:approve`). Routes are protected by the **required permission**, not the role name, so new roles never require code changes.

```ts
@RequirePermissions('employees:update')
@Patch(':id')
update(...) {}
```

Data-scoping: a Department Manager's queries are automatically filtered to `department_id ∈ their scope` via a request-scoped `scope` object injected by a guard/interceptor. Field-level visibility (from RBAC + custom-field `is_visible`) is applied in the serialization layer.

## 3. Security controls → where they live

| Requirement | Implementation |
|---|---|
| JWT auth + refresh | above; `@nestjs/jwt`, rotation table |
| RBAC + permission auth | `RolesGuard` + `PermissionsGuard` + `@RequirePermissions()` |
| Password hashing | **Argon2id** (fallback bcrypt) with per-hash salt |
| Secure sessions | httpOnly+Secure+SameSite cookies; refresh rotation; idle+absolute timeout |
| CSRF protection | double-submit token for cookie-based routes; SameSite=Strict |
| Rate limiting | `@nestjs/throttler` global + strict on `/auth/*` (per-IP + per-account) |
| Input validation | `class-validator` DTOs + Zod at the edge; whitelist + forbid unknown props |
| SQL injection | parameterized queries only (Prisma/ORM); no string-built SQL |
| XSS | output encoding, `helmet` CSP, sanitize rich text, escape on render |
| CORS | strict allowlist of admin origins; credentials true; no `*` |
| Security headers | `helmet` (CSP, HSTS, X-Frame-Options DENY, noSniff, Referrer-Policy) |
| Secrets | env via `.env` (never committed) → **AWS Secrets Manager** in prod; `ConfigModule` schema-validated |
| API validation | every endpoint has request + response DTOs |
| Audit logs | `audit_logs` written by an interceptor on every mutation |
| Activity logs | `activity_logs` feed for dashboard |
| Soft deletes | `deleted_at`; global query filter excludes deleted |
| Encryption at rest | AES-256 (KMS/pgcrypto) for `bank_account_enc`, `tax_id_enc`, encrypted custom fields; DB volume + S3 SSE |
| Secure file upload | MIME allowlist + magic-byte check + size cap + AV scan flag + random storage key + no direct exec path |
| API versioning | URI prefix `/api/v1` (NestJS versioning) |
| Centralized errors | global `AllExceptionsFilter` → uniform `{error, code, requestId}` |
| Request logging | `pino` with per-request `request_id` correlated to audit rows |

## 4. Transport & network

TLS 1.3 everywhere (ACM); DB and API in private subnets; WAF in front; least-privilege IAM per service. Aligns with the AWS blueprint from the prior deliverable.

## 5. Threat-model quick wins

- Enumeration: generic auth errors ("invalid credentials"), UUID PKs, rate-limited endpoints.
- Brute force: `failed_attempts` + `locked_until` backoff.
- Token theft: rotation + family revocation + short access TTL.
- Privilege escalation: permission checks server-side on every route; never trust client-sent role/permission.
- Mass assignment: DTO whitelisting; `custom_fields` validated against definitions, unknown keys rejected.
