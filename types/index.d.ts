import * as Icons from '@/components/ui/icons'

export type SiteConfig = {
  name: string
  description: string
  url: string
  links?: LinkConfig[]
}

export type LinkConfig = {
  name: string
  shortName?: string
  url: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined
  className?: string
  icon?: any
}

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type DashboardConfig = {
  sidebarNav: SidebarNavItem[]
}

export type Job = {
  id: number
  title: string
  subtitle: string
  location: string
  date: string
  image: string | null
  url: string
}

export type Stats = {
  regions: {
    text: string
    subregions: string[]
  }[]
  jobProfiles: string[]
  totalJobsCount: number
}

export type JobData = {
  jobs: Job[]
  stats: Stats
}

export type Message = {
  role: 'user' | 'assistant' | 'function'
  id: string
  display: any
  createdAt?: Date
}
