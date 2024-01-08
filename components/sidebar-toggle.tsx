'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      className="hidden p-0 -ml-2 h-9 w-9 lg:flex"
      onClick={() => {
        toggleSidebar()
      }}
    >
      <IconSidebar className="w-6 h-6" />
      <span className="sr-only">Sidebar Interagieren</span>
    </Button>
  )
}
