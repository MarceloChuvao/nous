import { Domain } from '@/types/domain'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DomainCardProps {
  domain: Domain
  index: number
}

export function DomainCard({ domain, index }: DomainCardProps) { // Updated function signature
  const Icon = domain.icon
  // Format index to be 2 digits (e.g., 01, 02)
  // const formattedIndex = (index + 1).toString().padStart(2, '0') // Removed formattedIndex

  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-md bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground opacity-50">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <CardTitle className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
          {domain.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2 text-sm">
          {domain.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
