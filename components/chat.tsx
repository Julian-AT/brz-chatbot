'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useChats } from '@/lib/hooks/use-chats'
import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const { appendMessage, getChat } = useChats()
  const { toast } = useToast()

  const currentChat = id ? getChat(id) : null
  const messages = currentChat ? currentChat.messages : initialMessages

  const onFinish = useCallback(
    async (message: Message) => {
      console.log('onFinish', message)

      if (message && id) {
        appendMessage(id, message)
      }
    },
    [id, appendMessage]
  )

  const { append, reload, stop, isLoading, input, setInput } = useChat({
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

  return (
    <>
      {messages?.length ? (
        <div
          className={cn(
            'pb-[200px] pt-4 md:pt-10 p-3 flex flex-col h-full w-full',
            className
          )}
        >
          <ChatList messages={messages} />
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
