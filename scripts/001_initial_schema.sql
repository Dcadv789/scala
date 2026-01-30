-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_type VARCHAR(50) DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create whatsapp_connections table
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_name VARCHAR(255) NOT NULL,
  connection_type VARCHAR(50) NOT NULL CHECK (connection_type IN ('official', 'unofficial')),
  phone_number VARCHAR(50) NOT NULL,
  business_account_id VARCHAR(255),
  access_token TEXT,
  webhook_verify_token VARCHAR(255),
  qr_code TEXT,
  status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact_lists table
CREATE TABLE IF NOT EXISTS contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_name VARCHAR(255) NOT NULL,
  description TEXT,
  total_contacts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_id UUID REFERENCES contact_lists(id) ON DELETE SET NULL,
  phone_number VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'unsubscribed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, phone_number)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  media_url TEXT,
  media_type VARCHAR(50),
  schedule_type VARCHAR(50) DEFAULT 'immediate' CHECK (schedule_type IN ('immediate', 'scheduled')),
  scheduled_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  total_contacts INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign_contacts table
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document')),
  content TEXT NOT NULL,
  media_url TEXT,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id VARCHAR(255),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meta_templates table
CREATE TABLE IF NOT EXISTS meta_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_category VARCHAR(50) NOT NULL CHECK (template_category IN ('marketing', 'utility', 'authentication')),
  language VARCHAR(10) DEFAULT 'pt_BR',
  header_type VARCHAR(50) CHECK (header_type IN ('text', 'image', 'video', 'document', 'none')),
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  meta_template_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_whatsapp_connections_user_id ON whatsapp_connections(user_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_list_id ON contacts(list_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_meta_templates_user_id ON meta_templates(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
