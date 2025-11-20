import {
  DollarSign,
  Heart,
  Briefcase,
  Users,
  GraduationCap,
  Home,
  Sparkles,
  Target,
  Globe,
  Lightbulb,
  Shield,
  TrendingUp
} from 'lucide-react'
import { Domain } from '@/types/domain'

export const LIFE_DOMAINS: Domain[] = [
  {
    id: 'financial',
    name: 'Financial',
    icon: DollarSign,
    description: 'Manage money, investments, and budget',
    subdomains: 0,
    color: 'blue'
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: Heart,
    description: 'Track fitness, nutrition, and medical data',
    subdomains: 0,
    color: 'red'
  },
  {
    id: 'career',
    name: 'Career & Professional',
    icon: Briefcase,
    description: 'Career growth, skills, and networking',
    subdomains: 0,
    color: 'purple'
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Users,
    description: 'Family, friends, and social connections',
    subdomains: 0,
    color: 'pink'
  },
  {
    id: 'learning',
    name: 'Learning & Development',
    icon: GraduationCap,
    description: 'Education, courses, and skill building',
    subdomains: 0,
    color: 'indigo'
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: Home,
    description: 'Household, maintenance, and organization',
    subdomains: 0,
    color: 'green'
  },
  {
    id: 'personal',
    name: 'Personal Growth',
    icon: Sparkles,
    description: 'Mindfulness, habits, and self-improvement',
    subdomains: 0,
    color: 'amber'
  },
  {
    id: 'goals',
    name: 'Goals & Projects',
    icon: Target,
    description: 'Track goals, milestones, and projects',
    subdomains: 0,
    color: 'cyan'
  },
  {
    id: 'travel',
    name: 'Travel & Experiences',
    icon: Globe,
    description: 'Trips, adventures, and memories',
    subdomains: 0,
    color: 'teal'
  },
  {
    id: 'creativity',
    name: 'Creativity & Hobbies',
    icon: Lightbulb,
    description: 'Creative projects and hobbies',
    subdomains: 0,
    color: 'orange'
  },
  {
    id: 'security',
    name: 'Security & Legal',
    icon: Shield,
    description: 'Legal docs, insurance, and protection',
    subdomains: 0,
    color: 'slate'
  },
  {
    id: 'legacy',
    name: 'Legacy & Impact',
    icon: TrendingUp,
    description: 'Long-term impact and contributions',
    subdomains: 0,
    color: 'emerald'
  }
]
