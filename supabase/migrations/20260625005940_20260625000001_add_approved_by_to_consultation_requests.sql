/*
# Add approved_by_name to consultation_requests

1. Modified Tables
- `consultation_requests`: Added `approved_by_name` column to track who approved each request

2. Security
- No new RLS policies needed — column is informational only
*/

ALTER TABLE consultation_requests
ADD COLUMN IF NOT EXISTS approved_by_name text;