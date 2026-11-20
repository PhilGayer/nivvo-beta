# NIVVO — roteiro de consolidação e piloto controlado

20/11/2026 · v1.1.0-dev · PR #1 em rascunho.

**NÃO LIBERADO.** O roteiro está preparado; o E2E autenticado publicado e a
validação mobile ainda não passaram. Este documento não autoriza participantes,
publicação, cobrança ou alteração da audiência do Site.

## Entrada verificável

| Camada | Evidência nesta campanha | Limite |
| --- | --- | --- |
| GitHub | Branch em `f74ed828759226d7c00fbfbceb463d42beb1a4eb` na entrada; PR aberto/draft | `main` v1.0.3 preservada em `727457617c6bb80cd8f43d17acd2573854566316` |
| Supabase | INACTIVE → restore oficial aceito → ACTIVE_HEALTHY; consulta agregada respondeu | Causa da inatividade não estabelecida; não houve migration ou alteração de Auth/RLS |
| Staging | Site privado ativo, versão salva 1; cadastro visível no navegador | Fonte publicada `ddcc76c987275ac765c3a876a159d4c9b9114767`; correções desta campanha ainda não implantadas |
| Conta | Sem sessão NIVVO restaurada; nenhuma conta criada/confirmada desde o handoff de 10/11 | Criação da credencial/entrada humana pendente; as quatro contas anteriores não foram recriadas |
| Regressão | Base inicial: 17/17; após correções: ver `evidence/consolidation-qa.json` | DOM/Auth/HTTP sintéticos não equivalem a navegador real ou RLS real |

## Defeitos tratados

| Defeito reproduzido na interface real em DOM isolado | Correção em `cloud/app.mjs` | Verificação |
| --- | --- | --- |
| `SIGNED_IN` de outra conta era ignorado enquanto uma identidade já estava carregada | Limpa memória/tela da conta anterior, recupera a nova conta e vincula cada requisição à identidade/época de início | Troca A/B, identidade sem notificação, respostas/rejeições tardias e escrita em andamento |
| Sessão ausente ou HTTP 401 deixava a tela privada aberta; uma gravação recusada por Auth perdia sua operação de retry | Volta ao login e conserva rascunho/fila por proprietário, incluindo feedback e write ID | Expiração, rejeição do servidor e recuperação da fila pela mesma conta |
| Logout ignorava `error` retornado pelo SDK | Não anuncia sucesso quando o Auth devolve erro | Casos com e sem `SIGNED_OUT`, além do logout bem-sucedido |

O SDK instalado limpa a sessão local em vários erros de logout; a correção não
afirma que ele sempre a mantinha. O defeito demonstrado é ignorar seu erro.
Não houve demonstração de vazamento entre usuários no Supabase. A prova atual é
da fronteira da interface, com dados sintéticos e sem credenciais reais.

Reproduzir: `npm ci`, `npm test`, `npm run build`. A suíte nova executa os handlers
de produção; substitui somente Auth/HTTP/DOM. Não copia o motor de treino.

## Roteiro publicado obrigatório

Usar contas de QA autorizadas, dados sintéticos identificados como teste e o
mesmo staging privado. Nunca apresentar um registro sintético como treino
efetivamente realizado. Capturar etapas e mensagens sem e-mail, senha, tokens,
IDs pessoais ou JSON privado do Laboratório.

1. Inspecionar a sessão antes de pedir login. Se necessário, Phill conclui
   **Criar conta**, confirmação por e-mail e entrada na aba preparada. Para uma
   conta já utilizável, fazer apenas a entrada necessária. A nova senha fica
   fora do chat e das ferramentas visíveis à agente.
2. No perfil de QA, selecionar musculação, uma frequência curta e somente
   **Peso corporal**. Conferir campos obrigatórios e o consentimento do staging.
3. Salvar perfil e montar semana. Conferir nome, modalidade, equipamento e
   requisitos de cada exercício. Nenhum cabo, máquina, barra, halter ou banco
   ausente pode ser exigido. No Laboratório, conferir entradas, regra, decisão,
   motivo e alternativa, sempre da própria conta.
4. Iniciar/retomar sessão. Registrar valores sintéticos conhecidos, por exemplo
   carga 0 e 12 repetições, e salvar séries. Recarregar: recuperar os mesmos
   valores. Navegar de volta sem perder o rascunho.
5. Concluir e avaliar como teste, sem inventar relato pessoal de desconforto.
   Conferir sessão única, séries e feedback no Histórico.
6. Sair. Confirmar ausência de tela/dados privados. Entrar novamente e recuperar
   perfil, equipamento, plano, histórico, séries e feedback pela nuvem.
7. Com a segunda conta autorizada, conferir ausência do nome/plano/histórico e
   rascunhos da primeira; repetir no sentido inverso. Preservar as evidências
   históricas de RLS/API, sem relabelá-las como prova de navegador.
8. Em conta QA, testar envio interrompido, retry da mesma operação, ação repetida
   e retomada após expiração. Exigir ausência de duplicação, perda de séries e
   vazamento. Não encerrar a sessão pessoal de um participante para esse teste.
9. Repetir a jornada principal em tela estreita e em um aparelho móvel real:
   teclado numérico, rótulos, foco, alvos de toque, rolagem de séries, ausência
   de corte lateral e recuperação após fechar/reabrir. Isso está pendente.

Registrar o navegador em `evidence/browser-staging-qa.json`; registrar defeito,
camada, ação, resultado e reteste. **PASS** exige jornada, persistência,
logout/login, restauração e isolamento comprovados. **BLOCKED** identifica
dependência humana/ambiente. **FAIL funcional** exige defeito reproduzido,
correção e reteste; a aprovação local não encerra o E2E publicado.

## Entrada de participantes e interrupção

Antes do primeiro participante: fechar o E2E, implantar e verificar a revisão
aprovada no staging privado, testar mobile e conferir o Supabase ativo. Phill
define os participantes adultos e autoriza explicitamente o início/audiência.
O teste não inclui pagamento, novas modalidades ou promessa terapêutica.

Coleta mínima de feedback: etapa, aparelho/navegador, o que a pessoa tentou,
mensagem observada e se conseguiu continuar. Relatos de saúde ficam no fluxo
privado já existente; não entram em logs, analytics ou recibos compartilhados.
Não instalar uma segunda coleta, base ou processo para o piloto.

Interromper novas entradas se houver acesso indevido, perda/corrupção de dados
ou bloqueio da jornada. Corrigir primeiro; repetir a etapa e o fluxo completo
antes de retomar. Falha de ambiente é registrada separadamente.

Reversão: preservar este PR e a versão salva 1 do Site. Se uma futura revisão
privada autorizada falhar, restaurar a última versão privada verificada,
conferir o deployment e retomar a prova de sessão/persistência. Não apagar dados,
resetar o banco nem reaplicar migrations para voltar a interface. A reversão de
deployment é um procedimento preparado, ainda não exercitado nesta campanha.

## Decisões de Phill e próximo avanço

- Concluir a criação/entrada da conta de QA na aba preservada.
- Autorizar a atualização somente do staging privado com a correção revisável
  no PR; a instrução desta campanha não autorizou publicação.
- Após PASS e checkpoint Phill + Sol, decidir participantes e liberação
  controlada. O estado atual é **não liberar**.

Próximo avanço recomendado: implantar a correção aprovada no staging privado e
fechar a jornada autenticada, incluindo mobile e duas contas. A avaliação de
progressão longitudinal, catálogo, agenda, multimodalidade, Plus, analytics e
comercial só entra depois; nenhuma dessas expansões foi implementada aqui.
