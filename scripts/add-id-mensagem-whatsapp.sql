-- ============================================
-- ADICIONAR/RENOMEAR COLUNA id_mensagem_whatsapp NA TABELA mensagens
-- ============================================
-- Esta coluna armazena o ID da mensagem retornado pela API do WhatsApp (Meta)
-- Útil para rastreamento e atualização de status de mensagens

DO $$ 
BEGIN
  -- Verificar se a coluna whatsapp_message_id existe (nome antigo em inglês)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mensagens' 
    AND column_name = 'whatsapp_message_id'
  ) THEN
    -- Renomear a coluna existente
    ALTER TABLE mensagens 
    RENAME COLUMN whatsapp_message_id TO id_mensagem_whatsapp;
    
    RAISE NOTICE '✅ Coluna whatsapp_message_id renomeada para id_mensagem_whatsapp';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mensagens' 
    AND column_name = 'id_mensagem_whatsapp'
  ) THEN
    -- Adicionar a coluna se não existir
    ALTER TABLE mensagens 
    ADD COLUMN id_mensagem_whatsapp VARCHAR(255);
    
    RAISE NOTICE '✅ Coluna id_mensagem_whatsapp adicionada à tabela mensagens';
  ELSE
    RAISE NOTICE 'ℹ️ A coluna id_mensagem_whatsapp já existe na tabela mensagens';
  END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'mensagens'
AND column_name = 'id_mensagem_whatsapp';

