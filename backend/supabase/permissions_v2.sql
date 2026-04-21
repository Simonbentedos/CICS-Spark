-- ============================================================================
-- ADMIN PERMISSIONS TABLE V2 - WIDE FORMAT (ONE ROW PER USER)
-- ============================================================================
-- This version uses a wide format where each permission is a column
-- Much more efficient than the previous long format (one row per permission)
-- ============================================================================

-- Drop old table if exists (CAUTION: This will delete existing permissions!)
-- Comment out these lines if you want to migrate data instead of starting fresh
DROP TABLE IF EXISTS admin_permissions CASCADE;

-- Create new admin_permissions table with wide format
CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Submission Management Permissions
  submissions_view BOOLEAN DEFAULT true,
  submissions_review BOOLEAN DEFAULT true,
  submissions_delete BOOLEAN DEFAULT false,
  
  -- User Management Permissions
  users_view BOOLEAN DEFAULT true,
  users_create BOOLEAN DEFAULT true,
  
  -- Reports & Analytics Permissions
  reports_view BOOLEAN DEFAULT true,
  reports_export BOOLEAN DEFAULT false,
  
  -- System Administration Permissions
  fulltext_manage BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user_id is unique (one row per user)
  CONSTRAINT unique_user_permissions UNIQUE(user_id)
);

-- Create index for faster lookups by user_id
CREATE INDEX idx_admin_permissions_user_id_v2 ON admin_permissions(user_id);

-- Enable Row Level Security
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can manage all permissions
CREATE POLICY "Super admins can manage all permissions"
  ON admin_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Policy: Admins can view their own permissions
CREATE POLICY "Admins can view their own permissions"
  ON admin_permissions
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Drop old function if exists
DROP FUNCTION IF EXISTS has_permission(uuid, character varying);
DROP FUNCTION IF EXISTS has_permission(uuid, varchar);

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(
  check_user_id UUID, 
  permission_name VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Map permission names to column names
  CASE permission_name
    WHEN 'submissions.view' THEN
      SELECT submissions_view INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'submissions.review' THEN
      SELECT submissions_review INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'submissions.delete' THEN
      SELECT submissions_delete INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'users.view' THEN
      SELECT users_view INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'users.create' THEN
      SELECT users_create INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'reports.view' THEN
      SELECT reports_view INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'reports.export' THEN
      SELECT reports_export INTO result FROM admin_permissions WHERE user_id = check_user_id;
    WHEN 'fulltext.manage' THEN
      SELECT fulltext_manage INTO result FROM admin_permissions WHERE user_id = check_user_id;
    ELSE
      result := false;
  END CASE;
  
  RETURN COALESCE(result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-create permissions for new admins
-- ============================================================================

CREATE OR REPLACE FUNCTION grant_default_admin_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create permissions for regular admins (not super_admin)
  IF NEW.role = 'admin' THEN
    INSERT INTO admin_permissions (
      user_id,
      submissions_view,
      submissions_review,
      submissions_delete,
      users_view,
      users_create,
      reports_view,
      reports_export,
      fulltext_manage
    )
    VALUES (
      NEW.id,
      true,   -- submissions_view
      true,   -- submissions_review
      false,  -- submissions_delete
      true,   -- users_view
      false,  -- users_create
      true,   -- reports_view
      true,   -- reports_export
      true    -- fulltext_manage
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_grant_default_permissions ON users;

-- Create trigger for new admin accounts
CREATE TRIGGER trigger_grant_default_permissions
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION grant_default_admin_permissions();

-- ============================================================================
-- INITIALIZE: Grant default permissions to existing admins
-- ============================================================================

INSERT INTO admin_permissions (
  user_id,
  submissions_view,
  submissions_review,
  submissions_delete,
  users_view,
  users_create,
  reports_view,
  reports_export,
  fulltext_manage
)
SELECT 
  u.id,
  true,   -- submissions_view
  true,   -- submissions_review
  false,  -- submissions_delete
  true,   -- users_view
  false,  -- users_create
  true,   -- reports_view
  true,   -- reports_export
  true    -- fulltext_manage
FROM users u
WHERE u.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the migration)
-- ============================================================================

-- View all admin permissions
-- SELECT 
--   u.email,
--   u.department,
--   ap.submissions_view,
--   ap.submissions_review,
--   ap.users_view,
--   ap.users_create,
--   ap.reports_view,
--   ap.fulltext_manage
-- FROM admin_permissions ap
-- JOIN users u ON u.id = ap.user_id
-- ORDER BY u.email;

-- Count total rows (should equal number of admins)
-- SELECT COUNT(*) as total_permission_rows FROM admin_permissions;

-- Compare with old format (would have been 10x more rows)
-- SELECT COUNT(*) * 10 as old_format_would_have_been FROM admin_permissions;
