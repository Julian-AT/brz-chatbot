'use client'

/* eslint-disable @next/next/no-img-element */

import { IconBRZ, IconUser } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { spinner } from '@/components/chat/spinner'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { StreamableValue } from 'ai/rsc'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'

// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-col items-start mb-4 group md:flex-row xl:-ml-12 ">
      <div className="flex mb-5 ml-4 md:hidden">
        <div
          className={cn(
            'h-10 w-10 shrink-0 select-none items-center justify-center rounded-md border shadow flex bg-background'
          )}
        >
          <IconUser />
        </div>
        <div className="flex flex-col mx-3 text-sm">
          <b>Du</b>
        </div>
      </div>
      <div className="flex space-x-5">
        <div className="items-center justify-center hidden w-10 h-10 border rounded-md shadow select-none shrink-0 md:flex bg-background">
          <IconUser />
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function BotMessage({
  content,
  className
}: {
  content: string | StreamableValue<string>
  className?: string
}) {
  const text = useStreamableText(content)

  return (
    <BotCard>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
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
          {text}
        </MemoizedReactMarkdown>
      </div>
    </BotCard>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="relative flex-col items-start mb-4 group md:flex-row xl:-ml-12 ">
      <div className="flex mb-5 ml-4 md:hidden">
        <div
          className={cn(
            'h-10 w-10 shrink-0 select-none items-center justify-center rounded-md border shadow flex bg-background text-primary dark:bg-primary dark:text-background'
          )}
        >
          <IconBRZ />
        </div>
        <div className="flex flex-col mx-3 text-sm">
          <b>Du</b>
        </div>
      </div>
      <div className="flex space-x-5">
        <div className="items-center justify-center hidden w-10 h-10 border rounded-md shadow select-none shrink-0 md:flex bg-background text-primary dark:text-background">
          <IconBRZ className="w-full h-full text-primary p-1.5" />
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
    </div>
  )
}

export function SpinnerMessage() {
  return <BotCard>{spinner}</BotCard>
}
