# Arquitetura: Políticas Dinâmicas e RBAC

> **Problema:** Como controlar o que cada agente pode fazer? Como pedir autorização just-in-time? Como auditar mudanças de política?

---

## 📋 Requisitos

### 1. Perfis com Políticas Pré-definidas
- ✅ Perfis default: `default`, `conservative`, `permissive`, `custom`
- ✅ Cada perfil tem conjunto de políticas (allow/deny)
- ✅ Usuário pode escolher perfil inicial

### 2. Autorização Just-In-Time (JIT)
- ✅ Quando agente precisa fazer algo sem permissão → pedir autorização
- ✅ Usuário aprova/rejeita na hora
- ✅ Pode conceder temporariamente (1h, 1 dia, 1 semana, permanente)

### 3. Audit Log Completo
- ✅ Registrar TODAS mudanças de política
- ✅ Quem pediu (agent_id)
- ✅ Quem aprovou (user_id)
- ✅ Quando (timestamp)
- ✅ Por quanto tempo (TTL)

### 4. Dashboard de Mudanças Recentes
- ✅ Ver políticas alteradas nos últimos N dias
- ✅ Filtrar por agente, ação, status

---

## 🏗️ Schema de Políticas

```sql
-- ==========================================
-- POLICIES SCHEMA
-- ==========================================

-- Perfis de política (templates)
CREATE TABLE policy_profiles (
  id TEXT PRIMARY KEY, -- 'default', 'conservative', 'permissive'
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- Não pode ser deletado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas de cada perfil
CREATE TABLE profile_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES policy_profiles(id),

  -- Escopo da política
  resource_type TEXT NOT NULL, -- 'health.pdf', 'finance.api', 'global'
  action TEXT NOT NULL, -- 'read', 'write', 'delete', 'execute', 'api_call'

  -- Decisão
  effect TEXT NOT NULL CHECK (effect IN ('allow', 'deny')), -- 'allow' ou 'deny'

  -- Condições (opcional)
  conditions JSONB, -- { "max_file_size": "10MB", "allowed_domains": ["nubank.com"] }

  -- Priority (maior número = maior prioridade)
  priority INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(profile_id, resource_type, action)
);

-- Perfil ativo de cada usuário
CREATE TABLE user_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  profile_id TEXT REFERENCES policy_profiles(id),

  -- Overrides (políticas customizadas além do perfil)
  custom_policies JSONB DEFAULT '[]',

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Autorizações temporárias (JIT)
CREATE TABLE temporary_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem pediu
  user_id UUID REFERENCES users(id),
  agent_id TEXT REFERENCES agents(id),

  -- O que foi autorizado
  resource_type TEXT NOT NULL,
  action TEXT NOT NULL,

  -- Quando e por quanto tempo
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Quem aprovou (user_id ou 'auto')
  approved_by TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'expired')) DEFAULT 'pending',

  -- Metadata
  reason TEXT, -- "Processar exame de sangue"
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log (imutável)
CREATE TABLE policy_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem/O quê
  user_id UUID REFERENCES users(id),
  agent_id TEXT,

  -- Ação
  event_type TEXT NOT NULL, -- 'policy.created', 'policy.updated', 'grant.requested', 'grant.approved'
  resource_type TEXT,
  action TEXT,

  -- Antes/Depois
  old_value JSONB,
  new_value JSONB,

  -- Metadata
  approved_by TEXT,
  reason TEXT,
  ttl_seconds INTEGER, -- Tempo em segundos (null = permanente)

  -- Timestamp (imutável)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_temp_grants_user ON temporary_grants(user_id);
CREATE INDEX idx_temp_grants_expires ON temporary_grants(expires_at);
CREATE INDEX idx_temp_grants_status ON temporary_grants(status);
CREATE INDEX idx_audit_log_user ON policy_audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_agent ON policy_audit_log(agent_id, created_at DESC);
```

---

## 📦 Perfis Default

### 1. Conservative (Padrão Seguro)

```json
{
  "id": "conservative",
  "name": "Conservador",
  "description": "Máxima segurança, pede autorização para tudo",
  "policies": [
    // Leitura de dados: permitido
    {
      "resource_type": "health.*",
      "action": "read",
      "effect": "allow"
    },
    {
      "resource_type": "finance.*",
      "action": "read",
      "effect": "allow"
    },

    // Escrita: REQUER autorização
    {
      "resource_type": "health.*",
      "action": "write",
      "effect": "deny"
    },
    {
      "resource_type": "finance.*",
      "action": "write",
      "effect": "deny"
    },

    // APIs externas: BLOQUEADO
    {
      "resource_type": "external_api.*",
      "action": "execute",
      "effect": "deny"
    },

    // Upload/Download: limitado
    {
      "resource_type": "file.upload",
      "action": "write",
      "effect": "allow",
      "conditions": {
        "max_file_size": "10MB",
        "allowed_types": ["pdf", "jpg", "png"]
      }
    }
  ]
}
```

### 2. Default (Balanceado)

```json
{
  "id": "default",
  "name": "Padrão",
  "description": "Equilibra segurança e conveniência",
  "policies": [
    // Leitura: sempre permitido
    {
      "resource_type": "*",
      "action": "read",
      "effect": "allow"
    },

    // Escrita em dados próprios: permitido
    {
      "resource_type": "health.*",
      "action": "write",
      "effect": "allow"
    },
    {
      "resource_type": "finance.*",
      "action": "write",
      "effect": "allow"
    },

    // APIs confiáveis: permitido
    {
      "resource_type": "external_api.plaid",
      "action": "execute",
      "effect": "allow"
    },
    {
      "resource_type": "external_api.openai",
      "action": "execute",
      "effect": "allow"
    },

    // APIs desconhecidas: requer autorização
    {
      "resource_type": "external_api.*",
      "action": "execute",
      "effect": "deny",
      "priority": -1
    }
  ]
}
```

### 3. Permissive (Dev Mode)

```json
{
  "id": "permissive",
  "name": "Permissivo",
  "description": "Tudo permitido (usar apenas em dev)",
  "policies": [
    {
      "resource_type": "*",
      "action": "*",
      "effect": "allow"
    }
  ]
}
```

---

## ⚡ Policy Engine

### Algoritmo de Decisão

```python
def check_permission(user_id, agent_id, resource_type, action):
    """
    1. Buscar perfil do usuário
    2. Buscar políticas do perfil + overrides
    3. Verificar autorizações temporárias
    4. Aplicar políticas (maior prioridade vence)
    5. Default: DENY
    """

    # 1. Buscar perfil
    user_policy = db.query(user_policies).filter(user_id=user_id).first()
    profile = db.query(policy_profiles).filter(id=user_policy.profile_id).first()

    # 2. Buscar políticas do perfil
    policies = db.query(profile_policies).filter(profile_id=profile.id).all()

    # 3. Adicionar overrides customizados
    policies += user_policy.custom_policies

    # 4. Verificar grants temporários
    temp_grant = db.query(temporary_grants).filter(
        user_id=user_id,
        agent_id=agent_id,
        resource_type=resource_type,
        action=action,
        status='approved',
        expires_at__gt=NOW()
    ).first()

    if temp_grant:
        return {
            "allowed": True,
            "reason": "Temporary grant",
            "expires_at": temp_grant.expires_at
        }

    # 5. Aplicar políticas (maior prioridade vence)
    matching_policies = [
        p for p in policies
        if matches(p.resource_type, resource_type) and
           matches(p.action, action)
    ]

    if not matching_policies:
        # Default: DENY
        return {
            "allowed": False,
            "reason": "No matching policy (default deny)"
        }

    # Ordenar por prioridade
    matching_policies.sort(key=lambda p: p.priority, reverse=True)

    # Primeira política vence
    policy = matching_policies[0]

    # Verificar condições
    if policy.conditions:
        if not check_conditions(policy.conditions):
            return {
                "allowed": False,
                "reason": f"Conditions not met: {policy.conditions}"
            }

    return {
        "allowed": policy.effect == "allow",
        "reason": f"Matched policy: {policy.resource_type}/{policy.action}",
        "policy_id": policy.id
    }
```

---

## 🔔 Just-In-Time Authorization (JIT)

### Fluxo

```
┌─────────────┐
│   Agent     │
│ (needs API  │
│  access)    │
└──────┬──────┘
       │ 1. check_permission()
       ▼
┌─────────────┐
│ Policy      │ ❌ DENIED
│ Engine      │────┐
└─────────────┘    │
                   │ 2. request_authorization()
                   ▼
┌─────────────────────────────────┐
│ Temporary Grant Request Created │
│ status: 'pending'                │
└──────┬──────────────────────────┘
       │ 3. notify_user()
       ▼
┌─────────────┐
│    User     │
│  (mobile/   │
│   web UI)   │
└──────┬──────┘
       │ 4. approve(ttl='1 day')
       ▼
┌─────────────────────────────────┐
│ Temporary Grant Updated          │
│ status: 'approved'               │
│ expires_at: NOW() + 1 day        │
└──────┬──────────────────────────┘
       │ 5. Agent retries
       ▼
┌─────────────┐
│ Policy      │ ✅ ALLOWED
│ Engine      │ (until expires_at)
└─────────────┘
```

### Exemplo de Código

```python
class PolicyEnforcer:
    def enforce(self, user_id, agent_id, resource_type, action):
        """
        Enforça política ou solicita autorização JIT
        """
        result = self.check_permission(user_id, agent_id, resource_type, action)

        if result["allowed"]:
            return True  # ✅ Permitido

        # ❌ Negado → Solicitar autorização
        grant_id = self.request_authorization(
            user_id=user_id,
            agent_id=agent_id,
            resource_type=resource_type,
            action=action,
            reason=f"Agent {agent_id} needs {action} access to {resource_type}"
        )

        # Notificar usuário (push, email, webhook)
        self.notify_user(user_id, grant_id)

        # Retornar exception especial
        raise AuthorizationRequiredException(
            grant_id=grant_id,
            message="Awaiting user approval"
        )

    def request_authorization(self, user_id, agent_id, resource_type, action, reason):
        """Cria pedido de autorização temporária"""
        grant_id = db.insert("temporary_grants", {
            "user_id": user_id,
            "agent_id": agent_id,
            "resource_type": resource_type,
            "action": action,
            "status": "pending",
            "reason": reason,
            "expires_at": None  # Será definido quando aprovado
        })

        # Audit log
        db.insert("policy_audit_log", {
            "user_id": user_id,
            "agent_id": agent_id,
            "event_type": "grant.requested",
            "resource_type": resource_type,
            "action": action,
            "reason": reason
        })

        return grant_id

    def approve_grant(self, grant_id, ttl_seconds, approved_by):
        """Usuário aprova grant (via UI)"""
        grant = db.query("temporary_grants").filter(id=grant_id).first()

        expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)

        db.update("temporary_grants", grant_id, {
            "status": "approved",
            "expires_at": expires_at,
            "approved_by": approved_by,
            "granted_at": datetime.utcnow()
        })

        # Audit log
        db.insert("policy_audit_log", {
            "user_id": grant.user_id,
            "agent_id": grant.agent_id,
            "event_type": "grant.approved",
            "resource_type": grant.resource_type,
            "action": grant.action,
            "approved_by": approved_by,
            "ttl_seconds": ttl_seconds,
            "new_value": {"expires_at": expires_at.isoformat()}
        })
```

---

## 🕐 TTL Presets

### UI de Aprovação

```typescript
// Frontend: Modal de aprovação
const TTL_PRESETS = [
  { label: "1 hora", seconds: 3600 },
  { label: "1 dia", seconds: 86400 },
  { label: "1 semana", seconds: 604800 },
  { label: "1 mês", seconds: 2592000 },
  { label: "Permanente", seconds: null }
]

function ApprovalModal({ grant }) {
  const [selectedTTL, setSelectedTTL] = useState(86400) // Default: 1 dia

  return (
    <div>
      <h2>Autorização Solicitada</h2>
      <p>
        <strong>Agente:</strong> {grant.agent_id}<br/>
        <strong>Ação:</strong> {grant.action} em {grant.resource_type}<br/>
        <strong>Motivo:</strong> {grant.reason}
      </p>

      <label>Por quanto tempo?</label>
      <select value={selectedTTL} onChange={e => setSelectedTTL(e.target.value)}>
        {TTL_PRESETS.map(preset => (
          <option value={preset.seconds}>{preset.label}</option>
        ))}
      </select>

      <button onClick={() => approve(grant.id, selectedTTL)}>
        ✅ Aprovar
      </button>
      <button onClick={() => deny(grant.id)}>
        ❌ Negar
      </button>
    </div>
  )
}
```

---

## 📊 Dashboard de Mudanças Recentes

### Query SQL

```sql
-- Mudanças nos últimos 7 dias
SELECT
  event_type,
  agent_id,
  resource_type,
  action,
  approved_by,
  ttl_seconds,
  created_at
FROM policy_audit_log
WHERE user_id = 'user_123'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 50;
```

### API Endpoint

```python
@app.get("/api/policies/recent-changes")
def get_recent_changes(
    user_id: str,
    days: int = 7,
    event_type: Optional[str] = None
):
    """Dashboard de mudanças recentes"""
    filters = {
        "user_id": user_id,
        "created_at__gte": datetime.utcnow() - timedelta(days=days)
    }

    if event_type:
        filters["event_type"] = event_type

    changes = db.query("policy_audit_log").filter(**filters).order_by(
        "-created_at"
    ).limit(50).all()

    return {
        "changes": changes,
        "summary": {
            "total": len(changes),
            "by_event_type": group_by(changes, "event_type"),
            "by_agent": group_by(changes, "agent_id")
        }
    }
```

### Frontend Component

```typescript
function RecentChangesTable() {
  const { data } = useQuery('/api/policies/recent-changes?days=7')

  return (
    <Card>
      <h2>Mudanças de Política (últimos 7 dias)</h2>
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Evento</th>
            <th>Agente</th>
            <th>Recurso</th>
            <th>Ação</th>
            <th>Aprovado Por</th>
            <th>Validade</th>
          </tr>
        </thead>
        <tbody>
          {data.changes.map(change => (
            <tr key={change.id}>
              <td>{formatDateTime(change.created_at)}</td>
              <td>
                <Badge color={getEventColor(change.event_type)}>
                  {change.event_type}
                </Badge>
              </td>
              <td>{change.agent_id}</td>
              <td>{change.resource_type}</td>
              <td>{change.action}</td>
              <td>{change.approved_by || '—'}</td>
              <td>{formatTTL(change.ttl_seconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
```

---

## 🔄 Job de Expiração

### Cron Job (roda a cada hora)

```python
@cron("0 * * * *")  # Toda hora
def expire_old_grants():
    """Marca grants expirados"""
    expired = db.query("temporary_grants").filter(
        status="approved",
        expires_at__lt=datetime.utcnow()
    ).all()

    for grant in expired:
        db.update("temporary_grants", grant.id, {"status": "expired"})

        # Audit log
        db.insert("policy_audit_log", {
            "user_id": grant.user_id,
            "agent_id": grant.agent_id,
            "event_type": "grant.expired",
            "resource_type": grant.resource_type,
            "action": grant.action
        })

    print(f"Expired {len(expired)} grants")
```

---

## 🎯 Resumo

### O que você tem agora:

1. ✅ **Perfis pré-configurados** (conservative, default, permissive)
2. ✅ **Just-In-Time Authorization** (agente pede, usuário aprova)
3. ✅ **TTL customizável** (1h, 1d, 1w, 1m, permanente)
4. ✅ **Audit log completo** (imutável, rastreável)
5. ✅ **Dashboard de mudanças** (últimos N dias)
6. ✅ **Auto-expiração** (cron job)

### Segurança

- ✅ Default deny (se não tem política, NEGA)
- ✅ Prioridade de políticas (mais específica vence)
- ✅ Condições customizáveis (max file size, domains, etc.)
- ✅ Audit trail completo (compliance)

### UX

- ✅ Push notification quando autorização é necessária
- ✅ Aprovação rápida (1 clique + TTL)
- ✅ Dashboard visual de políticas ativas

---

**Quer que eu crie o código completo do Policy Engine?** 🚀
