import { Sidebar } from '@/components/sidebar'

import { ChatHistory } from '@/components/chat-history'

export async function SidebarDesktop() {
  return (
    <Sidebar className="inset-y-0 z-30 hidden w-full relative -translate-x-full border-r duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:max-w-xs 2xl:max-w-[400px] border-r-border border-opacity-50">
      {/* @ts-ignore */}
      <ChatHistory />
    </Sidebar>
  )
}
