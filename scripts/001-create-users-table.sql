-- Create users table for ScalaZap
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'unlimited')),
  plan_status TEXT DEFAULT 'pending' CHECK (plan_status IN ('pending', 'active', 'cancelled', 'expired')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  connections INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index for plan_status filtering
CREATE INDEX IF NOT EXISTS idx_users_plan_status ON users(plan_status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policy: Admins can read all users (for superadmin panel)
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: Allow insert for new users
CREATE POLICY "Allow insert for authenticated users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
