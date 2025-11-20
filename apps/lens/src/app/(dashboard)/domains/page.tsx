'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { DomainCard } from '@/components/domains/domain-card'
import { LIFE_DOMAINS } from '@/lib/domains-data'

export default function DomainsPage() {
  const { isAuthenticated, isLoading } = useAuth()
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Life Domains</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Organize your life across 12 key domains. Click any domain to get started.
        </p>
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LIFE_DOMAINS.map((domain, index) => (
          <div
            key={domain.id}
            onClick={() => router.push(`/domains/templates?domain=${domain.id}`)}
            className="cursor-pointer"
          >
            <DomainCard domain={domain} index={index} />
          </div>
        ))}
      </div>
    </div>
  )
}
