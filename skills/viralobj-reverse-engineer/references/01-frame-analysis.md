# Módulo 01 — Protocolo de Análise Frame a Frame

## Pipeline de Extração

```bash
# 1. Metadados
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=width,height,codec_name,codec_type \
  -of default "$VIDEO" 2>&1

# 2. Extrair frames estratégicos
# Fórmula: N frames = min(14, max(8, floor(duration/2)))
# Timestamps: 0%, 7%, 15%, 22%, 30%, 40%, 50%, 65%, 75%, 85%, 93%, 97%
python3 -c "
dur = DURATION
pcts = [0, 0.07, 0.15, 0.22, 0.30, 0.40, 0.50, 0.65, 0.75, 0.85, 0.93, 0.97]
for i, p in enumerate(pcts):
    print(f'{i+1:02d}:{dur*p:.2f}')
"
```

## Ficha de Análise Preenchida por Vídeo

```
🔍 ENGENHARIA REVERSA — [NOME DO ARQUIVO]
═══════════════════════════════════════

METADADOS:
  Duração: ___s | Resolução: 720×1280 | Codec: H264/AAC

FORMATO DETECTADO: [ ] MULTI-STUB [ ] SINGLE-FULL [ ] DRESSED-CHAR [ ] MAP-DOC [ ] RECIPE-MAGIC

NICHO: _______________________

CONTA (watermark): ___________

PERSONAGENS:
  #1: _______________ | Timestamp: 0s–___s | Tipo de corpo: A/B/C/D/E
  #2: _______________ | Timestamp: ___s–___s | Tipo de corpo: A/B/C/D/E
  #3: _______________ | Timestamp: ___s–___s | Tipo de corpo: A/B/C/D/E

CÂMERA: [ ] Static [ ] Follow [ ] Zoom-in [ ] Mixed
  Detalhes: _______________

LEGENDAS DETECTADAS (por frame):
  [0s] "_______"
  [Xs] "_______"
  [Xs] "_______"
  (adicionar todos)

ESTILO DE LEGENDA: [ ] Alpha (bold branco) [ ] Beta (pill 2 cores)
  Se Beta → cor de destaque: ___________

EFEITOS ESPECIAIS: [ ] Partículas [ ] Bactérias [ ] Aranhas [ ] Líquido [ ] Brilhos [ ] Nenhum

TRILHA SONORA: [ ] Upbeat [ ] Calma [ ] Dramática [ ] Cômica [ ] Tutorial
  BPM estimado: ___

EFEITOS SONOROS DETECTADOS: _______________

HUMANO AO FUNDO: [ ] Sim [ ] Não
  Descrição: _______________

CAPA/THUMBNAIL: Descrever frame mais impactante: _______________

PONTOS FORTES DO VÍDEO:
  1. _______________
  2. _______________
  3. _______________

O QUE PODE SER MELHORADO/SUPERADO:
  1. _______________
  2. _______________
═══════════════════════════════════════
```

## Interpretação Rápida dos 5 Formatos

### MULTI-STUB (casa/plantas)
- Identificar: múltiplos objetos, cada um com ~6s
- Câmera: sempre estática por personagem
- Foco: expressão facial e fala
- Sequência: brava → alarmada → sarcástica → resignada → furiosa

### SINGLE-FULL (cravo)
- Identificar: 1 personagem único, tutorial ou dica
- Tom: caloroso, nunca bravo
- Efeitos: partículas, magia, resultado positivo
- Câmera: pode ter zoom em ingredientes

### DRESSED-CHAR (snap/financeiro)
- Identificar: objeto com corpo humanizado + roupa
- Contexto: profissional ou cotidiano (churrasqueira, escritório)
- Gestos: usa ferramentas, aponta, explica
- Duração: pode ser mais longa (60–90s)

### MAP-DOC (orlando)
- Identificar: documento/mapa com pernas andando
- Location pin visível no corpo
- Caption SEMPRE no estilo Beta (pill)
- Câmera tracking → OBRIGATÓRIO

### RECIPE-MAGIC (cravo aromatizante)
- Identificar: ingredientes + personagem ensinando
- Partículas douradas = assinatura do formato
- Humano ao fundo EXECUTANDO a receita
- Tom: mais caloroso e acolhedor que os outros
