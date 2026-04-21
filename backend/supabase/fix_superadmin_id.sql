-- ============================================================================
-- DIAGNOSE AND FIX SUPER ADMIN ID MISMATCH
-- ============================================================================
-- Run this in your Supabase SQL Editor to diagnose and fix the ID mismatch
-- ============================================================================

-- STEP 1: Check for ID mismatch
SELECT 
  'DIAGNOSIS' as step,
  au.id as auth_id,
  au.email as auth_email,
  u.id as users_table_id,
  u.email as users_table_email,
  u.role,
  CASE 
    WHEN au.id = u.id THEN '✅ IDs MATCH'
    ELSE '❌ IDs MISMATCH - NEEDS FIX'
  END as status
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
WHERE au.email = 'superadmin@spartk.test' OR u.email = 'superadmin@spartk.test';

-- STEP 2: Fix the ID mismatch (ONLY RUN IF STEP 1 SHOWS MISMATCH)
-- Uncomment the lines below ONLY if Step 1 shows a mismatch

/*
-- First, get the correct auth ID
DO $$
DECLARE
  correct_auth_id UUID;
  old_user_id UUID;
BEGIN
  -- Get the auth.users ID for the super admin
  SELECT id INTO correct_auth_id 
  FROM auth.users 
  WHERE email = 'superadmin@spartk.test';
  
  -- Get the current users table ID
  SELECT id INTO old_user_id 
  FROM users 
  WHERE email = 'superadmin@spartk.test';
  
  -- Update the users table to use the correct auth ID
  UPDATE users 
  SET id = correct_auth_id 
  WHERE email = 'superadmin@spartk.test';
  
  -- Update any related records in admin_permissions if they exist
  UPDATE admin_permissions 
  SET user_id = correct_auth_id 
  WHERE user_id = old_user_id;
  
  RAISE NOTICE 'Fixed ID mismatch: % -> %', old_user_id, correct_auth_id;
END $$;
*/

-- STEP 3: Verify the fix
SELECT 
  'VERIFICATION' as step,
  au.id as auth_id,
  u.id as users_id,
  u.email,
  u.role,
  CASE 
    WHEN au.id = u.id THEN '✅ FIXED - IDs NOW MATCH'
    ELSE '❌ STILL MISMATCHED'
  END as status
FROM auth.users au
JOIN users u ON au.email = u.email
WHERE au.email = 'superadmin@spartk.test';
