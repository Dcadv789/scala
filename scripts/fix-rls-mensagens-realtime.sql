-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA PERMITIR REALTIME
-- ============================================
-- Este script corrige as políticas RLS para permitir que o Realtime funcione
-- mantendo a segurança multi-tenant

DO $$ 
BEGIN
  -- Verificar se a tabela mensagens existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') THEN
    
    -- Remover políticas antigas
    DROP POLICY IF EXISTS "Membros can view own mensagens" ON mensagens;
    DROP POLICY IF EXISTS "Membros can insert own mensagens" ON mensagens;
    DROP POLICY IF EXISTS "Membros can update own mensagens" ON mensagens;
    DROP POLICY IF EXISTS "Users can view own messages" ON mensagens;
    DROP POLICY IF EXISTS "Users can insert own messages" ON mensagens;
    DROP POLICY IF EXISTS "Users can update own messages" ON mensagens;
    
    -- IMPORTANTE: Para o Realtime funcionar, as políticas precisam permitir
    -- que o usuário autenticado veja as mensagens da sua empresa
    -- O Realtime usa o contexto do usuário autenticado para aplicar as políticas
    
    -- Política para SELECT (necessária para Realtime)
    -- Permite que membros vejam mensagens da sua empresa
    -- Superadmin vê tudo
    EXECUTE 'CREATE POLICY "Membros can view own mensagens" ON mensagens
      FOR SELECT 
      USING (
        -- Superadmin pode ver tudo
        EXISTS (
          SELECT 1 FROM membros 
          WHERE id_usuario::text = auth.uid()::text
          AND eh_superadmin = true
          AND ativo = true
        )
        OR
        -- Membro pode ver mensagens da sua empresa
        id_empresa IN (
          SELECT id_empresa 
          FROM membros 
          WHERE id_usuario::text = auth.uid()::text
          AND ativo = true
        )
      )';
    
    -- Política para INSERT
    -- Permite que membros insiram mensagens na sua empresa
    EXECUTE 'CREATE POLICY "Membros can insert own mensagens" ON mensagens
      FOR INSERT 
      WITH CHECK (
        -- Superadmin pode inserir em qualquer empresa
        EXISTS (
          SELECT 1 FROM membros 
          WHERE id_usuario::text = auth.uid()::text
          AND eh_superadmin = true
          AND ativo = true
        )
        OR
        -- Membro pode inserir apenas na sua empresa
        id_empresa IN (
          SELECT id_empresa 
          FROM membros 
          WHERE id_usuario::text = auth.uid()::text
          AND ativo = true
        )
      )';
    
    -- Política para UPDATE
    -- Permite que membros atualizem mensagens da sua empresa
    EXECUTE 'CREATE POLICY "Membros can update own mensagens" ON mensagens
      FOR UPDATE 
      USING (
        -- Superadmin pode atualizar mensagens de qualquer empresa
        EXISTS (
          SELECT 1 FROM membros 
          WHERE id_usuario::text = auth.uid()::text
          AND eh_superadmin = true
          AND ativo = true
        )
        OR
        -- Membro pode atualizar apenas mensagens da sua empresa
        id_empresa IN (
          SELECT id_empresa 
          FROM membros 
          WHERE id_usuario::text = auth.uid()::text
          AND ativo = true
        )
      )';
    
    RAISE NOTICE '✅ Políticas RLS corrigidas para permitir Realtime';
    
  ELSE
    RAISE NOTICE '⚠️ Tabela mensagens não encontrada';
  END IF;
END $$;

-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'mensagens'
ORDER BY policyname;

-- IMPORTANTE: Após executar este script, reabilite o RLS:
-- ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

