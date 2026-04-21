-- ============================================================================
-- EMERGENCY FIX: Allow Super Admin to Update Permissions
-- ============================================================================
-- This fixes the "Failed to update permissions" issue immediately
-- Run this in your Supabase SQL Editor RIGHT NOW
-- ============================================================================

-- OPTION 1: Drop and recreate the policy with email-based lookup
-- This works even if there's an ID mismatch

DROP POLICY IF EXISTS "Super admins can manage all permissions" ON admin_permissions;

CREATE POLICY "Super admins can manage all permissions"
  ON admin_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN auth.users au ON u.email = au.email
      WHERE au.id = auth.uid()
      AND u.role = 'super_admin'
    )
  );

-- OPTION 2: If Option 1 doesn't work, temporarily disable RLS for testing
-- Uncomment these lines ONLY if Option 1 fails:

-- ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION: Check if the Super Admin can now access
-- ============================================================================

-- Run this to verify the Super Admin exists and should have access:
SELECT 
  u.id as users_id,
  u.email,
  u.role,
  au.id as auth_id,
  CASE 
    WHEN u.role = 'super_admin' THEN '✅ Should have access'
    ELSE '❌ Not super admin'
  END as access_status
FROM users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'superadmin@spartk.test';