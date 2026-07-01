ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS photo text;