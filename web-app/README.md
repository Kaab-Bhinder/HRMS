# Workforce Management System — Web Admin Application

Enterprise admin panel for administrators & managers. **React (Vite) + NestJS (Node) + PostgreSQL**, monorepo.

> This commit delivers the **architecture & foundations** (deliverables 1–13): complete database schema, custom-fields design, auth/security architecture, backend & frontend architecture, dashboard UX, folder structure, API map, and assumptions. Module implementation follows the build order in `docs/07`.

## Repository layout

```
web-app/
├── db/
│   ├── schema.sql            # ⭐ authoritative PostgreSQL schema (all modules + custom fields)
│   └── migrations/           # generated migrations
├── docs/                     # ⭐ design & architecture (read in order 01 → 07)
│   ├── 01-requirements-and-modules.md
│   ├── 02-database-design.md
│   ├── 03-auth-and-security.md
│   ├── 04-backend-architecture.md
│   ├── 05-frontend-and-dashboard.md
│   ├── 06-api-reference.md
│   └── 07-assumptions-and-scalability.md
├── apps/
│   ├── api/                  # NestJS backend (modular: modules/, common/, config/)
│   └── web/                  # React + Vite admin SPA (feature-based)
├── packages/
│   └── shared/               # shared TS types, constants, Zod validation
├── docker-compose.yml        # local Postgres + Redis
├── .env.example
└── package.json              # npm workspaces
```

## Where to start reading

1. `docs/01` — what we're building and why it matches the Modules Document.
2. `db/schema.sql` + `docs/02` — the database (the flagship deliverable) and custom fields.
3. `docs/03`–`06` — security, backend, frontend/dashboard, APIs.
4. `docs/07` — assumptions to confirm + scalability plan.

## Quick start (once modules are implemented)

```bash
cp .env.example .env
docker compose up -d            # Postgres + Redis
psql "$DATABASE_URL" -f db/schema.sql   # or: npm --workspace apps/api run prisma:migrate
npm install
npm --workspace apps/api run dev        # http://localhost:4000/api/v1
npm --workspace apps/web run dev        # http://localhost:5173
```

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 · Vite · TS · TanStack Query/Table · Tailwind + shadcn/ui · Recharts |
| Backend | NestJS · Prisma · Zod/class-validator · BullMQ (Redis) · pino |
| Database | PostgreSQL 15+ (pgcrypto, citext, pg_trgm) |
| Auth | JWT access + rotating refresh · Argon2id · RBAC + permissions · MFA |

See `docs/07` for the assumptions behind these choices.
