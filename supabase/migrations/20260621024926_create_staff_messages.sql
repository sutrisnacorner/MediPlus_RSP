/*
# Create staff_messages table for inter-staff communication

1. New Tables
- `staff_messages`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `sender_id` (uuid, not null) — references app_users
  - `sender_name` (text, not null) — sender name for display
  - `content` (text, not null) — message content
  - `created_at` (timestamptz) — creation timestamp

2. Security
- Enable RLS on `staff_messages`.
- Allow anon and authenticated users to perform CRUD.
*/

CREATE TABLE IF NOT EXISTS staff_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  sender_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff_messages" ON staff_messages;
CREATE POLICY "anon_select_staff_messages" ON staff_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff_messages" ON staff_messages;
CREATE POLICY "anon_insert_staff_messages" ON staff_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff_messages" ON staff_messages;
CREATE POLICY "anon_update_staff_messages" ON staff_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff_messages" ON staff_messages;
CREATE POLICY "anon_delete_staff_messages" ON staff_messages FOR DELETE
  TO anon, authenticated USING (true);
