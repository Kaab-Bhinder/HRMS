import { Mail, Phone, Building2, Briefcase, MapPin, CalendarDays, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { useQuery } from '../../hooks/useQuery';
import { customFieldsService } from '../../services';
import { formatDate } from '../../lib/format';
import type { Employee } from '../../lib/types';

export function EmployeeDetailModal({ open, onClose, employee, onEdit, onDelete }: { open: boolean; onClose: () => void; employee: Employee | null; onEdit: () => void; onDelete?: () => void }) {
  const { data: cfDefs } = useQuery(() => customFieldsService.list('employee'), []);
  if (!employee) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Employee Profile"
      size="lg"
      footer={
        <div className="flex w-full items-center">
          {onDelete && (
            <Button variant="ghost" onClick={onDelete} className="text-danger hover:text-danger">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={onEdit}>Edit</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={employee.fullName} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-semibold text-foreground">{employee.fullName}</h3>
              <StatusBadge value={employee.status} />
            </div>
            <p className="text-sm text-muted-foreground">{employee.designationName} · {employee.employeeCode}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
          <Detail icon={<Mail />} label="Work Email" value={employee.workEmail} />
          <Detail icon={<Phone />} label="Phone" value={employee.phone} />
          <Detail icon={<Building2 />} label="Department" value={employee.departmentName} />
          <Detail icon={<Briefcase />} label="Employment" value={employee.employmentType.replace('_', ' ')} />
          <Detail icon={<MapPin />} label="Location" value={employee.locationName} />
          <Detail icon={<CalendarDays />} label="Joined" value={formatDate(employee.dateOfJoining)} />
        </div>

        {cfDefs && cfDefs.length > 0 && (
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custom Fields</h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {cfDefs.filter((d) => d.isVisible).map((d) => {
                const v = employee.customFields[d.fieldKey];
                const shown = d.isEncrypted && v ? '••••••••' : Array.isArray(v) ? v.join(', ') : (v as string) || '—';
                return (
                  <div key={d.id}>
                    <p className="text-xs text-muted-foreground">{d.label}{d.isEncrypted && ' 🔒'}</p>
                    <p className="text-sm font-medium text-foreground">{shown || '—'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium capitalize text-foreground">{value || '—'}</p>
      </div>
    </div>
  );
}
