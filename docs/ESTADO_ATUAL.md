# NIVVO — estado atual

Implementação e suítes: evidências de **26/10/2026** preservadas.
Última retomada do navegador e do estado vivo: **20/11/2026**.

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
- **HISTÓRICO / TESTADO (26/10):** `npm test`: 17/17, incluindo os dez testes anteriores.
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
- **TESTADO NO NAVEGADOR (26/10, após acesso liberado por Phill):** o gate
  privado do Site foi superado na sessão existente. A página publicada abriu
  com título “NIVVO · v1.1.0-dev” e formulário próprio do NIVVO: e-mail, senha,
  Entrar, Esqueci minha senha e Criar conta. O bloqueio de acesso privado ao Site
  está encerrado. Evidência textual: `evidence/browser-staging-qa.json`.
- **HISTÓRICO (03/11):** o pedido seguro de login expirou na ferramenta do
  navegador; a visita posterior voltou ao formulário NIVVO. Não foi reproduzido
  defeito de credencial. Captura: `evidence/browser-staging-login-2026-11-03.jpg`.
  O adendo posterior `docs/TRILHA_A_DESBLOQUEIO_AUTH.md` registra ausência de conta
  utilizável para Phill e orienta seguir por Criar conta. A antiga tríade citada
  nesse adendo permanece histórica; não foi reativada.
- **HISTÓRICO / TESTADO (10/11):** missão `CORE3-QG-NIVVO-20261110-R1` recuperada da
  seção 24 da Arquitetura do QG, sob SOL-CORE 3.0 por instrução de Phill.
  GitHub: PR #1 aberto/draft; base pública preservada. Sites: publicação privada
  versão 1, página NIVVO v1.1.0-dev acessível. Supabase exclusivo estava INACTIVE;
  uma restauração pela API oficial foi aceita e o projeto voltou a ACTIVE_HEALTHY.
  Não foi inferida a causa dessa inatividade nem reaplicada a migration.
- **HISTÓRICO / BLOCKED — cadastro humano no navegador (10/11):** inspecionado primeiro o
  navegador existente, sem abas abertas. O staging no mesmo navegador exibiu
  login, sem sessão NIVVO restaurada. Criar conta abriu nome, e-mail, senha e
  confirmação; o campo de nova senha informa mínimo de 10 caracteres.
  Nenhum cadastro, senha, confirmação ou login foi submetido nesta retomada.
  A criação da credencial requer controle do usuário, conforme orientação do
  navegador. O ponto preservado é o formulário Crie sua conta.
  Captura: `evidence/browser-staging-signup-2026-11-10.jpg`.
  Sequência e limites: `evidence/browser-staging-qa.json`.
  Jornada autenticada, logout/login, restauração e isolamento no navegador
  continuam pendentes; não há PASS de E2E ou FAIL funcional novo.
- **TESTADO LOCAL / CORE3:** `scripts/lab-decision-pilot.mjs` usa o motor
  compartilhado e a fixture existente, sem outro motor ou base. Um caso sintético
  de equipamento ausente passou em 7 verificações e foi reproduzido em processo
  novo com a mesma identidade de decisão. Puxada frontal foi excluída por falta
  de cabo; o resultado gerado foi Afundo assistido, Flexão de braços e Dead bug.
  O motivo vem da decisão real do motor; marcadores sintéticos de proprietário,
  e-mail e saúde não aparecem no recibo exportado. Resultado de geração local
  não é sessão de treino executada, persistência cloud ou prova de RLS.
  Evidência: `evidence/lab-decision-pilot.json`. Integração no Lab publicado
  permanece condicionada ao E2E.
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

Reuso avaliado para Enciclopédia D2, fluxo de Planejamento e recibos D3:

- `workout_plans.input_snapshot` e `motor_decisions` já são as fontes do Lab.
  Reutilizar apontador/revisão, motivo documentado, alternativa e gatilho de
  revisão. O D2 recuperado aceita somente Plutão/lavanderia: não foi importado,
  copiado nem ampliado para armazenar dados NIVVO. Seus TTLs experimentais não
  foram adotados como regra de treino.
- O fluxo situação/objetivo → alternativas/bloqueios → decisão → resultado foi
  demonstrado no caso sintético. Revisão por mudança de equipamento/fonte é
  proposta de validade; não foi instalada uma política automática nova.
- IDs de pedido/escrita, revision e outbox já existentes são o ponto de partida
  para recibos. O piloto emite evidência local; não instala D3, fila ou cron nem
  prova entrega automática entre chats. Dados privados continuam no domínio NIVVO.

Campanha de Consolidação e Avanço — 20/11/2026:

- **ATUAL / VERIFICADO:** reentrada em árvore limpa no commit
  `f74ed828759226d7c00fbfbceb463d42beb1a4eb`; GitHub confirmou PR #1 aberto/draft,
  mesma branch e base pública inalterada. A linha de base desta campanha foi
  executada: Node v24.22.3, 17/17 testes e build PASS antes de editar código.
- **ATUAL / VERIFICADO:** Supabase novamente encontrado INACTIVE. Um pedido
  oficial de restore foi aceito; depois COMING_UP, ACTIVE_HEALTHY e consulta
  agregada bem-sucedida. Causa da inatividade não estabelecida. Sem migration,
  reconstrução de Auth/RLS, alteração de redirects ou credenciais recuperadas.
- **ATUAL / BLOCKED:** navegador existente sem abas; staging privado abriu no
  login sem sessão NIVVO. A consulta agregada mostrou quatro contas existentes,
  nenhuma criada/confirmada desde o handoff de 10/11; não foram lidos nomes,
  e-mails ou credenciais. Criar conta e seus campos obrigatórios foram
  inspecionados novamente, sem preenchimento ou envio. Captura real:
  `evidence/browser-staging-signup-2026-11-20.jpg`.
- **FAIL FUNCIONAL REPRODUZIDO / CORRIGIDO LOCAL:** os handlers da interface em
  DOM isolado ignoravam mudança de identidade, mantinham tela privada diante de
  sessão expirada e ignoravam erro no retorno de logout. A correção limita-se a
  `cloud/app.mjs`: troca limpa da conta, requisições vinculadas à identidade e
  época, descarte de respostas/rejeições antigas, retorno ao login em 401 e
  preservação de rascunho/fila/feedback/write ID para retry pelo proprietário.
  Erro de logout deixou de ser apresentado como sucesso. O SDK instalado já
  remove a sessão local em vários desses erros; não foi presumido o contrário.
- **TESTADO AGORA:** regressão 33/33 (17 anteriores + 16 novos), build PASS.
  Execução em `evidence/consolidation-qa.json`. A suíte nova usa o frontend de produção com fronteiras
  sintéticas de DOM/Auth/HTTP; não duplica o motor nem comprova isolamento do
  Supabase ou E2E publicado. O teste inicial sem correção teve 1/6 PASS e 5/6
  FAIL; os casos foram expandidos para cobrir escrita em andamento, respostas
  tardias, recuperação, dados incompletos e consentimento obrigatório.
- **PENDENTE DE IMPLANTAÇÃO / ACEITE:** Site continua privado, ativo, versão salva
  1, fonte `ddcc76c987275ac765c3a876a159d4c9b9114767`. As correções desta campanha
  ainda não estão no staging. A instrução de não publicar sem autorização foi
  preservada. Não há PASS da jornada completa, mobile ou isolamento no navegador.
  As suítes históricas de Auth/RLS/RPC/cloud foram preservadas sem repetição.
- **PREPARADO / NÃO LIBERADO:** `docs/PILOTO_CONTROLADO.md` reúne roteiro
  reproduzível, critérios de entrada, coleta mínima, interrupção e reversão.
  Isso não equivale a piloto iniciado ou funcionalmente aprovado. A decisão
  atual é não liberar participantes antes de E2E, mobile e checkpoint Phill + Sol.

Próximo: Phill conclui cadastro/confirmacão ou entrada da conta QA na aba
preservada; inspecionar a sessão resultante antes de outra solicitação. A correção
revisável no PR aguarda autorização para atualizar somente o staging privado.
Depois, executar a jornada inteira com duas contas e mobile. Após PASS, checkpoint
Phill + Sol e decisão de liberação controlada. Sem expansão automática de escopo.
