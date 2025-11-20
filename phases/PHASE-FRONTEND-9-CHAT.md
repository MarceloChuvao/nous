# PHASE-FRONTEND-9: Chat Interface

> **Objetivo:** Criar interface de chat integrada com o sistema
> **Duração:** 6-8 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-8-AGENT-MARKETPLACE concluído

---

## 📋 O que vamos fazer

1. ✅ Criar estado global de chat (Zustand)
2. ✅ Componente de lista de mensagens
3. ✅ Componente de input de chat
4. ✅ Integrar chat na tab Chat do subdomain
5. ✅ Criar página global de chat (`/chat`)
6. ✅ Quick questions suggestions
7. ✅ Simulação de respostas do agente

---

## 🎯 Duas Interfaces de Chat

**1. Chat na Tab (Subdomain-specific)**
- Acessado via tab "Chat" em `/domains/[domainId]/[subdomainId]`
- Contexto do subdomain (ex: perguntas sobre Cash Flow)
- Quick questions relacionadas ao subdomain

**2. Chat Global**
- Acessado via `/chat` na navbar
- Contexto geral (pode navegar entre domínios)
- AI pode executar ações (ex: "Show my balance" → navega para Cash Flow)

---

## 📦 Passo 1: Estado do Chat

**Caminho:** `src/store/chat.ts`

```typescript
import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    action?: string // e.g., "navigate", "show_data"
    target?: string // e.g., "/domains/financial/cashflow"
  }
}

interface ChatState {
  messages: Message[]
  isTyping: boolean
  context: string | null // subdomain context (e.g., "financial/cashflow")

  sendMessage: (content: string) => void
  addMessage: (message: Message) => void
  setTyping: (typing: boolean) => void
  setContext: (context: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m NOUS, your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ],
  isTyping: false,
  context: null,

  sendMessage: (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true
    }))

    // Simulate agent response (mock)
    setTimeout(() => {
      const context = get().context
      const responses = context
        ? [
            `Let me check your ${context} data...`,
            `I found some interesting patterns in your ${context}.`,
            `Based on your ${context} data, here's what I found...`
          ]
        : [
            'I can help you with that! Let me find the information.',
            'Great question! Here\'s what I know...',
            'Let me analyze your data and get back to you.'
          ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false
      }))
    }, 1500)
  },

  addMessage: (message: Message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  setTyping: (typing: boolean) => {
    set({ isTyping: typing })
  },

  setContext: (context: string | null) => {
    set({ context })
  },

  clearMessages: () => {
    set({
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m NOUS, your AI assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]
    })
  }
}))
```

---

## 📝 Passo 2: Componente de Lista de Mensagens

**Caminho:** `src/components/chat/message-list.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/store/chat'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

interface MessageListProps {
  messages: Message[]
  isTyping?: boolean
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={clsx(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={clsx(
              'max-w-[70%] rounded-lg px-4 py-3',
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p
              className={clsx(
                'text-xs mt-1',
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              )}
            >
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-3">
            <div className="flex space-x-2">
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
```

---

## ⌨️ Passo 3: Componente de Input

**Caminho:** `src/components/chat/chat-input.tsx`

```typescript
'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Type your message... (Enter to send, Shift+Enter for new line)'
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end space-x-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
          rows={1}
          disabled={disabled}
        />
        <Button onClick={handleSubmit} disabled={disabled || !message.trim()} size="lg">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
```

---

## 💬 Passo 4: Quick Questions Component

**Caminho:** `src/components/chat/quick-questions.tsx`

```typescript
import { Button } from '@/components/ui/button'

interface QuickQuestionsProps {
  questions: string[]
  onSelect: (question: string) => void
}

export function QuickQuestions({ questions, onSelect }: QuickQuestionsProps) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-600 mb-3">Quick Questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            onClick={() => onSelect(question)}
            className="text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

---

## 🏠 Passo 5: Chat na Tab do Subdomain

**Atualizar:** `src/app/(dashboard)/domains/[domainId]/[subdomainId]/page.tsx`

```typescript
import { useChatStore } from '@/store/chat'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { QuickQuestions } from '@/components/chat/quick-questions'
import { useEffect } from 'react'

// Dentro do component:
const { messages, isTyping, sendMessage, setContext, clearMessages } = useChatStore()

// Set context when component mounts
useEffect(() => {
  setContext(`${domainId}/${subdomainId}`)
  return () => setContext(null)
}, [domainId, subdomainId, setContext])

const quickQuestions = [
  'What is my current balance?',
  'Show me my expenses this month',
  'When is my next bill due?',
  'How much can I save this month?'
]

// Na tab Chat:
<TabsContent value="chat" className="h-[600px] flex flex-col">
  <Card className="flex-1 flex flex-col">
    <MessageList messages={messages} isTyping={isTyping} />
    <QuickQuestions questions={quickQuestions} onSelect={sendMessage} />
    <ChatInput
      onSend={sendMessage}
      disabled={isTyping}
      placeholder={`Ask about ${subdomain.name}...`}
    />
  </Card>
</TabsContent>
```

---

## 🌐 Passo 6: Página Global de Chat

**Caminho:** `src/app/(dashboard)/chat/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chat'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { QuickQuestions } from '@/components/chat/quick-questions'
import { useEffect } from 'react'

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { messages, isTyping, sendMessage, setContext } = useChatStore()

  // Clear context for global chat
  useEffect(() => {
    setContext(null)
  }, [setContext])

  if (isLoading || !isAuthenticated) return null

  const quickQuestions = [
    'Show my financial overview',
    'What is my health status?',
    'List all active agents',
    'Show domains I should focus on'
  ]

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Chat with NOUS</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isTyping ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <MessageList messages={messages} isTyping={isTyping} />
        </div>
      </div>

      {/* Quick Questions */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <QuickQuestions questions={quickQuestions} onSelect={sendMessage} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 Passo 7: Atualizar Navbar

**Atualizar:** `src/components/layout/navbar.tsx`

Adicionar link de Chat:

```typescript
const navigation = [
  { name: 'Domains', href: '/domains', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare }, // ← ADICIONAR
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Estado do chat criado (Zustand)
- [ ] ✅ MessageList component criado
- [ ] ✅ ChatInput component criado
- [ ] ✅ QuickQuestions component criado
- [ ] ✅ Chat integrado na tab Chat do subdomain
- [ ] ✅ Página global `/chat` criada
- [ ] ✅ Context do subdomain configurado
- [ ] ✅ Quick questions diferentes para global vs subdomain
- [ ] ✅ Auto-scroll funcionando
- [ ] ✅ Typing indicator funcionando
- [ ] ✅ Enter envia mensagem
- [ ] ✅ Shift+Enter cria nova linha
- [ ] ✅ Textarea auto-resize
- [ ] ✅ Link de Chat na navbar

---

## 🧪 Como Testar

### Chat no Subdomain (Context-specific)

1. Acesse `/domains/financial/cashflow`
2. Vá para tab "Chat"
3. Veja quick questions relacionadas a Cash Flow
4. Clique em uma quick question → envia mensagem
5. Digite uma mensagem customizada → Enter
6. Veja sua mensagem (azul, direita)
7. Aguarde 1.5s → vê "digitando..."
8. Veja resposta do NOUS (cinza, esquerda)
9. Teste Shift+Enter para quebra de linha

### Chat Global

1. Clique em "Chat" na navbar
2. Acesse `/chat`
3. Veja quick questions gerais
4. Envie mensagem
5. Receba resposta genérica (sem contexto de subdomain)

---

## 📱 Responsividade

**Chat na Tab:**
- Altura fixa de 600px
- Scroll interno para mensagens

**Chat Global:**
- Fullscreen (ocupa toda a altura)
- Mobile: mensagens ocupam 90% da largura
- Desktop: mensagens ocupam 70% da largura

---

## 🔮 Próximos Passos (Backend Integration)

Quando o backend estiver pronto:

1. **Substituir mock por WebSocket/SSE:**
```typescript
sendMessage: async (content) => {
  const ws = new WebSocket('ws://localhost:8000/chat')
  ws.send(JSON.stringify({ message: content, context }))
  ws.onmessage = (event) => {
    addMessage(JSON.parse(event.data))
  }
}
```

2. **Implementar ações do AI:**
```typescript
// Se AI retornar metadata.action === 'navigate'
if (message.metadata?.action === 'navigate') {
  router.push(message.metadata.target)
}
```

3. **Context-aware responses:**
```typescript
// Backend usa context para buscar dados relevantes
// Ex: context="financial/cashflow" → retorna balance, expenses, etc.
```

---

## ✅ TODAS AS FASES COMPLETAS!

🎉 **Parabéns!** Você completou todas as 9 phases do frontend baseadas no PRD:

1. ✅ PHASE-FRONTEND-1-SETUP (Setup inicial)
2. ✅ PHASE-FRONTEND-2-UI-BASE (Componentes base)
3. ✅ PHASE-FRONTEND-3-AUTH (Autenticação)
4. ✅ PHASE-FRONTEND-4-DOMAINS (Grid dos 12 domínios)
5. ✅ PHASE-FRONTEND-5-TEMPLATES (Templates e My Domains)
6. ✅ PHASE-FRONTEND-6-DOMAIN-PAGE (Cards customizáveis)
7. ✅ PHASE-FRONTEND-7-SUBDOMAIN (6 tabs)
8. ✅ PHASE-FRONTEND-8-AGENT-MARKETPLACE (Marketplace)
9. ✅ PHASE-FRONTEND-9-CHAT (Interface de chat)

**O que você tem agora:**
- ✅ Sistema hierárquico completo (Domains → Subdomains → Agents)
- ✅ Templates pré-configurados
- ✅ Cards customizáveis com drag-and-drop
- ✅ Agent Marketplace com search e instalação
- ✅ 6 tabs por subdomain (Overview, Agents, Logs, Tasks, Context, Chat)
- ✅ Chat integrado (global + subdomain-specific)
- ✅ Navegação multi-nível completa
- ✅ Mock data para desenvolvimento offline
- ✅ Totalmente responsivo

**Próximo passo:** Partir para o backend e integrar com agents reais! 🚀

---

**Status:** 🟢 Frontend 100% Completo (PRD-aligned)!
**Tempo Total Estimado:** ~50-60 horas
