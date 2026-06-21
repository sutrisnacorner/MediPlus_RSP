/*
# Create users and chat_templates tables

1. New Tables
- `app_users`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `name` (text, not null) — full name of the user
  - `email` (text, unique, not null) — email address
  - `role` (text, not null, default 'staff') — role: super_admin, admin, staff
  - `phone` (text) — WhatsApp phone number
  - `is_active` (boolean, default true) — whether the user account is active
  - `created_at` (timestamptz) — creation timestamp
  - `updated_at` (timestamptz) — last update timestamp

- `chat_templates`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `name` (text, not null) — template display name
  - `content` (text, not null) — template body with placeholders like {{nama_pasien}}, {{nama_dokter}}, {{nama_petugas}}
  - `is_active` (boolean, default true) — whether the template is active
  - `created_at` (timestamptz) — creation timestamp
  - `updated_at` (timestamptz) — last update timestamp

2. Security
- Enable RLS on both tables.
- Allow anon and authenticated users to perform CRUD since this is a single-tenant app without explicit auth requirement.
*/

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

-- app_users policies
DROP POLICY IF EXISTS "anon_select_app_users" ON app_users;
CREATE POLICY "anon_select_app_users" ON app_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_users" ON app_users;
CREATE POLICY "anon_insert_app_users" ON app_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_users" ON app_users;
CREATE POLICY "anon_update_app_users" ON app_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_users" ON app_users;
CREATE POLICY "anon_delete_app_users" ON app_users FOR DELETE
  TO anon, authenticated USING (true);

-- chat_templates policies
DROP POLICY IF EXISTS "anon_select_chat_templates" ON chat_templates;
CREATE POLICY "anon_select_chat_templates" ON chat_templates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_templates" ON chat_templates;
CREATE POLICY "anon_insert_chat_templates" ON chat_templates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_templates" ON chat_templates;
CREATE POLICY "anon_update_chat_templates" ON chat_templates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_templates" ON chat_templates;
CREATE POLICY "anon_delete_chat_templates" ON chat_templates FOR DELETE
  TO anon, authenticated USING (true);
