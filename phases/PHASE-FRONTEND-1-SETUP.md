# PHASE-FRONTEND-1: Setup e Configuração

> **Objetivo:** Instalar Next.js, configurar Tailwind CSS e criar estrutura de pastas
> **Duração:** 1-2 horas
> **Status:** 🟡 Pronto para Iniciar

---

## 📋 O que vamos fazer

Nesta phase você vai:
1. ✅ Criar projeto Next.js 14 com TypeScript
2. ✅ Instalar todas as dependências necessárias
3. ✅ Configurar Tailwind CSS com cores do NOUS
4. ✅ Criar estrutura completa de pastas
5. ✅ Testar que tudo está funcionando

**Ao final:** Você terá um projeto Next.js rodando em `http://localhost:3000`

---

## 🚀 Passo 1: Criar Projeto Next.js

```bash
# Navegar para o diretório do projeto
cd F:\JARVA

# Criar aplicação Next.js com TypeScript
npx create-next-app@latest apps/lens \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

# Entrar no diretório
cd apps/lens
```

**Durante a instalação, se perguntarem:**
- ✅ TypeScript? **Yes**
- ✅ ESLint? **Yes**
- ✅ Tailwind CSS? **Yes**
- ✅ `src/` directory? **Yes**
- ✅ App Router? **Yes**
- ✅ Import alias `@/*`? **Yes**

---

## 📦 Passo 2: Instalar Dependências

```bash
# Dependências principais
npm install zustand recharts lucide-react clsx tailwind-merge

# Plugins do Tailwind
npm install -D @tailwindcss/forms @tailwindcss/typography

# Tipos TypeScript (se necessário)
npm install -D @types/node @types/react @types/react-dom
```

### O que cada dependência faz?

| Dependência | Propósito |
|------------|-----------|
| `zustand` | Estado global (alternativa leve ao Redux) |
| `recharts` | Gráficos para dashboards de saúde/finanças |
| `lucide-react` | Ícones modernos (Heart, DollarSign, etc.) |
| `clsx` | Utilitário para classes CSS condicionais |
| `tailwind-merge` | Merge de classes Tailwind sem conflitos |
| `@tailwindcss/forms` | Estilos bonitos para forms |
| `@tailwindcss/typography` | Tipografia para conteúdo long-form |

---

## 🎨 Passo 3: Configurar Tailwind CSS

### 3.1 Atualizar `tailwind.config.js`

Substitua o conteúdo do arquivo por:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores do NOUS
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Azul principal
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Roxo secundário
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 3.2 Atualizar `src/app/globals.css`

Substitua o conteúdo por:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-100 text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors;
  }
}
```

---

## 🔧 Passo 4: Configurar Next.js

### 4.1 Atualizar `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Otimizações de performance
  swcMinify: true,

  // Configuração de imagens
  images: {
    domains: ['storage.googleapis.com'], // Para avatares/ícones
    formats: ['image/webp', 'image/avif']
  },

  // Variables de ambiente permitidas no cliente
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  }
}

module.exports = nextConfig
```

### 4.2 Criar `.env.local`

Crie o arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 📁 Passo 5: Criar Estrutura de Pastas

### 5.1 Via Comando (Mais Rápido)

```bash
# A partir de apps/lens
cd src

# Componentes
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/chat
mkdir -p components/dashboard

# Outros diretórios
mkdir -p hooks
mkdir -p lib
mkdir -p store
mkdir -p types

# Rotas do App Router
mkdir -p "app/(auth)/login"
mkdir -p "app/(auth)/signup"
mkdir -p "app/(dashboard)/dashboard"
mkdir -p "app/(dashboard)/health"
mkdir -p "app/(dashboard)/finance"
mkdir -p "app/(dashboard)/settings"
mkdir -p "app/(dashboard)/chat"
mkdir -p "app/api/mock"
```

### 5.2 Estrutura Final

Você terá:

```
apps/lens/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── health/
│   │   │   │   └── page.tsx
│   │   │   ├── finance/
│   │   │   │   └── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── mock/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── chat/
│   │   └── dashboard/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   └── types/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🧪 Passo 6: Testar o Setup

### 6.1 Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

Você deve ver:

```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

### 6.2 Abrir no Navegador

Abra `http://localhost:3000` - você deve ver a página padrão do Next.js.

### 6.3 Testar Tailwind

Edite `src/app/page.tsx` temporariamente:

```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-soft">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          NOUS OS - Frontend Setup
        </h1>
        <p className="text-gray-600">
          ✅ Next.js está rodando!
        </p>
        <p className="text-gray-600">
          ✅ Tailwind CSS está configurado!
        </p>
      </div>
    </main>
  )
}
```

**Salve e veja as cores do NOUS aparecendo!**

---

## 🎯 Checklist de Conclusão

Marque conforme completa:

- [ ] ✅ Projeto Next.js criado em `apps/lens`
- [ ] ✅ Dependências instaladas (zustand, recharts, lucide-react, etc.)
- [ ] ✅ `tailwind.config.js` configurado com cores do NOUS
- [ ] ✅ `next.config.js` configurado
- [ ] ✅ `.env.local` criado
- [ ] ✅ Estrutura de pastas completa
- [ ] ✅ `npm run dev` funcionando
- [ ] ✅ Cores do Tailwind aparecendo no navegador

---

## 🐛 Troubleshooting

### Erro: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 is already in use"

```bash
# Usar outra porta
npm run dev -- -p 3001
```

### Tailwind não está aplicando estilos

1. Verifique se `globals.css` está importado em `app/layout.tsx`
2. Reinicie o servidor de desenvolvimento (`Ctrl+C` e `npm run dev`)

---

## 📚 Recursos

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Lucide Icons](https://lucide.dev/icons/)

---

## ➡️ Próximo Passo

Quando tudo estiver funcionando:

**Continue para:** `PHASE-FRONTEND-2-UI-BASE.md`

Onde você vai criar os componentes base (Button, Input, Card).

---

**Status:** 🟢 Setup Completo → Pronto para Codificar
**Tempo Gasto:** ~1-2 horas
