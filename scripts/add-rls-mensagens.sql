-- ============================================
-- ADICIONAR POLÍTICAS RLS PARA TABELA mensagens
-- ============================================
-- Este script adiciona políticas RLS para a tabela mensagens
-- permitindo que o Realtime funcione corretamente

-- ============================================
-- PARTE 1: CRIAR FUNÇÕES AUXILIARES (se não existirem)
-- ============================================

-- Função auxiliar para verificar se o membro é superadmin (Multi-Tenant)
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM membros 
    WHERE id_usuario = auth.uid()::text
    AND eh_superadmin = true
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para obter id_empresa do membro autenticado
CREATE OR REPLACE FUNCTION get_empresa_id()
RETURNS UUID AS $$
DECLARE
  empresa_id UUID;
BEGIN
  SELECT id_empresa INTO empresa_id
  FROM membros
  WHERE id_usuario = auth.uid()::text
  AND ativo = true
  LIMIT 1;
  
  RETURN empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTE 2: CRIAR POLÍTICAS RLS
-- ============================================

DO $$ 
BEGIN
  -- Verificar se a tabela mensagens existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') THEN
    
    -- Habilitar RLS se ainda não estiver habilitado
    ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own messages" ON mensagens;
    DROP POLICY IF EXISTS "Users can insert own messages" ON mensagens;
    DROP POLICY IF EXISTS "Users can update own messages" ON mensagens;
    DROP POLICY IF EXISTS "Membros can view own mensagens" ON mensagens;
    DROP POLICY IF EXISTS "Membros can insert own mensagens" ON mensagens;
    DROP POLICY IF EXISTS "Membros can update own mensagens" ON mensagens;
    
    -- Criar políticas para SELECT (necessário para Realtime)
    -- IMPORTANTE: Para o Realtime funcionar, a política precisa usar IN (subquery)
    -- em vez de função, pois o Realtime precisa do contexto correto
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
    
    -- Criar política para INSERT (permitir inserção de mensagens)
    -- Superadmin pode inserir em qualquer empresa, membro apenas na sua
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
    
    -- Criar política para UPDATE (atualizar status de mensagens)
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
    
    RAISE NOTICE '✅ Políticas RLS criadas para a tabela mensagens';
    
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
WHERE tablename = 'mensagens';

