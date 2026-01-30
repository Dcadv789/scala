-- ============================================
-- ADICIONAR STATUS "NOT_SENT" À CONSTRAINT modelos_status_check
-- ============================================
-- Este script atualiza a constraint de status para permitir "NOT_SENT"
-- que é usado para templates criados localmente que ainda não foram enviados à Meta

DO $$
BEGIN
  -- Remover constraint antiga se existir
  BEGIN
    ALTER TABLE modelos DROP CONSTRAINT IF EXISTS modelos_status_check;
    RAISE NOTICE '✅ Constraint antiga removida';
  EXCEPTION
    WHEN OTHERS THEN 
      RAISE NOTICE 'ℹ️ Constraint não existia ou já foi removida';
  END;
  
  -- Adicionar nova constraint com valores da Meta + NOT_SENT
  ALTER TABLE modelos 
  ADD CONSTRAINT modelos_status_check 
  CHECK (status IN ('APPROVED', 'REJECTED', 'PENDING', 'PAUSED', 'PENDING_DELETION', 'NOT_SENT'));
  
  RAISE NOTICE '✅ Constraint de status atualizada com NOT_SENT';
END $$;

-- Verificar se a constraint foi criada corretamente
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'modelos'::regclass
AND conname = 'modelos_status_check';
