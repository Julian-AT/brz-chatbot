import { Session, UIState } from '@/types'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export interface ChatList {
  messages: UIState
  session?: Session
  isShared: boolean
}

export function ChatList({ messages, session, isShared }: ChatList) {
  return messages.length ? (
    <div className="relative grid max-w-2xl gap-8 px-4 mx-auto auto-rows-max">
      {!isShared && !session ? (
        <>
          <div className="relative flex items-start group md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-lg border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="flex-1 px-1 ml-5 space-y-2 overflow-auto">
              <p className="leading-normal text-muted-foreground">
                Please{' '}
                <Link href="/login" className="underline underline-offset-4">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="underline underline-offset-4">
                  sign up
                </Link>{' '}
                to save and revisit your chat history!
              </p>
            </div>
          </div>
        </>
      ) : null}

      {messages.map(message => (
        <div key={message.id}>
          {message.spinner}
          {message.display}
          {message.attachments}
        </div>
      ))}
    </div>
  ) : null
}
