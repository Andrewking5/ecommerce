-- 修正：上一次把舊「Ayers 官網」紀錄改成「其他」是搞錯了，
-- 應該歸到「Ayers 官方社群平台」。把純「其他」（不含「其他：xxx」自由填寫）
-- 整批改名，使其在後台長條圖顯示為「Ayers 官方社群平台」。
UPDATE "event_registrations"
SET "answers" = jsonb_set("answers", '{得知管道}', '"Ayers 官方社群平台"'::jsonb)
WHERE "answers" IS NOT NULL
  AND "answers"->>'得知管道' = '其他';
