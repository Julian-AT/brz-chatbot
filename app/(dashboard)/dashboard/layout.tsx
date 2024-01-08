import { dashboardConfig } from '@/config/dashboard'
import { DashboardNav } from '@/components/dashboard/nav'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { IconChevronLeft } from '@/components/ui/icons'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col w-full min-h-screen space-y-6 bg-background dark:bg-background-base">
      <header className="w-full border-b bg-background-base">
        <div className="container flex items-center justify-between h-16 py-4">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'ghost' }), '')}
          >
            <>
              <IconChevronLeft className="w-4 h-4 mr-2" />
              Zurück zur Startseite
            </>
          </Link>
        </div>
      </header>
      <div className="container flex flex-row flex-1 gap-12">
        <aside className="hidden w-[250px] flex-col xl:flex">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="w-full max-w-full">{children}</main>
      </div>
    </div>
  )
}
