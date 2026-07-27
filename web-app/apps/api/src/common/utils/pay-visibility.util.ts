import { AuthUser } from '../decorators/current-user.decorator';

/**
 * Salary amounts (basicSalary, payPerHour) are the most sensitive fields in the
 * system, and `employees:read` is a broad permission (department heads hold it).
 * Visibility of pay therefore rides on `payroll:read`, not on employee access:
 * whoever may open the payroll register may see amounts; everyone else gets the
 * employee record without them. The same test gates *writing* pay fields, so a
 * role that can edit employees but not payroll cannot set salaries either.
 */
export function canSeePay(user: AuthUser): boolean {
  return user.isSuperAdmin || user.permissions.includes('*') || user.permissions.includes('payroll:read');
}

/** Strips pay fields from an inbound create/update payload in place. */
export function stripPayFields<T extends { compensationType?: unknown; basicSalary?: unknown; payPerHour?: unknown }>(dto: T): T {
  delete dto.compensationType;
  delete dto.basicSalary;
  delete dto.payPerHour;
  return dto;
}
