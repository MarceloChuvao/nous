'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chat'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { QuickQuestions } from '@/components/chat/quick-questions'
import { VoiceButton } from '@/components/chat/voice-button'

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { messages, isTyping, sendMessage, setContext } = useChatStore()

  // Clear context for global chat
  useEffect(() => {
    setContext(null)
  }, [setContext])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat with NOUS</h1>
            <p className="text-sm text-gray-600 mt-1">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
          <VoiceButton onTranscript={sendMessage} />
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
