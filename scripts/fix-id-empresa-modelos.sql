-- ============================================
-- GARANTIR QUE id_empresa ESTEJA CORRETAMENTE CONFIGURADO NA TABELA modelos
-- ============================================
-- Este script garante que:
-- 1. A coluna id_empresa existe
-- 2. A foreign key está correta
-- 3. A coluna permite NULL temporariamente (para migração) ou é NOT NULL

DO $$
BEGIN
  -- Verificar se a coluna id_empresa existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'id_empresa'
  ) THEN
    -- Criar coluna id_empresa se não existir
    ALTER TABLE modelos
    ADD COLUMN id_empresa UUID REFERENCES empresas(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Coluna id_empresa criada na tabela modelos';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna id_empresa já existe na tabela modelos';
  END IF;

  -- Verificar se a foreign key existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'modelos'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'id_empresa'
  ) THEN
    -- Adicionar foreign key se não existir
    ALTER TABLE modelos
    ADD CONSTRAINT modelos_id_empresa_fkey
    FOREIGN KEY (id_empresa) REFERENCES empresas(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key id_empresa criada na tabela modelos';
  ELSE
    RAISE NOTICE 'ℹ️ A foreign key id_empresa já existe na tabela modelos';
  END IF;

  -- Garantir que a coluna permita NULL temporariamente (para evitar erros durante migração)
  -- Mas idealmente deveria ser NOT NULL após migração completa
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'id_empresa'
    AND is_nullable = 'NO'
  ) THEN
    -- Se for NOT NULL, manter assim (é o ideal)
    RAISE NOTICE 'ℹ️ A coluna id_empresa é NOT NULL (correto para Multi-Tenant)';
  ELSE
    -- Se permitir NULL, avisar (mas não forçar NOT NULL para não quebrar dados existentes)
    RAISE NOTICE '⚠️ A coluna id_empresa permite NULL. Considere torná-la NOT NULL após migração completa.';
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
AND column_name = 'id_empresa';

-- Verificar foreign key
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'modelos'
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'id_empresa';


