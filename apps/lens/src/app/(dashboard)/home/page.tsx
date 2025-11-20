'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, Layers, MessageSquare, Settings } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's your dashboard
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="group cursor-pointer border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          onClick={() => router.push('/domains')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-md bg-blue-100 text-blue-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
              Life Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">
              Organize your life across 12 key domains
            </CardDescription>
            <Button variant="ghost" className="w-full justify-start -ml-3">
              View All Domains
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          onClick={() => router.push('/chat')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-md bg-green-100 text-green-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
              Chat with NOUS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">
              Ask questions about your data
            </CardDescription>
            <Button variant="ghost" className="w-full justify-start -ml-3">
              Open Chat
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          onClick={() => router.push('/settings')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-md bg-purple-100 text-purple-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Settings className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">
              Manage your account and preferences
            </CardDescription>
            <Button variant="ghost" className="w-full justify-start -ml-3">
              Open Settings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <Card className="border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground">
            No recent activity yet. Start by exploring your domains!
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
