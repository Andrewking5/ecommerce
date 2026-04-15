-- CreateTable: quiz_results
-- 純新增表，不修改任何現有資料或欄位
CREATE TABLE IF NOT EXISTS "quiz_results" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resultKey" TEXT NOT NULL,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "quiz_results_slug_idx" ON "quiz_results"("slug");
CREATE INDEX IF NOT EXISTS "quiz_results_resultKey_idx" ON "quiz_results"("resultKey");
CREATE INDEX IF NOT EXISTS "quiz_results_createdAt_idx" ON "quiz_results"("createdAt");
