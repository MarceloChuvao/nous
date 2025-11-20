'use client'

import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

export default function TestAuthPage() {
    const { user, isAuthenticated, login, logout, isLoading } = useAuthStore()

    const handleLogin = async () => {
        try {
            await login('teste@email.com', '12345')
            alert('Login bem-sucedido!')
        } catch (error) {
            alert('Erro no login')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-8">Teste de Autenticação</h1>

            <div className="space-y-4">
                <p>
                    <strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}
                </p>
                <p>
                    <strong>Usuário:</strong> {user?.name || 'Nenhum'}
                </p>

                <div className="flex space-x-4">
                    <Button onClick={handleLogin} isLoading={isLoading}>
                        Login Mock
                    </Button>
                    <Button onClick={logout} variant="secondary">
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    )
}
