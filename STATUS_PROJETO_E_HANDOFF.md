# Status Do Projeto E Handoff

Atualizado em: 2026-04-08

Este arquivo foi mantido como ponto de entrada curto para retomada.

A documentacao geral e canônica do estado atual do projeto agora esta em:
- [DOCUMENTACAO_GERAL_PROJETO.md](./DOCUMENTACAO_GERAL_PROJETO.md)

## Resumo rapido

- Frontend oficial: `planejamento_ciclico_repo`
- GitHub/Netlify: `mtv-astro/planejamento_ciclico`
- Backend/Supabase local: `gpt`
- Produto autenticado: `Escritorio de Planejamento Ciclico`
- Modulo astral: `Galeria de Mapas`
- Modulo de aulas: `Biblioteca`
- Admin: `/admin`, protegido por `admin_roles`
- `Planejar`: agora em refatoracao baseada no planner fisico, ainda local e sem push

## Estado atual curto

- PDF do planner fisico analisado: `prints/Ebook Iniciação Planejamento.pdf`
- Estrutura metodologica assumida: `Ano -> Estacao -> Lunacao -> Semana -> Dia`
- Decisao atual: desenvolver a logica do frontend do `Planejar` antes de modelar o backend no Supabase
- `/planejar` saiu do placeholder e virou uma experiencia em folhas de trabalho, mas essa etapa ainda nao foi commitada/pushada

## Regras de retomada

- Nao mexer na landing publica sem pedido explicito.
- Testar localmente antes de push.
- Commits web devem acontecer no `planejamento_ciclico_repo`.
- Ajustes de Supabase/Edge Functions devem acontecer no `gpt`.
- Nao commitar CSV de senhas.
- Nao expor URLs tecnicas de bucket ou `signed_url`.
- Usar [DOCUMENTACAO_GERAL_PROJETO.md](./DOCUMENTACAO_GERAL_PROJETO.md) como fonte de verdade antes de iniciar nova etapa.

