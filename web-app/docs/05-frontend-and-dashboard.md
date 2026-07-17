# 05 · Frontend Architecture & Admin Dashboard UI/UX (React)

**Stack decision:** **React 18 + Vite + TypeScript**. An admin panel is auth-gated with no SEO need, so a Vite SPA is simpler and faster to build than Next.js. (Earlier blueprint mentioned Next.js for the public-facing side; this internal admin app is better as an SPA — see assumption A1.)

**Libraries:** React Router · TanStack Query (server state) · Zustand (light UI state) · React Hook Form + Zod (forms/validation, shared with backend) · TanStack Table (data grids) · Recharts (charts) · Tailwind CSS + shadcn/ui + Radix (accessible primitives) · lucide-react (icons).

---

## 1. Folder structure (`apps/web/src`)

```
src/
├── app/                 # router, providers, error boundary, protected routes
├── config/              # env, nav config, permission map
├── components/
│   ├── ui/              # shadcn primitives (Button, Dialog, Table, Toast…)
│   ├── charts/          # KpiCard, AreaChart, BarChart, Donut, Sparkline
│   ├── tables/          # DataTable (sort/filter/paginate/column-visibility)
│   ├── forms/           # FormField, DynamicCustomField renderer
│   └── feedback/        # Skeletons, EmptyState, ErrorState, Spinner
├── layouts/             # AdminLayout (sidebar+topbar), AuthLayout
├── features/            # one folder per module (see below)
│   └── <module>/        # components/, api.ts, hooks.ts, schema.ts, routes.tsx
├── hooks/               # useAuth, usePermission, useDebounce, useTheme, usePagination
├── services/            # axios instance (interceptors: token, refresh, request-id)
├── store/               # zustand: auth, ui (theme, sidebar), notifications
├── lib/                 # formatters, date, rbac helpers
└── styles/              # tailwind, tokens, dark-mode
```

**Feature-based, not type-based:** everything for "employees" lives in `features/employees/`, so modules are added/removed as units — matching the backend module boundaries.

## 2. Reusable building blocks (asked for)

- **Reusable components:** `DataTable`, `KpiCard`, chart wrappers, `FormField`, `DynamicCustomField`, `PageHeader`, `ConfirmDialog`, `FilterBar`.
- **Reusable hooks:** `useAuth`, `usePermission('employees:update')` (drives conditional rendering), `usePaginatedQuery`, `useDebouncedSearch`, `useTheme`.
- **Reusable services:** typed API client per feature (`features/x/api.ts`) built on one axios instance that injects the access token, auto-refreshes on 401, and attaches `request_id`.
- **Permission-aware UI:** buttons/menus/routes render only if `usePermission()` passes — the server still enforces, this is UX only.

## 3. Dynamic custom fields on the frontend

`DynamicCustomField` reads `custom_field_definitions` from the API and renders the correct control per `data_type` (text/number/date/select/multiselect/file/boolean…), wires Zod validation from the definition (required/regex/min/max/options), respects `display_order` and `is_visible`. **Admins add a field → it appears in the employee form and filters with zero front-end code changes.** A "Custom Fields" settings screen manages the definitions (drag to reorder, toggle visibility/searchable/required).

## 4. Admin Dashboard — layout & content

```
┌───────────────────────────────────────────────────────────────┐
│ Topbar: logo · global search (⌘K) · quick-add · notifications · │
│         theme toggle · profile menu                             │
├──────────┬────────────────────────────────────────────────────┤
│ Sidebar  │  Page: Dashboard Overview                           │
│ (collaps)│  ┌ KPI row: Headcount · Present Today · On Leave ·   │
│  Dash    │  │          Open Tasks · Attrition% ┐               │
│  Employees│  ├ Attendance trend (area) │ Dept headcount (bar) ┤ │
│  Depts   │  ├ Task status (donut) │ Team productivity (line)  ┤ │
│  Roles   │  ├ Upcoming deadlines · Calendar widget            ┤ │
│  Tasks   │  ├ Recent activity feed · Pending approvals        ┤ │
│  Attend. │  └ Quick actions (add employee, run report…)       ┘ │
│  Perf.   │                                                     │
│  Reports │                                                     │
│  Audit   │                                                     │
│  Settings│                                                     │
└──────────┴────────────────────────────────────────────────────┘
```

**Widgets (all from your list):** KPI cards, employee/task/attendance statistics, performance graphs, department analytics, team productivity, recent activities, notifications, calendar, upcoming deadlines, quick actions.

## 5. UX states (required, standardized)

Every data view implements the four states via shared components:
- **Loading** → skeletons (never spinners for content areas).
- **Empty** → `EmptyState` with icon + CTA (e.g., "No employees yet — Import CSV").
- **Error** → `ErrorState` with retry + `request_id` for support.
- **Success** → content.

## 6. Design system

- **Responsive:** sidebar collapses to icons < 1024px, drawer on mobile; tables become card lists on small screens.
- **Dark mode:** token-based (`data-theme`), toggle persisted; charts and semantic colors defined for both themes.
- **Accessibility:** Radix primitives (focus traps, ARIA), visible focus rings, `prefers-reduced-motion`.
- **Design language:** modern SaaS — neutral slate surface, single brand accent, generous spacing, tabular-nums for figures, subtle motion. (Reuse the navy/gold identity from the client blueprint if you want brand continuity.)

## 7. Global search (⌘K)

Command palette hitting a `/search` endpoint that queries indexed entities (employees via trigram, tasks, departments) + searchable custom fields; keyboard-first, grouped results, deep-links to records.
