/*
# Update staff_messages table and create staff_presence table
*/

-- Add recipient_id and is_read to staff_messages for private messaging and notifications
ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS recipient_id uuid;
ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS is_broadcast boolean DEFAULT true;

-- Create staff_presence table for online tracking
CREATE TABLE IF NOT EXISTS staff_presence (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  name text,
  role text,
  photo text,
  is_online boolean DEFAULT true,
  last_seen timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff_presence ENABLE ROW LEVEL SECURITY;

-- Drop any old policies
DROP POLICY IF EXISTS "anon_select_staff_presence" ON staff_presence;
DROP POLICY IF EXISTS "anon_insert_staff_presence" ON staff_presence;
DROP POLICY IF EXISTS "anon_update_staff_presence" ON staff_presence;
DROP POLICY IF EXISTS "anon_delete_staff_presence" ON staff_presence;

-- Create authenticated policies
CREATE POLICY "authenticated_select_staff_presence" ON staff_presence FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_staff_presence" ON staff_presence FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_staff_presence" ON staff_presence FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_staff_presence" ON staff_presence FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);
