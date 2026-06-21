/*
# Create patients table

1. New Tables
- `patients`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `mr_no` (text, not null) — medical record number
  - `name` (text, not null) — patient name
  - `phone` (text, not null) — WhatsApp phone number
  - `status` (text, default 'menunggu') — patient status: menunggu, jadi_datang, batal, reschedule, belum_jawab
  - `doctor_name` (text) — doctor name
  - `specialty` (text) — specialty/department
  - `appointment_time` (text) — appointment time
  - `appointment_date` (text) — appointment date
  - `created_at` (timestamptz) — creation timestamp
  - `updated_at` (timestamptz) — last update timestamp

2. Security
- Enable RLS on `patients`.
- Allow anon and authenticated users to perform CRUD.
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mr_no text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'menunggu',
  doctor_name text,
  specialty text,
  appointment_time text,
  appointment_date text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_patients" ON patients;
CREATE POLICY "anon_select_patients" ON patients FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
CREATE POLICY "anon_insert_patients" ON patients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_patients" ON patients;
CREATE POLICY "anon_update_patients" ON patients FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_patients" ON patients;
CREATE POLICY "anon_delete_patients" ON patients FOR DELETE
  TO anon, authenticated USING (true);
