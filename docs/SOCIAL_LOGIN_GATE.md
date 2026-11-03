# NIVVO — Social Login | Gate de ativação

**Objetivo:** reduzir fricção de cadastro/login sem substituir o fluxo por e-mail/senha.

## Implementado no app

O frontend agora:
- consulta `/auth/v1/settings` do Supabase;
- identifica Google, Apple e Facebook habilitados;
- exibe somente providers realmente ativos;
- usa `supabase.auth.signInWithOAuth()`;
- retorna ao staging atual após autenticação.

Nenhum botão social é mostrado se o provider não estiver habilitado.

## Prioridade

Ativar primeiro **Google**.

Callback Supabase a registrar no Google Cloud:
`https://alktccwzyyytvrzpwvjj.supabase.co/auth/v1/callback`

Redirect do app:
`https://nivvo-staging.secret-rhea-8953.chatgpt.site/`

## Gate externo para Google

1. Criar/selecionar projeto no Google Cloud.
2. Configurar OAuth consent screen.
3. Criar OAuth Client ID do tipo Web application.
4. Adicionar o callback Supabase acima em Authorized redirect URIs.
5. Copiar Client ID e Client Secret.
6. No Supabase: Authentication → Sign In / Providers → Google.
7. Habilitar Google e salvar Client ID + Client Secret.
8. Confirmar que o staging continua na redirect allow list.
9. Publicar/recarregar o staging com o frontend atualizado.
10. Testar:
   - conta nova por Google;
   - logout;
   - novo login por Google;
   - restauração;
   - conta já existente / identidade;
   - isolamento.

## Apple e Facebook

Só ativar depois que Google estiver PASS. Repetir o mesmo padrão com credenciais próprias de Apple Developer e Meta for Developers.

## Não fazer

- não remover e-mail/senha;
- não exibir provider não configurado;
- não inserir secrets no repositório;
- não usar service_role no frontend;
- não tratar OAuth configurado no app como provider habilitado sem teste real.
