import type { CustomFieldDefinition } from '../../lib/types';
import { Input, Textarea, Select, Label } from '../ui/Input';
import { Switch, Checkbox } from '../ui/Switch';

/**
 * Renders the correct control for an admin-defined custom field, driven entirely
 * by its definition. Add a field in the Custom Fields screen → it appears here
 * with zero code changes. Validation attrs (required/min/max/pattern) are wired
 * from the definition so the same rules the API enforces apply in the browser.
 */
export function DynamicCustomField({
  def,
  value,
  onChange,
  error,
}: {
  def: CustomFieldDefinition;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  error?: string;
}) {
  if (!def.isVisible) return null;
  const id = `cf-${def.fieldKey}`;
  const set = (v: unknown) => onChange(def.fieldKey, v);
  const str = (value ?? '') as string;

  const control = () => {
    switch (def.dataType) {
      case 'textarea':
        return <Textarea id={id} value={str} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} />;
      case 'number':
      case 'decimal':
        return <Input id={id} type="number" value={str} placeholder={def.placeholder} min={def.minValue} max={def.maxValue} step={def.dataType === 'decimal' ? '0.01' : '1'} onChange={(e) => set(e.target.value)} invalid={!!error} />;
      case 'date':
        return <Input id={id} type="date" value={str} onChange={(e) => set(e.target.value)} invalid={!!error} />;
      case 'datetime':
        return <Input id={id} type="datetime-local" value={str} onChange={(e) => set(e.target.value)} invalid={!!error} />;
      case 'email':
        return <Input id={id} type="email" value={str} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} invalid={!!error} />;
      case 'phone':
        return <Input id={id} type="tel" value={str} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} invalid={!!error} />;
      case 'url':
        return <Input id={id} type="url" value={str} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} invalid={!!error} />;
      case 'boolean':
        return (
          <div className="flex h-9 items-center">
            <Switch checked={!!value} onChange={set} label={def.label} />
          </div>
        );
      case 'select':
        return (
          <Select id={id} value={str} onChange={(e) => set(e.target.value)} invalid={!!error}>
            <option value="">Select…</option>
            {def.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        );
      case 'multiselect': {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="flex flex-wrap gap-2 rounded-md border border-input bg-surface p-2.5">
            {def.options?.map((o) => {
              const on = arr.includes(o.value);
              return (
                <label key={o.value} className="inline-flex cursor-pointer items-center gap-1.5 text-sm">
                  <Checkbox checked={on} onChange={(v) => set(v ? [...arr, o.value] : arr.filter((x) => x !== o.value))} />
                  {o.label}
                </label>
              );
            })}
          </div>
        );
      }
      case 'file':
        return <Input id={id} type="file" className="file:mr-3 file:rounded file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs" onChange={(e) => set(e.target.files?.[0]?.name ?? '')} />;
      default:
        return <Input id={id} value={str} placeholder={def.placeholder} maxLength={def.maxLength} onChange={(e) => set(e.target.value)} invalid={!!error} />;
    }
  };

  return (
    <div>
      <Label htmlFor={id} required={def.isRequired}>
        {def.label}
        {def.isEncrypted && <span className="ml-1.5 text-xs font-normal text-muted-foreground">🔒 encrypted</span>}
      </Label>
      {control()}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : def.helpText ? <p className="mt-1 text-xs text-muted-foreground">{def.helpText}</p> : null}
    </div>
  );
}

/** Client-side validation mirroring the API rules. Returns key→error map. */
export function validateCustomFields(defs: CustomFieldDefinition[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const def of defs) {
    const v = values[def.fieldKey];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (def.isRequired && empty) {
      errors[def.fieldKey] = `${def.label} is required`;
      continue;
    }
    if (empty) continue;
    if (def.regexPattern && typeof v === 'string' && !new RegExp(def.regexPattern).test(v)) errors[def.fieldKey] = `${def.label} format is invalid`;
    if ((def.dataType === 'number' || def.dataType === 'decimal') && typeof v === 'string') {
      const n = Number(v);
      if (def.minValue != null && n < def.minValue) errors[def.fieldKey] = `Minimum is ${def.minValue}`;
      if (def.maxValue != null && n > def.maxValue) errors[def.fieldKey] = `Maximum is ${def.maxValue}`;
    }
  }
  return errors;
}
