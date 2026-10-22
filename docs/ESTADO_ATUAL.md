# NIVVO — estado de reentrada em 22/10/2026

Fonte de autoridade de produto: mensagem inaugural de Phill neste Work.
Esta conferência distingue decisões vigentes de código, infraestrutura e testes.
Ela não cria versão do SOL-CORE nem redefine especialistas ou contratos.

## Registro de evidências

| Item | Classificação | Evidência e limite |
| --- | --- | --- |
| NIVVO, slogan, visão adaptativa, Free/Plus e R$29,90/mês | ATUAL | Handoff de Phill em 22/10. Prevalece sobre textos antigos. |
| Beta público v1.0.3 | IMPLEMENTADO | `PhilGayer/nivvo-beta`, main `727457617c6bb80cd8f43d17acd2573854566316`, de 08/10. Um arquivo index.html; blob `61d0b917e66c5fe481ea4cdad36f49d06008a396`. |
| Publicação desse beta | IMPLEMENTADO | Workflow Pages `37867671428`: completed/success, mesmo commit; concluído 08/10 às 22:01:55 de São Paulo (09/10 01:01:55 UTC). A entrada pública foi aberta nesta reentrada. |
| v1.1.0-dev | ATUAL / PENDENTE | Direção vigente. Esta branch inicia mudanças verificáveis sobre o beta; não há publicação v1.1.0 comprovada. |
| Supabase NIVVO | IMPLEMENTADO | `alktccwzyyytvrzpwvjj`, nome NIVVO, sa-east-1, ACTIVE_HEALTHY; criado 22/10/2026 01:17:09 UTC, equivalente a 21/10 22:17:09 em São Paulo. |
| Banco de aplicação | PENDENTE | Consulta do projeto correto retornou zero tabelas em public e zero migrations; não significa ausência dos schemas internos do Supabase. Nenhuma alteração no banco nesta rodada. |
| Custo atual do Supabase | PENDENTE | 0/mês foi informado no handoff. Não houve nova consulta de cobrança; não é garantia de preço permanente. |
| NIVVO_backend_ready.zip | HISTÓRICO / PROPOSTA | Pacote de 08/10 recuperado e inspecionado; schema.sql, beta_test_plan.json, README, .env.example e HTML. Não é backend implantado nem build v1.1. |
| QA v1.0.3 antigo | HISTÓRICO | Relatório não encontrou IDs/onclick ausentes e registrou ajustes de progressão e desconforto. Isso não cobre chamadas internas nem comprova integração ou segurança. |
| Airtable NIVVO Beta Ops | IMPLEMENTADO | Base `appd6srpbYZd1MJXw` responde e contém Testers, Feedbacks e Releases. Apenas schemas consultados. Não é banco principal. |
| PostHog conectado | IMPLEMENTADO / PENDENTE | A conexão responde com projeto `654763`, nome `Default project`, `ingested_event=false`, `completed_snippet_onboarding=false`, timezone UTC. A associação exclusiva ao NIVVO não foi comprovada pelo nome. Nenhum evento ou configuração foi criado. |
| Auth real e sincronização | PENDENTE | O beta usa acesso demonstrativo e localStorage; não há chamadas de rede no script recuperado. |

Fontes rastreáveis:

- [Repositório](https://github.com/PhilGayer/nivvo-beta)
- [Baseline](https://github.com/PhilGayer/nivvo-beta/commit/727457617c6bb80cd8f43d17acd2573854566316)
- [Deployment](https://github.com/PhilGayer/nivvo-beta/actions/runs/37867671428)
- [Beta público](https://philgayer.github.io/nivvo-beta/)
- Arquivos anteriores: `NIVVO_backend_ready.zip` e `NIVVO_v1_0_3_QA_report.json`.

## Primeira correção técnica nesta branch

O perfil rápido chamava `session(...)`, função ausente, ao confirmar equipamentos.
Agora chama `makeSession(...)`, o gerador que já existe neste mesmo beta.
Não houve alteração das regras de seleção ou da identidade visual.

O botão final do perfil também compartilhava o nome `compactNext` com a função;
a atualização do texto atingia a função em vez do elemento. A referência agora
usa `document.getElementById`, preservando o handler e exibindo “Revisar”.

Validação: dez testes do script real, com DOM simulado e storage isolado por teste.
Antes da correção: oito passaram e dois falharam. Depois: dez passaram.
Cobrem geração, perfil rápido, rótulo final, séries/carga/reps, conclusão,
histórico/restauração local, progressão comparada, desconforto e troca.
Não comprovam layout, rede, Auth, RLS, migração nem interação em outro aparelho.

QA de navegador no beta público: com perfil fictício e modo sem conta, percorri
entrada, onboarding, Free, perfil rápido, revisão e equipamentos. “Montar minha
semana” permaneceu na mesma tela e o console registrou `ReferenceError: session
is not defined` em `finishEquipment`. O botão da terceira etapa continuou
“Continuar”. Assim, os dois desvios também foram observados no navegador da
baseline. A versão corrigida ainda precisa de QA de navegador em staging.

## Desvios encontrados que bloqueiam um RC

1. **Backend antigo não deve ser aplicado sem revisão.** O campo plan é editável
   pelo próprio usuário; entitlement precisa vir de fonte confiável. Referências
   entre sessões e planos precisam verificar propriedade também no pai.
   Faltam estruturas atuais de modalidades, agenda, consentimento e auditoria.
2. **Equipamentos ainda são pontuação, não elegibilidade garantida.** O motor
   pode retornar exercício incompatível quando a lista compatível é curta.
   Uma execução com condomínio + apenas peso corporal retornou Puxada frontal
   (cabo), confirmando o desvio neste cenário.
   Corrigir em etapa própria, com critérios auditáveis e fixtures de condomínio.
3. **Adaptação ainda é parcial.** `currentSession()` sempre usa o primeiro dia;
   feedback V1 gera indicação textual de troca, sem comprovar substituição real
   no plano seguinte. Preservar dados e distinguir dica de decisão aplicada.
4. **Free/Plus do beta não representa a divisão vigente.** O beta vende Plus
   principalmente por desconforto e usa flags locais; o handoff vigente prevê
   multimodalidade e segurança de base. Preparar entitlement sem cobrança falsa.
5. **Privacidade e segurança precisam ser completadas.** Não há consentimentos
   versionados, exclusão real de conta, fila offline autenticada nem teste de
   isolamento. Campos interpolados em HTML exigem saída segura.

## Próxima sequência técnica autorizada

1. Manter esta baseline e a regressão; concluir QA de navegador da correção em staging.
2. Evoluir o schema anterior para o modelo atual no Supabase exclusivo NIVVO:
   perfis/preferências; modalidades/equipamentos e vínculos; agenda/eventos;
   planos/exercícios; sessões/séries; feedback/desconforto; progressão e decisões;
   assinatura/entitlement; versões legais, consentimentos e aceites.
3. Implementar e-mail/senha, login/logout, recuperação/alteração/exclusão e
   persistência real. Não depender de OAuth nem do futuro gateway.
4. Validar dois usuários por Auth/Data API: leitura, insert, update, delete,
   reassociação de dono e referências cruzadas. Verificar também grants/funções.
5. Migrar por fluxo vertical: perfil → plano → sessão/sets → feedback → histórico
   → adaptação, com fila offline/retry/reconciliação e teste de retorno/login.
6. Separar motor em dados/regras/decisão/explicação, estruturar modalidades e
   auditoria, manter musculação sólida e preparar corrida/eventos complementares.
7. Instrumentar somente eventos permitidos após resolver identidade do projeto
   PostHog. Sem conteúdo sensível, captura automática de campos ou replay.

Referências técnicas consultadas: [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security),
[changelog Supabase](https://supabase.com/changelog) e
[configuração JavaScript PostHog](https://posthog.com/docs/libraries/js/config#advanced-configuration).

Critério de RC: jornada mínima completa do handoff, segurança/RLS com dois usuários,
regressão do beta e fixtures de musculação, condomínio, corrida+musculação,
futebol próximo de pernas, desconforto, segunda modalidade Free e histórico.
Loja, pagamento real, nutrição e mascote não antecipam esse critério.

## Decisões materiais e limites

Identidade, preço, escopo profissional, regras centrais e lançamento continuam com
Phill + Sol. Esta rodada não solicitou nem simulou análise de especialistas.
Detalhes profissionais/jurídicos e termos finais ainda precisam de validação
apropriada; nenhuma identidade, registro, aceite ou consentimento foi inventado.

O beta main/Pages permanece preservado. Esta branch e seus testes são preparação
de desenvolvimento, não entrega do backend, publicação v1.1.0 ou RC.
