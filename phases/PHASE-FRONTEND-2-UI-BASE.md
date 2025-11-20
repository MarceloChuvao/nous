# PHASE-FRONTEND-2: Componentes UI Base

> **Objetivo:** Criar componentes reutilizáveis (Button, Input, Card) e utilitários
> **Duração:** 2-3 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-1-SETUP concluído

---

## 📋 O que vamos fazer

Nesta phase você vai criar:
1. ✅ Componente `Button` (variantes, tamanhos, loading)
2. ✅ Componente `Input` (label, error, helper text)
3. ✅ Componente `Card` (hover effects, shadow)
4. ✅ Utilitários em `lib/utils.ts` (formatação de data, moeda, etc.)

**Ao final:** Sistema de design base pronto para usar em todo o app

---

## 🎨 Passo 1: Componente Button

### 1.1 Criar arquivo

**Caminho:** `src/components/ui/button.tsx`

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            // Variants
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500': variant === 'secondary',
            'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500': variant === 'outline',
            'text-gray-700 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',

            // Sizes
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### 1.2 Testar o Button

Edite temporariamente `src/app/page.tsx`:

```typescript
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Testando Componentes UI
      </h1>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>

        <div className="flex items-center space-x-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <div className="flex items-center space-x-4">
          <Button isLoading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </main>
  )
}
```

**Abra o navegador e veja todos os estilos funcionando!**

---

## 📝 Passo 2: Componente Input

### 2.1 Criar arquivo

**Caminho:** `src/components/ui/input.tsx`

```typescript
import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition',
            {
              'border-gray-300': !error,
              'border-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

### 2.2 Testar o Input

Adicione ao `src/app/page.tsx`:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Testando Componentes UI
      </h1>

      {/* Buttons (do teste anterior) */}
      {/* ... */}

      <div className="mt-12 max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Inputs</h2>

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          helperText="Mínimo 8 caracteres"
        />

        <Input
          label="Erro"
          type="text"
          error="Este campo é obrigatório"
        />

        <Input
          placeholder="Sem label"
        />
      </div>
    </main>
  )
}
```

---

## 🃏 Passo 3: Componente Card

### 3.1 Criar arquivo

**Caminho:** `src/components/ui/card.tsx`

```typescript
import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-soft p-6',
        {
          'hover:shadow-lg transition-shadow cursor-pointer': hover
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### 3.2 Testar o Card

Adicione ao `src/app/page.tsx`:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Testando Componentes UI
      </h1>

      {/* Buttons e Inputs (dos testes anteriores) */}
      {/* ... */}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <h2 className="col-span-full text-2xl font-bold text-gray-900 mb-4">
          Cards
        </h2>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Card Normal
          </h3>
          <p className="text-gray-600">
            Este é um card básico sem hover effect.
          </p>
        </Card>

        <Card hover>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Card com Hover
          </h3>
          <p className="text-gray-600">
            Passe o mouse por cima para ver o efeito!
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Card Customizado
          </h3>
          <p className="text-gray-600">
            Você pode adicionar classes customizadas.
          </p>
        </Card>
      </div>
    </main>
  )
}
```

---

## 🛠️ Passo 4: Utilitários

### 4.1 Criar arquivo

**Caminho:** `src/lib/utils.ts`

```typescript
import { clsx, ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge de classes Tailwind sem conflitos
 * Exemplo: cn('px-2', 'px-4') → 'px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata valores monetários
 * Exemplo: formatCurrency(1234.56) → "R$ 1.234,56"
 */
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value)
}

/**
 * Formata datas
 * Exemplo: formatDate('2025-01-19') → "19/01/2025"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

/**
 * Formata data/hora completa
 * Exemplo: formatDateTime('2025-01-19T10:30:00') → "19/01/2025 10:30"
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

/**
 * Formata tempo relativo
 * Exemplo: formatRelativeTime(Date.now() - 3600000) → "1h atrás"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora mesmo'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`

  return formatDate(date)
}

/**
 * Trunca texto com reticências
 * Exemplo: truncate("Hello World", 8) → "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Capitaliza primeira letra
 * Exemplo: capitalize("hello") → "Hello"
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
```

### 4.2 Testar os Utilitários

Adicione ao `src/app/page.tsx`:

```typescript
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Componentes anteriores */}
      {/* ... */}

      <div className="mt-12 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Utilitários
        </h2>

        <Card>
          <div className="space-y-2 text-sm">
            <p>
              <strong>formatCurrency:</strong> {formatCurrency(1234.56)}
            </p>
            <p>
              <strong>formatDate:</strong> {formatDate(new Date())}
            </p>
            <p>
              <strong>formatRelativeTime:</strong> {formatRelativeTime(new Date(Date.now() - 3600000))}
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ `components/ui/button.tsx` criado e testado
- [ ] ✅ `components/ui/input.tsx` criado e testado
- [ ] ✅ `components/ui/card.tsx` criado e testado
- [ ] ✅ `lib/utils.ts` criado e testado
- [ ] ✅ Todos os componentes renderizando corretamente
- [ ] ✅ Variantes do Button funcionando (primary, secondary, etc.)
- [ ] ✅ Estados do Input funcionando (error, helperText)
- [ ] ✅ Card com hover effect funcionando
- [ ] ✅ Formatações de moeda/data funcionando

---

## 💡 Dicas de Uso

### Usando o Button

```typescript
// Básico
<Button>Clique aqui</Button>

// Com variantes
<Button variant="danger" onClick={() => alert('Deletar!')}>
  Deletar
</Button>

// Com loading
<Button isLoading={isSubmitting}>
  Salvando...
</Button>

// Customizado
<Button className="w-full">
  Botão Full Width
</Button>
```

### Usando o Input

```typescript
// Com label
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Com erro
<Input
  label="Senha"
  type="password"
  error={error}
/>

// Com helper text
<Input
  label="CPF"
  helperText="Apenas números"
/>
```

### Usando o Card

```typescript
// Simples
<Card>
  <h3>Título</h3>
  <p>Conteúdo</p>
</Card>

// Com hover (para links/botões)
<Card hover onClick={() => navigate('/detalhes')}>
  <h3>Clicável</h3>
</Card>

// Customizado
<Card className="border-l-4 border-primary-500">
  <h3>Com borda colorida</h3>
</Card>
```

---

## 🧹 Limpeza

Após testar tudo, **delete o código de teste** do `src/app/page.tsx` e deixe apenas:

```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          NOUS OS
        </h1>
        <p className="text-gray-600">
          Sistema de design pronto!
        </p>
      </div>
    </main>
  )
}
```

---

## 📚 Conceitos Importantes

### forwardRef

Permite que componentes exponham sua referência DOM para o componente pai:

```typescript
const inputRef = useRef<HTMLInputElement>(null)
<Input ref={inputRef} />
inputRef.current?.focus() // ✅ Funciona!
```

### clsx + tailwind-merge

- `clsx`: Combina classes condicionalmente
- `tailwind-merge`: Remove conflitos de classes Tailwind

```typescript
cn('px-2', 'px-4') // → 'px-4' (correto)
clsx('px-2', 'px-4') // → 'px-2 px-4' (errado)
```

---

## ➡️ Próximo Passo

Quando todos os componentes estiverem funcionando:

**Continue para:** `PHASE-FRONTEND-3-AUTH.md`

Onde você vai implementar o sistema de autenticação.

---

**Status:** 🟢 Componentes Base Completos
**Tempo Gasto:** ~2-3 horas
