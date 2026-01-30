-- =============================================
-- MIGRAÇÃO BLOCO 1 - TRADUÇÃO PARA PORTUGUÊS
-- Tabelas: users, webhook_logs, payments, subscriptions, pixels, connections
-- =============================================

-- 1. RENOMEAR TABELA: users → usuarios
ALTER TABLE IF EXISTS users RENAME TO usuarios;

-- Renomear colunas da tabela usuarios (apenas as que mudam)
ALTER TABLE usuarios RENAME COLUMN name TO nome;
ALTER TABLE usuarios RENAME COLUMN phone TO telefone;
ALTER TABLE usuarios RENAME COLUMN plan TO plano;
ALTER TABLE usuarios RENAME COLUMN plan_status TO status_plano;
ALTER TABLE usuarios RENAME COLUMN role TO perfil;
ALTER TABLE usuarios RENAME COLUMN connections TO conexoes;
ALTER TABLE usuarios RENAME COLUMN messages_sent TO mensagens_enviadas;
ALTER TABLE usuarios RENAME COLUMN created_at TO criado_em;
ALTER TABLE usuarios RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar índices
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
DROP INDEX IF EXISTS idx_users_plan_status;
CREATE INDEX IF NOT EXISTS idx_usuarios_status_plano ON usuarios(status_plano);

-- 2. RENOMEAR TABELA: webhook_logs → logs_webhook
ALTER TABLE IF EXISTS webhook_logs RENAME TO logs_webhook;

-- Renomear colunas da tabela logs_webhook
ALTER TABLE logs_webhook RENAME COLUMN source TO origem;
ALTER TABLE logs_webhook RENAME COLUMN event_type TO tipo_evento;
ALTER TABLE logs_webhook RENAME COLUMN customer_email TO email_cliente;
ALTER TABLE logs_webhook RENAME COLUMN customer_name TO nome_cliente;
ALTER TABLE logs_webhook RENAME COLUMN product_name TO nome_produto;
ALTER TABLE logs_webhook RENAME COLUMN payload TO dados;
ALTER TABLE logs_webhook RENAME COLUMN created_at TO criado_em;

-- Atualizar índices
DROP INDEX IF EXISTS idx_webhook_logs_email;
CREATE INDEX IF NOT EXISTS idx_logs_webhook_email_cliente ON logs_webhook(email_cliente);
DROP INDEX IF EXISTS idx_webhook_logs_created;
CREATE INDEX IF NOT EXISTS idx_logs_webhook_criado_em ON logs_webhook(criado_em);

-- 3. RENOMEAR TABELA: payments → pagamentos
ALTER TABLE IF EXISTS payments RENAME TO pagamentos;

-- Renomear colunas da tabela pagamentos
ALTER TABLE pagamentos RENAME COLUMN user_id TO id_usuario;
ALTER TABLE pagamentos RENAME COLUMN user_email TO email_usuario;
ALTER TABLE pagamentos RENAME COLUMN sale_id TO id_venda;
ALTER TABLE pagamentos RENAME COLUMN checkout_id TO id_checkout;
ALTER TABLE pagamentos RENAME COLUMN product_name TO nome_produto;
ALTER TABLE pagamentos RENAME COLUMN amount TO valor;
ALTER TABLE pagamentos RENAME COLUMN currency TO moeda;
ALTER TABLE pagamentos RENAME COLUMN payment_method TO metodo_pagamento;
ALTER TABLE pagamentos RENAME COLUMN type TO tipo;
ALTER TABLE pagamentos RENAME COLUMN kirvano_data TO dados_kirvano;
ALTER TABLE pagamentos RENAME COLUMN created_at TO criado_em;
ALTER TABLE pagamentos RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar foreign keys
ALTER TABLE pagamentos DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE pagamentos ADD CONSTRAINT pagamentos_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_payments_user_email;
CREATE INDEX IF NOT EXISTS idx_pagamentos_email_usuario ON pagamentos(email_usuario);

-- 4. RENOMEAR TABELA: subscriptions → assinaturas
ALTER TABLE IF EXISTS subscriptions RENAME TO assinaturas;

-- Renomear colunas da tabela assinaturas
ALTER TABLE assinaturas RENAME COLUMN user_id TO id_usuario;
ALTER TABLE assinaturas RENAME COLUMN user_email TO email_usuario;
ALTER TABLE assinaturas RENAME COLUMN plan TO plano;
ALTER TABLE assinaturas RENAME COLUMN start_date TO data_inicio;
ALTER TABLE assinaturas RENAME COLUMN end_date TO data_fim;
ALTER TABLE assinaturas RENAME COLUMN renewal_date TO data_renovacao;
ALTER TABLE assinaturas RENAME COLUMN cancelled_at TO cancelado_em;
ALTER TABLE assinaturas RENAME COLUMN kirvano_subscription_id TO id_assinatura_kirvano;
ALTER TABLE assinaturas RENAME COLUMN created_at TO criado_em;
ALTER TABLE assinaturas RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar foreign keys
ALTER TABLE assinaturas DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE assinaturas ADD CONSTRAINT assinaturas_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_subscriptions_user_email;
CREATE INDEX IF NOT EXISTS idx_assinaturas_email_usuario ON assinaturas(email_usuario);

-- 5. TABELA: pixels (mantém nome, mas traduz colunas)
-- Renomear colunas da tabela pixels
ALTER TABLE pixels RENAME COLUMN user_id TO id_usuario;
ALTER TABLE pixels RENAME COLUMN user_email TO email_usuario;
ALTER TABLE pixels RENAME COLUMN name TO nome;
ALTER TABLE pixels RENAME COLUMN type TO tipo;
ALTER TABLE pixels RENAME COLUMN pixel_id TO id_pixel;
ALTER TABLE pixels RENAME COLUMN events TO eventos;
ALTER TABLE pixels RENAME COLUMN created_at TO criado_em;
ALTER TABLE pixels RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar foreign keys
ALTER TABLE pixels DROP CONSTRAINT IF EXISTS pixels_user_id_fkey;
ALTER TABLE pixels ADD CONSTRAINT pixels_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_pixels_user_email;
CREATE INDEX IF NOT EXISTS idx_pixels_email_usuario ON pixels(email_usuario);

-- 6. RENOMEAR TABELA: connections → conexoes
ALTER TABLE IF EXISTS connections RENAME TO conexoes;

-- Renomear colunas da tabela conexoes
ALTER TABLE conexoes RENAME COLUMN user_id TO id_usuario;
ALTER TABLE conexoes RENAME COLUMN user_email TO email_usuario;
ALTER TABLE conexoes RENAME COLUMN name TO nome;
ALTER TABLE conexoes RENAME COLUMN phone TO telefone;
ALTER TABLE conexoes RENAME COLUMN qr_code TO codigo_qr;
ALTER TABLE conexoes RENAME COLUMN session_data TO dados_sessao;
ALTER TABLE conexoes RENAME COLUMN last_connected_at TO ultima_conexao_em;
ALTER TABLE conexoes RENAME COLUMN created_at TO criado_em;
ALTER TABLE conexoes RENAME COLUMN updated_at TO atualizado_em;

-- Colunas adicionais do WhatsApp API (se existirem)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'phone_number_id') THEN
    ALTER TABLE conexoes RENAME COLUMN phone_number_id TO id_numero_telefone;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'access_token') THEN
    ALTER TABLE conexoes RENAME COLUMN access_token TO token_acesso;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'waba_id') THEN
    ALTER TABLE conexoes RENAME COLUMN waba_id TO id_waba;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'connection_type') THEN
    ALTER TABLE conexoes RENAME COLUMN connection_type TO tipo_conexao;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'verified_name') THEN
    ALTER TABLE conexoes RENAME COLUMN verified_name TO nome_verificado;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'display_phone_number') THEN
    ALTER TABLE conexoes RENAME COLUMN display_phone_number TO numero_exibicao;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'verify_token') THEN
    ALTER TABLE conexoes RENAME COLUMN verify_token TO token_verificacao;
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE conexoes DROP CONSTRAINT IF EXISTS connections_user_id_fkey;
ALTER TABLE conexoes ADD CONSTRAINT conexoes_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_connections_user_email;
CREATE INDEX IF NOT EXISTS idx_conexoes_email_usuario ON conexoes(email_usuario);

-- =============================================
-- FIM DA MIGRAÇÃO BLOCO 1
-- =============================================
