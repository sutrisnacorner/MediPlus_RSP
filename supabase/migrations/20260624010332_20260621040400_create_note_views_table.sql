/*
# Create note_views table to track who viewed notes
*/

CREATE TABLE IF NOT EXISTS note_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_note_views_note_user ON note_views(note_id, user_id);
CREATE INDEX idx_note_views_note_id ON note_views(note_id);

ALTER TABLE note_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_note_views" ON note_views;
DROP POLICY IF EXISTS "anon_insert_note_views" ON note_views;
DROP POLICY IF EXISTS "anon_update_note_views" ON note_views;
DROP POLICY IF EXISTS "anon_delete_note_views" ON note_views;

CREATE POLICY "authenticated_select_note_views" ON note_views FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_insert_note_views" ON note_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_update_note_views" ON note_views FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_delete_note_views" ON note_views FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);
