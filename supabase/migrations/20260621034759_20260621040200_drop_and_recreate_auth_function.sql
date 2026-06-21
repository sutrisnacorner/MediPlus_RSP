/*
# Drop and recreate authenticate_user function with auth_id
*/

DROP FUNCTION IF EXISTS public.authenticate_user(text, text);

CREATE OR REPLACE FUNCTION public.authenticate_user(email_input text, password_input text)
RETURNS TABLE (
  id uuid, name text, email text, role text, phone text,
  photo text, is_active boolean, auth_id uuid, created_at timestamptz, updated_at timestamptz
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.role, u.phone, u.photo, u.is_active, u.auth_id, u.created_at, u.updated_at
  FROM public.app_users u
  WHERE u.email = email_input AND u.password = password_input AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO authenticated;
