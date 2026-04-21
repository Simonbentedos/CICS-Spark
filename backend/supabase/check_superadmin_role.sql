-- Check the exact role value for the Super Admin
SELECT 
  email,
  role,
  LENGTH(role) as role_length,
  ASCII(SUBSTRING(role FROM 1 FOR 1)) as first_char_ascii,
  is_active,
  department
FROM users 
WHERE email = 'superadmin@spartk.test';

-- Also check if there are any other variations of super admin roles
SELECT DISTINCT role, COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY role;