import { useState } from 'react';
import { Download, Loader2, Paperclip, X } from 'lucide-react';
import type { CustomFieldDefinition, FileAttachment } from '../../lib/types';
import { Input, Textarea, Select, Label } from '../ui/Input';
import { Switch, Checkbox } from '../ui/Switch';
import { filesService, organizationService } from '../../services';
import { useQuery } from '../../hooks/useQuery';

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
      case 'select': {
        // A stored value whose option was later removed has no matching
        // <option>, so the browser would fall back to the placeholder — the
        // field would look empty and saving would quietly wipe it. Surface it
        // instead, labelled so the admin knows to pick a current option.
        const known = def.options?.some((o) => o.value === str);
        return (
          <Select id={id} value={str} onChange={(e) => set(e.target.value)} invalid={!!error}>
            <option value="">Select…</option>
            {str && !known && <option value={str}>{str} — no longer an option</option>}
            {def.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        );
      }
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
        return <FileField id={id} value={value as FileRef | null} onChange={set} invalid={!!error} />;
      case 'json':
        return (
          <Textarea
            id={id}
            rows={4}
            className="font-mono text-xs"
            placeholder={def.placeholder ?? '{ "key": "value" }'}
            value={typeof value === 'string' ? value : value != null ? JSON.stringify(value, null, 2) : ''}
            onChange={(e) => set(e.target.value)}
          />
        );
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

/** What a `file` custom field stores: a reference to an uploaded FileObject,
 *  never the bytes and never a bare filename. */
export interface FileRef {
  fileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

function prettySize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Real file upload for a `file` custom field: the chosen file is uploaded
 * immediately (so the bytes land in the app's storage like every other
 * document) and only the returned reference is kept in the form value. An
 * already-stored file shows as a chip with download + remove.
 *
 * Files are owned by the ORGANIZATION rather than the edited record, because
 * a custom field is often filled while creating that record — it has no id yet.
 */
function FileField({ id, value, onChange, invalid }: {
  id: string;
  value: FileRef | null;
  onChange: (v: FileRef | null) => void;
  invalid?: boolean;
}) {
  // Files are owned by the organization (see doc above), so the uploader needs
  // the org id — CurrentUser doesn't carry it.
  const { data: org } = useQuery(() => organizationService.current(), []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file || !org?.id) return;
    setBusy(true);
    setErr(null);
    try {
      const att = await filesService.upload('organization', org.id, file);
      onChange({ fileId: att.id, fileName: att.fileName, mimeType: att.mimeType, sizeBytes: att.sizeBytes });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (value?.fileId) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-input bg-surface px-3 py-2">
        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{value.fileName}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{prettySize(value.sizeBytes)}</span>
        <button
          type="button"
          title="Download"
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={() => filesService.download({ id: value.fileId, fileName: value.fileName, mimeType: value.mimeType, sizeBytes: value.sizeBytes, url: '', createdAt: '' } as FileAttachment)}
        >
          <Download className="h-4 w-4" />
        </button>
        <button type="button" title="Remove" className="rounded p-1 text-muted-foreground hover:text-danger" onClick={() => onChange(null)}>
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="file"
          disabled={busy}
          className="file:mr-3 file:rounded file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs"
          onChange={(e) => void pick(e.target.files?.[0])}
          invalid={invalid || !!err}
        />
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {err && <p className="mt-1 text-xs text-danger">{err}</p>}
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
    if (def.dataType === 'file' && !(v && typeof v === 'object' && 'fileId' in v)) {
      errors[def.fieldKey] = `${def.label}: upload a file`;
      continue;
    }
    if (def.dataType === 'json' && typeof v === 'string') {
      try {
        JSON.parse(v);
      } catch {
        errors[def.fieldKey] = `${def.label} must be valid JSON`;
        continue;
      }
    }
    if (def.regexPattern && typeof v === 'string' && !new RegExp(def.regexPattern).test(v)) errors[def.fieldKey] = `${def.label} format is invalid`;
    if ((def.dataType === 'number' || def.dataType === 'decimal') && typeof v === 'string') {
      const n = Number(v);
      if (def.minValue != null && n < def.minValue) errors[def.fieldKey] = `Minimum is ${def.minValue}`;
      if (def.maxValue != null && n > def.maxValue) errors[def.fieldKey] = `Maximum is ${def.maxValue}`;
    }
  }
  return errors;
}
