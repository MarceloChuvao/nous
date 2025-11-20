# OUTPUT_FORMATS - Response Templates

> **Inspirado em:** Daniel Miessler's `~/.claude/output-format/` (Personal AI Infrastructure)
>
> **Objetivo:** Templates estruturados para diferentes tipos de respostas - garantindo consistência e qualidade

---

## O que é OUTPUT_FORMATS?

**OUTPUT_FORMATS** são templates que definem COMO NOUS deve responder em diferentes situações.

**Problema que resolve:**

Sem templates:
- Respostas inconsistentes
- Falta informação importante
- Formato varia toda vez
- Difícil de processar programaticamente

Com templates:
- Respostas consistentes
- Sempre inclui informações críticas
- Formato previsível
- Fácil de parsear e processar

---

## Estrutura

```
output_formats/
├── README.md (este arquivo)
│
├── general/ (formatos gerais)
│   ├── brief-answer.md
│   ├── detailed-analysis.md
│   ├── step-by-step.md
│   └── pros-cons.md
│
├── domain-specific/ (por domínio)
│   ├── health-assessment.md
│   ├── financial-advice.md
│   ├── life-decision.md
│   └── technical-explanation.md
│
├── action-oriented/ (quando requer ação)
│   ├── action-plan.md
│   ├── recommendation.md
│   ├── emergency-protocol.md
│   └── checklist.md
│
└── data-presentation/ (apresentar dados)
    ├── comparison-table.md
    ├── timeline.md
    ├── metrics-dashboard.md
    └── report.md
```

---

## Formatos Gerais

### 1. brief-answer.md

```markdown
---
format: brief-answer
use_when: "User wants quick, direct answer"
max_length: 3_paragraphs
---

# Brief Answer Format

**Question:** [Restate user question]

**Answer:**
[Direct answer in 1-3 sentences]

**Key Points:**
- Point 1
- Point 2
- Point 3 (max)

**Need more detail?** [Offer to expand]
```

**Example:**
```
Question: "Devo tomar vitamina D?"

Answer:
Sim, especialmente se você passa pouco tempo ao sol. A vitamina D é essencial para saúde óssea e imunidade.

Key Points:
- Dose típica: 1000-2000 UI/dia
- Melhor tomar com refeição (lipossolúvel)
- Verificar níveis sanguíneos anualmente

Need more detail? Posso analisar seus exames e dar recomendação personalizada.
```

### 2. detailed-analysis.md

```markdown
---
format: detailed-analysis
use_when: "Complex question requiring thorough response"
sections: required
---

# Detailed Analysis Format

## Summary
[High-level overview in 2-3 sentences]

## Context
[Why this matters / Background information]

## Analysis
[Deep dive into the topic]

### Key Factors
1. Factor 1: [Explanation]
2. Factor 2: [Explanation]
3. Factor 3: [Explanation]

### Supporting Evidence
- Evidence 1: [Source]
- Evidence 2: [Source]

## Implications
[What this means for you]

## Recommendations
1. Recommendation 1
2. Recommendation 2

## Next Steps
- [ ] Action 1
- [ ] Action 2

## Sources
[Context paths, external references, etc]
```

### 3. pros-cons.md

```markdown
---
format: pros-cons
use_when: "Decision-making, evaluating options"
---

# Pros & Cons Format

**Decision:** [What's being evaluated]

## ✅ Pros

### [Category 1]
- Pro 1: [Explanation]
- Pro 2: [Explanation]

### [Category 2]
- Pro 3: [Explanation]

## ❌ Cons

### [Category 1]
- Con 1: [Explanation]
- Con 2: [Explanation]

### [Category 2]
- Con 3: [Explanation]

## ⚖️ Balance

[Overall assessment]

**Recommendation:** [Leaning toward which option and why]

**Confidence:** [High/Medium/Low] based on [reasoning]
```

---

## Domain-Specific Formats

### 4. health-assessment.md

```markdown
---
format: health-assessment
domain: health
agent: "@health/physician"
---

# Health Assessment Format

## Overview
**Assessment Date:** [Date]
**Data Sources:**
- context:health.bloodwork ([date])
- context:health.exams ([date])
- context:health.medications (current)

## Current Status

### 🩸 Bloodwork
| Metric | Value | Normal Range | Status |
|--------|-------|--------------|--------|
| Cholesterol | 185 mg/dL | <200 | ✅ Normal |
| Glucose | 92 mg/dL | 70-100 | ✅ Normal |
| [etc] | [value] | [range] | [status] |

### 💊 Current Medications
- Medication 1: [dose, frequency, purpose]
- Medication 2: [dose, frequency, purpose]

### 🏥 Recent Exams
- Exam 1: [date, type, result]
- Exam 2: [date, type, result]

## Analysis

### ✅ Positive Indicators
- Indicator 1: [explanation]
- Indicator 2: [explanation]

### ⚠️ Areas of Concern
- Concern 1: [explanation, severity]
- Concern 2: [explanation, severity]

## Recommendations

### Immediate (< 1 week)
- [ ] Action 1
- [ ] Action 2

### Short-term (1-3 months)
- [ ] Action 1
- [ ] Action 2

### Long-term (3+ months)
- [ ] Action 1
- [ ] Action 2

## Follow-up
**Next checkup:** [Recommended date]
**Monitor:** [What to track]

## Emergency Signs
🚨 Contact doctor immediately if:
- Sign 1
- Sign 2

---
**Sources:** context:health.* (as of [date])
**Reviewed by:** @health/physician v1.0
```

### 5. financial-advice.md

```markdown
---
format: financial-advice
domain: finance
agent: "@finance/advisor"
---

# Financial Advice Format

## Situation
**Date:** [Date]
**Context:** [What triggered this advice]

## Current Financial State

### 💰 Assets
| Category | Amount | % of Total |
|----------|--------|------------|
| Cash | R$ X | Y% |
| Investments | R$ X | Y% |
| Real Estate | R$ X | Y% |
| **Total** | **R$ X** | **100%** |

### 📊 Monthly Cash Flow
- Income: R$ X
- Fixed Expenses: R$ X
- Variable Expenses: R$ X
- Savings Rate: X%

### 🎯 Goals
- Goal 1: [Description, target date, amount needed]
- Goal 2: [Description, target date, amount needed]

## Analysis

### Strengths
- Strength 1: [Explanation]
- Strength 2: [Explanation]

### Risks
- Risk 1: [Explanation, mitigation]
- Risk 2: [Explanation, mitigation]

### Opportunities
- Opportunity 1: [Explanation]
- Opportunity 2: [Explanation]

## Recommendations

### Priority 1: [High Impact / Easy Win]
- Action: [What to do]
- Why: [Reasoning]
- Expected Impact: [Quantified if possible]
- Timeline: [When to implement]

### Priority 2: [Important]
- Action: [What to do]
- Why: [Reasoning]
- Expected Impact: [Quantified if possible]
- Timeline: [When to implement]

### Priority 3: [Long-term]
- Action: [What to do]
- Why: [Reasoning]
- Expected Impact: [Quantified if possible]
- Timeline: [When to implement]

## Action Plan
- [ ] Week 1: [Actions]
- [ ] Week 2-4: [Actions]
- [ ] Month 2-3: [Actions]

## Monitoring
Track these metrics monthly:
- Metric 1: [Current: X, Target: Y]
- Metric 2: [Current: X, Target: Y]

---
**Sources:** context:finance.* (as of [date])
**Reviewed by:** @finance/advisor v1.0
**Risk tolerance:** [User's risk profile]
```

### 6. life-decision.md

```markdown
---
format: life-decision
domain: personal
agent: "@life/advisor"
---

# Life Decision Format

## Decision
**What:** [The decision being considered]
**Deadline:** [When decision must be made]
**Reversibility:** [Easy/Moderate/Difficult to reverse]

## Your Values (from context:personal.values)
1. Value 1: [How this decision relates]
2. Value 2: [How this decision relates]
3. Value 3: [How this decision relates]

## Options Analysis

### Option A: [Name]

**Pros:**
- Pro 1 (aligned with [value])
- Pro 2

**Cons:**
- Con 1 (conflicts with [value])
- Con 2

**Short-term impact (0-1 year):**
- Impact 1
- Impact 2

**Long-term impact (1-5 years):**
- Impact 1
- Impact 2

**Alignment with goals:**
- Goal 1: [High/Medium/Low alignment]
- Goal 2: [High/Medium/Low alignment]

### Option B: [Name]

[Same structure as Option A]

## Comparison

| Criteria | Option A | Option B | Winner |
|----------|----------|----------|--------|
| Values alignment | [Score] | [Score] | [A/B] |
| Financial impact | [Score] | [Score] | [A/B] |
| Risk level | [Score] | [Score] | [A/B] |
| Reversibility | [Score] | [Score] | [A/B] |
| **Total** | **[X]** | **[Y]** | **[Winner]** |

## Synthesis

Based on your values and goals, **Option [A/B]** appears stronger because:
1. Reason 1
2. Reason 2
3. Reason 3

**However**, consider:
- Caveat 1
- Caveat 2

## Recommendation

**Suggested choice:** [Option]
**Confidence level:** [High/Medium/Low]
**Reasoning:** [Summary]

## Decision Protocol

### Before deciding:
- [ ] Sleep on it (at least 24h)
- [ ] Discuss with [trusted person]
- [ ] Consider [specific factor]

### After deciding:
- [ ] Document decision in PROFILE
- [ ] Set up monitoring (review in X months)
- [ ] Update related CONTEXT

## Potential Regret Minimization
"Will I regret NOT choosing [option] in 5 years?"
[Analysis]

---
**Sources:**
- context:personal.values
- context:goals.*
- profile.query("similar past decisions")

---

## 🆕 Integração com Flowise + LangGraph

### OUTPUT_FORMATS funcionam IDENTICAMENTE

Templates funcionam da mesma forma com a nova arquitetura:

#### 1. Uso no Flowise (Visual Builder)

Creators constroem agents no Flowise e selecionam template de output:

```
┌──────────────────────────────────────────────────────┐
│  Flowise Visual Builder                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [LLM Node]                                          │
│    ├─ Model: Claude Sonnet 4                        │
│    ├─ Temperature: 0.7                               │
│    │                                                 │
│    └─ Output Format: ▼ Dropdown                     │
│        ├─ brief-answer                               │
│        ├─ detailed-analysis                          │
│        ├─ health-assessment  ← Selected             │
│        ├─ financial-advice                           │
│        └─ pros-cons                                  │
│                                                      │
│  [Output Node]                                       │
│    └─ Formatted response usando template            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Como funciona:**

```javascript
// Flowise node configuration
{
  "nodeId": "llm_health_analysis",
  "type": "LLM",
  "config": {
    "model": "claude-sonnet-4",
    "temperature": 0.7,
    "systemPrompt": loadSystemPrompt("health-assessment.md"),
    "outputFormat": "health-assessment"  // ← Template aplicado
  }
}

// Template é injetado no system prompt
function loadSystemPrompt(templateName) {
  const template = loadTemplate(templateName);
  return `
    ${baseSystemPrompt}

    # Response Format
    ${template.format}

    Always respond using this exact structure.
  `;
}
```

#### 2. Uso em LangGraph Workflows

Templates podem ser aplicados em qualquer node do workflow:

```python
# workflows/health/physician.py
from langgraph.graph import StateGraph

def synthesize_response_node(state: PhysicianState):
    """Node que formata resposta usando template"""

    # 1. Load template
    template = load_output_format("health-assessment")

    # 2. Prepara dados
    data = {
        "assessment_date": datetime.now(),
        "bloodwork": state["bloodwork_data"],
        "medications": state["medications"],
        "findings": state["findings"],
        "recommendations": state["recommendations"]
    }

    # 3. Formata usando template
    formatted_response = format_with_template(template, data)

    return {"output": formatted_response}

# Workflow
workflow = StateGraph(PhysicianState)
workflow.add_node("analyze", analyze_exams_node)
workflow.add_node("synthesize", synthesize_response_node)  # ← Usa template
```

#### 3. Templates em Agents Markdown

Agents criados em Markdown podem especificar template:

```markdown
# @health/physician

> Analisa exames médicos e dá recomendações

## Config

\```yaml
name: "@health/physician"
version: "1.0.0"
model: "claude-sonnet-4"
temperature: 0.7

output_format: "health-assessment"  # ← Template aplicado automaticamente

permissions:
  context:
    read: ["health.bloodwork", "health.medications"]
\```

## System Prompt

Você é um médico analisando exames.

**Output Format:**
Use o template "health-assessment.md" para estruturar sua resposta.
```

#### 4. Runtime Selector: Qual Template Usar?

```typescript
// CORE decide qual template usar baseado no contexto

async function selectOutputFormat(
  agentName: string,
  queryType: string
): Promise<string> {

  // 1. Agent tem template configurado?
  const agentConfig = await loadAgentConfig(agentName);
  if (agentConfig.output_format) {
    return agentConfig.output_format;
  }

  // 2. Query type sugere template?
  const templateMap = {
    "health_question": "health-assessment",
    "financial_question": "financial-advice",
    "decision": "life-decision",
    "quick_answer": "brief-answer"
  };

  if (templateMap[queryType]) {
    return templateMap[queryType];
  }

  // 3. Default
  return "detailed-analysis";
}
```

#### 5. Creator Marketplace: Templates Customizados

Creators podem criar seus próprios templates:

```yaml
# marketplace/templates/custom-fitness-plan.md
---
format: fitness-plan
creator: "@personal/trainer-joao"
category: health
price: free
---

# Fitness Plan Format

## Current Assessment
**Date:** [Date]
**Fitness Level:** [Beginner/Intermediate/Advanced]

### 💪 Physical Stats
- Weight: X kg
- Body Fat: Y%
- Muscle Mass: Z kg

### 🎯 Goals
- Goal 1: [Description, timeline]
- Goal 2: [Description, timeline]

## Workout Plan

### Week 1-4 (Foundation)
**Monday:**
- Exercise 1: [Sets x Reps]
- Exercise 2: [Sets x Reps]

**Wednesday:**
...

## Nutrition Plan
...

## Progress Tracking
...
```

**Creators publicam no marketplace:**
```typescript
{
  template_id: "fitness-plan-premium",
  name: "Premium Fitness Plan Template",
  creator: "@personal/trainer-joao",
  category: "health",
  price: 0,  // Free
  installs: 1234,
  rating: 4.8
}
```

### Vantagens da Integração

| Aspecto | Antes | Com Flowise + LangGraph |
|---------|-------|-------------------------|
| **Criação** | Manual (código) | Visual (Flowise dropdown) |
| **Uso** | Hardcoded | Configurável per agent |
| **Customização** | Dev only | Creators podem criar |
| **Marketplace** | N/A | Templates compartilháveis |
| **Workflows** | Difícil | Cada node pode ter template |

### Exemplo Completo: Health Agent com Template

```
┌──────────────────────────────────────────────────────┐
│  Flowise: Agent @health/cholesterol-monitor          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Trigger Node]                                      │
│    └─ onContextUpdate: health.bloodwork             │
│         ↓                                            │
│  [Load Context Node]                                 │
│    └─ Load: health.bloodwork, health.medications    │
│         ↓                                            │
│  [Condition Node]                                    │
│    └─ If cholesterol > 200                          │
│         ↓                                            │
│  [LLM Analysis Node]                                 │
│    ├─ Model: Claude Sonnet 4                        │
│    ├─ Prompt: "Analyze cholesterol results"         │
│    └─ Output Format: health-assessment ← Template   │
│         ↓                                            │
│  [Notification Node]                                 │
│    └─ Send formatted assessment to user             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Resultado:** User recebe notificação com assessment formatado perfeitamente usando template `health-assessment.md`!

---

## Conclusão

**OUTPUT_FORMATS é COMPATÍVEL com toda a nova arquitetura:**

✅ **Flowise**: Creators selecionam templates no visual builder
✅ **LangGraph**: Workflows aplicam templates em qualquer node
✅ **Agents Markdown**: Especificam template no config YAML
✅ **Marketplace**: Creators podem criar e compartilhar templates customizados

**Nenhuma mudança breaking** - tudo funciona como antes, mas agora com mais flexibilidade!
