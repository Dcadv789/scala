-- ============================================
-- REMOVER OBRIGATORIEDADE DE email_usuario NA TABELA contatos
-- ============================================
-- Este script remove a constraint NOT NULL da coluna email_usuario
-- na tabela contatos, tornando-a opcional.

DO $$ 
BEGIN
  -- Verificar se a coluna existe e tem constraint NOT NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'contatos' 
    AND column_name = 'email_usuario'
    AND is_nullable = 'NO'
  ) THEN
    -- Remover a constraint NOT NULL
    ALTER TABLE contatos 
    ALTER COLUMN email_usuario DROP NOT NULL;
    
    RAISE NOTICE '✅ Constraint NOT NULL removida da coluna email_usuario na tabela contatos';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna email_usuario já é opcional ou não existe';
  END IF;
END $$;

-- Verificar o resultado
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'contatos'
AND column_name = 'email_usuario';


