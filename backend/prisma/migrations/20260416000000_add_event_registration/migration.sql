-- Add registration settings to events table
ALTER TABLE "events"
  ADD COLUMN IF NOT EXISTS "registrationOpen"  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "registrationLimit" INTEGER NOT NULL DEFAULT 200;

-- CreateTable: event_registrations
CREATE TABLE IF NOT EXISTS "event_registrations" (
    "id"         TEXT NOT NULL,
    "eventId"    TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "stageName"  TEXT,
    "phone"      TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "socialId"   TEXT NOT NULL,
    "category"   TEXT NOT NULL,
    "soulColor"  TEXT NOT NULL,
    "youtube"    TEXT NOT NULL,
    "fbIg"       TEXT NOT NULL,
    "rulesOk"    BOOLEAN NOT NULL DEFAULT false,
    "message"    TEXT,
    "ip"         TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_registrations_eventId_idx"  ON "event_registrations"("eventId");
CREATE INDEX IF NOT EXISTS "event_registrations_email_idx"    ON "event_registrations"("email");
CREATE INDEX IF NOT EXISTS "event_registrations_createdAt_idx" ON "event_registrations"("createdAt");

-- AddForeignKey
ALTER TABLE "event_registrations" DROP CONSTRAINT IF EXISTS "event_registrations_eventId_fkey";
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
