/*
# Fix RLS Security: Replace always-true policies with authenticated-only policies

1. Add user_id/auth_id columns to all tables for proper auth tracking
2. Create authenticate_user RPC function for login (bypasses RLS)
3. Drop all old anon/always-true policies
4. Create new authenticated-only policies using auth.uid() IS NOT NULL
*/

-- Add auth_id to app_users to link with Supabase Auth
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS auth_id uuid;

-- Add user_id to all tables for ownership tracking
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE chat_templates ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE doctor_schedules ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE doctor_leaves ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS user_id uuid;

-- Create authentication function (bypasses RLS for login check)
CREATE OR REPLACE FUNCTION public.authenticate_user(email_input text, password_input text)
RETURNS TABLE (
  id uuid, name text, email text, role text, phone text,
  photo text, is_active boolean, created_at timestamptz, updated_at timestamptz
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.role, u.phone, u.photo, u.is_active, u.created_at, u.updated_at
  FROM public.app_users u
  WHERE u.email = email_input AND u.password = password_input AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO authenticated;

-- Drop all old policies
DROP POLICY IF EXISTS "anon_select_app_users" ON app_users;
DROP POLICY IF EXISTS "anon_insert_app_users" ON app_users;
DROP POLICY IF EXISTS "anon_update_app_users" ON app_users;
DROP POLICY IF EXISTS "anon_delete_app_users" ON app_users;
DROP POLICY IF EXISTS "anon_select_notes" ON notes;
DROP POLICY IF EXISTS "anon_insert_notes" ON notes;
DROP POLICY IF EXISTS "anon_update_notes" ON notes;
DROP POLICY IF EXISTS "anon_delete_notes" ON notes;
DROP POLICY IF EXISTS "anon_select_chat_templates" ON chat_templates;
DROP POLICY IF EXISTS "anon_insert_chat_templates" ON chat_templates;
DROP POLICY IF EXISTS "anon_update_chat_templates" ON chat_templates;
DROP POLICY IF EXISTS "anon_delete_chat_templates" ON chat_templates;
DROP POLICY IF EXISTS "anon_select_patients" ON patients;
DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
DROP POLICY IF EXISTS "anon_update_patients" ON patients;
DROP POLICY IF EXISTS "anon_delete_patients" ON patients;
DROP POLICY IF EXISTS "anon_select_doctor_schedules" ON doctor_schedules;
DROP POLICY IF EXISTS "anon_insert_doctor_schedules" ON doctor_schedules;
DROP POLICY IF EXISTS "anon_update_doctor_schedules" ON doctor_schedules;
DROP POLICY IF EXISTS "anon_delete_doctor_schedules" ON doctor_schedules;
DROP POLICY IF EXISTS "anon_select_doctor_leaves" ON doctor_leaves;
DROP POLICY IF EXISTS "anon_insert_doctor_leaves" ON doctor_leaves;
DROP POLICY IF EXISTS "anon_update_doctor_leaves" ON doctor_leaves;
DROP POLICY IF EXISTS "anon_delete_doctor_leaves" ON doctor_leaves;
DROP POLICY IF EXISTS "anon_select_staff_messages" ON staff_messages;
DROP POLICY IF EXISTS "anon_insert_staff_messages" ON staff_messages;
DROP POLICY IF EXISTS "anon_update_staff_messages" ON staff_messages;
DROP POLICY IF EXISTS "anon_delete_staff_messages" ON staff_messages;
DROP POLICY IF EXISTS "anon_select_consultation_requests" ON consultation_requests;
DROP POLICY IF EXISTS "anon_insert_consultation_requests" ON consultation_requests;
DROP POLICY IF EXISTS "anon_update_consultation_requests" ON consultation_requests;
DROP POLICY IF EXISTS "anon_delete_consultation_requests" ON consultation_requests;

-- app_users policies
CREATE POLICY "authenticated_select_app_users" ON app_users FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_app_users" ON app_users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_app_users" ON app_users FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_app_users" ON app_users FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- notes policies
CREATE POLICY "authenticated_select_notes" ON notes FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_notes" ON notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_notes" ON notes FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_notes" ON notes FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- chat_templates policies
CREATE POLICY "authenticated_select_chat_templates" ON chat_templates FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_chat_templates" ON chat_templates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_chat_templates" ON chat_templates FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_chat_templates" ON chat_templates FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- patients policies
CREATE POLICY "authenticated_select_patients" ON patients FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_patients" ON patients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_patients" ON patients FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_patients" ON patients FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- doctor_schedules policies
CREATE POLICY "authenticated_select_doctor_schedules" ON doctor_schedules FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_doctor_schedules" ON doctor_schedules FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_doctor_schedules" ON doctor_schedules FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_doctor_schedules" ON doctor_schedules FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- doctor_leaves policies
CREATE POLICY "authenticated_select_doctor_leaves" ON doctor_leaves FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_doctor_leaves" ON doctor_leaves FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_doctor_leaves" ON doctor_leaves FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_doctor_leaves" ON doctor_leaves FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- staff_messages policies
CREATE POLICY "authenticated_select_staff_messages" ON staff_messages FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_staff_messages" ON staff_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_staff_messages" ON staff_messages FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_staff_messages" ON staff_messages FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- consultation_requests policies
CREATE POLICY "authenticated_select_consultation_requests" ON consultation_requests FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_consultation_requests" ON consultation_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_consultation_requests" ON consultation_requests FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_consultation_requests" ON consultation_requests FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);
