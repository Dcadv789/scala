# 🔍 Verificação Final do Realtime

## Problema
O Realtime está subscrito com sucesso, mas as mensagens não aparecem automaticamente quando inseridas na tabela `mensagens`.

## Checklist de Verificação

### 1. ✅ Realtime Habilitado no Dashboard
- [x] Supabase Dashboard → Database → Replication
- [x] Tabela `mensagens` com toggle "Enable Realtime" ATIVO

### 2. ✅ Autenticação
- [x] Cliente Supabase autenticado com sessão
- [x] Logs mostram: `[Realtime] ✅ Cliente autenticado com sucesso`

### 3. ✅ Subscrição
- [x] Logs mostram: `[Realtime] ✅ SUBSCRITO COM SUCESSO ao canal`
- [x] Status: `SUBSCRIBED`

### 4. ⚠️ Listener Não Está Recebendo Eventos
- [ ] O listener de teste (sem filtro) NÃO está capturando mensagens
- [ ] Isso indica que o Realtime não está funcionando, mesmo habilitado

## Possíveis Causas

### Causa 1: RLS Bloqueando Realtime
As políticas RLS podem estar bloqueando o Realtime mesmo com autenticação.

**Solução:** Verificar se as políticas RLS permitem SELECT para o usuário autenticado.

### Causa 2: Realtime Não Está Realmente Habilitado
Mesmo com o toggle ativado, pode haver um problema de sincronização.

**Solução:** 
1. Desative o Realtime
2. Salve
3. Ative novamente
4. Salve
5. Aguarde alguns segundos

### Causa 3: Formato do Filtro
O filtro `id_empresa=eq.${empresaId}` pode não estar funcionando corretamente.

**Solução:** Testar sem filtro primeiro para confirmar que o Realtime funciona.

### Causa 4: Mensagens Não Estão Sendo Inseridas
As mensagens podem não estar sendo inseridas na tabela quando chegam.

**Solução:** Verificar logs da Edge Function para confirmar que as mensagens estão sendo salvas.

## Próximos Passos

1. **Verificar se mensagens estão sendo inseridas:**
   - Acesse Supabase Dashboard → Table Editor → mensagens
   - Verifique se novas mensagens aparecem quando você envia do celular

2. **Testar Realtime manualmente:**
   - No Supabase Dashboard → Database → Replication
   - Clique em "Test" ao lado da tabela mensagens
   - Verifique se aparece algum evento

3. **Verificar políticas RLS:**
   - Execute: `SELECT * FROM pg_policies WHERE tablename = 'mensagens';`
   - Verifique se há políticas que podem estar bloqueando

4. **Testar sem RLS temporariamente:**
   - Desabilite RLS na tabela mensagens temporariamente
   - Teste se o Realtime funciona
   - Se funcionar, o problema é nas políticas RLS


