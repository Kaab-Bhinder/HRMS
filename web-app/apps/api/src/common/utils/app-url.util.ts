/**
 * The public URL of the WEB app, used to build links we put inside e-mails
 * (invitations, password resets).
 *
 * Falls back to the first CORS origin, because that list already has to
 * contain the web app's address for the browser to talk to the API at all.
 * Without this, an operator can configure CORS correctly on a new environment
 * and still send invitations pointing at localhost — a dead link for every
 * new employee, with nothing obviously misconfigured.
 *
 * APP_URL still wins when set, for the case where the web app is reachable on
 * a different address than the one browsers call from.
 */
export function appUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const firstOrigin = process.env.CORS_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter((o) => /^https?:\/\//.test(o) && !o.includes('*'))[0];
  if (firstOrigin) return firstOrigin.replace(/\/$/, '');

  return 'http://localhost:5173';
}
