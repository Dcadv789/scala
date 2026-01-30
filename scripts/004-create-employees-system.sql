-- Criar tabela de funcionários/vendedores
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'vendedor', -- 'admin_master' ou 'vendedor'
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  leads_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar campo de vendedor atribuído na tabela leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES employees(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

-- Criar admin master padrão (senha: Master@2024)
INSERT INTO employees (name, email, role, username, password_hash, is_active)
VALUES (
  'Administrador Master',
  'admin@scalazap.br',
  'admin_master',
  'admin',
  '$2a$10$YourHashedPasswordHere',
  true
) ON CONFLICT (username) DO NOTHING;
