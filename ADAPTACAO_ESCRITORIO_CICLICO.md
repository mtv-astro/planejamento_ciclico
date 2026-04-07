# Adaptacao Do Conceito Escritorio Ciclico

## Objetivo

Este documento traduz a documentacao em:
- [app-planejamento-ciclico](/C:/Users/carlo/projects/planejamento%20ciclico/interno/produto/app-planejamento-ciclico)

para a base real ja existente em:
- [planejamento_ciclico_repo](/C:/Users/carlo/projects/planejamento_ciclico_repo)

O foco aqui nao e copiar uma estrutura antiga, e sim adaptar a ideia de produto e a logica de telas para o app atual, sem quebrar a landing nem descartar o trabalho ja feito na galeria autenticada.

## Leitura consolidada do diretorio de referencia

O diretorio `app-planejamento-ciclico` nao contem codigo de app. Ele contem:
- metodo
- traducao do metodo para produto
- mapa de telas e fluxos
- conceito visual de `Escritorio Ciclico`
- blueprint funcional da home

Entao ele deve ser tratado como:
- referencia de produto
- referencia de UX
- referencia de IA de navegacao

Nao como base tecnica para copiar arquivos.

## Tese principal

A ideia mais forte daquele material e correta:
- a area autenticada nao deve ser apenas uma galeria de mapas
- ela deve evoluir para um ambiente de trabalho do metodo
- a galeria deve continuar existindo, mas como um modulo dentro de algo maior

Em outras palavras:
- hoje temos uma `Galeria de Planejamento Ciclico`
- o passo seguinte e transformar a area privada em um `Escritorio Ciclico`
- a galeria vira uma das ferramentas desse escritorio

## O que aproveitar da estrutura atual

A base que ja existe no frontend oficial e util e nao deve ser descartada:

- autenticacao
- rotas privadas
- topbar autenticada
- pagina de conta
- integracao com Supabase
- integracao com mapas e imagens
- visualizacao de mapa por `chartId`

Esses elementos resolvem a infraestrutura de acesso.

O que falta e a camada de produto:
- home real do metodo
- organizacao por modulos
- CTA principal do momento atual
- contexto do ciclo
- planejar semana
- lunacao
- habitos
- biblioteca

## Adaptacao recomendada

### 1. Nao substituir a galeria. Rebaixar a galeria para modulo.

Hoje a area privada gira em torno da galeria.

O recomendado e:
- criar uma nova home autenticada como centro do produto
- manter a galeria como modulo secundario, nao como tela principal do produto

Traducao pratica:
- `/explorer` deixa de ser a home conceitual
- `/explorer` pode continuar existindo por compatibilidade temporaria
- criar uma nova rota principal privada, por exemplo `/app` ou `/inicio`
- essa nova rota vira o `Escritorio Ciclico`

### 2. Mapear os modulos conceituais para rotas reais

Do material de referencia, a estrutura mais reaproveitavel e esta:

- Inicio
- Ciclo
- Planejar
- Biblioteca
- Perfil

Comunidade deve ficar fora do MVP inicial, a menos que exista uma decisao de produto clara para prioriza-la.

Traducao sugerida para o app atual:

- `/app`
  - home do escritorio ciclico
- `/ciclo`
  - contexto macro do ciclo, mandala, casas, estacao, lunacao
- `/planejar`
  - semana, prioridades, revisoes, habitos
- `/galeria`
  - atual explorer/my maps
- `/biblioteca`
  - materiais guiados do metodo
- `/conta`
  - dados pessoais, login, senha, mapa base

### 3. Reaproveitar a topbar e trocar a navegacao lateral

Hoje ja existe uma topbar autenticada util.

Ela pode continuar como base.

O que deve mudar na proxima etapa:
- menu principal mais orientado a produto
- menos cara de banco de arquivos
- mais cara de ambiente de metodo

Navegacao sugerida:
- Inicio
- Ciclo
- Planejar
- Galeria
- Biblioteca

E no menu de perfil:
- Conta
- Tema
- Sair

### 4. Fazer a home como bloco funcional, nao como cenografia pesada

O conceito de `Escritorio Ciclico` e bom, mas deve entrar de forma pragmatica.

Recomendacao:
- nao comecar com uma ilustracao complexa de escritorio
- nao comecar com hotspots escondidos
- nao comecar com animacao cenografica demais

Primeira versao correta:
- uma home em blocos
- com atmosfera visual propria
- com nomes e hierarquia coerentes com o metodo
- com CTA principal clara

Blocos da primeira versao:
- contexto do ciclo
- intencao e prioridades
- foco da semana
- habitos/check-in
- escrita/reflexao
- atalhos para galeria e biblioteca

Essa abordagem preserva:
- usabilidade
- mobile
- velocidade de implementacao

E deixa a cenografia mais imersiva para uma fase seguinte.

## Proposta de evolucao em etapas

### Etapa 1: consolidar a base atual

Objetivo:
- manter landing intacta
- manter login e galeria funcionando
- usar a galeria como infraestrutura ja pronta

Estado:
- praticamente pronto

### Etapa 2: criar a home do Escritorio Ciclico

Objetivo:
- sair da logica de `galeria como tela principal`
- criar um centro de orientacao do metodo

Entregas:
- nova rota `/app`
- cards/blocos com:
  - ciclo atual
  - foco da semana
  - prioridades
  - proxima acao recomendada
  - atalhos

### Etapa 3: estruturar modulos do metodo

Objetivo:
- separar o produto em modulos funcionais

Entregas:
- `/ciclo`
- `/planejar`
- `/biblioteca`
- `/galeria`

### Etapa 4: aprofundar a identidade do escritorio

Objetivo:
- aproximar mais o visual da ideia de escritorio ciclico

Entregas:
- atmosfera visual sazonal
- componentes simbolicos
- transicoes leves
- reforco de identidade

## O que eu recomendo como arquitetura de informacao

### Home autenticada

Nome:
- `Escritorio Ciclico`

Papel:
- responder imediatamente:
  - onde estou
  - o que esta em foco
  - qual o proximo passo

### Galeria

Nome:
- `Galeria de Mapas`

Papel:
- armazenar e visualizar mapas e imagens
- deixar de ser o centro conceitual do app

### Conta

Papel:
- dados de acesso
- username
- senha
- dados pessoais

## O que nao fazer

- nao tentar copiar literalmente o conteudo do diretorio de referencia para a interface
- nao trocar tudo de uma vez
- nao transformar a home inicial em um cenario ilustrado pouco usavel
- nao apagar a galeria atual
- nao misturar conceitos demais antes de existir uma home clara

## Conclusao pratica

A melhor adaptacao nao e migrar o app atual para aquela estrutura antiga.

A melhor adaptacao e esta:
- manter a base atual do frontend oficial
- preservar a galeria como modulo funcional
- criar uma nova home autenticada inspirada no `Escritorio Ciclico`
- depois abrir os demais modulos do metodo ao redor dela

## Proximo passo recomendado

Se seguirmos essa direcao, a proxima etapa de desenvolvimento deve ser:

1. criar a nova rota privada principal do produto
2. desenhar a primeira home funcional do `Escritorio Ciclico`
3. mover a galeria para um papel de modulo
4. so depois expandir `Ciclo`, `Planejar` e `Biblioteca`
