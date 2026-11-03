# NIVVO — Capa seletiva de reentrada — 03/11/2026

## Objeto
NIVVO — continuidade da versão **v1.1.0-dev** no branch `work/nivvo-v1.1-reentry`.

## Período de origem
22/10/2026 → 03/11/2026.

## Ramos
- Beta público preservado em `main` — v1.0.3.
- Desenvolvimento atual em `work/nivvo-v1.1-reentry`.
- Staging privado vigente: `https://nivvo-staging.secret-rhea-8953.chatgpt.site/`.
- Supabase exclusivo: `alktccwzyyytvrzpwvjj`.

## Sucessão / resultado
A fundação técnica já avançou para Auth real, persistência em nuvem, 17 tabelas com RLS, Edge Function, motor compartilhado, Laboratório auditável e staging publicado.

Validações históricas preservadas:
- 17/17 testes de regressão;
- 46/46 verificações reais de Auth/RLS/RPCs;
- 10/10 handlers de interface contra Auth/API reais.

O último estado verificável do navegador continua parcial: o staging abriu e exibiu o formulário NIVVO, mas a tentativa de login foi interrompida e o ambiente retornou 503. O E2E autenticado publicado ainda não foi comprovado.

## Uso atual
Esta capa é a entrada seletiva para reentradas futuras. Ela aponta para o estado vivo e para as fontes competentes sem copiar todo o histórico.

Não usar esta capa como prova de:
- E2E concluído;
- promoção de versão;
- merge/publicação pública;
- execução de Vênus;
- validação jurídica/comercial.

## Retorno
1. Inspecionar primeiro a sessão de navegador/staging existente.
2. Concluir apenas o E2E publicado:
   cadastro/login → perfil → equipamentos → plano → sessão → sets → feedback → histórico → logout → novo login → restauração.
3. Atualizar evidência e `docs/ESTADO_ATUAL.md`.
4. Abrir checkpoint Phill + Sol.
5. Só depois iniciar a camada visual/UX com Vênus e, em sequência própria, compliance/burocracia/testers.

## Fonte competente
- PR #1 e branch `work/nivvo-v1.1-reentry`.
- `docs/ESTADO_ATUAL.md`.
- `evidence/browser-staging-qa.json`.
- Supabase do projeto NIVVO.
- Decisões vivas Phill + Sol nesta frente.

## Fronteiras de autoria
- Work/Desenvolvimento executa engenharia.
- Sol/Matrix integra, confronta, registra continuidade e orquestra.
- Vênus permanece proprietária de comunicação/estética e ainda não foi acionada nesta etapa.
- Planejamento, Desenvolvimento & Melhorias e Oficina/Escola fornecem método de reentrada, registro, capas e validação de fronteiras; não assumem o domínio NIVVO.

## Nota de continuidade
Reentrada não é reinício. Estado vivo tem precedência sobre snapshot histórico. Atualizar sucessores e resultado sem reescrever o passado. Rótulos de passagem/capa servem à rastreabilidade; não provam sincronização automática entre chats.
