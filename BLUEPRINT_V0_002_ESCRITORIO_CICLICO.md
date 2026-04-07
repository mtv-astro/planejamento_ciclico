# Blueprint V0.002 Escritorio Ciclico

## Objetivo

Definir a proxima etapa do produto em cima da base oficial atual:
- [planejamento_ciclico_repo](/C:/Users/carlo/projects/planejamento_ciclico_repo)

Sem perder:
- a landing atual
- o login atual
- a galeria atual
- a conta atual
- a integracao atual com Supabase

## 1. Visao do produto

O produto deixa de ser apenas uma galeria privada e passa a ser um ambiente autenticado com modulos.

Direcao conceitual adicional:
- o app deve funcionar como um ambiente circular e continuo
- a navegacao principal deve priorizar scroll horizontal
- a experiencia deve formar um circuito ciclico, sem comeco e fim rigidos
- ao seguir horizontalmente, a usuaria deve eventualmente retornar ao ponto inicial
- o proprio espaco digital deve traduzir ciclo, continuidade, recorrencia e recomeço

Estrutura recomendada:
- `Escritorio de Planejamento Ciclico` como home principal do produto
- `Galeria de Mapas` como modulo astral
- `Planejar` como modulo operacional
- `Ciclo` como modulo de contexto e metodo
- `Biblioteca` como modulo de videoaulas e materiais
- `Conta` como modulo de configuracoes da usuaria

## 2. Arquitetura de navegacao

Rotas sugeridas para a proxima fase:
- `/app`
- `/ciclo`
- `/planejar`
- `/galeria`
- `/mapas/:chartId`
- `/biblioteca`
- `/conta`

Compatibilidade:
- `/explorer` pode continuar existindo temporariamente e redirecionar para `/galeria`
- `/my-maps` pode continuar existindo temporariamente e redirecionar para `/galeria`

### Circuito principal de navegacao

A organizacao principal do ambiente deve seguir este circuito:

1. `Praca central`
2. `Area pessoal`
3. `Gavetas de ferramentas`
4. `Mural publico`
5. retorno para `Praca central`

Esse circuito representa:
- praca = coletivo institucional
- area pessoal = vida interna e planejamento individual
- gavetas = recursos praticos
- mural publico = convivio e expressao coletiva

Na primeira fase, isso pode ser implementado como:
- paines horizontais
- scroll horizontal guiado
- botoes de navegacao lateral
- transicoes que reforcem a ideia de continuidade

Sem exigir um carrossel infinito complexo logo de inicio.

## 3. Papel de cada modulo

### `/app`

Home do Escritorio de Planejamento Ciclico.

Deve responder imediatamente:
- onde estou
- o que esta em foco
- qual o proximo passo

Blocos sugeridos:
- contexto do ciclo
- intencao e prioridades
- foco da semana
- habitos e check-in
- reflexao
- atalhos para galeria, biblioteca e conta

Na nova fase, `/app` deve ser composto por quatro zonas principais.

### Praca central

Papel:
- ponto de entrada principal depois do login
- hub inicial de orientacao
- camada coletiva e institucional do ambiente

Elementos sugeridos:
- mural ou jornal da equipe
- avisos importantes
- atualizacoes da comunidade
- comunicados
- destaques
- recados relevantes
- calendario da comunidade
- eventos e encontros

### Area pessoal

Papel:
- planner ciclico aberto da usuaria
- centro individual de organizacao e acompanhamento

Elementos sugeridos:
- mandala pessoal baseada nas 12 casas
- mural pessoal
- calendario pessoal
- notas por casa
- clique em cada casa abrindo modal ou painel lateral

### Gavetas de ferramentas

Papel:
- concentrar os recursos praticos do sistema

Elementos sugeridos:
- ferramentas de planejamento
- recursos de acompanhamento ciclico
- materiais de apoio
- utilidades complementares
- acessos rapidos para galeria, biblioteca e funcoes especiais

### Mural publico

Papel:
- rede social interna da comunidade
- camada de expressao e trocas coletivas

Elementos sugeridos:
- publicacoes visiveis para a comunidade
- compartilhamentos
- trocas coletivas
- senso de presenca e convivio

Observacao:
- essa area pode entrar de forma mais simples no inicio
- mas a arquitetura ja deve reservar o espaco dela no circuito

### `/ciclo`

Camada macro do metodo.

Conteudo sugerido:
- estacao atual
- lunacao atual
- casa ativada
- mandala
- 12 casas
- historico de ativacoes

### `/planejar`

Camada tatica.

Conteudo sugerido:
- semana atual
- prioridades
- revisao curta
- habitos
- check-in diario

### `/galeria`

Modulo astral ja existente.

Mantem:
- mapas
- imagens
- download
- definicao de principal
- exclusao
- renomeacao

### `/biblioteca`

Modulo de videoaulas e conteudo guiado.

Papel:
- hospedar aulas, trilhas e materiais de apoio
- ensinar o metodo dentro do produto
- centralizar progresso de consumo

### `/conta`

Mantem:
- nome
- username
- senha
- configuracoes basicas

Depois pode crescer para:
- dados de nascimento
- preferencias
- privacidade

## 4. Nome da area de videoaulas

Opcoes fortes:

- `Biblioteca`
  - mais neutro e elegante
  - comporta videoaulas, guias e materiais

- `Sala de Estudos`
  - mais acolhedor e intimista
  - funciona bem para videoaulas e trilhas

- `Portal de Estudos`
  - mais institucional
  - menos sofisticado, mas muito claro

- `Acervo`
  - forte como branding
  - menos obvio para usuarias novas

- `Trilhas`
  - bom se o foco for jornada guiada
  - mais limitado se houver varios formatos de conteudo

Recomendacao principal:
- usar `Biblioteca`

Motivo:
- encaixa com o ecossistema do produto
- nao limita a videos
- combina com metodo, guias, aulas e materiais extras

Se quiser um nome mais autoral:
- `Biblioteca Ciclica`

## 5. Aproveitamento do layout e design atuais

Regra:
- nao descartar a linguagem visual ja criada na galeria

O que reaproveitar:
- topbar autenticada
- avatar e menu de conta
- modo noturno
- base de componentes
- spacing
- responsividade
- estilo das paginas privadas

O que importar do beta `escritorio-ciclico-app`:
- conceito da home
- hierarquia dos blocos
- nomes das secoes
- ideia de `mural`, `mesa`, `escrivaninha`, `janela`, `gavetas`

Como adaptar:
- usar a estrutura funcional do beta
- reestilizar dentro da linguagem do app oficial
- evitar copiar a cenografia literalmente na primeira fase

Regra nova de experiencia:
- o ambiente precisa transmitir circularidade e continuidade
- isso deve aparecer na organizacao espacial e no fluxo, nao apenas em decoracao

Evitar:
- dashboard generico
- cenografia excessiva
- navegacao escondida

## 6. Modelagem inicial no Supabase

O backend atual ja cobre identidade e dominio astral.

O novo dominio do metodo pode crescer com estas tabelas:

### `user_cycles`

Campos sugeridos:
- `id`
- `owner_user_id`
- `season_key`
- `season_label`
- `focus_summary`
- `intention`
- `created_at`
- `updated_at`

### `user_lunations`

Campos sugeridos:
- `id`
- `owner_user_id`
- `new_moon_date`
- `sign`
- `activated_house`
- `phase`
- `week_of_cycle`
- `intention`
- `priorities_json`
- `atmosphere`
- `created_at`
- `updated_at`

### `user_week_plans`

Campos sugeridos:
- `id`
- `owner_user_id`
- `label`
- `focus`
- `summary`
- `agenda_groups_json`
- `day_energies_json`
- `review_questions_json`
- `is_current`
- `created_at`
- `updated_at`

### `user_habits`

Campos sugeridos:
- `id`
- `owner_user_id`
- `label`
- `target_days`
- `completed_days`
- `note`
- `week_plan_id`
- `created_at`
- `updated_at`

### `user_daily_checkins`

Campos sugeridos:
- `id`
- `owner_user_id`
- `date`
- `energy_level`
- `emotional_state`
- `body_state`
- `essential_task`
- `reflection`
- `created_at`
- `updated_at`

### `library_modules`

Campos sugeridos:
- `id`
- `slug`
- `title`
- `description`
- `cover_image_url`
- `order_index`
- `is_published`
- `created_at`
- `updated_at`

### `library_lessons`

Campos sugeridos:
- `id`
- `module_id`
- `slug`
- `title`
- `description`
- `video_url`
- `video_provider`
- `video_embed_url`
- `duration_seconds`
- `order_index`
- `is_published`
- `created_at`
- `updated_at`

Observacao:
- para aulas do YouTube, salvar a URL original em `video_url` e a URL propria de iframe em `video_embed_url`
- isso permite anexar aulas por link do YouTube sem hospedar o arquivo de video no Supabase
- o acesso ao player deve acontecer dentro da area autenticada da Biblioteca

### `user_lesson_progress`

Campos sugeridos:
- `id`
- `owner_user_id`
- `lesson_id`
- `is_completed`
- `last_position_seconds`
- `completed_at`
- `updated_at`

## 7. Edge Functions sugeridas

### Home e metodo

- `get-current-home-experience`
- `save-current-lunation`
- `save-current-week-plan`
- `save-current-habits`
- `save-current-daily-checkin`

### Biblioteca

- `list-library-modules`
- `get-library-module`
- `set-lesson-progress`
- `admin-list-library`
- `admin-save-library-module`
- `admin-save-library-lesson`

### Admin de contas

- `admin-list-users`
- `admin-create-user`
- `admin-update-user`
- `admin-reset-user-password`

Dados importantes no admin:
- identidade da conta: email, username, nome exibido e status
- permissoes por modulo em `app_permissions`
- estatisticas de mapas e imagens
- cota da Astrology API
- aulas visualizadas e aulas concluidas
- ultimos registros de progresso por aula

Permissao padrao de contas comuns:
- login liberado
- conta liberada
- Galeria de Mapas liberada
- `app`, `ciclo`, `planejar` e `biblioteca` bloqueados ate liberacao manual no admin

### Jornal da Praca central

- `list-community-posts`
- `admin-save-community-post`

### Mandala pessoal

- `get-current-user-mandala`
- `save-current-user-mandala`

### Dominio astral existente

Manter e reaproveitar:
- `list-user-charts`
- `list-chart-images`
- `get-current-user-chart-image-file`
- `set-current-user-map`
- `save-chart-interpretation-session`
- `list-chart-documents`
- `get-current-user-chart-document-file`

Documentos do mapa:
- interpretacoes geradas no GPT devem ser salvas como `.md` e `.json`
- esses documentos ficam anexados ao `chart_id`
- a galeria deve permitir download autenticado dos arquivos
- a galeria deve permitir exportacao em PDF combinando imagem do mapa e texto da interpretacao
- nao expor URL tecnica de bucket ou signed URL para a usuaria
- `set-chart-title-current-user`
- `delete-current-user-chart`
- `update-current-user-profile`

## 8. Ordem recomendada de implementacao

### Fase 1

Criar a nova home autenticada.

Entregas:
- rota `/app`
- navegacao principal nova
- circuito horizontal inicial
- cards/blocos inspirados no Escritorio de Planejamento Ciclico
- dados inicialmente mockados ou semimockados

Recorte recomendado:
- Praca central
- Area pessoal
- Gavetas de ferramentas

O `Mural publico` pode entrar primeiro como placeholder curado ou versao resumida.

Referencia tecnica:
- o repo `mtv-astro/ciclo-mandalas-vibe` foi avaliado como relevante para esta fase
- a solucao de carrossel circular em 3 copias foi adotada como referencia para o `/app`
- o porting deve continuar seletivo, nao como migracao integral daquele repo

### Fase 2

Conectar a home ao backend.

Entregas:
- tabelas do metodo
- functions da home
- persistencia de lunacao, semana, habitos e check-in

### Fase 3

Criar a `Biblioteca`.

Entregas:
- rota `/biblioteca`
- listagem de modulos
- tela de modulo
- tela de aula
- progresso por usuaria

### Fase 4

Aprofundar a identidade visual.

Entregas:
- atmosfera do escritorio
- transicoes suaves
- adaptacao melhor para mobile
- refinamento de dark mode
- amadurecimento do circuito horizontal completo

## 9. Riscos a evitar

- tentar migrar tudo do beta antigo de uma vez
- quebrar a galeria atual
- misturar dados mockados e reais sem fronteira clara
- transformar a home em cenografia bonita mas pouco funcional
- colocar a Biblioteca sem uma estrutura de progresso minima

## 10. Proposta de decisao imediata

Decisao recomendada para iniciar a nova etapa:

1. nome oficial do centro do produto:
   - `Escritorio de Planejamento Ciclico`

2. nome oficial da area de aulas:
   - `Biblioteca`

3. prioridade de implementacao:
   - nova home `/app`
   - navegacao nova
   - galeria como modulo
   - biblioteca logo em seguida
