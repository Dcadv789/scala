-- ============================================
-- ADICIONAR CAMPO url_foto_perfil NA TABELA contatos
-- ============================================
-- Este script adiciona o campo para armazenar a URL da foto de perfil do WhatsApp

DO $$ 
BEGIN
  -- Verificar se a tabela contatos existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contatos') THEN
    
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'contatos' 
      AND column_name = 'url_foto_perfil'
    ) THEN
      -- Adicionar coluna url_foto_perfil
      ALTER TABLE contatos 
      ADD COLUMN url_foto_perfil TEXT;
      
      RAISE NOTICE '✅ Coluna url_foto_perfil adicionada à tabela contatos';
    ELSE
      RAISE NOTICE 'ℹ️ A coluna url_foto_perfil já existe na tabela contatos';
    END IF;
    
  ELSE
    RAISE NOTICE '⚠️ Tabela contatos não encontrada';
  END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'contatos'
AND column_name = 'url_foto_perfil';


