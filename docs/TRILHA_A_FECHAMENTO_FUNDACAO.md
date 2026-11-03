# NIVVO — Trilha A | Fechamento da fundação publicada

**Estado:** ativa  
**Versão-alvo:** v1.1.0-dev  
**Objetivo:** comprovar a jornada publicada real no staging e encerrar a fundação técnica sem reabrir escopo já validado.

## 1. Entrada

Pré-condições já satisfeitas:
- Supabase exclusivo saudável.
- 17 tabelas com RLS.
- Auth e redirects configurados.
- Edge Function e quatro RPCs validados.
- Staging privado publicado.
- Página NIVVO v1.1.0-dev já abriu no navegador.
- Suítes históricas preservadas: 17/17 regressão, 46/46 Auth/RLS/RPCs e 10/10 UI cloud.

Não repetir essas validações sem sinal material novo.

## 2. Sequência mínima do E2E

1. Inspecionar a sessão de navegador existente.
2. Determinar se a autenticação NIVVO anterior ficou válida.
3. Se válida, continuar sem novo login.
4. Se inválida/ausente, realizar somente o login necessário.
5. Executar:
   - cadastro/login
   - perfil
   - modalidade/equipamentos
   - geração de plano
   - início de sessão
   - registro de sets
   - feedback
   - histórico
   - logout
   - novo login
   - restauração do estado pela nuvem
6. Confirmar que o usuário vê apenas seus próprios dados.
7. Registrar evidência real de navegador.

## 3. Critérios de PASS

A Trilha A só fecha se:
- a jornada inteira ocorrer no staging publicado;
- dados persistirem no Supabase;
- logout remover a sessão local;
- novo login restaurar o estado esperado;
- nenhum dado de outra conta aparecer;
- não houver necessidade de migration/rebuild de Auth;
- evidência distinguir claramente navegador real de HTTP/API ou DOM simulado.

## 4. Critérios de BLOCKED

Se ocorrer falha do ambiente (ex.: 503 / browser indisponível):
- registrar como bloqueio de ambiente;
- preservar a sessão/estado existente;
- não alterar NIVVO para compensar falha externa;
- retomar do último ponto verificável.

Se ocorrer falha funcional do NIVVO:
- capturar tela/ação/erro/etapa;
- localizar a camada responsável;
- corrigir somente o defeito reproduzível;
- retestar a etapa afetada e depois a jornada completa.

## 5. Evidências esperadas

Atualizar ou criar apenas o necessário:
- `evidence/browser-staging-qa.json`
- screenshot(s) da jornada quando possível
- `docs/ESTADO_ATUAL.md` somente após mudança material verificável

Não usar contagem de commits como proxy de progresso.

## 6. Saída

Trilha A concluída quando:
- E2E publicado = PASS;
- estado verificável atualizado;
- bloqueio técnico de fundação encerrado.

Próximo gate:
**Checkpoint Phill + Sol** antes de Trilha B, Vênus, promoção de versão, merge ou expansão comercial.

## 7. Fora de escopo nesta trilha

- novas modalidades;
- Plus/pagamentos;
- redesign/UX visual;
- PostHog/analytics avançado;
- compliance documental final;
- publicação pública;
- mudança de preço;
- novas migrations sem defeito material reproduzível.

## 8. Otimização operacional

Princípio da trilha:
**retomar > repetir; provar > presumir; corrigir o defeito > reconstruir o sistema.**

A evidência existente deve ser reutilizada. Só uma falha nova justifica reabrir uma camada já validada.
