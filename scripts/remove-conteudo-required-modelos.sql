-- ============================================
-- REMOVER CONSTRAINT NOT NULL DA COLUNA conteudo NA TABELA modelos
-- ============================================
-- A coluna conteudo é legada. Agora usamos componentes (JSONB) para armazenar
-- a estrutura completa do template (header, body, footer, buttons)

DO $$
BEGIN
  -- Verificar se a coluna existe e tem constraint NOT NULL
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'conteudo'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE modelos
    ALTER COLUMN conteudo DROP NOT NULL;
    
    RAISE NOTICE '✅ Constraint NOT NULL removida da coluna conteudo na tabela modelos';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'conteudo'
  ) THEN
    RAISE NOTICE 'ℹ️ A coluna conteudo já permite valores NULL';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna conteudo não existe na tabela modelos';
  END IF;
END $$;

-- Verificar se a constraint foi removida
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'modelos'
AND column_name = 'conteudo';


