-- ============================================
-- ADICIONAR COLUNA motivo_rejeicao NA TABELA modelos
-- ============================================
-- Esta coluna armazena o motivo da rejeição de um template (se status = 'REJECTED')

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'motivo_rejeicao'
  ) THEN
    ALTER TABLE modelos
    ADD COLUMN motivo_rejeicao TEXT;
    
    RAISE NOTICE '✅ Coluna motivo_rejeicao adicionada à tabela modelos';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna motivo_rejeicao já existe na tabela modelos';
  END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'modelos'
AND column_name = 'motivo_rejeicao';


