/*
# Create doctor_schedules table

1. New Tables
- `doctor_schedules`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `name` (text, not null) — doctor name
  - `specialty` (text, not null) — specialty/department
  - `session_1` (text) — morning session time
  - `session_2` (text) — afternoon session time
  - `room` (text) — room number
  - `is_on_leave` (boolean, default false) — whether doctor is on leave
  - `leave_note` (text) — leave note/reason
  - `is_active` (boolean, default true) — whether doctor is active
  - `created_at` (timestamptz) — creation timestamp
  - `updated_at` (timestamptz) — last update timestamp

2. Security
- Enable RLS on `doctor_schedules`.
- Allow anon and authenticated users to perform CRUD.
*/

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  session_1 text,
  session_2 text,
  room text,
  is_on_leave boolean NOT NULL DEFAULT false,
  leave_note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctor_schedules" ON doctor_schedules;
CREATE POLICY "anon_select_doctor_schedules" ON doctor_schedules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctor_schedules" ON doctor_schedules;
CREATE POLICY "anon_insert_doctor_schedules" ON doctor_schedules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctor_schedules" ON doctor_schedules;
CREATE POLICY "anon_update_doctor_schedules" ON doctor_schedules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctor_schedules" ON doctor_schedules;
CREATE POLICY "anon_delete_doctor_schedules" ON doctor_schedules FOR DELETE
  TO anon, authenticated USING (true);
