'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { ChatProvider } from '@/lib/hooks/use-chats'
import { SettingsProvider } from '@/lib/hooks/use-settings'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SettingsProvider>
      <ChatProvider>
        <NextThemesProvider {...props}>
          <SidebarProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SidebarProvider>
        </NextThemesProvider>
      </ChatProvider>
    </SettingsProvider>
  )
}
