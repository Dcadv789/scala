-- =============================================
-- MIGRAÇÃO BLOCO 4 - TRADUÇÃO PARA PORTUGUÊS
-- Tabelas: employees, leads, whatsapp_webhook_logs, webhook_messages
-- =============================================

-- 1. RENOMEAR TABELA: employees → funcionarios
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
    ALTER TABLE employees RENAME TO funcionarios;
  END IF;
END $$;

-- Renomear colunas da tabela funcionarios (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'name') THEN
      ALTER TABLE funcionarios RENAME COLUMN name TO nome;
    END IF;
    
    -- Coluna 'email' não precisa ser renomeada, mantém o nome
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'phone') THEN
      ALTER TABLE funcionarios RENAME COLUMN phone TO telefone;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'role') THEN
      ALTER TABLE funcionarios RENAME COLUMN role TO perfil;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'username') THEN
      ALTER TABLE funcionarios RENAME COLUMN username TO nome_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'password_hash') THEN
      ALTER TABLE funcionarios RENAME COLUMN password_hash TO hash_senha;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'is_active') THEN
      ALTER TABLE funcionarios RENAME COLUMN is_active TO ativo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'leads_assigned') THEN
      ALTER TABLE funcionarios RENAME COLUMN leads_assigned TO leads_atribuidos;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'created_at') THEN
      ALTER TABLE funcionarios RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'criado_em') THEN
      ALTER TABLE funcionarios ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'updated_at') THEN
      ALTER TABLE funcionarios RENAME COLUMN updated_at TO atualizado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'atualizado_em') THEN
      ALTER TABLE funcionarios ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Verificar se existe full_name e renomear se existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'full_name') THEN
      ALTER TABLE funcionarios RENAME COLUMN full_name TO nome_completo;
    END IF;
  END IF;
END $$;

-- Atualizar índices
DROP INDEX IF EXISTS idx_employees_role;
DROP INDEX IF EXISTS idx_employees_is_active;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') THEN
    CREATE INDEX IF NOT EXISTS idx_funcionarios_perfil ON funcionarios(perfil);
    CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON funcionarios(ativo);
  END IF;
END $$;

-- 2. TABELA: leads (mantém nome, mas traduz colunas)
-- Renomear colunas da tabela leads (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'name') THEN
      ALTER TABLE leads RENAME COLUMN name TO nome;
    END IF;
    
    -- Colunas 'email' e 'whatsapp' não precisam ser renomeadas, mantêm os nomes
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company') THEN
      ALTER TABLE leads RENAME COLUMN company TO empresa;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'business_type') THEN
      ALTER TABLE leads RENAME COLUMN business_type TO tipo_negocio;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'current_volume') THEN
      ALTER TABLE leads RENAME COLUMN current_volume TO volume_atual;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'service_type') THEN
      ALTER TABLE leads RENAME COLUMN service_type TO tipo_servico;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'automation_system') THEN
      ALTER TABLE leads RENAME COLUMN automation_system TO sistema_automacao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'goal') THEN
      ALTER TABLE leads RENAME COLUMN goal TO objetivo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'timeline') THEN
      ALTER TABLE leads RENAME COLUMN timeline TO prazo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'budget') THEN
      ALTER TABLE leads RENAME COLUMN budget TO orcamento;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'employee_id') THEN
      ALTER TABLE leads RENAME COLUMN employee_id TO id_funcionario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assigned_to') THEN
      ALTER TABLE leads RENAME COLUMN assigned_to TO atribuido_para;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assigned_at') THEN
      ALTER TABLE leads RENAME COLUMN assigned_at TO atribuido_em;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'stage_id') THEN
      ALTER TABLE leads RENAME COLUMN stage_id TO id_estagio;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'deal_value') THEN
      ALTER TABLE leads RENAME COLUMN deal_value TO valor_negocio;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
      ALTER TABLE leads RENAME COLUMN notes TO observacoes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_contact_date') THEN
      ALTER TABLE leads RENAME COLUMN last_contact_date TO ultima_data_contato;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_followup_date') THEN
      ALTER TABLE leads RENAME COLUMN next_followup_date TO proxima_data_acompanhamento;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_at') THEN
      ALTER TABLE leads RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'criado_em') THEN
      ALTER TABLE leads ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de leads (se existirem)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    -- Atualizar foreign key para funcionarios
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') THEN
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_employee_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'atribuido_para') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_atribuido_para_fkey 
          FOREIGN KEY (atribuido_para) REFERENCES funcionarios(id);
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'id_funcionario') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_id_funcionario_fkey 
          FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id);
      END IF;
    END IF;
    
    -- Atualizar foreign key para estagios_venda
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estagios_venda') THEN
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_stage_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'id_estagio') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_id_estagio_fkey 
          FOREIGN KEY (id_estagio) REFERENCES estagios_venda(id);
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar foreign key de assinantes para leads (do Bloco 3)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinantes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
      ALTER TABLE assinantes DROP CONSTRAINT IF EXISTS subscribers_lead_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinantes' AND column_name = 'id_lead') THEN
        ALTER TABLE assinantes ADD CONSTRAINT assinantes_id_lead_fkey 
          FOREIGN KEY (id_lead) REFERENCES leads(id);
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de leads
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_leads_assigned_to;
DROP INDEX IF EXISTS idx_leads_employee_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON leads(criado_em DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_atribuido_para ON leads(atribuido_para);
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'id_funcionario') THEN
      CREATE INDEX IF NOT EXISTS idx_leads_id_funcionario ON leads(id_funcionario);
    END IF;
  END IF;
END $$;

-- 3. RENOMEAR TABELA: whatsapp_webhook_logs → logs_webhook_whatsapp
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_webhook_logs') THEN
    ALTER TABLE whatsapp_webhook_logs RENAME TO logs_webhook_whatsapp;
  END IF;
END $$;

-- Renomear colunas da tabela logs_webhook_whatsapp (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook_whatsapp') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'payload') THEN
      ALTER TABLE logs_webhook_whatsapp RENAME COLUMN payload TO dados;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'source') THEN
      ALTER TABLE logs_webhook_whatsapp RENAME COLUMN source TO origem;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'created_at') THEN
      ALTER TABLE logs_webhook_whatsapp RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'criado_em') THEN
      ALTER TABLE logs_webhook_whatsapp ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 4. RENOMEAR TABELA: webhook_messages → mensagens_webhook
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_messages') THEN
    ALTER TABLE webhook_messages RENAME TO mensagens_webhook;
  END IF;
END $$;

-- Renomear colunas da tabela mensagens_webhook (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    -- Coluna 'id' não precisa ser renomeada, mantém o nome
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'from_number') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN from_number TO numero_remetente;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'to_number') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN to_number TO numero_destinatario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'contact_name') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN contact_name TO nome_contato;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'message_text') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN message_text TO texto_mensagem;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'message_type') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN message_type TO tipo_mensagem;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'phone_number_id') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN phone_number_id TO id_numero_telefone;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'timestamp') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN timestamp TO data_hora;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'is_from_me') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN is_from_me TO e_de_mim;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'processed') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN processed TO processado;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'replied') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN replied TO respondido;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'created_at') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'criado_em') THEN
      ALTER TABLE mensagens_webhook ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- =============================================
-- FIM DA MIGRAÇÃO BLOCO 4
-- =============================================

