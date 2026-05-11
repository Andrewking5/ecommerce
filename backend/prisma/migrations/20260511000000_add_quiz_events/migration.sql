-- CreateTable
CREATE TABLE "quiz_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "slug" TEXT,
    "visitorId" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_events_type_idx" ON "quiz_events"("type");

-- CreateIndex
CREATE INDEX "quiz_events_slug_idx" ON "quiz_events"("slug");

-- CreateIndex
CREATE INDEX "quiz_events_createdAt_idx" ON "quiz_events"("createdAt");

-- CreateIndex
CREATE INDEX "quiz_events_visitorId_idx" ON "quiz_events"("visitorId");
