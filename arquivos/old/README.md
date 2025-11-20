# NOUS OS - Documentação Central

> **Platform para Criação de AI Agents Pessoais** - Sistema operacional que gerencia sua vida (saúde, finanças, metas) + Plataforma no-code para qualquer pessoa criar e monetizar agents.

**Modelo:** B2C2C (Business-to-Consumer-to-Consumer)
- 👤 **Users**: Instalam agents e gerenciam suas vidas
- 👨‍⚕️ **Creators**: Médicos, trainers, contadores criam agents no-code e monetizam
- 🏗️ **Platform (vocês)**: Fornece runtime + builder + marketplace

---

## 📖 Leia PRIMEIRO

### 1. Visão Geral
**[`NOUS-VISION.md`](./NOUS-VISION.md)** - Arquitetura completa do sistema (LEIA ISSO PRIMEIRO!)
- O que é NOUS OS (Platform B2C2C)
- Arquitetura (Core + Creator Tools)
- Como tudo se conecta
- Business model (Users + Creators + Marketplace)

### 2. Stack Técnica
**[`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md)** - Implementação técnica completa
- **MVP**: Flowise (no-code builder) + LangGraph + Firebase
- **v2**: Fork Flowise customizado (branding NOUS)
- Anthropic API (Claude)
- ReactFlow (visual workflow editor)
- Cache strategy (Memory → Redis → Firestore)
- Fallback logic (CONTEXT → PROFILE → VAULT → User)
- Código Python + TypeScript completo

### 3. Orquestração Stateful
**[`LANGGRAPH-ORCHESTRATION.md`](./LANGGRAPH-ORCHESTRATION.md)** - Sistema de workflows complexos
- LangGraph para workflows stateful (checkpointing)
- Human-in-the-loop (pausar/retomar, consultar durante execução)
- Sub-agentes e execuções longas (horas/dias)
- Scheduled tasks com monitoramento 24/7 (ex: 15 dias monitorando preço)
- Comunicação real-time bidirecional
- Exemplos práticos (ligação telefônica + consultas paralelas)

### 4. Análise de Compatibilidade
**[`ARCHITECTURE-COMPATIBILITY-ANALYSIS.md`](./ARCHITECTURE-COMPATIBILITY-ANALYSIS.md)** - Compatibilidade conceitos antigos vs novos
- ✅ **TODOS COMPATÍVEIS** - Nenhum conceito quebra
- Análise detalhada: HOOKS, LOGS, WORKING, OUTPUT_FORMATS, PROFILE, VAULT, IDENTITY
- Mudanças necessárias (mínimas): runtime params, workflow_executions logs
- Benefícios da nova arquitetura (stateful, no-code, marketplace)

---

## 📂 Estrutura de Diretórios

```
F:\JARVA/
├── README.md                          ← VOCÊ ESTÁ AQUI (índice principal)
│
├── NOUS-VISION.md                     ← Arquitetura (13 componentes)
├── TECH-STACK-PRAGMATICA.md           ← Stack técnica + código
│
├── ADAPTACAO-PAI-PARA-NOUS.md         ← Como adaptamos PAI (Daniel Miessler) para B2C
│
├── identity/                          ← Configuração de identidade do NOUS
│   ├── persona.md                     ← Como NOUS pensa, fala e age
│   ├── boundaries.md                  ← Limites e regras de segurança
│   └── priorities.md                  ← Resolução de conflitos (saúde > finanças > trabalho)
│
├── core/                              ← Lógica central do sistema
│   └── CONTEXT-CACHE-AND-FALLBACK.md  ← Cache (3 layers) + Fallback chain
│
├── profile/                           ← Life API (histórico queryável)
│   └── README.md                      ← "O que você disse sobre X?"
│
├── working/                           ← Tarefas ativas
│   └── README.md                      ← Colaboração persistente user ↔ NOUS
│
├── output_formats/                    ← Templates de resposta
│   └── README.md                      ← health-assessment, financial-advice, etc
│
└── hooks/                             ← Automações (event-driven)
    └── README.md                      ← onContextUpdate, onSchedule, onThreshold
```

---

## 🚀 Start Here (Quickstart)

**Se você é novo no projeto:**

1. **Leia:** [`NOUS-VISION.md`](./NOUS-VISION.md) (30 min) - Entenda a visão completa
2. **Leia:** [`identity/persona.md`](./identity/persona.md) (15 min) - Como NOUS se comporta
3. **Leia:** [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md) (1h) - Implementação técnica

**Se você quer implementar algo:**

1. **Verifique:** [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md) → Firebase setup
2. **Veja código:** Seção específica (Agents, CORE, Cache, etc)
3. **Implemente!**

---

## 📚 Documentação por Conceito

### 🧠 Identidade & Comportamento

| Arquivo | Propósito | Quando Ler |
|---------|-----------|------------|
| [`identity/persona.md`](./identity/persona.md) | Como NOUS pensa, fala e age | **SEMPRE PRIMEIRO** - Define comportamento |
| [`identity/boundaries.md`](./identity/boundaries.md) | Limites de segurança | Quando definir permissões |
| [`identity/priorities.md`](./identity/priorities.md) | Resolução de conflitos | Quando goals conflitarem |

### 💾 Dados & Context

| Arquivo | Propósito | Quando Ler |
|---------|-----------|------------|
| [`core/CONTEXT-CACHE-AND-FALLBACK.md`](./core/CONTEXT-CACHE-AND-FALLBACK.md) | Cache + Fallback logic | Quando implementar contexto |
| [`profile/README.md`](./profile/README.md) | Life API (histórico) | Query "O que Alex disse sobre X?" |

### 🤖 Agents & Automação

| Arquivo | Propósito | Quando Ler |
|---------|-----------|------------|
| [`hooks/README.md`](./hooks/README.md) | Event-driven automations | Criar automações proativas |
| [`output_formats/README.md`](./output_formats/README.md) | Templates de resposta | Padronizar respostas |
| [`working/README.md`](./working/README.md) | Task collaboration | Tarefas multi-sessão |

### 🏗️ Arquitetura & Stack

| Arquivo | Propósito | Quando Ler |
|---------|-----------|------------|
| [`NOUS-VISION.md`](./NOUS-VISION.md) | Arquitetura completa (13 componentes) | **Leia PRIMEIRO** |
| [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md) | Stack técnica + código TypeScript | Implementar qualquer feature |
| [`ADAPTACAO-PAI-PARA-NOUS.md`](./ADAPTACAO-PAI-PARA-NOUS.md) | Comparação PAI (developer) vs NOUS (B2C) | Entender decisões de design |

---

## 🔑 Conceitos Principais

### 1. CONTEXT (Primary Data Source)
```
context/
├── health/
│   ├── bloodwork (exames)
│   ├── medications (remédios)
│   └── vitals (peso, pressão)
├── finance/
│   ├── balance (saldo)
│   └── transactions (gastos)
└── goals/
    ├── short_term (metas curto prazo)
    └── long_term (objetivos de vida)
```

**Leia:** [`NOUS-VISION.md`](./NOUS-VISION.md#1-context)

### 2. Three-Layer Cache Strategy
```
Memory (1ms) → Redis (5ms) → Firestore (50ms)
```

- **80% redução de custo**
- **10-50x performance improvement**
- **Smart TTL** (static data: 1h, dynamic: 5min)

**Leia:** [`core/CONTEXT-CACHE-AND-FALLBACK.md`](./core/CONTEXT-CACHE-AND-FALLBACK.md#three-layer-cache-strategy)

### 3. Fallback Chain (Never Fails)
```
CONTEXT (primary) → PROFILE (historical) → VAULT (files) → User (ask)
```

**Leia:** [`core/CONTEXT-CACHE-AND-FALLBACK.md`](./core/CONTEXT-CACHE-AND-FALLBACK.md#fallback-chain)

### 4. Batch Resolution (Multi Missing Data)
User vê **TODOS** os problemas de uma vez (não um por um):

```
⚠️ INFORMAÇÕES NECESSÁRIAS
Para completar sua análise, preciso de 3 informações:

❌ Exames de sangue (context:health.bloodwork)
❌ Saldo bancário (context:finance.balance)
❌ Meta de curto prazo (context:goals.short_term)

[Resolver todos agora] [Resolver depois] [Continuar sem]
```

**Leia:** [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md#scenario-5-multiple-missing-data)

### 5. Aggressive Startup Protocol
```markdown
🚨🚨🚨 MANDATORY FIRST ACTION - DO THIS IMMEDIATELY 🚨🚨🚨

BEFORE DOING OR SAYING ANYTHING, YOU MUST:
1. SILENTLY READ: identity/persona.md, boundaries.md, priorities.md
2. DO NOT LIE ABOUT LOADING FILES
```

**Inspirado em:** Daniel Miessler's PAI
**Leia:** [`identity/persona.md`](./identity/persona.md#mandatory-first-action)

---

## 🎯 Componentes da Arquitetura (13)

### Camada 1: Foundation
1. **CONTEXT** - Dados estruturados (health, finance, goals)
2. **PROFILE** - Life API queryável (meetings, emails, logs)
3. **VAULT** - Arquivos não processados (PDFs, fotos)

### Camada 2: Intelligence
4. **CORE** - Orchestrator central (cache, fallback, escalation)
5. **AGENTS** - Agentes especializados (@health/physician, @finance/advisor)
6. **MODULES** - Features externas (Open Banking, Limitless AI)

### Camada 3: Automation
7. **HOOKS** - Event-driven automations (onContextUpdate, onSchedule)
8. **WORKING** - Task collaboration (user ↔ NOUS)
9. **OUTPUT_FORMATS** - Response templates

### Camada 4: Identity & Control
10. **IDENTITY** - Persona, boundaries, priorities
11. **LOGS** - Audit trail (real-time)
12. **MARKETPLACE** - Agent marketplace (browse/install)

### Camada 5: Interface
13. **FRONTEND** - Web app (React + Firebase)

**Diagrama completo:** [`NOUS-VISION.md`](./NOUS-VISION.md#arquitetura-do-nous-os)

---

## 🚀 Estratégia de Desenvolvimento

### Fase 1: MVP (2-4 semanas) ⚡
```yaml
Objetivo: Validar conceito rapidamente

Stack:
  - Flowise (embedado via iframe) ← No-code builder PRONTO
  - LangGraph (via Flowise) ← Workflows stateful
  - Firebase (CONTEXT, VAULT, Auth)
  - Next.js (LENS dashboard)

Creators usam:
  - Flowise UI (genérica, mas funcional)
  - Drag-and-drop com ReactFlow
  - Publica agents direto no marketplace

Resultado:
  ✅ MVP funcional em 2-4 semanas
  ✅ Valida se creators conseguem usar
  ✅ Testa ideia de platform B2C2C
```

### Fase 2: v2 (2-3 meses depois) 🔧
```yaml
Objetivo: Customizar e melhorar UX

Ações:
  - Fork do Flowise (licença MIT)
  - Redesign UI com branding NOUS
  - Primitives específicas do NOUS
  - Remove features desnecessárias
  - Integração profunda com Firebase

Creators usam:
  - NOUS Builder (customizado)
  - UI otimizada e branded
  - Workflow templates prontos
  - Publishing flow integrado

Resultado:
  ✅ Platform 100% customizada
  ✅ UX otimizada para NOUS
  ✅ Marketplace integrado
```

---

## 🛠️ Tech Stack

### Backend
- **Firebase** (Firestore, Cloud Functions, Auth, Scheduler)
- **Redis** (cache layer)
- **LangGraph** (workflows stateful via Flowise/Python)
- **Cloud Run** (agents Python complexos)
- **TypeScript** (Cloud Functions)

### AI Layer
- **Anthropic Claude** (Sonnet 4 via API)
- **LangChain/LangGraph** (orquestração AI workflows)
- **Prompt caching** (contexto persistente)
- **MCP** (Model Context Protocol para integrações)

### Frontend
- **Next.js 14** (App Router, SSR)
- **React** + **TypeScript**
- **Tailwind CSS** + **ShadCN UI** (components)
- **Flowise** (embedado para creator studio)
- **ReactFlow** (visual workflow editor)
- **Firebase SDK** (real-time updates)
- **WebSockets** (comunicação bidirecional)

### Integrações
- **Limitless AI** (meeting transcripts)
- **Open Banking** (transações automáticas)
- **Gmail API** (email context)
- **Google Calendar** (eventos)

**Código completo:** [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md)

---

## 👥 Três Públicos da Platform

### 1. 👤 **Users** (Usuários Finais)
```
O que fazem:
  - Instalam agents do marketplace
  - Gerenciam sua vida (saúde, finanças, metas)
  - Conectam CONTEXT (dados pessoais)
  - Interagem com agents via LENS dashboard

Exemplos:
  - João instala "@health/physician" e monitora colesterol
  - Maria instala "@finance/advisor" e otimiza gastos
  - Pedro instala "@fitness/trainer" e segue treinos
```

### 2. 👨‍⚕️ **Creators** (Criadores de Agents)
```
Quem são:
  - Médicos, personal trainers, nutricionistas
  - Contadores, coaches, professores
  - PESSOAS COMUNS (não devs)

O que fazem:
  - Usam Flowise (no-code) para criar agents
  - Drag-and-drop workflows visuais
  - Testam em sandbox
  - Publicam no marketplace
  - Monetizam (revenue share)

Exemplos:
  - Dra. Ana cria "Agent Cardiologista" (monitora coração)
  - Personal João cria "Agent HIIT" (treinos personalizados)
  - Contador Paulo cria "Agent IR 2024" (imposto de renda)
```

### 3. 🏗️ **Platform** (NOUS - Vocês)
```
O que fornece:
  - Runtime para executar agents
  - Flowise embedado (no-code builder)
  - LangGraph (workflows stateful)
  - Firebase (infraestrutura)
  - Marketplace (browse/install)
  - Billing/Analytics

Responsabilidades:
  - Manter plataforma online
  - Garantir segurança/sandbox
  - Curar agents oficiais
  - Revenue share com creators
```

---

## 📖 Como Navegar Esta Documentação

### Por Papel

**Você é Product Manager?**
1. [`NOUS-VISION.md`](./NOUS-VISION.md) - Arquitetura completa
2. [`ADAPTACAO-PAI-PARA-NOUS.md`](./ADAPTACAO-PAI-PARA-NOUS.md) - Decisões de design B2C
3. [`identity/persona.md`](./identity/persona.md) - UX & Comportamento

**Você é Developer?**
1. [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md) - Stack + código completo
2. [`core/CONTEXT-CACHE-AND-FALLBACK.md`](./core/CONTEXT-CACHE-AND-FALLBACK.md) - Cache implementation
3. [`profile/README.md`](./profile/README.md) - Life API implementation

**Você é Designer?**
1. [`identity/persona.md`](./identity/persona.md) - Tom de voz, linguagem
2. [`output_formats/README.md`](./output_formats/README.md) - UI templates
3. [`TECH-STACK-PRAGMATICA.md`](./TECH-STACK-PRAGMATICA.md#user-experience-fluxos-visuais) - UX flows

### Por Feature

**Implementar Agents:**
→ [`TECH-STACK-PRAGMATICA.md` → "Agents Framework"](./TECH-STACK-PRAGMATICA.md#agents-framework)

**Implementar Cache:**
→ [`core/CONTEXT-CACHE-AND-FALLBACK.md` → "Three-Layer Cache"](./core/CONTEXT-CACHE-AND-FALLBACK.md#three-layer-cache-strategy)

**Implementar Fallback:**
→ [`TECH-STACK-PRAGMATICA.md` → "Scenario 5: Batch Resolution"](./TECH-STACK-PRAGMATICA.md#scenario-5-multiple-missing-data)

**Implementar Hooks:**
→ [`hooks/README.md`](./hooks/README.md)

**Implementar Profile (Life API):**
→ [`profile/README.md`](./profile/README.md)

---

## 🔥 Updates Recentes

### 2025-01-12 (Hoje)
- ✅ **Batch Resolution** - Warning panel mostra TODOS os problemas de uma vez (não um por um)
- ✅ **Pre-flight Check** - Agents detectam contextos faltantes ANTES de executar
- ✅ **MissingDataPanel** - Componente React para resolver múltiplos dados

### 2025-01-11
- ✅ **Three-layer cache** implementado (Memory → Redis → Firestore)
- ✅ **Fallback chain** completo (CONTEXT → PROFILE → VAULT → User)
- ✅ **Escalation protocol** (Agent → CORE → User)
- ✅ **Aggressive startup protocol** (🚨 MANDATORY)

### 2025-01-10
- ✅ **PAI integration** - Todos os conceitos do Daniel Miessler adaptados para B2C
- ✅ **PROFILE system** - Life API queryável
- ✅ **WORKING directory** - Task collaboration
- ✅ **OUTPUT_FORMATS** - Response templates

---

## ❓ FAQ

### "Onde começo?"
→ Leia [`NOUS-VISION.md`](./NOUS-VISION.md) (30 min)

### "Como implementar um agent?"
→ [`TECH-STACK-PRAGMATICA.md` → "Agents Framework"](./TECH-STACK-PRAGMATICA.md#agents-framework)

### "Como funciona o cache?"
→ [`core/CONTEXT-CACHE-AND-FALLBACK.md`](./core/CONTEXT-CACHE-AND-FALLBACK.md#three-layer-cache-strategy)

### "O que fazer se dados estão faltando?"
→ [`TECH-STACK-PRAGMATICA.md` → "Scenario 5: Batch Resolution"](./TECH-STACK-PRAGMATICA.md#scenario-5-multiple-missing-data)

### "Como NOUS se comporta?"
→ [`identity/persona.md`](./identity/persona.md)

### "Qual a diferença entre NOUS, PAI e Fabric?"
→ [`ADAPTACAO-PAI-PARA-NOUS.md`](./ADAPTACAO-PAI-PARA-NOUS.md)

---

## 📞 Contato

**Projeto:** NOUS OS
**Visão:** Sistema Operacional para sua Vida
**Stack:** Firebase + Anthropic Claude + TypeScript
**Status:** MVP em desenvolvimento

---

**Última atualização:** 2025-01-12
**Versão da documentação:** 1.0.0
