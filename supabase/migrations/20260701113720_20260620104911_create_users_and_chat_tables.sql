CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_app_users" ON app_users FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_app_users" ON app_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_app_users" ON app_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_app_users" ON app_users FOR DELETE
  TO anon, authenticated USING (true);

CREATE POLICY "anon_select_chat_templates" ON chat_templates FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_chat_templates" ON chat_templates FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_chat_templates" ON chat_templates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_chat_templates" ON chat_templates FOR DELETE
  TO anon, authenticated USING (true);