# Módulo 9 — Análise de Frames e Reconstituição de Roteiro

## Estratégia de Extração por Duração

| Duração do vídeo | Frames extraídos | Cobertura |
|-----------------|-----------------|-----------|
| < 15s | 6 frames | a cada ~2.5s |
| 15–30s | 8 frames | a cada ~3.5s |
| 30–60s | 10 frames | a cada ~6s |
| 60–90s | 12 frames | a cada ~7.5s |
| > 90s | 15 frames | a cada ~10s |

Para YouTube sem download: usar frames 0, 1, 2, 3 do YouTube API = ~25%, 50%, 75% do vídeo.

---

## Checklist de Análise por Frame

Para cada frame identificar:

### Personagem / Objeto Principal
- [ ] Tipo: pessoa real / avatar AI / objeto animado (Talking Object) / animação / produto
- [ ] Expressão: entusiasta / sério / conspirativo / surpreso / CTA direto / neutro
- [ ] Gesto: aponta para texto / conta dedos / thumbs up / "me chama no DM" / neutro
- [ ] Posição câmera: close (rosto) / plano médio / americano / total / aéreo (drone)
- [ ] Autenticidade: alta produção / produção caseira / entre os dois

### Ambiente e Cenário
- [ ] Local: escritório / externo / estúdio clean / ambiente real do nicho
- [ ] Iluminação: natural / golden hour / ring light / estúdio / neon
- [ ] Props visíveis: objetos relacionados ao nicho em destaque
- [ ] Fundo: limpo (chroma) / ambiente real / desfocado (bokeh)

### Texto em Tela (On-Screen Text)
- [ ] Tipo: legenda word-by-word / título de slide / overlay / lista / dado/número
- [ ] Cor e contraste: branco/preto / cor da marca / highlight
- [ ] Tamanho: dominante (ocupa >30% tela) / secundário / pequeno
- [ ] Posição: topo / centro / rodapé / lateral
- [ ] Conteúdo exato: transcrever se legível

### Edição e Ritmo
- [ ] Tipo de transição: corte direto / fade / zoom / pan / wipe / animação
- [ ] Velocidade: rápida (<1s/cena) / moderada (1-3s) / lenta (>3s)
- [ ] B-roll: imagem de suporte diferente do personagem principal
- [ ] Motion graphics: textos animados / gráficos / emojis voando
- [ ] Loop detectado: o frame final sugere retorno ao início?

---

## Ficha de Cena — Formato Padrão

```
FRAME [N] @ [~posição no vídeo]
═══════════════════════════════════════════
Cena detectada: [número] — [tipo: Hook/Promessa/Entrega/Conclusão/CTA]
─────────────────────
Visual: [descrição detalhada do que aparece]
Personagem: [tipo + expressão + gesto]
Texto em tela: "[texto exato ou 'ilegível']"
Cenário: [local + iluminação + props]
Técnica de edição: [tipo de transição + velocidade]
Nota viral: [elemento específico que torna esse frame eficaz]
═══════════════════════════════════════════
```

---

## Reconstituição de Roteiro a Partir de Frames

Após analisar todos os frames, reconstituir:

### 1. Linha do Tempo Estimada

| Segmento | Timestamps | Cenas | Função |
|----------|-----------|-------|--------|
| Hook | 0-3s | 1-2 | Para o scroll |
| Promessa | 3-6s | 3 | O que vai aprender |
| Entrega | 6-30s | 4-N | Valor do conteúdo |
| Conclusão | 30-35s | N+1 | Síntese/Virada |
| CTA | 35-38s | Final | Ação |

### 2. Narração Estimada

Baseado nos textos on-screen visíveis, reconstruir a narração falada:
```
[0s] "[texto do hook falado]"
[3s] "[promessa]"
[6s] "[ponto 1 — baseado no texto on-screen]"
[...]
[35s] "[CTA falado]"
```

### 3. Elementos Virais Identificados

| Elemento | Presente | Descrição |
|----------|---------|-----------|
| Hook forte (<2s) | ✅/❌ | [qual foi] |
| Loop seamless | ✅/❌ | [como funciona] |
| Texto word-by-word | ✅/❌ | [estilo] |
| Energy cuts | ✅/❌ | [ritmo] |
| Número/dado chocante | ✅/❌ | [qual] |
| Controvérsia | ✅/❌ | [qual tema] |
| Talking Object | ✅/❌ | [qual objeto] |
| Trending sound | ✅/❌ | [identificado] |
| B-roll diversificado | ✅/❌ | [tipos] |
| CTA diretivo | ✅/❌ | [qual ação pedida] |

---

## Análise de Transcrição (YouTube)

Quando transcrição disponível, identificar:

### Estrutura de Narração
```
[0-3s] HOOK: "[trecho]" → Tipo: [curiosidade/dado/controvérsia/POV]
[3-6s] PROMESSA: "[trecho]"
[6-30s] ENTREGA:
  Ponto 1: "[trecho]"
  Ponto 2: "[trecho]"
  Ponto 3: "[trecho]"
[30-35s] CONCLUSÃO: "[trecho]"
[35-38s] CTA: "[trecho]" → Ação: [comentar/salvar/DM/link]
```

### Técnicas de Narração Detectadas
- Pausas dramáticas: [sim/não — onde]
- ÊNFASE em palavras-chave: [quais]
- Velocidade variável: [normal/rápido em entrega/lento em CTA]
- Tom de voz: [amigável/autoritário/curioso/urgente]
- Vocabulário do nicho: [termos específicos identificados]

---

## Prompt para Claude Vision — Análise de Frames

```
Você é um especialista em análise de conteúdo viral para Instagram e TikTok.

Analise estes [N] frames do vídeo extraídos em sequência temporal.

CONTEXTO DO VÍDEO:
- Plataforma: [plataforma]
- URL: [url]
- Título/Caption disponível: [título]
- Transcrição (se disponível): [transcript]
- Nicho do usuário: [nicho do usuário]

Para cada frame, identifique o que aparece visualmente,
textos em tela, expressões, cenário e técnica de edição.

Depois, faça a análise completa no formato:

## 🔍 ANÁLISE DO REEL
[estrutura completa conforme template da skill]

## 🎬 ROTEIRO RECRIADO — [NICHO DO USUÁRIO]
[roteiro adaptado para o nicho e perfil do usuário]

## 💡 MELHORIAS SUGERIDAS
[o que fazer para superar o original]
```

---

## Pontuação de Qualidade do Conteúdo Analisado

Após análise, pontuar de 0-100:

| Critério | Peso | Pontuação |
|---------|------|----------|
| Força do hook (0-3s) | 25% | /25 |
| Estrutura clara | 15% | /15 |
| Entrega de valor | 20% | /20 |
| Qualidade visual | 15% | /15 |
| CTA eficaz | 10% | /10 |
| Elementos virais | 15% | /15 |
| **TOTAL** | 100% | **/100** |

```
< 40: Conteúdo fraco — muitas oportunidades de melhoria
40-60: Conteúdo médio — bom potencial com ajustes
60-80: Conteúdo bom — pequenos refinamentos necessários
80-100: Conteúdo excelente — focar em adaptar ao seu nicho
```