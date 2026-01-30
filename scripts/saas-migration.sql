-- ============================================================
-- SCRIPT DE MIGRAÇÃO PARA ARQUITETURA SAAS MULTI-TENANT
-- ScalaZap - Sistema de Disparo em Massa WhatsApp
-- ============================================================
-- 
-- Este script configura o banco de dados para funcionar como SaaS
-- onde cada usuário tem seus dados completamente isolados.
--
-- COMO EXECUTAR:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor" no menu lateral
-- 4. Cole este script inteiro
-- 5. Clique em "Run" para executar
--
-- ============================================================

-- ============================================================
-- PARTE 1: ADICIONAR user_id NAS TABELAS QUE NÃO TÊM
-- ============================================================

-- NOTA: Estas tabelas já foram traduzidas e têm id_empresa (não user_id)
-- A migração Multi-Tenant já foi executada, então estas operações são desnecessárias
-- Mantido apenas para referência histórica

-- Tabela mensagens_webhook - já tem id_empresa (não precisa user_id)
-- ALTER TABLE mensagens_webhook ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Tabela destinatarios_campanha - já tem id_empresa
-- ALTER TABLE destinatarios_campanha ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Tabela logs_brutos_webhook - já tem id_empresa
-- ALTER TABLE logs_brutos_webhook ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Tabela logs_webhook_whatsapp - já tem id_empresa
-- ALTER TABLE logs_webhook_whatsapp ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ============================================================
-- PARTE 2: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

-- NOTA: Estes índices usam nomes antigos. As tabelas foram traduzidas.
-- Os índices para id_empresa já foram criados na migração Multi-Tenant.
-- Mantido apenas para referência histórica.

-- Índices para id_empresa (já criados na migração Multi-Tenant)
-- CREATE INDEX IF NOT EXISTS idx_conexoes_id_empresa ON conexoes(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_campanhas_id_empresa ON campanhas(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_contatos_id_empresa ON contatos(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_modelos_id_empresa ON modelos(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_metricas_id_empresa ON metricas(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_pagamentos_id_empresa ON pagamentos(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_assinaturas_id_empresa ON assinaturas(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id_empresa ON configuracoes_usuario(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_pixels_id_empresa ON pixels(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_carrinhos_abandonados_id_empresa ON carrinhos_abandonados(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_mensagens_webhook_id_empresa ON mensagens_webhook(id_empresa);
-- CREATE INDEX IF NOT EXISTS idx_destinatarios_campanha_id_empresa ON destinatarios_campanha(id_empresa);

-- ============================================================
-- PARTE 3: HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================

-- NOTA: RLS (Row Level Security) é opcional e requer Supabase Auth.
-- O isolamento de dados Multi-Tenant é feito via código (filtros por id_empresa).
-- Se você usar Supabase Auth, pode habilitar RLS. Caso contrário, pule esta parte.

-- Habilitar RLS em tabelas traduzidas (apenas se usar Supabase Auth)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conexoes') THEN
    ALTER TABLE conexoes ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campanhas') THEN
    ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinatarios_campanha') THEN
    ALTER TABLE destinatarios_campanha ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') THEN
    ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modelos') THEN
    ALTER TABLE modelos ENABLE ROW LEVEL SECURITY;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
    ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metricas') THEN
    ALTER TABLE metricas ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos') THEN
    ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinaturas') THEN
    ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_usuario') THEN
    ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pixels') THEN
    ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrinhos_abandonados') THEN
    ALTER TABLE carrinhos_abandonados ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    ALTER TABLE mensagens_webhook ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook') THEN
    ALTER TABLE logs_webhook ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================
-- PARTE 4: CRIAR POLÍTICAS DE ACESSO (RLS POLICIES)
-- ============================================================

-- Função auxiliar para verificar se o membro é superadmin (Multi-Tenant)
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM membros 
    WHERE id_usuario = auth.uid()::text
    AND eh_superadmin = true
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para obter id_empresa do membro autenticado
CREATE OR REPLACE FUNCTION get_empresa_id()
RETURNS UUID AS $$
DECLARE
  empresa_id UUID;
BEGIN
  SELECT id_empresa INTO empresa_id
  FROM membros
  WHERE id_usuario = auth.uid()::text
  AND ativo = true
  LIMIT 1;
  
  RETURN empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== CONEXOES (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conexoes') THEN
    DROP POLICY IF EXISTS "Users can view own connections" ON conexoes;
    DROP POLICY IF EXISTS "Users can insert own connections" ON conexoes;
    DROP POLICY IF EXISTS "Users can update own connections" ON conexoes;
    DROP POLICY IF EXISTS "Users can delete own connections" ON conexoes;
    
    -- Superadmin vê tudo, membro vê apenas da sua empresa
    EXECUTE 'CREATE POLICY "Membros can view own conexoes" ON conexoes
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own conexoes" ON conexoes
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own conexoes" ON conexoes
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own conexoes" ON conexoes
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== CAMPANHAS (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campanhas') THEN
    DROP POLICY IF EXISTS "Users can view own campaigns" ON campanhas;
    DROP POLICY IF EXISTS "Users can insert own campaigns" ON campanhas;
    DROP POLICY IF EXISTS "Users can update own campaigns" ON campanhas;
    DROP POLICY IF EXISTS "Users can delete own campaigns" ON campanhas;
    
    EXECUTE 'CREATE POLICY "Membros can view own campanhas" ON campanhas
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own campanhas" ON campanhas
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own campanhas" ON campanhas
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own campanhas" ON campanhas
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== DESTINATARIOS_CAMPANHA (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinatarios_campanha') THEN
    DROP POLICY IF EXISTS "Users can view own campaign_recipients" ON destinatarios_campanha;
    DROP POLICY IF EXISTS "Users can insert own campaign_recipients" ON destinatarios_campanha;
    DROP POLICY IF EXISTS "Users can update own campaign_recipients" ON destinatarios_campanha;
    DROP POLICY IF EXISTS "Users can delete own campaign_recipients" ON destinatarios_campanha;
    
    EXECUTE 'CREATE POLICY "Membros can view own destinatarios_campanha" ON destinatarios_campanha
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own destinatarios_campanha" ON destinatarios_campanha
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own destinatarios_campanha" ON destinatarios_campanha
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own destinatarios_campanha" ON destinatarios_campanha
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== CONTATOS (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') THEN
    DROP POLICY IF EXISTS "Users can view own contacts" ON contatos;
    DROP POLICY IF EXISTS "Users can insert own contacts" ON contatos;
    DROP POLICY IF EXISTS "Users can update own contacts" ON contatos;
    DROP POLICY IF EXISTS "Users can delete own contacts" ON contatos;
    
    EXECUTE 'CREATE POLICY "Membros can view own contatos" ON contatos
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own contatos" ON contatos
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own contatos" ON contatos
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own contatos" ON contatos
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== MODELOS/TEMPLATES (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modelos') THEN
    DROP POLICY IF EXISTS "Users can view own templates" ON modelos;
    DROP POLICY IF EXISTS "Users can insert own templates" ON modelos;
    DROP POLICY IF EXISTS "Users can update own templates" ON modelos;
    DROP POLICY IF EXISTS "Users can delete own templates" ON modelos;
    
    EXECUTE 'CREATE POLICY "Membros can view own modelos" ON modelos
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own modelos" ON modelos
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own modelos" ON modelos
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own modelos" ON modelos
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
    DROP POLICY IF EXISTS "Users can view own templates" ON templates;
    DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
    DROP POLICY IF EXISTS "Users can update own templates" ON templates;
    DROP POLICY IF EXISTS "Users can delete own templates" ON templates;
    
    EXECUTE 'CREATE POLICY "Membros can view own templates" ON templates
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own templates" ON templates
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own templates" ON templates
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own templates" ON templates
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== METRICAS (Analytics) (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metricas') THEN
    DROP POLICY IF EXISTS "Users can view own analytics" ON metricas;
    DROP POLICY IF EXISTS "Users can insert own analytics" ON metricas;
    DROP POLICY IF EXISTS "Users can update own analytics" ON metricas;
    
    EXECUTE 'CREATE POLICY "Membros can view own metricas" ON metricas
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own metricas" ON metricas
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own metricas" ON metricas
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== PAGAMENTOS (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos') THEN
    DROP POLICY IF EXISTS "Users can view own payments" ON pagamentos;
    DROP POLICY IF EXISTS "Users can insert own payments" ON pagamentos;
    
    EXECUTE 'CREATE POLICY "Membros can view own pagamentos" ON pagamentos
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own pagamentos" ON pagamentos
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== ASSINATURAS (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinaturas') THEN
    DROP POLICY IF EXISTS "Users can view own subscriptions" ON assinaturas;
    DROP POLICY IF EXISTS "Users can insert own subscriptions" ON assinaturas;
    DROP POLICY IF EXISTS "Users can update own subscriptions" ON assinaturas;
    
    EXECUTE 'CREATE POLICY "Membros can view own assinaturas" ON assinaturas
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own assinaturas" ON assinaturas
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own assinaturas" ON assinaturas
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== CONFIGURACOES_USUARIO (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_usuario') THEN
    DROP POLICY IF EXISTS "Users can view own settings" ON configuracoes_usuario;
    DROP POLICY IF EXISTS "Users can insert own settings" ON configuracoes_usuario;
    DROP POLICY IF EXISTS "Users can update own settings" ON configuracoes_usuario;
    
    EXECUTE 'CREATE POLICY "Membros can view own configuracoes_usuario" ON configuracoes_usuario
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own configuracoes_usuario" ON configuracoes_usuario
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own configuracoes_usuario" ON configuracoes_usuario
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== PIXELS (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pixels') THEN
    DROP POLICY IF EXISTS "Users can view own pixels" ON pixels;
    DROP POLICY IF EXISTS "Users can insert own pixels" ON pixels;
    DROP POLICY IF EXISTS "Users can update own pixels" ON pixels;
    DROP POLICY IF EXISTS "Users can delete own pixels" ON pixels;
    
    EXECUTE 'CREATE POLICY "Membros can view own pixels" ON pixels
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own pixels" ON pixels
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own pixels" ON pixels
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can delete own pixels" ON pixels
      FOR DELETE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== CARRINHOS_ABANDONADOS (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrinhos_abandonados') THEN
    DROP POLICY IF EXISTS "Users can view own abandoned_carts" ON carrinhos_abandonados;
    DROP POLICY IF EXISTS "Users can insert own abandoned_carts" ON carrinhos_abandonados;
    DROP POLICY IF EXISTS "Users can update own abandoned_carts" ON carrinhos_abandonados;
    
    EXECUTE 'CREATE POLICY "Membros can view own carrinhos_abandonados" ON carrinhos_abandonados
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can insert own carrinhos_abandonados" ON carrinhos_abandonados
      FOR INSERT WITH CHECK (id_empresa = get_empresa_id())';
    
    EXECUTE 'CREATE POLICY "Membros can update own carrinhos_abandonados" ON carrinhos_abandonados
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== MENSAGENS_WEBHOOK (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    DROP POLICY IF EXISTS "Users can view own webhook_messages" ON mensagens_webhook;
    DROP POLICY IF EXISTS "Users can insert webhook_messages" ON mensagens_webhook;
    DROP POLICY IF EXISTS "Users can update own webhook_messages" ON mensagens_webhook;
    
    -- Superadmin vê tudo, membro vê apenas da sua empresa
    EXECUTE 'CREATE POLICY "Membros can view own mensagens_webhook" ON mensagens_webhook
      FOR SELECT USING (is_superadmin() OR id_empresa = get_empresa_id())';
    
    -- Permitir insert de webhooks (vem do servidor)
    EXECUTE 'CREATE POLICY "Anyone can insert mensagens_webhook" ON mensagens_webhook
      FOR INSERT WITH CHECK (true)';
    
    EXECUTE 'CREATE POLICY "Membros can update own mensagens_webhook" ON mensagens_webhook
      FOR UPDATE USING (is_superadmin() OR id_empresa = get_empresa_id())';
  END IF;
END $$;

-- ========== LOGS_WEBHOOK (Multi-Tenant) ==========
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook') THEN
    DROP POLICY IF EXISTS "Admins can view webhook_logs" ON logs_webhook;
    DROP POLICY IF EXISTS "Anyone can insert webhook_logs" ON logs_webhook;
    
    -- Apenas superadmin pode ver logs
    EXECUTE 'CREATE POLICY "Superadmin can view logs_webhook" ON logs_webhook
      FOR SELECT USING (is_superadmin())';
    
    EXECUTE 'CREATE POLICY "Anyone can insert logs_webhook" ON logs_webhook
      FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- ============================================================
-- PARTE 5: CRIAR TABELAS ADICIONAIS PARA SAAS
-- ============================================================

-- NOTA: A tabela respostas_rapidas já foi criada na migração Multi-Tenant
-- com id_empresa. Não é necessário criar novamente.
-- Se a tabela não existir, ela será criada pela migração Multi-Tenant.

-- NOTA: A tabela funis já foi criada na migração Multi-Tenant
-- com id_empresa. Não é necessário criar novamente.

-- NOTA: A tabela etapas_funil já foi criada na migração Multi-Tenant
-- com id_empresa. Não é necessário criar novamente.

-- NOTA: Tabela funnel_contacts não foi traduzida ainda.
-- Se precisar criar, use id_empresa em vez de user_id.
-- Por enquanto, mantida como está para compatibilidade.

-- NOTA: A tabela etiquetas já foi criada na migração Multi-Tenant
-- com id_empresa. Não é necessário criar novamente.

-- ============================================================
-- PARTE 6: CRIAR FUNÇÃO PARA AUTO-PREENCHER user_id
-- ============================================================

-- NOTA: Triggers para auto-preencher id_empresa não são necessários
-- porque o id_empresa é definido explicitamente no código da aplicação
-- baseado no contexto do membro autenticado.
-- 
-- Se você quiser usar triggers, pode criar uma função similar:
-- 
-- CREATE OR REPLACE FUNCTION set_empresa_id()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.id_empresa IS NULL THEN
--     NEW.id_empresa := get_empresa_id();
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- Mas é recomendado definir id_empresa explicitamente no código.

-- ============================================================
-- PARTE 7: CRIAR VIEW PARA DASHBOARD DO USUÁRIO
-- ============================================================

-- View atualizada para Multi-Tenant (usando empresas e membros)
CREATE OR REPLACE VIEW dashboard_stats_empresa AS
SELECT 
  e.id as empresa_id,
  e.nome as empresa_nome,
  e.plano_atual,
  e.status_assinatura,
  (SELECT COUNT(*) FROM conexoes WHERE id_empresa = e.id) as total_conexoes,
  (SELECT COUNT(*) FROM contatos WHERE id_empresa = e.id) as total_contatos,
  (SELECT COUNT(*) FROM campanhas WHERE id_empresa = e.id) as total_campanhas,
  (SELECT COALESCE(SUM(enviados), 0) FROM campanhas WHERE id_empresa = e.id) as total_mensagens_enviadas,
  (SELECT COUNT(*) FROM modelos WHERE id_empresa = e.id) as total_modelos,
  (SELECT COUNT(*) FROM funis WHERE id_empresa = e.id) as total_funis,
  (SELECT COUNT(*) FROM membros WHERE id_empresa = e.id AND ativo = true) as total_membros
FROM empresas e;

-- ============================================================
-- PARTE 8: VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'MIGRAÇÃO SAAS ATUALIZADA COM SUCESSO!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_policies) as total_policies,
  (SELECT COUNT(*) FROM empresas) as total_empresas,
  (SELECT COUNT(*) FROM membros) as total_membros,
  (SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%_id_empresa') as indices_empresa;
