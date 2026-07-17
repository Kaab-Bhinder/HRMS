# 09 · Attendance Architecture (Phase 3)

Design for a **modular, extensible** attendance system. New capture methods and device vendors plug in without touching the core. Built for future i18n (no translations now — see §9).

---

## 1. Core principle — capture is a strategy, the record is normalized

Every way of marking attendance (manual, GPS, face, QR, biometric device) is an **AttendanceProvider** behind one interface. The core stores a **normalized punch** regardless of source, then recomputes a **daily summary**. Adding a method = adding a provider class + registering it. The core module never changes.

```
             ┌──────────────────────── AttendanceProvider (interface) ─────────────────────┐
             │  capture(ctx): Promise<NormalizedPunch>   // validates method-specific input │
             └──────────────────────────────────────────────────────────────────────────────┘
   Manual   Web    GpsGeofence   MobileFace   Qr    Biometric(sync)   …future(Wifi, Beacon)
      \       \        \             \         /          /                 /
       \_______\________\____________ \_______/_________/_________________/
                                       ▼
                         AttendanceService (core)
                     persists AttendancePunch → recompute AttendanceDay
                     opens/closes live-tracking session (mobile)
```

**Two-layer data model** (key decision):
- `attendance_punches` — immutable raw events (check_in / check_out / break_start / break_end). Every method writes here. Biometric sync and offline mobile just insert punches.
- `attendance_days` — derived daily summary (first-in, last-out, worked/late/OT minutes, status). Recomputed from punches + shift + policy. Idempotent, so re-sync or regularization safely recompute it.

This separation is what makes biometric import, offline sync, and multi-punch days work cleanly — you never fight a single mutable in/out row.

## 2. Provider interface

```ts
interface NormalizedPunch {
  type: 'check_in' | 'check_out' | 'break_start' | 'break_end';
  method: AttendanceMethod;
  occurredAt: Date;
  locationId?: string;
  latitude?: number; longitude?: number; accuracyMeters?: number;
  faceCaptureId?: string;            // MobileFace
  deviceId?: string;                 // Biometric / kiosk
  isOffline?: boolean;               // captured offline, synced later
  raw?: unknown;                     // original payload for audit
}

interface AttendanceProvider {
  method: AttendanceMethod;
  capture(ctx: CaptureContext): Promise<NormalizedPunch>;  // throws on policy violation
}
```
A `ProviderRegistry` maps `AttendanceMethod → provider`. `AttendanceService.punch(employee, payload)` selects the provider, validates (geofence, face, QR token, device), persists, recomputes the day, and (for mobile) manages the live session.

**Providers shipped in Phase 3:** `manual`, `web`, `mobile_gps` (geofence), `mobile_face` (capture + engine hook), `qr`. `biometric` punches arrive via the **sync service** (§4), not a direct call. Future methods (Wi-Fi/beacon) add a class only.

## 3. Shifts, breaks, policies, calendars

- **Shifts** with `type ∈ {fixed, flexible, rotating, overnight}`. Overnight handled by allowing `endTime < startTime` (spans midnight). Rotating handled by dated roster entries (`employee_shifts` with effective ranges).
- **Breaks**: `breaks` JSON on the shift + `break_start/break_end` punches; break minutes deducted from worked time.
- **AttendancePolicy** (per org, optionally overridden per **location/branch**): grace minutes, late/early thresholds, half-day & full-day minutes, overtime-after minutes, `enforceGeofence`, `allowedMethods[]`, `weeklyOffDays[]`. Branch-specific policy via `location.attendancePolicyId`.
- **Holidays** + **weekly offs** feed the day-status computation (holiday / weekly_off vs absent).
- **Remote/field**: policy flag `allowRemote`; WFH/field punches skip geofence, still capture GPS.

## 4. Biometric devices — generic adapter layer (no vendor hardcoding)

```
BiometricSyncService ──uses──▶ BiometricAdapterRegistry ──resolves──▶ Adapter(vendor)
   (cron / manual trigger)                                   ZKTeco │ eSSL │ Suprema │ …
```

- `biometric_devices` — vendor (free string, not enum → any vendor), model, `connectionType ∈ {push, pull, api, sdk, file}`, host/ip/port, encrypted credentials, `config` JSON, status, `lastSyncAt`, `lastCursor`.
- **`BiometricAdapter` interface**: `testConnection()`, `fetchLogs(since)`, `listUsers()`. One adapter per vendor, registered by vendor key. The core never imports a vendor SDK directly — adapters do.
- `device_user_mappings` — maps a device's user id → our `employeeId` (devices identify people by their own ids).
- `biometric_sync_logs` — every sync run: counts pulled/imported, cursor, status, error. Sync pulls logs → maps user → inserts `attendance_punches(method=biometric)` → recomputes days. Idempotent via a unique `(deviceId, deviceLogId)`.
- **Push devices** (that POST logs to us) hit a dedicated ingest endpoint that funnels into the same punch pipeline.

Phase 3 ships the interface, registry, device CRUD, sync-log model, and a **`GenericPullAdapter` stub**; concrete ZKTeco/eSSL/Suprema adapters drop in later with zero core change.

## 5. Face recognition — schema & interface ready, engine pluggable

- `face_templates` — enrollment per employee: `provider`, `externalTemplateId`/`embedding` ref, `quality`, `isActive`. (Actual biometric vector lives with the engine or as an encrypted ref — we don't store raw faces in the app DB.)
- `face_captures` — every selfie punch: `imageStorageKey` (S3), `confidenceScore`, `livenessScore`, `livenessPassed`, `matched`, `matchedTemplateId`, `provider`, `metadata` (device, geo), `capturedAt`. Confidence/liveness/image metadata all stored as required.
- **`FaceRecognitionProvider` interface**: `enroll(image) → template`, `verify(image, employee) → {confidence, liveness}`. Phase 3 ships a **`StubFaceProvider`** that records the capture and returns a pass-through score; the real engine (AWS Rekognition or other) implements the same interface later. The `mobile_face` attendance provider calls it and attaches the `faceCaptureId` to the punch.

## 6. Live location tracking (check-in → check-out)

**Model**
- `attendance_sessions` — opened on mobile check-in, closed on check-out: `startedAt`, `endedAt`, `status ∈ {active, ended, expired}`, `updateIntervalSec` (configurable), `lastPingAt`, start coords.
- `location_pings` — route points: `sessionId`, `recordedAt`, lat/lng, `accuracyMeters`, `speed?`, `battery?`, `isMoving?`. Append-only.

**Efficiency (battery)**
- Client sends **batched** pings to `POST /attendance/tracking/ping` (array), not one request per point.
- Server-driven cadence: session carries `updateIntervalSec` (from policy); the app uses significant-change + interval. Distance-filter and motion flag reduce points while stationary.
- Transmission is HTTPS + JWT (same as all endpoints).

**Playback (future-ready now):** pings are stored ordered by time per session, so `GET /attendance/sessions/:id/route` returns the full path whenever we choose to surface playback — no schema change needed.

**Security / RBAC:** viewing anyone's location requires a dedicated permission **`attendance:track`** (seeded, granted to Super Admin / HR Manager / Dept Manager only). Employees can write their own pings but cannot read others'. Live map and route endpoints are guarded by `attendance:track`.

## 7. Regularization & audit

- `attendance_regularizations` — employee requests a correction (missed punch); routed through the **generic approval engine** (§8). On approval, the day recomputes with the corrected times.
- **Full audit**: punches are immutable; every admin edit/manual entry writes an `audit_logs` row (Phase 4 interceptor) and manual punches are tagged with `createdById` + `method=manual`. Sync runs are logged in `biometric_sync_logs`.

## 8. Generic approval engine (shared)

`approval_steps(subjectType, subjectId, stepOrder, approver, status, comment, actedAt)` drives **leave, regularization, travel, and any future request**. `ApprovalService.start(subjectType, subjectId, approverChain)`, `.act(stepId, approve|reject, comment)`, `.state(subjectType, subjectId)`. One engine, many consumers — Leave and Regularization both use it in Phase 3.

## 9. Internationalization (compatibility only — NOT implemented now)

Per the project note (Indonesian users, Flutter-first later): **no translations are added in this phase.** We keep the code i18n-*ready*:
- All statuses/types are **enum codes** (e.g. `on_leave`, `check_in`) — never human sentences — so labels are resolved in the client per locale.
- Dates/times/numbers are stored as UTC / raw values; formatting/localization is a presentation concern (client), not stored.
- API error messages use stable, mappable phrasing; when i18n lands, they become message keys without schema change.
- No locale-specific logic embedded in the backend.

This means adding Indonesian (or any language) later is a frontend/message-catalog task, not a backend refactor.

## 10. Endpoint surface (Phase 3 attendance)

```
POST   /attendance/punch                 body: {type, method, ...method payload}  → normalized punch
POST   /attendance/tracking/ping         body: {sessionId, points:[...]}          (self)
GET    /attendance/sessions/active                                                (self / admin)
GET    /attendance/sessions/:id/route    @RequirePermissions('attendance:track')
GET    /attendance/live                  @RequirePermissions('attendance:track')  active sessions + last ping
GET    /attendance                       list days (filter: date, dept, status, flagged)   attendance:read
GET    /attendance/summary               dashboard tiles
POST   /attendance/manual                admin manual entry                         attendance:create
GET    /attendance/regularizations   ·   POST /attendance/regularizations/:id/approve|reject
/shifts · /attendance/policies · /holidays  (CRUD)
/biometric/devices (CRUD) · POST /biometric/devices/:id/sync · POST /biometric/ingest (push)
/face/templates (enroll/list)            (face capture happens inside /attendance/punch)
```

New permissions seeded: `attendance:track`, `biometric:read/create/update/delete`, `face:read/create`.
