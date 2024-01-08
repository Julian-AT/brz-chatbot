'use client'

import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { useChats } from '@/lib/hooks/use-chats'
import { useEffect, useState, useTransition } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button, buttonVariants } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  IconBRZ,
  IconDashboard,
  IconMoon,
  IconPlus,
  IconSun,
  IconTrash
} from './ui/icons'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SidebarList() {
  const { getChats, clearChats } = useChats()
  const chats = getChats()

  const { setTheme, theme } = useTheme()
  const [_, startTransition] = useTransition()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (chats !== undefined) {
      setIsLoading(false)
    }
  }, [chats])

  return (
    <div className="flex flex-col flex-1 m-3 overflow-hidden">
      <div className="relative h-20">
        <div className="flex w-full h-full bg-background-secondary rounded-xl">
          <IconBRZ className="w-12 h-12 p-1.5 m-auto ml-5 mr-3 border rounded-full border-primary border-opacity-80 bg-primary text-secondary" />
          <div className="flex flex-col justify-center flex-1">
            <div className="hidden text-lg leading-5 text-secondary-foreground 2xl:block">
              Bundesrechenzentrum Chatbot
            </div>
            <div className="block text-lg leading-5 text-secondary-foreground 2xl:hidden">
              BRZ Chatbot
            </div>
            <span className="text-sm text-muted-foreground">
              {chats?.length} Chat{chats?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 py-2 mt-5 overflow-auto">
        {chats?.length ? (
          <ScrollArea>
            <SidebarItems chats={chats} />
          </ScrollArea>
        ) : null}
        <div>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-12 w-full justify-start px-4 bg-primary shadow-none transition-colors rounded-[10px] border border-primary text-[#e5e5e5] hover:text-[#e5e5e5] hover:bg-primary/90',
              chats?.length ? 'mt-2' : 'mt-0'
            )}
          >
            <IconPlus className="w-[15px] h-[15px] mx-2 text-lg -translate-x-2 " />
            Neuer Chat
          </Link>
        </div>
        {!chats || chats.length == 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Keine Chatverläufe</p>
          </div>
        ) : null}
      </div>

      <Separator className="w-11/12 h-[1.5px] m-auto" />

      <div className="flex flex-col items-center justify-between px-1 py-4 space-y-3">
        <ClearHistory clearChats={clearChats}>
          <Button
            disabled={chats ? chats.length === 0 : true}
            className="h-12 w-full justify-start px-4 bg-background shadow-none hover:bg-background-secondary rounded-[10px] text-secondary-foreground"
          >
            <IconTrash className="mr-3" />
            Alle Chats löschen
          </Button>
        </ClearHistory>
        <Button
          className="h-12 w-full justify-start px-4 bg-background shadow-none hover:bg-background-secondary rounded-[10px] text-secondary-foreground"
          onClick={() => {
            startTransition(() => {
              setTheme(theme === 'light' ? 'dark' : 'light')
            })
          }}
        >
          {theme === 'light' ? (
            <IconMoon className="mr-3" />
          ) : (
            <IconSun className="mr-3" />
          )}{' '}
          Theme ändern
        </Button>

        <Button
          className="h-12 w-full justify-start px-4 bg-background shadow-none hover:bg-background-secondary rounded-[10px] text-secondary-foreground"
        >
          <Link
            href="/dashboard"
            className="flex flex-row items-center w-full h-full"
          >
            <IconDashboard className="mr-3" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
