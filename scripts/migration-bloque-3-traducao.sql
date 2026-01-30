-- =============================================
-- MIGRAÇÃO BLOCO 3 - TRADUÇÃO PARA PORTUGUÊS
-- Tabelas: user_settings, analytics, admins, sales_stages, subscribers, billing_records
-- =============================================

-- 1. RENOMEAR TABELA: user_settings → configuracoes_usuario
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
    ALTER TABLE user_settings RENAME TO configuracoes_usuario;
  END IF;
END $$;

-- Renomear colunas da tabela configuracoes_usuario (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_usuario') THEN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'user_id') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'user_email') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN user_email TO email_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'notifications_enabled') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN notifications_enabled TO notificacoes_habilitadas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'email_notifications') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN email_notifications TO notificacoes_email;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'whatsapp_notifications') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN whatsapp_notifications TO notificacoes_whatsapp;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'auto_reply_enabled') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN auto_reply_enabled TO resposta_automatica_habilitada;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'auto_reply_message') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN auto_reply_message TO mensagem_resposta_automatica;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'business_hours') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN business_hours TO horarios_comerciais;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'timezone') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN timezone TO fuso_horario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'language') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN language TO idioma;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'created_at') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'criado_em') THEN
    ALTER TABLE configuracoes_usuario ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'updated_at') THEN
    ALTER TABLE configuracoes_usuario RENAME COLUMN updated_at TO atualizado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'atualizado_em') THEN
    ALTER TABLE configuracoes_usuario ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_usuario') THEN
    ALTER TABLE configuracoes_usuario DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE configuracoes_usuario ADD CONSTRAINT configuracoes_usuario_id_usuario_fkey 
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 2. TABELA: analytics (mantém nome, mas traduz colunas)
-- Renomear colunas da tabela analytics (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics') THEN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'user_id') THEN
    ALTER TABLE analytics RENAME COLUMN user_id TO id_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'user_email') THEN
    ALTER TABLE analytics RENAME COLUMN user_email TO email_usuario;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'date') THEN
    ALTER TABLE analytics RENAME COLUMN date TO data;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'messages_sent') THEN
    ALTER TABLE analytics RENAME COLUMN messages_sent TO mensagens_enviadas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'messages_delivered') THEN
    ALTER TABLE analytics RENAME COLUMN messages_delivered TO mensagens_entregues;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'messages_read') THEN
    ALTER TABLE analytics RENAME COLUMN messages_read TO mensagens_lidas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'campaigns_created') THEN
    ALTER TABLE analytics RENAME COLUMN campaigns_created TO campanhas_criadas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'campaigns_completed') THEN
    ALTER TABLE analytics RENAME COLUMN campaigns_completed TO campanhas_concluidas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'contacts_added') THEN
    ALTER TABLE analytics RENAME COLUMN contacts_added TO contatos_adicionados;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'revenue') THEN
    ALTER TABLE analytics RENAME COLUMN revenue TO receita;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'created_at') THEN
    ALTER TABLE analytics RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'criado_em') THEN
    ALTER TABLE analytics ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics') THEN
    ALTER TABLE analytics DROP CONSTRAINT IF EXISTS analytics_user_id_fkey;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE analytics ADD CONSTRAINT analytics_id_usuario_fkey 
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;
    
    -- Atualizar constraint UNIQUE
    ALTER TABLE analytics DROP CONSTRAINT IF EXISTS analytics_user_id_date_key;
    ALTER TABLE analytics ADD CONSTRAINT analytics_id_usuario_data_key UNIQUE (id_usuario, data);
  END IF;
END $$;

-- 3. RENOMEAR TABELA: admins → administradores
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
    ALTER TABLE admins RENAME TO administradores;
  END IF;
END $$;

-- Renomear colunas da tabela administradores (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'administradores') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'administradores' AND column_name = 'username') THEN
      ALTER TABLE administradores RENAME COLUMN username TO nome_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'administradores' AND column_name = 'password_hash') THEN
      ALTER TABLE administradores RENAME COLUMN password_hash TO hash_senha;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'administradores' AND column_name = 'created_at') THEN
      ALTER TABLE administradores RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'administradores' AND column_name = 'criado_em') THEN
      ALTER TABLE administradores ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END IF;
END $$;

-- 4. RENOMEAR TABELA: sales_stages → estagios_venda
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_stages') THEN
    ALTER TABLE sales_stages RENAME TO estagios_venda;
  END IF;
END $$;

-- Renomear colunas da tabela estagios_venda (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estagios_venda') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estagios_venda' AND column_name = 'name') THEN
      ALTER TABLE estagios_venda RENAME COLUMN name TO nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estagios_venda' AND column_name = 'position') THEN
      ALTER TABLE estagios_venda RENAME COLUMN position TO posicao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estagios_venda' AND column_name = 'color') THEN
      ALTER TABLE estagios_venda RENAME COLUMN color TO cor;
    END IF;
  END IF;
END $$;

-- 5. RENOMEAR TABELA: subscribers → assinantes
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers') THEN
    ALTER TABLE subscribers RENAME TO assinantes;
  END IF;
END $$;

-- Renomear colunas da tabela assinantes (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinantes') THEN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'lead_id') THEN
    ALTER TABLE assinantes RENAME COLUMN lead_id TO id_lead;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'company_name') THEN
    ALTER TABLE assinantes RENAME COLUMN company_name TO nome_empresa;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'contact_name') THEN
    ALTER TABLE assinantes RENAME COLUMN contact_name TO nome_contato;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'email') THEN
    ALTER TABLE assinantes RENAME COLUMN email TO email;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'phone') THEN
    ALTER TABLE assinantes RENAME COLUMN phone TO telefone;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'service_type') THEN
    ALTER TABLE assinantes RENAME COLUMN service_type TO tipo_servico;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'plan_value') THEN
    ALTER TABLE assinantes RENAME COLUMN plan_value TO valor_plano;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'start_date') THEN
    ALTER TABLE assinantes RENAME COLUMN start_date TO data_inicio;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'next_billing_date') THEN
    ALTER TABLE assinantes RENAME COLUMN next_billing_date TO proxima_data_faturamento;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'notes') THEN
    ALTER TABLE assinantes RENAME COLUMN notes TO observacoes;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'created_at') THEN
    ALTER TABLE assinantes RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'criado_em') THEN
    ALTER TABLE assinantes ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'updated_at') THEN
    ALTER TABLE assinantes RENAME COLUMN updated_at TO atualizado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'atualizado_em') THEN
    ALTER TABLE assinantes ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinantes') THEN
    ALTER TABLE assinantes DROP CONSTRAINT IF EXISTS subscribers_lead_id_fkey;
    -- Nota: A foreign key para leads será atualizada no Bloco 4
  END IF;
END $$;

-- 6. RENOMEAR TABELA: billing_records → registros_faturamento
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_records') THEN
    ALTER TABLE billing_records RENAME TO registros_faturamento;
  END IF;
END $$;

-- Renomear colunas da tabela registros_faturamento (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registros_faturamento') THEN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'subscriber_id') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN subscriber_id TO id_assinante;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'invoice_number') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN invoice_number TO numero_nota_fiscal;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'amount') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN amount TO valor;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'due_date') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN due_date TO data_vencimento;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'paid_date') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN paid_date TO data_pagamento;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'payment_method') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN payment_method TO metodo_pagamento;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'notes') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN notes TO observacoes;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'created_at') THEN
    ALTER TABLE registros_faturamento RENAME COLUMN created_at TO criado_em;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_faturamento' AND column_name = 'criado_em') THEN
    ALTER TABLE registros_faturamento ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registros_faturamento') THEN
    ALTER TABLE registros_faturamento DROP CONSTRAINT IF EXISTS billing_records_subscriber_id_fkey;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinantes') THEN
      ALTER TABLE registros_faturamento ADD CONSTRAINT registros_faturamento_id_assinante_fkey 
        FOREIGN KEY (id_assinante) REFERENCES assinantes(id);
    END IF;
  END IF;
END $$;

-- =============================================
-- FIM DA MIGRAÇÃO BLOCO 3
-- =============================================

