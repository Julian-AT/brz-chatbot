'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

// @ts-ignore
import { useActions, useUIState } from 'ai/rsc'

import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconSubmit } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { UserMessage } from './message'
import { Message } from '@/types'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage, describeImage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const fileRef = React.useRef<HTMLInputElement>(null)

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        setMessages((currentMessages: any) => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          }
        ])

        try {
          const responseMessage = await submitUserMessage(value)
          setMessages((currentMessages: any) => [
            ...currentMessages,
            responseMessage
          ])
        } catch (error: any) {
          console.log(error)

          setMessages((currentMessages: any) => [
            ...currentMessages,
            {
              content: `${error.message}`,
              role: 'assistant',
              display: {
                name: 'error',
                props: { error: error.message }
              }
            } satisfies Message
          ])
        }
      }}
    >
      <input
        type="file"
        className="hidden"
        id="file"
        ref={fileRef}
        onChange={async event => {
          if (!event.target.files) {
            toast.error('No file selected')
            return
          }

          const file = event.target.files[0]

          if (file.type.startsWith('video/')) {
            const responseMessage = await describeImage('')
            setMessages((currentMessages: any) => [
              ...currentMessages,
              responseMessage
            ])
          } else {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onloadend = async () => {
              const base64String = reader.result
              const responseMessage = await describeImage(base64String)
              setMessages((currentMessages: any) => [
                ...currentMessages,
                responseMessage
              ])
            }
          }
        }}
      />
      <div className="relative flex items-center w-full h-24 overflow-hidden border-t sm:h-full max-h-60 bg-background sm:rounded-md sm:border border-border">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="flex-grow min-h-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="flex items-center justify-center w-16 h-16 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={input === ''}
                className="w-full h-full border bg-primary rounded-xl"
              >
                <IconSubmit className="w-10 h-10" />
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
