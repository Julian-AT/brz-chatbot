import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/chat/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare, SparklesIcon } from '@/components/ui/icons'
import { ChatShareDialog } from '@/components/sidebar/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'
import { UserMessage } from '@/components/chat/message'
import ChatErrorMessage from '@/components/chat/chat-error-message'

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

        <div className="grid gap-4 ">
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
                    setMessages((currentMessages: any) => [
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

                      setMessages((currentMessages: any) => [
                        ...currentMessages,
                        responseMessage
                      ])
                    } catch (error: any) {
                      console.log(error)

                      return (
                        <ChatErrorMessage
                          text={
                            error.message ||
                            'Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuche es erneut.'
                          }
                        />
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
