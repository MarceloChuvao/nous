# AI Development Rules - NOUS OS

> **Instruções obrigatórias para IAs trabalhando neste projeto**

---

## 🚨 SEGURANÇA - NUNCA FAÇA ISSO

### ❌ NUNCA commitar arquivos sensíveis:

```
❌ firebase-service-account.json
❌ *-service-account.json
❌ serviceAccountKey.json
❌ firebase-adminsdk-*.json
❌ .env (qualquer arquivo .env que não seja .env.example)
❌ .env.local
❌ .env.production
❌ Chaves de API em código
❌ Tokens de acesso
❌ Senhas ou credentials
```

### ✅ Sempre verificar `.gitignore` está protegendo:
- Service account keys
- Environment variables
- Tokens e secrets
- Chaves privadas

---

## 🏗️ Arquitetura do Projeto

### Estrutura do Monorepo

```
F:\JARVA/
├── apps/
│   ├── lens/              # Frontend (Next.js 14)
│   └── functions/         # Backend (Firebase Functions)
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── vfs/               # Virtual File System
│   └── config/            # Shared configs
└── phases/                # Phase specifications
```

### ✅ Regras de Arquitetura:

1. **Frontend (`apps/lens/`):**
   - Next.js 14 com App Router
   - Componentes em `src/components/`
   - State management com Zustand
   - Styled com Tailwind CSS + shadcn/ui

2. **Backend (`apps/functions/`):**
   - Firebase Functions (Node.js 18+)
   - TypeScript strict mode
   - Firebase Admin SDK
   - OpenAI para CORE Agent

3. **Packages (`packages/`):**
   - Sempre use workspace references: `@nous/types`, `@nous/vfs`
   - Nunca duplique types entre packages
   - Sempre exporte via `index.ts`

---

## 📝 Padrões de Código

### TypeScript

✅ **SEMPRE:**
- Use TypeScript strict mode
- Defina tipos explícitos para funções públicas
- Use interfaces para objetos complexos
- Importe types de `@nous/types`

❌ **NUNCA:**
- Use `any` (use `unknown` se necessário)
- Ignore erros do TypeScript
- Use `@ts-ignore` sem comentário explicativo

### Exemplo:

```typescript
// ✅ BOM
interface UserData {
  id: string;
  name: string;
  email: string;
}

async function getUser(userId: string): Promise<UserData> {
  // implementation
}

// ❌ RUIM
async function getUser(userId: any): Promise<any> {
  // implementation
}
```

---

## 🎨 Frontend (Next.js)

### ✅ Regras:

1. **Componentes:**
   - Use Client Components (`'use client'`) apenas quando necessário
   - Server Components por padrão
   - Componentes reutilizáveis em `src/components/`

2. **Rotas:**
   - Use App Router (Next.js 14)
   - Layouts em `layout.tsx`
   - Loading states em `loading.tsx`
   - Error boundaries em `error.tsx`

3. **Styling:**
   - Tailwind CSS para todos os estilos
   - Use shadcn/ui components quando disponível
   - Classes utilitárias com `cn()` helper

4. **State Management:**
   - Zustand para estado global
   - React hooks para estado local
   - Server State com SWR ou React Query (se necessário)

### ❌ Não faça:

- CSS modules ou styled-components
- Styled-jsx
- Componentes de outras bibliotecas UI (MUI, Ant Design, etc)

---

## 🔥 Backend (Firebase Functions)

### ✅ Regras:

1. **Inicialização do Firebase Admin:**
   ```typescript
   import * as admin from 'firebase-admin';

   // ✅ Simples - funciona em dev e produção
   admin.initializeApp();
   ```

2. **Environment Variables:**
   - Use `.env` para desenvolvimento local
   - Sempre crie `.env.example` com valores placeholder
   - Para produção, use Firebase Functions config

3. **Functions:**
   - Uma function = uma responsabilidade
   - Sempre valide inputs com Zod
   - Sempre trate erros apropriadamente
   - Use TypeScript types de `@nous/types`

4. **VFS (Virtual File System):**
   - Sempre use VFS para acessar dados
   - Nunca acesse Firestore diretamente (exceto em VFS adapter)
   - Paths seguem padrão: `identity:persona`, `context:health.bloodwork`

### Exemplo:

```typescript
import { z } from 'zod';
import { vfs } from '@nous/vfs';
import { PersonaSchema } from '@nous/types';

const InputSchema = z.object({
  userId: z.string(),
  data: PersonaSchema
});

export const updatePersona = onCall(async (request) => {
  // ✅ Validar input
  const { userId, data } = InputSchema.parse(request.data);

  // ✅ Usar VFS
  await vfs.write(`identity:persona`, data, { userId });

  return { success: true };
});
```

---

## 📦 Package Management

### ✅ SEMPRE use pnpm:

```bash
✅ pnpm install
✅ pnpm add <package>
✅ pnpm build
✅ pnpm dev

❌ npm install
❌ yarn add
```

### Workspace References:

```json
{
  "dependencies": {
    "@nous/types": "workspace:*",
    "@nous/vfs": "workspace:*"
  }
}
```

---

## 🔄 Git & Commits

### ✅ Commits:

Formato: `<type>: <description>`

Types:
- `feat:` Nova feature
- `fix:` Bug fix
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

Exemplos:
```
✅ feat: add health agent implementation
✅ fix: resolve VFS path parsing bug
✅ docs: update Firebase setup guide
✅ refactor: simplify CORE agent logic
```

### ❌ Não faça:

```
❌ "changes"
❌ "fix stuff"
❌ "WIP"
❌ "Update index.ts"
```

---

## 🧪 Testing

### ✅ Regras:

1. **Frontend:**
   - Jest + React Testing Library
   - Tests em `__tests__/` ou `*.test.tsx`
   - Coverage mínimo: 70%

2. **Backend:**
   - Firebase Functions Test
   - Tests em `src/__tests__/`
   - Sempre teste VFS operations

### ❌ Não faça:

- Testes que dependem de Firebase real
- Testes sem mocks apropriados
- Testes flaky (que às vezes passam, às vezes falham)

---

## 🚀 Deploy

### ✅ Regras:

1. **Sempre testar localmente primeiro:**
   ```bash
   firebase emulators:start
   ```

2. **Build antes de deploy:**
   ```bash
   pnpm build
   ```

3. **Deploy específico:**
   ```bash
   firebase deploy --only functions
   firebase deploy --only firestore:rules
   ```

### ❌ Não faça:

- Deploy sem testar localmente
- Deploy direto para produção sem staging
- Deploy com testes falhando

---

## 📚 Documentação

### ✅ SEMPRE documente:

1. **Novas features:**
   - Atualizar README.md se necessário
   - Adicionar em PHASE-X-PROGRESS.md
   - Comentários inline para lógica complexa

2. **APIs:**
   - JSDoc para funções públicas
   - Exemplos de uso
   - Tipos de input/output

3. **Configurações:**
   - Atualizar .env.example
   - Documentar novas variáveis de ambiente

### Exemplo:

```typescript
/**
 * Updates user persona in VFS
 *
 * @param userId - User's unique identifier
 * @param persona - Persona data conforming to PersonaSchema
 * @returns Promise resolving to success status
 *
 * @example
 * ```typescript
 * await updatePersona('user123', {
 *   name: 'John',
 *   values: ['health', 'family']
 * });
 * ```
 */
export async function updatePersona(
  userId: string,
  persona: Persona
): Promise<{ success: boolean }> {
  // implementation
}
```

---

## 🔐 Environment Variables

### ✅ Padrões:

1. **Sempre criar `.env.example`:**
   ```bash
   OPENAI_API_KEY=your-key-here
   FIREBASE_PROJECT_ID=your-project-id
   ```

2. **Nunca valores reais em `.env.example`**

3. **Frontend:**
   - Prefixar com `NEXT_PUBLIC_` para valores públicos
   - Sem prefixo para server-side apenas

4. **Backend:**
   - Sem prefixo necessário
   - Carregar via `process.env.VARIABLE_NAME`

---

## 📋 Checklist para IAs

Antes de completar uma tarefa, sempre verificar:

- [ ] Código compila sem erros TypeScript
- [ ] Nenhum arquivo sensível será commitado
- [ ] `.gitignore` está atualizado se necessário
- [ ] Types estão definidos corretamente
- [ ] Documentação foi atualizada
- [ ] Testes passam (se aplicável)
- [ ] Code segue padrões do projeto
- [ ] Não há `console.log` deixados no código
- [ ] Dependencies foram instaladas com `pnpm`

---

## 🎯 VFS (Virtual File System) - IMPORTANTE

### ✅ Sempre use VFS para dados:

```typescript
import { vfs } from '@nous/vfs';

// ✅ Ler dados
const persona = await vfs.read('identity:persona', { userId });

// ✅ Escrever dados
await vfs.write('context:health.bloodwork', data, { userId });

// ✅ Listar
const files = await vfs.list('profile:', { userId });

// ✅ Deletar
await vfs.delete('profile:conversations/123', { userId });
```

### ❌ NUNCA acesse Firestore diretamente:

```typescript
// ❌ ERRADO
const doc = await firestore.collection('users').doc(userId).get();

// ✅ CERTO
const data = await vfs.read('identity:persona', { userId });
```

### Paths VFS:

Formato: `namespace:path.subpath`

Exemplos:
- `identity:persona`
- `identity:boundaries`
- `context:health.bloodwork`
- `context:finance.accounts`
- `profile:conversations/123`
- `profile:decisions`

---

## 🤖 CORE Agent

### ✅ Regras:

1. **Sempre use OpenAI API via SDK oficial**
2. **Validar inputs com Zod**
3. **Contextualizar com VFS data**
4. **Tratar erros gracefully**

### Exemplo:

```typescript
import { OpenAI } from 'openai';
import { vfs } from '@nous/vfs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function coreAgent(message: string, userId: string) {
  // 1. Buscar contexto
  const persona = await vfs.read('identity:persona', { userId });

  // 2. Chamar OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: `You are NOUS. User: ${persona.name}` },
      { role: 'user', content: message }
    ]
  });

  return response.choices[0].message.content;
}
```

---

## 📞 Quando Pedir Ajuda ao Usuário

### ✅ Pergunte quando:

- Escolha de implementação afeta UX significativamente
- Múltiplas abordagens válidas
- Precisa de chave de API externa
- Decisão de arquitetura importante
- Configuração específica do ambiente do usuário

### ❌ Não pergunte para:

- Formatação de código (siga o padrão)
- Nome de variáveis (use convenções)
- Estrutura de pastas (siga a arquitetura)
- Padrões de código (siga este documento)

---

## 🎓 Recursos de Referência

- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js 14 Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Zustand:** https://docs.pmnd.rs/zustand
- **OpenAI API:** https://platform.openai.com/docs

---

## 📊 Fases do Projeto

Sempre verifique a fase atual em `PROJECT-STATUS.md`:

- **PHASE 0:** Foundation (Backend MVP) - 🚧 Em progresso
- **PHASE 1:** Health vertical - 📋 Planejada
- **PHASE 2:** Finance vertical - 📋 Planejada
- **PHASE 3:** Platform & Marketplace - 📋 Planejada

Frontend: Fases 5-14 já implementadas ✅

---

## ✨ Princípios Gerais

1. **Segurança primeiro:** Nunca comprometer security
2. **Simplicidade:** Código simples > Código clever
3. **TypeScript:** Type safety sempre
4. **Testes:** Coverage mínimo de 70%
5. **Documentação:** Código auto-documentado + JSDoc quando necessário
6. **Performance:** Otimizar quando necessário, não prematuramente
7. **User Experience:** UX > Complexidade técnica

---

**Última atualização:** 2025-01-20
**Versão:** 1.0.0

---

## 🔄 Este documento deve ser atualizado quando:

- Novos padrões são adotados
- Novas tecnologias são adicionadas
- Regras de arquitetura mudam
- Boas práticas evoluem

**IAs: Sempre leia este arquivo antes de iniciar trabalho no projeto!**
