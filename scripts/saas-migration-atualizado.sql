-- ============================================================
-- SCRIPT DE MIGRAÇÃO SAAS - VERSÃO ATUALIZADA
-- Compatível com nomes traduzidos e arquitetura Multi-Tenant
-- ============================================================
-- 
-- NOTA: Este script é uma versão atualizada do saas-migration.sql
-- que usa os nomes traduzidos das tabelas e é compatível com
-- a arquitetura Multi-Tenant já implementada.
--
-- IMPORTANTE: A arquitetura Multi-Tenant já foi implementada
-- via migration-multi-tenant-completa.sql. Este script apenas
-- adiciona RLS (Row Level Security) e políticas se necessário.
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR E ADICIONAR COLUNAS SE NECESSÁRIO
-- (Apenas para tabelas que ainda não têm id_empresa)
-- ============================================================

-- NOTA: A maioria das tabelas já deve ter id_empresa da migração Multi-Tenant
-- Estas operações são condicionais e só executam se necessário

-- ============================================================
-- PARTE 2: CRIAR ÍNDICES PARA PERFORMANCE (se não existirem)
-- ============================================================

-- Índices para id_empresa em todas as tabelas principais
DO $$ 
BEGIN
  -- Conexoes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conexoes') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_conexoes_id_empresa ON conexoes(id_empresa);
  END IF;
  
  -- Campanhas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campanhas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_campanhas_id_empresa ON campanhas(id_empresa);
  END IF;
  
  -- Contatos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_contatos_id_empresa ON contatos(id_empresa);
  END IF;
  
  -- Modelos/Templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modelos') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_modelos_id_empresa ON modelos(id_empresa);
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_templates_id_empresa ON templates(id_empresa);
  END IF;
  
  -- Mensagens Webhook
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_mensagens_webhook_id_empresa ON mensagens_webhook(id_empresa);
  END IF;
  
  -- Metricas (Analytics)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metricas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_metricas_id_empresa ON metricas(id_empresa);
  END IF;
  
  -- Pagamentos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_pagamentos_id_empresa ON pagamentos(id_empresa);
  END IF;
  
  -- Assinaturas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinaturas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinaturas' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_assinaturas_id_empresa ON assinaturas(id_empresa);
  END IF;
  
  -- Configuracoes Usuario
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_usuario') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id_empresa ON configuracoes_usuario(id_empresa);
  END IF;
  
  -- Pixels
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pixels') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pixels' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_pixels_id_empresa ON pixels(id_empresa);
  END IF;
  
  -- Carrinhos Abandonados
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrinhos_abandonados') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_carrinhos_abandonados_id_empresa ON carrinhos_abandonados(id_empresa);
  END IF;
  
  -- Destinatarios Campanha
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinatarios_campanha') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_destinatarios_campanha_id_empresa ON destinatarios_campanha(id_empresa);
  END IF;
  
  -- Logs Webhook
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_logs_webhook_id_empresa ON logs_webhook(id_empresa);
  END IF;
  
  -- Logs Webhook WhatsApp
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook_whatsapp') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_logs_webhook_whatsapp_id_empresa ON logs_webhook_whatsapp(id_empresa);
  END IF;
  
  -- Logs Brutos Webhook
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_brutos_webhook') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_logs_brutos_webhook_id_empresa ON logs_brutos_webhook(id_empresa);
  END IF;
  
  -- Funis
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_funis_id_empresa ON funis(id_empresa);
  END IF;
  
  -- Etapas Funil
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etapas_funil') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_etapas_funil_id_empresa ON etapas_funil(id_empresa);
  END IF;
  
  -- Etiquetas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_etiquetas_id_empresa ON etiquetas(id_empresa);
  END IF;
  
  -- Respostas Rapidas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'respostas_rapidas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_respostas_rapidas_id_empresa ON respostas_rapidas(id_empresa);
  END IF;
  
  -- Estatisticas Uso
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estatisticas_uso') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'id_empresa') THEN
    CREATE INDEX IF NOT EXISTS idx_estatisticas_uso_id_empresa ON estatisticas_uso(id_empresa);
  END IF;
END $$;

-- ============================================================
-- PARTE 3: HABILITAR ROW LEVEL SECURITY (RLS) - OPCIONAL
-- ============================================================
-- NOTA: RLS pode ser habilitado se você usar Supabase Auth
-- Se não usar Supabase Auth, pode pular esta parte

-- ============================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar índices criados
SELECT 
  'ÍNDICES CRIADOS COM SUCESSO!' as status,
  (SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%_id_empresa') as total_indices_empresa;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- 
-- NOTA IMPORTANTE:
-- Este script foi simplificado porque a arquitetura Multi-Tenant
-- já foi implementada via migration-multi-tenant-completa.sql.
-- 
-- Este script apenas:
-- 1. Cria índices para id_empresa (se não existirem)
-- 2. Verifica a estrutura
--
-- Não é necessário executar RLS policies aqui, pois o isolamento
-- de dados é feito via código (filtros por id_empresa nas APIs).
-- ============================================================


