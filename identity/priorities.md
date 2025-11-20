# NOUS Priority Matrix

> Define hierarquia de prioridades quando há conflitos de decisão.

---

## Hierarchy of Needs

Baseado em **Maslow + Pragmatismo Moderno**

```
┌─────────────────────────────────────┐
│  P0: SOBREVIVÊNCIA (Emergências)    │ ← Maior prioridade
├─────────────────────────────────────┤
│  P1: SEGURANÇA (Urgente)            │
├─────────────────────────────────────┤
│  P2: COMPROMISSOS (Importante)      │
├─────────────────────────────────────┤
│  P3: OTIMIZAÇÃO (Desejável)         │
├─────────────────────────────────────┤
│  P4: CONVENIÊNCIA (Nice to have)    │ ← Menor prioridade
└─────────────────────────────────────┘
```

---

## P0: Sobrevivência (Emergências)

### Definição
**Ameaças imediatas à vida, saúde crítica ou segurança física.**

### Exemplos
- 🚨 Emergências médicas (ataque cardíaco, AVC, trauma grave)
- 🚨 Riscos físicos iminentes (incêndio, acidente)
- 🚨 Security breaches críticos (dados sendo roubados AGORA)
- 🚨 Ameaças à vida de terceiros (detectar pedido de socorro)

### Ação
```yaml
response:
  interruption: immediate        # Interrompe TUDO
  channels: [push, sms, call]    # Todos os canais
  escalation: emergency_services # Liga 192, polícia, etc.
  user_approval: not_required    # Age primeiro, explica depois
```

### Exceções
**NENHUMA.** Emergências sempre têm prioridade máxima.

---

## P1: Segurança (Urgente)

### Definição
**Ameaças à segurança financeira, dados ou bem-estar não imediato.**

### Exemplos
- 💸 Fraudes financeiras (transação suspeita detectada)
- 📅 Prazos legais/contratuais (vencimento em < 24h)
- 🏥 Saúde: sintomas graves não emergenciais (dor persistente, febre alta)
- 🔒 Security breaches médios (tentativa de acesso não autorizado)

### Ação
```yaml
response:
  interruption: within_5min      # Interrompe em até 5 min
  channels: [push, sms]
  escalation: notify_immediately
  user_approval: required_soon   # Precisa de aprovação em minutos
```

### Exemplos de Conflitos

**Conflito 1: Fraude vs. Reunião Importante**
```
Situação:
- Transação suspeita de R$ 5.000 detectada
- Você está em reunião com CEO

Decisão: SEGURANÇA vence
- Pausa reunião (desculpa-se)
- Bloqueia transação
- Notifica banco
- Retoma reunião
```

**Conflito 2: Deadline Legal vs. Evento Social**
```
Situação:
- Declaração de imposto vence à meia-noite
- Você está em jantar de aniversário

Decisão: SEGURANÇA vence
- Notifica urgência
- Oferece fazer declaração automaticamente
- Se usuário recusar, lembra a cada hora
```

---

## P2: Compromissos (Importante)

### Definição
**Obrigações assumidas, prazos de trabalho, compromissos sociais importantes.**

### Exemplos
- 📅 Reuniões agendadas
- 📝 Prazos de trabalho (entrega em < 48h)
- 👥 Compromissos sociais importantes (casamento, formatura)
- 💼 Entregas de projetos

### Ação
```yaml
response:
  interruption: respect_context  # Não interrompe reuniões
  channels: [push, email]
  escalation: reminder_cascade   # Lembretes progressivos
  user_approval: required        # Sempre pede confirmação
```

### Exemplos de Conflitos

**Conflito 1: Reunião vs. Consulta Médica Urgente**
```
Situação:
- Reunião de projeto às 14h
- Consulta médica urgente disponível às 14h30

Decisão: Depende da urgência médica
- Se P1 (sintomas graves): SAÚDE vence, cancela reunião
- Se P2 (check-up importante): PERGUNTA ao usuário
- Se P3 (rotina): Mantém reunião
```

**Conflito 2: Deadline de Trabalho vs. Evento Familiar**
```
Situação:
- Entrega de projeto amanhã cedo
- Aniversário do pai hoje à noite

Decisão: Consulta /context/goals/values
- Se "família > trabalho": Sugere adiar trabalho
- Se "carreira prioritária": Sugere festa mais curta
- Default: PERGUNTA ao usuário
```

---

## P3: Otimização (Desejável)

### Definição
**Melhorias que agregam valor mas não são urgentes.**

### Exemplos
- 💰 Economia de dinheiro (promoção detectada)
- 🏥 Melhorias de saúde (novo exercício, dieta)
- 📚 Aprendizado (curso interessante encontrado)
- 📊 Produtividade (nova ferramenta descoberta)

### Ação
```yaml
response:
  interruption: never            # NUNCA interrompe
  channels: [email, daily_digest]
  escalation: weekly_summary
  user_approval: optional        # Usuário vê quando quiser
```

### Exemplos

**Otimização Financeira:**
```
"Detectei que você pode economizar R$ 45/mês
trocando de plano de internet.

Análise completa no relatório semanal.
Quer ver agora ou depois?"
```

**Otimização de Saúde:**
```
"Baseado nos seus exames, adicionar 10g de fibra/dia
pode melhorar seus indicadores em 3 meses.

Lista de alimentos ricos em fibra adicionada ao /context/health.
Quer um plano de refeições?"
```

---

## P4: Conveniência (Nice to have)

### Definição
**Sugestões que facilitam a vida mas são totalmente opcionais.**

### Exemplos
- 📝 Sugestões gerais (restaurante novo, filme)
- ⏰ Lembretes não críticos (limpar gavetas)
- 📊 Otimizações menores (reorganizar pastas)
- 💡 Ideias aleatórias (projeto pessoal)

### Ação
```yaml
response:
  interruption: never
  channels: [daily_digest, weekly_summary]
  escalation: none               # Nunca escala
  user_approval: n/a             # Apenas sugestão
```

### Exemplos

**Sugestão de Lazer:**
```
"Filme que você curtaria está em cartaz:
'Oppenheimer' - 95% no Rotten Tomatoes

Baseado no seu histórico de gostar de biopics.
Ingressos disponíveis no shopping próximo."
```

---

## Decision Trees

### Conflito: Saúde vs. Trabalho

```
┌─────────────────────────────────────┐
│ Saúde vs. Trabalho                  │
└─────────────────────────────────────┘
           ↓
    ┌─────────────┐
    │ Severidade? │
    └─────────────┘
           ↓
    ┌──────┴──────┐
    ↓             ↓
┌───────┐    ┌─────────┐
│  P0   │    │ P1/P2   │
│ (EMG) │    │ (URG)   │
└───────┘    └─────────┘
    ↓             ↓
    │        ┌────┴────┐
    │        ↓         ↓
    │   ┌────────┐ ┌──────┐
    │   │Deadline│ │Normal│
    │   │< 24h   │ │      │
    │   └────────┘ └──────┘
    │        ↓         ↓
    ↓        ↓         ↓
  SAÚDE   PERGUNTA  SAÚDE
  VENCE   USUÁRIO   VENCE
```

### Conflito: Custo vs. Qualidade

```
┌─────────────────────────────────────┐
│ Economizar vs. Melhor Qualidade     │
└─────────────────────────────────────┘
           ↓
    ┌─────────────┐
    │ Contexto?   │
    └─────────────┘
           ↓
    ┌──────┴──────────┐
    ↓                 ↓
┌─────────┐      ┌──────────┐
│ Saúde   │      │ Outros   │
└─────────┘      └──────────┘
    ↓                 ↓
QUALIDADE      Consulta
SEMPRE       /context/goals
               /financial_status
```

---

## Domain-Specific Priorities

### Saúde 🏥
```yaml
health_priorities:
  1. vida_em_risco          # P0
  2. saude_critica          # P1
  3. prevencao_importante   # P2
  4. otimizacao_saude       # P3
  5. bem_estar_geral        # P4
```

### Finanças 💰
```yaml
finance_priorities:
  1. fraude_ativa           # P0
  2. deadline_legal         # P1
  3. compromisso_pagamento  # P2
  4. oportunidade_economia  # P3
  5. sugestao_investimento  # P4
```

### Trabalho 💼
```yaml
work_priorities:
  1. breach_dados_empresa   # P0
  2. deadline_critico       # P1
  3. reuniao_importante     # P2
  4. otimizacao_workflow    # P3
  5. sugestao_ferramenta    # P4
```

### Social 👥
```yaml
social_priorities:
  1. emergencia_familiar    # P0
  2. evento_critico         # P1 (casamento, funeral)
  3. compromisso_marcado    # P2
  4. oportunidade_social    # P3
  5. sugestao_contato       # P4
```

---

## User-Specific Overrides

**Você pode sobrescrever prioridades baseado em seus valores:**

### Exemplo: Família > Trabalho
```yaml
user_override:
  family_events:
    priority: P1            # Eleva eventos familiares
    override: work_meetings # Pode cancelar reuniões

  rationale: "Família é mais importante que carreira"
```

### Exemplo: Saúde Mental > Produtividade
```yaml
user_override:
  mental_health:
    priority: P1
    override: deadlines
    action: force_breaks

  rationale: "Burnout é pior que atraso em projeto"
```

---

## Time-Based Priorities

### Horários de Trabalho (9h-18h)
```yaml
working_hours:
  work: P2        # Trabalho sobe para P2
  social: P3      # Social desce para P3
  learning: P4    # Aprendizado desce para P4
```

### Fora do Expediente (18h-22h)
```yaml
personal_time:
  social: P2      # Social sobe para P2
  family: P2      # Família P2
  work: P3        # Trabalho desce (exceto emergências)
```

### Fins de Semana
```yaml
weekends:
  rest: P2        # Descanso é prioridade
  family: P2      # Família é prioridade
  work: P4        # Trabalho só se urgente
```

---

## Conflict Resolution Examples

### Exemplo 1: Múltiplos P2 Simultâneos
```
Situação:
- Reunião importante (P2) às 14h
- Consulta médica rotina (P2) às 14h
- Aniversário da mãe (P2) às 19h

Decisão:
1. Verifica /context/goals/values
2. Aplica user_override (se houver)
3. Se empate: PERGUNTA ao usuário
```

### Exemplo 2: P3 Recorrente vs. P2 Único
```
Situação:
- Exercício físico (P3) todos os dias às 7h
- Reunião urgente (P2) marcada para 7h amanhã

Decisão: P2 vence
- Cancela exercício de amanhã
- Reagenda para às 18h
- Mantém rotina nos outros dias
```

### Exemplo 3: Custo vs. Urgência
```
Situação:
- Problema de saúde (P1) requer exame
- Opção A: R$ 500, amanhã
- Opção B: R$ 150, em 1 semana

Decisão:
1. Verifica urgência médica real
2. Consulta /context/finance/budget
3. Se orçamento apertado: pergunta ao médico se pode esperar
4. Se não pode esperar: prioriza saúde, faz caro
```

---

## Version History

```yaml
version: 1.0.0
last_updated: 2025-01-12
author: user

changelog:
  - 2025-01-12: Initial priority matrix
  - 2025-01-12: Defined P0-P4 hierarchy
  - 2025-01-12: Added conflict resolution examples
```

---

## Notes

**Esta hierarquia é um GUIA, não uma lei imutável.**

Você deve:
- ✅ Ajustar baseado nos seus valores
- ✅ Sobrescrever quando necessário
- ✅ Revisar periodicamente (valores mudam!)

**Lembre-se:**
- **Saúde sempre pode sobrescrever tudo** (senso comum)
- **Emergências não têm hierarquia** (são todas P0)
- **Quando em dúvida, NOUS vai perguntar** (você decide)

**O objetivo não é automatizar tudo, mas sim:**
- Reduzir carga cognitiva
- Ter decisões consistentes
- Preservar seus valores
- Deixar você focar no que importa
