import { useQuery } from './useQuery';
import { employeesService, type EmployeeOption } from '../services';

/**
 * The roster behind every employee picker.
 *
 * Each screen used to fetch this itself with `list({ limit: 500 })`, which the
 * API rejects — its page limit is 100 — so the dropdowns silently rendered
 * empty. One hook against the dedicated options endpoint keeps the seven call
 * sites honest and returns the whole roster rather than the first page of it.
 */
export function useEmployeeOptions(opts?: { includeInactive?: boolean }) {
  const includeInactive = opts?.includeInactive ?? false;
  const { data, loading, error } = useQuery(
    () => employeesService.options({ includeInactive }),
    [includeInactive],
  );
  return { employees: (data ?? []) as EmployeeOption[], loading, error };
}
