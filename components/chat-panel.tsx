import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { Button } from '@/components/ui/button'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { Message } from '@/types'

export interface ChatPanelProps {
  id?: string
  input: string
  isLoading: boolean
  messages: Message[]
  setInput: (value: string) => void
  onSubmit: (value: string) => void
  cancelMessage: () => void
  regenerateMessage: () => void
}

export function ChatPanel({
  id,
  isLoading,
  input,
  messages,
  setInput,
  onSubmit,
  cancelMessage,
  regenerateMessage
}: ChatPanelProps) {
  return (
    <div
      key={id}
      className="sticky inset-x-0 bottom-0 w-full animate-in duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]"
    >
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl ">
        <div className="flex items-end justify-center h-12">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={cancelMessage}
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
                  className="bg-background border-border"
                  onClick={regenerateMessage}
                >
                  <IconRefresh className="mr-2" />
                  Antwort regenerieren
                </Button>
              </div>
            )
          )}
        </div>
        <div className="w-full pt-2 space-y-4 sm:px-4 sm:py-2 md:pb-4">
          <PromptForm
            onSubmit={onSubmit}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
