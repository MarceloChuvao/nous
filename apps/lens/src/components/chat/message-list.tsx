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
