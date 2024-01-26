import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconBRZ, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import moment from 'moment'

moment.locale('de')

export interface ChatMessageProps {
  message: Message
}

// see https://stackoverflow.com/questions/35441820/tomorrow-today-and-yesterday-with-momentjs
const dateFromNow = (date: Date) => {
  const fromNow = moment(date).fromNow()

  return moment(date).calendar(null, {
    lastWeek: '[Letzte] dddd',
    lastDay: '[Gestern um] HH:mm [Uhr]',
    sameDay: '[Heute um] HH:mm [Uhr]',
    nextDay: '[Morgen um] HH:mm [Uhr]',
    nextWeek: 'dddd',
    sameElse: function () {
      return '[' + fromNow + ']'
    }
  })
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'group relative mb-4 flex-col md:flex-row items-start xl:-ml-12 '
      )}
      {...props}
    >
      <div className="flex mb-5 ml-4 md:hidden">
        <div
          className={cn(
            'h-10 w-10 shrink-0 select-none items-center justify-center rounded-md border shadow flex',
            message.role === 'user'
              ? 'bg-background'
              : 'bg-background text-primary dark:bg-primary dark:text-background'
          )}
        >
          {message.role === 'user' ? (
            <div>
              <IconUser />
            </div>
          ) : (
            <IconBRZ className="w-7 h-7" />
          )}
        </div>
        <div className="flex flex-col mx-3 text-sm">
          {message.role === 'user' ? <b>Du</b> : <b>BRZ-Chatbot</b>}
          <span className="text-muted-foreground">
            {dateFromNow(message.createdAt ?? new Date())}
          </span>
        </div>
      </div>
      <div className="flex">
        <div
          className={cn(
            'h-10 w-10 shrink-0 select-none items-center justify-center rounded-md border shadow md:flex hidden ',
            message.role === 'user'
              ? 'bg-background'
              : 'bg-background text-primary dark:bg-primary dark:text-background'
          )}
        >
          {message.role === 'user' ? (
            <IconUser />
          ) : (
            <IconBRZ className="w-7 h-7" />
          )}
        </div>
        {message.ui}
        <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <div className="w-full mb-2 last:mb-0">{children}</div>
              },
              code({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] == '⬤') {
                    return (
                      <span className="mt-1 cursor-default animate-pulse">
                        ⬤
                      </span>
                    )
                  }

                  children[0] = (children[0] as string).replace(`'\`⬤\`'`, '⬤')
                }

                const match = /language-(\w+)/.exec(className || '')

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ''}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                )
              }
            }}
          >
            {message.content}
          </MemoizedReactMarkdown>
          <ChatMessageActions message={message} className="hidden md:block" />
        </div>
      </div>
    </div>
  )
}
