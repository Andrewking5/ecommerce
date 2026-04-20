-- AlterTable: add flexible answers field to event_registrations
-- Also make Soul Guitar-specific fields optional for future events
ALTER TABLE "event_registrations"
  ADD COLUMN "answers" JSONB,
  ALTER COLUMN "socialId"  DROP NOT NULL,
  ALTER COLUMN "category"  DROP NOT NULL,
  ALTER COLUMN "soulColor" DROP NOT NULL,
  ALTER COLUMN "youtube"   DROP NOT NULL,
  ALTER COLUMN "fbIg"      DROP NOT NULL;
