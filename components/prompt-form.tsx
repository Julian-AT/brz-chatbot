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

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
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
  const router = useRouter()
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
      <div className="relative flex flex-col justify-center w-full h-24 pr-16 overflow-hidden border-t sm:h-full max-h-60 grow bg-background sm:rounded-md sm:border border-border">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Sende eine Nachricht"
          spellCheck={false}
          className="min-h-full w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 flex items-center w-16 h-16 p-2 ">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={isLoading || input === ''}
                className="w-full h-full border bg-primary rounded-xl"
              >
                <IconSubmit className="absolute w-6 h-6" />
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
