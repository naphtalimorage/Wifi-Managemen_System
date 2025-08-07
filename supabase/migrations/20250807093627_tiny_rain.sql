/*
  # Fix Users Table RLS Policies

  1. Policy Updates
    - Drop existing problematic policies on users table
    - Create new, properly configured policies for SELECT and INSERT operations
    - Ensure admin policies don't create recursive loops
    - Allow users to read their own data and insert their own profiles

  2. Security
    - Users can only read their own profile data
    - Users can only create profiles for themselves during signup
    - Admins can read all user data without recursion issues
    - Proper separation between user and admin access patterns
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new SELECT policy for users to read their own data
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create new SELECT policy for admins (using a simpler approach)
CREATE POLICY "Admins can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%admin%'
    )
  );

-- Create INSERT policy for new user registration
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create UPDATE policy for users to update their own data
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create UPDATE policy for admins
CREATE POLICY "Admins can update all profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%admin%'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%admin%'
    )
  );