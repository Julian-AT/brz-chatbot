import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { ScrollArea } from './ui/scroll-area'
import { useEffect, useRef } from 'react'

export interface ChatList {
  messages: Message[]
}

export function ChatList({ messages }: ChatList) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!messages.length) {
    return null
  }

  return (
    <div className="relative w-full max-w-2xl px-4 pb-32 mx-auto">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  )
}
