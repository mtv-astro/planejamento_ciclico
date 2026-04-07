# Status Do Projeto E Handoff

## Objetivo deste documento

Este arquivo registra o estado atual do projeto web oficial para que qualquer pessoa da equipe, ou outra IA, consiga retomar o trabalho com contexto suficiente e sem reabrir decisoes ja fechadas.

Ele cobre:
- escopo oficial do projeto
- arquitetura atual
- decisoes de produto ja fechadas
- estado do frontend
- dependencias do backend
- fluxo de deploy
- fluxo de teste local
- riscos e pendencias
- proxima trilha recomendada

## 1. Escopo oficial

O frontend oficial do produto e este repo:
- [planejamento_ciclico_repo](/C:/Users/carlo/projects/planejamento_ciclico_repo)

O backend operacional e mantido localmente neste diretorio:
- [gpt](/C:/Users/carlo/projects/gpt)

Regra importante:
- o repo web oficial e `planejamento_ciclico_repo`
- o diretorio `gpt` nao e o repo web do GitHub; ele serve para ajustes de backend, Supabase, Edge Functions, OpenAPI e instructions quando necessario

## 2. Decisoes fechadas de produto

Estas decisoes ja foram tomadas e nao devem ser reabertas sem motivo forte:

- A landing publica do repo web deve permanecer 100% preservada em design, conteudo, layout, assets e comportamento.
- A area privada fica no mesmo app da landing, mas em rotas ocultas/autenticadas.
- O login web atual da area privada permanece `email + senha`.
- O fluxo do GPT e diferente do fluxo web:
  - no site: `Supabase Auth` no navegador
  - no GPT: `auth-login-session` com `session_id` interno
- O GPT nao deve expor URLs diretas do bucket do Supabase Storage.
- O acesso oficial a imagens e mapas deve acontecer pela Galeria de Planejamento Ciclico.
- O nome visivel da area privada deve ser `Galeria de Planejamento Ciclico`.
- O nome oficial da proxima evolucao do produto autenticado deve ser `Escritorio de Planejamento Ciclico`.

## 3. Arquitetura atual

### 3.1 Frontend oficial

Stack:
- Vite
- React
- TypeScript
- Tailwind
- shadcn-ui

Responsabilidade do frontend:
- landing publica
- login da area privada
- galeria de mapas
- visualizacao autenticada dos mapas e imagens
- configuracoes da conta

### 3.2 Backend dependente

O frontend conversa com Edge Functions do projeto Supabase remoto:
- projeto remoto: `rwrukwznfpgreqiogcju`

O repo local do backend e:
- [gpt](/C:/Users/carlo/projects/gpt)

## 4. Estado atual do frontend

### 4.1 Rotas principais

Rotas publicas e privadas relevantes no app:
- `/`
- `/login`
- `/explorer`
- `/my-maps`
- `/mapas/:chartId`
- `/conta`

### 4.2 O que ja esta funcionando no frontend

Ja foi implementado no app web:
- landing publica preservada
- login por email e senha
- area privada protegida
- listagem de mapas da usuaria
- visualizacao de imagens do mapa
- definicao de mapa principal
- renomeacao de mapa
- exclusao de mapa pela interface
- download de imagem
- pagina de conta
- troca de senha no frontend
- atualizacao de nome de exibicao e username pela pagina de conta
- menu superior com avatar, nome e menu hamburguer no canto superior direito
- modo noturno
- datas formatadas em `dd/mm/yyyy`
- traducao de sistema de casas para texto amigavel, por exemplo `A -> Casas Iguais`

### 4.3 Decisoes de UX ja refletidas no frontend

- Removido link de retorno para landing na navegacao da galeria.
- Removido botao lateral redundante de sair.
- Excluir mapa ficou mais discreto, com icone de lixeira.
- Download ficou com um unico ponto de acao.
- O acesso a imagens na galeria web nao usa mais `signed_url` diretamente no `img src`; a entrega passa por blob autenticado.

## 5. Dependencias de backend para a area privada

Para a area privada funcionar corretamente, o backend precisa manter publicadas estas Edge Functions:

- `get-current-user`
- `list-user-charts`
- `list-chart-images`
- `get-current-user-chart-image-file`
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

Observacao:
- parte dessas functions ja foi criada/ajustada no repo local `gpt` e publicada no Supabase remoto durante este ciclo
- em 06/04/2026 foram aplicadas no Supabase remoto as tabelas `user_mandalas`, `user_mandala_houses`, `user_mandala_stickers`, `library_modules`, `library_lessons` e `user_lesson_progress`
- em 06/04/2026 tambem foi aplicada a tabela `community_posts` para o jornal da Praca central
- em 06/04/2026 foi aplicada a tabela `chart_documents` e o bucket privado `chart_documents` para anexar interpretacoes em `.md` e `.json` aos mapas

## 6. Estado atual do fluxo GPT

O fluxo GPT usa o mesmo backend, mas outro contrato:
- login via `auth-login-session`
- uso interno de `session_id`
- consulta de mapas por sessao
- consulta de imagens por sessao
- geracao de imagens por sessao

Decisoes importantes ja fechadas:
- o GPT nao deve pedir token para a usuaria
- o GPT nao deve expor `session_id`
- o GPT nao deve expor `signed_url` de bucket
- o GPT deve encaminhar a usuaria para a Galeria de Planejamento Ciclico

Arquivos canonicamente usados para o builder do GPT:
- [CUSTOM_GPT_ACTIONS_OPENAPI.yaml](/C:/Users/carlo/projects/gpt/CUSTOM_GPT_ACTIONS_OPENAPI.yaml)
- [CUSTOM_GPT_INSTRUCTIONS.txt](/C:/Users/carlo/projects/gpt/CUSTOM_GPT_INSTRUCTIONS.txt)

## 7. Configuracao de deploy do frontend

Arquivo relevante:
- [netlify.toml](/C:/Users/carlo/projects/planejamento_ciclico_repo/netlify.toml)

Configuracao esperada:
- build command: `npm run build`
- publish directory: `dist`
- proxy `/api/*` para Supabase Functions
- fallback `/* -> /index.html`

Observacao importante:
- o deploy atual do site vem do GitHub conectado ao Netlify
- quando o repo web recebe push, o Netlify redeploya automaticamente

## 8. Variaveis de ambiente e fallback atual

No frontend existe fallback para evitar quebra total do site:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Motivo:
- em um momento o deploy estava sem a key no painel do Netlify e a landing quebrou
- foi implementado fallback para a `publishable key` no frontend como medida pragmatica

Tradeoff:
- isso reduz dependencia imediata do painel do Netlify
- mas o ideal a longo prazo continua sendo usar env vars no ambiente de deploy

## 9. Fluxo recomendado de teste local

Repositorio:
- [planejamento_ciclico_repo](/C:/Users/carlo/projects/planejamento_ciclico_repo)

Comando:
```powershell
npm run dev
```

URL local atualmente em uso durante esta sessao:
- `http://127.0.0.1:4174/`

Observacao:
- a porta pode variar se a anterior estiver ocupada

Checklist de teste local:
1. abrir a landing e verificar se nada mudou visualmente
2. abrir `/login`
3. fazer login com conta real
4. abrir `/explorer`
5. validar listagem de mapas
6. abrir um mapa especifico
7. validar modo noturno
8. validar download
9. validar exclusao
10. validar pagina `/conta`

## 10. Arquivos-chave do frontend

Arquivos mais importantes para retomada:
- [src/App.tsx](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/App.tsx)
- [src/pages/login.tsx](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/pages/login.tsx)
- [src/pages/explorer.tsx](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/pages/explorer.tsx)
- [src/pages/account.tsx](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/pages/account.tsx)
- [src/components/ProtectedRoute.tsx](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/components/ProtectedRoute.tsx)
- [src/components/PrivateTopbar.tsx](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/components/PrivateTopbar.tsx)
- [src/lib/api.ts](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/lib/api.ts)
- [src/lib/supabase.ts](/C:/Users/carlo/projects/planejamento_ciclico_repo/src/lib/supabase.ts)
- [netlify.toml](/C:/Users/carlo/projects/planejamento_ciclico_repo/netlify.toml)

## 11. Documentos complementares ja existentes

No repo web:
- [README.md](/C:/Users/carlo/projects/planejamento_ciclico_repo/README.md)
- [DEPLOY_EXPLORER_CHECKLIST.md](/C:/Users/carlo/projects/planejamento_ciclico_repo/DEPLOY_EXPLORER_CHECKLIST.md)
- [PUBLISH_SEQUENCE.md](/C:/Users/carlo/projects/planejamento_ciclico_repo/PUBLISH_SEQUENCE.md)

No backend local:
- [STATUS_IMPLEMENTACAO_E_HANDOFF.md](/C:/Users/carlo/projects/gpt/STATUS_IMPLEMENTACAO_E_HANDOFF.md)
- [CONTRATO_APIS_E_ACTIONS.md](/C:/Users/carlo/projects/gpt/CONTRATO_APIS_E_ACTIONS.md)
- [CUSTOM_GPT_ACTIONS_OPENAPI.yaml](/C:/Users/carlo/projects/gpt/CUSTOM_GPT_ACTIONS_OPENAPI.yaml)
- [CUSTOM_GPT_INSTRUCTIONS.txt](/C:/Users/carlo/projects/gpt/CUSTOM_GPT_INSTRUCTIONS.txt)

## 12. Riscos e pontos de atencao

- O login web ainda aceita apenas `email + senha`.
- O fallback da `publishable key` esta no frontend por decisao pragmatica, nao como estado ideal final.
- Sempre que o backend `gpt` mudar uma Edge Function usada pelo frontend, o impacto no site precisa ser testado localmente e em deploy.
- Sempre que o builder do GPT for alterado, o contrato OpenAPI e as instructions precisam continuar alinhados com o backend publicado.
- O frontend oficial nao deve voltar a depender de `signed_url` compartilhavel para mostrar imagens na galeria.

## 13. Proximos passos recomendados

Trilha recomendada daqui:
1. fazer ajustes no frontend localmente e validar em `http://127.0.0.1:4174/`
2. so depois commitar e subir para GitHub
3. quando houver necessidade de backend, ajustar no repo `gpt` e publicar no Supabase
4. quando houver necessidade de GPT, ajustar o YAML e as instructions no repo `gpt` e depois atualizar o builder

## 15. Inicio da V0.002

A nova etapa do `Escritorio de Planejamento Ciclico` foi iniciada no frontend oficial.

Entrou no codigo:
- rota privada `/app`
- primeira versao do circuito horizontal:
  - Praca central
  - Area pessoal
  - Gavetas de ferramentas
  - Mural publico
- mandala pessoal com 12 casas
- modal de notas por casa
- modal expandido da mandala com stickers de signos e planetas
- persistencia real da mandala no Supabase via `get-current-user-mandala` e `save-current-user-mandala`, com fallback local quando a conexao falhar
- alias `/galeria` apontando para a galeria atual
- placeholders protegidos para:
  - `/ciclo`
  - `/planejar`
- rota real `/biblioteca` para videoaulas publicadas
- rota restrita `/admin` para cadastro inicial de modulos, aulas por YouTube, publicacoes do jornal e gestao de contas
- a galeria lista documentos anexados ao mapa, permite baixar `.md`/`.json` e exportar PDF localmente com imagem + interpretacao

Decisao:
- a Galeria de Mapas passa a ser tratada como modulo dentro do Escritorio de Planejamento Ciclico
- a Biblioteca fica reservada como area oficial de videoaulas, trilhas e materiais
- a Biblioteca pode armazenar aulas do YouTube usando `video_url` e `video_embed_url`; o frontend deve renderizar por embed autenticado dentro da area privada
- o admin fica escondido e protegido por `admin_roles` no backend; se a usuaria nao tiver role admin, as functions retornam 403
- o admin deve evoluir como painel operacional da equipe: criacao de contas, edicao de email/username/nome/status, reset de senha, visualizacao de usuarios, mapas, imagens, cotas e progresso de aulas
- o admin agora controla `app_permissions` por usuaria; por padrao, contas comuns acessam apenas login, conta e Galeria de Mapas
- os modulos extras `app`, `ciclo`, `planejar` e `biblioteca` ficam bloqueados ate liberacao manual no admin
- o GPT deve salvar interpretacoes relevantes com `saveChartInterpretationSession`; a usuaria acessa os arquivos pela galeria autenticada, sem URL tecnica de storage

Validacao tecnica:
- `npm run build` passou em 06/04/2026 apos execucao fora do sandbox local

## 14. Regra operacional para futuras sessoes

Ao retomar este projeto:
- assumir `planejamento_ciclico_repo` como frontend oficial
- assumir `gpt` como backend operacional local
- preservar integralmente a landing
- testar localmente antes de qualquer push
- nao expor links tecnicos de storage para a usuaria final
