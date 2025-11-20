# Firebase Setup Guide

> **Objetivo:** Configurar Firebase project para desenvolvimento local e produção

---

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **pnpm 9+** instalado
3. **Conta Google** (para Firebase Console)
4. **Firebase CLI** instalado globalmente

---

## 🚀 Setup Passo a Passo

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

Verificar instalação:
```bash
firebase --version
# Deve retornar: 13.x.x ou superior
```

---

### 2. Login no Firebase

```bash
firebase login
```

Isso abrirá seu navegador para autenticação com sua conta Google.

---

### 3. Criar Novo Projeto Firebase

**Opção A: Via Console (Recomendado)**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Add Project"**
3. Nome do projeto: `nous-os-dev` (ou outro nome)
4. Desabilite Google Analytics (opcional para dev)
5. Clique em **"Create Project"**

**Opção B: Via CLI**

```bash
firebase projects:create nous-os-dev
```

---

### 4. Configurar Projeto Local

No diretório raiz do projeto (`F:\JARVA`):

```bash
firebase use --add
```

Selecione o projeto `nous-os-dev` e dê o alias `default`.

Isso atualizará o arquivo `.firebaserc`:
```json
{
  "projects": {
    "default": "nous-os-dev"
  }
}
```

---

### 5. Habilitar Serviços no Firebase Console

Acesse [Firebase Console](https://console.firebase.google.com/) → Seu projeto

#### 5.1 Firestore Database
1. **Build** → **Firestore Database** → **Create database**
2. Modo: **Test mode** (para desenvolvimento)
3. Região: **us-central1** (ou sua preferência)
4. Clique em **Enable**

#### 5.2 Cloud Storage
1. **Build** → **Storage** → **Get Started**
2. Modo: **Test mode** (para desenvolvimento)
3. Região: **us-central1** (mesma do Firestore)
4. Clique em **Done**

#### 5.3 Authentication
1. **Build** → **Authentication** → **Get Started**
2. **Sign-in method** tab
3. Habilite:
   - **Email/Password** → Enable → Save
   - **Google** → Enable → Configure → Save

#### 5.4 Cloud Functions
1. **Build** → **Functions** → **Get Started**
2. Upgrade para **Blaze Plan** (pay-as-you-go)
   - **Nota:** Tem free tier generoso, mas requer cartão de crédito
   - Functions requer Blaze plan para deploy

---

### 6. Obter Credenciais do Firebase

#### 6.1 Credenciais do Frontend (Web App)

1. Firebase Console → **Project Settings** (⚙️ no topo)
2. Role até **"Your apps"**
3. Clique no ícone **Web** (`</>`)
4. Registre seu app:
   - App nickname: `nous-web`
   - **NÃO** marque "Also set up Firebase Hosting"
   - Clique em **Register app**
5. Copie o `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "nous-os-dev.firebaseapp.com",
  projectId: "nous-os-dev",
  storageBucket: "nous-os-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

#### 6.2 Credenciais do Backend (Service Account)

1. Firebase Console → **Project Settings** → **Service accounts** tab
2. Clique em **Generate new private key**
3. Confirme e baixe o arquivo JSON
4. **IMPORTANTE:** Guarde esse arquivo em local seguro, não commite no Git!

O arquivo terá esse formato:
```json
{
  "type": "service_account",
  "project_id": "nous-os-dev",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@nous-os-dev.iam.gserviceaccount.com",
  ...
}
```

---

### 7. Configurar Variáveis de Ambiente

#### 7.1 Root `.env.local`

Crie `F:\JARVA\.env.local`:

```bash
cp .env.example .env.local
```

Preencha com os valores do passo 6:

```env
# Frontend (do firebaseConfig)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nous-os-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nous-os-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nous-os-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend (do service account JSON)
FIREBASE_PROJECT_ID=nous-os-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@nous-os-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI (se tiver)
OPENAI_API_KEY=sk-your-key

# Environment
NODE_ENV=development

# API URLs (emulators)
NEXT_PUBLIC_API_URL=http://localhost:5001/nous-os-dev/us-central1
NEXT_PUBLIC_EMULATOR=true

# Security (gere chaves aleatórias)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

#### 7.2 Apps `.env.local`

```bash
# Frontend
cp apps/lens/.env.example apps/lens/.env.local
# Preencha com as mesmas credenciais

# Functions
cp apps/functions/.env.example apps/functions/.env.local
# Preencha com OpenAI key e secrets
```

---

### 8. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

Isso fará deploy das rules definidas em:
- `firestore.rules`
- `storage.rules`

---

### 9. Testar Emuladores Localmente

Inicie os emuladores Firebase:

```bash
firebase emulators:start
```

Você verá:
```
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! It is now safe to connect your app. │
│ i  View Emulator UI at http://localhost:4000                │
└─────────────────────────────────────────────────────────────┘

┌───────────┬────────────────┬─────────────────────────────────┐
│ Emulator  │ Host:Port      │ View in Emulator UI             │
├───────────┼────────────────┼─────────────────────────────────┤
│ Auth      │ localhost:9099 │ http://localhost:4000/auth      │
│ Functions │ localhost:5001 │ http://localhost:4000/functions │
│ Firestore │ localhost:8080 │ http://localhost:4000/firestore │
│ Storage   │ localhost:9199 │ http://localhost:4000/storage   │
└───────────┴────────────────┴─────────────────────────────────┘
```

**Emulator UI:** http://localhost:4000

---

### 10. Iniciar Desenvolvimento

Em terminais separados:

```bash
# Terminal 1: Emuladores Firebase
firebase emulators:start

# Terminal 2: Frontend + Functions (watch mode)
pnpm dev
```

---

## 🧪 Testar Setup

### Teste 1: Health Check Function

```bash
curl http://localhost:5001/nous-os-dev/us-central1/healthCheck
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "NOUS OS Functions are running",
  "timestamp": "2025-01-20T...",
  "version": "1.0.0"
}
```

### Teste 2: CORE Agent Echo

```bash
curl -X POST http://localhost:5001/nous-os-dev/us-central1/coreAgentAPI \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello NOUS"}'
```

Deve retornar:
```json
{
  "response": "Echo: Hello NOUS",
  "timestamp": "2025-01-20T...",
  "status": "success"
}
```

### Teste 3: Frontend

Abra http://localhost:3000/login

Você deve ver a página de login.

---

## 🔐 Security Checklist

- [ ] `.env.local` adicionado ao `.gitignore` (já está)
- [ ] Service account JSON **NÃO** commitado
- [ ] Firestore rules deployadas
- [ ] Storage rules deployadas
- [ ] Authentication configurado
- [ ] Emulators funcionando

---

## 📚 Próximos Passos

1. ✅ Firebase configurado
2. ⏳ Implementar VFS completo (Week 2)
3. ⏳ Implementar Security Middleware (Week 3)
4. ⏳ Implementar CORE Agent (Week 4)

---

## 🐛 Troubleshooting

### Erro: "Firebase project not found"
```bash
firebase use --add
# Selecione o projeto correto
```

### Erro: "Functions require Blaze plan"
Upgrade para Blaze plan no Firebase Console.

### Erro: "Port already in use"
Emulators já rodando. Mate o processo:
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5001 | xargs kill -9
```

### Emulator UI não abre
Verifique firewall ou acesse manualmente:
http://localhost:4000

---

## 📞 Recursos

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Docs](https://firebase.google.com/docs/cli)
- [Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Functions Docs](https://firebase.google.com/docs/functions)
