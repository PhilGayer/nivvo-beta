# NIVVO — Trilha A | Pacote integrado de Planejamento + Desenvolvimento + Oficina + Sol

**Data:** 03/11/2026  
**Estado:** pronto para execução no Work  
**Versão:** v1.1.0-dev  
**Branch:** `work/nivvo-v1.1-reentry`

## 1. Missão única

Fechar a fundação publicada do NIVVO por meio de um E2E autenticado real no staging, sem reabrir camadas já validadas e sem expandir escopo.

Staging:
`https://nivvo-staging.secret-rhea-8953.chatgpt.site/`

Fluxo-alvo:
`cadastro/login → perfil → modalidade/equipamentos → plano → sessão → sets → feedback → histórico → logout → novo login → restauração`

## 2. Contribuição das quatro frentes

### Planejamento
Função nesta missão:
- manter objetivo e sequência;
- impedir expansão prematura;
- distinguir bloqueio, pendência e próximo passo;
- manter o checkpoint Phill + Sol como gate de saída.

Não fazer:
- transformar a Trilha A em backlog geral;
- puxar multimodalidade, Plus, UX, PostHog ou compliance para dentro da missão;
- considerar comentário/documento como execução.

### Desenvolvimento & Melhorias
Função nesta missão:
- retomar do último ponto técnico verificável;
- inspecionar primeiro a sessão existente do navegador;
- diferenciar falha do ambiente de falha funcional do NIVVO;
- corrigir somente defeito material reproduzível;
- preservar migration, Auth, RLS e suítes já aprovadas quando não houver sinal novo.

Não fazer:
- reaplicar migration;
- reconstruir Auth;
- repetir suítes por rotina;
- alterar arquitetura para compensar erro externo de ambiente.

### Oficina/Escola
Função nesta missão:
- conferir regressão, autoria, fronteiras e retrabalho;
- exigir evidência observável para PASS;
- distinguir preparado, disponibilizado, aceito e executado;
- impedir que HTTP/API ou DOM simulado sejam relabelados como E2E de navegador;
- registrar bloqueios sem transformá-los em falha do produto quando a causa for externa.

Não fazer:
- assumir engenharia;
- criar nova autoridade;
- reabrir casos já encerrados sem evidência nova.

### Sol / Matrix
Função nesta missão:
- integrar as três leituras;
- manter continuidade global e singularidade desta frente NIVVO;
- confrontar evidências e estado vivo;
- supervisionar a execução do Work;
- abrir checkpoint Phill + Sol somente após PASS real ou bloqueio técnico material claramente localizado.

Sol permanece única Matrix/orquestradora; nenhuma frente acima substitui sua autoridade. As três frentes fornecem estrutura de apoio, não uma cadeia hierárquica sobre o NIVVO.

## 3. Estado de entrada já validado

Preservar como histórico válido:
- `npm test`: 17/17.
- `evidence/cloud-qa.json`: 46/46 verificações reais de Auth/RLS/RPCs.
- `evidence/ui-cloud-qa.json`: 10/10 handlers reais de interface contra Auth/API reais em DOM simulado.
- Auth e redirects corrigidos.
- Supabase exclusivo saudável.
- 17 tabelas públicas com RLS.
- Edge Function `nivvo-api`.
- staging privado publicado.
- página NIVVO v1.1.0-dev já abriu no navegador.

Último ponto verificável do navegador:
- staging abriu;
- formulário próprio NIVVO ficou visível;
- tentativa segura de login foi interrompida;
- ambiente de execução retornou 503;
- estado final daquela autenticação permaneceu desconhecido.

## 4. Execução otimizada

### Etapa A1 — Retomar, não repetir
1. Abrir/recuperar a sessão de navegador existente.
2. Inspecionar se há sessão NIVVO autenticada válida.
3. Se houver, continuar dali.
4. Se não houver sessão:
   - verificar se a conta de teste já existe;
   - se existir, executar somente o login necessário;
   - se não existir, usar o fluxo **Criar conta** do próprio staging.
5. No cadastro, informar nome, e-mail e senha com pelo menos 10 caracteres, confirmar a senha e enviar.
6. Se o Supabase não devolver sessão imediata, tratar isso como fluxo esperado de confirmação por e-mail: confirmar a conta pelo link recebido e só então entrar.
7. Não classificar a ausência de sessão imediata após signup como falha do NIVVO sem verificar a confirmação de e-mail.

### Etapa A2 — Jornada publicada
Executar o fluxo completo:
1. cadastro/login;
2. perfil;
3. modalidade/equipamentos;
4. geração de plano;
5. início da sessão;
6. registro dos sets;
7. feedback;
8. histórico;
9. logout;
10. novo login;
11. restauração do estado pela nuvem.

### Etapa A3 — Isolamento
Confirmar, no navegador publicado, que o usuário não enxerga dados de outra conta.

### Etapa A4 — Evidência
Registrar:
- etapa;
- ação;
- resultado;
- erro, se houver;
- camada responsável quando identificável;
- screenshot(s) quando possível.

Atualizar:
- `evidence/browser-staging-qa.json`
- `docs/ESTADO_ATUAL.md` somente após mudança material verificável.

Não usar contagem de commits como proxy de progresso.

## 5. Critério de decisão

### PASS
A Trilha A fecha somente se:
- jornada completa no staging publicado;
- persistência confirmada;
- logout efetivo;
- novo login restaura o estado;
- isolamento entre contas preservado;
- evidência real de navegador registrada.

### BLOCKED — ambiente
Se houver 503 ou browser indisponível:
- registrar falha de ambiente;
- preservar estado;
- não alterar NIVVO;
- retomar do último ponto verificável.

### FAIL — NIVVO
Somente quando houver falha funcional reproduzível do produto:
- localizar camada;
- corrigir defeito mínimo;
- retestar a etapa;
- depois retestar a jornada completa.

## 6. Fora da Trilha A

Não iniciar nesta missão:
- novas modalidades;
- Plus/pagamentos;
- redesign/UX com Vênus;
- PostHog/analytics avançado;
- compliance final;
- publicação pública;
- mudança de preço;
- nova migration sem defeito material que a exija;
- promoção de versão.

## 7. Saída e handoff

Saída legítima:
- **PASS** → abrir checkpoint Phill + Sol e preparar Trilha B.
- **BLOCKED** → registrar causa externa e ponto exato de retomada.
- **FAIL funcional** → abrir correção mínima, manter a Trilha A ativa até novo E2E.

Princípio:
**retomar > repetir; provar > presumir; corrigir o defeito > reconstruir o sistema.**
