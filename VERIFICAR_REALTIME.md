# 🔍 Guia de Verificação do Realtime

## Problema
As mensagens recebidas não aparecem instantaneamente no chat. É necessário recarregar a página para ver novas mensagens.

## Verificações Necessárias

### 1. ✅ Habilitar Realtime no Supabase Dashboard

**CRÍTICO:** O Realtime precisa estar habilitado manualmente no Dashboard do Supabase:

1. Acesse: **Supabase Dashboard** → **Database** → **Replication**
2. Encontre a tabela **`mensagens`**
3. **Ative o toggle "Enable Realtime"**
4. Salve

**⚠️ IMPORTANTE:** Executar o SQL não é suficiente. Você DEVE habilitar manualmente no Dashboard.

### 2. ✅ Verificar Variáveis de Ambiente

No console do navegador, você deve ver:
```
[Realtime] ====== INICIALIZANDO CLIENTE SUPABASE ======
[Realtime] Verificando variáveis de ambiente: { supabaseUrl: "...", supabaseAnonKey: true }
[Realtime] ✅ Cliente Supabase inicializado com sucesso
```

Se aparecer `supabaseUrl: "NÃO CONFIGURADO"` ou `supabaseAnonKey: false`:
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão no `.env.local`
- **Reinicie o servidor** após adicionar as variáveis

### 3. ✅ Verificar Logs de Subscrição

No console do navegador, você deve ver:
```
[Realtime] ====== INICIANDO CONFIGURAÇÃO REALTIME ======
[Realtime] 🔌 Configurando Realtime para empresa: [UUID]
[Realtime] Canal criado, configurando listener...
[Realtime] ====== STATUS DA SUBSCRIÇÃO ======
[Realtime] Status: SUBSCRIBED
[Realtime] ✅ SUBSCRITO COM SUCESSO ao canal: mensagens-empresa:[UUID]
[Realtime] ✅ Realtime está ATIVO e escutando mensagens da empresa: [UUID]
```

### 4. ✅ Verificar RLS (Row Level Security)

O Realtime pode ser bloqueado por políticas RLS. Verifique se há políticas que permitem SELECT na tabela `mensagens`:

```sql
-- Verificar políticas RLS na tabela mensagens
SELECT * FROM pg_policies WHERE tablename = 'mensagens';
```

Se não houver políticas ou se estiverem bloqueando, o Realtime não funcionará.

### 5. ✅ Testar Realtime

1. Abra o console do navegador
2. Envie uma mensagem do celular para o número conectado
3. Verifique os logs:
   - Deve aparecer: `[Realtime] ====== NOVA MENSAGEM RECEBIDA VIA REALTIME ======`
   - Se não aparecer, o Realtime não está funcionando

## Solução de Problemas

### Problema: "Status: CHANNEL_ERROR"
**Solução:** 
- Verifique se o Realtime está habilitado no Dashboard
- Verifique se há políticas RLS bloqueando

### Problema: "Status: TIMED_OUT"
**Solução:**
- Verifique sua conexão com a internet
- Verifique se o Supabase está acessível

### Problema: Nenhum log aparece
**Solução:**
- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor de desenvolvimento
- Verifique o console do navegador para erros

### Problema: Mensagem chega mas não aparece no histórico
**Solução:**
- Verifique se `selectedConversationId` corresponde ao `id_contato` da mensagem
- Verifique os logs de comparação no console

## Checklist Final

- [ ] Realtime habilitado no Supabase Dashboard (Database → Replication → mensagens)
- [ ] Variáveis de ambiente configuradas (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Servidor reiniciado após configurar variáveis
- [ ] Logs mostram `[Realtime] ✅ SUBSCRITO COM SUCESSO`
- [ ] Logs mostram `[Realtime] ====== NOVA MENSAGEM RECEBIDA VIA REALTIME ======` quando uma mensagem chega


