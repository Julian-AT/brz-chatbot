'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'
import { SidebarToggle } from './sidebar-toggle'

export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
  const { isSidebarOpen, isLoading } = useSidebar()

  return (
    <div
      data-state={isSidebarOpen && !isLoading ? 'open' : 'closed'}
      className={cn(
        className,
        'h-full flex-col lg:max-w-xs 2xl:max-w-[400px]',
        !isSidebarOpen && 'max-w-[0px] lg:max-w-[0px] 2xl:max-w-[0px]'
      )}
    >
      {children}
    </div>
  )
}
