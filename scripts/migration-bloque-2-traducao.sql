-- =============================================
-- MIGRAÇÃO BLOCO 2 - TRADUÇÃO PARA PORTUGUÊS
-- Tabelas: campaigns, campaign_recipients, contacts, messages, templates, abandoned_carts
-- =============================================

-- 1. RENOMEAR TABELA: campaigns → campanhas
ALTER TABLE IF EXISTS campaigns RENAME TO campanhas;

-- Renomear colunas da tabela campanhas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'user_id') THEN
    ALTER TABLE campanhas RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'user_email') THEN
    ALTER TABLE campanhas RENAME COLUMN user_email TO email_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'name') THEN
    ALTER TABLE campanhas RENAME COLUMN name TO nome;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'type') THEN
    ALTER TABLE campanhas RENAME COLUMN type TO tipo;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'connection_id') THEN
    ALTER TABLE campanhas RENAME COLUMN connection_id TO id_conexao;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'message_template') THEN
    ALTER TABLE campanhas RENAME COLUMN message_template TO modelo_mensagem;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'media_url') THEN
    ALTER TABLE campanhas RENAME COLUMN media_url TO url_midia;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'target_count') THEN
    ALTER TABLE campanhas RENAME COLUMN target_count TO total_destinatarios;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'sent_count') THEN
    ALTER TABLE campanhas RENAME COLUMN sent_count TO enviados;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'delivered_count') THEN
    ALTER TABLE campanhas RENAME COLUMN delivered_count TO entregues;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'read_count') THEN
    ALTER TABLE campanhas RENAME COLUMN read_count TO lidos;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'scheduled_at') THEN
    ALTER TABLE campanhas RENAME COLUMN scheduled_at TO agendado_para;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'started_at') THEN
    ALTER TABLE campanhas RENAME COLUMN started_at TO iniciado_em;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'completed_at') THEN
    ALTER TABLE campanhas RENAME COLUMN completed_at TO concluido_em;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'settings') THEN
    ALTER TABLE campanhas RENAME COLUMN settings TO configuracoes;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'created_at') THEN
    ALTER TABLE campanhas RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'criado_em') THEN
    ALTER TABLE campanhas ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'updated_at') THEN
    ALTER TABLE campanhas RENAME COLUMN updated_at TO atualizado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'atualizado_em') THEN
    ALTER TABLE campanhas ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE campanhas DROP CONSTRAINT IF EXISTS campaigns_user_id_fkey;
ALTER TABLE campanhas ADD CONSTRAINT campanhas_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE campanhas DROP CONSTRAINT IF EXISTS campaigns_connection_id_fkey;
ALTER TABLE campanhas ADD CONSTRAINT campanhas_id_conexao_fkey 
  FOREIGN KEY (id_conexao) REFERENCES conexoes(id) ON DELETE SET NULL;

-- Atualizar índices
DROP INDEX IF EXISTS idx_campaigns_user_email;
CREATE INDEX IF NOT EXISTS idx_campanhas_email_usuario ON campanhas(email_usuario);

-- 2. RENOMEAR TABELA: campaign_recipients → destinatarios_campanha
ALTER TABLE IF EXISTS campaign_recipients RENAME TO destinatarios_campanha;

-- Renomear colunas da tabela destinatarios_campanha
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'campaign_id') THEN
    ALTER TABLE destinatarios_campanha RENAME COLUMN campaign_id TO id_campanha;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'user_id') THEN
    ALTER TABLE destinatarios_campanha RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'phone') THEN
    ALTER TABLE destinatarios_campanha RENAME COLUMN phone TO telefone;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'name') THEN
    ALTER TABLE destinatarios_campanha RENAME COLUMN name TO nome;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'error') THEN
    ALTER TABLE destinatarios_campanha RENAME COLUMN error TO erro;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'created_at') THEN
    ALTER TABLE destinatarios_campanha RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'criado_em') THEN
    ALTER TABLE destinatarios_campanha ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE destinatarios_campanha DROP CONSTRAINT IF EXISTS campaign_recipients_campaign_id_fkey;
ALTER TABLE destinatarios_campanha ADD CONSTRAINT destinatarios_campanha_id_campanha_fkey 
  FOREIGN KEY (id_campanha) REFERENCES campanhas(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_campaign_recipients_campaign_id;
CREATE INDEX IF NOT EXISTS idx_destinatarios_campanha_id_campanha ON destinatarios_campanha(id_campanha);
DROP INDEX IF EXISTS idx_campaign_recipients_user_id;
CREATE INDEX IF NOT EXISTS idx_destinatarios_campanha_id_usuario ON destinatarios_campanha(id_usuario);

-- 3. RENOMEAR TABELA: contacts → contatos
ALTER TABLE IF EXISTS contacts RENAME TO contatos;

-- Renomear colunas da tabela contatos
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'user_id') THEN
    ALTER TABLE contatos RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'user_email') THEN
    ALTER TABLE contatos RENAME COLUMN user_email TO email_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'name') THEN
    ALTER TABLE contatos RENAME COLUMN name TO nome;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'phone') THEN
    ALTER TABLE contatos RENAME COLUMN phone TO telefone;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'custom_fields') THEN
    ALTER TABLE contatos RENAME COLUMN custom_fields TO campos_personalizados;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'created_at') THEN
    ALTER TABLE contatos RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'criado_em') THEN
    ALTER TABLE contatos ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'updated_at') THEN
    ALTER TABLE contatos RENAME COLUMN updated_at TO atualizado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'atualizado_em') THEN
    ALTER TABLE contatos ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE contatos DROP CONSTRAINT IF EXISTS contacts_user_id_fkey;
ALTER TABLE contatos ADD CONSTRAINT contatos_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_contacts_user_email;
CREATE INDEX IF NOT EXISTS idx_contatos_email_usuario ON contatos(email_usuario);
DROP INDEX IF EXISTS idx_contacts_phone;
CREATE INDEX IF NOT EXISTS idx_contatos_telefone ON contatos(telefone);

-- 4. RENOMEAR TABELA: messages → mensagens
ALTER TABLE IF EXISTS messages RENAME TO mensagens;

-- Renomear colunas da tabela mensagens
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'user_id') THEN
    ALTER TABLE mensagens RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'campaign_id') THEN
    ALTER TABLE mensagens RENAME COLUMN campaign_id TO id_campanha;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'connection_id') THEN
    ALTER TABLE mensagens RENAME COLUMN connection_id TO id_conexao;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'contact_id') THEN
    ALTER TABLE mensagens RENAME COLUMN contact_id TO id_contato;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'direction') THEN
    ALTER TABLE mensagens RENAME COLUMN direction TO direcao;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'content') THEN
    ALTER TABLE mensagens RENAME COLUMN content TO conteudo;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'media_url') THEN
    ALTER TABLE mensagens RENAME COLUMN media_url TO url_midia;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'media_type') THEN
    ALTER TABLE mensagens RENAME COLUMN media_type TO tipo_midia;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'sent_at') THEN
    ALTER TABLE mensagens RENAME COLUMN sent_at TO enviado_em;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'delivered_at') THEN
    ALTER TABLE mensagens RENAME COLUMN delivered_at TO entregue_em;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'read_at') THEN
    ALTER TABLE mensagens RENAME COLUMN read_at TO lido_em;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'error_message') THEN
    ALTER TABLE mensagens RENAME COLUMN error_message TO mensagem_erro;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'created_at') THEN
    ALTER TABLE mensagens RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'criado_em') THEN
    ALTER TABLE mensagens ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE mensagens ADD CONSTRAINT mensagens_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS messages_campaign_id_fkey;
ALTER TABLE mensagens ADD CONSTRAINT mensagens_id_campanha_fkey 
  FOREIGN KEY (id_campanha) REFERENCES campanhas(id) ON DELETE SET NULL;

ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS messages_connection_id_fkey;
ALTER TABLE mensagens ADD CONSTRAINT mensagens_id_conexao_fkey 
  FOREIGN KEY (id_conexao) REFERENCES conexoes(id) ON DELETE SET NULL;

ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS messages_contact_id_fkey;
ALTER TABLE mensagens ADD CONSTRAINT mensagens_id_contato_fkey 
  FOREIGN KEY (id_contato) REFERENCES contatos(id) ON DELETE SET NULL;

-- Atualizar índices
DROP INDEX IF EXISTS idx_messages_user_id;
CREATE INDEX IF NOT EXISTS idx_mensagens_id_usuario ON mensagens(id_usuario);
DROP INDEX IF EXISTS idx_messages_campaign_id;
CREATE INDEX IF NOT EXISTS idx_mensagens_id_campanha ON mensagens(id_campanha);

-- 5. RENOMEAR TABELA: templates → modelos
ALTER TABLE IF EXISTS templates RENAME TO modelos;

-- Renomear colunas da tabela modelos
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'user_id') THEN
    ALTER TABLE modelos RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'user_email') THEN
    ALTER TABLE modelos RENAME COLUMN user_email TO email_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'name') THEN
    ALTER TABLE modelos RENAME COLUMN name TO nome;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'category') THEN
    ALTER TABLE modelos RENAME COLUMN category TO categoria;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'content') THEN
    ALTER TABLE modelos RENAME COLUMN content TO conteudo;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'variables') THEN
    ALTER TABLE modelos RENAME COLUMN variables TO variaveis;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'media_url') THEN
    ALTER TABLE modelos RENAME COLUMN media_url TO url_midia;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'usage_count') THEN
    ALTER TABLE modelos RENAME COLUMN usage_count TO contador_uso;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'created_at') THEN
    ALTER TABLE modelos RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'criado_em') THEN
    ALTER TABLE modelos ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'updated_at') THEN
    ALTER TABLE modelos RENAME COLUMN updated_at TO atualizado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'atualizado_em') THEN
    ALTER TABLE modelos ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE modelos DROP CONSTRAINT IF EXISTS templates_user_id_fkey;
ALTER TABLE modelos ADD CONSTRAINT modelos_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- 6. RENOMEAR TABELA: abandoned_carts → carrinhos_abandonados
ALTER TABLE IF EXISTS abandoned_carts RENAME TO carrinhos_abandonados;

-- Renomear colunas da tabela carrinhos_abandonados
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'user_id') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'customer_email') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN customer_email TO email_cliente;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'customer_name') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN customer_name TO nome_cliente;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'customer_phone') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN customer_phone TO telefone_cliente;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'product_name') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN product_name TO nome_produto;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'product_price') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN product_price TO preco_produto;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'checkout_url') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN checkout_url TO url_checkout;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'recovery_status') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN recovery_status TO status_recuperacao;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'messages_sent') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN messages_sent TO mensagens_enviadas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'recovered_at') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN recovered_at TO recuperado_em;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'kirvano_data') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN kirvano_data TO dados_kirvano;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'created_at') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'criado_em') THEN
    ALTER TABLE carrinhos_abandonados ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'updated_at') THEN
    ALTER TABLE carrinhos_abandonados RENAME COLUMN updated_at TO atualizado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'atualizado_em') THEN
    ALTER TABLE carrinhos_abandonados ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Atualizar foreign keys
ALTER TABLE carrinhos_abandonados DROP CONSTRAINT IF EXISTS abandoned_carts_user_id_fkey;
ALTER TABLE carrinhos_abandonados ADD CONSTRAINT carrinhos_abandonados_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
DROP INDEX IF EXISTS idx_abandoned_carts_customer_email;
CREATE INDEX IF NOT EXISTS idx_carrinhos_abandonados_email_cliente ON carrinhos_abandonados(email_cliente);

-- =============================================
-- FIM DA MIGRAÇÃO BLOCO 2
-- =============================================

