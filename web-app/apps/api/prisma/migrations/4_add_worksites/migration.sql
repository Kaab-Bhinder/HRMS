-- CreateEnum
CREATE TYPE "CheckInScope" AS ENUM ('any_site', 'assigned_only');

-- AlterTable
ALTER TABLE "attendance_days" ADD COLUMN     "location_id" UUID;

-- AlterTable
ALTER TABLE "attendance_policies" ADD COLUMN     "check_in_scope" "CheckInScope" NOT NULL DEFAULT 'any_site';

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "client_id" UUID;

-- CreateIndex
CREATE INDEX "locations_client_id_idx" ON "locations"("client_id");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

