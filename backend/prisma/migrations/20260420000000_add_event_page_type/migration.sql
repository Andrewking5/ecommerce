-- CreateEnum
CREATE TYPE "EventPageType" AS ENUM ('MAIN', 'INFO', 'REGISTER', 'QUIZ', 'LANDING', 'OTHER');

-- AlterTable
ALTER TABLE "events" ADD COLUMN "eventType" "EventPageType" NOT NULL DEFAULT 'OTHER';

-- Backfill existing soul-guitar events
UPDATE "events" SET "eventType" = 'QUIZ'     WHERE slug = 'soul-guitar';
UPDATE "events" SET "eventType" = 'INFO'     WHERE slug = 'soul-guitar/info';
UPDATE "events" SET "eventType" = 'REGISTER' WHERE slug = 'soul-guitar/register';
