-- ============================================================================
-- PROPER FIX: Sync IDs between auth.users and users table
-- ============================================================================
-- This fixes the ID mismatch so the system works properly with role-based auth
-- ============================================================================

-- Step 1: Check current state
SELECT 
  'BEFORE FIX' as status,
  au.id as auth_id,
  u.id as users_id,
  u.email,
  u.role,
  CASE 
    WHEN au.id = u.id THEN 'MATCH ✅'
    ELSE 'MISMATCH ❌'
  END as id_status
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
WHERE u.role = 'super_admin';

-- Step 2: Fix the ID mismatch for ALL users (not just super_admin)
DO $$
DECLARE
  user_record RECORD;
  auth_user_id UUID;
BEGIN
  -- Loop through all users in the users table
  FOR user_record IN 
    SELECT id, email FROM users 
  LOOP
    -- Get the corresponding auth.users ID
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_record.email;
    
    -- If we found a matching auth user and IDs don't match, update it
    IF auth_user_id IS NOT NULL AND auth_user_id != user_record.id THEN
      -- Update admin_permissions first (if any exist)
      UPDATE admin_permissions 
      SET user_id = auth_user_id 
      WHERE user_id = user_record.id;
      
      -- Update the users table ID to match auth ID
      UPDATE users 
      SET id = auth_user_id 
      WHERE email = user_record.email;
      
      RAISE NOTICE 'Fixed ID for %: % -> %', user_record.email, user_record.id, auth_user_id;
    END IF;
  END LOOP;
END $$;

-- Step 3: Verify the fix
SELECT 
  'AFTER FIX' as status,
  au.id as auth_id,
  u.id as users_id,
  u.email,
  u.role,
  CASE 
    WHEN au.id = u.id THEN 'FIXED ✅'
    ELSE 'STILL BROKEN ❌'
  END as id_status
FROM auth.users au
JOIN users u ON au.email = u.email
WHERE u.role = 'super_admin';

-- Step 4: Re-enable RLS with the original policy
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Recreate the original RLS policy
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON admin_permissions;

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