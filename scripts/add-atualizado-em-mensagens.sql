-- ============================================
-- ADICIONAR COLUNA atualizado_em NA TABELA mensagens
-- ============================================
-- Esta coluna armazena a data/hora da última atualização da mensagem
-- Útil para rastreamento de status e atualizações

DO $$ 
BEGIN
  -- Verificar se a coluna updated_at existe (nome antigo em inglês)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mensagens' 
    AND column_name = 'updated_at'
  ) THEN
    -- Renomear a coluna existente
    ALTER TABLE mensagens 
    RENAME COLUMN updated_at TO atualizado_em;
    
    RAISE NOTICE '✅ Coluna updated_at renomeada para atualizado_em';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mensagens' 
    AND column_name = 'atualizado_em'
  ) THEN
    -- Adicionar a coluna se não existir
    ALTER TABLE mensagens 
    ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE '✅ Coluna atualizado_em adicionada à tabela mensagens';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna atualizado_em já existe na tabela mensagens';
  END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mensagens'
AND column_name = 'atualizado_em';


