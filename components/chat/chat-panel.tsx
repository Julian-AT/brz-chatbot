import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/chat/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare, SparklesIcon } from '@/components/ui/icons'
import { ChatShareDialog } from '@/components/sidebar/chat-share-dialog'
// @ts-ignore
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UserMessage } from '@/components/chat/message'
import { Message } from '@/types'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

  const exampleMessages = [
    {
      heading: 'Suche IT Jobs im BRZ',
      message: `Suche IT Jobs im BRZ`
    },
    {
      heading: 'PLACEHOLDER',
      message: 'PLACEHOLDER'
    }
  ]

  return (
    <div className="inset-x-0  bottom-0 w-full duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] dark:from-10%">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        {messages?.length >= 2 ? (
          <div className="flex items-center justify-center h-fit">
            <div className="flex space-x-2">
              {id && title ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </Button>
                  <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    shareChat={shareChat}
                    chat={{
                      id,
                      title,
                      messages: aiState.messages
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:pb-4">
          <PromptForm input={input} setInput={setInput} />
          {/* <FooterText className="hidden sm:block" /> */}
          <div className="flex items-center justify-center gap-3">
            {messages.length === 0 &&
              exampleMessages.map((example, index) => (
                <div
                  key={example.heading}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors bg-background border rounded-xl cursor-pointer',
                    index > 1 && 'hidden md:block'
                  )}
                  onClick={async () => {
                    setMessages((currentMessages: Message[]) => [
                      ...currentMessages,
                      {
                        id: nanoid(),
                        display: <UserMessage>{example.message}</UserMessage>
                      }
                    ])

                    try {
                      const responseMessage = await submitUserMessage(
                        example.message
                      )

                      setMessages((currentMessages: Message[]) => [
                        ...currentMessages,
                        responseMessage
                      ])
                    } catch {
                      toast(
                        <div className="text-red-500">
                          Senden der Nachricht fehlgeschlagen. Bitte versuche es
                          später erneut.
                        </div>
                      )
                    }
                  }}
                >
                  <div className="flex items-center w-full gap-3 px-2 font-medium">
                    <SparklesIcon />
                    {example.heading}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
