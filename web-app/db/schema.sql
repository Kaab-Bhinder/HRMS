-- =============================================================================
--  WORKFORCE MANAGEMENT SYSTEM — Web Admin Application
--  Authoritative PostgreSQL schema (source of truth for migrations & ORM)
--
--  Conventions
--  -----------
--  * UUID primary keys (gen_random_uuid)     -> non-enumerable, shard/merge safe
--  * organization_id on every tenant table   -> single-tenant now, multi-tenant ready
--  * created_at / updated_at (UTC, tz-aware)  -> audit timestamps on every table
--  * created_by / updated_by / deleted_by     -> who-did-it audit fields
--  * deleted_at (NULL = live)                 -> soft delete; unique keys are partial
--  * snake_case identifiers, plural tables
--  * FKs indexed explicitly; hot filter columns indexed
--  * CHECK / UNIQUE constraints enforce invariants at the DB, not just the app
--
--  Design covers the ENTIRE documented system (Phases 1-4) so future modules
--  slot in without restructuring. Tables not yet surfaced in the UI are still
--  defined here on purpose.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive email/handles
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- fuzzy global search (GIN trigram)

-- -----------------------------------------------------------------------------
-- 0. ENUM TYPES
-- -----------------------------------------------------------------------------
CREATE TYPE user_status        AS ENUM ('invited','active','suspended','disabled');
CREATE TYPE employee_status     AS ENUM ('probation','active','on_leave','suspended','resigned','terminated','retired');
CREATE TYPE gender_type         AS ENUM ('male','female','other','undisclosed');
CREATE TYPE employment_type     AS ENUM ('full_time','part_time','contract','intern','consultant');
CREATE TYPE attendance_status   AS ENUM ('present','absent','late','half_day','on_leave','holiday','weekend','wfh');
CREATE TYPE check_method        AS ENUM ('web','mobile','kiosk','qr','biometric','face','manual');
CREATE TYPE leave_request_status AS ENUM ('draft','pending','approved','rejected','cancelled','withdrawn');
CREATE TYPE approval_status     AS ENUM ('pending','approved','rejected','skipped');
CREATE TYPE task_status         AS ENUM ('backlog','todo','in_progress','in_review','blocked','done','cancelled');
CREATE TYPE task_priority       AS ENUM ('low','medium','high','urgent');
CREATE TYPE review_status       AS ENUM ('draft','in_progress','submitted','acknowledged','closed');
CREATE TYPE goal_status         AS ENUM ('not_started','on_track','at_risk','off_track','completed','cancelled');
CREATE TYPE notification_channel AS ENUM ('in_app','email','sms','push','whatsapp');
CREATE TYPE notification_status  AS ENUM ('queued','sent','delivered','read','failed');
CREATE TYPE audit_action        AS ENUM ('create','read','update','delete','restore','login','logout','export','approve','reject','assign');
CREATE TYPE custom_field_type   AS ENUM ('text','textarea','number','decimal','boolean','date','datetime','email','phone','url','select','multiselect','file','json');
CREATE TYPE custom_field_entity AS ENUM ('employee','department','task','asset','document','organization','leave_request');

-- =============================================================================
-- 1. ORGANIZATION & STRUCTURE
-- =============================================================================
CREATE TABLE organizations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(200) NOT NULL,
    legal_name      varchar(255),
    slug            citext NOT NULL,
    logo_url        text,
    timezone        varchar(64)  NOT NULL DEFAULT 'UTC',
    locale          varchar(16)  NOT NULL DEFAULT 'en',
    currency        char(3)      NOT NULL DEFAULT 'USD',
    settings        jsonb        NOT NULL DEFAULT '{}'::jsonb,
    is_active       boolean      NOT NULL DEFAULT true,
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NOT NULL DEFAULT now(),
    deleted_at      timestamptz,
    CONSTRAINT uq_org_slug UNIQUE (slug)
);

CREATE TABLE locations (                       -- offices / sites (attendance geofencing)
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            varchar(150) NOT NULL,
    address         text,
    latitude        numeric(9,6),
    longitude       numeric(9,6),
    radius_meters   integer CHECK (radius_meters IS NULL OR radius_meters > 0),
    timezone        varchar(64),
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE INDEX idx_locations_org ON locations(organization_id) WHERE deleted_at IS NULL;

CREATE TABLE departments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id       uuid REFERENCES departments(id) ON DELETE SET NULL,   -- hierarchy
    name            varchar(150) NOT NULL,
    code            varchar(40),
    description     text,
    head_employee_id uuid,                       -- FK added after employees (deferred)
    cost_center     varchar(60),
    custom_fields   jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid, deleted_by uuid,
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_dept_code ON departments(organization_id, code) WHERE deleted_at IS NULL AND code IS NOT NULL;
CREATE INDEX idx_dept_org    ON departments(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dept_parent ON departments(parent_id);

CREATE TABLE designations (                    -- job titles / bands
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           varchar(150) NOT NULL,
    level           integer,                    -- job band / grade
    description     text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_designation ON designations(organization_id, title) WHERE deleted_at IS NULL;

-- =============================================================================
-- 2. IDENTITY, AUTH & RBAC
-- =============================================================================
CREATE TABLE users (                           -- login identity (admins, managers, employees)
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           citext NOT NULL,
    password_hash   text,                       -- Argon2id; NULL for SSO-only accounts
    full_name       varchar(150) NOT NULL,
    avatar_url      text,
    status          user_status NOT NULL DEFAULT 'invited',
    is_super_admin  boolean NOT NULL DEFAULT false,
    mfa_enabled     boolean NOT NULL DEFAULT false,
    mfa_secret      text,                       -- encrypted at app layer (KMS/pgcrypto)
    last_login_at   timestamptz,
    last_login_ip   inet,
    failed_attempts smallint NOT NULL DEFAULT 0,
    locked_until    timestamptz,
    password_changed_at timestamptz,
    email_verified_at   timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid, deleted_by uuid,
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_users_email ON users(organization_id, email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(organization_id, status) WHERE deleted_at IS NULL;

CREATE TABLE roles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            varchar(80) NOT NULL,       -- e.g. HR Manager, Finance Officer
    slug            varchar(80) NOT NULL,
    description     text,
    is_system       boolean NOT NULL DEFAULT false,   -- system roles cannot be deleted
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_role_slug ON roles(organization_id, slug) WHERE deleted_at IS NULL;

CREATE TABLE permissions (                     -- global catalog: "resource:action"
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key             varchar(100) NOT NULL UNIQUE,    -- e.g. 'employees:create'
    resource        varchar(60)  NOT NULL,
    action          varchar(40)  NOT NULL,
    description     text
);
CREATE INDEX idx_perm_resource ON permissions(resource);

CREATE TABLE role_permissions (
    role_id         uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_department_id uuid REFERENCES departments(id) ON DELETE CASCADE,  -- optional dept-scoped role
    assigned_at     timestamptz NOT NULL DEFAULT now(),
    assigned_by     uuid,
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Session / token lifecycle -------------------------------------------------
CREATE TABLE refresh_tokens (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      text NOT NULL,              -- store hash, never the raw token
    family_id       uuid NOT NULL,             -- rotation family (reuse detection)
    user_agent      text,
    ip_address      inet,
    expires_at      timestamptz NOT NULL,
    revoked_at      timestamptz,
    replaced_by     uuid REFERENCES refresh_tokens(id),
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_user   ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_active ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

CREATE TABLE password_reset_tokens (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      text NOT NULL,
    expires_at      timestamptz NOT NULL,
    used_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pwreset_user ON password_reset_tokens(user_id);

-- =============================================================================
-- 3. EMPLOYEES
-- =============================================================================
CREATE TABLE employees (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         uuid REFERENCES users(id) ON DELETE SET NULL,   -- login (optional)
    employee_code   varchar(40) NOT NULL,       -- auto-generated badge id
    first_name      varchar(80) NOT NULL,
    last_name       varchar(80) NOT NULL,
    display_name    varchar(160),
    work_email      citext,
    personal_email  citext,
    phone           varchar(30),
    gender          gender_type,
    date_of_birth   date,
    department_id   uuid REFERENCES departments(id) ON DELETE SET NULL,
    designation_id  uuid REFERENCES designations(id) ON DELETE SET NULL,
    location_id     uuid REFERENCES locations(id) ON DELETE SET NULL,
    manager_id      uuid REFERENCES employees(id) ON DELETE SET NULL,  -- reporting line
    employment_type employment_type NOT NULL DEFAULT 'full_time',
    status          employee_status NOT NULL DEFAULT 'probation',
    date_of_joining date,
    probation_end   date,
    date_of_exit    date,
    -- sensitive: encrypted at app layer before insert (pgcrypto/KMS)
    bank_account_enc bytea,
    tax_id_enc       bytea,
    -- flexible admin-defined attributes (see custom_field_definitions)
    custom_fields   jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid, deleted_by uuid,
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_emp_code       ON employees(organization_id, employee_code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_emp_work_email ON employees(organization_id, work_email)    WHERE deleted_at IS NULL AND work_email IS NOT NULL;
CREATE INDEX idx_emp_org        ON employees(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emp_department ON employees(department_id);
CREATE INDEX idx_emp_manager    ON employees(manager_id);
CREATE INDEX idx_emp_status     ON employees(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_emp_custom_gin ON employees USING gin (custom_fields jsonb_path_ops);   -- filter/search custom fields
CREATE INDEX idx_emp_name_trgm  ON employees USING gin ((first_name || ' ' || last_name) gin_trgm_ops);  -- fuzzy search

-- deferred FK: department head -> employee
ALTER TABLE departments
  ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

CREATE TABLE employment_history (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    event_type      varchar(40) NOT NULL,       -- joined, promoted, transferred, suspended, exit
    from_value      jsonb, to_value jsonb,
    effective_date  date NOT NULL,
    note            text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid
);
CREATE INDEX idx_emp_hist ON employment_history(employee_id, effective_date DESC);

-- =============================================================================
-- 4. DYNAMIC CUSTOM FIELDS  (metadata + JSONB hybrid EAV)
-- =============================================================================
--  Values live in each entity's `custom_fields` JSONB column, keyed by field_key.
--  This table is the schema/validation/registry that the API and UI drive from.
CREATE TABLE custom_field_definitions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity          custom_field_entity NOT NULL,        -- which module this field belongs to
    field_key       varchar(64) NOT NULL,                -- machine key inside JSONB, e.g. 'passport_number'
    label           varchar(120) NOT NULL,               -- human label
    data_type       custom_field_type NOT NULL,
    help_text       text,
    placeholder     varchar(160),
    default_value   jsonb,
    -- validation
    is_required     boolean NOT NULL DEFAULT false,
    is_unique       boolean NOT NULL DEFAULT false,
    min_value       numeric, max_value numeric,
    min_length      integer, max_length integer,
    regex_pattern   text,
    options         jsonb,        -- for select/multiselect: [{"value":"o+","label":"O+"}]
    -- behaviour
    display_order   integer NOT NULL DEFAULT 0,
    is_visible      boolean NOT NULL DEFAULT true,        -- show in forms/detail
    is_searchable   boolean NOT NULL DEFAULT false,       -- include in global search
    is_filterable   boolean NOT NULL DEFAULT false,       -- expose as list filter
    is_encrypted    boolean NOT NULL DEFAULT false,       -- store value encrypted
    is_system       boolean NOT NULL DEFAULT false,       -- seeded defaults, non-deletable
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid,
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_cfd_key ON custom_field_definitions(organization_id, entity, field_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_cfd_entity    ON custom_field_definitions(organization_id, entity) WHERE deleted_at IS NULL;

-- Optional normalized mirror for heavy reporting / cross-entity value queries.
-- The JSONB column stays the write path; a trigger/outbox can project into this.
CREATE TABLE custom_field_values (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id   uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    entity          custom_field_entity NOT NULL,
    entity_id       uuid NOT NULL,
    value_text      text,
    value_number    numeric,
    value_bool      boolean,
    value_date      timestamptz,
    value_json      jsonb,
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_cfv UNIQUE (definition_id, entity_id)
);
CREATE INDEX idx_cfv_entity ON custom_field_values(entity, entity_id);
CREATE INDEX idx_cfv_text   ON custom_field_values(definition_id, value_text);

-- =============================================================================
-- 5. ATTENDANCE, SHIFTS & LEAVE
-- =============================================================================
CREATE TABLE shifts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            varchar(100) NOT NULL,
    start_time      time NOT NULL,
    end_time        time NOT NULL,
    grace_minutes   smallint NOT NULL DEFAULT 0,
    break_minutes   smallint NOT NULL DEFAULT 0,
    is_night_shift  boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

CREATE TABLE employee_shifts (                 -- roster assignments
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id        uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    effective_from  date NOT NULL,
    effective_to    date,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_emp_shift ON employee_shifts(employee_id, effective_from DESC);

CREATE TABLE attendance_records (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_date       date NOT NULL,
    check_in_at     timestamptz,
    check_out_at    timestamptz,
    check_in_method check_method,
    check_out_method check_method,
    check_in_lat    numeric(9,6), check_in_lng numeric(9,6),
    check_out_lat   numeric(9,6), check_out_lng numeric(9,6),
    location_id     uuid REFERENCES locations(id) ON DELETE SET NULL,
    status          attendance_status NOT NULL DEFAULT 'present',
    worked_minutes  integer,
    overtime_minutes integer NOT NULL DEFAULT 0,
    is_regularized  boolean NOT NULL DEFAULT false,
    face_match_score numeric(5,2),              -- Rekognition confidence
    is_flagged      boolean NOT NULL DEFAULT false,   -- anti-fraud flag
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid,
    CONSTRAINT uq_attendance_day UNIQUE (employee_id, work_date)
);
CREATE INDEX idx_att_org_date ON attendance_records(organization_id, work_date);
CREATE INDEX idx_att_emp_date ON attendance_records(employee_id, work_date DESC);
CREATE INDEX idx_att_flagged  ON attendance_records(organization_id) WHERE is_flagged = true;

CREATE TABLE attendance_regularizations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id   uuid REFERENCES attendance_records(id) ON DELETE CASCADE,
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_date       date NOT NULL,
    reason          text NOT NULL,
    requested_in    timestamptz, requested_out timestamptz,
    status          approval_status NOT NULL DEFAULT 'pending',
    reviewed_by     uuid REFERENCES employees(id) ON DELETE SET NULL,
    reviewed_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_regularize_status ON attendance_regularizations(status);

CREATE TABLE holidays (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id     uuid REFERENCES locations(id) ON DELETE CASCADE,
    name            varchar(120) NOT NULL,
    holiday_date    date NOT NULL,
    is_optional     boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_holiday ON holidays(organization_id, coalesce(location_id,'00000000-0000-0000-0000-000000000000'), holiday_date, name);

CREATE TABLE leave_types (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            varchar(80) NOT NULL,       -- annual, sick, casual, unpaid
    code            varchar(20) NOT NULL,
    is_paid         boolean NOT NULL DEFAULT true,
    accrual_per_year numeric(6,2),
    carry_forward_max numeric(6,2),
    allow_negative  boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_leave_type ON leave_types(organization_id, code) WHERE deleted_at IS NULL;

CREATE TABLE leave_balances (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id   uuid NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year            smallint NOT NULL,
    entitled        numeric(6,2) NOT NULL DEFAULT 0,
    taken           numeric(6,2) NOT NULL DEFAULT 0,
    pending         numeric(6,2) NOT NULL DEFAULT 0,
    carried_forward numeric(6,2) NOT NULL DEFAULT 0,
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id   uuid NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date      date NOT NULL,
    end_date        date NOT NULL,
    days            numeric(5,2) NOT NULL,
    reason          text,
    status          leave_request_status NOT NULL DEFAULT 'pending',
    custom_fields   jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid, deleted_by uuid,
    deleted_at      timestamptz,
    CONSTRAINT ck_leave_dates CHECK (end_date >= start_date)
);
CREATE INDEX idx_leave_emp    ON leave_requests(employee_id, start_date DESC);
CREATE INDEX idx_leave_status ON leave_requests(organization_id, status) WHERE deleted_at IS NULL;

-- Generic multi-level approval chain (reused by leave, travel, tasks, etc.)
CREATE TABLE approval_steps (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type    varchar(40) NOT NULL,       -- 'leave_request','travel_request',...
    subject_id      uuid NOT NULL,
    step_order      smallint NOT NULL,
    approver_id     uuid REFERENCES employees(id) ON DELETE SET NULL,
    status          approval_status NOT NULL DEFAULT 'pending',
    comment         text,
    acted_at        timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_approval_subject ON approval_steps(subject_type, subject_id, step_order);
CREATE INDEX idx_approval_pending ON approval_steps(approver_id) WHERE status = 'pending';

-- =============================================================================
-- 6. TASK MANAGEMENT (assignment, monitoring)
-- =============================================================================
CREATE TABLE tasks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           varchar(200) NOT NULL,
    description     text,
    department_id   uuid REFERENCES departments(id) ON DELETE SET NULL,
    parent_task_id  uuid REFERENCES tasks(id) ON DELETE SET NULL,   -- subtasks
    status          task_status   NOT NULL DEFAULT 'todo',
    priority        task_priority NOT NULL DEFAULT 'medium',
    progress        smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    start_date      date,
    due_date        date,
    completed_at    timestamptz,
    estimated_hours numeric(6,2),
    actual_hours    numeric(6,2),
    created_by_emp  uuid REFERENCES employees(id) ON DELETE SET NULL,
    custom_fields   jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid, updated_by uuid, deleted_by uuid,
    deleted_at      timestamptz
);
CREATE INDEX idx_task_org_status ON tasks(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_due        ON tasks(organization_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_dept       ON tasks(department_id);

CREATE TABLE task_assignments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role            varchar(30) NOT NULL DEFAULT 'assignee',   -- assignee, reviewer, watcher
    assigned_at     timestamptz NOT NULL DEFAULT now(),
    assigned_by     uuid,
    CONSTRAINT uq_task_assignee UNIQUE (task_id, employee_id, role)
);
CREATE INDEX idx_task_assign_emp ON task_assignments(employee_id);

CREATE TABLE task_comments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id       uuid REFERENCES employees(id) ON DELETE SET NULL,
    body            text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE INDEX idx_task_comment ON task_comments(task_id, created_at);

CREATE TABLE task_activity (                   -- status/field change log for monitoring
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_id        uuid,
    field           varchar(50),
    old_value       jsonb, new_value jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_activity ON task_activity(task_id, created_at DESC);

-- =============================================================================
-- 7. PERFORMANCE MANAGEMENT
-- =============================================================================
CREATE TABLE review_cycles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            varchar(120) NOT NULL,      -- 'H1 2026'
    start_date      date NOT NULL, end_date date NOT NULL,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE performance_reviews (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cycle_id        uuid REFERENCES review_cycles(id) ON DELETE SET NULL,
    employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id     uuid REFERENCES employees(id) ON DELETE SET NULL,
    status          review_status NOT NULL DEFAULT 'draft',
    overall_score   numeric(4,2),
    summary         text,
    submitted_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE INDEX idx_review_emp ON performance_reviews(employee_id);

CREATE TABLE goals (                           -- KPI / OKR
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id     uuid REFERENCES employees(id) ON DELETE CASCADE,
    department_id   uuid REFERENCES departments(id) ON DELETE CASCADE,
    title           varchar(200) NOT NULL,
    metric          varchar(120),
    target_value    numeric, current_value numeric,
    weight          numeric(5,2),
    status          goal_status NOT NULL DEFAULT 'not_started',
    due_date        date,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE INDEX idx_goal_emp ON goals(employee_id);

-- =============================================================================
-- 8. NOTIFICATIONS
-- =============================================================================
CREATE TABLE notification_templates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_key       varchar(80) NOT NULL,       -- 'leave.approved'
    channel         notification_channel NOT NULL,
    subject         varchar(200),
    body            text NOT NULL,              -- handlebars-style template
    is_active       boolean NOT NULL DEFAULT true,
    CONSTRAINT uq_notif_template UNIQUE (organization_id, event_key, channel)
);

CREATE TABLE notifications (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recipient_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_key       varchar(80),
    channel         notification_channel NOT NULL DEFAULT 'in_app',
    title           varchar(200) NOT NULL,
    body            text,
    data            jsonb NOT NULL DEFAULT '{}'::jsonb,   -- deep-link payload
    status          notification_status NOT NULL DEFAULT 'queued',
    read_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_recipient ON notifications(recipient_user_id, created_at DESC);
CREATE INDEX idx_notif_unread    ON notifications(recipient_user_id) WHERE read_at IS NULL;

CREATE TABLE notification_preferences (
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_key       varchar(80) NOT NULL,
    channel         notification_channel NOT NULL,
    is_enabled      boolean NOT NULL DEFAULT true,
    PRIMARY KEY (user_id, event_key, channel)
);

-- =============================================================================
-- 9. FILES / ATTACHMENTS  (polymorphic, secure upload metadata)
-- =============================================================================
CREATE TABLE files (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_type      varchar(40) NOT NULL,       -- 'employee','task','document',...
    owner_id        uuid NOT NULL,
    file_name       varchar(255) NOT NULL,
    mime_type       varchar(120) NOT NULL,
    size_bytes      bigint NOT NULL CHECK (size_bytes >= 0),
    storage_key     text NOT NULL,              -- S3 object key
    checksum_sha256 char(64),
    is_scanned      boolean NOT NULL DEFAULT false,   -- AV/virus scan result
    scan_result     varchar(20),
    uploaded_by     uuid,
    created_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE INDEX idx_files_owner ON files(owner_type, owner_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- 10. SETTINGS, REPORTS, AUDIT & ACTIVITY
-- =============================================================================
CREATE TABLE settings (                        -- org-scoped key/value config
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key             varchar(120) NOT NULL,
    value           jsonb NOT NULL,
    updated_at      timestamptz NOT NULL DEFAULT now(),
    updated_by      uuid,
    PRIMARY KEY (organization_id, key)
);

CREATE TABLE saved_reports (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            varchar(150) NOT NULL,
    module          varchar(60) NOT NULL,       -- attendance, payroll, leave, employees
    definition      jsonb NOT NULL,             -- columns, filters, grouping
    schedule_cron   varchar(60),                -- optional scheduled export
    recipients      jsonb,
    created_by      uuid,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
CREATE INDEX idx_reports_module ON saved_reports(organization_id, module) WHERE deleted_at IS NULL;

-- Immutable audit log — every create/update/delete/security event.
CREATE TABLE audit_logs (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id uuid,
    actor_user_id   uuid,
    action          audit_action NOT NULL,
    entity_type     varchar(60) NOT NULL,
    entity_id       uuid,
    before_data     jsonb,
    after_data      jsonb,
    ip_address      inet,
    user_agent      text,
    request_id      uuid,                       -- correlate with request logs
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor  ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_org    ON audit_logs(organization_id, created_at DESC);
-- (partition audit_logs by month in production; see docs/07)

-- Lighter user-facing activity feed (dashboard "recent activities").
CREATE TABLE activity_logs (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_user_id   uuid REFERENCES users(id) ON DELETE SET NULL,
    verb            varchar(60) NOT NULL,       -- 'created_employee', 'approved_leave'
    summary         text NOT NULL,
    entity_type     varchar(60),
    entity_id       uuid,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_org ON activity_logs(organization_id, created_at DESC);

-- =============================================================================
-- 11. updated_at trigger (attach to every mutable table)
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT c.table_name FROM information_schema.columns c
    WHERE c.column_name = 'updated_at' AND c.table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON %1$I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
  END LOOP;
END $$;

-- =============================================================================
--  END OF SCHEMA
-- =============================================================================
