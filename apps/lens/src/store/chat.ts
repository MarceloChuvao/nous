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
