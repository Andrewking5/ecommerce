-- Remove duplicate registrations, keeping the earliest per (eventId, email)
DELETE FROM "event_registrations"
WHERE id NOT IN (
  SELECT DISTINCT ON ("eventId", email) id
  FROM "event_registrations"
  ORDER BY "eventId", email, "createdAt" ASC
);

-- Add unique constraint: one registration per email per event
ALTER TABLE "event_registrations"
  ADD CONSTRAINT "event_registrations_eventId_email_key" UNIQUE ("eventId", email);
