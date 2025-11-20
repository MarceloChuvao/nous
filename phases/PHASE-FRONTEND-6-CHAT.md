# PHASE-FRONTEND-6: Interface de Chat

> **Objetivo:** Criar interface de conversação com o agente NOUS
> **Duração:** 5-6 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-5-VERTICALS concluído

---

## 📋 O que vamos fazer

1. ✅ Estado global do chat (Zustand)
2. ✅ Componente de lista de mensagens
3. ✅ Componente de input de chat
4. ✅ Botão de voz (UI apenas)
5. ✅ Página de chat completa
6. ✅ Simulação de respostas do agente

---

## 💬 Passo 1: Estado do Chat

**Caminho:** `src/store/chat.ts`

```typescript
import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatState {
  messages: Message[]
  isTyping: boolean

  sendMessage: (content: string) => void
  addMessage: (message: Message) => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o NOUS, seu assistente pessoal. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ],
  isTyping: false,

  sendMessage: (content: string) => {
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    set(state => ({
      messages: [...state.messages, userMessage],
      isTyping: true
    }))

    // Simular resposta do agente (mock)
    setTimeout(() => {
      const responses = [
        'Entendi! Deixe-me processar isso para você.',
        'Interessante! Vou verificar essas informações.',
        'Claro! Posso te ajudar com isso.',
        'Ótima pergunta! Vou buscar esses dados.',
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false
      }))
    }, 1500)
  },

  addMessage: (message: Message) => {
    set(state => ({ messages: [...state.messages, message] }))
  },

  setTyping: (typing: boolean) => {
    set({ isTyping: typing })
  },

  clearMessages: () => {
    set({ messages: [] })
  }
}))
```

---

## 📝 Passo 2: Componente de Lista de Mensagens

**Caminho:** `src/components/chat/message-list.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { formatRelativeTime } from '@/lib/utils'
import { clsx } from 'clsx'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

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
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-900'
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p
              className={clsx(
                'text-xs mt-1',
                message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
              )}
            >
              {formatRelativeTime(message.timestamp)}
            </p>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
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
          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          size="lg"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
```

---

## 🎤 Passo 4: Botão de Voz (UI apenas)

**Caminho:** `src/components/chat/voice-button.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceButtonProps {
  onTranscript?: (text: string) => void
}

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleToggle = () => {
    if (!isRecording) {
      // Start recording (mock)
      setIsRecording(true)
      console.log('🎤 Gravação iniciada (mock)')

      // Simular transcrição após 3 segundos
      setTimeout(() => {
        setIsRecording(false)
        onTranscript?.('Texto transcrito da voz (mock)')
      }, 3000)
    } else {
      // Stop recording
      setIsRecording(false)
      console.log('🎤 Gravação parada')
    }
  }

  return (
    <Button
      onClick={handleToggle}
      variant={isRecording ? 'danger' : 'secondary'}
      size="lg"
      className="relative"
    >
      {isRecording ? (
        <>
          <MicOff className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  )
}
```

---

## 💬 Passo 5: Página de Chat

**Caminho:** `src/app/(dashboard)/chat/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chat'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { VoiceButton } from '@/components/chat/voice-button'

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { messages, isTyping, sendMessage } = useChatStore()

  if (isLoading || !isAuthenticated) return null

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat com NOUS</h1>
            <p className="text-sm text-gray-600">
              {isTyping ? 'Digitando...' : 'Online'}
            </p>
          </div>
          <VoiceButton onTranscript={sendMessage} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <MessageList messages={messages} isTyping={isTyping} />
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

## 🎯 Checklist de Conclusão

- [ ] ✅ Estado do chat criado (Zustand)
- [ ] ✅ Lista de mensagens renderizando
- [ ] ✅ Auto-scroll funcionando
- [ ] ✅ Input de chat funcionando
- [ ] ✅ Enter envia mensagem
- [ ] ✅ Shift+Enter cria nova linha
- [ ] ✅ Textarea auto-resize
- [ ] ✅ Botão de voz (UI) funcionando
- [ ] ✅ Typing indicator aparecendo
- [ ] ✅ Respostas mockadas do agente

---

## 🧪 Como Testar

1. Acesse `/chat`
2. Digite uma mensagem e pressione Enter
3. Veja sua mensagem aparecer (azul, à direita)
4. Aguarde 1.5s - aparece indicador "digitando..."
5. Veja resposta do NOUS (cinza, à esquerda)
6. Clique no botão de microfone - deve ficar vermelho
7. Após 3s, deve parar e "transcrever" (mock)
8. Teste Shift+Enter para quebra de linha

---

## 📱 Responsividade

O chat ocupa tela inteira (fullscreen) e é totalmente responsivo:
- Mobile: mensagens ocupam 90% da largura
- Desktop: mensagens ocupam 70% da largura

---

## 🔮 Próximos Passos (Backend)

Quando o backend estiver pronto:

1. **Substituir mock por WebSocket/SSE:**
```typescript
sendMessage: async (content) => {
  // Enviar para backend
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: content })
  })
  const data = await response.json()
  // Adicionar resposta real
}
```

2. **Integrar STT (Speech-to-Text):**
```typescript
// No VoiceButton
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  onTranscript(transcript)
}
```

---

## ✅ Frontend Completo!

🎉 **Parabéns!** Você completou todas as 6 phases do frontend:

1. ✅ PHASE-FRONTEND-1-SETUP
2. ✅ PHASE-FRONTEND-2-UI-BASE
3. ✅ PHASE-FRONTEND-3-AUTH
4. ✅ PHASE-FRONTEND-4-DASHBOARD
5. ✅ PHASE-FRONTEND-5-VERTICALS
6. ✅ PHASE-FRONTEND-6-CHAT

**O que você tem agora:**
- ✅ Frontend funcional e bonito
- ✅ Autenticação completa
- ✅ Dashboards de saúde e finanças
- ✅ Interface de chat
- ✅ Mock data para desenvolvimento offline
- ✅ Totalmente responsivo

**Próximo passo:** Partir para o backend (PHASE-0-FOUNDATION) e integrar!

---

**Status:** 🟢 Frontend 100% Completo!
**Tempo Total:** ~25-30 horas
