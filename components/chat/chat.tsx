'use client'

import { ChatList } from '@/components/chat/chat-list'
import { ChatPanel } from '@/components/chat/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { cn } from '@/lib/utils'
import { Message, Session } from '@/types'

// @ts-ignore
import { useAIState, useUIState } from 'ai/rsc'
import { usePathname, useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ScrollArea } from '../ui/scroll-area'
import { MinusIcon, SlashIcon } from 'lucide-react'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { IconBRZ, IconChevronLeft, IconChevronRight } from '../ui/icons'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const { isSidebarOpen, toggleSidebar } = useSidebar()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        setTimeout(() => {
          window.history.replaceState({}, '', `/chat/${id}`)
        }, 1000)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] flex items-center justify-center h-full  "
      ref={scrollRef}
    >
      <span
        className="absolute left-0 z-20 my-auto text-sm font-semibold text-center top-1/2 group/toggle"
        onClick={() => startTransition(toggleSidebar)}
      >
        <div className=" group-hover/toggle:hidden">
          <MinusIcon className={`w-5 h-6 rotate-90`} />
        </div>
        <div className="hidden group-hover/toggle:block">
          {isSidebarOpen ? (
            <IconChevronLeft className="w-6 h-6" />
          ) : (
            <IconChevronRight className="w-6 h-6" />
          )}
        </div>
      </span>

      {messages.length ? (
        <div
          className={cn(
            'flex flex-col h-full w-full overflow-hidden z-10',
            className
          )}
        >
          <div className="absolute bottom-0 inset-x-0 w-3/4 z-10 h-10 mx-auto bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(185,_30,_35,_0.8)_46.35%,_rgba(173,_255,_0,_0)_100%)] mix-blend-lighten border-[35px] border-primary filter blur-[175px] rounded-full" />
          <ScrollArea className="mx-1 my-5 overflow-auto">
            <ChatList messages={messages} isShared={false} session={session} />
          </ScrollArea>
          <div className="absolute bottom-0 z-20 w-full">
            <ChatPanel
              id={id}
              input={input}
              setInput={setInput}
              isAtBottom={isAtBottom}
              scrollToBottom={scrollToBottom}
            />
          </div>
        </div>
      ) : (
        <EmptyScreen className="flex items-center justify-center">
          <div className="mt-10">
            <ChatPanel
              id={id}
              input={input}
              setInput={setInput}
              isAtBottom={isAtBottom}
              scrollToBottom={scrollToBottom}
            />
          </div>
        </EmptyScreen>
      )}
    </div>
  )
}
