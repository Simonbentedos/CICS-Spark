-- =============================================================================
-- SPARK — RLS Policies + Account Activation Trigger
-- =============================================================================
-- HOW TO RUN:
--   1. Open the Supabase project dashboard → SQL Editor
--   2. Paste this entire file and click Run.
--   3. Run it once. All statements are idempotent (DROP IF EXISTS / OR REPLACE).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- SECTION 1: Account-activation trigger
-- Fires when Supabase Auth sets email_confirmed_at (NULL → timestamp).
-- Sets is_active = TRUE on public.users for invite-based accounts.
-- NOTE: Dummy MVP accounts are seeded with is_active = TRUE already, so this
--       trigger is only needed for the real invite flow.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.activate_user_on_email_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users
    SET is_active = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_user_on_email_confirm();


-- -----------------------------------------------------------------------------
-- SECTION 2: Enable RLS on all tables
-- -----------------------------------------------------------------------------

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulltext_requests  ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- SECTION 3: public.documents
--
-- Anonymous (guest) visitors can SELECT approved documents only.
-- The backend uses the service-role key, which bypasses RLS entirely, so
-- no authenticated-user policies are needed here — the backend handles all
-- writes and privileged reads.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "guests can read approved documents" ON public.documents;

CREATE POLICY "guests can read approved documents"
  ON public.documents
  FOR SELECT
  TO anon
  USING (status = 'approved');


-- Allow authenticated users (students/admins via the backend JWT) to also
-- read approved documents (e.g. for the public browse pages when logged in).
DROP POLICY IF EXISTS "authenticated users can read approved documents" ON public.documents;

CREATE POLICY "authenticated users can read approved documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (status = 'approved');


-- -----------------------------------------------------------------------------
-- SECTION 4: public.users
--
-- Authenticated users can read their own row (e.g. /me endpoint, profile UI).
-- All writes go through the backend service-role key (bypasses RLS).
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "users can read own row" ON public.users;

CREATE POLICY "users can read own row"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());


-- -----------------------------------------------------------------------------
-- SECTION 5: public.notifications
--
-- Users can read and update (mark read) their own notifications.
-- Inserts are done by the backend via service-role key.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "users can update own notifications" ON public.notifications;

CREATE POLICY "users can read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- -----------------------------------------------------------------------------
-- SECTION 6: public.fulltext_requests
--
-- Anyone (including anonymous guests) can INSERT a full-text request.
-- All other operations (SELECT, UPDATE) are done by the backend via
-- service-role key, which bypasses RLS.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "anyone can submit fulltext request" ON public.fulltext_requests;

CREATE POLICY "anyone can submit fulltext request"
  ON public.fulltext_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- SECTION 7: public.reviews
--
-- Read-only for authenticated users (students see review feedback via the
-- backend's documents endpoint which includes reviews).
-- Inserts are done by the backend via service-role key.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "authenticated users can read reviews" ON public.reviews;

CREATE POLICY "authenticated users can read reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);


-- -----------------------------------------------------------------------------
-- SECTION 8: Storage — documents bucket
--
-- Uploads and downloads are performed by the backend using the service-role key.
-- No direct browser access to the private bucket is permitted.
-- The policy below is a safety net; actual enforcement is via the backend.
-- -----------------------------------------------------------------------------

-- Allow the service role to manage all objects (already true by default,
-- included here for documentation purposes — no-op if it already exists).
-- No public read policy is created; the bucket is private.
