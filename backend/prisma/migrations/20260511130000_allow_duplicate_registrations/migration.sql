-- 移除 (eventId, email) 唯一限制，允許同 email 在同一場活動內報名多次
-- 重複報名改由後台人工處理（依規則「每人每組限參加一次」自行剔除）
ALTER TABLE "event_registrations"
  DROP CONSTRAINT IF EXISTS "event_registrations_eventId_email_key";

-- 改成一般索引以維持查詢效能（替代原本唯一索引隱含的索引）
CREATE INDEX IF NOT EXISTS "event_registrations_eventId_email_idx"
  ON "event_registrations" ("eventId", email);
