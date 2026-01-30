-- =============================================
-- CORREÇÃO: Remover foreign key antiga de conexoes.id_usuario
-- e torná-la nullable ou remover constraint
-- =============================================

-- 1. Remover a constraint antiga que referencia usuarios(id)
DO $$
BEGIN
  -- Verificar se a constraint existe e removê-la
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conexoes_id_usuario_fkey'
    AND table_name = 'conexoes'
  ) THEN
    ALTER TABLE conexoes DROP CONSTRAINT conexoes_id_usuario_fkey;
    RAISE NOTICE 'Constraint conexoes_id_usuario_fkey removida';
  ELSE
    RAISE NOTICE 'Constraint conexoes_id_usuario_fkey não encontrada';
  END IF;
END $$;

-- 2. Tornar id_usuario nullable (caso não seja)
-- Isso permite que conexões sejam criadas mesmo sem referência direta
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conexoes' AND column_name = 'id_usuario'
  ) THEN
    -- Verificar se já é nullable
    IF (
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'conexoes' AND column_name = 'id_usuario'
    ) = 'NO' THEN
      ALTER TABLE conexoes ALTER COLUMN id_usuario DROP NOT NULL;
      RAISE NOTICE 'Coluna id_usuario tornada nullable';
    ELSE
      RAISE NOTICE 'Coluna id_usuario já é nullable';
    END IF;
  END IF;
END $$;

-- 3. Adicionar comentário explicativo
COMMENT ON COLUMN conexoes.id_usuario IS 'ID do usuário no Supabase Auth (auth.users.id). Usado para referência, mas sem foreign key constraint pois auth.users é gerenciado pelo Supabase.';

-- 4. NOTA: Não vamos criar uma nova foreign key para auth.users porque:
--    - auth.users é uma tabela gerenciada pelo Supabase
--    - A foreign key pode causar problemas em migrações
--    - O relacionamento é lógico, não físico
--    - O código da aplicação garante a integridade (id_usuario vem de membros.id_usuario)

-- 5. Verificar se há conexões com id_usuario inválido
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Contar conexões onde id_usuario não existe em auth.users
  -- (Isso requer permissões especiais, pode não funcionar)
  SELECT COUNT(*) INTO invalid_count
  FROM conexoes c
  WHERE c.id_usuario IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM auth.users u WHERE u.id = c.id_usuario
    );
  
  IF invalid_count > 0 THEN
    RAISE WARNING 'Encontradas % conexões com id_usuario que não existe em auth.users', invalid_count;
  ELSE
    RAISE NOTICE 'Todas as conexões têm id_usuario válido';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível verificar id_usuario (pode ser problema de permissões)';
END $$;


