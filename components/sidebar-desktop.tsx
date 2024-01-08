import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat-history'

export function SidebarDesktop() {
  return (
    <Sidebar
      className="inset-y-0 hidden w-full relative -translate-x-full
    duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:max-w-xs 2xl:max-w-[400px]  "
    >
      {/* @ts-ignore */}
      <ChatHistory />
    </Sidebar>
  )
}
