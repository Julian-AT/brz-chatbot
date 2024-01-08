import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { useEffect, useRef } from 'react'

export interface ChatList {
  messages: Message[]
  initialMessageCount: number
  isLoading: boolean
}

export function ChatList({
  messages,
  initialMessageCount,
  isLoading
}: ChatList) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!messages.length) {
    return null
  }

  return (
    <div className="relative w-full max-w-2xl p-4 pb-32 mx-auto">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && (
            <Separator className="h-[1.5px] my-8" />
          )}
        </div>
      ))}
      {isLoading && messages.length === initialMessageCount && (
        <div>
          <Separator className="my-8" />
          <ChatMessage
            message={{
              content: '',
              ui: (
                <span className="flex-1 px-1 mt-1 ml-4 space-y-2 overflow-hidden cursor-default animate-pulse">
                  ⬤
                </span>
              ),
              role: 'assistant',
              id: 'loading'
            }}
          />
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  )
}
