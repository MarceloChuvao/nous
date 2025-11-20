# NOUS - Próximos Passos

## ✅ Concluído Até Agora:

1. ✅ Firebase CLI instalado
2. ✅ Projeto Firebase conectado (nous-e3e7a)
3. ✅ Variáveis de ambiente configuradas
4. ✅ firebase.json criado
5. ✅ Firestore Database habilitado
6. ✅ Firestore rules deployadas
7. ✅ Build completo (packages + frontend + functions)
8. ✅ Código publicado no GitHub

---

## 🔴 Pendências Críticas:

### 1. Atualizar Java para versão 21+

**Problema:** Firebase Emulators requer Java 21+, mas você tem Java 8

**Solução:**
- Download JDK 21: https://www.oracle.com/java/technologies/downloads/#java21
- Ou Amazon Corretto (free): https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html

**Verificar após instalar:**
```bash
java -version
# Deve mostrar: java version "21.x.x"
```

---

### 2. Habilitar Firebase Storage

**Link:** https://console.firebase.google.com/project/nous-e3e7a/storage

**Passos:**
1. Clique em "Get Started"
2. Escolha "Start in test mode"
3. Região: us-central
4. Clique em "Done"

**Depois de habilitar:**
```bash
firebase deploy --only storage:rules
```

---

### 3. Baixar Service Account Key

**Link:** https://console.firebase.google.com/project/nous-e3e7a/settings/serviceaccounts/adminsdk

**Passos:**
1. Clique em "Generate new private key"
2. Salvar como: `F:\JARVA\firebase-service-account.json`

⚠️ **IMPORTANTE:** Arquivo já está no .gitignore, não será commitado!

---

### 4. (Opcional) Configurar OpenAI API Key

Se você tem uma chave OpenAI, adicione em:

```
F:\JARVA\apps\functions\.env
```

Edite a linha:
```bash
OPENAI_API_KEY=sk-sua-chave-real-aqui
```

---

## 🚀 Depois de Resolver as Pendências:

### Iniciar Firebase Emulators:

```bash
firebase emulators:start
```

Vai abrir:
- 🔥 Emulator UI: http://localhost:4000
- ⚡ Functions: http://localhost:5001
- 🗄️ Firestore: http://localhost:8080
- 🔐 Auth: http://localhost:9099

### Iniciar Frontend:

Em outro terminal:

```bash
cd apps/lens
pnpm dev
```

Frontend: http://localhost:3000

---

## 🧪 Testar Setup:

### Teste 1: Health Check

```bash
curl http://localhost:5001/nous-e3e7a/us-central1/healthCheck
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "NOUS OS Functions are running"
}
```

### Teste 2: CORE Agent

```bash
curl -X POST http://localhost:5001/nous-e3e7a/us-central1/coreAgentAPI \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello NOUS"}'
```

### Teste 3: Frontend

Acesse: http://localhost:3000/login

---

## 📊 Status Atual:

```
✅ Projeto estruturado
✅ Código no GitHub
✅ Dependências instaladas
✅ Firebase básico configurado
✅ Firestore habilitado e rules deployadas
✅ Build funcionando

⏳ Java 21+ (necessário para emulators)
⏳ Firebase Storage (necessário para storage rules)
⏳ Service Account (necessário para desenvolvimento)
⏳ OpenAI Key (opcional - só para chat)
```

---

## 🎯 Ordem Recomendada:

1. **Primeiro:** Atualizar Java 21
2. **Segundo:** Habilitar Firebase Storage
3. **Terceiro:** Baixar Service Account
4. **Quarto:** Testar Emulators + Frontend
5. **Quinto (Opcional):** Adicionar OpenAI Key

---

## 📞 Links Úteis:

- GitHub: https://github.com/MarceloChuvao/nous
- Firebase Console: https://console.firebase.google.com/project/nous-e3e7a
- JDK 21 Download: https://www.oracle.com/java/technologies/downloads/#java21

---

**Última atualização:** 2025-01-20
