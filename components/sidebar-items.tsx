'use client'

import { Chat } from '@/lib/types'
import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { useChats } from '@/lib/hooks/use-chats'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarItemsProps {
  chats?: Chat[]
}

export function SidebarItems({ chats }: SidebarItemsProps) {
  const { removeChat } = useChats()
  if (!chats?.length) return null

  return (
    <ScrollArea className="box-border overflow-auto">
      {chats.map(
        (chat, index) =>
          chat && (
            <SidebarItem index={index} chat={chat} key={chat.id}>
              <SidebarActions chat={chat} removeChat={removeChat} />
            </SidebarItem>
          )
      )}
    </ScrollArea>
  )
}
