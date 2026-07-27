-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('prospect', 'active', 'inactive');

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(40),
    "contact_person" VARCHAR(150),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(30),
    "status" "ClientStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "department_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_organization_id_status_idx" ON "clients"("organization_id", "status");

-- CreateIndex
CREATE INDEX "clients_department_id_idx" ON "clients"("department_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

