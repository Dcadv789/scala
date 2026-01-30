-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de status de pipeline de vendas
CREATE TABLE IF NOT EXISTS sales_stages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  color VARCHAR(50) DEFAULT '#00bf63'
);

-- Inserir estágios padrão do pipeline
INSERT INTO sales_stages (name, position, color) VALUES
  ('Novo Lead', 1, '#94a3b8'),
  ('Contato Inicial', 2, '#3b82f6'),
  ('Qualificado', 3, '#8b5cf6'),
  ('Proposta Enviada', 4, '#f59e0b'),
  ('Negociação', 5, '#ec4899'),
  ('Fechado Ganho', 6, '#00bf63'),
  ('Fechado Perdido', 7, '#ef4444')
ON CONFLICT DO NOTHING;

-- Criar tabela de assinantes/clientes
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service_type VARCHAR(50) NOT NULL, -- 'aluguel' ou 'compra'
  plan_value DECIMAL(10,2),
  start_date DATE NOT NULL,
  next_billing_date DATE,
  status VARCHAR(50) DEFAULT 'ativo', -- 'ativo', 'suspenso', 'cancelado'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de faturamento
CREATE TABLE IF NOT EXISTS billing_records (
  id SERIAL PRIMARY KEY,
  subscriber_id INTEGER REFERENCES subscribers(id),
  invoice_number VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'pago', 'atrasado', 'cancelado'
  payment_method VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar tabela de leads com stage_id
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS stage_id INTEGER REFERENCES sales_stages(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_followup_date DATE;
