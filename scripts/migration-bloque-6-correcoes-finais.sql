-- =============================================
-- MIGRAÇÃO BLOCO 6 - CORREÇÕES FINAIS
-- Renomear colunas pendentes em inglês
-- =============================================

-- 1. Tabela "estatisticas_uso"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estatisticas_uso') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'campaigns_created') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN campaigns_created TO campanhas_criadas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'contacts_added') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN contacts_added TO contatos_adicionados;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'updated_at') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN updated_at TO atualizado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'atualizado_em') THEN
      ALTER TABLE estatisticas_uso ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 2. Tabela "planos"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'description') THEN
      ALTER TABLE planos RENAME COLUMN description TO descricao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'max_contacts') THEN
      ALTER TABLE planos RENAME COLUMN max_contacts TO max_contatos;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'max_campaigns_per_month') THEN
      ALTER TABLE planos RENAME COLUMN max_campaigns_per_month TO max_campanhas_mes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'max_messages_per_month') THEN
      ALTER TABLE planos RENAME COLUMN max_messages_per_month TO max_mensagens_mes;
    END IF;
  END IF;
END $$;

-- 3. Tabela "mensagens_webhook"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'media_url') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN media_url TO url_midia;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'user_id') THEN
      ALTER TABLE mensagens_webhook RENAME COLUMN user_id TO id_usuario;
    END IF;
  END IF;
END $$;

-- Atualizar foreign key de mensagens_webhook (se user_id foi renomeado)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'id_usuario') THEN
        ALTER TABLE mensagens_webhook DROP CONSTRAINT IF EXISTS webhook_messages_user_id_fkey;
        ALTER TABLE mensagens_webhook DROP CONSTRAINT IF EXISTS mensagens_webhook_user_id_fkey;
        ALTER TABLE mensagens_webhook ADD CONSTRAINT mensagens_webhook_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índice de mensagens_webhook
DROP INDEX IF EXISTS idx_webhook_messages_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_mensagens_webhook_id_usuario ON mensagens_webhook(id_usuario);
    END IF;
  END IF;
END $$;

-- 4. Tabela "perfis"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'phone') THEN
      ALTER TABLE perfis RENAME COLUMN phone TO telefone;
    END IF;
  END IF;
END $$;

-- 5. Tabela "logs_webhook_whatsapp"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook_whatsapp') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'user_id') THEN
      ALTER TABLE logs_webhook_whatsapp RENAME COLUMN user_id TO id_usuario;
    END IF;
  END IF;
END $$;

-- Atualizar foreign key de logs_webhook_whatsapp (se user_id foi renomeado)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook_whatsapp') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'id_usuario') THEN
        ALTER TABLE logs_webhook_whatsapp DROP CONSTRAINT IF EXISTS whatsapp_webhook_logs_user_id_fkey;
        ALTER TABLE logs_webhook_whatsapp DROP CONSTRAINT IF EXISTS logs_webhook_whatsapp_user_id_fkey;
        ALTER TABLE logs_webhook_whatsapp ADD CONSTRAINT logs_webhook_whatsapp_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índice de logs_webhook_whatsapp
DROP INDEX IF EXISTS idx_whatsapp_webhook_logs_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook_whatsapp') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_logs_webhook_whatsapp_id_usuario ON logs_webhook_whatsapp(id_usuario);
    END IF;
  END IF;
END $$;

-- 6. Tabela "logs_brutos_webhook"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_brutos_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'body') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN body TO corpo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'query_params') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN query_params TO parametros_query;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'user_id') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN user_id TO id_usuario;
    END IF;
  END IF;
END $$;

-- Atualizar foreign key de logs_brutos_webhook (se user_id foi renomeado)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_brutos_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'id_usuario') THEN
        ALTER TABLE logs_brutos_webhook DROP CONSTRAINT IF EXISTS webhook_raw_logs_user_id_fkey;
        ALTER TABLE logs_brutos_webhook DROP CONSTRAINT IF EXISTS logs_brutos_webhook_user_id_fkey;
        ALTER TABLE logs_brutos_webhook ADD CONSTRAINT logs_brutos_webhook_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índice de logs_brutos_webhook
DROP INDEX IF EXISTS idx_webhook_raw_logs_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_brutos_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_logs_brutos_webhook_id_usuario ON logs_brutos_webhook(id_usuario);
    END IF;
  END IF;
END $$;

-- 7. Tabela "etapas_funil"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etapas_funil') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'name') THEN
      ALTER TABLE etapas_funil RENAME COLUMN name TO nome;
    END IF;
  END IF;
END $$;

-- 8. Tabela "etiquetas_contato"
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'user_id') THEN
      ALTER TABLE etiquetas_contato RENAME COLUMN user_id TO id_usuario;
    END IF;
  END IF;
END $$;

-- Atualizar foreign key de etiquetas_contato (se user_id foi renomeado)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_usuario') THEN
        ALTER TABLE etiquetas_contato DROP CONSTRAINT IF EXISTS contact_tags_user_id_fkey;
        ALTER TABLE etiquetas_contato DROP CONSTRAINT IF EXISTS etiquetas_contato_user_id_fkey;
        ALTER TABLE etiquetas_contato ADD CONSTRAINT etiquetas_contato_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índice de etiquetas_contato
DROP INDEX IF EXISTS idx_contact_tags_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_etiquetas_contato_id_usuario ON etiquetas_contato(id_usuario);
    END IF;
  END IF;
END $$;

-- =============================================
-- FIM DA MIGRAÇÃO BLOCO 6 - CORREÇÕES FINAIS
-- =============================================


