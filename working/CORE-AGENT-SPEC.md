# NOUS CORE Agent - Technical Specification

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Parent Document:** NOUS-UNIFIED-PRD.md (Section 5.0)
>
> **Purpose:** Detailed technical specification for the CORE Agent - NOUS's stateful conversational orchestrator

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [State Management](#3-state-management)
4. [Conversation Memory (RAG)](#4-conversation-memory-rag)
5. [Intent Understanding](#5-intent-understanding)
6. [Data Source Routing](#6-data-source-routing)
7. [Voice Interface](#7-voice-interface)
8. [Sub-Agent Delegation](#8-sub-agent-delegation)
9. [Implementation Guide](#9-implementation-guide)
10. [Cost Analysis](#10-cost-analysis)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Overview

### What is CORE Agent?

**CORE Agent** is the conversational orchestrator at the heart of NOUS OS. Unlike traditional chatbots or stateless dispatchers, CORE Agent is:

- **Stateful:** Maintains conversation context across sessions
- **Memory-enabled:** Uses RAG (Retrieval-Augmented Generation) for semantic memory
- **Voice-first:** Native support for voice input/output
- **Intelligent:** Knows WHERE to look for data (CONTEXT, PROFILE, VAULT, WORKING, LOGS)
- **Context-aware:** Understands references ("ele", "isso", "o anterior")
- **Selective:** Only delegates to specialist sub-agents when necessary

### Key Innovation

**Traditional Approach (Stateless Dispatcher):**
```
User: "Me fala meu último exame"
Dispatcher: [Routes to @health/physician] → Response

User: "E o anterior?"
Dispatcher: [Lost context! Doesn't know what "anterior" refers to]
```

**CORE Agent Approach (Stateful + Memory):**
```
User: "Me fala meu último exame"
CORE Agent: [Loads exam from context:health.exams[latest]] → Response
            [Stores conversation in memory]

User: "E o anterior?"
CORE Agent: [Retrieves from memory: "anterior" = previous exam]
            [Loads context:health.exams[previous_to:2025-01-15]]
            → Response with correct exam
```

### Inspiration

- **Supermemory.ai:** Conversation memory + semantic search
- **Personal AI Infrastructure (Daniel Miessler):** Data source routing
- **LangGraph:** Stateful workflows with checkpointing
- **Rewind AI:** Queryable life history

---

## 2. Architecture

### High-Level Flow

```
┌────────────────────────────────────────────────────────────┐
│                    User Input                              │
│              (Voice 🎤 or Text 💬)                        │
└───────────────────────┬────────────────────────────────────┘
                        ↓
         ┌──────────────────────────────┐
         │    Voice Handler (if voice)  │
         │    Whisper API → Text        │
         └──────────────┬───────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              CORE Agent (LangGraph Workflow)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1. Understand Intent]                                     │
│     ↓                                                       │
│  [2. Retrieve Memory] ← Vector DB (semantic search)        │
│     ↓                                                       │
│  [3. Route Data Sources]                                    │
│     ↓                                                       │
│  [4. Fetch Data] ← CONTEXT, PROFILE, VAULT, WORKING, LOGS  │
│     ↓                                                       │
│  [5. Should Delegate?]                                      │
│     ├─ Yes → [6. Call Sub-Agent] (@health/physician)       │
│     └─ No  → [7. Synthesize Direct]                        │
│                ↓                                            │
│  [8. Format Response] (citations + suggested actions)       │
│     ↓                                                       │
│  [9. Store Conversation] → Vector DB + Firestore           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────────────────────┐
         │  Voice Handler (if voice)    │
         │  TTS API → Audio             │
         └──────────────┬───────────────┘
                        ↓
┌────────────────────────────────────────────────────────────┐
│                    Response                                │
│              (Voice 🔊 or Text 💬)                        │
└────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Workflow Engine** | LangGraph | Stateful workflows with checkpointing |
| **Runtime** | Cloud Run (Python) | Auto-scaling, containerized |
| **State Storage** | Firestore | Persistent checkpoints |
| **Memory (Vector DB)** | Pinecone | Fast semantic search |
| **Embeddings** | text-embedding-3-small | Cost-effective, high quality |
| **LLM (Synthesis)** | Claude Sonnet 4 | Best reasoning, lowest cost |
| **Voice (Input)** | Whisper API | State-of-the-art transcription |
| **Voice (Output)** | OpenAI TTS | Natural voices, low latency |
| **Entity Extraction** | Claude Sonnet 4 (NER) | Identifies people, dates, events |

---

## 3. State Management

### CoreAgentState Schema

```python
from typing import TypedDict, List, Literal

class CoreAgentState(TypedDict):
    # ==================
    # User & Session
    # ==================
    user_id: str
    session_id: str
    timestamp: datetime

    # ==================
    # Input
    # ==================
    current_query: str
    input_mode: Literal["text", "voice"]
    raw_audio: bytes | None  # If voice input

    # ==================
    # Conversation History
    # ==================
    messages: List[Message]  # Full conversation
    """
    Message = {
        "role": "user" | "assistant",
        "content": str,
        "timestamp": datetime,
        "metadata": {...}
    }
    """

    # ==================
    # Memory (RAG)
    # ==================
    short_term_memory: List[str]  # Last 20 turns (in-context)
    relevant_history: List[ConversationTurn]  # Retrieved from vector DB
    entities: dict  # Tracked entities
    """
    entities = {
        "people": ["Alex", "Dr. Silva"],
        "dates": ["ontem", "2025-01-15"],
        "events": ["reunião", "consulta"],
        "health_metrics": ["colesterol", "glicose"]
    }
    """

    # ==================
    # Understanding
    # ==================
    intent: str
    """
    Possible intents:
    - health_query
    - finance_query
    - temporal_query ("o que fiz ontem?")
    - task_query ("você comprou?")
    - meta_query (questions about NOUS)
    """

    confidence: float  # Intent classification confidence (0-1)
    resolved_query: str  # Query with resolved references

    # ==================
    # Data Routing
    # ==================
    data_sources: List[str]
    """
    Examples:
    - "context:health.exams[latest]"
    - "profile.query:temporal:ontem"
    - "working.tasks"
    - "logs.agent_calls"
    """

    # ==================
    # Fetched Data
    # ==================
    fetched_data: dict
    """
    {
        "context:health.exams[latest]": {...},
        "profile.query:temporal:ontem": [...]
    }
    """

    # ==================
    # Delegation
    # ==================
    needs_delegation: bool
    delegated_to: str | None  # "@health/physician"
    delegation_input: dict | None
    delegation_result: str | None

    # ==================
    # Response
    # ==================
    response: str
    response_mode: Literal["text", "voice"]
    citations: List[str]  # Data sources used
    suggested_actions: List[dict]
    """
    suggested_actions = [
        {
            "label": "Ver detalhes",
            "action": "navigate",
            "target": "/dashboard/health/exams/123"
        },
        {
            "label": "Agendar check-up",
            "action": "call_agent",
            "agent": "@health/scheduler"
        }
    ]
    """

    # ==================
    # Metadata
    # ==================
    processing_time_ms: int
    cost_usd: float  # Total cost of this interaction
    tokens_used: dict  # {"input": X, "output": Y}
```

### State Persistence (Checkpointing)

CORE Agent uses LangGraph's checkpointing to persist state in Firestore:

```python
from langgraph.checkpoint import FirestoreCheckpointer

# Checkpoint configuration
checkpointer = FirestoreCheckpointer(
    collection="core_agent_checkpoints",
    ttl_days=30  # Keep checkpoints for 30 days
)

workflow.set_checkpoint(storage=checkpointer)
```

**Benefits:**
- State survives crashes/restarts
- Can pause and resume conversations
- Audit trail of all state transitions
- Debugging (replay conversations)

**Storage:**
```
/core_agent_checkpoints/{session_id}/
  ├─ checkpoints/ (collection)
  │   └─ {checkpoint_id} (document)
  │       ├─ state: CoreAgentState
  │       ├─ timestamp: datetime
  │       └─ node: str  # Which node was executing
```

---

## 4. Conversation Memory (RAG)

### Memory Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Conversation Memory System                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Short-term Memory (Session-based)            │
│  ├─ In-memory (RAM)                                     │
│  ├─ Last 20 turns                                       │
│  └─ TTL: Until session ends                             │
│                                                         │
│  Layer 2: Long-term Memory (Persistent)                 │
│  ├─ Firestore (structured storage)                      │
│  │   └─ Full conversation turns with metadata          │
│  │                                                      │
│  └─ Vector DB (semantic search)                         │
│      ├─ Embeddings of conversations                     │
│      └─ Fast similarity search                          │
│                                                         │
│  Layer 3: Entity Graph (Relationships)                  │
│  ├─ Entity extraction (NER)                             │
│  └─ Entity linking (coreference resolution)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// memory/conversation-memory.ts

export class ConversationMemory {
  private firestore: Firestore;
  private vectorDB: Pinecone;
  private embeddingsAPI: OpenAI;

  /**
   * Adds a conversation turn to memory
   */
  async addTurn(userId: string, turn: ConversationTurn): Promise<void> {
    const turnId = generateId();

    // 1. Store in Firestore (structured)
    await this.firestore
      .collection('users').doc(userId)
      .collection('memory')
      .collection('conversations')
      .doc(turnId)
      .set({
        timestamp: turn.timestamp,
        user_message: turn.user_message,
        nous_response: turn.nous_response,
        intent: turn.intent,
        entities: turn.entities,
        sources_used: turn.sources_used,
        cost_usd: turn.cost_usd
      });

    // 2. Generate embedding
    const text = `User: ${turn.user_message}\nNOUS: ${turn.nous_response}`;
    const embedding = await this.embeddingsAPI.createEmbedding({
      model: "text-embedding-3-small",
      input: text
    });

    // 3. Store in Vector DB (semantic search)
    await this.vectorDB.upsert({
      vectors: [{
        id: turnId,
        values: embedding.data[0].embedding,
        metadata: {
          userId,
          timestamp: turn.timestamp.toISOString(),
          intent: turn.intent,
          entities: JSON.stringify(turn.entities)
        }
      }]
    });
  }

  /**
   * Semantic search over conversation history
   */
  async searchRelevant(
    userId: string,
    query: string,
    topK: number = 5
  ): Promise<ConversationTurn[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.embeddingsAPI.createEmbedding({
      model: "text-embedding-3-small",
      input: query
    });

    // 2. Vector search
    const results = await this.vectorDB.query({
      vector: queryEmbedding.data[0].embedding,
      filter: { userId },
      topK,
      includeMetadata: true
    });

    // 3. Fetch full turns from Firestore
    const turns = await Promise.all(
      results.matches.map(match =>
        this.getTurn(userId, match.id)
      )
    );

    return turns;
  }

  /**
   * Temporal query ("o que fiz ontem?")
   */
  async queryTemporal(
    userId: string,
    timeframe: string  // "ontem", "semana passada", etc
  ): Promise<ConversationTurn[]> {
    const { start, end } = parseTimeframe(timeframe);

    return await this.firestore
      .collection('users').doc(userId)
      .collection('memory')
      .collection('conversations')
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .orderBy('timestamp', 'desc')
      .get()
      .then(snapshot =>
        snapshot.docs.map(doc => doc.data() as ConversationTurn)
      );
  }

  /**
   * Extract entities using NER (Named Entity Recognition)
   */
  async extractEntities(
    text: string,
    conversationHistory: Message[]
  ): Promise<EntityMap> {
    const response = await claude.messages.create({
      model: "claude-sonnet-4",
      messages: [
        {
          role: "user",
          content: `Extract entities from this text:

Text: "${text}"

Conversation history (for context):
${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Extract:
- PERSON: People mentioned
- DATE: Dates or temporal references ("ontem", "2025-01-15")
- EVENT: Events ("reunião", "consulta", "viagem")
- LOCATION: Places
- MONEY: Monetary amounts
- HEALTH_METRIC: Medical metrics ("colesterol", "pressão")

Return JSON: { "people": [], "dates": [], "events": [], ... }`
        }
      ]
    });

    return JSON.parse(response.content[0].text);
  }

  /**
   * Resolve references ("ele", "isso", "o anterior")
   */
  async resolveReferences(
    query: string,
    conversationHistory: Message[],
    entities: EntityMap
  ): Promise<string> {
    // If no pronouns/references, return original
    if (!hasReferences(query)) {
      return query;
    }

    // Use LLM to resolve
    const response = await claude.messages.create({
      model: "claude-sonnet-4",
      messages: [
        {
          role: "user",
          content: `Resolve references in this query:

Query: "${query}"

Recent conversation:
${conversationHistory.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

Entities mentioned:
${JSON.stringify(entities, null, 2)}

Replace pronouns and references with explicit entities.
Return only the resolved query text.

Examples:
- "E o anterior?" → "E o exame anterior ao de 2025-01-15?"
- "Quanto ele custou?" → "Quanto o medicamento Atorvastatina custou?"
`
        }
      ]
    });

    return response.content[0].text;
  }
}

// Helper: Parse natural language timeframes
function parseTimeframe(timeframe: string): { start: Date; end: Date } {
  const now = new Date();

  switch (timeframe.toLowerCase()) {
    case "ontem":
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { start: yesterday, end: yesterdayEnd };

    case "hoje":
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return { start: today, end: now };

    case "semana passada":
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return { start: weekAgo, end: now };

    case "mês passado":
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      monthAgo.setDate(1);
      monthAgo.setHours(0, 0, 0, 0);
      const monthEnd = new Date(now);
      monthEnd.setDate(0);  // Last day of previous month
      monthEnd.setHours(23, 59, 59, 999);
      return { start: monthAgo, end: monthEnd };

    default:
      // Try to parse as date
      const parsed = new Date(timeframe);
      if (!isNaN(parsed.getTime())) {
        const dayStart = new Date(parsed);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(parsed);
        dayEnd.setHours(23, 59, 59, 999);
        return { start: dayStart, end: dayEnd };
      }

      // Fallback: last 24 hours
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      return { start: oneDayAgo, end: now };
  }
}
```

### Vector DB Configuration

**Pinecone Setup:**
```python
import pinecone

pinecone.init(
    api_key=PINECONE_API_KEY,
    environment="us-west1-gcp"
)

# Create index
index = pinecone.Index("nous-conversation-memory")

# Upsert configuration
index.upsert(
    vectors=[{
        "id": turn_id,
        "values": embedding,  # 1536 dimensions
        "metadata": {
            "userId": user_id,
            "timestamp": iso_timestamp,
            "intent": intent,
            "entities": json_entities
        }
    }]
)

# Query configuration
results = index.query(
    vector=query_embedding,
    filter={"userId": {"$eq": user_id}},
    top_k=5,
    include_metadata=True
)
```

**Cost Estimate:**
- Storage: ~$70/month for 100K vectors (1536 dimensions)
- Queries: $0.04 per 1K queries
- For 1K users with avg 100 conversations each: ~$70-100/month

---

## 5. Intent Understanding

### Intent Classification

CORE Agent classifies user queries into intents to determine routing:

```python
async def understand_intent_node(state: CoreAgentState):
    """Classifies user intent using LLM"""

    query = state["current_query"]
    history = state["messages"][-5:]  # Last 5 for context

    # LLM prompt
    response = await claude.messages.create({
        model="claude-sonnet-4",
        messages=[{
            "role": "user",
            "content": f"""Classify the user's intent:

User query: "{query}"

Recent conversation:
{format_messages(history)}

Classify into ONE of these intents:
1. health_query - Questions about health, medical data, exams
2. finance_query - Questions about money, balance, transactions
3. temporal_query - Questions about past actions ("ontem", "semana passada")
4. task_query - Questions about tasks or actions ("você fez?", "comprou?")
5. meta_query - Questions about NOUS itself

Return JSON: {{"intent": "health_query", "confidence": 0.95}}
"""
        }]
    })

    result = json.loads(response.content[0].text)

    state["intent"] = result["intent"]
    state["confidence"] = result["confidence"]

    return state
```

### Intent Types

| Intent | Examples | Data Sources |
|--------|----------|--------------|
| **health_query** | "meu último exame", "colesterol está normal?" | context:health.*, profile.query:health |
| **finance_query** | "quanto tenho na conta?", "gastei quanto ontem?" | context:finance.*, logs.transactions |
| **temporal_query** | "o que fiz ontem?", "conversamos sobre o quê?" | profile.query:temporal, logs.* |
| **task_query** | "você comprou a passagem?", "agendou a consulta?" | working.tasks, logs.agent_calls |
| **meta_query** | "o que você sabe fazer?", "como funciona?" | Internal documentation |

---

## 6. Data Source Routing

### Intelligent Routing Logic

```python
async def route_data_sources_node(state: CoreAgentState):
    """Decides WHERE to look for data based on intent and query"""

    intent = state["intent"]
    query = state["current_query"]
    entities = state["entities"]

    sources = []

    # ==================
    # HEALTH QUERIES
    # ==================
    if intent == "health_query":
        # Latest data requested
        if any(kw in query for kw in ["último", "recente", "atual"]):
            if "exame" in query:
                sources.append("context:health.exams[latest]")
            elif "medicação" in query or "remédio" in query:
                sources.append("context:health.medications")
            else:
                sources.append("context:health.*")

        # Historical data requested
        elif any(kw in query for kw in ["histórico", "todos", "anteriores"]):
            sources.append("profile.query:health_history")
            sources.append("context:health.exams")  # All exams

        # Specific metric requested
        elif any(metric in query for metric in ["colesterol", "glicose", "pressão"]):
            sources.append("context:health.bloodwork")

        # Default: all health context
        else:
            sources.append("context:health.*")

    # ==================
    # FINANCE QUERIES
    # ==================
    elif intent == "finance_query":
        # Balance requested
        if any(kw in query for kw in ["saldo", "tenho", "conta"]):
            sources.append("context:finance.balance")

        # Spending requested
        elif any(kw in query for kw in ["gastei", "gastou", "despesa"]):
            # Check timeframe
            if "ontem" in query:
                sources.append("context:finance.transactions[yesterday]")
            elif "mês" in query:
                sources.append("context:finance.transactions[this_month]")
            else:
                sources.append("context:finance.transactions[recent]")

        # Budget/categories
        elif "categoria" in query or "orçamento" in query:
            sources.append("context:finance.budget")
            sources.append("context:finance.transactions[this_month]")

    # ==================
    # TEMPORAL QUERIES
    # ==================
    elif intent == "temporal_query":
        # Extract timeframe
        timeframe = extract_timeframe(query)  # "ontem", "semana passada", etc

        sources.append(f"profile.query:temporal:{timeframe}")
        sources.append(f"logs.agent_calls:{timeframe}")
        sources.append(f"logs.system:{timeframe}")

    # ==================
    # TASK QUERIES
    # ==================
    elif intent == "task_query":
        sources.append("working.tasks")
        sources.append("logs.agent_calls")

        # If specific agent mentioned, filter
        if "@" in query:
            agent_name = extract_agent_name(query)
            sources.append(f"logs.agent_calls[agent={agent_name}]")

    # ==================
    # META QUERIES
    # ==================
    elif intent == "meta_query":
        sources.append("internal:capabilities")
        sources.append("internal:installed_agents")

    state["data_sources"] = sources
    return state
```

### Data Source Syntax

| Syntax | Meaning | Example |
|--------|---------|---------|
| `context:path` | Load from CONTEXT | `context:health.bloodwork` |
| `context:domain.*` | Load all from domain | `context:health.*` |
| `context:path[filter]` | Filter results | `context:health.exams[latest]` |
| `profile.query:type` | Query PROFILE | `profile.query:health_history` |
| `profile.query:temporal:time` | Temporal query | `profile.query:temporal:ontem` |
| `working.tasks` | Active tasks | `working.tasks` |
| `logs.type` | Query logs | `logs.agent_calls` |
| `logs.type:timeframe` | Logs with time filter | `logs.agent_calls:yesterday` |
| `vault:path` | Files in VAULT | `vault:health/exams/*.pdf` |

---

## 7. Voice Interface

### Architecture

```
┌────────────────────────────────────────────────┐
│           Voice Input Flow                     │
├────────────────────────────────────────────────┤
│                                                │
│  User speaks → Microphone                      │
│       ↓                                        │
│  Web Audio API (browser)                       │
│       ↓                                        │
│  Audio blob (WebM/OGG format)                  │
│       ↓                                        │
│  Upload to backend                             │
│       ↓                                        │
│  Whisper API (transcription)                   │
│       ↓                                        │
│  Text → CORE Agent                             │
│                                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│          Voice Output Flow                     │
├────────────────────────────────────────────────┤
│                                                │
│  CORE Agent → Text response                    │
│       ↓                                        │
│  OpenAI TTS API                                │
│       ↓                                        │
│  Audio blob (MP3 format)                       │
│       ↓                                        │
│  Stream to frontend                            │
│       ↓                                        │
│  HTML5 Audio API (playback)                    │
│       ↓                                        │
│  User hears response                           │
│                                                │
└────────────────────────────────────────────────┘
```

### Frontend Implementation

```typescript
// components/VoiceInput.tsx

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);

        // Send to backend for transcription
        const text = await transcribeAudio(blob);
        onTranscript(text);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={isRecording ? 'recording' : ''}
    >
      {isRecording ? '🎤 Recording...' : '🎤 Hold to speak'}
    </button>
  );
}

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  const response = await fetch('/api/voice/transcribe', {
    method: 'POST',
    body: formData
  });

  const { text } = await response.json();
  return text;
}
```

### Backend Implementation

```python
# api/voice.py (Firebase Functions)

from openai import OpenAI
import tempfile

client = OpenAI(api_key=OPENAI_API_KEY)

@https_fn.on_request()
def transcribe_audio(req: https_fn.Request) -> https_fn.Response:
    """Transcribe audio to text using Whisper API"""

    # Get audio from request
    audio_file = req.files['audio']

    # Save to temp file (Whisper API requires file)
    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp:
        audio_file.save(temp.name)
        temp_path = temp.name

    try:
        # Transcribe using Whisper
        with open(temp_path, 'rb') as audio:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                language="pt"  # Portuguese
            )

        return {"text": transcript.text}

    finally:
        # Cleanup
        os.unlink(temp_path)

@https_fn.on_request()
def synthesize_speech(req: https_fn.Request) -> https_fn.Response:
    """Convert text to speech using OpenAI TTS"""

    text = req.json['text']
    voice = req.json.get('voice', 'alloy')  # alloy, echo, fable, onyx, nova, shimmer

    # Generate speech
    response = client.audio.speech.create(
        model="tts-1-hd",
        voice=voice,
        input=text,
        speed=1.0
    )

    # Stream audio back
    return Response(
        response.content,
        mimetype='audio/mpeg'
    )
```

### Voice Configuration

```yaml
voice_settings:
  input:
    model: whisper-1
    language: pt-BR
    quality: high

  output:
    model: tts-1-hd  # High definition
    voice: alloy  # Default voice (can be customized per user)
    speed: 1.0
    format: mp3

  cost_per_interaction:
    transcription: ~$0.006 per minute
    synthesis: ~$0.015 per 1K characters
    average_interaction: ~$0.05 (5min audio + 300 chars response)
```

---

## 8. Sub-Agent Delegation

### When to Delegate

CORE Agent only delegates to specialist sub-agents when:

1. **Complex analysis required** (medical interpretation, financial planning)
2. **Specialized knowledge needed** (domain expertise)
3. **User explicitly requests** ("analise meus exames", "me dá um conselho financeiro")

**Rule:** If CORE can answer with simple data retrieval + synthesis, it does NOT delegate.

### Delegation Logic

```python
def should_delegate_node(state: CoreAgentState) -> str:
    """Decides if delegation is needed"""

    intent = state["intent"]
    query = state["current_query"]
    confidence = state["confidence"]

    # Low confidence → delegate to be safe
    if confidence < 0.7:
        return "delegate"

    # Health: Complex analysis keywords
    if intent == "health_query":
        complex_keywords = [
            "analise", "análise", "interpreta", "significa",
            "recomenda", "devo", "é normal", "preocupante"
        ]
        if any(kw in query.lower() for kw in complex_keywords):
            state["delegated_to"] = "@health/physician"
            return "delegate"

    # Finance: Advisory keywords
    if intent == "finance_query":
        advisory_keywords = [
            "investir", "aplicar", "conselho", "recomenda",
            "devo", "vale a pena", "melhor opção"
        ]
        if any(kw in query.lower() for kw in advisory_keywords):
            state["delegated_to"] = "@finance/advisor"
            return "delegate"

    # Default: CORE synthesizes directly
    return "synthesize"
```

### Delegation Execution

```python
async def delegate_to_specialist_node(state: CoreAgentState):
    """Calls specialist sub-agent"""

    agent_name = state["delegated_to"]

    # Load agent manifest
    agent_config = await load_agent_manifest(agent_name)

    # Prepare input
    delegation_input = {
        "query": state["current_query"],
        "context": state["fetched_data"],
        "conversation_history": state["messages"][-5:],
        "entities": state["entities"]
    }

    # Execute agent
    result = await execute_agent(
        agent=agent_config,
        user_id=state["user_id"],
        input=delegation_input
    )

    state["delegation_result"] = result.response
    state["cost_usd"] += result.cost

    # Log delegation
    await log_agent_call({
        "type": "delegation",
        "from": "core_agent",
        "to": agent_name,
        "input": delegation_input,
        "result": result.response,
        "cost": result.cost,
        "duration_ms": result.duration
    })

    return state
```

---

## 9. Implementation Guide

### Phase 0: Foundation (Week 1-2)

**Setup:**
```bash
# Create project structure
mkdir -p packages/core-agent/{src,tests}
cd packages/core-agent

# Install dependencies
pnpm add langgraph openai anthropic-sdk pinecone-client firebase-admin
pnpm add -D pytest pytest-asyncio

# Initialize
touch src/__init__.py
touch src/workflow.py
touch src/memory.py
touch src/voice.py
```

**Core Workflow:**
```python
# src/workflow.py

from langgraph.graph import StateGraph
from .state import CoreAgentState
from .nodes import *

def create_core_agent_workflow() -> StateGraph:
    """Creates the CORE Agent workflow"""

    workflow = StateGraph(CoreAgentState)

    # Add nodes
    workflow.add_node("understand_intent", understand_intent_node)
    workflow.add_node("retrieve_memory", retrieve_memory_node)
    workflow.add_node("route_data", route_data_sources_node)
    workflow.add_node("fetch_data", fetch_data_node)
    workflow.add_node("delegate", delegate_to_specialist_node)
    workflow.add_node("synthesize", synthesize_response_node)
    workflow.add_node("store_conversation", store_conversation_node)

    # Add edges
    workflow.set_entry_point("understand_intent")
    workflow.add_edge("understand_intent", "retrieve_memory")
    workflow.add_edge("retrieve_memory", "route_data")
    workflow.add_edge("route_data", "fetch_data")

    # Conditional routing
    workflow.add_conditional_edges(
        "fetch_data",
        should_delegate_node,
        {
            "delegate": "delegate",
            "synthesize": "synthesize"
        }
    )

    workflow.add_edge("delegate", "synthesize")
    workflow.add_edge("synthesize", "store_conversation")
    workflow.set_finish_point("store_conversation")

    # Checkpointing
    from langgraph.checkpoint.firebase import FirestoreCheckpointer
    workflow.set_checkpoint(storage=FirestoreCheckpointer())

    return workflow.compile()

# Create singleton instance
core_agent = create_core_agent_workflow()
```

### Phase 1: Memory System (Week 3-4)

**Vector DB Setup:**
```python
# scripts/setup_pinecone.py

import pinecone

pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="us-west1-gcp"
)

# Create index
pinecone.create_index(
    name="nous-conversation-memory",
    dimension=1536,  # text-embedding-3-small
    metric="cosine",
    pod_type="p1.x1"  # $70/month
)

print("✅ Pinecone index created")
```

**Memory Integration:**
```python
# src/memory.py

from pinecone import Pinecone
from openai import OpenAI

class ConversationMemory:
    def __init__(self):
        self.pinecone = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pinecone.Index("nous-conversation-memory")
        self.openai = OpenAI(api_key=OPENAI_API_KEY)

    async def add_turn(self, user_id: str, turn: dict):
        # Implementation from Section 4
        pass

    async def search_relevant(self, user_id: str, query: str, top_k: int = 5):
        # Implementation from Section 4
        pass

# Singleton
memory = ConversationMemory()
```

### Phase 2: Voice Support (Week 5)

**API Endpoints:**
```python
# functions/src/api/voice.py

@functions_framework.http
def voice_interaction(request):
    """Full voice interaction endpoint"""

    # 1. Transcribe
    audio_blob = request.files['audio']
    transcript = transcribe_audio(audio_blob)

    # 2. Execute CORE Agent
    response_text = core_agent.execute({
        "user_id": request.json['user_id'],
        "session_id": request.json['session_id'],
        "current_query": transcript,
        "input_mode": "voice"
    })

    # 3. Synthesize
    audio_response = synthesize_speech(response_text)

    return {
        "text": response_text,
        "audio": audio_response
    }
```

---

## 10. Cost Analysis

### Per-Interaction Costs

```yaml
Typical Interaction:
  input:
    voice: 30 seconds audio
    transcription: $0.003

  core_agent:
    intent_classification:
      model: claude-sonnet-4
      tokens: ~500 input
      cost: $0.0015

    memory_retrieval:
      embeddings: 1 query
      cost: ~$0.00002
      vector_search: 1 query
      cost: ~$0.00004

    data_fetching:
      firestore_reads: 3 documents
      cost: ~$0.000001

    synthesis:
      model: claude-sonnet-4
      tokens: ~1000 input, ~300 output
      cost: $0.0075

  output:
    voice: 200 characters
    synthesis: $0.003

TOTAL PER INTERACTION: ~$0.015 (~R$ 0.08)
```

### Monthly Cost Projections

```yaml
1,000 Users:
  avg_interactions_per_day: 5
  total_interactions_per_month: 150,000

  costs:
    llm: $2,250  # (150K * $0.015)
    vector_db: $70  # Pinecone fixed
    firestore: $50  # Reads/writes
    cloud_run: $100  # Compute

  TOTAL: ~$2,470/month
  Cost per user: $2.47/month

10,000 Users:
  avg_interactions_per_day: 5
  total_interactions_per_month: 1,500,000

  costs:
    llm: $22,500
    vector_db: $700  # Scale up
    firestore: $500
    cloud_run: $1,000

  TOTAL: ~$24,700/month
  Cost per user: $2.47/month

MARGIN ANALYSIS:
  subscription: $19/month
  cost_per_user: $2.47/month
  GROSS MARGIN: 87% 💰
```

---

## 11. Testing Strategy

### Unit Tests

```python
# tests/test_intent.py

import pytest
from src.workflow import core_agent
from src.state import CoreAgentState

@pytest.mark.asyncio
async def test_intent_classification():
    state = CoreAgentState(
        user_id="test_user",
        session_id="test_session",
        current_query="Me fala meu último exame de sangue",
        messages=[]
    )

    result = await understand_intent_node(state)

    assert result["intent"] == "health_query"
    assert result["confidence"] > 0.8

@pytest.mark.asyncio
async def test_reference_resolution():
    state = CoreAgentState(
        user_id="test_user",
        messages=[
            {"role": "user", "content": "Me fala meu último exame"},
            {"role": "assistant", "content": "Seu último exame foi em 15/01/2025..."}
        ],
        current_query="E o anterior?"
    )

    result = await retrieve_memory_node(state)

    assert "2025-01-15" in result["resolved_query"]
    assert result["resolved_query"] != state["current_query"]
```

### Integration Tests

```python
# tests/test_full_flow.py

@pytest.mark.asyncio
async def test_full_conversation_flow():
    # Turn 1
    response1 = await core_agent.execute({
        "user_id": "test_user",
        "session_id": "test_session",
        "current_query": "Quanto eu tenho na conta?",
        "messages": []
    })

    assert "saldo" in response1["response"].lower()
    assert response1["intent"] == "finance_query"

    # Turn 2 (with reference)
    response2 = await core_agent.execute({
        "user_id": "test_user",
        "session_id": "test_session",
        "current_query": "E ontem, gastei quanto?",
        "messages": response1["messages"]
    })

    assert "gastou" in response2["response"].lower()
    assert response2["intent"] == "finance_query"
```

### Voice Tests

```python
# tests/test_voice.py

@pytest.mark.asyncio
async def test_voice_transcription():
    with open("tests/fixtures/audio_sample.webm", "rb") as f:
        audio_blob = f.read()

    text = await transcribe_audio(audio_blob)

    assert len(text) > 0
    assert isinstance(text, str)

@pytest.mark.asyncio
async def test_voice_synthesis():
    text = "Seu último exame de sangue foi em 15 de janeiro."

    audio = await synthesize_speech(text)

    assert len(audio) > 0
    assert audio[:4] == b'ID3\x04'  # MP3 signature
```

---

## Summary

CORE Agent transforms NOUS from a stateless dispatcher into a **conversational AI with memory**:

✅ **Stateful:** Maintains context across conversations
✅ **Memory-enabled:** RAG with vector search (Supermemory.ai-inspired)
✅ **Voice-first:** Native Whisper + TTS support
✅ **Intelligent routing:** Knows WHERE to search (CONTEXT, PROFILE, VAULT, LOGS)
✅ **Reference resolution:** Understands "ele", "isso", "o anterior"
✅ **Selective delegation:** Only calls sub-agents when necessary
✅ **Cost-effective:** ~$0.015 per interaction (~87% margin at $19/month)

**Next Steps:**
1. Implement Phase 0 (Foundation) - Weeks 1-2
2. Add Memory System - Weeks 3-4
3. Integrate Voice - Week 5
4. Deploy to Cloud Run - Week 6
5. Load testing & optimization - Week 7-8

**This is the foundation for NOUS OS's conversational intelligence.**
