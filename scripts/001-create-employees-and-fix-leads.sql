-- Criar tabela de employees (funcionários/vendedores)
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'vendedor', -- 'admin' ou 'vendedor'
  is_active BOOLEAN NOT NULL DEFAULT true,
  leads_assigned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna employee_id na tabela leads se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'leads' 
    AND column_name = 'employee_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN employee_id INTEGER REFERENCES employees(id);
  END IF;
END $$;

-- Adicionar coluna assigned_at se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'leads' 
    AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN assigned_at TIMESTAMP;
  END IF;
END $$;

-- Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_leads_employee_id ON leads(employee_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_leads_assigned ON employees(leads_assigned);

-- Inserir admin padrão (senha: admin123 - você deve trocar após primeiro login)
-- Hash bcrypt real para 'admin123'
INSERT INTO employees (username, password_hash, full_name, email, role, is_active)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Administrador Master',
  'admin@scalazap.com.br',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Criar um vendedor de exemplo
INSERT INTO employees (username, password_hash, full_name, email, role, is_active)
VALUES (
  'vendedor1',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Vendedor Exemplo',
  'vendedor1@scalazap.com.br',
  'vendedor',
  true
)
ON CONFLICT (username) DO NOTHING;
