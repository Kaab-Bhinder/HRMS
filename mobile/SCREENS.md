# Mobile App — Screen & Functionality Spec

For the UI designer. Every screen below is **built and working against the live API** unless a line is explicitly marked ⚠️ *not built*. Design against what's here; the data shapes are real.

---

## Who uses this app

**Only two roles can sign in on mobile:**

| Role | Web | Mobile | What they see here |
|---|---|---|---|
| **Employee** | ✗ blocked | ✓ | Their own attendance, tasks, leave, payslip |
| **Department Head** | ✓ | ✓ | Everything an employee sees, **plus** their team's summary |
| Super Admin / Finance | ✓ | ✗ **blocked** | — |

This matters for design: **the app has no admin surface.** There is no user management, no employee list, no settings-for-the-company. It is a self-service app for one person plus a small team view for heads.

Design for **one-handed use, outdoors, in a hurry** — the primary action (check in) often happens while walking into a branch.

---

## Global patterns

**Navigation** — 5-tab bottom bar, floating (detached from the screen edge, rounded, shadowed). Active tab: solid gradient pill behind the icon + bold label. Tabs never disappear; state is preserved per tab.

**One hero per screen.** Each screen has exactly one deep gradient panel carrying the single number that screen exists to show. Everything else is neutral cards. This is the core rule — please keep it.

**Ambient background.** Two very soft tinted blobs behind content; never a flat fill.

**Theme.** Light and dark both required. Dark is not an afterthought — bank staff use this at night.

**States every screen needs designed:** loading (skeletons, not spinners), empty, error + retry, and pull-to-refresh.

---

## 1. Splash

**Purpose:** decide where to send the user.

- Restores the saved session silently
- Valid session → Home. No session → Login.
- Should feel instant; no branding animation longer than ~800ms

---

## 2. Login

**Fields:** work email, password (with show/hide toggle).

**Behaviours to design for:**
- Wrong credentials → inline error, *not* a toast that vanishes
- **Account locked** after repeated failures → distinct message with "try again later"
- **Wrong app** → a Super Admin or Finance Officer signing in gets *"This account is not permitted to access the mobile application."* Design this as an explanatory state, not a generic failure — it will happen and it is not the user's mistake.
- Rate limited (5 attempts/min) → needs its own message

⚠️ **No "Forgot password"** — deliberately removed. There is no self-service reset; an admin resets it. Do **not** design that link back in.

---

## 3. Home (tab 1) — the most important screen

**Hero — today's attendance.** Gradient panel:
- **Hours worked today**, large (e.g. `7h 45m`) with `of 8h` beside it
- Status chip: `Not checked in` / `Checked in` / `On break` / `Checked out`
- Slim progress track toward the 8h target
- First check-in time, last check-out time
- Today's date

**Primary action — Check In / Check Out.** Sits *below* the hero as a full-width pill so it reads as a control, not part of the readout.

What happens on tap (design the intermediate states):
1. **Selfie is mandatory** — camera opens. Cancelling aborts the check-in.
2. **GPS is captured** — location permission may prompt.
3. Server records it and returns the new status.

**Failure states to design:** camera denied, location denied, outside the office geofence (⚠️ this **does not block** — it flags for HR review, so the message should be informative, not alarming), and offline.

**Break button** — appears only while checked in. Toggles break start/end and shows accumulated break time. Overrunning the allowed break is flagged.

**Notification bell** (top right) — ✓ **built**. Shows an unread count badge and opens the Notifications screen.

**Department head card** — an employee sees who leads their department: name, email, "Your approver" tag. This is who approves their leave and assigns their tasks.

**Team section** — *department heads only*. Three counts: members, pending approvals, active tasks.

**This week chart** — smooth line of hours worked over the last 7 days, with a draggable highlight and a floating value bubble. Tapping "See all" opens Attendance.

**Quick action tiles** — 2×2 grid, each with a colored icon badge and a **live figure**:
- Attendance → *"18 days present this month"*
- Leave → *"17 days annual leave left"*
- Payslip → *"this month so far"*
- Documents → ⚠️ *not built*

**Office map** — ✓ **built**. Card showing the office pin, its geofence circle, and (for department heads only) pins for team members currently checked in, with their initials. Caption strip along the bottom: office name + either the geofence radius or "N checked in". Not draggable — it's a glance, not a tool, and dragging fights the page scroll.

**Upcoming** — placeholder card. ⚠️ Holidays/approved leave are not yet fed in.

---

## 4. Attendance (tab 2)

**Month selector** — pill control with ‹ › arrows. Cannot navigate past the current month.

**Hero — the month:**
- **Hours worked**, large
- Chip showing flagged-day count, if any
- Present / Late / Absent counts with colored dots

**Daily record table** — one thin row per day, columns: Date (day + weekday) · In · Out · Hrs · Status.
- Status is a colored dot + short word
- **Flagged rows are tinted red** and carry a flag icon
- Late days show `Nm late` under the hours

**Statuses to design:** present, late, half day, absent, on leave, weekly off, holiday.

**Note on flags:** a flag means GPS mismatch, mock-location detected, clock skew, or break overrun. The employee sees *that* it's flagged; HR resolves it. Consider a tap-to-explain affordance — right now the reason is not shown on mobile.

---

## 5. Leave (tab 3)

**Only two leave types exist. Do not design for more.**
- **Annual** — capped. The admin sets the yearly allowance.
- **Sick** — additional, uncapped. Still needs approval.

**Hero — allowance:**
- **Days remaining**, large, e.g. `17 of 20 days left`
- Sick shown as a chip: *"Sick · additional"*
- **Allowance bar** with three segments: taken (green, solid), pending (amber), remaining (translucent). These must stay visually distinct — "already gone" vs "might go" is the point.
- Caption: *"Days are deducted only once your head approves"*
- Pending / Approved / Rejected counts

**Important rule to reflect in copy:** days are deducted **on approval**, not on request. A rejected request costs nothing.

**Request list** — type, date range, day count, status pill (pending/approved/rejected/cancelled), reason. Pending requests can be **withdrawn** (confirm dialog first).

**Apply sheet** — type chips, date-range picker, optional reason.
- Selecting a type shows the cap inline: *"17 of 20 days left this year"*
- If days are awaiting approval: *"You can request up to 12 days — 5 of your 17 remaining are awaiting a decision"*
- Requests over the cap are refused by the server with a clear message

---

## 6. Tasks (tab 4)

**Hero — assigned work:**
- **Open task count**, large
- Overdue chip, if any
- Completion progress bar + `3 of 12 complete`
- Four counts: Open / Active / Done / Overdue

**Filter chips:** Open · All · Done.

**Task cards:** title, status, priority, due date with time-remaining, department.

**Task detail sheet:** title, status/priority/due chips, description, and actions.

### The reporting flow — design this carefully

This is the core loop between an employee and their department head.

**Employee can:**
- **Start task** (todo → in progress)
- **Submit report** — opens the submit sheet

**Submit sheet contains:**
1. **"What did you do?"** — multiline note (required)
2. **Documents** — two buttons, **Camera** and **Gallery**. Files upload immediately as they're picked (so a slow upload can't lose the written note). Attached files appear as green confirmation chips.
3. **"The work is finished"** — a large tappable checkbox, with the subtitle *"Sends it to your department head to confirm"*
4. **Send to department head** button

**Critical rule:** an employee **cannot mark their own task done.** Submitting with "finished" ticked moves it to **In Review**. The department head confirms completion on web. Design the waiting state: *"Submitted — waiting for your department head to confirm."*

⚠️ Currently only **photos** can be attached (camera/gallery). PDF attachment needs an extra library — flag if the client expects it.

---

## 7. Profile (tab 5)

**Hero — identity:** avatar (initials on a translucent disc), full name, email, role chips.

**Grouped rows:**

| Group | Row | Status |
|---|---|---|
| Account | Personal information | ⚠️ not built |
| | **Change password** | ✓ **built** |
| | Active sessions | ⚠️ not built (API exists) |
| Preferences | Notification preferences | ⚠️ not built (viewing notifications ✓ works — see §8) |
| | Appearance | ⚠️ not built |
| | Language | ⚠️ not built |
| About | Help & support, Privacy | ⚠️ not built |
| | App version | static |
| | **Sign out** | ✓ built |

**Change password sheet** (built): current password, new password (min 8, show/hide), confirm. On success: *"Password changed. Other devices were signed out."* — this app's own session survives, every other one is revoked. Wrong current password shows the real error.

---

## 8. Notifications (pushed from the Home bell) — ✓ built

Real notifications now exist. They are generated automatically when:

- an employee **applies for leave** → their department head is notified
- a head **approves or rejects** leave → the employee is notified
- a **task is assigned** → the assignee is notified
- an employee **submits a task report** → their head is notified, with the document count

**List rows:** icon (chosen from the content — leave / task / attendance), title, body, timestamp.

**Read vs unread is the main visual job:** unread carries a tinted icon badge and a dot on the right; read is neutral grey. The eye should land only on what hasn't been seen.

**"Mark all read"** in the app bar, shown only when there is at least one unread.

**Empty state:** *"Nothing yet — leave decisions and task assignments will appear here."*

⚠️ Only **in-app** delivery works. Email, SMS, push and WhatsApp are not connected, so nothing arrives outside the app.

---

## 9. Payslip (pushed from Home)

**Hero — this month's pay**, large figure.

Shows: payable hours, days present, hourly rate, late minutes, and a **mid-month progress** indication (earned so far vs potential).

**Key rule for copy:** pay is `min(hours worked, office hours) × hourly rate`. Working past office hours does **not** increase pay — the cap is deliberate. Worth making visible so employees don't feel short-changed.

---

## What is NOT built (be explicit with the client)

- **Documents** tile on Home
- **Personal information / Language / Appearance / Help** rows on Profile
- **Active sessions** row (the API exists; the screen does not)
- **Upcoming** card content (holidays, approved leave)
- **PDF attachments** — photos only
- **Email / SMS / push / WhatsApp** notification delivery — in-app only

---

## Design priorities, in order

1. **Home** — where the daily action happens; every employee opens this first
2. **Task submit sheet** — the newest flow, most likely to be demoed, most likely to confuse
3. **Leave** — the allowance bar carries a rule that's easy to get wrong
4. **Attendance** — dense table, needs the most typographic care
5. **Notifications** — new screen; the read/unread distinction is the whole design
6. **Profile** — mostly rows; lowest effort
