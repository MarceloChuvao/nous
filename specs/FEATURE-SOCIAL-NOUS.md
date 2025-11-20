# Feature: NOUS Social - Conexões entre Assistentes Pessoais

> **Conceito:** Permitir que o NOUS de uma pessoa interaja com o NOUS de outra pessoa, criando uma camada social inteligente onde assistentes colaboram para melhorar a vida de seus usuários.

---

## 💡 Visão Geral

### O Problema

Hoje, assistentes pessoais são **isolados**:
- Seu NOUS conhece você, mas não conhece as pessoas importantes da sua vida
- Coordenar atividades com outras pessoas requer comunicação manual
- Você não pode "delegar" tarefas sociais para seu assistente
- Presentes, lembretes de aniversário, etc. ainda são manuais

### A Solução: NOUS Social

Permitir que **seu NOUS converse com o NOUS de outras pessoas** para:
- ✅ Coordenar agendas automaticamente
- ✅ Compartilhar informações relevantes (com permissão)
- ✅ Sugerir presentes baseado no perfil da pessoa
- ✅ Lembrar aniversários e datas importantes
- ✅ "Contar seu dia" para pessoas próximas
- ✅ Marcar coisas/eventos para outras pessoas

---

## 🎯 Casos de Uso

### 1. Coordenação de Agenda

**Cenário:**
> Você quer jantar com sua amiga Maria esta semana.

**Fluxo Tradicional:**
```
Você → WhatsApp → "Maria, vamos jantar esta semana?"
Maria → "Sim! Que dia?"
Você → Abre calendário, vê disponibilidade
Você → "Terça ou quinta?"
Maria → Abre calendário
Maria → "Quinta às 20h?"
Você → "Fechado!"
[5+ mensagens, 2 dias de ida e volta]
```

**Fluxo NOUS Social:**
```
Você → NOUS: "Quero jantar com a Maria esta semana"
Seu NOUS → NOUS da Maria: "Usuário quer jantar, vocês têm horários em comum?"
NOUS da Maria → Checa agenda dela, encontra: Terça 19h-21h, Quinta 20h-22h
Seu NOUS → Checa sua agenda, encontra: Quinta 19h-23h
Seu NOUS → NOUS da Maria: "Quinta 20h funciona para ambos?"
NOUS da Maria → Confirma com Maria (notificação): "João quer jantar quinta 20h. Confirmar?"
Maria → ✅ Aprovado
Seu NOUS → Agenda criada para ambos, restaurante sugerido
[1 mensagem, 5 minutos]
```

---

### 2. Presente Inteligente

**Cenário:**
> Aniversário da sua mãe chegando.

**Fluxo NOUS Social:**
```
Seu NOUS → Detecta: "Aniversário da mãe em 2 semanas"
Seu NOUS → NOUS da Mãe: "Pode compartilhar lista de desejos/interesses?"
NOUS da Mãe → Retorna: ["Livros de jardinagem", "Fone bluetooth", "Cursos de pintura"]
Seu NOUS → Cruza com seu orçamento, preferências dela, histórico
Seu NOUS → Você: "Sugestão de presente: Livro 'Jardins do Brasil' (R$ 89) + cartão personalizado. Ela mencionou interesse em jardinagem na última conversa."
Você → ✅ Aprovado
Seu NOUS → Compra, agenda entrega, cria cartão com mensagem sugerida
```

---

### 3. "Contando o Dia"

**Cenário:**
> Você quer que seu parceiro saiba como foi seu dia, mas está cansado demais para contar tudo.

**Fluxo NOUS Social:**
```
Você → NOUS: "Conta meu dia para a Ana"
Seu NOUS → Gera resumo: "Dia corrido! Reunião importante às 10h foi bem, almoçou com cliente novo, academia às 18h (bateu meta de passos!), cansado mas satisfeito."
Seu NOUS → NOUS da Ana: "Resumo do dia do João (compartilhado com permissão)"
NOUS da Ana → Ana: "João compartilhou o dia dele 💙" [mostra resumo]
Ana → Pode responder via NOUS dela: "Parabéns pela reunião! Pizza hoje à noite para comemorar?"
```

---

### 4. Marcar Coisas

**Cenário:**
> Você viu um artigo sobre investimentos que seria perfeito para seu irmão.

**Fluxo NOUS Social:**
```
Você → NOUS: "Marca esse artigo para o Pedro ler"
Seu NOUS → NOUS do Pedro: "João marcou um artigo para você: 'Como investir em 2025'"
NOUS do Pedro → Pedro: "João achou que você ia gostar desse artigo 📰"
Pedro → Lê depois, quando tiver tempo
Pedro → NOUS dele: "Obrigado ao João"
NOUS do Pedro → Seu NOUS → Você: "Pedro agradeceu pelo artigo!"
```

---

### 5. Coordenação de Grupo

**Cenário:**
> Organizar churrasco com 10 amigos.

**Fluxo NOUS Social:**
```
Você → NOUS: "Quero fazer churrasco no sábado com [lista de 10 amigos]"
Seu NOUS → Envia para NOUS de todos:
  - Verificar disponibilidade sábado 15h-22h
  - Restrições alimentares
  - Pode trazer algo?

NOUS de cada um → Responde automaticamente:
  - João: Disponível, sem restrições, traz cerveja
  - Maria: Disponível, vegetariana, traz salada
  - Pedro: Conflito às 15h, pode chegar 17h
  - [...]

Seu NOUS → Você: "7/10 confirmaram! 2 vegetarianos, Pedro chega 17h. Lista de compras sugerida: [...]"
```

---

## 🏗️ Arquitetura

### 1. Conexões entre NOUS

```sql
-- Conexões entre usuários
CREATE TABLE nous_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem conectou com quem
  user_a_id UUID REFERENCES users(id),
  user_b_id UUID REFERENCES users(id),

  -- Status da conexão
  status TEXT CHECK (status IN ('pending', 'active', 'blocked')) DEFAULT 'pending',

  -- Nível de acesso (quanto compartilhar)
  access_level TEXT CHECK (access_level IN ('basic', 'standard', 'close', 'family')) DEFAULT 'standard',

  -- Metadados
  relationship_type TEXT, -- 'friend', 'family', 'partner', 'colleague'
  nickname TEXT, -- Como você chama essa pessoa

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(user_a_id, user_b_id)
);

-- Políticas de compartilhamento por conexão
CREATE TABLE connection_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES nous_connections(id),

  -- O que pode compartilhar
  can_share_calendar BOOLEAN DEFAULT false,
  can_share_location BOOLEAN DEFAULT false,
  can_share_health_summary BOOLEAN DEFAULT false, -- Resumos, não dados brutos
  can_share_mood BOOLEAN DEFAULT false,
  can_share_day_summary BOOLEAN DEFAULT false,

  -- O que pode fazer
  can_suggest_events BOOLEAN DEFAULT false,
  can_mark_items BOOLEAN DEFAULT false,
  can_send_gifts BOOLEAN DEFAULT false,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens entre NOUS
CREATE TABLE nous_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- De quem para quem (NOUS → NOUS)
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),

  -- Tipo de mensagem
  message_type TEXT NOT NULL, -- 'calendar_request', 'gift_suggestion', 'day_summary', 'item_marked'

  -- Conteúdo
  content JSONB NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'actioned')) DEFAULT 'sent',

  -- Resposta (se aplicável)
  response JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  actioned_at TIMESTAMPTZ
);
```

---

### 2. Níveis de Acesso

```python
ACCESS_LEVELS = {
    "basic": {
        "can_share_calendar": False,
        "can_share_location": False,
        "can_share_health_summary": False,
        "can_share_mood": False,
        "can_share_day_summary": False,
        "can_suggest_events": True,
        "can_mark_items": True,
        "can_send_gifts": True,
    },
    "standard": {
        "can_share_calendar": True,  # Apenas disponibilidade, não detalhes
        "can_share_location": False,
        "can_share_health_summary": False,
        "can_share_mood": False,
        "can_share_day_summary": True,
        "can_suggest_events": True,
        "can_mark_items": True,
        "can_send_gifts": True,
    },
    "close": {
        "can_share_calendar": True,
        "can_share_location": True,
        "can_share_health_summary": True,  # Resumos: "Saúde ok" vs dados detalhados
        "can_share_mood": True,
        "can_share_day_summary": True,
        "can_suggest_events": True,
        "can_mark_items": True,
        "can_send_gifts": True,
    },
    "family": {
        # Tudo permitido (com consentimento explícito)
        "can_share_calendar": True,
        "can_share_location": True,
        "can_share_health_summary": True,
        "can_share_mood": True,
        "can_share_day_summary": True,
        "can_suggest_events": True,
        "can_mark_items": True,
        "can_send_gifts": True,
    }
}
```

---

### 3. API de Comunicação entre NOUS

```python
class NousCommunication:
    """API para comunicação entre NOUS"""

    def send_message(self, from_user: str, to_user: str, msg_type: str, content: dict):
        """Envia mensagem de um NOUS para outro"""

        # 1. Verificar se há conexão ativa
        connection = db.query(nous_connections).filter(
            user_a_id=from_user,
            user_b_id=to_user,
            status='active'
        ).first()

        if not connection:
            raise NoConnectionError("Users are not connected")

        # 2. Verificar políticas
        policy = db.query(connection_policies).filter(
            connection_id=connection.id
        ).first()

        if not self.is_allowed(msg_type, policy):
            raise PermissionDeniedError(f"Not allowed to send {msg_type}")

        # 3. Criar mensagem
        msg_id = db.insert("nous_messages", {
            "from_user_id": from_user,
            "to_user_id": to_user,
            "message_type": msg_type,
            "content": content,
            "status": "sent"
        })

        # 4. Notificar destinatário
        self.notify_user(to_user, msg_id)

        return msg_id

    def request_calendar_availability(self, from_user: str, to_user: str, time_range: tuple):
        """Solicita disponibilidade de agenda"""

        return self.send_message(
            from_user=from_user,
            to_user=to_user,
            msg_type="calendar_request",
            content={
                "action": "check_availability",
                "time_range": {
                    "start": time_range[0].isoformat(),
                    "end": time_range[1].isoformat()
                }
            }
        )

    def share_day_summary(self, from_user: str, to_user: str, summary: str):
        """Compartilha resumo do dia"""

        return self.send_message(
            from_user=from_user,
            to_user=to_user,
            msg_type="day_summary",
            content={
                "summary": summary,
                "mood": "happy",  # Inferido pelo NOUS
                "highlights": [
                    "Reunião importante foi bem",
                    "Bateu meta de exercícios"
                ]
            }
        )

    def mark_item(self, from_user: str, to_user: str, item_type: str, item_data: dict):
        """Marca algo para outra pessoa"""

        return self.send_message(
            from_user=from_user,
            to_user=to_user,
            msg_type="item_marked",
            content={
                "item_type": item_type,  # 'article', 'video', 'product', 'place'
                "item_data": item_data,
                "note": "Achei que você ia gostar!"
            }
        )
```

---

## 🎨 UI/UX Flows

### 1. Conectar NOUS

```
Você → Settings → Social → "Conectar com..."
  ↓
Digite email/username da pessoa
  ↓
Escolha nível de acesso: [Basic] [Standard] [Close] [Family]
  ↓
Personalizar políticas (opcional)
  ↓
Enviar convite → Pessoa recebe notificação
  ↓
Pessoa aceita → Conexão ativa ✅
```

### 2. Dashboard de Conexões

```
┌─────────────────────────────────────────┐
│         Minhas Conexões (12)            │
├─────────────────────────────────────────┤
│                                         │
│ 👤 Maria Silva              [Standard]  │
│    • Última interação: 2h atrás         │
│    • Compartilha: Agenda, Dia           │
│    [Ver] [Editar] [Remover]             │
│                                         │
│ 👤 Pedro Santos             [Close]     │
│    • Última interação: 1d atrás         │
│    • Compartilha: Tudo exceto Saúde     │
│    [Ver] [Editar] [Remover]             │
│                                         │
│ 👤 Ana (Família)            [Family]    │
│    • Última interação: 30m atrás        │
│    • Compartilha: Tudo                  │
│    [Ver] [Editar] [Remover]             │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Mensagens NOUS

```
┌─────────────────────────────────────────┐
│      Atividade Social (3 novas)         │
├─────────────────────────────────────────┤
│                                         │
│ 🗓️ Maria quer jantar quinta 20h         │
│    Restaurante Italiano sugerido        │
│    [✅ Aceitar] [❌ Recusar] [Propor]   │
│                                         │
│ 💙 Pedro compartilhou o dia dele         │
│    "Dia corrido mas produtivo..."       │
│    [Ver completo] [Responder]           │
│                                         │
│ 🔖 João marcou um artigo para você      │
│    "Como investir em 2025"              │
│    [Ler agora] [Salvar] [Agradecer]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔒 Privacidade e Segurança

### Princípios

1. **Opt-in Total**
   - Nada é compartilhado sem permissão explícita
   - Usuário controla cada aspecto do compartilhamento

2. **Granularidade**
   - Controle por tipo de dado (agenda vs. saúde vs. localização)
   - Controle por pessoa (nível de acesso)
   - Controle temporal (compartilhar por X dias)

3. **Transparência**
   - Log de tudo que foi compartilhado
   - Notificação quando algo é compartilhado
   - Fácil de revogar acesso

4. **Dados Sensíveis**
   - Saúde: apenas resumos ("Saúde ok"), não dados brutos
   - Finanças: NUNCA compartilhado (mesmo com família)
   - Localização: apenas "Em casa" vs "Fora", não GPS exato

### Audit Log

```sql
CREATE TABLE social_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem compartilhou o quê com quem
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),

  -- O que foi compartilhado
  data_type TEXT NOT NULL, -- 'calendar', 'day_summary', 'mood'
  data_summary TEXT, -- Resumo do que foi compartilhado

  -- Quando
  shared_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💎 Features Avançadas

### 1. Gifts Intelligence

```python
class GiftIntelligence:
    """Sugere presentes baseado em perfil da pessoa"""

    def suggest_gift(self, for_user_id: str, budget: float, occasion: str):
        # 1. Pegar dados compartilhados do NOUS da pessoa
        person_nous = NOUSCommunication.get_shared_profile(for_user_id)

        # 2. Analisar interesses
        interests = person_nous.get("interests", [])
        recent_mentions = person_nous.get("recent_mentions", [])
        wishlist = person_nous.get("wishlist", [])

        # 3. Cruzar com banco de produtos
        suggestions = ProductDB.search(
            interests=interests,
            budget=budget,
            occasion=occasion
        )

        # 4. Filtrar por coisas que ela já tem
        owned_items = person_nous.get("owned_items", [])
        suggestions = [s for s in suggestions if s not in owned_items]

        # 5. Ranking por relevância
        ranked = self.rank_by_relevance(suggestions, person_nous)

        return ranked[:5]  # Top 5
```

### 2. Coordenação Automática

```python
class AutoCoordination:
    """Coordena eventos automaticamente entre múltiplos NOUS"""

    def find_common_time(self, user_ids: List[str], duration_minutes: int):
        """Encontra horário comum para N pessoas"""

        # 1. Pegar disponibilidade de todos
        availabilities = []
        for user_id in user_ids:
            avail = NOUSCommunication.get_calendar_availability(user_id)
            availabilities.append(avail)

        # 2. Encontrar intersecção
        common_slots = self.find_intersection(availabilities, duration_minutes)

        # 3. Ranking por preferências
        # - Horário preferido de cada um
        # - Distância geográfica (se compartilhado)
        # - Histórico (quando costumam se encontrar)

        return common_slots
```

### 3. Mood Sharing

```python
class MoodSharing:
    """Compartilha humor/estado emocional (com consentimento)"""

    def share_mood(self, from_user: str, to_user: str):
        # 1. Inferir mood do usuário
        mood = MoodAnalyzer.analyze(from_user)
        # mood = { "state": "happy", "energy": 0.8, "stress": 0.2 }

        # 2. Gerar mensagem natural
        message = self.mood_to_message(mood)
        # "Estou feliz e energizado hoje! 😊"

        # 3. Enviar para NOUS da outra pessoa
        NOUSCommunication.send_message(
            from_user=from_user,
            to_user=to_user,
            msg_type="mood_update",
            content={"mood": mood, "message": message}
        )
```

---

## 🚀 Roadmap

### MVP (v1.0)
- ✅ Conectar NOUS (basic/standard levels)
- ✅ Coordenação de agenda
- ✅ Marcar itens
- ✅ Compartilhar resumo do dia

### v2.0
- ✅ Gifts intelligence
- ✅ Coordenação de grupo
- ✅ Mood sharing
- ✅ Close/Family levels

### v3.0
- ✅ Localização compartilhada (opt-in)
- ✅ Saúde compartilhada (resumos)
- ✅ Integração com calendários externos
- ✅ "NOUS Circles" (grupos permanentes: família, trabalho, etc.)

---

## 🎯 Casos de Uso Killer

### 1. Casal

```
Ana e João:
- Access Level: Family
- Compartilham: Agenda, Localização, Mood, Resumo do dia
- NOUS coordena: Jantares, compras, tarefas domésticas
- Sugestões: Presentes de aniversário, date nights baseado em mood
```

### 2. Pais & Filhos

```
Mãe e Filho (adulto):
- Access Level: Family
- Compartilham: Saúde (resumos), Localização de emergência
- NOUS coordena: Almoços semanais, consultas médicas
- Alertas: Quando filho não está bem (saúde/mood)
```

### 3. Amigos Próximos

```
Grupo de 5 amigos:
- Access Level: Close
- Compartilham: Agenda, Mood
- NOUS coordena: Happy hours, churrascos, viagens
- Suggestions: Presentes coletivos, lugares para visitar juntos
```

---

## 🤔 Perguntas e Considerações

### Monetização?
- Feature premium? (conexões ilimitadas vs. 3 grátis)
- B2B: Empresas coordenando equipes via NOUS Social

### Limites?
- Max 50 conexões ativas? (evitar spam)
- Rate limiting em mensagens entre NOUS

### Ética?
- Como evitar abuso? (stalking, spam)
- Como garantir consentimento real?
- LGPD/GDPR compliance

---

## 📊 Métricas de Sucesso

- **Engagement:** % usuários com ≥1 conexão ativa
- **Coordination:** Tempo economizado em coordenação manual
- **Satisfaction:** NPS de usuários usando Social features
- **Retention:** Usuários com Social são mais engajados?

---

**Esse conceito te anima?** Quer que eu:
1. Crie o código de implementação?
2. Desenhe os fluxos de UI detalhados?
3. Explore casos de uso específicos?
4. Discuta privacidade/ética mais a fundo?

Diz aí! 🚀
