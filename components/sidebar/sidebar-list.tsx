import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/sidebar/clear-history'
import { SidebarItems } from '@/components/sidebar/sidebar-items'
import { cache } from 'react'
import { ImprintDialog } from '../imprint-dialog'
import { Button, buttonVariants } from '../ui/button'
import {
  IconBRZ,
  IconDashboard,
  IconImprint,
  IconPlus,
  IconTrash
} from '@/components/ui/icons'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '../user-menu'
import { Session } from '@/types'
import { auth } from '@/auth'
import { ScrollArea } from '../ui/scroll-area'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

export const loadChats = cache(async (userId?: string) => {
  return await getChats(userId)
})

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = await loadChats(userId)

  return (
    <div className="w-full h-full">
      <div className="flex flex-col flex-1 py-2 mt-5 overflow-hidden">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-12 mb-1 w-full justify-start px-4 bg-primary shadow-none transition-colors rounded-[10px] border border-primary text-[#e5e5e5] hover:text-[#e5e5e5] hover:bg-primary/90',
            chats?.length ? 'mt-2' : 'mt-0'
          )}
        >
          <IconPlus className="w-[15px] h-[15px] mx-2 text-lg -translate-x-2 " />
          Neuer Chat
        </Link>
        <ScrollArea className="box-border overflow-auto">
          <SidebarItems chats={chats} />
        </ScrollArea>

        {!chats || chats.length == 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Keine Chatverläufe</p>
          </div>
        ) : null}
      </div>

      <Separator className="w-11/12 h-[1.5px] m-auto" />

      <div className="flex flex-col items-center justify-between px-1 py-4 space-y-3">
        <ClearHistory
          clearChats={clearChats}
          isEnabled={chats?.length > 0}
          className="h-12 w-full justify-start px-4 bg-background shadow-none hover:bg-background-secondary rounded-[10px] text-secondary-foreground"
        />
        <ThemeToggle className="h-12 w-full justify-start px-4 bg-background shadow-none hover:bg-background-secondary rounded-[10px] text-secondary-foreground" />
        <ImprintDialog>
          <Button className="h-12 w-full justify-start px-4 bg-background shadow-none hover:bg-background-secondary rounded-[10px] text-secondary-foreground">
            <IconImprint className="mr-3" />
            Impressum
          </Button>
        </ImprintDialog>
        {/* <UserMenu user={session.user} /> */}
      </div>
    </div>
  )
}
