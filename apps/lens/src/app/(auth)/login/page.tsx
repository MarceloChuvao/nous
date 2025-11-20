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
            router.push('/home')
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
