-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "email_domain" VARCHAR(120);

-- CreateIndex
CREATE UNIQUE INDEX "employees_organization_id_work_email_key" ON "employees"("organization_id", "work_email");
