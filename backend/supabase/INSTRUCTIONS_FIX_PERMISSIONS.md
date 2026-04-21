# Fix "Failed to Update Permissions" Error

## Problem
Super Admin can login but gets "Failed to update permissions" when trying to save permission changes.

## Root Cause
The ID in the `users` table doesn't match the ID in `auth.users` table. The RLS policy uses `auth.uid()` which returns the auth ID, but the `users` table has a different ID.

## Solution

### Step 1: Diagnose the Issue
Run this query in your **Supabase SQL Editor**:

```sql
SELECT 
  au.id as auth_id,
  u.id as users_table_id,
  au.email,
  u.role,
  CASE 
    WHEN au.id = u.id THEN 'IDs MATCH ✅'
    ELSE 'IDs MISMATCH ❌ - NEEDS FIX'
  END as status
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
WHERE au.email = 'superadmin@spartk.test';
```

### Step 2: Fix the ID Mismatch
If Step 1 shows a mismatch, run this fix:

```sql
-- Fix Super Admin ID mismatch
DO $$
DECLARE
  correct_auth_id UUID;
  old_user_id UUID;
BEGIN
  -- Get the correct auth ID
  SELECT id INTO correct_auth_id 
  FROM auth.users 
  WHERE email = 'superadmin@spartk.test';
  
  -- Get the old users table ID
  SELECT id INTO old_user_id 
  FROM users 
  WHERE email = 'superadmin@spartk.test';
  
  -- Only proceed if there's actually a mismatch
  IF correct_auth_id IS NOT NULL AND old_user_id IS NOT NULL AND correct_auth_id != old_user_id THEN
    -- Update users table to use correct auth ID
    UPDATE users 
    SET id = correct_auth_id 
    WHERE email = 'superadmin@spartk.test';
    
    -- Update any related records in admin_permissions
    UPDATE admin_permissions 
    SET user_id = correct_auth_id 
    WHERE user_id = old_user_id;
    
    RAISE NOTICE 'Fixed ID mismatch: Old ID = %, New ID = %', old_user_id, correct_auth_id;
  ELSE
    RAISE NOTICE 'No mismatch found or user does not exist';
  END IF;
END $$;
```

### Step 3: Verify the Fix
Run this to confirm it's fixed:

```sql
SELECT 
  au.id as auth_id,
  u.id as users_id,
  u.email,
  u.role,
  CASE 
    WHEN au.id = u.id THEN 'FIXED ✅'
    ELSE 'STILL BROKEN ❌'
  END as status
FROM auth.users au
JOIN users u ON au.email = u.email
WHERE au.email = 'superadmin@spartk.test';
```

### Step 4: Test Permission Saving
1. Log out and log back in as Super Admin
2. Go to Settings page
3. Try to save permission changes
4. Should now work without "Failed to update permissions" error

## Why This Happens
When the Super Admin account was created, the ID in the `users` table was set manually or generated differently than the ID in `auth.users`. The RLS policy checks:

```sql
EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()  -- auth.uid() returns the auth.users ID
  AND users.role = 'super_admin'
)
```

If `users.id` doesn't match `auth.uid()`, the policy fails even though the Super Admin is logged in.
