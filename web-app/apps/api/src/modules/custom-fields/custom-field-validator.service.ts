import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomFieldDefinition, CustomFieldEntity } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

interface Option {
  value: string;
  label: string;
}

/**
 * Validates & normalizes an entity's `custom_fields` JSONB payload against the
 * admin-defined `custom_field_definitions`. This is the server-side counterpart
 * to the frontend DynamicCustomField — the API is the source of truth.
 * Unknown keys are dropped (mass-assignment safety); required/type/range/regex/
 * option-membership/uniqueness are enforced.
 */
@Injectable()
export class CustomFieldValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    orgId: string,
    entity: CustomFieldEntity,
    values: Record<string, unknown> | undefined,
    opts: { entityId?: string; skipRequired?: boolean; previous?: Record<string, unknown> } = {},
  ): Promise<Record<string, unknown>> {
    const defs = await this.prisma.customFieldDefinition.findMany({
      where: { organizationId: orgId, entity, deletedAt: null },
    });
    const input = values ?? {};
    const out: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    for (const def of defs) {
      const raw = input[def.fieldKey];
      const empty = raw === undefined || raw === null || raw === '' || (Array.isArray(raw) && raw.length === 0);

      if (empty) {
        if (def.isRequired && !opts.skipRequired) errors[def.fieldKey] = `${def.label} is required`;
        continue;
      }

      const [value, error] = this.coerce(def, raw);
      if (error) {
        // A definition can change after data is stored — an option removed, a
        // range narrowed, a type tightened. If the offending value is exactly
        // what is already saved, the user is not introducing it; refusing here
        // would make the record permanently uneditable through the UI, with a
        // generic "validation failed" and no way to recover. Keep the stored
        // value and let them edit everything else. Only *new* values must
        // satisfy the current rules.
        const unchanged =
          opts.previous !== undefined &&
          Object.prototype.hasOwnProperty.call(opts.previous, def.fieldKey) &&
          JSON.stringify(opts.previous[def.fieldKey]) === JSON.stringify(raw);
        if (unchanged) {
          out[def.fieldKey] = opts.previous![def.fieldKey];
          continue;
        }
        errors[def.fieldKey] = error;
        continue;
      }
      out[def.fieldKey] = value;
    }

    // Cross-tenant guard for file references: a fileId must belong to THIS
    // organization. Without it, a crafted payload could attach (and later
    // download) another tenant's document through a custom field.
    for (const def of defs) {
      if (def.dataType !== 'file') continue;
      const ref = out[def.fieldKey] as { fileId?: string } | undefined;
      if (!ref?.fileId) continue;
      const file = await this.prisma.fileObject.findFirst({
        where: { id: ref.fileId, organizationId: orgId, deletedAt: null },
        select: { id: true },
      });
      if (!file) errors[def.fieldKey] = `${def.label}: uploaded file not found`;
    }

    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Custom field validation failed', fields: errors });
    }

    // uniqueness (per-key) — checked after shape validation
    for (const def of defs) {
      if (!def.isUnique || out[def.fieldKey] == null) continue;
      if (await this.isDuplicate(orgId, entity, def.fieldKey, out[def.fieldKey], opts.entityId)) {
        throw new BadRequestException({ message: 'Custom field validation failed', fields: { [def.fieldKey]: `${def.label} must be unique` } });
      }
    }

    return out;
  }

  private coerce(def: CustomFieldDefinition, raw: unknown): [unknown, string | null] {
    const label = def.label;
    switch (def.dataType) {
      case 'number':
      case 'decimal': {
        const n = typeof raw === 'number' ? raw : Number(raw);
        if (Number.isNaN(n)) return [null, `${label} must be a number`];
        if (def.minValue != null && n < Number(def.minValue)) return [null, `${label} must be ≥ ${def.minValue}`];
        if (def.maxValue != null && n > Number(def.maxValue)) return [null, `${label} must be ≤ ${def.maxValue}`];
        return [n, null];
      }
      case 'boolean':
        return [Boolean(raw), null];
      case 'email':
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(raw)) ? [String(raw), null] : [null, `${label} must be a valid email`];
      case 'url':
        return /^https?:\/\/.+|^[\w-]+(\.[\w-]+)+.*$/.test(String(raw)) ? [String(raw), null] : [null, `${label} must be a valid URL`];
      case 'date':
      case 'datetime':
        return Number.isNaN(Date.parse(String(raw))) ? [null, `${label} must be a valid date`] : [String(raw), null];
      case 'select': {
        const opts = (def.options as unknown as Option[]) ?? [];
        return opts.some((o) => o.value === String(raw)) ? [String(raw), null] : [null, `${label} has an invalid option`];
      }
      case 'multiselect': {
        const opts = (def.options as unknown as Option[]) ?? [];
        const arr = Array.isArray(raw) ? raw.map(String) : [String(raw)];
        const allowed = new Set(opts.map((o) => o.value));
        return arr.every((v) => allowed.has(v)) ? [arr, null] : [null, `${label} has an invalid option`];
      }
      case 'json': {
        // Accept an object/array as-is, or a JSON string that parses to one —
        // storing unparseable text under a "json" field makes the value
        // unusable to every consumer downstream.
        if (raw && typeof raw === 'object') return [raw, null];
        try {
          return [JSON.parse(String(raw)), null];
        } catch {
          return [null, `${label} must be valid JSON`];
        }
      }
      case 'file': {
        // A file field stores a REFERENCE to an uploaded FileObject, not a
        // filename: { fileId, fileName, mimeType, sizeBytes }. The upload
        // itself happens through /files/upload, so the bytes live in S3 with
        // the rest of the app's documents. Ownership is verified in validate()
        // (a reference to another org's file is rejected there).
        if (raw && typeof raw === 'object' && 'fileId' in (raw as Record<string, unknown>)) {
          const r = raw as Record<string, unknown>;
          return [
            {
              fileId: String(r.fileId),
              fileName: r.fileName != null ? String(r.fileName) : '',
              mimeType: r.mimeType != null ? String(r.mimeType) : '',
              sizeBytes: r.sizeBytes != null ? Number(r.sizeBytes) : 0,
            },
            null,
          ];
        }
        return [null, `${label} must be an uploaded file`];
      }
      default: {
        // text / textarea / phone
        const s = String(raw);
        if (def.minLength != null && s.length < def.minLength) return [null, `${label} must be ≥ ${def.minLength} chars`];
        if (def.maxLength != null && s.length > def.maxLength) return [null, `${label} must be ≤ ${def.maxLength} chars`];
        if (def.regexPattern) {
          try {
            if (!new RegExp(def.regexPattern).test(s)) return [null, `${label} format is invalid`];
          } catch {
            /* ignore bad regex in definition */
          }
        }
        return [s, null];
      }
    }
  }

  private async isDuplicate(orgId: string, entity: CustomFieldEntity, key: string, value: unknown, excludeId?: string): Promise<boolean> {
    const where: any = {
      organizationId: orgId,
      deletedAt: null,
      customFields: { path: [key], equals: value as any },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };
    if (entity === 'employee') return !!(await this.prisma.employee.findFirst({ where, select: { id: true } }));
    if (entity === 'department') return !!(await this.prisma.department.findFirst({ where, select: { id: true } }));
    return false;
  }
}
