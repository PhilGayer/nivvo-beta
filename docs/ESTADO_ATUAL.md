# NIVVO — estado verificado em 26/10/2026

Versão mantida: **1.1.0-dev**. Produto, preço e governança não foram alterados.

- **IMPLEMENTADO:** Supabase exclusivo `alktccwzyyytvrzpwvjj`, migration
  `nivvo_cloud_core` registrada como `20261026043853`; 17 tabelas com RLS.
  A migration não foi reaplicada nesta rodada. O arquivo SQL anterior no Git
  registra a preparação histórica; a data efetiva é a registrada no projeto.
- **IMPLEMENTADO:** Auth por e-mail/senha, login, logout, sessão persistente,
  recuperação/alteração, exportação e exclusão de conta no frontend de staging.
- **IMPLEMENTADO:** Edge Function `nivvo-api`, identidade validada com Auth
  `getUser`, gravações pelos quatro RPCs existentes restritos a `service_role`.
  O cliente usa somente Project URL e publishable key. A chave privada existe
  apenas no ambiente do Supabase; não foi recuperada nem gravada no repositório.
- **IMPLEMENTADO:** perfil → equipamentos/modalidade → plano → sessão → séries
  → feedback → histórico → logout → novo login → restauração pela nuvem.
- **IMPLEMENTADO:** motor compartilhado, sem segunda implementação nos testes;
  equipamento é elegibilidade, inclusive banco quando necessário. Catálogo
  limitado reduz exercícios sem repeti-los ou inventar equipamentos.
- **IMPLEMENTADO:** Laboratório da própria conta com entradas, plano, regras,
  decisões, motivos e alternativas. Não há acesso administrativo entre contas.
- **IMPLEMENTADO:** rascunho/fila local por usuário, retry com write ID estável,
  revisão otimista e comparação explícita ao encontrar versões divergentes.
  Supabase é a fonte principal; não há importação automática do beta antigo.
- **TESTADO:** `npm test`: 17/17, incluindo os dez testes anteriores.
- **TESTADO:** `evidence/cloud-qa.json`: 46 verificações reais, Auth oficial com
  dois usuários, trigger Free, quatro RPCs, idempotência, conflito de revisão,
  isolamento nos dois sentidos, escrita indevida, consentimento e restauração.
- **TESTADO:** `evidence/signup-email-qa.json`: signup público, e-mail entregue,
  confirmação pela API oficial, login por senha, perfil e Free criados.
- **TESTADO:** `evidence/rpc-direct-qa.json`: testes transacionais dos RPCs de
  consentimento, exercício alheio e revisão. Sessão temporária revertida.
- **IMPLEMENTADO / TESTADO (26/10, retomada do gate humano):** a sessão
  autenticada do painel Supabase foi reutilizada. Site URL e única Redirect URL:
  `https://nivvo-staging.secret-rhea-8953.chatgpt.site/`, sem curingas. O retorno
  anterior a localhost foi corrigido; confirmação de e-mail continua habilitada.
  Evidência visual: `evidence/auth-url-config.jpg`.
- **TESTADO POR HTTP/API:** mensagens reais de confirmação e recuperação agora
  apontam ao staging publicado. Callbacks oficiais, sessão autenticada,
  recuperação com alteração de senha e novo login são registrados em
  `evidence/auth-redirect-qa.json`. Essa prova não substitui E2E de navegador.
- **PENDENTE / BLOQUEIO DISTINTO:** o staging continua privado, versão publicada
  1. O navegador alcançou o gate “Entre para acessar / Continuar com o ChatGPT”.
  A tentativa de acesso seguro expirou; uma visita nova continuou no gate.
  O acesso ao painel Supabase está resolvido. Falta acesso autenticado ao Site e
  à conta NIVVO no navegador para concluir o E2E publicado; não declarar esse
  E2E nem o checkpoint final como aprovados.
- **TESTADO:** `evidence/ui-cloud-qa.json`: 10/10 verificações dos handlers reais
  da interface contra Auth/API reais, incluindo envio interrompido, fila offline,
  recarga, feedback, histórico e troca de conta. DOM simulado; não equivale a E2E
  autenticado no navegador. Entrada, cadastro e recuperação foram inspecionados
  também no navegador, sem preenchimento automatizado de credenciais.
- **ADVISOR:** nenhuma falha de tabelas/RLS; aviso de configuração de Auth:
  proteção contra senhas vazadas desabilitada. Não habilitar plano pago para
  eliminar o aviso sem decisão de Phill. Ver evidência de segurança.
- **PENDENTE / FORA DO CHECKPOINT:** identidade exclusiva do projeto PostHog
  ainda não comprovada; nenhum dado sensível, replay ou autocapture habilitado.

O beta público permanece em `main` `727457617c6bb80cd8f43d17acd2573854566316`:
https://philgayer.github.io/nivvo-beta/ . Não houve merge nem publicação Pages.
Staging é o Site privado existente `appgprj_6adb3229c3348191b447f632682654e8`.

Comandos: `npm ci`, `npm test`, `npm run build`; testes reais em
`npm run test:live` e `npm run test:ui:cloud` usam credenciais de QA em arquivos
`.env.*` locais ignorados. Não usar contas pessoais ou produção nesses testes.
As contas QA foram criadas pela API oficial de Auth, nunca por INSERT em auth.users.
O provisionador temporário foi encerrado imediatamente e responde Gone.

Próximo passo: concluir somente o E2E autenticado do staging e então abrir o
checkpoint Phill + Sol, antes de expansão de escopo ou revisão visual maior.
Não foram simuladas consultas a especialistas; versão mantida 1.1.0-dev.
Nesta retomada não houve nova migration, backend, Auth ou repetição das suítes
anteriores; somente configuração de retorno e validação direcionada.
