'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/components/sidebar/sidebar'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'
import { ChatHistory } from '@/components/sidebar/chat-history'

interface SidebarMobileProps {
  children: React.ReactNode
}

export function SidebarMobile({ children }: SidebarMobileProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="p-0 bg-transparent h-9 w-9 lg:hidden"
        >
          <IconSidebar className="w-8 h-8" />
          <span className="sr-only">Sidebar Interagieren</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 flex flex-col w-full h-auto p-0">
        <Sidebar>
          <ChatHistory />
        </Sidebar>
      </SheetContent>
    </Sheet>
  )
}
