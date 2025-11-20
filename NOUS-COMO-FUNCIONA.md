# 🎤 Como NOUS OS Funciona: Da Voz aos Agentes

> **Guia Completo:** Como o NOUS OS opera desde a interação por voz até a execução pelos agentes

---

## 1. Interação por Voz (Voice-First)

### Como você interage:

```
VOCÊ → 🎤 Fala com NOUS
       ↓
NOUS → 🔊 Responde por voz ou texto
```

### Exemplo Real:

**Cenário 1: Pergunta simples**
```
👤 VOCÊ (voz): "NOUS, qual foi meu último exame de sangue?"

🎤 Whisper API transcreve: "NOUS, qual foi meu último exame de sangue?"

🧠 CORE Agent processa:
   1. Entende: health_query + temporal (último)
   2. Busca em: context:health.bloodwork[latest]
   3. Encontra: Exame de 15/01/2025
   4. Sintetiza resposta

🔊 NOUS responde (voz):
"Seu último exame foi em 15 de janeiro. Colesterol 185, glicose 92,
tudo dentro do normal. Quer que eu mostre os detalhes completos?"
```

---

## 2. CORE Agent: O "Cérebro" do NOUS

O CORE Agent é quem você fala diretamente. Ele é **stateful** (tem memória) e sabe onde procurar informações.

### Fluxo Interno do CORE Agent:

```
┌────────────────────────────────────────────────────┐
│  VOCÊ: "O que eu fiz ontem?"                       │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  PASSO 1: Entender Intenção (Intent)               │
│  ├─ Tipo: temporal_query                           │
│  ├─ Timeframe: "ontem" = 2025-01-18                │
│  └─ Entidades: [DATE: ontem]                       │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  PASSO 2: Memória (RAG - Retrieval)                │
│  ├─ Busca conversas passadas similares             │
│  ├─ Resolve referências ("ontem")                  │
│  └─ Carrega contexto relevante                     │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  PASSO 3: Decidir ONDE Buscar                      │
│  ├─ PROFILE (histórico temporal)                   │
│  ├─ LOGS (ações registradas)                       │
│  └─ CONTEXT (estado recente)                       │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  PASSO 4: Buscar Dados                             │
│  profile.query("temporal:2025-01-18")              │
│  Resultado:                                        │
│  - 09h: Reunião com cliente X                     │
│  - 14h: Academia (45min)                           │
│  - 20h: Jantar com Maria                           │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  PASSO 5: Sintetizar Resposta                      │
│  "Ontem você teve reunião com cliente X de manhã,  │
│   foi na academia à tarde, e jantou com Maria."    │
└────────────────────────────────────────────────────┘
```

### Quando CORE Agent Delega para Sub-Agentes:

```
👤 VOCÊ: "Analisa meus exames e me diz se está tudo ok"

🧠 CORE Agent:
   1. ❌ Não é pergunta simples
   2. ✅ Requer análise médica especializada
   3. 🤖 DELEGA para @health/physician

@health/physician (Sub-Agent):
   1. Carrega context:health.bloodwork
   2. Carrega context:health.exams
   3. Carrega context:health.medications
   4. Analisa todos os dados
   5. Gera assessment completo (usando template health-assessment)
   6. Retorna para CORE Agent

🧠 CORE Agent:
   - Recebe análise do @health/physician
   - Sintetiza em linguagem simples
   - Responde por voz
```

---

## 3. Tipos de Agentes no NOUS

### 3.1 CORE Agent (Único)

**O que faz:**
- Interface conversacional (você fala com ele)
- Mantém memória da conversa
- Entende contexto e referências ("ele", "isso", "o anterior")
- Sabe ONDE procurar informações
- Delega para especialistas quando necessário

**Exemplo:**
```
👤 "Quanto eu gastei no supermercado mês passado?"

🧠 CORE Agent (resolve sozinho):
   - Busca: context:finance.transactions
   - Filtra: categoria="supermercado" + mês=dezembro
   - Soma: R$ 1,850
   - Responde: "Você gastou R$ 1.850 no supermercado em dezembro"
```

---

### 3.2 Sub-Agents (Especializados)

**O que são:**
Agentes especializados em domínios específicos. São chamados apenas quando necessário.

#### Exemplo: @health/physician

**Quando é chamado:**
- Análise complexa de exames
- Comparação histórica de métricas
- Recomendações de saúde

**Exemplo de Delegação:**
```
👤 "Meu colesterol está bom?"

🧠 CORE Agent:
   ❓ Pergunta simples ou complexa?
   ✅ Simples! Apenas comparar valor com range normal.

   Busca: context:health.bloodwork[latest].cholesterol = 185
   Compara: Normal range <200
   Responde: "Sim, seu colesterol está em 185, dentro do normal (<200)"

---

👤 "Analisa meu colesterol nos últimos 2 anos e me diz se estou melhorando"

🧠 CORE Agent:
   ❓ Pergunta simples ou complexa?
   ❌ Complexa! Requer:
      - Análise temporal (2 anos)
      - Comparação de tendências
      - Contexto de estilo de vida

   🤖 DELEGA para @health/physician

@health/physician:
   1. Busca PROFILE: health_history últimos 2 anos
      - 2023-01: 210 mg/dL
      - 2023-06: 195 mg/dL
      - 2024-01: 190 mg/dL
      - 2024-06: 185 mg/dL
      - 2025-01: 185 mg/dL

   2. Busca CONTEXT: health.diet, health.exercise
      - Exercício: aumentou de 1x/sem para 3x/sem
      - Dieta: reduziu gorduras saturadas

   3. Analisa tendência:
      - Queda de 12% em 2 anos
      - Estabilizou em 185 (ideal)

   4. Gera resposta usando template "health-assessment"

   5. Retorna para CORE Agent

🧠 CORE Agent (simplifica para voz):
   "Sim! Seu colesterol caiu de 210 para 185 em 2 anos - uma
    melhora de 12%. Isso coincide com você aumentar exercícios
    para 3x por semana. Continue assim!"
```

---

### 3.3 Tipos de Agents Disponíveis

#### Health Domain
```yaml
@health/physician:
  - Analisa exames
  - Compara histórico
  - Recomendações (NÃO diagnóstico)

@health/nutritionist:
  - Análise nutricional
  - Planos alimentares
  - Tracking de macros

@health/fitness-coach:
  - Planos de treino
  - Tracking de progresso
  - Recomendações de exercício
```

#### Finance Domain
```yaml
@finance/advisor:
  - Análise de investimentos
  - Planejamento financeiro
  - Recomendações de alocação

@finance/accountant:
  - Imposto de renda
  - Declarações
  - Otimização fiscal

@finance/transaction-monitor:
  - Detecta fraudes
  - Categoriza gastos
  - Alertas de despesas
```

#### Life Domain
```yaml
@life/decision-advisor:
  - Grandes decisões (mudar emprego, casa, etc)
  - Análise de valores pessoais
  - Pros/cons estruturados

@life/scheduler:
  - Gerencia calendário
  - Otimiza agenda
  - Detecta conflitos
```

---

## 4. Skills vs Agents: Diferença

### Agents (Agentes)
**O que são:** Entidades autônomas com objetivos específicos.

**Exemplo:**
```yaml
@health/physician:
  goal: "Analisar dados médicos e dar recomendações"
  permissions:
    context: [health.bloodwork, health.exams]
  tools: [web_search:pubmed, calculations]
```

### Skills (Habilidades)
**O que são:** Ferramentas/capacidades que os agents podem usar.

**Exemplo:**
```yaml
Skills disponíveis:

#web-search:
  - Buscar informações online
  - Fontes: PubMed, Google Scholar, etc

#calculations:
  - Calcular IMC
  - Comparar tendências
  - Estatísticas

#scheduling:
  - Agendar compromissos
  - Verificar disponibilidade
  - Enviar convites

#notifications:
  - Push notifications
  - SMS
  - Email

#file-analysis:
  - Ler PDFs
  - Extrair texto de imagens
  - Analisar documentos
```

### Como Funcionam Juntos:

```
👤 VOCÊ: "Pesquisa sobre dieta mediterrânea para colesterol"

🧠 CORE Agent → DELEGA → @health/nutritionist

@health/nutritionist:
   1. USA skill #web-search:pubmed
      - Busca: "mediterranean diet cholesterol"
      - Encontra: 15 estudos relevantes

   2. USA skill #calculations
      - Calcula: redução média de 8% em colesterol

   3. USA skill #file-analysis
      - Lê seus exames anteriores
      - Extrai valores de colesterol

   4. Sintetiza resposta:
      "Dieta mediterrânea reduz colesterol em média 8%.
       Baseado no seu nível atual (185), você poderia chegar
       a 170 em 3-6 meses. Quer um plano alimentar?"
```

---

## 5. Exemplo Completo: Fluxo End-to-End

### Cenário: Você acorda e fala com NOUS

```
🌅 07h00 - Você acorda

👤 VOCÊ (voz): "Bom dia NOUS, o que tenho hoje?"

───────────────────────────────────────────────────

🎤 [Whisper API transcreve]
Input: "Bom dia NOUS, o que tenho hoje?"

───────────────────────────────────────────────────

🧠 CORE Agent - PASSO 1: Entende Intenção
Intent: schedule_query + temporal (hoje)
Mood: greeting (responder de forma amigável)

───────────────────────────────────────────────────

🧠 CORE Agent - PASSO 2: Busca Dados

Consulta:
1. context:calendar.today
   - 09h: Reunião com equipe
   - 14h: Médico (Dr. Silva)
   - 18h: Academia

2. context:working.tasks
   - [ ] Finalizar relatório (prazo: hoje)
   - [ ] Pagar conta de luz

3. context:health.medications
   - ⏰ Tomar remédio X às 8h

───────────────────────────────────────────────────

🧠 CORE Agent - PASSO 3: Sintetiza

🔊 NOUS (voz):
"Bom dia! Você tem:
- Reunião com equipe às 9h
- Consulta com Dr. Silva às 14h
- Academia às 18h

Lembretes:
- Tomar seu remédio em 1 hora
- Finalizar relatório (prazo hoje)
- Pagar conta de luz

Quer que eu te avise 15min antes da reunião?"

───────────────────────────────────────────────────

👤 VOCÊ: "Sim. E me lembra dos resultados do último exame
         antes da consulta com médico"

───────────────────────────────────────────────────

🧠 CORE Agent:

1. Entende:
   - Confirmar notificação 15min antes da reunião
   - Criar lembrete: mostrar exames antes de 14h

2. Cria HOOK (automação):
   ```yaml
   hook:
     trigger: time_based
     execute_at: "13:45"  # 15min antes da consulta
     action:
       - load: context:health.bloodwork[latest]
       - notify: user
       - message: "Seus últimos resultados de exame..."
   ```

3. Confirma:
   🔊 "Ok! Te aviso 15min antes da reunião, e às 13h45
       te mostro os resultados dos exames antes da consulta
       com Dr. Silva."

───────────────────────────────────────────────────

⏰ 13h45 - HOOK é acionado automaticamente

📱 NOTIFICAÇÃO:
"Consulta com Dr. Silva em 15min

Seus últimos resultados (15/01):
✅ Colesterol: 185 (normal)
✅ Glicose: 92 (normal)
⚠️ Vitamina D: 18 (baixo, ideal >30)

Sugestão: perguntar ao médico sobre suplementação de Vit D"

───────────────────────────────────────────────────

👤 VOCÊ (na consulta, usando voz no celular):
"NOUS, o médico perguntou quando foi meu último checkup completo"

🧠 CORE Agent:
   - Busca: profile.query("último checkup completo")
   - Encontra: 15/07/2024 (6 meses atrás)

🔊 NOUS: "Seu último checkup completo foi em 15 de julho,
          há 6 meses"

───────────────────────────────────────────────────

👤 VOCÊ (após consulta): "Ele pediu pra eu tomar vitamina D,
                          2000 UI por dia"

🧠 CORE Agent:

1. Entende: nova medicação prescrita
2. Atualiza: context:health.medications
   ```yaml
   new_medication:
     name: "Vitamina D"
     dose: "2000 UI"
     frequency: "diária"
     start_date: "2025-01-19"
     prescribed_by: "Dr. Silva"
   ```

3. Cria HOOK automático:
   ```yaml
   hook:
     trigger: schedule
     execute_at: "08:00"  # Todo dia 8h
     action:
       notify: "Tomar Vitamina D 2000 UI"
   ```

4. Confirma:
   🔊 "Anotado! Vitamina D 2000 UI por dia. Vou te lembrar
       todo dia às 8h. Quer que eu adicione isso na lista
       de compras?"

───────────────────────────────────────────────────

🌙 22h00 - Você em casa

👤 VOCÊ (voz): "Como foi meu dia em termos de saúde?"

───────────────────────────────────────────────────

🧠 CORE Agent - Análise Complexa

Precisa analisar múltiplas fontes:
- Medicações tomadas
- Exercício (foi na academia?)
- Alimentação
- Consulta médica

🤖 DELEGA para @health/daily-summary

───────────────────────────────────────────────────

@health/daily-summary:

1. Busca LOGS do dia:
   - ✅ Tomou medicação X (8h05)
   - ✅ Consulta com Dr. Silva (14h-14h30)
   - ✅ Academia (18h-19h15) - 75min
   - ❌ Não tomou Vitamina D (nova, começa amanhã)

2. Busca PROFILE: health_activity_today
   - Passos: 8,500 (meta: 10,000)
   - Calorias queimadas: 420

3. Sintetiza usando template "health-assessment":

📊 Resumo de Saúde - 19/01/2025

**Positivo:**
✅ Consulta realizada - Dr. Silva
✅ Academia: 75min (cardio + peso)
✅ Medicação regular tomada no horário

**Atenção:**
⚠️ Faltaram 1.500 passos para meta
⚠️ Nova vitamina D começa amanhã

**Recomendação:**
Nova prescrição: Vitamina D 2000 UI/dia
Lembrete ativo para amanhã às 8h

**Score do dia:** 8/10

───────────────────────────────────────────────────

🔊 NOUS (voz - simplificado):
"Dia bom! Você foi na academia por 75 minutos e fez
a consulta com Dr. Silva. Ele prescreveu vitamina D,
vou te lembrar amanhã às 8h. Faltaram só 1.500 passos
para bater sua meta. Score: 8 de 10!"
```

---

## 6. Skills Compostas: Múltiplas Habilidades

### Exemplo: Comprar Passagem Aérea

```
👤 VOCÊ: "Preciso ir para São Paulo semana que vem"

🧠 CORE Agent:

Complexo! Requer:
- Verificar agenda (quando tem disponibilidade?)
- Buscar voos
- Comparar preços
- Verificar orçamento
- Reservar hotel?

🤖 DELEGA para @life/travel-planner

───────────────────────────────────────────────────

@life/travel-planner usa múltiplas skills:

SKILL #1: scheduling (verificar disponibilidade)
   - Analisa: context:calendar.next_week
   - Encontra: Quarta-Quinta (25-26/01) livre

SKILL #2: web-search:flights
   - Busca voos: BSB → GRU
   - Opções:
     1. Gol - R$ 450 (1 escala)
     2. LATAM - R$ 680 (direto)
     3. Azul - R$ 520 (direto)

SKILL #3: finance-check
   - Verifica: context:finance.balance
   - Saldo disponível: R$ 5,800
   - Orçamento viagem: R$ 2,000 (definido pelo user)
   - Status: ✅ Dentro do orçamento

SKILL #4: calculations (comparar options)
   - Melhor custo-benefício: Azul (direto, preço médio)

SKILL #5: booking-assistant
   - Aguarda aprovação do usuário
   - Pode completar reserva via API

───────────────────────────────────────────────────

🔊 NOUS:
"Encontrei disponibilidade Quarta e Quinta (25-26/01).

Melhor opção:
✈️ Azul - Direto - R$ 520
Saída 09h, chegada 11h30

Dentro do seu orçamento de viagem (R$ 2.000).

Quer que eu reserve? Preciso também buscar hotel?"

───────────────────────────────────────────────────

👤 VOCÊ: "Reserva. E sim, hotel perto da Av Paulista"

───────────────────────────────────────────────────

@life/travel-planner:

SKILL #6: booking-assistant
   - Reserva voo Azul (requer aprovação 2FA)
   - Status: ✅ Confirmado

SKILL #7: web-search:hotels
   - Busca: hotéis Av Paulista
   - Opções próximas com boas avaliações

SKILL #8: payments (preparar transação)
   - Total estimado: R$ 520 (voo) + R$ 600 (hotel) = R$ 1,120
   - Requer aprovação (>R$1,000)

───────────────────────────────────────────────────

📱 NOTIFICAÇÃO (requer aprovação):

Confirme a reserva:

✈️ Voo Azul BSB→GRU
Quarta 09h - R$ 520

🏨 Hotel Paulista Inn (4.2⭐)
2 diárias - R$ 600

💰 Total: R$ 1,120

[Aprovar com Biometria]
[Cancelar]

───────────────────────────────────────────────────

👤 VOCÊ: [Toca no botão, usa biometria]

───────────────────────────────────────────────────

@life/travel-planner:

SKILL #9: transaction-executor
   - Realiza pagamento: R$ 1,120
   - Adiciona ao: context:finance.transactions
   - Atualiza: context:finance.balance

SKILL #10: calendar-integration
   - Adiciona voo ao calendário (25/01 09h)
   - Adiciona check-in hotel (25/01 14h)
   - Adiciona check-out (26/01 12h)
   - Cria lembrete: check-in 24h antes (app Azul)

───────────────────────────────────────────────────

🔊 NOUS:
"Tudo certo! ✅

Voo e hotel reservados. Gastou R$ 1,120
(sobra R$ 880 do orçamento de viagem).

Adicionei tudo no seu calendário. Te lembro
amanhã para fazer check-in online.

Quer que eu prepare um roteiro de restaurantes
na Paulista?"
```

---

## 7. Resumo Arquitetural

```
┌───────────────────────────────────────────────────────┐
│                    VOCÊ (User)                        │
│              🎤 Voz  ou  💬 Texto                      │
└───────────────────────────────────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────────┐
│                 CORE Agent (Cérebro)                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 1. Entende o que você quer (Intent)             │  │
│  │ 2. Lembra conversas passadas (Memory/RAG)       │  │
│  │ 3. Decide ONDE buscar dados (Router)            │  │
│  │ 4. Busca informações (VFS, PROFILE, CONTEXT)    │  │
│  │ 5. Decide: respondo sozinho ou delego?          │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌─────────────────┐           ┌──────────────────────┐
│ Resposta Direta │           │ Delega para Sub-Agent│
│ (Pergunta       │           │ (Análise complexa)   │
│  simples)       │           │                      │
└─────────────────┘           └──────────────────────┘
                                        ↓
                              ┌──────────────────────┐
                              │   @health/physician  │
                              │   @finance/advisor   │
                              │   @life/scheduler    │
                              │   [etc...]           │
                              └──────────────────────┘
                                        ↓
                              Sub-Agent usa SKILLS:
                              ├─ #web-search
                              ├─ #calculations
                              ├─ #file-analysis
                              ├─ #notifications
                              └─ #scheduling
                                        ↓
                              Retorna resultado para
                              CORE Agent
                                        ↓
                ┌───────────────────────┴──────────────┐
                ↓                                      ↓
        ┌─────────────┐                      ┌─────────────┐
        │ Resposta    │                      │ Ações       │
        │ (Voz/Texto) │                      │ Automáticas │
        └─────────────┘                      │ (HOOKS)     │
                                            └─────────────┘
```

---

## 8. Onde Vivem os Dados

```
IDENTITY (quem você é)
├─ persona.md (como NOUS fala com você)
├─ boundaries.md (limites)
└─ priorities.md (P0-P4 matriz)

CONTEXT (estado atual)
├─ health.bloodwork (último exame)
├─ health.medications (remédios atuais)
├─ finance.balance (saldo agora)
└─ calendar.today (agenda hoje)

PROFILE (histórico completo)
├─ health_history (todos exames já feitos)
├─ finance_transactions (todas transações)
├─ conversations (todas conversas com NOUS)
└─ decisions (decisões importantes tomadas)

VAULT (arquivos brutos)
├─ exames/ (PDFs de exames)
├─ documentos/ (RG, CNH, etc)
└─ fotos/ (sincronizado Google Photos)

WORKING (tarefas ativas)
└─ tasks/ (to-dos em andamento)

LOGS (auditoria imutável)
└─ agent_calls/ (tudo que agents fizeram)
```

---

## 9. Tecnologias Utilizadas

### Voice
- **Whisper API (OpenAI):** Speech-to-text transcription
- **OpenAI TTS (tts-1-hd):** Text-to-speech synthesis
- **Custo:** ~$0.006/min (input) + $0.015/1K chars (output)

### Memory (RAG)
- **Pinecone:** Vector database para semantic search
- **text-embedding-3-small:** Embeddings (1536 dimensions)
- **Custo:** ~$70/month (100K vectors)

### Backend
- **LangGraph:** Stateful workflow orchestration
- **Firebase Functions:** Serverless compute
- **Cloud Run:** Container runtime para Python workflows
- **Firestore:** Database principal

### Frontend
- **Next.js 14:** React framework
- **TurboRepo:** Monorepo structure
- **Tailwind CSS:** Styling

---

## 10. Segurança & Privacidade

### Aprovações Requeridas

```yaml
Transações < R$100:
  approval: automatic
  log: yes

Transações R$100-1000:
  approval: push_notification + 2FA
  timeout: 5min

Transações > R$1000:
  approval: in_app + biometrics
  timeout: 5min
  log: immutable

Dados Médicos:
  access: explicit_permission_per_agent
  sharing: NEVER (sem permissão)
  encryption: end_to_end

Dados Financeiros:
  access: explicit_permission_per_agent
  sharing: NEVER
  encryption: end_to_end
```

### Audit Trail (LOGS)

Tudo que agentes fazem é registrado de forma **imutável**:

```json
{
  "timestamp": "2025-01-19T14:30:00Z",
  "type": "agent_call",
  "agent": "@finance/advisor",
  "action": "portfolio_analysis",
  "context_accessed": [
    "finance.investments",
    "finance.transactions"
  ],
  "cost": 0.02,
  "duration_ms": 3500,
  "user_approved": true,
  "status": "success"
}
```

---

## 11. Custos Operacionais

### Por Interação (média)

```
Voz Input (30s):     $0.003
Transcription:       $0.003
LLM (CORE):          $0.005
Memory (RAG):        $0.001
TTS Output:          $0.003
─────────────────────────────
Total:               ~$0.015
```

### Mensal (usuário ativo - 50 interações/dia)

```
Interações: 1.500 x $0.015 = $22.50
Storage (Firestore + Vector): $3
Firebase Functions: $2
─────────────────────────────
Total: ~$27.50

Preço para usuário: $19/mês
Margem: 31%
```

---

## Conclusão

NOUS OS funciona como um **Operating System para sua vida**:

1. **Você fala** (voz ou texto)
2. **CORE Agent entende** e busca informações nos lugares certos
3. **Sub-agents especialistas** ajudam em análises complexas
4. **Skills** fornecem capacidades técnicas
5. **Tudo é registrado** de forma segura e auditável
6. **Você mantém controle** total com aprovações e limites

**Diferencial:** Não é apenas um chatbot - é um assistente com **memória completa**, **conhecimento profundo** sobre você, e **capacidade de agir** proativamente dentro dos seus limites.
