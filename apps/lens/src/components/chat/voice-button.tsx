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
      variant={isRecording ? 'destructive' : 'secondary'}
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
