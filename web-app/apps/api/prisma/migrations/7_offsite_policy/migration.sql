-- One setting replaces the enforceGeofence/allowRemote/absentOnGeofenceFail
-- trio (two of which were logical inverses of each other).
CREATE TYPE "OffSitePolicy" AS ENUM ('allowed', 'flag', 'absent');

ALTER TABLE "attendance_policies" ADD COLUMN "off_site_check_in" "OffSitePolicy" NOT NULL DEFAULT 'flag';

-- Backfill so no existing configuration changes meaning:
--   remote allowed OR geofence not enforced  -> allowed
--   strict enforcement was on                -> absent
--   otherwise                                -> flag
UPDATE "attendance_policies"
SET "off_site_check_in" = CASE
  WHEN "allow_remote" = true OR "enforce_geofence" = false THEN 'allowed'::"OffSitePolicy"
  WHEN "absent_on_geofence_fail" = true THEN 'absent'::"OffSitePolicy"
  ELSE 'flag'::"OffSitePolicy"
END;

ALTER TABLE "attendance_policies"
  DROP COLUMN "enforce_geofence",
  DROP COLUMN "allow_remote",
  DROP COLUMN "absent_on_geofence_fail";
