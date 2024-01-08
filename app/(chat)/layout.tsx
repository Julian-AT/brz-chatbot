import { ChatHistory } from '@/components/chat-history'
import { SidebarDesktop } from '@/components/sidebar-desktop'
import { SidebarMobile } from '@/components/sitebar-mobile'
import { cn } from '@/lib/utils'
import { Inter } from 'next/font/google'

const inter = Inter({
  weight: ['400'],
  style: 'normal',
  subsets: ['latin']
})

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex h-screen overflow-hidden bg-background-base tracking-wide font-normal',
        inter.className
      )}
    >
      {/* @ts-ignore */}
      <SidebarDesktop />

      <div className="relative w-full pb-5 duration-300 ease-in-out lg:border animate-in bg-background lg:rounded-xl lg:border-border lg:m-3">
        <div className="absolute top-0 left-0 hidden m-3 mr-0 md:flex lg:hidden">
          <SidebarMobile>
            <ChatHistory />
          </SidebarMobile>
        </div>
        {children}
      </div>
    </div>
  )
}
