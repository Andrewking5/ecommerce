-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: events
CREATE TABLE IF NOT EXISTS "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "referralCode" TEXT NOT NULL,
    "landingUrl" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT DEFAULT 'qrcode',
    "utmCampaign" TEXT,
    "couponCode" TEXT,
    "discountNote" TEXT,
    "totalScans" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: event_clicks
CREATE TABLE IF NOT EXISTS "event_clicks" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_key" ON "events"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "events_referralCode_key" ON "events"("referralCode");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status");
CREATE INDEX IF NOT EXISTS "events_isActive_idx" ON "events"("isActive");
CREATE INDEX IF NOT EXISTS "events_startDate_endDate_idx" ON "events"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "events_referralCode_idx" ON "events"("referralCode");
CREATE INDEX IF NOT EXISTS "events_slug_idx" ON "events"("slug");

CREATE INDEX IF NOT EXISTS "event_clicks_eventId_idx" ON "event_clicks"("eventId");
CREATE INDEX IF NOT EXISTS "event_clicks_createdAt_idx" ON "event_clicks"("createdAt");
CREATE INDEX IF NOT EXISTS "event_clicks_eventId_createdAt_idx" ON "event_clicks"("eventId", "createdAt");

-- AddForeignKey
ALTER TABLE "event_clicks" DROP CONSTRAINT IF EXISTS "event_clicks_eventId_fkey";
ALTER TABLE "event_clicks" ADD CONSTRAINT "event_clicks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
