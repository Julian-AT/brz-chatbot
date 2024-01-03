'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useChats } from '@/lib/hooks/use-chats'
import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useSettings } from '@/lib/hooks/use-settings'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const { appendMessage, getChat } = useChats()
  const { toast } = useToast()
  const { settings } = useSettings()

  const currentChat = id ? getChat(id) : null

  const onFinish = useCallback(
    async (message: Message) => {
      console.log('onFinish', message)

      if (message && id) {
        appendMessage(id, message)
      }
    },
    [id, appendMessage]
  )

  const {
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    messages: aiMessages
  } = useChat({
    initialMessages,
    id,
    body: {
      id
    },
    onResponse(response) {
      if (response.status >= 400) {
        toast({
          title: 'Fehler',
          description:
            'Ein Fehler ist aufgetreten. Bitte versuche es später erneut'
        })
      }
    },
    onFinish,
    onError(error) {
      toast({
        title: 'Fehler',
        description:
          'Ein Fehler ist aufgetreten. Bitte versuche es später erneut'
      })
    }
  })

  const messages = isLoading ? aiMessages : currentChat?.messages

  return (
    <>
      {messages?.length ? (
        <div
          className={cn(
            'flex flex-col h-full w-full overflow-hidden ',
            className
          )}
        >
          {settings.bottom_glow}
          {settings.bottom_glow ? (
            <div className="absolute bottom-0 inset-x-0 e w-3/4 z-0 h-10 mx-auto bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(185,_30,_35,_0.8)_46.35%,_rgba(173,_255,_0,_0)_100%)] mix-blend-lighten border-[35px] border-primary filter blur-[175px] rounded-full" />
          ) : null}
          <ScrollArea className="mx-1 my-5 overflow-auto">
            <ChatList messages={messages} />
          </ScrollArea>
          <ChatScrollAnchor trackVisibility={isLoading} />
          <div className="absolute bottom-0 w-full">
            <ChatScrollAnchor trackVisibility={isLoading} />
            <ChatPanel
              id={id}
              isLoading={isLoading}
              stop={stop}
              append={append}
              reload={reload}
              messages={messages ?? []}
              input={input}
              setInput={setInput}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <EmptyScreen>
            <ChatPanel
              id={id}
              isLoading={isLoading}
              stop={stop}
              append={append}
              reload={reload}
              messages={messages ?? []}
              input={input}
              setInput={setInput}
            />
          </EmptyScreen>
        </div>
      )}
    </>
  )
}
