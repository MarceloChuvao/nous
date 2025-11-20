# NOUS Project Rules (Quick Reference)

> **Leia o arquivo completo: `/AI-DEVELOPMENT-RULES.md`**

---

## 🚨 Regras Críticas de Segurança

### ❌ NUNCA commitar:
- `*-service-account.json`
- `.env` (exceto `.env.example`)
- Chaves de API em código
- Tokens, passwords, credentials

### ✅ Sempre:
- Verificar `.gitignore` antes de commit
- Usar `.env.example` para templates
- Service account na raiz: `firebase-service-account.json`

---

## 🏗️ Arquitetura

```
apps/lens/        → Frontend (Next.js 14)
apps/functions/   → Backend (Firebase Functions)
packages/types/   → Shared types
packages/vfs/     → Virtual File System
```

---

## 📝 Padrões Rápidos

### TypeScript
- ✅ Strict mode
- ✅ Tipos explícitos
- ❌ `any`

### Frontend
- ✅ Server Components por padrão
- ✅ Tailwind CSS + shadcn/ui
- ✅ Zustand para estado global

### Backend
- ✅ Sempre use VFS para dados
- ✅ Valide inputs com Zod
- ✅ `admin.initializeApp()` sem config

### Package Manager
- ✅ `pnpm` SEMPRE
- ❌ `npm` ou `yarn`

### Git Commits
```
feat: nova feature
fix: correção de bug
docs: documentação
refactor: refatoração
```

---

## 🎯 VFS Paths

Sempre use VFS, nunca Firestore direto:

```typescript
// ✅ CERTO
await vfs.read('identity:persona', { userId });
await vfs.write('context:health.bloodwork', data, { userId });

// ❌ ERRADO
await firestore.collection('users').doc(userId).get();
```

---

## 📚 Documentação Completa

**Ver:** `/AI-DEVELOPMENT-RULES.md`

---

**Projeto:** NOUS OS v1.0.0
**Fase Atual:** PHASE 0 (Foundation) - 35% completo
