'use client'

import * as React from 'react'
import { type DialogProps } from '@radix-ui/react-dialog'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Chat, ServerActionResult } from '@/types'

interface ChatShareDialogProps extends DialogProps {
  chat: Pick<Chat, 'id' | 'title' | 'messages'>
  shareChat: (id: string) => ServerActionResult<Chat>
  onCopy: () => void
}

export function ChatShareDialog({
  chat,
  shareChat,
  onCopy,
  ...props
}: ChatShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [isSharePending, startShareTransition] = React.useTransition()

  const copyShareLink = React.useCallback(
    async (chat: Chat) => {
      if (!chat.sharePath) {
        return toast.error('Could not copy share link to clipboard')
      }

      const url = new URL(window.location.href)
      url.pathname = chat.sharePath
      copyToClipboard(url.toString())
      onCopy()
      toast.success('Share link copied to clipboard')
    },
    [copyToClipboard, onCopy]
  )

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat teilen</DialogTitle>
          <DialogDescription>
            Jeder mit dem Link kann diesen Chat lesen.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-1 text-sm border rounded-lg">
          <div className="font-medium">{chat.title}</div>
          <div className="text-muted-foreground">
            {chat.messages.length} Nachrichten
          </div>
        </div>
        <DialogFooter className="items-center">
          <Button
            disabled={isSharePending}
            onClick={() => {
              // @ts-ignore
              startShareTransition(async () => {
                const result = await shareChat(chat.id)

                if (result && 'error' in result) {
                  toast.error(result.error)
                  return
                }

                copyShareLink(result)
              })
            }}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Kopieren...
              </>
            ) : (
              <>Link kopieren</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}