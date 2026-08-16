import { Logger } from '@nestjs/common';

const log = new Logger('AppUrl');

/**
 * The public URL of the WEB app, used to build links we put inside e-mails and
 * WhatsApp messages (invitations, password resets, agreement signing).
 *
 * `APP_URL` wins whenever it is set. Everything below is a fallback for the
 * case where it is not, because a link is worse than useless if it is wrong:
 * the recipient sees a real message from a real company and lands nowhere.
 */
export function appUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return strip(explicit);

  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => /^https?:\/\//.test(o) && !o.includes('*'));

  // Prefer an address that works from someone else's phone. CORS_ORIGINS
  // usually keeps localhost at the front so developers can work against a
  // deployed API — taking the first entry therefore mailed localhost links out
  // of production, which is exactly the failure this ordering prevents.
  const remote = origins.filter((o) => !isLocal(o));
  const chosen = remote.find((o) => o.startsWith('https://')) ?? remote[0] ?? origins[0];

  if (!chosen) return 'http://localhost:5173';
  return strip(chosen);
}

/**
 * Logged once at boot so a misconfigured environment is visible immediately,
 * rather than discovered when a new employee reports a dead invitation link.
 */
export function reportAppUrl(): void {
  const resolved = appUrl();
  if (process.env.APP_URL?.trim()) {
    log.log(`Links in e-mail and WhatsApp will point to ${resolved} (APP_URL)`);
    return;
  }
  const how = `APP_URL is not set — falling back to ${resolved} from CORS_ORIGINS`;
  if (isLocal(resolved)) {
    log.warn(`${how}. Outgoing links will only work on this machine; set APP_URL before inviting anyone.`);
  } else {
    log.warn(`${how}. Set APP_URL to make this explicit.`);
  }
}

const strip = (u: string) => u.replace(/\/$/, '');
const isLocal = (u: string) => /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(u);
