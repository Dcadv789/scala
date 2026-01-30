-- =============================================
-- SCALAZAP - SCHEMA COMPLETO DO BANCO DE DADOS
-- =============================================

-- Tabela de usuarios (atualizar se existir)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  plan VARCHAR(50) DEFAULT 'starter',
  plan_status VARCHAR(50) DEFAULT 'pending',
  role VARCHAR(50) DEFAULT 'user',
  connections INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(50) NOT NULL DEFAULT 'kirvano',
  event_type VARCHAR(100),
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  product_name VARCHAR(255),
  payload JSONB,
  status VARCHAR(50) DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de faturamento/pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  sale_id VARCHAR(100),
  checkout_id VARCHAR(100),
  product_name VARCHAR(255),
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'BRL',
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  type VARCHAR(50) DEFAULT 'one_time',
  kirvano_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  kirvano_subscription_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pixels de rastreamento
CREATE TABLE IF NOT EXISTS pixels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  pixel_id VARCHAR(255) NOT NULL,
  token VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  events JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conexoes WhatsApp
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'disconnected',
  qr_code TEXT,
  session_data JSONB,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'message',
  status VARCHAR(50) DEFAULT 'draft',
  connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
  message_template TEXT,
  media_url TEXT,
  target_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  direction VARCHAR(20) DEFAULT 'outbound',
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'custom',
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  media_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de carrinhos abandonados
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  product_name VARCHAR(255),
  product_price DECIMAL(10, 2),
  checkout_url TEXT,
  recovery_status VARCHAR(50) DEFAULT 'pending',
  messages_sent INTEGER DEFAULT 0,
  recovered_at TIMESTAMP WITH TIME ZONE,
  kirvano_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuracoes do usuario
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT true,
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_message TEXT,
  business_hours JSONB DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(10) DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de analytics
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  campaigns_created INTEGER DEFAULT 0,
  campaigns_completed INTEGER DEFAULT 0,
  contacts_added INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Desabilitar RLS em todas as tabelas para acesso publico
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE pixels DISABLE ROW LEVEL SECURITY;
ALTER TABLE connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- Criar indices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan_status ON users(plan_status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON webhook_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_email ON payments(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_pixels_user_email ON pixels(user_email);
CREATE INDEX IF NOT EXISTS idx_connections_user_email ON connections(user_email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_email ON campaigns(user_email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_email ON contacts(user_email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer_email ON abandoned_carts(customer_email);

-- Atualizar usuario blindaadmnistrativo para ACTIVE
UPDATE users SET plan_status = 'active', updated_at = NOW() 
WHERE email ILIKE 'blindaadmnistrativo@gmail.com';
