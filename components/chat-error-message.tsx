import React from 'react'
import { Card } from './ui/card'

export interface ChatErrorMessageProps extends React.ComponentProps<'div'> {
  text: string
}

const ChatErrorMessage = ({ text }: ChatErrorMessageProps) => {
  return (
    <Card className="p-2 px-3 rounded-sm text-secondary-foreground bg-primary/10 border-primary/60">
      {text}
    </Card>
  )
}

export default ChatErrorMessage
