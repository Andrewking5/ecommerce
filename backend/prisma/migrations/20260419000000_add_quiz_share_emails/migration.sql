-- CreateTable
CREATE TABLE "quiz_share_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resultKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_share_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_share_emails_email_slug_key" ON "quiz_share_emails"("email", "slug");

-- CreateIndex
CREATE INDEX "quiz_share_emails_slug_idx" ON "quiz_share_emails"("slug");

-- CreateIndex
CREATE INDEX "quiz_share_emails_createdAt_idx" ON "quiz_share_emails"("createdAt");
