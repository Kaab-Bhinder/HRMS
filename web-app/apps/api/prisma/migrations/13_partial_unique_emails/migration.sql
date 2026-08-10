-- Uniqueness must ignore soft-deleted rows, otherwise a departed employee
-- holds their work e-mail forever and the same person can never be re-hired
-- (nor can a typo'd address be reused).

DROP INDEX IF EXISTS "employees_organization_id_work_email_key";
CREATE UNIQUE INDEX "employees_org_work_email_active_key"
  ON "employees" ("organization_id", "work_email")
  WHERE "deleted_at" IS NULL;

-- Same reasoning for login accounts: a deleted account should not reserve the
-- address it used.
DROP INDEX IF EXISTS "users_organization_id_email_key";
CREATE UNIQUE INDEX "users_org_email_active_key"
  ON "users" ("organization_id", "email")
  WHERE "deleted_at" IS NULL;
