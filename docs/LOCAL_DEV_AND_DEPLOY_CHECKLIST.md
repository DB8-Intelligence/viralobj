# ViralObj — Local development & deploy checklist

Sprint 25 estabeleceu o regime de **dev local primeiro, deploy ao final**.
Sprint 25.1 adicionou **modo ZERO-CLOUD com mocks**: bridge roda offline,
sem gcloud, sem API keys, sem custo.

Produção (Cloud Run) fica congelada com Veo OFF e custo variável zero;
deploy só quando feature estiver pronta, validada localmente e aprovada.

---

## 1. Regra de ouro

- Desenvolver localmente em **ZERO-CLOUD MODE** (mocks).
- Quando precisar testar contra serviços reais (raro), apontar para staging
  manualmente — nunca alterar produção.
- **Não fazer deploy a cada mudança.**

## 1.1. Regra atual de execução (Sprint 38, atualiza Sprint 26)

O operador/agente tem **autonomia para deploys técnicos de baixo risco** quando:

- não ativam Veo (`ENABLE_VEO_GENERATION=true`)
- não geram custo variável (`DAILY_VEO_BUDGET_USD > 0`)
- não alteram billing (Stripe / cobrança real)
- não mexem em banco (criar/deletar)
- não expõem secrets
- apenas corrigem bugs, DNS, middleware, dashboard, rotas ou documentação

Ainda exige **aprovação explícita** (operador digita "aprovo deploy" ou
similar no canal) quando:

- `ENABLE_VEO_GENERATION=true`
- `DAILY_VEO_BUDGET_USD > 0`
- billing/Stripe real for alterado
- banco for criado/deletado
- operação destrutiva irreversível for feita
- render pago for disparado

Em caso de dúvida → **não deploya.** Pergunta primeiro. Para mudanças
arquiteturais grandes (não cobertas pela lista acima), use o gate Sprint 26
abaixo como referência.

### 1.1a. Gate de release Sprint 26 (referência para mudanças críticas)

Fluxo formalizado para deploys que tocam Veo, billing, banco ou cost guards:

```text
1. branch:   git checkout -b dev/<feature>      ← parte do main
2. dev:      MOCK_*=true em .env.local          ← zero cloud
3. testa:    bash scripts/smoke-local.sh        ← 6/6 verde
4. valida:   npm run build (webapp) sem erros   ← TypeScript clean
5. PR:       commit + push + abrir PR para main
6. release:  flippar MOCK_*=false em .env.local localmente,
             rodar smoke contra staging (api.viralobj.app continua frozen).
             dry_run real precisa retornar 200, full retornar 403 VEO_DISABLED.
7. APROVA:   operador digita literalmente "aprovo deploy" no canal.
8. deploy:   só agora gcloud run deploy é executado.
```

---

## ZERO-CLOUD MODE (Sprint 25.1)

Em `.env.local` na raiz, todas as flags MOCK_* devem estar `true`:

```env
LOCAL_DEV_MODE=true
MOCK_VERTEX=true     # /api/generate-reel + /api/reel/*/status retornam fixtures
MOCK_FIRESTORE=true  # /api/niches retorna 3 fixture niches
MOCK_STORAGE=true    # uploadMedia/uploadFromUrl retornam mock://
MOCK_BILLING=true    # /api/billing/credits retorna 999 créditos
MOCK_AUTH=true       # dualAuth → req.user = local-dev-user
```

Hard guard: `server.js` se recusa a iniciar com qualquer MOCK_* em
`NODE_ENV=production`. Cloud Run sempre define `NODE_ENV=production`.

---

## 2. Setup inicial (uma vez)

```bash
# Google Cloud Application Default Credentials — necessário para Firestore Admin SDK
gcloud auth application-default login
gcloud config set project viralreel-ai-493701

# Confirmar
gcloud auth application-default print-access-token
```

```bash
# Preencher placeholders em .env.local (raiz e webapp/)
# Pegar tokens da produção:
gcloud secrets versions access latest --secret=GEMINI_AGENT_TOKEN \
  --project=viralreel-ai-493701
gcloud secrets versions access latest --secret=GOOGLE_API_KEY \
  --project=viralreel-ai-493701
```

```bash
# Instalar dependências (uma vez ou após bump de package.json)
npm install
cd webapp && npm install && cd ..
```

---

## 3. Iniciar dev local

```bash
bash scripts/dev-local.sh   # checa pré-requisitos + imprime instruções
```

Em **2 terminais separados**:

```bash
# Terminal 1 — bridge na porta 3001
PORT=3001 node server.js

# Terminal 2 — webapp Next.js na porta 3000
cd webapp && npm run dev
```

URLs:
- Bridge: `http://localhost:3001`
- Webapp: `http://localhost:3000`

---

## 4. Smoke test local

```bash
# Health
curl http://localhost:3001/health
curl http://localhost:3001/readyz

# dry_run via Google AI Studio (custo $0)
TOKEN="<o que está em .env.local GEMINI_AGENT_TOKEN>"
curl -X POST "http://localhost:3001/api/generate-reel?dry_run=true" \
  -H "Content-Type: application/json" \
  -H "X-Gemini-Key: $TOKEN" \
  -d '{"niche":"casa","objects":["esponja"],"topic":"vinagre","tone":"dramatic","duration":15}'
```

Esperado:
- HTTP 200
- `mode: "dry_run"`
- `provider_used: "google-ai-studio/gemini-2.5-flash"`
- `cost_guard.veo_called: false`

```bash
# Full mode — deve bloquear (defense in depth)
curl -X POST "http://localhost:3001/api/generate-reel" \
  -H "Content-Type: application/json" \
  -H "X-Gemini-Key: $TOKEN" \
  -d '{"niche":"casa","objects":["esponja"],"topic":"x","tone":"dramatic","duration":15}'
# → HTTP 403  error: "VEO_DISABLED"
```

Webapp end-to-end: abrir `http://localhost:3000`, login Supabase, `/app/generate`,
tema livre, enviar. Confirmar que a chamada vai para `localhost:3001` (DevTools
Network tab) e nenhuma chamada externa Anthropic / FAL / ElevenLabs.

---

## 5. Antes de qualquer deploy

```bash
# Build local
npm run build || true            # bridge não tem build, ok
cd webapp && npm run build       # tem que passar
cd ..

# Smoke local completo (passos 4 acima)

# Confirmar variáveis de ambiente que vão para Cloud Run estão OK:
gcloud run services describe viralobj-bridge --project=viralreel-ai-493701 \
  --region=us-central1 --format='value(spec.template.spec.containers[0].env)' \
  | tr ';' '\n' | grep -iE "VEO|MAX_SCENES|DAILY|USER_DAILY"
```

Checklist obrigatório antes de `gcloud run deploy`:
- [ ] `npm run build` no webapp passou (zero erros TypeScript)
- [ ] Bridge sobe local sem crash
- [ ] dry_run local retorna 200
- [ ] Full mode retorna 403 VEO_DISABLED
- [ ] Webapp local renderiza `/`, `/login`, `/app/generate`
- [ ] Network tab mostra chamadas só para `localhost:3001` e Supabase
- [ ] Nenhuma referência a `@anthropic-ai/sdk`, `@fal-ai/client`, `elevenlabs` em código novo
- [ ] Usuário aprovou explicitamente o deploy
- [ ] Custo esperado da feature é zero (ou autorizado e dentro do budget)

---

## 6. Comandos de deploy (executar SOMENTE quando aprovado)

### Bridge (Cloud Run, project `viralreel-ai-493701`)

```bash
gcloud run deploy viralobj-bridge \
  --project=viralreel-ai-493701 \
  --source=. \
  --region=us-central1 \
  --allow-unauthenticated
```

Buildpacks pega o `package.json` e gera a imagem. A revisão herda env vars +
secrets da revisão anterior.

### Dashboard (Cloud Run, mesmo projeto)

```bash
gcloud run deploy viralobj-dashboard \
  --project=viralreel-ai-493701 \
  --source=./webapp \
  --region=us-central1 \
  --allow-unauthenticated
```

### Após deploy — sanity check

```bash
curl https://api.viralobj.app/health
curl -sI https://www.viralobj.app/login   # 200
curl -sI https://www.viralobj.app/app     # 307 → /login

# Full mode prod ainda deve bloquear:
TOKEN=$(gcloud secrets versions access latest --secret=GEMINI_AGENT_TOKEN \
  --project=viralreel-ai-493701)
curl -X POST "https://api.viralobj.app/api/generate-reel" \
  -H "X-Gemini-Key: $TOKEN" -H "Content-Type: application/json" \
  -d '{"niche":"casa","objects":["esponja"],"topic":"x","tone":"dramatic","duration":15}'
# → HTTP 403 VEO_DISABLED
```

---

## 7. Reativar Veo (apenas quando autorizado a gerar vídeo real)

```bash
gcloud run services update viralobj-bridge \
  --project=viralreel-ai-493701 \
  --region=us-central1 \
  --update-env-vars="ENABLE_VEO_GENERATION=true,DAILY_VEO_BUDGET_USD=20"
```

Para voltar ao modo congelado:

```bash
gcloud run services update viralobj-bridge \
  --project=viralreel-ai-493701 \
  --region=us-central1 \
  --update-env-vars="ENABLE_VEO_GENERATION=false,DAILY_VEO_BUDGET_USD=0"
```

---

## 8. Estado de produção esperado (frozen baseline)

Quando ninguém está deployando, a produção deve estar assim:

```
Cloud Run viralobj-bridge:
  ENABLE_VEO_GENERATION=false   ← bloqueia chamadas pagas
  DAILY_VEO_BUDGET_USD=0        ← reforço (defense in depth)
  MAX_SCENES_PER_REEL=1         ← cap por chamada
  USER_DAILY_SCENE_LIMIT=3      ← cap por usuário/dia
  GOOGLE_API_KEY                ← Secret Manager (AI Studio)
  GEMINI_AGENT_TOKEN            ← Secret Manager (HMAC caller auth)
  max-instances=2, min-instances=0

Cloud Run viralobj-dashboard:
  max-instances=2, min-instances=0
  SUPABASE_SERVICE_ROLE_KEY     ← Secret Manager
  GEMINI_AGENT_TOKEN            ← Secret Manager
  NEXT_PUBLIC_BRIDGE_API_URL=https://api.viralobj.app

Cloud Billing budget:
  viralobj-veo-safety-budget    ← R$ alerts em 50/80/100%
```

Custo variável: $0 absoluto.
Custo idle: ~$1.50-2/mês (Cloud Run idle + DNS + Storage + Secrets).
