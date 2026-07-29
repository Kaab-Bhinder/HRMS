-- AlterTable
ALTER TABLE "attendance_policies" ADD COLUMN     "absent_on_face_mismatch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "absent_on_geofence_fail" BOOLEAN NOT NULL DEFAULT false;

