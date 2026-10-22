# NIVVO — instruções deste repositório

Este é o Work oficial de produto e software do NIVVO, integrado à S.O.L.
Leia `docs/ESTADO_ATUAL.md` antes de implementar. O projeto tem história e um beta
existente; evolua esse código e preserve os fluxos comprovados.

## Autoridade e continuidade

- Phill + Sol decidem mudanças materiais de produto, identidade, preço,
  Free/Plus, motor, lançamento, compliance e escopo profissional.
- Especialistas existentes contribuem no domínio; Sol confronta e integra.
  Não invente consultas, execuções ou validações de especialistas.
- Não crie especialistas, hierarquias, permissões ou versões do SOL-CORE.
- Decisões técnicas rotineiras e correções reversíveis podem prosseguir.
- Antes de pedir trabalho manual a Phill, esgote os acessos executáveis.
- Verifique silenciosamente temporalidade, autoria, fonte, autoridade,
  contradições, rastreabilidade, recuperação, privilégio e coerência.
- Classifique evidências como ATUAL / IMPLEMENTADO / TESTADO / HISTÓRICO /
  PROPOSTA / DESCARTADO / PENDENTE. Documento encontrado não comprova implantação.

## Invariantes do produto

- Nome: NIVVO. Slogan: “NIVVO — É novo. É vivo. É outro nível.”
- Plataforma adaptativa de preparação física: a modalidade principal do usuário
  orienta o treino; musculação é uma ferramenta, não o centro obrigatório.
- Free útil: uma modalidade ativa, troca consciente, personalização, progressão,
  histórico, feedback e substituições. Plus: duas ou mais modalidades, agenda,
  interferência, recuperação e adaptação avançadas; R$29,90/mês, sem anúncios.
- Tentativa de segunda modalidade no Free não apaga nem substitui dados.
- Segurança básica e orientação de desconforto não podem ser interrompidas por anúncios.
- Motor modular, testável, auditável, explicável; separe dados, regras, decisão
  e explicação. IA não altera regras críticas silenciosamente.
- Histórico individual prevalece progressivamente sobre priors demográficos.
- Nutrição e pagamentos reais ficam fora do núcleo desta rodada.
- Musculação sólida primeiro; estrutura multimodal universal; corrida depois;
  outros esportes inicialmente podem entrar como atividades/eventos.
- Preserve identidade visual sports-tech: #0A1F3D, #2F6BFF, #00E6B8, #1E2632,
  #F8FAFC; referência Manrope. GymRat é futuro, não prioridade de infraestrutura.

## Isolamento e publicação

- Único Supabase autorizado para NIVVO: `alktccwzyyytvrzpwvjj` (NIVVO).
- Não consulte nem altere dados, Auth, schemas, migrations, functions ou secrets
  do projeto financeiro S.O.L. nem de outra frente.
- `main`/GitHub Pages é a referência pública v1.0.3 beta. Trabalhe em branch.
  Não faça merge ou substitua produção automaticamente.
- `1.1.0-dev` é o estado de desenvolvimento; não anuncie v1.1.0 publicada
  sem build e deployment correspondentes.
- Supabase será fonte de verdade. Cache e fila offline precisam ter identidade
  do usuário, retry, reconciliação e proteção contra vazamento entre contas.
- Somente publishable key no cliente. Nenhuma credencial privada no frontend.
- Toda tabela exposta precisa de RLS e propriedade real, inclusive referências
  entre pais e filhos; UPDATE com USING e WITH CHECK.
- Plus/entitlements não podem ser concedidos pelo próprio cliente. Não invente
  pagamento, assinatura ativa ou confirmação de migração.

## Privacidade, profissão e qualidade

- Minimização, finalidade, consentimentos, documentos versionados, aceite,
  acesso/correção/exclusão e retenção devem compor a arquitetura.
- Desconforto/saúde ficam separados da telemetria, nunca em segmentação de ads.
- Não coletar captura automática de formulários nem gravar sessões sensíveis
  sem decisão específica e proteção verificável.
- NIVVO não diagnostica nem promete tratamento médico/fisioterapêutico.
  Responsabilidade técnica comercial depende de definição profissional real.
- Mobile-first, toque acessível, foco/labels, mensagens claras, poucas perguntas.
- Teste geração, progressão, seleção, troca, prioridade, recuperação,
  interferência e Free/Plus. Faça testes de integração e de RLS com dois usuários
  antes de considerar backend validado. Testes com DOM simulado não são E2E.

## Verificação nesta base

`npm test` executa os testes sem dependências externas (Node >=20).
As regras do motor continuam no script de `index.html`; não mantenha uma segunda
implementação nos testes. Documente limites e pendências em `docs/ESTADO_ATUAL.md`.
