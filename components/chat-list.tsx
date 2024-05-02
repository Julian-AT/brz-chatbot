import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { useEffect, useRef } from 'react'
import { Message } from '@/types'
import JobCard from './jobs/job-card'

export interface ChatList {
  messages: Message[]
  isLoading: boolean
}

export function ChatList({ messages, isLoading }: ChatList) {
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
      <div ref={endOfMessagesRef} />
    </div>
  )
}
