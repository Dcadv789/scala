-- =============================================
-- CORREÇÃO: Ajustar foreign key de campanhas.id_usuario
-- No sistema Multi-Tenant, id_usuario referencia auth.users.id
-- mas a foreign key não pode referenciar auth.users diretamente
-- Então vamos tornar id_usuario nullable e remover a constraint
-- =============================================

-- 1. Remover a foreign key antiga que referencia usuarios.id
ALTER TABLE campanhas DROP CONSTRAINT IF EXISTS campanhas_id_usuario_fkey;

-- 2. Tornar id_usuario nullable (já que pode não ter referência direta)
-- (A coluna já pode ser nullable, mas garantimos)
ALTER TABLE campanhas ALTER COLUMN id_usuario DROP NOT NULL;

-- 3. Adicionar comentário explicativo
COMMENT ON COLUMN campanhas.id_usuario IS 'ID do usuário no Supabase Auth (auth.users.id). Não há foreign key porque auth.users é gerenciado pelo Supabase. O relacionamento é lógico através da tabela membros.';

-- 4. Verificar se há campanhas órfãs (sem id_usuario válido)
-- Isso é apenas informativo, não bloqueia nada
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM campanhas
  WHERE id_usuario IS NOT NULL 
    AND id_usuario::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  
  IF orphan_count > 0 THEN
    RAISE WARNING 'Encontradas % campanhas com id_usuario em formato inválido (não é UUID)', orphan_count;
  ELSE
    RAISE NOTICE 'Todos os id_usuario estão em formato UUID válido';
  END IF;
END $$;


