# NOUS OS - Personal AI Operating System

> Sistema operacional pessoal com agentes de IA especializados para gerenciar saúde, finanças e vida pessoal.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Functions-orange.svg)](https://firebase.google.com/)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias](#-tecnologias)
- [Quick Start](#-quick-start)
- [Comandos Disponíveis](#-comandos-disponíveis)
- [Arquitetura](#-arquitetura)
- [Documentação](#-documentação)
- [Status do Projeto](#-status-do-projeto)

---

## 🎯 Visão Geral

**NOUS OS** é um sistema de agentes de IA que atua como um sistema operacional pessoal, gerenciando diferentes aspectos da sua vida através de agentes especializados.

### Componentes Principais

- **LENS** - Frontend (Next.js 14) com interface de usuário completa
- **KERNEL** - Backend (Firebase Functions) com CORE Agent e APIs
- **VFS** - Virtual File System para abstração de dados
- **AGENTS** - Agentes especializados (Health, Finance, etc.)

### Status Atual

- ✅ **Frontend:** 100% completo (16 rotas, 10 fases implementadas)
- 🚧 **Backend:** 35% completo (Fase 0 em progresso)
- 📋 **Fases:** 0-3 planejadas, 5-14 implementadas (frontend)

---

## 📁 Estrutura do Projeto

```
F:\JARVA\
│
├── apps/                           # Aplicações do monorepo
│   ├── lens/                       # Frontend (Next.js 14)
│   │   ├── src/
│   │   │   ├── app/               # App Router (Next.js 14)
│   │   │   │   ├── (auth)/        # Rotas de autenticação
│   │   │   │   ├── (dashboard)/   # Rotas protegidas
│   │   │   │   │   ├── agents/    # Página global de agentes
│   │   │   │   │   ├── chat/      # Chat global
│   │   │   │   │   ├── context/   # Contexto global
│   │   │   │   │   ├── domains/   # Domínios e subdomínios
│   │   │   │   │   ├── logs/      # Logs globais
│   │   │   │   │   └── tasks/     # Tasks globais
│   │   │   │   └── layout.tsx     # Root layout
│   │   │   ├── components/        # Componentes React
│   │   │   │   ├── chat/          # Componentes de chat
│   │   │   │   ├── domains/       # Componentes de domínios
│   │   │   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   │   │   └── ui/            # shadcn/ui components
│   │   │   ├── lib/               # Utilities e mock data
│   │   │   └── store/             # Zustand stores
│   │   ├── public/                # Assets estáticos
│   │   ├── package.json           # Dependencies (Next.js, React, Zustand)
│   │   └── tsconfig.json          # TypeScript config
│   │
│   └── functions/                 # Backend (Firebase Functions)
│       ├── src/
│       │   ├── index.ts           # Entry point (exports all functions)
│       │   ├── core-agent.ts      # CORE Agent API (conversational)
│       │   ├── health-check.ts    # Health check endpoint
│       │   ├── auth/              # (TODO) Auth middleware
│       │   ├── agents/            # (TODO) Agent implementations
│       │   ├── security/          # (TODO) Security middleware
│       │   └── encryption/        # (TODO) Encryption service
│       ├── dist/                  # Compiled JavaScript
│       ├── package.json           # Dependencies (firebase-admin, openai)
│       └── tsconfig.json          # TypeScript config
│
├── packages/                      # Shared packages
│   ├── types/                     # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── identity.ts        # IDENTITY schemas (Persona, Boundaries, Priorities)
│   │   │   ├── context.ts         # CONTEXT schemas (Health, Finance, Calendar)
│   │   │   ├── profile.ts         # PROFILE schemas (Conversations, Decisions, LifeEvents)
│   │   │   ├── vfs.ts             # VFS interfaces
│   │   │   ├── common.ts          # Common types
│   │   │   └── index.ts           # Re-exports
│   │   └── package.json
│   │
│   ├── vfs/                       # Virtual File System abstraction
│   │   ├── src/
│   │   │   ├── vfs.ts             # Base VFS interface + path parsing
│   │   │   ├── firestore-vfs.ts   # Firestore adapter
│   │   │   ├── storage-vfs.ts     # Cloud Storage adapter
│   │   │   └── index.ts           # Exports
│   │   └── package.json
│   │
│   └── config/                    # Shared configs (ESLint, TypeScript base)
│       ├── eslint.config.js
│       └── tsconfig.json
│
├── phases/                        # Phase specifications (PHASE-0 to PHASE-3)
│   ├── PHASE-0-FOUNDATION.md      # Week 1-4: Foundation (Backend MVP)
│   ├── PHASE-1-HEALTH.md          # Week 5-12: Health vertical
│   ├── PHASE-2-FINANCE.md         # Week 13-18: Finance vertical
│   ├── PHASE-3-PLATFORM.md        # Week 19-22: Marketplace & Creator Studio
│   ├── PHASE-FRONTEND-5-TEMPLATES.md  # ✅ Implemented
│   ├── PHASE-FRONTEND-6-DOMAIN-PAGE.md # ✅ Implemented
│   ├── PHASE-FRONTEND-7-SUBDOMAIN.md   # ✅ Implemented
│   ├── PHASE-FRONTEND-8-AGENT-MARKETPLACE.md # ✅ Implemented
│   └── PHASE-FRONTEND-9-CHAT.md        # ✅ Implemented
│
├── specs/                         # Technical specifications
│   ├── DATA-LAYER-SPEC.md         # VFS, IDENTITY, CONTEXT, PROFILE
│   └── SECURITY-SPEC.md           # Auth, encryption, security patterns
│
├── scripts/                       # Utility scripts
│   ├── setup.sh                   # Initial setup script
│   └── deploy.sh                  # Deployment script
│
├── arquivos/                      # Project assets and documents
├── core/                          # Core logic (legacy/reference)
├── hooks/                         # Git hooks or custom hooks
├── identity/                      # IDENTITY examples/templates
├── logs/                          # Development logs
├── output_formats/                # Output format templates
├── profile/                       # PROFILE examples/templates
├── working/                       # Working directory (temporary files)
│
├── .claude/                       # Claude Code configuration
├── .turbo/                        # TurboRepo cache
├── .vscode/                       # VS Code settings
├── node_modules/                  # Dependencies (root + workspaces)
│
├── firebase.json                  # Firebase config
├── .firebaserc                    # Firebase project alias
├── firestore.rules                # Firestore security rules
├── firestore.indexes.json         # Firestore indexes
├── storage.rules                  # Cloud Storage security rules
│
├── package.json                   # Root package (Turbo scripts)
├── pnpm-workspace.yaml            # pnpm workspace config
├── pnpm-lock.yaml                 # Lockfile
├── turbo.json                     # TurboRepo configuration
├── tsconfig.json                  # Root TypeScript config
│
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
│
├── QUICKSTART.md                  # 5-minute setup guide
├── FIREBASE-SETUP.md              # Detailed Firebase setup
├── PROJECT-STATUS.md              # Overall project status
├── PHASE-0-PROGRESS.md            # Phase 0 progress tracker
├── README.md                      # This file
│
├── NOUS-PRD-MAIN.md               # Main Product Requirements Document
├── NOUS-UNIFIED-PRD.md            # Comprehensive PRD
├── NOUS-COMO-FUNCIONA.md          # How NOUS works (Portuguese)
└── NOUS-MELHORIAS-E-GAPS.md       # Improvements and gaps analysis
```

---

## 🛠️ Tecnologias

### Frontend (apps/lens)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4.1
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand 5.0
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend (apps/functions)
- **Runtime:** Node.js 18+ (Firebase Functions)
- **Language:** TypeScript 5.7
- **Database:** Firestore
- **Storage:** Cloud Storage
- **Auth:** Firebase Auth
- **AI/LLM:** OpenAI API
- **Validation:** Zod

### Monorepo & Tooling
- **Monorepo:** TurboRepo 2.3
- **Package Manager:** pnpm 9.15
- **Build Tool:** TypeScript Compiler (tsc)
- **Linting:** ESLint 9
- **Formatting:** Prettier 3.4
- **CI/CD:** GitHub Actions (planned)

### Infrastructure
- **Hosting (Frontend):** Vercel (planned)
- **Hosting (Backend):** Firebase Functions
- **Database:** Firestore
- **Storage:** Cloud Storage
- **Auth:** Firebase Auth + 2FA

---

## ⚡ Quick Start

### Opção 1: Frontend apenas (sem Firebase)

```bash
# 1. Instalar dependências
pnpm install

# 2. Build packages
pnpm build

# 3. Iniciar frontend
cd apps/lens
pnpm dev
```

**Acesse:** http://localhost:3000

⚠️ **Limitação:** Backend não funcionará

---

### Opção 2: Full Stack (com Firebase Emulators)

#### Setup Inicial (apenas 1x)

```bash
# A. Instalar tudo
pnpm install

# B. Build packages
pnpm build

# C. Configurar environment variables
cp .env.example .env.local
cp apps/lens/.env.example apps/lens/.env.local
cp apps/functions/.env.example apps/functions/.env.local
# Edite os .env.local files conforme necessário
```

#### Iniciar Desenvolvimento

**Terminal 1:** Firebase Emulators
```bash
firebase emulators:start
```

**Terminal 2:** Frontend + Functions (watch mode)
```bash
pnpm dev
```

**URLs:**
- Frontend: http://localhost:3000
- Emulator UI: http://localhost:4000
- Functions: http://localhost:5001/nous-os-dev/us-central1

📘 **Setup detalhado:** Ver [QUICKSTART.md](./QUICKSTART.md) e [FIREBASE-SETUP.md](./FIREBASE-SETUP.md)

---

## 🚀 Comandos Disponíveis

### Root (Monorepo)

Execute no diretório raiz `F:\JARVA\`:

```bash
# Development
pnpm dev              # Inicia todos os apps em modo dev (Turbo)
pnpm build            # Build todos os packages e apps (Turbo)
pnpm lint             # Lint todos os packages e apps (Turbo)
pnpm test             # Roda testes em todos os packages (Turbo)

# Maintenance
pnpm clean            # Limpa todos os builds (dist/, .next/, .turbo/)
pnpm format           # Formata código com Prettier

# Deployment
pnpm deploy:functions # Deploy Firebase Functions
pnpm deploy:frontend  # Deploy frontend no Vercel
```

---

### Frontend (apps/lens)

Execute em `F:\JARVA\apps\lens\`:

```bash
# Development
pnpm dev              # Inicia Next.js dev server (http://localhost:3000)
pnpm build            # Build production (.next/)
pnpm start            # Inicia servidor de produção

# Quality
pnpm lint             # ESLint + Next.js lint
pnpm test             # Roda testes com Jest
pnpm test:watch       # Testes em watch mode
```

**Rotas disponíveis:**
- `/login` - Login page
- `/dashboard` - Dashboard principal
- `/domains` - Lista de domínios
- `/domains/templates` - Templates de domínios
- `/domains/:domainId` - Página do domínio
- `/domains/:domainId/:subdomainId` - Página do subdomínio (6 tabs)
- `/domains/:domainId/:subdomainId/agents/:agentId` - Detalhe do agente
- `/agents` - My Agents (global)
- `/tasks` - Tasks (global)
- `/logs` - Logs (global)
- `/context` - Context (global)
- `/chat` - Chat (global)

---

### Backend (apps/functions)

Execute em `F:\JARVA\apps\functions\`:

```bash
# Development
pnpm dev              # Build + watch mode (tsc --watch)
pnpm build            # Build TypeScript → JavaScript (dist/)

# Local Testing
pnpm serve            # Build + start Firebase emulators (functions only)
pnpm shell            # Firebase Functions shell (REPL)
pnpm start            # Alias para pnpm shell

# Deployment
pnpm deploy           # Deploy para Firebase Functions (produção)
pnpm logs             # Ver logs de produção

# Maintenance
pnpm clean            # Remove dist/
pnpm lint             # ESLint
```

**Functions disponíveis:**
- `healthCheck` - GET http://localhost:5001/.../healthCheck
- `coreAgentAPI` - POST http://localhost:5001/.../coreAgentAPI

---

### Firebase

#### Instalação do Firebase CLI

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalação
firebase --version
```

#### Comandos de Gerenciamento

Execute no diretório raiz:

```bash
# Authentication
firebase login                        # Login no Firebase
firebase logout                       # Logout

# Project Management
firebase projects:list                # Listar projetos
firebase use --add                    # Adicionar projeto ao .firebaserc
firebase init                         # Inicializar Firebase no projeto
```

#### Emulators

```bash
# Emulators
firebase emulators:start              # Inicia todos os emulators (Auth, Functions, Firestore, Storage)
firebase emulators:start --only auth  # Apenas Auth emulator
firebase emulators:start --only functions  # Apenas Functions
firebase emulators:export ./backup    # Exporta dados dos emulators
```

#### Deployment

```bash
# Deployment
firebase deploy                       # Deploy tudo
firebase deploy --only functions      # Deploy apenas functions
firebase deploy --only firestore:rules  # Deploy apenas Firestore rules
firebase deploy --only storage:rules  # Deploy apenas Storage rules
```

**Emulator Ports:**
- Auth: `localhost:9099`
- Functions: `localhost:5001`
- Firestore: `localhost:8080`
- Storage: `localhost:9199`
- Emulator UI: `localhost:4000`

---

### Packages

Execute nos respectivos diretórios:

#### packages/types
```bash
pnpm build            # Build TypeScript declarations
```

#### packages/vfs
```bash
pnpm build            # Build VFS package
pnpm dev              # Build + watch mode
```

#### packages/config
```bash
# Apenas configs, sem build necessário
```

---

### TurboRepo

```bash
# Rodar comando em workspace específico
turbo run build --filter=lens          # Build apenas lens
turbo run dev --filter=functions       # Dev apenas functions

# Rodar em múltiplos workspaces
turbo run build --filter=./packages/*  # Build todos os packages

# Cache management
turbo run build --force                # Ignorar cache
turbo run clean                        # Limpar cache do Turbo
```

---

### Git & Version Control

```bash
# Common workflows
git status                            # Ver mudanças
git add .                             # Stage tudo
git commit -m "message"               # Commit
git push                              # Push para remote

# Branches
git checkout -b feature/nome          # Nova branch
git checkout main                     # Voltar para main
git merge feature/nome                # Merge branch
```

---

### Utilidades

```bash
# Node/pnpm version check
node --version                        # v18+
pnpm --version                        # v9+
firebase --version                    # v13+

# Port management (Windows)
netstat -ano | findstr :5001          # Ver processo na porta 5001
taskkill /PID <PID> /F                # Matar processo

# Port management (Linux/Mac)
lsof -ti:5001 | xargs kill -9         # Matar processo na porta 5001

# Cleanup (if things break)
pnpm clean                            # Clean builds
rm -rf node_modules pnpm-lock.yaml    # Remove dependencies
pnpm install                          # Reinstall
pnpm build                            # Rebuild
```

---

## 🏗️ Arquitetura

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      NOUS OS                             │
└──────────────────────────────────────────────────────────┘

┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   LENS      │◄────────►│   KERNEL    │◄────────►│ DATA LAYER  │
│  (Frontend) │   HTTP   │  (Backend)  │          │             │
│             │          │             │          │  Firestore  │
│  Next.js 14 │          │  Firebase   │          │  Storage    │
│  React 19   │          │  Functions  │          │  Auth       │
│  Zustand    │          │             │          │             │
└─────────────┘          │  CORE Agent │          │  VFS        │
                         │  Agents     │          │  IDENTITY   │
                         │  APIs       │          │  CONTEXT    │
                         └─────────────┘          │  PROFILE    │
                                                  └─────────────┘
```

### Data Layer (VFS)

```
VFS Path Examples:
- identity:persona              → users/{userId}/identity/persona
- identity:boundaries           → users/{userId}/identity/boundaries
- context:health.bloodwork      → users/{userId}/context/health.bloodwork
- context:finance.accounts      → users/{userId}/context/finance.accounts
- profile:conversations         → users/{userId}/profile/conversations
```

### Tech Stack per Component

| Component | Tech | Description |
|-----------|------|-------------|
| **LENS** | Next.js 14 + Tailwind | User interface, 16 routes |
| **KERNEL** | Firebase Functions | Backend APIs, CORE Agent |
| **VFS** | TypeScript + Firestore | Data abstraction layer |
| **AGENTS** | LangChain + OpenAI | Specialized AI agents |
| **SECURITY** | Firebase Auth + KMS | Authentication + Encryption |

---

## 📚 Documentação

### Getting Started
- [QUICKSTART.md](./QUICKSTART.md) - Setup rápido (5 minutos)
- [FIREBASE-SETUP.md](./FIREBASE-SETUP.md) - Configuração Firebase detalhada
- [FIREBASE-SERVICE-ACCOUNT-SETUP.md](./FIREBASE-SERVICE-ACCOUNT-SETUP.md) - Service Account setup

### Development Guidelines
- [AI-DEVELOPMENT-RULES.md](./AI-DEVELOPMENT-RULES.md) - **Regras obrigatórias para desenvolvimento (humanos e IAs)**
  - Padrões de código
  - Segurança e boas práticas
  - Arquitetura do projeto
  - Git conventions

### Project Status
- [PROJECT-STATUS.md](./PROJECT-STATUS.md) - Status geral do projeto
- [PHASE-0-PROGRESS.md](./PHASE-0-PROGRESS.md) - Progresso da Fase 0 (Foundation)

### Product Requirements
- [NOUS-PRD-MAIN.md](./NOUS-PRD-MAIN.md) - PRD principal
- [NOUS-UNIFIED-PRD.md](./NOUS-UNIFIED-PRD.md) - PRD unificado completo
- [NOUS-COMO-FUNCIONA.md](./NOUS-COMO-FUNCIONA.md) - Como funciona (PT-BR)
- [NOUS-MELHORIAS-E-GAPS.md](./NOUS-MELHORIAS-E-GAPS.md) - Melhorias e gaps

### Phase Specifications
- [phases/PHASE-0-FOUNDATION.md](./phases/PHASE-0-FOUNDATION.md) - Fase 0 (Weeks 1-4)
- [phases/PHASE-1-HEALTH.md](./phases/PHASE-1-HEALTH.md) - Fase 1 (Weeks 5-12)
- [phases/PHASE-2-FINANCE.md](./phases/PHASE-2-FINANCE.md) - Fase 2 (Weeks 13-18)
- [phases/PHASE-3-PLATFORM.md](./phases/PHASE-3-PLATFORM.md) - Fase 3 (Weeks 19-22)

### Technical Specs
- [specs/DATA-LAYER-SPEC.md](./specs/DATA-LAYER-SPEC.md) - VFS, schemas, data flow
- [specs/SECURITY-SPEC.md](./specs/SECURITY-SPEC.md) - Auth, encryption, security

---

## 📊 Status do Projeto

### Frontend (apps/lens) - ✅ 100% Completo

**Implementado:**
- ✅ 16 rotas funcionais
- ✅ 10 fases implementadas (Phases 5-14)
- ✅ ~3,800 linhas de código
- ✅ Templates system
- ✅ Domain/Subdomain management
- ✅ Agent Marketplace UI
- ✅ Chat system (global + context-aware)
- ✅ Agent detail pages
- ✅ My Agents dashboard
- ✅ Tasks monitoring
- ✅ Logs viewer
- ✅ Context overview

### Backend (apps/functions) - 🚧 35% Completo

**Implementado (Week 1-2):**
- ✅ Monorepo setup (TurboRepo)
- ✅ VFS interface (read, write, list, delete, exists)
- ✅ Firestore adapter
- ✅ TypeScript types (IDENTITY, CONTEXT, PROFILE)
- ✅ CORE Agent skeleton (echo mode)

**Pendente (Week 2-4):**
- ⏳ Encryption Service (PII protection)
- ⏳ Audit Logging
- ⏳ Firebase Auth setup
- ⏳ Security Middleware
- ⏳ CORE Agent (intent classification, data routing, synthesis)
- ⏳ Frontend ↔ Backend integration

**Detalhes:** Ver [PHASE-0-PROGRESS.md](./PHASE-0-PROGRESS.md)

---

## 🎯 Próximos Passos

### Immediate (Esta Semana)
1. Criar Firebase project no console
2. Habilitar serviços (Firestore, Auth, Storage, Functions)
3. Configurar environment variables
4. Implementar Encryption Service
5. Implementar Audit Logging

### Short Term (2-4 Semanas)
1. Implementar Firebase Auth (email + Google OAuth)
2. Implementar Security Middleware
3. Implementar CORE Agent completo
4. Conectar chat UI ao backend real
5. Testar fluxo end-to-end

### Medium Term (2-3 Meses)
1. Implementar Finance vertical backend
2. Integrar Open Finance (Pluggy)
3. Deploy financial agents
4. Launch beta (50 users)

### Long Term (6+ Meses)
1. Launch Health vertical
2. Open Creator Studio (Marketplace)
3. Scale to 1000+ users

---

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento. Para contribuir:

1. Clone o repositório
2. Crie uma branch: `git checkout -b feature/nome`
3. Commit suas mudanças: `git commit -m "Add feature"`
4. Push para a branch: `git push origin feature/nome`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - Ver LICENSE file

---

## 📞 Suporte

**Issues:** Crie uma issue no GitHub

**Documentação:** Ver links acima

**Email:** [adicionar email]

---

## 🙏 Agradecimentos

- Next.js team
- Firebase team
- shadcn/ui
- TurboRepo
- Community contributors

---

**Última atualização:** 2025-01-20
**Versão:** 1.0.0 (Phase 0 em progresso)
