import { Session, UIState } from '@/types'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import JobCard from '../jobs/job-card'

export interface ChatList {
  messages: UIState
  session?: Session
  isShared: boolean
}

export function ChatList({ messages, session, isShared }: ChatList) {
  return messages.length ? (
    <div className="relative grid max-w-2xl gap-8 px-4 mx-auto mb-20 auto-rows-max">
      {!isShared && !session ? (
        <>
          <div className="relative flex items-start group md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-lg border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="flex-1 px-1 ml-5 space-y-2 overflow-auto">
              <p className="leading-normal text-muted-foreground">
                Bitte{' '}
                <Link href="/login" className="underline underline-offset-4">
                  melde dich an
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="underline underline-offset-4">
                  registriere dich
                </Link>{' '}
                um deinen Chatverlauf zu speichern und wiederzufinden!
              </p>
            </div>
          </div>
        </>
      ) : null}

      {messages.map(message => (
        <div key={message.id}>{message.display}</div>
      ))}
    </div>
  ) : null
}
