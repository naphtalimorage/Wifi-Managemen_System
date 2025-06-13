/*
  # WiFi Access Management System Database Schema

  1. New Tables
    - `users` - Store user account information
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `phone_number` (text)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `data_plans` - Available internet plans
      - `id` (uuid, primary key)
      - `name` (text)
      - `duration_hours` (integer)
      - `price_ksh` (integer)
      - `description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `user_sessions` - Track active user sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `mac_address` (text)
      - `ip_address` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `payments` - Payment transaction records
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `session_id` (uuid, foreign key)
      - `amount_ksh` (integer)
      - `mpesa_transaction_id` (text)
      - `phone_number` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for admin users to access all data

  3. Sample Data
    - Insert default data plans
    - Create sample admin user
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create data_plans table
CREATE TABLE IF NOT EXISTS data_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration_hours integer NOT NULL,
  price_ksh integer NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES data_plans(id) ON DELETE CASCADE,
  mac_address text DEFAULT '',
  ip_address text DEFAULT '',
  start_time timestamptz DEFAULT now(),
  end_time timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES user_sessions(id) ON DELETE SET NULL,
  amount_ksh integer NOT NULL,
  mpesa_transaction_id text DEFAULT '',
  phone_number text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Anyone can read active data plans
CREATE POLICY "Anyone can read active data plans"
  ON data_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can read their own payments
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own payments
CREATE POLICY "Users can create own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin policies (users with email containing 'admin')
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can manage data plans"
  ON data_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can read all sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can update all sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can read all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

-- Insert default data plans
INSERT INTO data_plans (name, duration_hours, price_ksh, description) VALUES
  ('Quick Browse', 2, 10, 'Perfect for quick browsing and social media'),
  ('Daily Access', 24, 20, 'Full day internet access for work and entertainment'),
  ('Weekly Plan', 168, 150, 'Best value - One week of unlimited internet access'),
  ('Monthly Plan', 720, 500, 'Premium monthly plan with unlimited access')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();