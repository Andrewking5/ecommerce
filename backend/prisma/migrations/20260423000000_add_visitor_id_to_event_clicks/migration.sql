-- AlterTable: add visitorId to event_clicks for accurate unique visitor tracking
ALTER TABLE "event_clicks"
  ADD COLUMN "visitorId" TEXT;

CREATE INDEX "event_clicks_eventId_visitorId_idx" ON "event_clicks"("eventId", "visitorId");
