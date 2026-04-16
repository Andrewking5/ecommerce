-- CreateTable: quiz_layouts
-- 純新增表，儲存每個角色結果頁的版面設定
CREATE TABLE IF NOT EXISTS "quiz_layouts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_layouts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "quiz_layouts_slug_key" ON "quiz_layouts"("slug");
