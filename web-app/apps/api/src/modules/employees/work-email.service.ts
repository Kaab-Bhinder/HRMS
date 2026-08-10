import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Builds the work e-mail for a new employee from their name.
 *
 * Two rules the UI relies on:
 *  - the address must be free, both as an employee work e-mail AND as a login,
 *    since one becomes the other;
 *  - the domain is never invented. It comes from the organisation setting, or
 *    is inferred from what colleagues already use — guessing would produce
 *    addresses that bounce.
 */
@Injectable()
export class WorkEmailService {
  constructor(private readonly prisma: PrismaService) {}

  /** Strips accents and punctuation: "José Ángel O'Brien" → "jose.angel.obrien". */
  private slug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '.');
  }

  /** The organisation's domain, or the one most colleagues already use. */
  async domain(orgId: string): Promise<string | null> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { emailDomain: true },
    });
    if (org?.emailDomain) return org.emailDomain.replace(/^@/, '').trim().toLowerCase();

    // Fall back to the most common domain in use, so an organisation that
    // never filled in the setting still gets sensible suggestions.
    const rows = await this.prisma.employee.findMany({
      where: { organizationId: orgId, deletedAt: null, workEmail: { not: null } },
      select: { workEmail: true },
      take: 500,
    });
    const tally = new Map<string, number>();
    for (const r of rows) {
      const d = r.workEmail?.split('@')[1]?.toLowerCase();
      if (d) tally.set(d, (tally.get(d) ?? 0) + 1);
    }
    const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    return best?.[0] ?? null;
  }

  /** True when nothing — employee or login — already holds this address. */
  async isAvailable(orgId: string, email: string, exceptEmployeeId?: string): Promise<boolean> {
    const value = email.trim().toLowerCase();
    const [asEmployee, asLogin] = await Promise.all([
      this.prisma.employee.findFirst({
        where: {
          organizationId: orgId, deletedAt: null, workEmail: { equals: value, mode: 'insensitive' },
          ...(exceptEmployeeId ? { id: { not: exceptEmployeeId } } : {}),
        },
        select: { id: true },
      }),
      this.prisma.user.findFirst({
        where: { organizationId: orgId, deletedAt: null, email: { equals: value, mode: 'insensitive' } },
        select: { id: true },
      }),
    ]);
    return !asEmployee && !asLogin;
  }

  /**
   * Suggests an address for a name. Two people called Budi Santoso get
   * `budi.santoso@` and `budi.santoso2@` rather than a collision — the second
   * one would otherwise be rejected on save with no explanation.
   */
  async suggest(orgId: string, firstName: string, lastName: string) {
    const domain = await this.domain(orgId);
    const local = [this.slug(firstName), this.slug(lastName)].filter(Boolean).join('.');
    if (!local || !domain) return { email: null, domain, available: false };

    for (let n = 1; n <= 50; n++) {
      const candidate = `${local}${n === 1 ? '' : n}@${domain}`;
      if (await this.isAvailable(orgId, candidate)) {
        return { email: candidate, domain, available: true };
      }
    }
    return { email: null, domain, available: false };
  }
}
