# Workforce Admin — Web (React + Vite)

Production-quality admin dashboard for the Workforce Management System. Runs entirely on **mock data** today; wired so the real NestJS API drops in without refactoring.

## Run

```bash
npm install        # from web-app/apps/web (or `npm install` at the monorepo root)
npm run dev        # http://localhost:5173  → login is pre-filled, click "Sign in"
npm run build      # type-check + production build
```

## Stack

React 18 · Vite · TypeScript · Tailwind (class-based dark mode, CSS-variable tokens) · React Router · Recharts · lucide-react. **No component library dependency** — the UI kit is in-house (`src/components/ui`).

## Architecture

```
src/
├── app/            App router, providers, ProtectedRoute
├── config/         nav.ts (sidebar + command palette source of truth)
├── lib/            types.ts (domain contract), format.ts, utils.ts
├── store/          theme · auth (permissions) · toast  (React Context)
├── hooks/          useQuery · useDebouncedValue · useMediaQuery
├── services/       ← the API seam
│   ├── client.ts   USE_MOCKS flag, mockResult(), http(), paginate()
│   ├── index.ts    one service object per module (Promise-based)
│   └── mock/data.ts deterministic seeded dataset
├── components/
│   ├── ui/         Button Card Badge Avatar Input Switch Modal Dropdown Tabs Misc
│   ├── tables/     DataTable (sort · paginate · states)
│   ├── charts/     Recharts wrappers + StatCard (theme-aware)
│   ├── forms/      DynamicCustomField (renders any admin-defined field)
│   ├── feedback/   Skeleton · EmptyState · ErrorState · TableSkeleton
│   ├── PageHeader · FilterBar · StatusBadge
├── layouts/        AdminLayout · Sidebar · Topbar · CommandPalette (⌘K)
└── features/       one folder per module (page components)
```

## Connecting the real API (later)

1. In `services/client.ts`, set `USE_MOCKS = false` and finish `http()` (base URL, `Authorization` bearer, refresh-on-401, `X-Request-Id`).
2. In `services/index.ts`, replace each `mockResult(...)` body with the matching `http('/employees', …)` call — **the function signatures and return types already match `lib/types.ts`, so pages don't change.**
3. Delete `services/mock/`.

Every page consumes data through `useQuery(() => someService.method())`, so swapping the service body is the only change.

## Design system

- **Tokens**: HSL CSS variables in `styles/index.css`; `:root` (light) + `.dark` overrides. Tailwind maps `bg-surface`, `text-foreground`, `text-primary`, etc. to them — components never hard-code colors, so dark mode is automatic.
- **States**: every list handles loading (skeletons), empty, and error+retry.
- **Responsive**: sidebar collapses to a drawer < 1024px; tables scroll horizontally; grids stack.
- **A11y**: focus-visible rings, ARIA on dialogs/switches, `prefers-reduced-motion` respected.
- **Permissions**: `usePermission('resource:action')` hides controls the role can't use (server still enforces).

## Modules (pages)

Dashboard · Employees (+ dynamic custom fields) · Departments · Roles & Permissions · Tasks (board + list) · Attendance · Leave · Performance · Analytics · Reports · Notifications · Audit Logs · Custom Fields (admin manager) · Organization · Settings · Profile.
# HRMS
