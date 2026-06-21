/*
# Create consultation_requests table for inter-staff consultation requests

1. New Tables
- `consultation_requests`
  - `id` (uuid, primary key) — auto-generated unique identifier
  - `requester_name` (text, not null) — name of staff requesting
  - `requester_role` (text) — role of requester
  - `patient_name` (text, not null) — patient name
  - `patient_mr` (text, not null) — patient medical record number
  - `doctor_id` (uuid, not null) — references doctor_schedules
  - `doctor_name` (text) — doctor name for display
  - `specialty` (text) — doctor specialty
  - `session` (text) — session 1 or 2
  - `status` (text, default 'pending') — pending, approved, rejected
  - `note` (text) — additional notes
  - `created_at` (timestamptz) — creation timestamp
  - `updated_at` (timestamptz) — update timestamp

2. Security
- Enable RLS on `consultation_requests`.
- Allow anon and authenticated users to perform CRUD.
*/

CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  requester_role text,
  patient_name text NOT NULL,
  patient_mr text NOT NULL,
  doctor_id uuid NOT NULL,
  doctor_name text,
  specialty text,
  session text,
  status text DEFAULT 'pending',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_consultation_requests" ON consultation_requests;
CREATE POLICY "anon_select_consultation_requests" ON consultation_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_consultation_requests" ON consultation_requests;
CREATE POLICY "anon_insert_consultation_requests" ON consultation_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_consultation_requests" ON consultation_requests;
CREATE POLICY "anon_update_consultation_requests" ON consultation_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_consultation_requests" ON consultation_requests;
CREATE POLICY "anon_delete_consultation_requests" ON consultation_requests FOR DELETE
  TO anon, authenticated USING (true);
