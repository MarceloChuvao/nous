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
      router.push('/home')
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
