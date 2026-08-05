/**
 * Curated product knowledge the assistant can quote.
 *
 * Kept as data rather than stuffed into the system prompt so it costs tokens
 * only when a question actually needs it, and so it can be corrected without
 * retuning the prompt. Describe behaviour, not implementation.
 */
export const HELP_TOPICS: Record<string, string> = {
  attendance:
    'Employees check in from the mobile app. Each check-in captures GPS location and a selfie, which is matched against their enrolled Face ID photos. The system resolves which work site they are at (their assigned site, or the nearest one within range). Check-ins are always recorded — if something looks wrong (outside the site, face mismatch) the day is flagged for HR review rather than silently rejected. Admins can optionally configure a site so that an off-site check-in or a face mismatch marks the day absent instead of just flagging it.',
  face_id:
    'Each employee enrols once, on first login, by holding several poses on camera (centre plus randomised challenges like turning left, right, up, or smiling). Those frames become their reference photos. At each check-in they repeat a shorter random challenge; the frontal frame is matched against their references and the pose sequence proves a live person rather than a photo. The employee sees the result — their selfie beside their reference photo, with the match percentage and liveness outcome.',
  payroll:
    'Employees are paid one of two ways. Monthly: a fixed basic salary, reduced only by unpaid-leave days. Hourly: pay-per-hour multiplied by attendance, capped at the scheduled office hours per day so overtime is never paid accidentally. Running payroll for a month produces payslips — immutable snapshots that freeze that month, so later attendance edits cannot silently change what was already paid.',
  leave:
    'Employees request leave from the mobile app or the web app; their manager or HR approves or rejects it. Each leave type has its own annual entitlement, and balances track entitled, taken, and remaining days. Approved unpaid leave is what reduces monthly salary in payroll.',
  work_sites:
    'An organisation can have several work sites — branches, and client premises. Each site has a location, a geofence radius, and optionally its own shift hours and attendance rules; sites without overrides inherit the organisation defaults. Employees can be assigned to a specific site, and when a department is dedicated to a client, new hires in that department inherit the client site automatically.',
  clients:
    'A client is an organisation you provide staff to. A client can be linked to the department that serves it and to the site where that work happens. Assigning a department to a client automatically makes the client site the default work site for that department’s team.',
  roles:
    'Access is controlled by roles. Each role holds a set of permissions (what you may read or change) and a platform gate (whether that role may sign in on web, mobile, or both). Data is additionally scoped: administrators and HR see the whole organisation, a department head sees their own team, and an employee sees only themselves.',
  custom_fields:
    'Administrators can add their own fields to employees and other records — text, number, date, yes/no, dropdown, multi-select, file upload, and more. They appear automatically on the relevant forms and on the record’s profile. File fields store a real uploaded document that can be downloaded again later.',
  reports:
    'Employees and department heads submit periodic work reports (weekly, monthly, or quarterly) up the reporting chain, optionally with file attachments. Recipients can review and acknowledge them.',
  assets:
    'Company assets (laptops, phones, vehicles, and so on) are tracked with their status and assignment history, so you can see what an employee currently holds and what has been returned.',
};

export function helpTopicList(): string {
  return Object.keys(HELP_TOPICS).join(', ');
}
