import { type UseChatHelpers } from 'ai/react'

import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { useChats } from '@/lib/hooks/use-chats'
import { Message } from 'ai'
import { usePathname, useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { useSettings } from '@/lib/hooks/use-settings'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
  > {
  id?: string
}

export function ChatPanel({
  id,
  isLoading,
  append,
  reload,
  input,
  setInput,
  messages
}: ChatPanelProps) {
  const { appendMessage } = useChats()
  const router = useRouter()
  const path = usePathname()
  const { settings } = useSettings()

  return (
    <div className="sticky inset-x-0 bottom-0 w-full animate-in duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex items-end justify-center h-12">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background border-border"
            >
              <IconStop className="mr-2" />
              Abbrechen
            </Button>
          ) : (
            messages?.length >= 2 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    reload({
                      options: {
                        body: {
                          id,
                          settings
                        }
                      }
                    })
                  }
                  className="bg-background border-border"
                >
                  <IconRefresh className="mr-2" />
                  Antwort regenerieren
                </Button>
              </div>
            )
          )}
        </div>
        <div className="w-full space-y-4 sm:px-4 sm:py-2 md:pb-4">
          <PromptForm
            onSubmit={async value => {
              if (!id) return console.log('no id')
              const messageId = nanoid(21)

              const message: Message = {
                id: messageId,
                createdAt: new Date(),
                content: value,
                role: 'user'
              }

              try {
                appendMessage(id, message)
                if (!path.includes('chat')) {
                  router.push(`/chat/${id}`, { scroll: false })
                  router.refresh()
                }
                await append(message, {
                  options: {
                    body: {
                      id,
                      settings
                    }
                  }
                })
              } catch (error) {
                console.error('Fehler beim Senden der Nachricht:', error)
              }
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
