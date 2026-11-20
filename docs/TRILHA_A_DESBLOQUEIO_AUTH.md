# NIVVO — Trilha A | Desbloqueio de Auth com apoio da tríade

**Data:** 03/11/2026  
**Estado:** pronto para execução no Work  
**Versão:** v1.1.0-dev  
**Branch:** `work/nivvo-v1.1-reentry`

## 1. Diagnóstico atual

Estado verificável:
- staging publicado acessível;
- formulário NIVVO visível;
- nenhuma sessão autenticada restaurada;
- tentativa via recurso seguro de autenticação do navegador terminou em timeout;
- nenhum erro funcional de credencial ou signup foi reproduzido;
- usuário ainda não possui uma conta NIVVO utilizável para concluir o E2E.

Logo, o bloqueio atual não deve ser tratado como “login inválido” nem como “Auth quebrado” sem nova evidência.

## 2. Apoio da tríade

### Planejamento
- manter a missão restrita a destravar acesso e retomar o E2E;
- impedir expansão para backlog geral de autenticação;
- separar solução imediata de melhoria futura.

### Desenvolvimento & Melhorias
- verificar o fluxo real `Criar conta` no staging;
- reproduzir cadastro e confirmação de e-mail;
- corrigir apenas defeito material reproduzível;
- só depois avaliar login social como melhoria separada.

### Oficina/Escola
- verificar que timeout do browserAuth não seja reclassificado como falha do NIVVO;
- exigir evidência para cada transição: cadastro enviado, e-mail confirmado, sessão criada, login concluído;
- conferir autoria e regressões.

### Sol / Matrix
- integrar as três leituras;
- supervisionar a execução;
- manter o NIVVO como frente singular;
- não executar engenharia paralela fora do Work.

## 3. Missão imediata do Work

### A. Cadastro por e-mail
1. Abrir o staging.
2. Acionar **Criar conta**.
3. Verificar se o formulário aceita:
   - nome;
   - e-mail;
   - senha;
   - confirmação de senha.
4. Confirmar a regra atual de senha (mínimo de 10 caracteres).
5. Enviar o signup.
6. Registrar a resposta do Supabase.
7. Se a confirmação de e-mail estiver habilitada:
   - confirmar que o e-mail foi enviado;
   - concluir a confirmação;
   - retornar ao staging;
   - efetuar login.
8. Confirmar criação de sessão e trigger de perfil/entitlement Free.

### B. Se houver falha funcional
Capturar exatamente:
- tela;
- ação;
- mensagem;
- request/response quando observável;
- camada responsável.

Corrigir somente o defeito reproduzível e retestar o fluxo de cadastro inteiro.

### C. Social login
Tratar como melhoria de UX após o signup básico estar comprovado ou quando o signup mostrar um bloqueio estrutural que justifique essa rota.

Prioridade:
1. Google;
2. Apple;
3. Facebook.

Não exibir botão social antes de provider realmente configurado e testado.

Callback esperado do Supabase:
`https://alktccwzyyytvrzpwvjj.supabase.co/auth/v1/callback`

Retorno do staging:
`https://nivvo-staging.secret-rhea-8953.chatgpt.site/`

Credenciais OAuth externas nunca entram no repositório.

## 4. Critério de saída deste subbloco

**PASS-AUTH**
- conta criada;
- confirmação concluída quando exigida;
- login real concluído;
- sessão NIVVO válida no staging.

Depois disso:
retomar imediatamente a Trilha A no ponto `perfil → modalidade/equipamentos → plano → sessão → sets → feedback → histórico → logout → novo login → restauração → isolamento`.

**BLOCKED**
- dependência externa/humana claramente identificada.

**FAIL funcional**
- defeito reproduzível do NIVVO, com camada localizada e correção mínima.

## 5. Princípio

`destravar acesso → provar sessão → retomar E2E`

Não reconstruir Auth, não reaplicar migration e não expandir escopo sem evidência.
