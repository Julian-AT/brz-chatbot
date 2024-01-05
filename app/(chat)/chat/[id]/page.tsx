'use client'

import { notFound, redirect } from 'next/navigation'
import { useChats } from '@/lib/hooks/use-chats'
import { Chat } from '@/components/chat'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { getChat } = useChats()
  const chat = getChat(params.id)

  if (!chat) {
    notFound()
  }

  return <Chat id={chat.id} initialMessages={chat.messages} />
}
