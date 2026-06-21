/*
# Add photo column to app_users table

1. Changes
- Add `photo` column to `app_users` for profile photo URL

2. New Columns
- `app_users.photo` (text, nullable) — URL to profile photo

3. Security
- Existing RLS policies remain unchanged.
*/

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS photo text;
