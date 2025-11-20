# PHASE-FRONTEND-3: Autenticação

> **Objetivo:** Implementar sistema de autenticação com Zustand e proteção de rotas
> **Duração:** 3-4 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-2-UI-BASE concluído

---

## 📋 O que vamos fazer

Nesta phase você vai:
1. ✅ Criar estado global de autenticação (Zustand)
2. ✅ Criar tela de login
3. ✅ Criar tela de signup (cadastro)
4. ✅ Implementar proteção de rotas
5. ✅ Testar fluxo completo (login → dashboard → logout)

**Ao final:** Sistema de auth funcional com mock (sem backend ainda)

---

## 🗄️ Passo 1: Estado Global com Zustand

### 1.1 Criar arquivo de store

**Caminho:** `src/store/auth.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000))

          // TODO: Substituir por chamada real à API
          // Mock: aceita qualquer email/senha
          const mockUser = {
            id: '1',
            name: email.split('@')[0],
            email: email
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true })

        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000))

          // TODO: Substituir por chamada real à API
          const mockUser = {
            id: Date.now().toString(),
            name,
            email
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      }
    }),
    {
      name: 'nous-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
```

### 1.2 Testar o store

Crie um arquivo temporário para testar:

**`src/app/test-auth/page.tsx`:**

```typescript
'use client'

import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

export default function TestAuthPage() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthStore()

  const handleLogin = async () => {
    try {
      await login('teste@email.com', '12345')
      alert('Login bem-sucedido!')
    } catch (error) {
      alert('Erro no login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Teste de Autenticação</h1>

      <div className="space-y-4">
        <p>
          <strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}
        </p>
        <p>
          <strong>Usuário:</strong> {user?.name || 'Nenhum'}
        </p>

        <div className="flex space-x-4">
          <Button onClick={handleLogin} isLoading={isLoading}>
            Login Mock
          </Button>
          <Button onClick={logout} variant="secondary">
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Abra:** `http://localhost:3000/test-auth`

Teste:
- ✅ Clicar em "Login Mock" deve autenticar
- ✅ Estado deve persistir (recarregue a página)
- ✅ Clicar em "Logout" deve desautenticar

---

## 🔐 Passo 2: Tela de Login

### 2.1 Criar página de login

**Caminho:** `src/app/(auth)/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore(state => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Email ou senha incorretos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg" />
            <span className="text-3xl font-bold text-gray-900">NOUS</span>
          </div>
          <p className="mt-2 text-gray-600">Seu Sistema Operacional para a Vida</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2.2 Testar login

Abra `http://localhost:3000/login` e teste:
- ✅ Digite qualquer email/senha
- ✅ Clique em "Entrar"
- ✅ Deve redirecionar para `/dashboard` (mesmo que a página não exista ainda)

---

## ✍️ Passo 3: Tela de Signup

### 3.1 Criar página de cadastro

**Caminho:** `src/app/(auth)/signup/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'

export default function SignupPage() {
  const router = useRouter()
  const signup = useAuthStore(state => state.signup)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      await signup(name, email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg" />
            <span className="text-3xl font-bold text-gray-900">NOUS</span>
          </div>
          <p className="mt-2 text-gray-600">Crie sua conta</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Nome completo"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Confirmar senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3.2 Testar signup

Abra `http://localhost:3000/signup` e teste:
- ✅ Preencha todos os campos
- ✅ Teste validação de senha (mínimo 6 caracteres)
- ✅ Teste confirmação de senha (devem coincidir)
- ✅ Clique em "Criar Conta"
- ✅ Deve criar usuário e redirecionar para `/dashboard`

---

## 🛡️ Passo 4: Proteção de Rotas

### 4.1 Criar hook useAuth

**Caminho:** `src/hooks/useAuth.ts`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login')
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router])

  return { isAuthenticated, user, isLoading }
}
```

### 4.2 Criar página de dashboard (temporária)

**Caminho:** `src/app/(dashboard)/dashboard/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const logout = useAuthStore(state => state.logout)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // useAuth vai redirecionar
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name}! 👋
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bem-vindo ao NOUS!
            </h2>
            <p className="text-gray-600">
              Você está autenticado e pode acessar o dashboard.
            </p>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Seus Dados
            </h2>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>ID:</strong> {user?.id}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### 4.3 Atualizar página inicial

**Caminho:** `src/app/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function HomePage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  useEffect(() => {
    // Redirecionar automaticamente
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecionando...</p>
    </div>
  )
}
```

---

## 🧪 Passo 5: Testar Fluxo Completo

### 5.1 Fluxo de Login

1. Abra `http://localhost:3000` → deve redirecionar para `/login`
2. Faça login com qualquer email/senha
3. Deve redirecionar para `/dashboard`
4. Veja seu nome e dados
5. Clique em "Sair"
6. Deve voltar para `/login`

### 5.2 Fluxo de Signup

1. Abra `http://localhost:3000/signup`
2. Preencha nome, email e senha
3. Clique em "Criar Conta"
4. Deve criar usuário e ir para `/dashboard`

### 5.3 Proteção de Rotas

1. Faça logout
2. Tente acessar `http://localhost:3000/dashboard` diretamente
3. Deve redirecionar para `/login`
4. Faça login novamente
5. Tente acessar `http://localhost:3000/login`
6. Deve redirecionar para `/dashboard` (já está autenticado)

### 5.4 Persistência

1. Faça login
2. **Recarregue a página** (F5)
3. Deve continuar autenticado (graças ao Zustand persist)

---

## 🎯 Checklist de Conclusão

- [ ] ✅ `store/auth.ts` criado com login/signup/logout
- [ ] ✅ Tela de login funcionando
- [ ] ✅ Tela de signup funcionando
- [ ] ✅ Hook `useAuth` criado
- [ ] ✅ Dashboard protegido (redireciona se não autenticado)
- [ ] ✅ Página inicial redireciona corretamente
- [ ] ✅ Logout funcionando
- [ ] ✅ Estado persiste após reload

---

## 🧹 Limpeza

Após testar, delete a página de teste:

```bash
rm -rf src/app/test-auth
```

---

## 💡 Conceitos Importantes

### Zustand Persist

Salva estado no `localStorage` automaticamente:

```typescript
persist(
  (set) => ({ /* state */ }),
  {
    name: 'nous-auth-storage',
    partialize: (state) => ({ user: state.user }) // Salva apenas 'user'
  }
)
```

### useEffect para Redirect

```typescript
useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login')
  }
}, [isAuthenticated])
```

### Route Groups no Next.js

- `(auth)` e `(dashboard)` não aparecem na URL
- `app/(auth)/login/page.tsx` → `/login` (sem "auth" na URL)

---

## 🔒 Próximos Passos (Backend)

Quando o backend estiver pronto, substitua:

```typescript
// De: Mock
login: async (email, password) => {
  const mockUser = { id: '1', name: 'Mock', email }
  set({ user: mockUser })
}

// Para: API Real
login: async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  const user = await response.json()
  set({ user })
}
```

---

## ➡️ Próximo Passo

Quando a autenticação estiver funcionando:

**Continue para:** `PHASE-FRONTEND-4-DASHBOARD.md`

Onde você vai criar o dashboard principal com estatísticas.

---

**Status:** 🟢 Autenticação Completa
**Tempo Gasto:** ~3-4 horas
