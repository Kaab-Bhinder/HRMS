import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { Spinner } from '../components/ui/Misc';

// Login is eager (first paint); the authenticated app is code-split per route
// so heavy deps (charts) load only on the pages that use them.
import LoginPage from '../features/auth/LoginPage';

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const EmployeesPage = lazy(() => import('../features/employees/EmployeesPage'));
const DepartmentsPage = lazy(() => import('../features/departments/DepartmentsPage'));
const DesignationsPage = lazy(() => import('../features/designations/DesignationsPage'));
const ClientsPage = lazy(() => import('../features/clients/ClientsPage'));
const AssetsPage = lazy(() => import('../features/assets/AssetsPage'));
const TravelPage = lazy(() => import('../features/travel/TravelPage'));
const SetPasswordPage = lazy(() => import('../features/auth/SetPasswordPage'));
const RolesPage = lazy(() => import('../features/roles/RolesPage'));
const UsersPage = lazy(() => import('../features/users/UsersPage'));
const TasksPage = lazy(() => import('../features/tasks/TasksPage'));
const AttendancePage = lazy(() => import('../features/attendance/AttendancePage'));
const AttendanceEmployeePage = lazy(() => import('../features/attendance/AttendanceEmployeePage'));
const AttendanceSettingsPage = lazy(() => import('../features/attendance/AttendanceSettingsPage'));
const PayrollPage = lazy(() => import('../features/payroll/PayrollPage'));
const LeavePage = lazy(() => import('../features/leave/LeavePage'));
const PerformancePage = lazy(() => import('../features/performance/PerformancePage'));
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage'));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));
const ReportingPage = lazy(() => import('../features/reporting/ReportsPage'));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'));
const AuditLogsPage = lazy(() => import('../features/audit-logs/AuditLogsPage'));
const CustomFieldsPage = lazy(() => import('../features/custom-fields/CustomFieldsPage'));
const OrganizationPage = lazy(() => import('../features/organization/OrganizationPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('../features/NotFoundPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Public by design: the person has no password yet, so they cannot be
          asked to sign in before setting one. */}
      <Route path="/set-password" element={<Suspended><SetPasswordPage /></Suspended>} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={<AdminLayout />}
        >
          <Route path="/" element={<Suspended><DashboardPage /></Suspended>} />
          <Route path="/employees" element={<Suspended><EmployeesPage /></Suspended>} />
          <Route path="/departments" element={<Suspended><DepartmentsPage /></Suspended>} />
          <Route path="/designations" element={<Suspended><DesignationsPage /></Suspended>} />
          <Route path="/clients" element={<Suspended><ClientsPage /></Suspended>} />
          <Route path="/assets" element={<Suspended><AssetsPage /></Suspended>} />
          <Route path="/travel" element={<Suspended><TravelPage /></Suspended>} />
          <Route path="/roles" element={<Suspended><RolesPage /></Suspended>} />
          <Route path="/users" element={<Suspended><UsersPage /></Suspended>} />
          <Route path="/tasks" element={<Suspended><TasksPage /></Suspended>} />
          <Route path="/attendance" element={<Suspended><AttendancePage /></Suspended>} />
          <Route path="/attendance/employee/:id" element={<Suspended><AttendanceEmployeePage /></Suspended>} />
          <Route path="/attendance/settings" element={<Suspended><AttendanceSettingsPage /></Suspended>} />
          <Route path="/payroll" element={<Suspended><PayrollPage /></Suspended>} />
          <Route path="/leave" element={<Suspended><LeavePage /></Suspended>} />
          <Route path="/performance" element={<Suspended><PerformancePage /></Suspended>} />
          <Route path="/analytics" element={<Suspended><AnalyticsPage /></Suspended>} />
          <Route path="/reports" element={<Suspended><ReportsPage /></Suspended>} />
          <Route path="/reporting" element={<Suspended><ReportingPage /></Suspended>} />
          <Route path="/notifications" element={<Suspended><NotificationsPage /></Suspended>} />
          <Route path="/audit-logs" element={<Suspended><AuditLogsPage /></Suspended>} />
          <Route path="/custom-fields" element={<Suspended><CustomFieldsPage /></Suspended>} />
          <Route path="/organization" element={<Suspended><OrganizationPage /></Suspended>} />
          <Route path="/settings" element={<Suspended><SettingsPage /></Suspended>} />
          <Route path="/profile" element={<Suspended><ProfilePage /></Suspended>} />
        </Route>
      </Route>
      <Route path="/404" element={<Suspended><NotFoundPage /></Suspended>} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function Suspended({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}
