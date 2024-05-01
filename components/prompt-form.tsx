import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconSubmit } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { SidebarMobile } from './sitebar-mobile'
import { ChatHistory } from './chat-history'

export interface PromptProps {
  input: string
  setInput: (value: string) => void
  onSubmit: (value: string) => void
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        onSubmit(input)
      }}
      ref={formRef}
    >
      <div className="relative flex items-center w-full h-24 overflow-hidden border-t sm:h-full max-h-60 bg-background/75 sm:rounded-md sm:border border-border">
        {/* Sidebar Button */}
        <div className="flex items-center justify-center w-16 h-16 p-2 md:hidden">
          <SidebarMobile>
            <ChatHistory />
          </SidebarMobile>
        </div>

        {/* Input */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Sende eine Nachricht"
          spellCheck={false}
          className="flex-grow min-h-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />

        {/* Send Button */}
        <div className="flex items-center justify-center w-16 h-16 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={isLoading || input === ''}
                className="w-full h-full border bg-primary rounded-xl"
              >
                <IconSubmit className="w-6 h-6" />
                <span className="sr-only">Sende eine Nachricht.</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Nachricht senden</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
