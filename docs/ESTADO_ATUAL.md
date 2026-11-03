# NIVVO — estado vivo verificado em 03/11/2026

Versão mantida: **1.1.0-dev**. Produto, preço, autoridade e governança não foram alterados.

## AGORA

- Supabase exclusivo `alktccwzyyytvrzpwvjj`: **ACTIVE_HEALTHY**.
- Branch atual: `work/nivvo-v1.1-reentry`.
- PR #1 permanece aberto/draft.
- Beta público `main` v1.0.3 permanece separado e não foi substituído.
- Staging privado vigente: `https://nivvo-staging.secret-rhea-8953.chatgpt.site/`.
- A fundação técnica permanece implementada: Auth por e-mail/senha, persistência em nuvem, Edge Function `nivvo-api`, 17 tabelas públicas com RLS, motor compartilhado, Laboratório auditável, fila/retry e restauração em nuvem.
- O único bloqueio de fechamento técnico continua sendo o **E2E autenticado publicado no navegador**.
- Advisor atual mantém um aviso de Auth: proteção contra senhas vazadas desabilitada. Não alterar plano/configuração comercial apenas para silenciar esse aviso.
- Identidade exclusiva do projeto PostHog continua não comprovada; analytics sensível/replay/autocapture não foram habilitados.

## HISTÓRICO VALIDADO PRESERVADO

As validações abaixo continuam evidência histórica válida e não foram reexecutadas nesta reentrada:

- `npm test`: **17/17**.
- `evidence/cloud-qa.json`: **46/46** verificações reais de Auth/RLS/RPCs com dois usuários, isolamento nos dois sentidos, trigger Free, idempotência, conflito de revisão, consentimento e restauração.
- `evidence/ui-cloud-qa.json`: **10/10** handlers reais de interface contra Auth/API reais em DOM simulado.
- `evidence/signup-email-qa.json`: signup público, e-mail entregue, confirmação oficial, login por senha, perfil e Free criados.
- `evidence/rpc-direct-qa.json`: testes transacionais dos RPCs.
- Site URL e única Redirect URL foram corrigidas para o staging; o retorno anterior a localhost está encerrado.
- O gate privado do Site foi superado e a página publicada abriu com título “NIVVO · v1.1.0-dev” e formulário próprio do NIVVO.

## PENDÊNCIA REAL

O pedido seguro de login NIVVO no navegador foi interrompido antes de retornar resultado verificável. Depois, o ambiente de execução retornou erro 503 e o controle do navegador ficou indisponível.

Portanto:
- o estado final daquela autenticação é **desconhecido**;
- não inferir sucesso ou falha;
- não pedir novo login antes de inspecionar a sessão existente;
- não tratar HTTP/API ou DOM simulado como E2E de navegador.

O fluxo ainda a comprovar no staging publicado é:

`cadastro/login → perfil → equipamentos → plano → sessão → sets → feedback → histórico → logout → novo login → restauração`.

## PRÓXIMA SEQUÊNCIA

1. Retomar somente o E2E autenticado publicado.
2. Registrar evidência real de navegador e atualizar este estado.
3. Abrir checkpoint Phill + Sol.
4. Depois iniciar revisão estética/UX com Vênus sobre a base real.
5. Em sequência própria, estruturar compliance/burocracia/documentação e testers/validação externa.

## FRONTEIRAS

- Work/Desenvolvimento executa engenharia.
- Sol/Matrix integra, confronta, registra continuidade e orquestra.
- Vênus ainda não foi acionada nesta etapa do NIVVO.
- Não reaplicar migration, reconstruir Auth, repetir suítes aprovadas ou expandir escopo sem sinal material novo.
- Não promover versão, mergear/publicar o beta como produção ou alterar regras comerciais sem gate Phill + Sol.

## REENTRADA

Usar `docs/CAPA_REENTRADA_NIVVO_2026-11-03.md` como capa seletiva de entrada. Histórico datado permanece preservado nas evidências e commits anteriores; esta página representa o estado vivo atual, não reescreve o passado.
