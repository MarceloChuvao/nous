# Arquitetura: Schema Dinâmico e Gestão de Agentes

> **Problema:** Como ter um schema flexível que suporte múltiplos domínios (saúde/amamentação, finanças, etc.) sem redesenhar o BD toda vez? E como evitar que agentes sobrescrevam dados uns dos outros?

---

## 📋 Problemas a Resolver

### 1. Schema Dinâmico
- ✅ Suportar diferentes verticais (saúde, finanças, produtividade, etc.)
- ✅ Cada vertical pode ter estrutura de dados diferente
- ✅ Exemplo: amamentação precisa de campos diferentes de check-up geral
- ✅ Deve ser escalável sem migration hell

### 2. Conflitos entre Agentes
- ✅ Dois agentes não devem sobrescrever dados um do outro
- ✅ Busca semântica não pode crescer infinitamente (custo/latência)
- ✅ Dados devem ser particionados/namespaced corretamente

---

## 🏗️ Solução 1: Hybrid Schema (Recomendado)

### Arquitetura

```
┌─────────────────────────────────────────────────┐
│           CORE SCHEMA (Estruturado)              │
├─────────────────────────────────────────────────┤
│ users, sessions, vertical_instances, agents      │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      DYNAMIC DATA (JSONB + Embeddings)          │
├─────────────────────────────────────────────────┤
│ • vertical_data (JSONB)                          │
│ • Namespace: user_id/vertical/agent/timestamp    │
│ • Embeddings particionados por vertical          │
└─────────────────────────────────────────────────┘
```

### Schema PostgreSQL

```sql
-- ==========================================
-- CORE SCHEMA (Fixo)
-- ==========================================

-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verticals disponíveis (saúde, finanças, etc.)
CREATE TABLE verticals (
  id TEXT PRIMARY KEY, -- 'health', 'finance', 'productivity'
  name TEXT NOT NULL,
  description TEXT,
  schema_version TEXT, -- '1.0.0'
  enabled BOOLEAN DEFAULT true
);

-- Instâncias de vertical por usuário
CREATE TABLE user_verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  vertical_id TEXT REFERENCES verticals(id),
  config JSONB DEFAULT '{}', -- Configurações específicas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vertical_id)
);

-- Agentes (Specialist Agents)
CREATE TABLE agents (
  id TEXT PRIMARY KEY, -- 'health.bloodwork_analyzer', 'finance.expense_tracker'
  vertical_id TEXT REFERENCES verticals(id),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  capabilities JSONB -- ['analyze_pdf', 'extract_metrics', etc.]
);

-- ==========================================
-- DYNAMIC DATA (JSONB)
-- ==========================================

-- Dados dinâmicos de cada vertical
CREATE TABLE vertical_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Namespace triplo
  user_id UUID REFERENCES users(id),
  vertical_id TEXT REFERENCES verticals(id),
  agent_id TEXT REFERENCES agents(id),

  -- Dados flexíveis
  data_type TEXT NOT NULL, -- 'bloodwork', 'transaction', 'medication'
  data JSONB NOT NULL, -- Schema livre

  -- Metadata
  source TEXT, -- 'pdf_upload', 'manual_entry', 'bank_api'
  confidence FLOAT, -- 0.0-1.0 (confiança do agente)

  -- Temporal
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,

  -- Índices
  CONSTRAINT unique_namespace UNIQUE(user_id, vertical_id, agent_id, data_type, created_at)
);

-- Índices para performance
CREATE INDEX idx_vertical_data_namespace ON vertical_data(user_id, vertical_id, agent_id);
CREATE INDEX idx_vertical_data_type ON vertical_data(data_type);
CREATE INDEX idx_vertical_data_temporal ON vertical_data(valid_from, valid_until);
CREATE INDEX idx_vertical_data_jsonb ON vertical_data USING GIN(data); -- Busca JSONB

-- ==========================================
-- EMBEDDINGS (Particionados)
-- ==========================================

CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Namespace (mesmo esquema)
  user_id UUID REFERENCES users(id),
  vertical_id TEXT REFERENCES verticals(id),
  agent_id TEXT REFERENCES agents(id),

  -- Embedding data
  content TEXT NOT NULL, -- Texto original
  embedding VECTOR(1536), -- OpenAI ada-002 ou similar

  -- Referência ao dado original
  data_ref UUID REFERENCES vertical_data(id) ON DELETE CASCADE,

  -- Metadata para filtros
  metadata JSONB, -- { "data_type": "bloodwork", "date": "2025-01-15" }

  -- Temporal (para TTL/archiving)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ DEFAULT NOW(), -- Para LRU cache

  -- Índices
  CONSTRAINT unique_embedding UNIQUE(data_ref)
);

-- Índice de vetor (pgvector)
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat(embedding vector_cosine_ops);

-- Índices para filtros
CREATE INDEX idx_embeddings_namespace ON embeddings(user_id, vertical_id);
CREATE INDEX idx_embeddings_metadata ON embeddings USING GIN(metadata);
```

---

## 🔄 Solução 2: Event Sourcing para Conflitos

### Problema

Dois agentes processando o mesmo dado podem sobrescrever:

```
Agent A: "Colesterol = 185 mg/dL" (extraído de PDF)
Agent B: "Colesterol = 180 mg/dL" (extraído do mesmo PDF, OCR diferente)
❌ Qual é o correto?
```

### Solução: Event Log

```sql
-- Event Log (Imutável)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Namespace
  user_id UUID REFERENCES users(id),
  vertical_id TEXT REFERENCES verticals(id),
  agent_id TEXT REFERENCES agents(id),

  -- Event
  event_type TEXT NOT NULL, -- 'data.created', 'data.updated', 'data.merged'
  event_data JSONB NOT NULL,

  -- Metadata
  source_event_id UUID REFERENCES events(id), -- Para merge/conflict resolution
  confidence FLOAT,

  -- Imutável
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- NUNCA deletar ou atualizar eventos!
-- Apenas inserir novos eventos
```

### Fluxo de Conflito

```python
# Agent A processa PDF
event_a = {
    "event_type": "bloodwork.cholesterol.extracted",
    "data": {"value": 185, "unit": "mg/dL"},
    "confidence": 0.95,
    "source": "pdf_page_1"
}

# Agent B processa mesmo PDF
event_b = {
    "event_type": "bloodwork.cholesterol.extracted",
    "data": {"value": 180, "unit": "mg/dL"},
    "confidence": 0.87,
    "source": "pdf_page_1"
}

# Core Agent detecta conflito e gera evento de merge
event_merge = {
    "event_type": "bloodwork.cholesterol.merged",
    "data": {"value": 185, "unit": "mg/dL"}, # Maior confiança vence
    "confidence": 0.95,
    "source_events": [event_a.id, event_b.id],
    "merge_strategy": "highest_confidence"
}

# ✅ Histórico completo preservado
# ✅ Rastreabilidade total
# ✅ Sem data loss
```

---

## 🗂️ Solução 3: Namespace Hierárquico

### Estrutura

```
user_123/
├── health/
│   ├── bloodwork_analyzer/
│   │   ├── 2025-01-15_cholesterol.json
│   │   └── 2025-01-15_glucose.json
│   ├── medication_tracker/
│   │   └── 2025-01-current_meds.json
│   └── pdf_processor/
│       └── 2025-01-15_exam_raw.json
├── finance/
│   ├── expense_tracker/
│   │   └── 2025-01_transactions.json
│   └── budget_analyzer/
│       └── 2025-01_budget.json
```

### Implementação

```python
class NamespaceManager:
    @staticmethod
    def build_path(user_id: str, vertical: str, agent: str, data_type: str) -> str:
        return f"{user_id}/{vertical}/{agent}/{data_type}"

    @staticmethod
    def query_namespace(user_id: str, vertical: str = None, agent: str = None):
        """
        Query flexível:
        - query_namespace(user_id) → todos os dados do usuário
        - query_namespace(user_id, 'health') → só saúde
        - query_namespace(user_id, 'health', 'bloodwork_analyzer') → específico
        """
        filters = {"user_id": user_id}
        if vertical:
            filters["vertical_id"] = vertical
        if agent:
            filters["agent_id"] = agent

        return db.query(vertical_data).filter_by(**filters).all()
```

---

## 🔍 Solução 4: Busca Semântica Otimizada

### Problema

```
User tem 10 anos de dados de saúde
→ 10.000 exames = 10.000 embeddings
→ Busca semântica fica LENTA e CARA
```

### Solução A: Particionamento por Vertical

```sql
-- Buscar APENAS na vertical relevante
SELECT * FROM embeddings
WHERE user_id = 'user_123'
  AND vertical_id = 'health' -- ✅ Reduz escopo
  AND metadata->>'date' > '2024-01-01' -- ✅ Filtra por data
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

### Solução B: Hierarchical Retrieval (2 camadas)

```python
# Layer 1: Summary embeddings (rápido)
summaries = [
    "Colesterol médio em 2024: 185 mg/dL, tendência estável",
    "Glicose média em 2024: 92 mg/dL, normal",
    "Medicamentos: Vitamina D (diário), Ômega 3 (diário)"
]

# Layer 2: Detailed embeddings (só quando necessário)
if user_asks_specific_question:
    # Busca detalhada apenas nos exames relevantes
    detailed_search(time_range="2024-01", metric="cholesterol")
```

### Solução C: TTL + Archiving

```sql
-- Embeddings recentes (hot): busca rápida
CREATE TABLE embeddings_hot (
  -- Dados dos últimos 6 meses
) PARTITION BY RANGE (created_at);

-- Embeddings antigos (cold): arquivo, busca lenta
CREATE TABLE embeddings_cold (
  -- Dados > 6 meses
  -- Só busca aqui se explicitamente pedido
);

-- Trigger automático para mover dados
CREATE TRIGGER move_to_cold
AFTER INSERT ON embeddings
FOR EACH ROW
WHEN (NEW.created_at < NOW() - INTERVAL '6 months')
EXECUTE FUNCTION archive_to_cold();
```

### Solução D: Summary Vectors

```python
# A cada mês, criar um "summary embedding"
monthly_summary = """
Janeiro 2025:
- Colesterol: 185 mg/dL (normal, -2.3% vs. dez/24)
- Glicose: 92 mg/dL (normal)
- Medicamentos tomados: 28/31 dias
- Check-up: não realizado
"""

# ✅ 1 embedding vs. 31 embeddings diários
# ✅ Busca 31x mais rápida
# ✅ Dados detalhados ainda acessíveis se necessário
```

---

## 📊 Exemplo Completo: Bloodwork

### 1. Definir Schema da Vertical

```json
// verticals/health.json
{
  "id": "health",
  "name": "Saúde",
  "version": "1.0.0",
  "data_types": {
    "bloodwork": {
      "schema": {
        "date": "date",
        "metrics": {
          "cholesterol_total": { "value": "number", "unit": "string", "status": "enum" },
          "glucose": { "value": "number", "unit": "string" },
          "hdl": { "value": "number", "unit": "string" }
        }
      }
    },
    "medication": {
      "schema": {
        "name": "string",
        "dosage": "string",
        "frequency": "string"
      }
    }
  }
}
```

### 2. Agentes da Vertical

```sql
INSERT INTO agents (id, vertical_id, name, capabilities) VALUES
('health.bloodwork_analyzer', 'health', 'Bloodwork Analyzer', '["extract_pdf", "interpret_results"]'),
('health.medication_tracker', 'health', 'Medication Tracker', '["track_adherence", "remind"]');
```

### 3. Gravar Dados (Agent A)

```python
# Agent: bloodwork_analyzer
data = {
    "user_id": "user_123",
    "vertical_id": "health",
    "agent_id": "health.bloodwork_analyzer",
    "data_type": "bloodwork",
    "data": {
        "date": "2025-01-15",
        "metrics": {
            "cholesterol_total": {"value": 185, "unit": "mg/dL", "status": "normal"}
        }
    },
    "source": "pdf_upload",
    "confidence": 0.95
}

db.insert("vertical_data", data)
```

### 4. Buscar Dados (Namespace Isolado)

```python
# Buscar apenas dados do bloodwork_analyzer
results = db.query("vertical_data").filter(
    user_id="user_123",
    vertical_id="health",
    agent_id="health.bloodwork_analyzer"
).all()

# ✅ Dados de outros agentes (medication_tracker) não aparecem
# ✅ Sem conflito
```

---

## 🎯 Resumo das Soluções

| Problema | Solução | Benefício |
|----------|---------|-----------|
| **Schema flexível** | JSONB + Core Tables | Suporta qualquer vertical sem migration |
| **Conflitos de agentes** | Namespace triplo (user/vertical/agent) | Isolamento completo |
| **Sobrescrita de dados** | Event Sourcing | Histórico imutável, rastreabilidade |
| **Busca semântica cara** | Particionamento + TTL + Summaries | 10-100x mais rápido |
| **Crescimento infinito** | Hot/Cold storage + Archiving | Custo controlado |

---

## 🚀 Próximos Passos

1. **Implementar schema híbrido** (PHASE-0-FOUNDATION)
2. **Criar namespace manager** (abstração para queries)
3. **Implementar event log** (opcional, mas recomendado)
4. **Configurar particionamento de embeddings** (pgvector)
5. **Criar job de archiving** (mensal/trimestral)

---

## 📚 Referências

- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [pgvector (embeddings)](https://github.com/pgvector/pgvector)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Multi-tenancy Patterns](https://docs.microsoft.com/azure/architecture/patterns/multitenancy)

---

**Quer que eu crie o código SQL/Python completo para implementar isso?** 🚀
