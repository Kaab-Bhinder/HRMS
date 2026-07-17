# Page-building contract (READ FIRST, follow EXACTLY)

You are building ONE or more page components for an existing React 18 + Vite + TS + Tailwind admin app. The design system, UI kit, services, and two reference pages already exist. **Do not create new dependencies. Do not edit shared files. Only create the page file(s) you are assigned.** Mirror the established patterns precisely.

**Canonical reference — read these before writing:**
- `src/features/employees/EmployeesPage.tsx` (list page pattern: PageHeader + FilterBar + DataTable + modals + permissions)
- `src/features/dashboard/DashboardPage.tsx` (widget/chart/card pattern)

## Rules
1. Each page is `export default function XxxPage()` in its assigned path.
2. Use **relative imports** based on file location `src/features/<name>/File.tsx` → shared code is at `../../components/...`, `../../lib/...`, `../../hooks/...`, `../../services`, `../../store/...`.
3. Use only the components/services/types listed below. If you need list data, call the service; if a service is missing for your page, define a small local `const MOCK = [...]` inside the page (typed) — do NOT add to shared files.
4. Every data view must handle loading (via DataTable's `loading` or `<Skeleton/>`), empty, and error states.
5. Fully responsive (grid → stack on mobile), dark-mode safe (only use theme tokens/classes below — never hard-coded hex except through the chart components).
6. Keep copy realistic (bank HR context; employees are Pakistani names, currency PKR/USD).
7. No `any` where avoidable; import types from `../../lib/types`.

## Theme classes (use these, they adapt to dark mode automatically)
Backgrounds: `bg-background bg-surface bg-surface-2 bg-muted`. Text: `text-foreground text-muted-foreground text-primary`. Borders: `border-border`. Accents: `bg-primary/10 text-primary`, `text-success text-warning text-danger text-info text-accent`. Never use `bg-white`, `bg-gray-*`, `text-black`, `text-slate-*` etc.

## UI kit (exact signatures)
```ts
// ../../components/ui/Button
<Button variant?="primary|secondary|outline|ghost|danger|subtle" size?="sm|md|lg|icon" loading?={bool} />
// ../../components/ui/Card
<Card className?/>  <CardHeader title description? action? />  <CardBody className?/>
// ../../components/ui/Badge
<Badge tone?="neutral|primary|success|warning|danger|info|accent" dot?={bool}>text</Badge>
// ../../components/ui/Avatar
<Avatar name={string} src?={string} size?="xs|sm|md|lg" />
<AvatarGroup people={{name,avatarUrl?}[]} max?={number} size?="xs|sm|md|lg" />
// ../../components/ui/Input
<Input leftIcon? invalid? ...inputProps />  <Textarea />  <Select>{options}</Select>  <Label required?>text</Label>
// ../../components/ui/Switch
<Switch checked onChange={(v:boolean)=>void} label? />   <Checkbox checked onChange={(v:boolean)=>void} />
// ../../components/ui/Modal
<Modal open onClose title description? size?="sm|md|lg|xl" footer?={node}>children</Modal>
<ConfirmDialog open onClose onConfirm title message confirmLabel? danger? loading? />
// ../../components/ui/Dropdown
<Dropdown trigger={node} align?="left|right" width?="w-48"> <DropdownItem icon? danger? onClick>..</DropdownItem> <DropdownSeparator/> <DropdownLabel/> </Dropdown>
// ../../components/ui/Tabs
<Tabs tabs={{value,label,count?}[]} value onChange={(v)=>void} />
// ../../components/ui/Misc
<Progress value={0-100} tone?="primary|success|warning|danger" />  <Tooltip content>child</Tooltip>  <Divider/>  <Spinner/>  <Kbd>K</Kbd>
// ../../components/PageHeader
<PageHeader title description? actions?={node} />
// ../../components/FilterBar
<FilterBar search onSearch={(v)=>void} searchPlaceholder? filters={{key,placeholder,value,options:{value,label}[]}[]} onFilterChange={(k,v)=>void} onClear? right?={node} />
// ../../components/StatusBadge  (knows employee/attendance/leave/task/priority/perf statuses)
<StatusBadge value={string} dot? />
// ../../components/tables/DataTable
<DataTable columns={Column<T>[]} rows={T[]|undefined} loading? error? onRetry? rowKey={(r)=>string}
  onRowClick? sort={{key,order}} onSortChange={(key)=>void}
  empty={{title,description?,action?}} pagination={{page,totalPages,total,limit,onPage}} />
// Column<T> = { key, header, sortable?, align?:'left|right|center', className?, render:(row)=>node }
// ../../components/charts/StatCard
<StatCard label value icon={node} delta? hint? loading? accent?="primary|success|warning|danger|accent|info" />
// ../../components/charts/Charts
<AttendanceAreaChart data={{date,present,absent,late}[]} />
<SimpleBarChart data xKey dataKey color? height? />
<GroupedBarChart data={{week,assigned,completed}[]} />
<DonutChart data={{label,value}[]} height? />
<Sparkline data={number[]} color? />
export const CHART_COLORS: string[]
// ../../components/feedback/States
<Skeleton className/>  <TableSkeleton rows? cols? />  <EmptyState icon? title description? action? />  <ErrorState message? onRetry? />
// ../../components/forms/DynamicCustomField
<DynamicCustomField def={CustomFieldDefinition} value onChange={(key,value)=>void} error? />
validateCustomFields(defs, values): Record<string,string>
```

## Hooks & stores
```ts
import { useQuery } from '../../hooks/useQuery';              // { data, loading, error, refetch }
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useToast } from '../../store/toast';                 // toast.success(t,d?) toast.error(t,d?)
import { useAuth, usePermission } from '../../store/auth';    // useAuth().user, .can(perm); usePermission('x:y'):boolean
import { useTheme } from '../../store/theme';
```

## Services (all return Promises)
```ts
import { departmentsService, rolesService, tasksService, attendanceService, leaveService,
         performanceService, analyticsService, notificationsService, auditService,
         customFieldsService, designationsService } from '../../services';
departmentsService.list(params?) -> Paginated<Department>; .tree() -> Department[]; .create/.update/.remove
rolesService.list() -> Role[]; .permissions() -> Permission[]; .create/.update/.remove
tasksService.list(params?) -> Paginated<Task>; .board() -> Task[]
attendanceService.list(params?) -> Paginated<AttendanceRecord>; .summary() -> {present,late,absent,wfh,onLeave,flagged}
leaveService.list(params?) -> Paginated<LeaveRequest>; .act(id, 'approve'|'reject')
performanceService.reviews(params?) -> Paginated<PerformanceReview>; .goals() -> Goal[]
analyticsService.overview() -> DashboardStats; .activity() -> ActivityItem[]
notificationsService.list() -> AppNotification[]; .markRead(id); .markAllRead()
auditService.list(params?) -> Paginated<AuditLog>
customFieldsService.list(entity='employee') -> CustomFieldDefinition[]; .create/.update/.remove
designationsService.list() -> Designation[]
```
`ListParams = { page?, limit?, search?, sort?, order?:'asc'|'desc', filters?:Record<string,string> }`
Types (`../../lib/types`): Department, Role, Permission, Task, AttendanceRecord, LeaveRequest, PerformanceReview, Goal, AppNotification, AuditLog, CustomFieldDefinition, Designation, Employee, DashboardStats, ActivityItem, Paginated<T>, ListParams.
Format helpers (`../../lib/format`): formatDate, formatDateTime, formatTime, relativeTime, formatNumber, formatCurrency, formatPercent, pluralize.
Icons: `lucide-react`.

Deliver production-quality, polished pages consistent with the reference files.
