-- CreateTable
CREATE TABLE "memorial_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "attending" BOOLEAN,
    "headcount" INTEGER,
    "giftAmount" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memorial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorial_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorial_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memorial_entries_createdAt_idx" ON "memorial_entries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "memorial_config_key_key" ON "memorial_config"("key");
