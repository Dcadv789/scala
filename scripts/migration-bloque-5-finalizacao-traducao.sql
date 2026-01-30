-- =============================================
-- MIGRAÇÃO BLOCO 5 - FINALIZAÇÃO DA TRADUÇÃO
-- Correções e tradução de tabelas pendentes
-- =============================================

-- =============================================
-- PARTE 1: CORREÇÕES EM TABELAS JÁ TRADUZIDAS
-- =============================================

-- 1.1. Corrigir colunas da tabela campanhas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campanhas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'failed_count') THEN
      ALTER TABLE campanhas RENAME COLUMN failed_count TO qtd_falhas;
    END IF;
  END IF;
END $$;

-- 1.2. Corrigir colunas da tabela destinatarios_campanha
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinatarios_campanha') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'sent_at') THEN
      ALTER TABLE destinatarios_campanha RENAME COLUMN sent_at TO enviado_em;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'message_id') THEN
      ALTER TABLE destinatarios_campanha RENAME COLUMN message_id TO id_mensagem;
    END IF;
  END IF;
END $$;

-- =============================================
-- PARTE 2: TRADUZIR TABELAS PENDENTES
-- =============================================

-- 2.1. RENOMEAR TABELA: profiles → perfis
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles RENAME TO perfis;
  END IF;
END $$;

-- Renomear colunas da tabela perfis (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'user_id') THEN
      ALTER TABLE perfis RENAME COLUMN user_id TO id_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'full_name') THEN
      ALTER TABLE perfis RENAME COLUMN full_name TO nome_completo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'avatar_url') THEN
      ALTER TABLE perfis RENAME COLUMN avatar_url TO url_avatar;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'company_name') THEN
      ALTER TABLE perfis RENAME COLUMN company_name TO nome_empresa;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'role') THEN
      ALTER TABLE perfis RENAME COLUMN role TO cargo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'is_active') THEN
      ALTER TABLE perfis RENAME COLUMN is_active TO ativo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'created_at') THEN
      ALTER TABLE perfis RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'criado_em') THEN
      ALTER TABLE perfis ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'updated_at') THEN
      ALTER TABLE perfis RENAME COLUMN updated_at TO atualizado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'atualizado_em') THEN
      ALTER TABLE perfis ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de perfis
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE perfis DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
      ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_user_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'id_usuario') THEN
        ALTER TABLE perfis ADD CONSTRAINT perfis_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de perfis
DROP INDEX IF EXISTS idx_profiles_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfis' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_perfis_id_usuario ON perfis(id_usuario);
    END IF;
  END IF;
END $$;

-- 2.2. RENOMEAR TABELA: usage_stats → estatisticas_uso
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_stats') THEN
    ALTER TABLE usage_stats RENAME TO estatisticas_uso;
  END IF;
END $$;

-- Renomear colunas da tabela estatisticas_uso (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estatisticas_uso') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'user_id') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN user_id TO id_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'month_year') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN month_year TO mes_ano;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'messages_sent') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN messages_sent TO mensagens_enviadas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'messages_received') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN messages_received TO mensagens_recebidas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'campaigns_sent') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN campaigns_sent TO campanhas_enviadas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'created_at') THEN
      ALTER TABLE estatisticas_uso RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'criado_em') THEN
      ALTER TABLE estatisticas_uso ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de estatisticas_uso
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estatisticas_uso') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE estatisticas_uso DROP CONSTRAINT IF EXISTS usage_stats_user_id_fkey;
      ALTER TABLE estatisticas_uso DROP CONSTRAINT IF EXISTS estatisticas_uso_user_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'id_usuario') THEN
        ALTER TABLE estatisticas_uso ADD CONSTRAINT estatisticas_uso_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de estatisticas_uso
DROP INDEX IF EXISTS idx_usage_stats_user_id;
DROP INDEX IF EXISTS idx_usage_stats_month_year;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estatisticas_uso') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_estatisticas_uso_id_usuario ON estatisticas_uso(id_usuario);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'mes_ano') THEN
      CREATE INDEX IF NOT EXISTS idx_estatisticas_uso_mes_ano ON estatisticas_uso(mes_ano);
    END IF;
  END IF;
END $$;

-- 2.3. RENOMEAR TABELA: plans → planos
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') THEN
    ALTER TABLE plans RENAME TO planos;
  END IF;
END $$;

-- Renomear colunas da tabela planos (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'name') THEN
      ALTER TABLE planos RENAME COLUMN name TO nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'price_monthly') THEN
      ALTER TABLE planos RENAME COLUMN price_monthly TO preco_mensal;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'price_yearly') THEN
      ALTER TABLE planos RENAME COLUMN price_yearly TO preco_anual;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'features') THEN
      ALTER TABLE planos RENAME COLUMN features TO funcionalidades;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'is_active') THEN
      ALTER TABLE planos RENAME COLUMN is_active TO ativo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'max_connections') THEN
      ALTER TABLE planos RENAME COLUMN max_connections TO max_conexoes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'max_messages') THEN
      ALTER TABLE planos RENAME COLUMN max_messages TO max_mensagens;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'max_campaigns') THEN
      ALTER TABLE planos RENAME COLUMN max_campaigns TO max_campanhas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'created_at') THEN
      ALTER TABLE planos RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'criado_em') THEN
      ALTER TABLE planos ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'updated_at') THEN
      ALTER TABLE planos RENAME COLUMN updated_at TO atualizado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planos' AND column_name = 'atualizado_em') THEN
      ALTER TABLE planos ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 2.4. RENOMEAR TABELA: analytics → metricas (se ainda não foi traduzida)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics') THEN
    ALTER TABLE analytics RENAME TO metricas;
  END IF;
END $$;

-- Renomear colunas da tabela metricas (se existir e ainda não traduzidas)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metricas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'user_id') THEN
      ALTER TABLE metricas RENAME COLUMN user_id TO id_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'messages_sent') THEN
      ALTER TABLE metricas RENAME COLUMN messages_sent TO mensagens_enviadas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'revenue') THEN
      ALTER TABLE metricas RENAME COLUMN revenue TO receita;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'date') THEN
      ALTER TABLE metricas RENAME COLUMN date TO data;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'created_at') THEN
      ALTER TABLE metricas RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'criado_em') THEN
      ALTER TABLE metricas ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de metricas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metricas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE metricas DROP CONSTRAINT IF EXISTS analytics_user_id_fkey;
      ALTER TABLE metricas DROP CONSTRAINT IF EXISTS metricas_user_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'id_usuario') THEN
        ALTER TABLE metricas ADD CONSTRAINT metricas_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- 2.5. RENOMEAR TABELA: webhook_raw_logs → logs_brutos_webhook
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_raw_logs') THEN
    ALTER TABLE webhook_raw_logs RENAME TO logs_brutos_webhook;
  END IF;
END $$;

-- Renomear colunas da tabela logs_brutos_webhook (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_brutos_webhook') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'method') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN method TO metodo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'path') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN path TO caminho;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'raw_body') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN raw_body TO corpo_bruto;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'headers') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN headers TO cabecalhos;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'ip_address') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN ip_address TO endereco_ip;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'user_agent') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN user_agent TO agente_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'created_at') THEN
      ALTER TABLE logs_brutos_webhook RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'criado_em') THEN
      ALTER TABLE logs_brutos_webhook ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 2.6. RENOMEAR TABELA: funnels → funis
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funnels') THEN
    ALTER TABLE funnels RENAME TO funis;
  END IF;
END $$;

-- Renomear colunas da tabela funis (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'user_id') THEN
      ALTER TABLE funis RENAME COLUMN user_id TO id_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'name') THEN
      ALTER TABLE funis RENAME COLUMN name TO nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'description') THEN
      ALTER TABLE funis RENAME COLUMN description TO descricao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'status') THEN
      ALTER TABLE funis RENAME COLUMN status TO status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'trigger_type') THEN
      ALTER TABLE funis RENAME COLUMN trigger_type TO tipo_gatilho;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'trigger_value') THEN
      ALTER TABLE funis RENAME COLUMN trigger_value TO valor_gatilho;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'is_active') THEN
      ALTER TABLE funis RENAME COLUMN is_active TO ativo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'created_at') THEN
      ALTER TABLE funis RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'criado_em') THEN
      ALTER TABLE funis ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'updated_at') THEN
      ALTER TABLE funis RENAME COLUMN updated_at TO atualizado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'atualizado_em') THEN
      ALTER TABLE funis ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de funis
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE funis DROP CONSTRAINT IF EXISTS funnels_user_id_fkey;
      ALTER TABLE funis DROP CONSTRAINT IF EXISTS funis_user_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'id_usuario') THEN
        ALTER TABLE funis ADD CONSTRAINT funis_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de funis
DROP INDEX IF EXISTS idx_funnels_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_funis_id_usuario ON funis(id_usuario);
    END IF;
  END IF;
END $$;

-- 2.7. RENOMEAR TABELA: funnel_stages → etapas_funil
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funnel_stages') THEN
    ALTER TABLE funnel_stages RENAME TO etapas_funil;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funnel_steps') THEN
    ALTER TABLE funnel_steps RENAME TO etapas_funil;
  END IF;
END $$;

-- Renomear colunas da tabela etapas_funil (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etapas_funil') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'funnel_id') THEN
      ALTER TABLE etapas_funil RENAME COLUMN funnel_id TO id_funil;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'order_index') THEN
      ALTER TABLE etapas_funil RENAME COLUMN order_index TO indice_ordem;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'message_text') THEN
      ALTER TABLE etapas_funil RENAME COLUMN message_text TO texto_mensagem;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'delay_seconds') THEN
      ALTER TABLE etapas_funil RENAME COLUMN delay_seconds TO atraso_segundos;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'action_type') THEN
      ALTER TABLE etapas_funil RENAME COLUMN action_type TO tipo_acao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'created_at') THEN
      ALTER TABLE etapas_funil RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'criado_em') THEN
      ALTER TABLE etapas_funil ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de etapas_funil
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etapas_funil') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') THEN
      ALTER TABLE etapas_funil DROP CONSTRAINT IF EXISTS funnel_stages_funnel_id_fkey;
      ALTER TABLE etapas_funil DROP CONSTRAINT IF EXISTS funnel_steps_funnel_id_fkey;
      ALTER TABLE etapas_funil DROP CONSTRAINT IF EXISTS etapas_funil_funnel_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'id_funil') THEN
        ALTER TABLE etapas_funil ADD CONSTRAINT etapas_funil_id_funil_fkey 
          FOREIGN KEY (id_funil) REFERENCES funis(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de etapas_funil
DROP INDEX IF EXISTS idx_funnel_stages_funnel_id;
DROP INDEX IF EXISTS idx_funnel_steps_funnel_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etapas_funil') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'id_funil') THEN
      CREATE INDEX IF NOT EXISTS idx_etapas_funil_id_funil ON etapas_funil(id_funil);
    END IF;
  END IF;
END $$;

-- 2.8. RENOMEAR TABELA: quick_replies → respostas_rapidas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quick_replies') THEN
    ALTER TABLE quick_replies RENAME TO respostas_rapidas;
  END IF;
END $$;

-- Renomear colunas da tabela respostas_rapidas (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'respostas_rapidas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'user_id') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN user_id TO id_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'title') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN title TO titulo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'shortcut') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN shortcut TO atalho;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'message') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN message TO mensagem;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'category') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN category TO categoria;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'usage_count') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN usage_count TO contador_uso;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'created_at') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'criado_em') THEN
      ALTER TABLE respostas_rapidas ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'updated_at') THEN
      ALTER TABLE respostas_rapidas RENAME COLUMN updated_at TO atualizado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'atualizado_em') THEN
      ALTER TABLE respostas_rapidas ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de respostas_rapidas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'respostas_rapidas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE respostas_rapidas DROP CONSTRAINT IF EXISTS quick_replies_user_id_fkey;
      ALTER TABLE respostas_rapidas DROP CONSTRAINT IF EXISTS respostas_rapidas_user_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'id_usuario') THEN
        ALTER TABLE respostas_rapidas ADD CONSTRAINT respostas_rapidas_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de respostas_rapidas
DROP INDEX IF EXISTS idx_quick_replies_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'respostas_rapidas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_respostas_rapidas_id_usuario ON respostas_rapidas(id_usuario);
    END IF;
  END IF;
END $$;

-- 2.9. RENOMEAR TABELA: tags → etiquetas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags') THEN
    ALTER TABLE tags RENAME TO etiquetas;
  END IF;
END $$;

-- Renomear colunas da tabela etiquetas (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'user_id') THEN
      ALTER TABLE etiquetas RENAME COLUMN user_id TO id_usuario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'name') THEN
      ALTER TABLE etiquetas RENAME COLUMN name TO nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'color') THEN
      ALTER TABLE etiquetas RENAME COLUMN color TO cor;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'created_at') THEN
      ALTER TABLE etiquetas RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'criado_em') THEN
      ALTER TABLE etiquetas ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de etiquetas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE etiquetas DROP CONSTRAINT IF EXISTS tags_user_id_fkey;
      ALTER TABLE etiquetas DROP CONSTRAINT IF EXISTS etiquetas_user_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'id_usuario') THEN
        ALTER TABLE etiquetas ADD CONSTRAINT etiquetas_id_usuario_fkey 
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de etiquetas
DROP INDEX IF EXISTS idx_tags_user_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'id_usuario') THEN
      CREATE INDEX IF NOT EXISTS idx_etiquetas_id_usuario ON etiquetas(id_usuario);
    END IF;
  END IF;
END $$;

-- 2.10. RENOMEAR TABELA: contact_tags → etiquetas_contato
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_tags') THEN
    ALTER TABLE contact_tags RENAME TO etiquetas_contato;
  END IF;
END $$;

-- Renomear colunas da tabela etiquetas_contato (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'contact_id') THEN
      ALTER TABLE etiquetas_contato RENAME COLUMN contact_id TO id_contato;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'tag_id') THEN
      ALTER TABLE etiquetas_contato RENAME COLUMN tag_id TO id_etiqueta;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'created_at') THEN
      ALTER TABLE etiquetas_contato RENAME COLUMN created_at TO criado_em;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'criado_em') THEN
      ALTER TABLE etiquetas_contato ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Atualizar foreign keys de etiquetas_contato
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') THEN
      ALTER TABLE etiquetas_contato DROP CONSTRAINT IF EXISTS contact_tags_contact_id_fkey;
      ALTER TABLE etiquetas_contato DROP CONSTRAINT IF EXISTS etiquetas_contato_contact_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_contato') THEN
        ALTER TABLE etiquetas_contato ADD CONSTRAINT etiquetas_contato_id_contato_fkey 
          FOREIGN KEY (id_contato) REFERENCES contatos(id) ON DELETE CASCADE;
      END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') THEN
      ALTER TABLE etiquetas_contato DROP CONSTRAINT IF EXISTS contact_tags_tag_id_fkey;
      ALTER TABLE etiquetas_contato DROP CONSTRAINT IF EXISTS etiquetas_contato_tag_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_etiqueta') THEN
        ALTER TABLE etiquetas_contato ADD CONSTRAINT etiquetas_contato_id_etiqueta_fkey 
          FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Atualizar índices de etiquetas_contato
DROP INDEX IF EXISTS idx_contact_tags_contact_id;
DROP INDEX IF EXISTS idx_contact_tags_tag_id;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_contato') THEN
      CREATE INDEX IF NOT EXISTS idx_etiquetas_contato_id_contato ON etiquetas_contato(id_contato);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_etiqueta') THEN
      CREATE INDEX IF NOT EXISTS idx_etiquetas_contato_id_etiqueta ON etiquetas_contato(id_etiqueta);
    END IF;
  END IF;
END $$;

-- =============================================
-- FIM DA MIGRAÇÃO BLOCO 5
-- =============================================


