import {
  LayoutDashboard, Users, UserCog, Building2, BriefcaseBusiness, ShieldCheck, ListChecks, CalendarClock,
  CalendarDays, TrendingUp, BarChart3, FileText, ClipboardList, Bell, ScrollText, Settings,
  Building, SlidersHorizontal, Wallet, MapPinned, Handshake, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  badge?: 'notifications';
}
export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    title: 'People',
    items: [
      { label: 'Employees', to: '/employees', icon: Users, permission: 'employees:read' },
      { label: 'Departments', to: '/departments', icon: Building2, permission: 'departments:read' },
      { label: 'Designations', to: '/designations', icon: BriefcaseBusiness, permission: 'designations:read' },
      { label: 'Roles & Permissions', to: '/roles', icon: ShieldCheck, permission: 'roles:read' },
      { label: 'Users', to: '/users', icon: UserCog, permission: 'users:read' },
      { label: 'Clients', to: '/clients', icon: Handshake, permission: 'clients:read' },
    ],
  },
  {
    title: 'Work',
    items: [
      { label: 'Tasks', to: '/tasks', icon: ListChecks, permission: 'tasks:read' },
      { label: 'Attendance', to: '/attendance', icon: CalendarClock, permission: 'attendance:read' },
      { label: 'Payroll', to: '/payroll', icon: Wallet, permission: 'payroll:read' },
      { label: 'Leave', to: '/leave', icon: CalendarDays, permission: 'leave:read' },
      { label: 'Performance', to: '/performance', icon: TrendingUp, permission: 'performance:read' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
      { label: 'Reports', to: '/reporting', icon: ClipboardList },
      { label: 'Report Builder', to: '/reports', icon: FileText, permission: 'reports:read' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Notifications', to: '/notifications', icon: Bell, badge: 'notifications' },
      { label: 'Audit Logs', to: '/audit-logs', icon: ScrollText, permission: 'audit:read' },
      { label: 'Custom Fields', to: '/custom-fields', icon: SlidersHorizontal, permission: 'custom_fields:read' },
      { label: 'Attendance Settings', to: '/attendance/settings', icon: MapPinned, permission: 'attendance:update' },
      { label: 'Organization', to: '/organization', icon: Building },
      { label: 'Settings', to: '/settings', icon: Settings, permission: 'settings:read' },
    ],
  },
];

/** Flat list for the command palette / global search. */
export const NAV_FLAT: NavItem[] = NAV.flatMap((s) => s.items);
