/*
# Create doctor_leaves table for flexible leave scheduling

1. New Tables
- `doctor_leaves`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `doctor_id` (uuid, not null) — references doctor_schedules
  - `doctor_name` (text) — doctor name for display
  - `start_date` (date, not null) — leave start date
  - `end_date` (date, not null) — leave end date
  - `note` (text) — leave reason/note
  - `created_at` (timestamptz) — creation timestamp

2. Security
- Enable RLS on `doctor_leaves`.
- Allow anon and authenticated users to perform CRUD.
*/

CREATE TABLE IF NOT EXISTS doctor_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  doctor_name text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_leaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctor_leaves" ON doctor_leaves;
CREATE POLICY "anon_select_doctor_leaves" ON doctor_leaves FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctor_leaves" ON doctor_leaves;
CREATE POLICY "anon_insert_doctor_leaves" ON doctor_leaves FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctor_leaves" ON doctor_leaves;
CREATE POLICY "anon_update_doctor_leaves" ON doctor_leaves FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctor_leaves" ON doctor_leaves;
CREATE POLICY "anon_delete_doctor_leaves" ON doctor_leaves FOR DELETE
  TO anon, authenticated USING (true);
