# 📋 Plano de Tradução do Banco de Dados - ScalaZap

## 🎯 Objetivo
Traduzir todos os nomes de tabelas e colunas do inglês para português.

## 📊 Divisão do Trabalho (4 Blocos de 25%)

### Bloco 1 (25%) - Tabelas Principais de Usuários e Configurações
1. `users` → `usuarios`
2. `webhook_logs` → `logs_webhook`
3. `payments` → `pagamentos`
4. `subscriptions` → `assinaturas`
5. `pixels` → `pixels` (mantém)
6. `connections` → `conexoes`

### Bloco 2 (25%) - Tabelas de Campanhas e Comunicação
7. `campaigns` → `campanhas`
8. `campaign_recipients` → `destinatarios_campanha`
9. `contacts` → `contatos`
10. `messages` → `mensagens`
11. `templates` → `modelos`
12. `abandoned_carts` → `carrinhos_abandonados`

### Bloco 3 (25%) - Tabelas de Configurações e Vendas
13. `user_settings` → `configuracoes_usuario`
14. `analytics` → `analytics` (mantém)
15. `admins` → `administradores`
16. `sales_stages` → `estagios_venda`
17. `subscribers` → `assinantes`
18. `billing_records` → `registros_faturamento`

### Bloco 4 (25%) - Tabelas de Sistema e Webhooks
19. `employees` → `funcionarios`
20. `leads` → `leads` (mantém)
21. `whatsapp_webhook_logs` → `logs_webhook_whatsapp`
22. `webhook_messages` → `mensagens_webhook`

---

## 📝 Processo para Cada Bloco

Para cada bloco, vou:
1. ✅ Criar arquivo de migração SQL (renomear tabelas e colunas)
2. ✅ Atualizar todas as referências no código (app/api, lib)
3. ✅ Testar se não há erros de sintaxe

---

## 🚀 Iniciando Bloco 1


