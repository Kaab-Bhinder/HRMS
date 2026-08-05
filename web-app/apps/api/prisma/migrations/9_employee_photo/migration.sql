-- Employee profile photo (FileObject id; served via the authenticated files endpoint).
ALTER TABLE "employees" ADD COLUMN "photo_file_id" UUID;
