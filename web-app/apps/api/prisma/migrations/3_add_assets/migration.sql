-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('available', 'assigned', 'in_repair', 'lost', 'retired');
-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "asset_tag" VARCHAR(60) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(60) NOT NULL,
    "serial_number" VARCHAR(120),
    "purchase_date" DATE,
    "purchase_cost" DECIMAL(14,2),
    "vendor" VARCHAR(150),
    "warranty_until" DATE,
    "status" "AssetStatus" NOT NULL DEFAULT 'available',
    "condition" VARCHAR(40),
    "notes" TEXT,
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "assigned_to" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,
    "condition_out" VARCHAR(40),
    "returned_at" TIMESTAMP(3),
    "returned_by" UUID,
    "condition_in" VARCHAR(40),
    "notes" TEXT,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "assets_organization_id_status_idx" ON "assets"("organization_id", "status");
-- CreateIndex
CREATE INDEX "assets_assigned_to_idx" ON "assets"("assigned_to");
-- CreateIndex
CREATE UNIQUE INDEX "assets_organization_id_asset_tag_key" ON "assets"("organization_id", "asset_tag");
-- CreateIndex
CREATE INDEX "asset_assignments_asset_id_assigned_at_idx" ON "asset_assignments"("asset_id", "assigned_at");
-- CreateIndex
CREATE INDEX "asset_assignments_employee_id_returned_at_idx" ON "asset_assignments"("employee_id", "returned_at");
-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
