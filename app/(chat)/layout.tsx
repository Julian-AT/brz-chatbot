import { SidebarDesktop } from '@/components/sidebar-desktop'
import { Toaster } from '@/components/ui/toaster'
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

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex h-screen overflow-hidden bg-background-base tracking-wide font-normal',
        inter.className
      )}
    >
      {/* @ts-ignore */}
      <SidebarDesktop />
      <div className="relative w-full overflow-auto duration-300 ease-in-out border animate-in bg-background lg:rounded-xl border-border lg:m-3">
        <div className="z-10 h-full">{children}</div>
        {/* <div className="sticky w-3/4 z-0 h-10 mx-auto bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(185,_30,_35,_0.8)_46.35%,_rgba(173,_255,_0,_0)_100%)] mix-blend-lighten border-[35px] border-primary filter blur-[175px] rounded-full" /> */}
        <Toaster />
      </div>
    </div>
  )
}
