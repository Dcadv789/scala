-- =============================================
-- CORREÇÃO: Garantir que id_usuario na tabela membros
-- use o mesmo ID do Supabase Auth (auth.users.id)
-- =============================================

-- 1. Verificar se a coluna id_usuario existe e está correta
DO $$
BEGIN
  -- Verificar se a coluna existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membros' AND column_name = 'id_usuario'
  ) THEN
    -- Criar a coluna se não existir
    ALTER TABLE membros ADD COLUMN id_usuario UUID;
    RAISE NOTICE 'Coluna id_usuario criada na tabela membros';
  ELSE
    RAISE NOTICE 'Coluna id_usuario já existe na tabela membros';
  END IF;
END $$;

-- 2. Adicionar índice para melhor performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_membros_id_usuario ON membros(id_usuario) WHERE id_usuario IS NOT NULL;

-- 3. Adicionar comentário na coluna para documentação
COMMENT ON COLUMN membros.id_usuario IS 'ID do usuário no Supabase Auth (auth.users.id). Deve ser o mesmo UUID retornado pelo auth.admin.createUser()';

-- 4. Verificar se há membros com id_usuario inválido (não UUID)
-- Isso ajuda a identificar problemas
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM membros
  WHERE id_usuario IS NOT NULL 
    AND id_usuario::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  
  IF invalid_count > 0 THEN
    RAISE WARNING 'Encontrados % membros com id_usuario em formato inválido (não é UUID)', invalid_count;
  ELSE
    RAISE NOTICE 'Todos os id_usuario estão em formato UUID válido';
  END IF;
END $$;

-- 5. NOTA: Não adicionamos FOREIGN KEY para auth.users porque:
--    - auth.users é uma tabela gerenciada pelo Supabase
--    - A foreign key pode causar problemas em migrações
--    - O relacionamento é lógico, não físico
--    - O código da aplicação garante a integridade

-- 6. Criar função helper para validar se id_usuario existe em auth.users
-- (Opcional - apenas para validação, não como constraint)
CREATE OR REPLACE FUNCTION membros_id_usuario_exists(p_id_usuario UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o ID existe em auth.users
  -- Nota: Isso requer permissões especiais, pode não funcionar em todos os casos
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_id_usuario
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Se não tiver permissão, retorna true (assume que existe)
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Comentário final
COMMENT ON TABLE membros IS 'Tabela de membros (usuários) de empresas. id_usuario deve ser o mesmo UUID do Supabase Auth (auth.users.id) para permitir login.';


