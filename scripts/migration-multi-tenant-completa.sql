-- =============================================
-- MIGRAÇÃO COMPLETA PARA ARQUITETURA MULTI-TENANT (SaaS)
-- ScalaZap - Sistema de Disparo em Massa WhatsApp
-- =============================================
-- 
-- Este script transforma o sistema de usuário individual para Multi-Tenant
-- onde Empresas detêm os dados e Membros são usuários que pertencem a empresas
--
-- ORDEM DE EXECUÇÃO:
-- 1. Criar tabelas empresas e membros
-- 2. Migrar dados de usuarios para empresas e membros
-- 3. Adicionar id_empresa em todas as tabelas de dados
-- 4. Preencher id_empresa baseado no dono atual
-- =============================================

-- =============================================
-- PARTE 1: CRIAR TABELAS EMPRESAS E MEMBROS
-- =============================================

-- 1.1. Criar tabela empresas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(50), -- CNPJ ou CPF
  email VARCHAR(255),
  telefone VARCHAR(50),
  plano_atual VARCHAR(50) DEFAULT 'starter',
  status_assinatura VARCHAR(50) DEFAULT 'pending' CHECK (status_assinatura IN ('pending', 'active', 'cancelled', 'expired', 'suspended')),
  limite_conexoes INTEGER DEFAULT 1,
  limite_mensagens_mes INTEGER DEFAULT 1000,
  limite_campanhas_mes INTEGER DEFAULT 10,
  limite_contatos INTEGER DEFAULT 500,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas(email);
CREATE INDEX IF NOT EXISTS idx_empresas_status_assinatura ON empresas(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_empresas_documento ON empresas(documento);

-- 1.2. Criar tabela membros
CREATE TABLE IF NOT EXISTS membros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID, -- FK para auth.users (se usar Supabase Auth) ou pode ser email/username
  id_empresa UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cargo VARCHAR(50) DEFAULT 'membro' CHECK (cargo IN ('dono', 'admin', 'membro', 'visualizador')),
  eh_superadmin BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_empresa, email) -- Um email só pode ter um cargo por empresa
);

-- Índices para membros
CREATE INDEX IF NOT EXISTS idx_membros_id_empresa ON membros(id_empresa);
CREATE INDEX IF NOT EXISTS idx_membros_email ON membros(email);
CREATE INDEX IF NOT EXISTS idx_membros_id_usuario ON membros(id_usuario);
CREATE INDEX IF NOT EXISTS idx_membros_eh_superadmin ON membros(eh_superadmin) WHERE eh_superadmin = true;
CREATE INDEX IF NOT EXISTS idx_membros_ativo ON membros(ativo) WHERE ativo = true;

-- =============================================
-- PARTE 2: MIGRAR DADOS DE usuarios PARA empresas E membros
-- =============================================

DO $$ 
DECLARE
  usuario_record RECORD;
  nova_empresa_id UUID;
  novo_membro_id UUID;
BEGIN
  -- Verificar se a tabela usuarios existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
    
    -- Para cada usuário existente, criar uma empresa e um membro
    FOR usuario_record IN 
      SELECT * FROM usuarios
    LOOP
      -- Criar empresa baseada no usuário
      INSERT INTO empresas (
        nome,
        email,
        telefone,
        plano_atual,
        status_assinatura,
        limite_conexoes,
        limite_mensagens_mes,
        limite_campanhas_mes,
        limite_contatos,
        criado_em,
        atualizado_em
      ) VALUES (
        COALESCE(usuario_record.nome, 'Empresa ' || usuario_record.email),
        usuario_record.email,
        usuario_record.telefone,
        COALESCE(usuario_record.plano, 'starter'),
        COALESCE(usuario_record.status_plano, 'pending'),
        COALESCE(usuario_record.conexoes, 1),
        1000, -- Limite padrão
        10,   -- Limite padrão
        500,  -- Limite padrão
        COALESCE(usuario_record.criado_em, NOW()),
        COALESCE(usuario_record.atualizado_em, NOW())
      )
      RETURNING id INTO nova_empresa_id;
      
      -- Criar membro vinculado à empresa (como 'dono')
      INSERT INTO membros (
        id_usuario,
        id_empresa,
        nome,
        email,
        cargo,
        eh_superadmin,
        ativo,
        criado_em,
        atualizado_em
      ) VALUES (
        usuario_record.id, -- Se usar UUID do usuarios
        nova_empresa_id,
        COALESCE(usuario_record.nome, 'Proprietário'),
        usuario_record.email,
        'dono',
        false,
        true,
        COALESCE(usuario_record.criado_em, NOW()),
        COALESCE(usuario_record.atualizado_em, NOW())
      )
      RETURNING id INTO novo_membro_id;
      
      -- Criar uma entrada na tabela de mapeamento temporário (para uso na migração)
      -- Vamos usar uma tabela temporária ou variável para mapear usuario_id -> empresa_id
      -- Por enquanto, vamos armazenar isso em uma coluna temporária na tabela usuarios
      
    END LOOP;
    
    RAISE NOTICE 'Migração de usuarios para empresas e membros concluída';
  ELSE
    RAISE NOTICE 'Tabela usuarios não encontrada. Pulando migração de dados.';
  END IF;
END $$;

-- =============================================
-- PARTE 3: ADICIONAR id_empresa EM TODAS AS TABELAS DE DADOS
-- =============================================

-- 3.1. Tabela conexoes
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conexoes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'id_empresa') THEN
      ALTER TABLE conexoes ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_conexoes_id_empresa ON conexoes(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.2. Tabela contatos
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'id_empresa') THEN
      ALTER TABLE contatos ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_contatos_id_empresa ON contatos(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.3. Tabela campanhas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campanhas') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'id_empresa') THEN
      ALTER TABLE campanhas ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_campanhas_id_empresa ON campanhas(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.4. Tabela destinatarios_campanha
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinatarios_campanha') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinatarios_campanha' AND column_name = 'id_empresa') THEN
      ALTER TABLE destinatarios_campanha ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_destinatarios_campanha_id_empresa ON destinatarios_campanha(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.5. Tabela mensagens (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens' AND column_name = 'id_empresa') THEN
      ALTER TABLE mensagens ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_mensagens_id_empresa ON mensagens(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.6. Tabela mensagens_webhook
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'id_empresa') THEN
      ALTER TABLE mensagens_webhook ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_mensagens_webhook_id_empresa ON mensagens_webhook(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.7. Tabela modelos (templates)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modelos') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modelos' AND column_name = 'id_empresa') THEN
      ALTER TABLE modelos ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_modelos_id_empresa ON modelos(id_empresa);
    END IF;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'id_empresa') THEN
      ALTER TABLE templates ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_templates_id_empresa ON templates(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.8. Tabela funis
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'id_empresa') THEN
      ALTER TABLE funis ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_funis_id_empresa ON funis(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.9. Tabela etapas_funil
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etapas_funil') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etapas_funil' AND column_name = 'id_empresa') THEN
      ALTER TABLE etapas_funil ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_etapas_funil_id_empresa ON etapas_funil(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.10. Tabela etiquetas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'id_empresa') THEN
      ALTER TABLE etiquetas ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_etiquetas_id_empresa ON etiquetas(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.11. Tabela etiquetas_contato
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas_contato') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas_contato' AND column_name = 'id_empresa') THEN
      ALTER TABLE etiquetas_contato ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_etiquetas_contato_id_empresa ON etiquetas_contato(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.12. Tabela carrinhos_abandonados
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrinhos_abandonados') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carrinhos_abandonados' AND column_name = 'id_empresa') THEN
      ALTER TABLE carrinhos_abandonados ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_carrinhos_abandonados_id_empresa ON carrinhos_abandonados(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.13. Tabela assinaturas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinaturas') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinaturas' AND column_name = 'id_empresa') THEN
      ALTER TABLE assinaturas ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_assinaturas_id_empresa ON assinaturas(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.14. Tabela pagamentos
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos' AND column_name = 'id_empresa') THEN
      ALTER TABLE pagamentos ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_pagamentos_id_empresa ON pagamentos(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.15. Tabela metricas (analytics)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metricas') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metricas' AND column_name = 'id_empresa') THEN
      ALTER TABLE metricas ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_metricas_id_empresa ON metricas(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.16. Tabela pixels
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pixels') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pixels' AND column_name = 'id_empresa') THEN
      ALTER TABLE pixels ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_pixels_id_empresa ON pixels(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.17. Tabela logs_webhook
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook' AND column_name = 'id_empresa') THEN
      ALTER TABLE logs_webhook ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_logs_webhook_id_empresa ON logs_webhook(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.18. Tabela logs_webhook_whatsapp
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_webhook_whatsapp') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_webhook_whatsapp' AND column_name = 'id_empresa') THEN
      ALTER TABLE logs_webhook_whatsapp ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_logs_webhook_whatsapp_id_empresa ON logs_webhook_whatsapp(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.19. Tabela logs_brutos_webhook
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs_brutos_webhook') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs_brutos_webhook' AND column_name = 'id_empresa') THEN
      ALTER TABLE logs_brutos_webhook ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_logs_brutos_webhook_id_empresa ON logs_brutos_webhook(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.20. Tabela respostas_rapidas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'respostas_rapidas') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas_rapidas' AND column_name = 'id_empresa') THEN
      ALTER TABLE respostas_rapidas ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_respostas_rapidas_id_empresa ON respostas_rapidas(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.21. Tabela estatisticas_uso
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estatisticas_uso') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estatisticas_uso' AND column_name = 'id_empresa') THEN
      ALTER TABLE estatisticas_uso ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_estatisticas_uso_id_empresa ON estatisticas_uso(id_empresa);
    END IF;
  END IF;
END $$;

-- 3.22. Tabela configuracoes_usuario (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_usuario') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_usuario' AND column_name = 'id_empresa') THEN
      ALTER TABLE configuracoes_usuario ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id_empresa ON configuracoes_usuario(id_empresa);
    END IF;
  END IF;
END $$;

-- =============================================
-- PARTE 4: PREENCHER id_empresa BASEADO NO DONO ATUAL
-- =============================================

-- 4.1. Preencher id_empresa em conexoes (baseado em id_usuario)
DO $$ 
DECLARE
  conexao_record RECORD;
  empresa_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conexoes') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'id_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conexoes' AND column_name = 'id_empresa') THEN
    
    FOR conexao_record IN 
      SELECT c.id, c.id_usuario 
      FROM conexoes c 
      WHERE c.id_empresa IS NULL AND c.id_usuario IS NOT NULL
    LOOP
      -- Buscar empresa do membro baseado no id_usuario
      SELECT m.id_empresa INTO empresa_id
      FROM membros m
      WHERE m.id_usuario = conexao_record.id_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE conexoes 
        SET id_empresa = empresa_id 
        WHERE id = conexao_record.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 4.2. Preencher id_empresa em contatos (baseado em id_usuario)
DO $$ 
DECLARE
  contato_record RECORD;
  empresa_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'id_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contatos' AND column_name = 'id_empresa') THEN
    
    FOR contato_record IN 
      SELECT c.id, c.id_usuario 
      FROM contatos c 
      WHERE c.id_empresa IS NULL AND c.id_usuario IS NOT NULL
    LOOP
      SELECT m.id_empresa INTO empresa_id
      FROM membros m
      WHERE m.id_usuario = contato_record.id_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE contatos 
        SET id_empresa = empresa_id 
        WHERE id = contato_record.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 4.3. Preencher id_empresa em campanhas (baseado em id_usuario)
DO $$ 
DECLARE
  campanha_record RECORD;
  empresa_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campanhas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'id_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campanhas' AND column_name = 'id_empresa') THEN
    
    FOR campanha_record IN 
      SELECT c.id, c.id_usuario 
      FROM campanhas c 
      WHERE c.id_empresa IS NULL AND c.id_usuario IS NOT NULL
    LOOP
      SELECT m.id_empresa INTO empresa_id
      FROM membros m
      WHERE m.id_usuario = campanha_record.id_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE campanhas 
        SET id_empresa = empresa_id 
        WHERE id = campanha_record.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 4.4. Preencher id_empresa em mensagens_webhook (baseado em id_usuario ou conexao)
DO $$ 
DECLARE
  mensagem_record RECORD;
  empresa_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_webhook') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_webhook' AND column_name = 'id_empresa') THEN
    
    -- Tentar preencher via id_usuario
    FOR mensagem_record IN 
      SELECT m.id, m.id_usuario 
      FROM mensagens_webhook m 
      WHERE m.id_empresa IS NULL AND m.id_usuario IS NOT NULL
    LOOP
      SELECT mem.id_empresa INTO empresa_id
      FROM membros mem
      WHERE mem.id_usuario = mensagem_record.id_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE mensagens_webhook 
        SET id_empresa = empresa_id 
        WHERE id = mensagem_record.id;
      END IF;
    END LOOP;
    
    -- Tentar preencher via conexao (id_numero_telefone -> conexoes -> id_empresa)
    FOR mensagem_record IN 
      SELECT m.id, m.id_numero_telefone 
      FROM mensagens_webhook m 
      WHERE m.id_empresa IS NULL AND m.id_numero_telefone IS NOT NULL
    LOOP
      SELECT c.id_empresa INTO empresa_id
      FROM conexoes c
      WHERE c.id_numero_telefone = mensagem_record.id_numero_telefone
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE mensagens_webhook 
        SET id_empresa = empresa_id 
        WHERE id = mensagem_record.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 4.5. Preencher id_empresa em outras tabelas (padrão similar)
-- Funis
DO $$ 
DECLARE
  registro RECORD;
  empresa_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funis') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'id_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funis' AND column_name = 'id_empresa') THEN
    
    FOR registro IN 
      SELECT f.id, f.id_usuario 
      FROM funis f 
      WHERE f.id_empresa IS NULL AND f.id_usuario IS NOT NULL
    LOOP
      SELECT m.id_empresa INTO empresa_id
      FROM membros m
      WHERE m.id_usuario = registro.id_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE funis 
        SET id_empresa = empresa_id 
        WHERE id = registro.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Etiquetas
DO $$ 
DECLARE
  registro RECORD;
  empresa_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'etiquetas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'id_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'etiquetas' AND column_name = 'id_empresa') THEN
    
    FOR registro IN 
      SELECT e.id, e.id_usuario 
      FROM etiquetas e 
      WHERE e.id_empresa IS NULL AND e.id_usuario IS NOT NULL
    LOOP
      SELECT m.id_empresa INTO empresa_id
      FROM membros m
      WHERE m.id_usuario = registro.id_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE etiquetas 
        SET id_empresa = empresa_id 
        WHERE id = registro.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Pagamentos e Assinaturas (via email_usuario)
DO $$ 
DECLARE
  registro RECORD;
  empresa_id UUID;
BEGIN
  -- Pagamentos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos' AND column_name = 'email_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos' AND column_name = 'id_empresa') THEN
    
    FOR registro IN 
      SELECT p.id, p.email_usuario 
      FROM pagamentos p 
      WHERE p.id_empresa IS NULL AND p.email_usuario IS NOT NULL
    LOOP
      SELECT e.id INTO empresa_id
      FROM empresas e
      WHERE e.email = registro.email_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE pagamentos 
        SET id_empresa = empresa_id 
        WHERE id = registro.id;
      END IF;
    END LOOP;
  END IF;
  
  -- Assinaturas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assinaturas') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinaturas' AND column_name = 'email_usuario')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assinaturas' AND column_name = 'id_empresa') THEN
    
    FOR registro IN 
      SELECT a.id, a.email_usuario 
      FROM assinaturas a 
      WHERE a.id_empresa IS NULL AND a.email_usuario IS NOT NULL
    LOOP
      SELECT e.id INTO empresa_id
      FROM empresas e
      WHERE e.email = registro.email_usuario
      LIMIT 1;
      
      IF empresa_id IS NOT NULL THEN
        UPDATE assinaturas 
        SET id_empresa = empresa_id 
        WHERE id = registro.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- =============================================
-- PARTE 5: CRIAR SUPERADMIN MANUALMENTE (OPCIONAL)
-- =============================================

-- Inserir um superadmin manual (ajuste o email conforme necessário)
DO $$ 
DECLARE
  superadmin_email VARCHAR := 'admin@scalazap.com';
  empresa_superadmin_id UUID;
BEGIN
  -- Criar empresa para superadmin (se não existir)
  INSERT INTO empresas (
    nome,
    email,
    plano_atual,
    status_assinatura
  ) VALUES (
    'ScalaZap Administração',
    superadmin_email,
    'unlimited',
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO empresa_superadmin_id;
  
  -- Se não retornou ID, buscar existente
  IF empresa_superadmin_id IS NULL THEN
    SELECT id INTO empresa_superadmin_id
    FROM empresas
    WHERE email = superadmin_email
    LIMIT 1;
  END IF;
  
  -- Criar membro superadmin
  IF empresa_superadmin_id IS NOT NULL THEN
    INSERT INTO membros (
      id_empresa,
      nome,
      email,
      cargo,
      eh_superadmin,
      ativo
    ) VALUES (
      empresa_superadmin_id,
      'Super Administrador',
      superadmin_email,
      'dono',
      true,
      true
    )
    ON CONFLICT (id_empresa, email) DO UPDATE
    SET eh_superadmin = true, ativo = true;
  END IF;
END $$;

-- =============================================
-- FIM DA MIGRAÇÃO MULTI-TENANT
-- =============================================


