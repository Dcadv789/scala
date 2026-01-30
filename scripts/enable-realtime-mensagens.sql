-- ============================================
-- HABILITAR REALTIME NA TABELA mensagens
-- ============================================
-- Este script habilita o Supabase Realtime para a tabela mensagens
-- Permitindo atualizações instantâneas no frontend quando novas mensagens são inseridas

-- Habilitar Realtime (publication) para a tabela mensagens
-- Nota: No Supabase, o Realtime é habilitado através da publicação 'supabase_realtime'
-- que já existe por padrão, mas precisamos garantir que a tabela está incluída

-- Verificar se a publicação existe e adicionar a tabela mensagens
DO $$ 
BEGIN
  -- Verificar se a tabela mensagens existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') THEN
    
    -- Adicionar a tabela mensagens à publicação do Realtime
    -- Nota: No Supabase Cloud, isso geralmente é feito via Dashboard
    -- Mas podemos tentar adicionar via SQL se tivermos permissões
    BEGIN
      -- Tentar adicionar à publicação (pode falhar se já estiver adicionada ou se não tivermos permissão)
      ALTER PUBLICATION supabase_realtime ADD TABLE mensagens;
      RAISE NOTICE '✅ Tabela mensagens adicionada à publicação supabase_realtime';
    EXCEPTION
      WHEN OTHERS THEN
        -- Se der erro, pode ser que já esteja adicionada ou não temos permissão
        -- No Supabase Cloud, isso geralmente é feito via Dashboard → Database → Replication
        RAISE NOTICE 'ℹ️ Não foi possível adicionar via SQL. Habilite manualmente no Dashboard:';
        RAISE NOTICE '   1. Vá para Supabase Dashboard → Database → Replication';
        RAISE NOTICE '   2. Encontre a tabela "mensagens"';
        RAISE NOTICE '   3. Ative o toggle "Enable Realtime"';
    END;
    
  ELSE
    RAISE NOTICE '⚠️ Tabela mensagens não encontrada';
  END IF;
END $$;

-- Verificar se a tabela está na publicação
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'mensagens';

-- Se não estiver na lista acima, você precisa habilitar manualmente no Dashboard:
-- Supabase Dashboard → Database → Replication → mensagens → Enable Realtime


