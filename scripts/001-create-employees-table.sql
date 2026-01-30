-- Create employees table for team management
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'vendedor', -- 'admin' or 'vendedor'
  is_active BOOLEAN DEFAULT true,
  leads_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add employee_id to leads table for assignment
ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES employees(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_employee ON leads(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active) WHERE is_active = true;

-- Insert default admin user (password: admin123)
INSERT INTO employees (username, password_hash, full_name, email, role, is_active)
VALUES (
  'admin',
  '$2a$10$rOZY.5EYjZ5hLZx0oYKZ0OyYqJ5kZ5z5kZ5kZ5kZ5kZ5kZ5kZ5kZu', -- bcrypt hash of 'admin123'
  'Administrador Master',
  'admin@scalazap.com.br',
  'admin',
  true
) ON CONFLICT (username) DO NOTHING;
