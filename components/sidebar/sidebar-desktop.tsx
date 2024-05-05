import { Sidebar } from '@/components/sidebar/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/sidebar/chat-history'

export async function SidebarDesktop() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  return (
    <>
      <Sidebar
        className="relative bg-background inset-y-0 hidden w-full -translate-x-full
    duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex"
      >
        <ChatHistory userId={session.user.id} />
      </Sidebar>
    </>
  )
}
