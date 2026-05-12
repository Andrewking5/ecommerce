-- 「Ayers 官網」選項從表單移除。把既有紀錄改成「其他」，
-- 避免長條圖繼續出現該分類。
UPDATE "event_registrations"
SET "answers" = jsonb_set("answers", '{得知管道}', '"其他"'::jsonb)
WHERE "answers" IS NOT NULL
  AND "answers"->>'得知管道' = 'Ayers 官網';
