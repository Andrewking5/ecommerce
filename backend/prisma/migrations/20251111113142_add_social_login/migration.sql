-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'APPLE', 'FACEBOOK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "provider" "AuthProvider" DEFAULT 'EMAIL',
ADD COLUMN     "providerData" JSONB,
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_provider_providerId_idx" ON "users"("provider", "providerId");
