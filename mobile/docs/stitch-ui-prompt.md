# Workforce — Mobile App UI Brief (for Stitch / AI UI generation)

**How to use:** Paste the **Design Language** block first (or set it as the project style), then
generate each screen using its prompt. Keep the same style across every screen. Generate each
screen in **both light and dark**.

---

## App in one line
A premium HR / **workforce-management app for employees** (not admins) at an Indonesian bank —
used to clock attendance with GPS, request leave, complete assigned tasks, view payslips, and read
notifications.

## Audience & tone
Everyday employees and team leads. Tone: **calm, trustworthy, premium enterprise** — banking-grade.
Target the quality tier of **Linear, Stripe, Revolut, Notion**: clean, spacious, refined, confident.
Never busy, cluttered, or "template-looking."

---

## DESIGN LANGUAGE (global — apply to every screen)

**Platform:** native mobile (iOS + Android), portrait, one-handed friendly, safe-area aware.
**Themes:** design BOTH light and dark, equally polished.

**Brand colors**
- Primary (deep blue): light `#1B4E8A`, dark `#5B94D6`
- Accent (gold): light `#C0891C`, dark `#E0AC43`
- Primary gradient: `#1B4E8A → #2E6DB4` (blue)
- Success `#208763` · Warning `#CB7A0D` · Danger `#D5342E` · Info = primary
- Light theme: background `#F8FAFB`, cards/surface `#FFFFFF`, text `#1B2431`, muted text `#5A6675`, borders `#DDE3EA`
- Dark theme: background `#0D131C`, cards/surface `#141C27`, text `#E3E9F0`, muted text `#93A0B2`, borders `#2A3542`

**Typography:** Inter for body, **Inter Tight** for headings and big numbers. Tight (negative)
letter-spacing on large headings; **tabular figures** for times, hours, counts, money.

**Shape & depth:** cards radius **16**, buttons radius **12**, pills fully rounded. Soft, layered
shadows (very subtle in dark — depth comes from surface tint). Generous spacing: **20px screen side
margins**, 16–24px between blocks, comfortable line-height.

**Core components**
- Buttons: filled **primary** with a soft colored glow; **secondary** outline on surface; **ghost** text.
- Status chips / pills: fully rounded, **tinted fill** of a semantic color + small leading dot.
- Inputs: rounded, filled, clear label above, focus ring in primary, inline error with icon.
- Cards: bordered, soft shadow, 16px radius, 16–20px padding.
- Avatars: gradient circle with initials.
- Bottom navigation: 5 tabs, active tab in primary with a subtle indicator.
- Skeleton loaders (shimmer) for loading; friendly empty states with a soft icon medallion.

**Iconography:** rounded line icons (Material Symbols Rounded), consistent stroke weight.
**Motion (for handoff notes):** smooth ease-out entrances, gentle press-scale on tap, shimmer on load.
**Accessibility:** AA contrast, ≥44px tap targets, visible focus, no color-only meaning.

**Global chrome**
- **Bottom nav (5 tabs):** Home · Attendance · Leave · Tasks · Profile.
- Top app bar per screen: greeting/title on the left, a **bell icon with unread badge** on the right.

---

## SCREENS

### 1. Splash
Centered brand medallion: a rounded-square tile on the blue gradient with a stylised white **"W"**
(two chevrons) and a small gold dot in the valley. Below it, the wordmark **"Workforce"** and a
muted tagline "Attendance • Leave • Tasks". A subtle loading indicator near the bottom. Background is
a soft diagonal gradient of the theme background. Minimal, elegant, lots of breathing room.

### 2. Login
Top: brand medallion, then a large heading **"Welcome back"** and a muted subtitle
"Sign in to mark attendance, request leave, and manage your tasks." A soft blue radial glow in the
top-right corner. Form: **Work email** field (email icon), **Password** field (lock icon, show/hide
toggle), a full-width primary **"Sign in"** button with a right arrow. A "Forgot password?" text link.
Footer line with a small shield icon: "Secured with end-to-end encryption." Clean, confident, calm.

### 3. Home (Dashboard)
Scrollable. Top: "Good morning," greeting + the employee's **first name** as a big heading; a gradient
**avatar with initials** on the right. Then a **hero attendance card**: an overline "TODAY", a status
pill (e.g. "Checked in" green / "Not checked in" grey), a large **live clock** (h:mm with dimmed
seconds + AM/PM), the full date, and a big **Check in** button (blue gradient with glow) — or
**Check out** (gold gradient) when already checked in; a sub-line "Since 9:04 AM · 2h 14m today" with a
location pin. Below: a **Today summary** card with three metrics (Worked, Check-in, Check-out).
Then a **"Quick actions"** row of two tappable cards: "Request leave" and "My tasks". Pull-to-refresh.

### 4. Check-in confirmation (bottom sheet with map)
A modal bottom sheet over Home. Shows a small **map preview** with the user's current GPS pin and a
subtle accuracy circle, the detected **location/branch name**, a "within geofence ✓" success chip (or a
warning chip if outside), the current time, and a large **Confirm check-in** button. A cancel affordance.
Premium, reassuring, not cluttered.

### 5. Attendance history
Top app bar "Attendance". A **month calendar** strip/grid where each day has a small colored dot
(green present, amber late, red absent, grey off/holiday). Below, a **list of days** grouped by week:
each row shows date, check-in and check-out times, hours worked, and a status pill; late/flagged days
subtly highlighted. A summary header (this month: present days, avg hours, late count). Empty and
loading (skeleton) states.

### 6. Leave overview
Top app bar "Leave" + a floating/primary **"Request leave"** button. Top: horizontally scrollable
**balance cards** per leave type (e.g. Annual, Sick, Casual) — each a small card with the type, a
progress ring or bar of used/total days, and remaining days in large tabular figures. Below: a
segmented control (Upcoming / History) over a **list of leave requests** — each row: type, date range,
day count, and a status pill (Pending amber / Approved green / Rejected red). Empty state: "No leave
requests yet."

### 7. Apply for leave (form)
Title "Request leave". Fields: **Leave type** (dropdown/segmented), **Start date** and **End date**
(date pickers), an auto-computed **"3 days"** summary chip, an optional **half-day** toggle, a
**Reason** multiline field, and a read-only **remaining balance** hint for the chosen type. Sticky
bottom primary **"Submit request"** button. Clean, obviously grouped, forgiving validation.

### 8. Tasks list
Top app bar "Tasks". A segmented control / tabs by status: **To do · In progress · In review · Done**.
Each task is a card: title, a one-line description, a priority pill (Low/Med/High/Urgent with color),
a due-date chip (red if overdue), and a small assignee/label row. Subtle checkbox or drag affordance.
Empty state per tab. Loading skeleton cards.

### 9. Task detail
Full task: title, status pill, priority, due date, description, an **activity/comments** thread at the
bottom with an input to add a comment, and a prominent primary action to **change status / mark
complete** (a segmented status switcher or a "Mark as done" button). Attachments row if any.

### 10. Notifications
Top app bar "Notifications" with a "Mark all read" text action. A list grouped by "New" and "Earlier":
each row has a tone-colored leading icon medallion (leave approved = green check, task assigned = blue,
reminder = amber), a title, a one-line body, and a relative timestamp; unread rows have a small dot and
a faint tinted background. Empty state: "You're all caught up."

### 11. Payslips (list + detail)   *(future module — design it)*
List: months as cards (e.g. "June 2026") with net pay in large tabular figures and a download icon.
Detail: employer header, pay period, an **earnings** section and a **deductions** section as clean
line-item rows, a bold **Net pay** total, and a **Download PDF** primary button. Financial, precise,
legible.

### 12. Profile / Account
Header: large gradient avatar with initials, full name, work email, and role pill(s) (e.g. "Employee").
Grouped list sections:
- **Account:** Personal info, Change password, Active sessions (list of devices with "revoke").
- **Preferences:** Notifications, **Appearance** (Light / Dark / System theme selector), Language.
- **About:** Help & support, Privacy, App version.
- A **Sign out** row in danger red at the bottom.
Use clean list rows with a leading icon, label, optional value/chevron. Sectioned with subtle headers.

### 13. (Optional) AI assistant chat   *(future)*
A chat screen: friendly header "Ask HR", message bubbles (user in primary, assistant on surface),
suggested-question chips, and a rounded input with a send button. Calm, helpful, on-brand.

---

## Deliverable expectations for the generator
- Every screen in **light + dark**.
- Consistent use of the tokens above (don't invent new colors/spacing).
- Real, believable content (Indonesian names, PKR/IDR-agnostic times) — no lorem ipsum.
- Include the **empty, loading, and error** state for each list-based screen.
- Mobile-first, responsive across small and large phones; nothing clipped.
