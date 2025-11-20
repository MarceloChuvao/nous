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
                router.push('/home')
            }
        }
    }, [isAuthenticated, isLoading, requireAuth, router])

    return { isAuthenticated, user, isLoading }
}
