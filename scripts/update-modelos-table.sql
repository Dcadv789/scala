-- ============================================
-- ATUALIZAR TABELA modelos PARA SUPORTAR META API
-- ============================================
-- Este script atualiza a tabela modelos para suportar a estrutura completa
-- da Meta WhatsApp Business API, incluindo componentes, status e sincronização

DO $$ 
BEGIN
  -- Verificar se a tabela modelos existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modelos') THEN
    
    -- Adicionar coluna id_meta (ID do template gerado pelo Facebook)
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'id_meta'
    ) THEN
      ALTER TABLE modelos 
      ADD COLUMN id_meta TEXT;
      
      RAISE NOTICE '✅ Coluna id_meta adicionada';
    ELSE
      RAISE NOTICE 'ℹ️ Coluna id_meta já existe';
    END IF;
    
    -- Adicionar coluna idioma
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'idioma'
    ) THEN
      ALTER TABLE modelos 
      ADD COLUMN idioma TEXT DEFAULT 'pt_BR';
      
      RAISE NOTICE '✅ Coluna idioma adicionada';
    ELSE
      RAISE NOTICE 'ℹ️ Coluna idioma já existe';
    END IF;
    
    -- Adicionar coluna categoria
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'categoria'
    ) THEN
      ALTER TABLE modelos 
      ADD COLUMN categoria TEXT CHECK (categoria IN ('MARKETING', 'UTILITY', 'AUTHENTICATION'));
      
      RAISE NOTICE '✅ Coluna categoria adicionada';
    ELSE
      RAISE NOTICE 'ℹ️ Coluna categoria já existe';
    END IF;
    
    -- Adicionar coluna componentes (JSONB para armazenar estrutura completa)
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'componentes'
    ) THEN
      ALTER TABLE modelos 
      ADD COLUMN componentes JSONB DEFAULT '{}'::jsonb;
      
      RAISE NOTICE '✅ Coluna componentes adicionada';
    ELSE
      RAISE NOTICE 'ℹ️ Coluna componentes já existe';
    END IF;
    
    -- Atualizar coluna status se existir (adicionar novos valores)
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'status'
    ) THEN
      -- Remover constraint antiga se existir
      BEGIN
        ALTER TABLE modelos DROP CONSTRAINT IF EXISTS modelos_status_check;
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;
      
      -- Adicionar nova constraint com valores da Meta
      ALTER TABLE modelos 
      ADD CONSTRAINT modelos_status_check 
      CHECK (status IN ('APPROVED', 'REJECTED', 'PENDING', 'PAUSED', 'PENDING_DELETION'));
      
      RAISE NOTICE '✅ Constraint de status atualizada';
    ELSE
      -- Criar coluna status se não existir
      ALTER TABLE modelos 
      ADD COLUMN status TEXT DEFAULT 'PENDING' 
      CHECK (status IN ('APPROVED', 'REJECTED', 'PENDING', 'PAUSED', 'PENDING_DELETION'));
      
      RAISE NOTICE '✅ Coluna status criada';
    END IF;
    
    -- Adicionar coluna motivo_rejeicao
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'motivo_rejeicao'
    ) THEN
      ALTER TABLE modelos 
      ADD COLUMN motivo_rejeicao TEXT;
      
      RAISE NOTICE '✅ Coluna motivo_rejeicao adicionada';
    ELSE
      RAISE NOTICE 'ℹ️ Coluna motivo_rejeicao já existe';
    END IF;
    
    -- Verificar se id_empresa já existe
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'modelos' 
      AND column_name = 'id_empresa'
    ) THEN
      ALTER TABLE modelos 
      ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
      
      RAISE NOTICE '✅ Coluna id_empresa adicionada';
    ELSE
      RAISE NOTICE 'ℹ️ Coluna id_empresa já existe';
    END IF;
    
    -- Criar índice único para id_meta (se não existir)
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE tablename = 'modelos' 
      AND indexname = 'idx_modelos_id_meta_unique'
    ) THEN
      CREATE UNIQUE INDEX idx_modelos_id_meta_unique 
      ON modelos(id_meta) 
      WHERE id_meta IS NOT NULL;
      
      RAISE NOTICE '✅ Índice único para id_meta criado';
    ELSE
      RAISE NOTICE 'ℹ️ Índice único para id_meta já existe';
    END IF;
    
    -- Criar índice para id_empresa (se não existir)
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE tablename = 'modelos' 
      AND indexname = 'idx_modelos_id_empresa'
    ) THEN
      CREATE INDEX idx_modelos_id_empresa 
      ON modelos(id_empresa);
      
      RAISE NOTICE '✅ Índice para id_empresa criado';
    ELSE
      RAISE NOTICE 'ℹ️ Índice para id_empresa já existe';
    END IF;
    
    -- Criar índice para status (para filtros rápidos)
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE tablename = 'modelos' 
      AND indexname = 'idx_modelos_status'
    ) THEN
      CREATE INDEX idx_modelos_status 
      ON modelos(status);
      
      RAISE NOTICE '✅ Índice para status criado';
    ELSE
      RAISE NOTICE 'ℹ️ Índice para status já existe';
    END IF;
    
    RAISE NOTICE '✅ Tabela modelos atualizada com sucesso!';
    
  ELSE
    RAISE NOTICE '⚠️ Tabela modelos não encontrada. Criando tabela completa...';
    
    -- Criar tabela modelos completa
    CREATE TABLE modelos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_meta TEXT UNIQUE, -- ID do template na Meta
      id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      idioma TEXT DEFAULT 'pt_BR',
      categoria TEXT CHECK (categoria IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
      componentes JSONB DEFAULT '{}'::jsonb, -- Estrutura completa: HEADER, BODY, FOOTER, BUTTONS
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('APPROVED', 'REJECTED', 'PENDING', 'PAUSED', 'PENDING_DELETION')),
      motivo_rejeicao TEXT, -- Motivo da rejeição (se REJECTED)
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índices
    CREATE UNIQUE INDEX idx_modelos_id_meta_unique ON modelos(id_meta) WHERE id_meta IS NOT NULL;
    CREATE INDEX idx_modelos_id_empresa ON modelos(id_empresa);
    CREATE INDEX idx_modelos_status ON modelos(status);
    CREATE INDEX idx_modelos_nome ON modelos(nome);
    
    RAISE NOTICE '✅ Tabela modelos criada com sucesso!';
  END IF;
END $$;

-- Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'modelos'
ORDER BY ordinal_position;

