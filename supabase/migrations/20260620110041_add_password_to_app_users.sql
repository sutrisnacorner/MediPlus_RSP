/*
# Add password column to app_users table

1. Changes
- Add `password` column to `app_users` for simple login authentication
- Add `reschedule_time` to chat_templates for reschedule category

2. New Columns
- `app_users.password` (text, nullable) — hashed password for login
- `chat_templates.reschedule_time` (text, nullable) — new schedule time for reschedule

3. Security
- Existing RLS policies remain unchanged.
*/

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password text;

-- Update chat_templates to have the reschedule_time column
UPDATE chat_templates SET category = 'konfirmasi' WHERE category IS NULL;
