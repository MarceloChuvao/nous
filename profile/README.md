# PROFILE - Personal Life API

> **Inspirado em:** Daniel Miessler's "daemon API" (Personal AI Infrastructure)
>
> **Objetivo:** Criar um banco de dados queryável da sua vida inteira - acessível via API para agents e NOUS

---

## O que é PROFILE?

**PROFILE** é uma API pessoal que responde perguntas sobre VOCÊ e sua VIDA.

**Problema que resolve:**

Sem PROFILE:
- "Qual foi minha conclusão da reunião com o cliente X?" → Não lembro
- "Quando foi a última vez que falei com Y?" → Preciso procurar
- "O que eu estava pensando sobre Z em 2023?" → Perdido

Com PROFILE:
- `profile.query("meeting with client X")` → Resposta em segundos
- Histórico completo de interações, pensamentos, decisões
- **Queryável como um banco de dados**

---

## Arquitetura

```
PROFILE (API Layer)
├── Life Log (eventos da vida)
│   ├── Meetings (gravações + transcrições)
│   ├── Conversations (chat logs)
│   ├── Decisions (decisões importantes)
│   └── Thoughts (journal entries)
│
├── Identity Data (quem você é)
│   ├── Values (o que importa)
│   ├── Skills (o que você sabe fazer)
│   ├── Relationships (quem você conhece)
│   └── Goals (o que você quer)
│
├── Historical Context (linha do tempo)
│   ├── Timeline (eventos cronológicos)
│   ├── Milestones (marcos importantes)
│   └── Changes (como você evoluiu)
│
└── Query Interface (como acessar)
    ├── Natural Language API
    ├── Structured Queries
    └── Vector Search
```

---

## Fontes de Dados

### 1. Life Log Sources

```yaml
life_log_sources:
  meetings:
    - provider: "limitless_ai"
      description: "Gravações automáticas de reuniões"
      data: "transcrições + audio"
      retention: "indefinido"

    - provider: "zoom"
      description: "Transcrições de calls"
      data: "transcript + recording"
      retention: "90 dias"

  conversations:
    - provider: "nous_chat"
      description: "Todas conversas com NOUS"
      data: "completa"
      retention: "indefinido"

    - provider: "email"
      description: "Emails importantes"
      data: "metadata + body"
      retention: "filtrado"

  thoughts:
    - provider: "journal"
      description: "Entradas de diário"
      data: "texto completo"
      retention: "indefinido"

    - provider: "notes"
      description: "Notas rápidas"
      data: "texto + tags"
      retention: "indefinido"
```

### 2. Integrations

```typescript
// Firebase Functions: Sync life log sources

export const syncLifeLogs = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    // 1. Limitless AI meetings
    const meetings = await limitless.getRecentMeetings();
    await db.collection('profile').doc('life_log').collection('meetings').add({
      timestamp: meeting.date,
      title: meeting.title,
      participants: meeting.participants,
      transcript: meeting.transcript,
      duration_minutes: meeting.duration,
      key_points: await extractKeyPoints(meeting.transcript),
      action_items: await extractActionItems(meeting.transcript)
    });

    // 2. Email (Gmail API)
    const emails = await gmail.getImportantEmails();
    await db.collection('profile').doc('life_log').collection('emails').add({
      timestamp: email.date,
      from: email.from,
      subject: email.subject,
      summary: await summarizeEmail(email.body),
      category: await categorizeEmail(email)
    });

    // 3. Journal entries (manual)
    // 4. Notes (Notion/Obsidian sync)
  });
```

---

## Query Interface

### Natural Language API

```typescript
// profile/api.ts

export class ProfileAPI {
  /**
   * Query profile usando linguagem natural
   */
  static async query(userId: string, question: string): Promise<ProfileResponse> {
    // 1. Parse question
    const intent = await parseIntent(question);
    // Ex: "meeting with Alex" → intent: { type: "meeting_search", entity: "Alex" }

    // 2. Route to appropriate data source
    switch (intent.type) {
      case 'meeting_search':
        return await this.searchMeetings(userId, intent);

      case 'decision_history':
        return await this.searchDecisions(userId, intent);

      case 'relationship_info':
        return await this.getRelationshipInfo(userId, intent);

      case 'timeline_query':
        return await this.queryTimeline(userId, intent);

      default:
        return await this.vectorSearch(userId, question);
    }
  }

  /**
   * Search meetings
   */
  static async searchMeetings(
    userId: string,
    intent: { entity: string; timeframe?: string }
  ): Promise<MeetingSearchResult> {
    const meetings = await db
      .collection('users').doc(userId)
      .collection('profile')
      .doc('life_log')
      .collection('meetings')
      .where('participants', 'array-contains', intent.entity)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    return {
      type: 'meetings',
      count: meetings.size,
      results: meetings.docs.map(doc => ({
        date: doc.data().timestamp,
        title: doc.data().title,
        key_points: doc.data().key_points,
        action_items: doc.data().action_items,
        transcript_excerpt: doc.data().transcript.substring(0, 500)
      }))
    };
  }

  /**
   * Vector search (quando query é genérica)
   */
  static async vectorSearch(
    userId: string,
    question: string
  ): Promise<VectorSearchResult> {
    // Use Firestore Vector Search ou Pinecone
    const embedding = await generateEmbedding(question);

    const results = await db
      .collection('users').doc(userId)
      .collection('profile')
      .doc('embeddings')
      .collection('life_log_vectors')
      .orderBy(vector_distance(embedding), 'asc')
      .limit(5)
      .get();

    return {
      type: 'vector_search',
      results: results.docs.map(doc => ({
        source: doc.data().source,
        timestamp: doc.data().timestamp,
        content: doc.data().content,
        relevance_score: doc.data().similarity
      }))
    };
  }
}
```

### Exemplo de Uso Real (Daniel Miessler)

**Query:**
```typescript
profile.query("What was my takeaway from the last meeting with Alex Hormozi?")
```

**Processo (20 segundos):**
1. Parse: "meeting" + "Alex Hormozi" + "takeaway"
2. Search: `meetings.where('participants', 'array-contains', 'Alex Hormozi')`
3. Extract: Latest meeting transcript
4. Synthesize: LLM extracts key takeaway
5. Return: "Three-part approach: (1) Begin with objections, (2) Use bullet stacking, (3) Maintain laid-back approach"

**Zero context prévio necessário** - PROFILE tem tudo!

---

## Estrutura Firestore

```
users/{userId}/
  └── profile/
      ├── identity (document)
      │   ├── values: ["privacy", "family", "learning"]
      │   ├── skills: [{"name": "Python", "level": "expert"}]
      │   └── relationships: [...]
      │
      ├── life_log/ (collection)
      │   ├── meetings/
      │   │   └── {meetingId}/
      │   │       ├── timestamp
      │   │       ├── title
      │   │       ├── participants []
      │   │       ├── transcript (full text)
      │   │       ├── key_points []
      │   │       ├── action_items []
      │   │       └── decisions_made []
      │   │
      │   ├── conversations/
      │   │   └── {conversationId}/
      │   │       ├── timestamp
      │   │       ├── with: "NOUS" | "human"
      │   │       ├── summary
      │   │       └── full_text
      │   │
      │   ├── decisions/
      │   │   └── {decisionId}/
      │   │       ├── timestamp
      │   │       ├── decision: "Accepted job offer at Company X"
      │   │       ├── reasoning: "Better growth opportunity"
      │   │       ├── alternatives_considered []
      │   │       └── outcome: "Success" | "Regret" | "Unknown"
      │   │
      │   └── thoughts/
      │       └── {thoughtId}/
      │           ├── timestamp
      │           ├── type: "journal" | "note" | "idea"
      │           ├── content
      │           └── tags []
      │
      ├── timeline/ (collection)
      │   └── {year}/
      │       └── {month}/
      │           └── events []
      │
      └── embeddings/ (collection)
          └── life_log_vectors/
              └── {vectorId}/
                  ├── source: "meeting:abc123"
                  ├── timestamp
                  ├── content
                  └── embedding [1536 floats]
```

---

## Agents Acessando PROFILE

```python
# agents/health/physician.py

class PhysicianAgent(Agent):
    async def _execute(self, user_id, input):
        # 1. Check if user mentioned past health events
        if "last time" in input.lower() or "when did" in input.lower():
            # Query PROFILE
            past_events = await self.profile_api.query(
                user_id,
                f"health-related events: {input}"
            )

            # Ex: "When was my last checkup?"
            # → PROFILE returns: "2024-10-15 - Dr. Smith - Annual checkup - All normal"

        # 2. Load current health context
        health_context = await self.load_context(user_id, "health")

        # 3. Combine: PROFILE (historical) + CONTEXT (current)
        return await self.llm.synthesize({
            "historical": past_events,
            "current": health_context,
            "question": input
        })
```

**Diferença:**
- **CONTEXT** = Estado atual (medicações atuais, último exame)
- **PROFILE** = História completa (todos os exames, todas decisões)

---

## Example Queries

```typescript
// 1. Meeting extraction
profile.query("What did John say about the budget in our last meeting?")
// → Returns: Exact quote + context from transcript

// 2. Decision history
profile.query("Why did I decide to move to São Paulo in 2022?")
// → Returns: Decision log entry with reasoning

// 3. Relationship info
profile.query("When was the last time I talked to Maria?")
// → Returns: Most recent conversation (email, meeting, or chat)

// 4. Timeline
profile.query("What was I working on in January 2024?")
// → Returns: Projects, meetings, journal entries from that month

// 5. Pattern detection
profile.query("How many times have I mentioned burnout in the last year?")
// → Vector search across all logs

// 6. Synthesis
profile.query("Summarize my career progression over the last 5 years")
// → LLM synthesizes from timeline + decisions + meetings
```

---

## Auto-Population (Passive Data Collection)

```yaml
automatic_population:
  # Sem ação manual do usuário

  1_nous_conversations:
    source: "Firestore logs"
    frequency: "real-time"
    processing: "Cada conversa → summary → PROFILE"

  2_meeting_recordings:
    source: "Limitless AI / Zoom"
    frequency: "após cada meeting"
    processing: "Transcript → key points → action items → PROFILE"

  3_emails:
    source: "Gmail API"
    frequency: "hourly"
    processing: "Important emails → summary → PROFILE"

  4_calendar_events:
    source: "Google Calendar"
    frequency: "real-time"
    processing: "Events → timeline → PROFILE"

  5_location_history:
    source: "Google Location History (opt-in)"
    frequency: "daily"
    processing: "Places visited → timeline → PROFILE"
```

**Resultado:** PROFILE cresce automaticamente, sem esforço.

---

## Privacy & Security

```yaml
profile_privacy:
  storage:
    - Firebase (encrypted at rest)
    - Only user has access
    - Agents require explicit permission

  data_retention:
    - User controls what goes in PROFILE
    - User can delete anything anytime
    - Automatic anonymization of PII after X years (optional)

  access_control:
    - Agents declare: profile_permissions: ["meetings", "decisions"]
    - User approves on agent install
    - Audit log: who accessed what when

  export:
    - Full export to JSON
    - Portable to other systems
    - GDPR/LGPD compliant
```

---

## UI: Profile Explorer

```typescript
// app/dashboard/profile/page.tsx

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Life Profile</h1>

      {/* Timeline View */}
      <Timeline data={profileData.timeline} />

      {/* Quick Stats */}
      <StatsGrid>
        <Stat label="Meetings This Month" value={42} />
        <Stat label="Decisions Logged" value={137} />
        <Stat label="Journal Entries" value={89} />
      </StatsGrid>

      {/* Search Interface */}
      <SearchBox
        placeholder="Ask anything about your life..."
        onQuery={async (q) => {
          const result = await profile.query(q);
          setResults(result);
        }}
      />

      {/* Recent Activity */}
      <RecentActivity items={profileData.recent} />
    </div>
  );
}
```

---

## Integration with NOUS Agents

```yaml
# Agents automaticamente consultam PROFILE quando necessário

Example:
  User: "Devo aceitar esta proposta de emprego?"

  NOUS @life/advisor:
    1. Load context:goals.career (objetivos atuais)
    2. Query profile.query("past job decisions and outcomes")
    3. Query profile.query("what I value most in work")
    4. Synthesize: goals + history + values → recommendation
```

**Poder:** NOUS não apenas sabe seu estado ATUAL (CONTEXT), mas toda sua HISTÓRIA (PROFILE).

---

## Roadmap

### MVP (Fase 1)
- ✅ Basic PROFILE structure (Firestore)
- ✅ Sync NOUS conversations
- ✅ Manual decision logging
- ✅ Simple query API

### Fase 2
- ✅ Limitless AI integration (meetings)
- ✅ Gmail integration (emails)
- ✅ Calendar integration (timeline)
- ✅ Vector search

### Fase 3
- ✅ Auto-extraction (AI extracts decisions from conversations)
- ✅ Pattern detection (recurring themes)
- ✅ Relationship graph (network analysis)
- ✅ Predictive insights ("Based on past decisions, you typically...")

---

## Comparison: PROFILE vs CONTEXT

| Aspect | CONTEXT | PROFILE |
|--------|---------|---------|
| **Timeframe** | Current state | Complete history |
| **Example** | "Current medications" | "All medications ever taken" |
| **Update frequency** | As needed | Continuous (auto-populated) |
| **Structure** | Structured (health/, finance/) | Timeline + searchable logs |
| **Query method** | Direct access (path) | API query (natural language) |
| **Use case** | Agent needs current data | Agent needs historical data |

**Ambos são complementares:**
- CONTEXT = O que **é** agora
- PROFILE = Como **chegou** até aqui

---

## Real-World Impact: Daniel Miessler Example

**Before PROFILE:**
- "What did Alex say about marketing?" → Can't remember, need to search emails/notes

**After PROFILE:**
- `profile.query("Alex Hormozi marketing advice")` → Instant answer from meeting transcript
- **20 seconds** from question to precise answer
- **Zero manual searching**

**PROFILE = Queryable memory of your entire life**

---

**Documentação completa:** Este arquivo + implementação em Firebase Functions
