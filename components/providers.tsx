'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <NextUIProvider>
        <SidebarProvider>
          <TooltipProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </TooltipProvider>
        </SidebarProvider>
      </NextUIProvider>
    </NextThemesProvider>
  )
}
