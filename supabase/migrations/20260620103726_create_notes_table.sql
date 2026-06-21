/*
# Create notes table

1. New Tables
- `notes`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `title` (text, not null) — note title
  - `content` (text, not null) — note content
  - `color` (text, default 'white') — background color for visual note styling
  - `created_at` (timestamptz) — creation timestamp
  - `updated_at` (timestamptz) — last update timestamp

2. Security
- Enable RLS on `notes`.
- Allow anon and authenticated users to perform CRUD since this is a single-tenant app without explicit auth requirement.
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  color text NOT NULL DEFAULT 'white',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notes" ON notes;
CREATE POLICY "anon_select_notes" ON notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notes" ON notes;
CREATE POLICY "anon_insert_notes" ON notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notes" ON notes;
CREATE POLICY "anon_update_notes" ON notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notes" ON notes;
CREATE POLICY "anon_delete_notes" ON notes FOR DELETE
  TO anon, authenticated USING (true);
