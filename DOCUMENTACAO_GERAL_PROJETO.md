# Documentacao Geral Do Projeto

Atualizado em: 2026-04-07

## 1. Objetivo deste documento

Este documento e a referencia de handoff do projeto para equipe, desenvolvimento futuro e retomada por IA.

Ele explica:
- o que estamos construindo
- qual e o repositorio oficial
- como frontend, Supabase e GPT se conectam
- o que ja foi entregue
- o que esta publicado
- o que esta pendente
- quais regras nao devem ser quebradas

## 2. Escopo oficial

### Frontend oficial

Repositorio GitHub/Netlify:
- `mtv-astro/planejamento_ciclico`

Diretorio local:
- `C:\Users\carlo\projects\planejamento_ciclico_repo`

Responsabilidade:
- landing publica
- login web
- Galeria de Mapas
- Escritorio de Planejamento Ciclico
- Biblioteca
- Conta
- Admin

### Backend operacional

Diretorio local:
- `C:\Users\carlo\projects\gpt`

Responsabilidade:
- Supabase migrations
- Edge Functions
- fluxo do Custom GPT
- OpenAPI das actions
- instructions do GPT

Regra importante:
- `gpt` nao e o repositorio web do GitHub.
- `gpt` e usado para atualizar Supabase/backend quando necessario.
- commits e pushes web devem acontecer no `planejamento_ciclico_repo`.

## 3. Decisoes fechadas

- A landing publica do repo web deve permanecer preservada em design, layout, conteudo, assets e comportamento.
- A area privada fica no mesmo app da landing, em rotas autenticadas/ocultas.
- O login web usa `email + senha`.
- O GPT usa `username ou email + senha` pela action `authLoginSession`.
- `session_id` e interno ao GPT e nunca deve ser pedido para a usuaria.
- O GPT nao deve expor URLs tecnicas de bucket ou `signed_url`.
- O acesso a imagens, textos e arquivos deve ser feito pela Galeria autenticada.
- Produto autenticado oficial: `Escritorio de Planejamento Ciclico`.
- Modulo astral: `Galeria de Mapas`.
- Modulo de aulas: `Biblioteca`.
- Admin fica escondido e protegido por `admin_roles`.

## 4. Arquitetura do produto

O produto deixou de ser apenas uma galeria privada e passou a ser um ambiente autenticado com modulos.

Estrutura conceitual:
- `Escritorio de Planejamento Ciclico`: centro do produto
- `Galeria de Mapas`: mapas, imagens, textos, JSON e PDF
- `Biblioteca`: videoaulas e materiais
- `Conta`: dados da usuaria e senha
- `Admin`: equipe interna

## 5. Rotas atuais

Rotas publicas:
- `/`
- `/privacidade`
- `/login`

Rotas privadas liberadas por padrao para usuarias comuns:
- `/conta`
- `/galeria`
- `/explorer`
- `/my-maps`
- `/mapas/:chartId`

Rotas privadas que dependem de permissao:
- `/app`
- `/ciclo`
- `/planejar`
- `/biblioteca`

Rota administrativa:
- `/admin`

## 6. Permissoes e acesso

### Regra padrao

Contas comuns sem permissoes marcadas podem acessar apenas:
- login
- conta
- Galeria de Mapas

Elas ficam bloqueadas em:
- Escritorio `/app`
- Ciclo `/ciclo`
- Planejar `/planejar`
- Biblioteca `/biblioteca`

Se tentarem acessar uma rota bloqueada, sao redirecionadas para `/galeria`.

### Campo de permissao

As permissoes por modulo ficam em:
- `profiles.app_permissions`

Chaves atuais:
- `app`
- `ciclo`
- `planejar`
- `biblioteca`

### Admin

Admins sao definidos por:
- `admin_roles`

Quem tem `admin_roles`:
- acessa todos os modulos
- aparece como admin no painel
- pode editar contas, permissoes e conteudos administrativos

No painel `/admin`, a equipe pode:
- criar contas
- editar email, username, nome exibido e status
- resetar senha
- conceder/remover cargo admin
- liberar/bloquear modulos por usuaria
- ver mapas, imagens, cotas e progresso de aulas

## 7. Estado atual do frontend

### Landing

Estado:
- preservada
- nao deve ser alterada em ajustes da area privada

### Login

Estado:
- login por email e senha
- recuperacao de senha com botao `Esqueci minha senha`
- email de recuperacao enviado via Supabase Auth

### Conta

Estado:
- edicao de username e nome exibido
- troca de senha
- upload de foto de perfil
- avatar armazenado em bucket privado
- avatar exibido na topbar via blob autenticado, sem URL publica de storage

### Galeria de Mapas

Estado:
- lista mapas da usuaria
- mostra imagem por blob autenticado, sem `signed_url` no `img src`
- permite renomear mapa
- permite definir mapa principal
- permite excluir mapa
- permite download de imagem
- mostra documentos anexados ao mapa
- permite baixar `.md`
- permite baixar `.json` estruturado da interpretacao
- permite baixar `JSON bruto` vindo de `charts.raw_json`
- permite exportar PDF local com imagem + interpretacao
- abre imagem do mapa em modal ampliado ao clicar
- mostra card de leitura em partes abaixo do mapa quando existe Markdown salvo
- datas aparecem no formato dia/mes/ano
- sistema de casas `A` aparece como `Casas Iguais`

### Escritorio `/app`

Estado:
- rota privada criada
- circuito horizontal criado
- estrutura de quatro areas:
  - Praca central
  - Area pessoal
  - Gavetas de ferramentas
  - Mural publico
- carrossel/circuito usa repeticao para sensacao de continuidade
- Galeria aparece como modulo ativo dentro das gavetas

### Mandala pessoal

Estado:
- mandala de 12 casas implementada
- cada casa e clicavel
- modal de notas por casa
- modal expandido com mandala ampliada
- lateral com stickers de signos e planetas
- stickers podem ser posicionados no modal expandido
- posicionamento aparece tambem na mandala menor
- persistencia real no Supabase
- fallback local em `localStorage` se a API falhar

### Biblioteca

Estado:
- rota `/biblioteca` criada
- lista modulos e aulas publicados
- aulas podem ser cadastradas por URL do YouTube
- frontend usa `video_embed_url` em iframe
- progresso de aula pode ser marcado

Observacao:
- YouTube nao e DRM.
- Para protecao forte de conteudo, avaliar depois Vimeo privado, Bunny Stream, Mux ou similar.

### Admin

Estado:
- rota `/admin` criada
- protegida por backend com `admin_roles`
- permite gerenciar:
  - contas
  - permissoes
  - cargo admin
  - reset de senha
  - modulos da Biblioteca
  - aulas por YouTube
  - jornal da Praca central
  - metricas de usuarias

### Mobile

Estado:
- topbar privada ajustada para telas abaixo de 420px
- titulos e paddings reduzidos em paginas privadas
- menu superior tem link `Voltar ao inicio` apontando para `/app`

## 8. Backend Supabase

Projeto remoto:
- `rwrukwznfpgreqiogcju`

Edge Functions principais usadas pelo frontend:
- `get-current-user`
- `upload-current-user-avatar`
- `get-current-user-avatar-file`
- `list-user-charts`
- `list-chart-images`
- `get-current-user-chart-image-file`
- `get-current-user-chart-raw-json-file`
- `set-current-user-map`
- `set-chart-title-current-user`
- `delete-current-user-chart`
- `update-current-user-profile`
- `get-current-user-mandala`
- `save-current-user-mandala`
- `list-library-content`
- `set-lesson-progress`
- `admin-list-library`
- `admin-save-library-module`
- `admin-save-library-lesson`
- `list-community-posts`
- `admin-save-community-post`
- `admin-list-users`
- `admin-create-user`
- `admin-update-user`
- `admin-reset-user-password`
- `save-chart-interpretation-session`
- `list-chart-documents`
- `get-current-user-chart-document-file`

Edge Functions principais do fluxo GPT:
- `auth-login-session`
- `birth-chart`
- `get-user-map`
- `set-user-map`
- `set-chart-title`
- `list-user-charts-session`
- `list-chart-images-session`
- `generate-chart-images`
- `save-chart-interpretation-session`

Tabelas/dominos adicionados ou ampliados:
- `profiles.app_permissions`
- `profiles.avatar_bucket`
- `profiles.avatar_path`
- `profiles.avatar_mime_type`
- `profiles.avatar_updated_at`
- `admin_roles`
- `user_mandalas`
- `user_mandala_houses`
- `user_mandala_stickers`
- `library_modules`
- `library_lessons`
- `user_lesson_progress`
- `community_posts`
- `chart_documents`

Buckets privados:
- `chart_documents`
- `profile_avatars`

## 9. GPT Custom

Arquivos locais canonicos:
- `C:\Users\carlo\projects\gpt\CUSTOM_GPT_ACTIONS_OPENAPI.yaml`
- `C:\Users\carlo\projects\gpt\CUSTOM_GPT_INSTRUCTIONS.txt`

Regras principais:
- login vem antes de tudo
- pedir `username ou email + senha`
- usar `authLoginSession`
- nunca pedir token
- nunca pedir `session_id`
- verificar mapa salvo antes de recalcular
- nao gerar imagem automaticamente
- se a usuaria pedir dark, usar template coerente, como `natal-equal-dark-v1`
- nao expor URL tecnica de storage
- encaminhar para a Galeria autenticada
- salvar interpretacoes relevantes com `saveChartInterpretationSession`

Importante sobre JSON:
- JSON bruto do mapa vem do `birthChart` e fica salvo em `charts.raw_json`
- a Galeria exporta esse JSON bruto por endpoint autenticado
- `interpretation_json` e apenas um JSON derivado da leitura feita pelo GPT, nao substitui o payload bruto da API astrologica

## 10. Contas e credenciais iniciais

Foi criado um CSV local com usuarias, emails, celulares, usernames e senhas:
- `C:\Users\carlo\projects\gpt\_exports\usuarios_senhas_20260407.csv`

Esse arquivo contem senhas e nao deve ser commitado.

Estado:
- 14 usuarias iniciais foram criadas e validadas
- Aline Cardoso foi adicionada depois
- Xiomara Secondi foi adicionada depois
- todas as contas criadas receberam cota mensal da Astrology API

Padrao usado para senhas iniciais:
- sobrenome + planeta + numero
- excecao especifica: Xiomara usa `luaxio420`, conforme definido manualmente

## 11. Deploy

Frontend:
- GitHub: `mtv-astro/planejamento_ciclico`
- branch: `main`
- Netlify redeploya automaticamente a cada push

Build:
```powershell
npm run build
```

Configuracao:
- `netlify.toml`
- build command: `npm run build`
- publish directory: `dist`
- proxy `/api/*` para Supabase Functions
- fallback SPA `/* -> /index.html`

Observacao:
- localmente, `vite.config.ts` tambem tem proxy `/api` para facilitar teste da galeria e admin sem depender do Netlify.

## 12. Teste local recomendado

Diretorio:
```powershell
cd C:\Users\carlo\projects\planejamento_ciclico_repo
```

Rodar:
```powershell
npm run dev
```

Testar:
- `/`
- `/login`
- `/galeria`
- `/mapas/:chartId`
- `/conta`
- `/app`
- `/biblioteca`
- `/admin`

Checklist:
- landing nao mudou
- login funciona
- recuperacao de senha mostra mensagem
- galeria carrega mapas
- imagem abre em modal
- leitura aparece em partes quando houver Markdown
- JSON bruto baixa
- PDF abre janela de impressao
- conta permite trocar senha
- admin lista usuarias
- admin permite editar permissao
- usuaria comum sem permissao e redirecionada para `/galeria`

## 13. Commits recentes relevantes

No repo web:
- `5efc409 Add escritorio workspace admin and gated modules`
- `c19a61c Add password reset to login`
- `52346cb Improve private mobile layout and app navigation`

## 14. Riscos e cuidados

- Nao alterar a landing publica sem decisao explicita.
- Nao expor `service role key` no frontend.
- Nao voltar a expor `signed_url` para imagem ou documento da usuaria.
- Nao commitar CSV de senhas.
- Nao confundir JSON bruto do mapa com JSON da interpretacao.
- Nao assumir que YouTube protege conteudo privado.
- Sempre publicar Edge Functions necessarias no Supabase quando backend mudar.
- Sempre atualizar o builder do GPT quando mudar YAML/instructions.
- Sempre testar build antes de push.

## 15. Proximos passos recomendados

Curto prazo:
- testar mobile real abaixo de 420px
- testar recuperacao de senha em email real
- testar permissoes com uma conta comum
- testar admin concedendo/removendo acesso a Biblioteca e `/app`
- testar fluxo GPT salvando interpretacao e verificando documentos na Galeria

Produto:
- amadurecer `/app` visualmente sem transformar em dashboard generico
- conectar mais dados reais ao Escritorio
- evoluir Mandala pessoal
- iniciar conteudo real da Biblioteca
- planejar mural publico/comunidade com moderacao

Backend:
- revisar RLS e functions admin antes de uso amplo
- criar estrategia mais robusta para conteudo de video se precisar protecao real
- manter migrations organizadas no `gpt`

Operacional:
- manter `DOCUMENTACAO_GERAL_PROJETO.md` como referencia principal de handoff
- atualizar este documento sempre que houver mudanca estrutural
