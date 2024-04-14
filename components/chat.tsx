'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useSettings } from '@/lib/hooks/use-settings'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { useUIState, useActions } from 'ai/rsc'
import type { AI } from '@/actions/rsc'
import { nanoid } from 'nanoid'
import { Message } from '@/types'
import { usePathname, useRouter } from 'next/navigation'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions<typeof AI>()
  const { settings } = useSettings()
  const router = useRouter()
  const path = usePathname()

  const onSubmit = async (value: string) => {
    if (!id) return console.log('no id')

    const messageId = nanoid(21)

    const message: Message = {
      id: messageId,
      createdAt: new Date(),
      display: <p>{value}</p>,
      role: 'user'
    }

    try {
      if (!path.includes('chat')) {
        router.push(`/chat/${id}`, { scroll: false })
        router.refresh()
      }

      setMessages((currentMessages: any) => [...currentMessages, message])

      const responseMessage = await submitUserMessage(inputValue)
      setMessages(currentMessages => [...currentMessages, responseMessage])

      setInputValue('')
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error)
    }
  }

  return (
    <>
      {messages?.length ? (
        <div
          className={cn(
            'flex flex-col h-full w-full overflow-hidden ',
            className
          )}
        >
          {settings.bottom_glow ? (
            <div className="absolute bottom-0 inset-x-0 e w-3/4 z-10 h-10 mx-auto bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(185,_30,_35,_0.8)_46.35%,_rgba(173,_255,_0,_0)_100%)] mix-blend-lighten border-[35px] border-primary filter blur-[175px] rounded-full" />
          ) : null}
          <ScrollArea className="mx-1 my-5 overflow-auto">
            <ChatList messages={messages} isLoading={isLoading} />
          </ScrollArea>
          <ChatScrollAnchor trackVisibility={isLoading} />
          <div className="absolute bottom-0 z-20 w-full">
            <ChatScrollAnchor trackVisibility={isLoading} />
            <ChatPanel
              id={id}
              isLoading={isLoading}
              messages={messages ?? []}
              input={inputValue}
              setInput={setInputValue}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <EmptyScreen>
            <ChatPanel
              id={id}
              isLoading={isLoading}
              messages={messages ?? []}
              input={inputValue}
              setInput={setInputValue}
              onSubmit={onSubmit}
            />
          </EmptyScreen>
        </div>
      )}
    </>
  )
}
