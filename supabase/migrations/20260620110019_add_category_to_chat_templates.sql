/*
# Add category to chat_templates table

1. Changes
- Add `category` column to `chat_templates` table with values: 'konfirmasi', 'batal_praktek', 'reschedule'
- Add `reschedule_time` column for reschedule templates to capture the new time slot

2. New Columns
- `category` (text, default 'konfirmasi') — groups templates by type
- `reschedule_time` (text, nullable) — for reschedule templates, stores the new schedule time

3. Security
- Existing RLS policies remain unchanged.
*/

ALTER TABLE chat_templates ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'konfirmasi';
ALTER TABLE chat_templates ADD COLUMN IF NOT EXISTS reschedule_time text;

UPDATE chat_templates SET category = 'konfirmasi' WHERE category IS NULL;
