import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { formatDate } from '@/lib/utils'
import { getSharedChat } from '@/app/actions'
import { ChatList } from '@/components/chat/chat-list'
import { FooterText } from '@/components/footer'
import { AI, getUIStateFromAIState } from '@/lib/chat/actions'
import { UIState } from '@/types'

export const runtime = 'edge'
export const preferredRegion = 'home'

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: SharePageProps): Promise<Metadata> {
  const chat = await getSharedChat(params.id)

  return {
    title: chat?.title.slice(0, 50) ?? 'Chat'
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat?.sharePath) {
    notFound()
  }

  const uiState: UIState = getUIStateFromAIState(chat)

  return (
    <>
      <div className="flex flex-col flex-1 min-h-screen space-y-6 overflow-hidden">
        <div className="px-4 py-6 border-b bg-background md:px-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{chat.title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {chat.messages.length}{' '}
                Nachrichten
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 max-h-full">
          <AI>
            <ChatList messages={uiState} isShared={true} />
          </AI>
        </div>
        <FooterText className="pt-4 pb-8 border-t " />
      </div>
    </>
  )
}
