'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar } from '@/components/sidebar/sidebar'
import { ChatHistory } from '@/components/sidebar/chat-history'

interface SidebarMobileProps {
  children: React.ReactNode
}

export function SidebarMobile({ children }: SidebarMobileProps) {
  return (
    <Sheet>
      <SheetContent className="inset-y-0 flex flex-col w-full h-auto p-0">
        <Sidebar>
          <ChatHistory />
        </Sidebar>
      </SheetContent>
    </Sheet>
  )
}
