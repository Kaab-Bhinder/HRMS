-- Keep the enrollment frame so a base photo can be shown next to check-in selfies.
ALTER TABLE "face_templates" ADD COLUMN "image_storage_key" TEXT;
