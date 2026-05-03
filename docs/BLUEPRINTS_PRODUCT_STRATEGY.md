# Blueprints Product Strategy

**Versão:** Sprint 40 (2026-05-03)
**Status:** Galeria estática live em `/app/blueprints`. Loop "user-generated" ainda não implementado.

---

## Visão do produto

Blueprints são **modelos prontos de Talking Object reels** que o usuário remixa
em segundos. Inspiração direta na galeria de templates do Leonardo AI / RunwayML
/ Canva, mas o atalho aqui é o pacote completo (niche + objects + topic + tone +
duration), não só a "thumbnail estética".

O loop de produto é:

```
Usuário entra no dashboard
  ↓
Vê galeria de blueprints
  ↓
Clica "Remixar" num que ressoa
  ↓
/app/generate?blueprint=<id> abre com tudo preenchido
  ↓
Usuário ajusta o que quiser (1-3 cliques)
  ↓
Gera pacote → render → posta
```

Esse atalho é o que separa um SaaS de IA "passa pano genérico" de uma fábrica
de viral. Sem Blueprints, o usuário olha a tela vazia, não sabe o que pedir, e
abandona. Com Blueprints, ele tem prova social ("isso bombou") + ponto de partida.

---

## Arquitetura atual (Sprint 40)

- `webapp/lib/viralobj-blueprints.ts` — lista estática curada de 10 blueprints
- `webapp/app/app/blueprints/page.tsx` — galeria com busca + filtros por nicho
- `webapp/app/app/generate/page.tsx` — `useEffect` lê `?blueprint=<id>` e
  preenche o wizard (niche/objects/topic/tone/duration)

Todo blueprint tem:
- `id` — slug usado no querystring
- `title`, `description`, `emoji`, `tags`, `metric` — UX do card
- `niche`, `objects`, `topic`, `tone`, `duration` — payload do remix

Sem backend: a lista vive no bundle, é fria, mudar exige deploy.

---

## Fase 2 — User-generated blueprints

Quando habilitar:
- Stripe + per-user wallets já no ar (Sprint 40+ na roadmap)
- Pelo menos 1k renders pagos no histórico do produto

Mecânica proposta:

### 1. Opt-in por geração

No final do wizard (após `🎬 Gerar vídeo` concluir), oferecer:

> ☑ Tornar este reel remixável publicamente
>
> Outros criadores podem ver seu pacote (niche, objects, topic, tone) e
> remixar. Nem o vídeo gerado nem dados pessoais são expostos — só o
> "molde" criativo.

Default: **off**. Usuário tem que marcar ativamente.

### 2. Score de ranking

Para entrar na galeria pública, o blueprint precisa de:

```
score = views_da_render * 0.3
      + remixes_que_geraram * 1.0
      + completion_rate * 0.5
```

Threshold mínimo, ex.: `score >= 50`. Filtro automático contra spam.

Ranking é recalculado diariamente via Cloud Function ou n8n cron.

### 3. Curadoria

Mesmo com opt-in + score, blueprint só vai pra galeria pública depois de:
- moderação automática (palavrão, hate speech, marca registrada)
- review humano (1ª vez de cada autor — depois auto)

Painel em `/app/admin/blueprints` (não existe ainda, fase 2).

### 4. Atribuição

Card de blueprint user-generated mostra:
- "Remix de @username" (se autor optou)
- "Remix anônimo" (se autor não quer atribuição)

Sem números pessoais. Apenas handle + foto/avatar opcional.

---

## Riscos de privacidade

| Risco | Mitigação |
|---|---|
| Vazar tema/nicho que identifica usuário | Opt-in explícito por geração; default off |
| Vazar dados de menores | Bloquear nichos `maternidade` em compartilhamento público até validar com legal |
| Marca registrada em `objects` ou `topic` | Lista de termos protegidos, rejeição automática |
| Reidentificação por padrão de uso | Não publicar `created_at` exato (apenas mês) |

---

## Riscos de produto

- **Concentração** — primeiros 10 blueprints viram dominantes. Solução: rotação semanal forçada na galeria.
- **Marketplace effect** — se 80% dos remixes vêm de 5 blueprints, criadores novos não aparecem. Solução: seção "Novos esta semana".
- **Cópia exata** — usuário não muda nada e gera vídeo idêntico ao original. Solução: forçar mudança em ao menos 1 campo antes de "Gerar pacote", OU detectar pacote idêntico e debitar 0 créditos (a 2ª pessoa pagaria só se mudar).

---

## Roadmap

| Fase | Sprint | Entrega |
|---|---|---|
| 1 ✅ | 40 | Galeria estática `/app/blueprints` + remix via querystring |
| 2 | 41+ | Opt-in no wizard + Firestore collection `public_blueprints` |
| 3 | 43+ | Score + ranking diário + filtro `Trending` |
| 4 | 45+ | Curadoria + admin panel + atribuição |
| 5 | 50+ | Search semântica + recomendação por uso prévio |

---

## Métricas que medem se isso funciona

- `% sessões /app/generate iniciadas via remix` — alvo: 40% em 30 dias
- `tempo do open ao "Gerar pacote"` em sessões com remix vs cold-start — alvo: -60%
- `% renders pagas vinda de remix` — alvo: 50%+ (sinaliza que blueprints carregam intenção real, não só curiosidade)

Se nenhuma das três se mover em 4 semanas, o conceito não cola pra esse público.
