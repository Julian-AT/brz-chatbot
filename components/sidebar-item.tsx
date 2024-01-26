'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { IconMessage } from '@/components/ui/icons'
import { type Chat } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  index: number
  chat: Chat
  children: React.ReactNode
}

export function SidebarItem({ index, chat, children }: SidebarItemProps) {
  const pathname = usePathname()

  const isActive = pathname === chat.path

  if (!chat?.id) return null

  return (
    <Link
      href={chat.path}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'relative group pr-10 transition-colors hover:bg-background-secondary h-12 my-1 max-w-full flex justify-start',
        isActive && 'pr-12 font-medium bg-background-secondary'
      )}
    >
      <IconMessage className="mr-2 w-5 h-5 mb-[3px]" />
      <span className="flex-1 w-0 truncate ">{chat.title}</span>
      {isActive && <div className="absolute right-2">{children}</div>}
    </Link>
  )
}
