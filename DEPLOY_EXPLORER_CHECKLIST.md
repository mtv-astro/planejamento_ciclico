# Deploy Explorer Checklist

Este checklist cobre a publicacao do app `planejamento_ciclico_repo` mantendo a landing publica exatamente como esta hoje.

## Regra principal

- Nao alterar a landing publica existente.
- Nao alterar conteudo, layout, estilos ou assets da landing.
- Tratar este repo como base oficial do deploy web.

## O que este app publica

- landing publica
- `/login`
- `/explorer`
- `/my-maps`
- `/mapas/:chartId`

## Variaveis de ambiente obrigatorias no deploy

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Valores esperados hoje:

- `VITE_SUPABASE_URL=https://rwrukwznfpgreqiogcju.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<publishable_key_do_projeto>`

## Netlify

Este repo ja contem `netlify.toml` com:

- build command: `npm run build`
- publish dir: `dist`
- proxy `/api/*` para `https://rwrukwznfpgreqiogcju.supabase.co/functions/v1/:splat`
- fallback `/* -> /index.html`

## Backend que precisa existir no remoto

Para a area privada funcionar, o backend do repo `gpt` precisa ter publicado:

- `get-current-user`
- `list-user-charts`
- `list-chart-images`
- `set-current-user-map`
- `set-chart-title-current-user`

## Fluxo de validacao antes de apontar dominio

1. Abrir `/login`
2. Fazer login com usuaria real do Supabase Auth
3. Confirmar redirect para `/explorer`
4. Confirmar listagem de mapas
5. Confirmar abertura de imagens salvas
6. Confirmar renomeacao do mapa
7. Confirmar definir mapa principal
8. Confirmar que a landing continua identica

## Observacoes importantes

- O login web atual usa `email + senha` no frontend.
- Se o produto exigir login web por `username + senha`, isso precisa de implementacao adicional.
- O fluxo do GPT e diferente do fluxo web: no GPT existe `authLoginSession` e `session_id` interno; no site ha sessao normal do Supabase Auth no navegador.
- O dominio atual em producao ainda nao reflete este repo se continuar apontando para o projeto antigo.
