-- ============================================
-- REMOVER CONSTRAINT NOT NULL DA COLUNA email_usuario NA TABELA modelos
-- ============================================
-- A coluna email_usuario não é necessária para templates, pois eles são associados à empresa
-- e não a um usuário específico

DO $$
BEGIN
  -- Verificar se a coluna existe e tem constraint NOT NULL
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'email_usuario'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE modelos
    ALTER COLUMN email_usuario DROP NOT NULL;
    
    RAISE NOTICE '✅ Constraint NOT NULL removida da coluna email_usuario na tabela modelos';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'modelos'
    AND column_name = 'email_usuario'
  ) THEN
    RAISE NOTICE 'ℹ️ A coluna email_usuario já permite valores NULL';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna email_usuario não existe na tabela modelos';
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
AND column_name = 'email_usuario';


