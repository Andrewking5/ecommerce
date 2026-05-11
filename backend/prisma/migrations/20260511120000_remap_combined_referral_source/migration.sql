-- Data migration: 把舊的合併版「Ayers 官方社群平台（IG / FB）」報名來源
-- 全部歸到「Ayers 官網」（之後 IG / FB 會在表單上分開）。
UPDATE "event_registrations"
SET "answers" = jsonb_set("answers", '{得知管道}', '"Ayers 官網"'::jsonb)
WHERE "answers" IS NOT NULL
  AND "answers"->>'得知管道' = 'Ayers 官方社群平台（IG / FB）';
