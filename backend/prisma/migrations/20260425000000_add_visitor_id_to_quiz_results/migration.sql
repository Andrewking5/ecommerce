-- AlterTable: add visitorId to quiz_results for unique visitor deduplication
ALTER TABLE "quiz_results"
  ADD COLUMN "visitorId" TEXT;

CREATE INDEX "quiz_results_visitorId_idx" ON "quiz_results"("visitorId");
