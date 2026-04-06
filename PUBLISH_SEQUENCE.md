# Publish Sequence

Sequencia pratica para colocar o `planejamento_ciclico_repo` em producao mantendo a landing publica como esta.

## 1. Publicar o backend necessario no repo `gpt`

No projeto `gpt`, garantir deploy destas Edge Functions no Supabase remoto:

- `get-current-user`
- `list-user-charts`
- `list-chart-images`
- `set-current-user-map`
- `set-chart-title-current-user`

Se o fluxo do GPT tambem for atualizado junto, garantir tambem:

- `auth-login-session`
- `birth-chart`
- `get-user-map`
- `set-user-map`
- `set-chart-title`
- `list-user-charts-session`
- `list-chart-images-session`
- `generate-chart-images`

## 2. Verificar secrets e envs no backend

Confirmar no projeto Supabase remoto:

- `PROJECT_URL`
- `SB_SERVICE_ROLE_KEY`
- `SB_PUBLISHABLE_KEY` ou equivalente para `auth-login-session`
- `ASTROLOGY_API_KEY`
- `ASTROLOGY_BASE_URL`
- `ASTROLOGY_ENDPOINT_PATH`
- `CHART_IMAGES_BUCKET`

## 3. Criar ou conectar o deploy do frontend

Usar o repo `planejamento_ciclico_repo` como fonte oficial do site.

Configuracao esperada no Netlify:

- Base directory: vazio
- Build command: `npm run build`
- Publish directory: `dist`

## 4. Configurar env vars do frontend no Netlify

Adicionar:

- `VITE_SUPABASE_URL=https://rwrukwznfpgreqiogcju.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<publishable_key>`

## 5. Validar redirects do Netlify

Este repo ja possui `netlify.toml` correto.

Confirmar que o deploy final respeitou:

- `/api/*` -> Supabase Functions
- `/*` -> `/index.html`

## 6. Fazer smoke test no deploy preview

Validar:

1. `/` abre a landing igual ao estado atual do repo
2. `/login` abre a tela de login
3. login com email e senha funciona
4. `/explorer` abre apos login
5. mapas aparecem
6. imagens aparecem
7. renomear mapa funciona
8. definir mapa principal funciona
9. refresh da pagina em `/explorer` nao gera 404
10. refresh da pagina em `/mapas/<chartId>` nao gera 404

## 7. Apontar dominio

Depois do smoke test, apontar o dominio atual para este deploy novo.

Antes de trocar:

- confirmar que a landing esta visualmente identica ao repo
- confirmar que o Explorer funciona
- confirmar que o proxy `/api/*` responde

## 8. Pos-publicacao

Validar em producao:

- `https://planejamentociclico.netlify.app/`
- `https://planejamentociclico.netlify.app/login`
- `https://planejamentociclico.netlify.app/explorer`

## Observacao importante

Hoje o login web do Explorer usa `email + senha`.
Se for obrigatorio aceitar `username + senha` tambem no site, isso precisa ser implementado depois da publicacao inicial ou antes dela, conforme prioridade do produto.
