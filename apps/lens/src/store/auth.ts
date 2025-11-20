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
    error: string | null

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
            error: null,

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
