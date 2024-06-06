import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { getMissingKeys } from '../actions'
import { Session } from '@/types'

export const metadata = {
  title: 'BRZ Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
