import React from 'react'
import { Card } from '@/components/ui/card'
import { CircularProgress } from '@nextui-org/react'

export interface ChatCircularProgressProps extends React.ComponentProps<'div'> {
  text: string
  description: string
  progress?: number
}

const ChatCircularProgress = ({
  text,
  description,
  progress
}: ChatCircularProgressProps) => {
  return (
    <Card className="flex items-center gap-3 px-6 py-3 rounded-sm w-max bg-secondary">
      <CircularProgress
        classNames={{
          svg: 'w-14 h-14 drop-shadow-md',
          indicator: 'stroke-primary',
          track: 'stroke-white/10',
          value: 'text-xs font-semibold text-secondary-foreground'
        }}
        value={progress}
        strokeWidth={2.5}
        showValueLabel={true}
      />
      <div className="flex flex-col">
        <div className="font-semibold">{text}</div>
        <div className="text-muted-foreground">{description}</div>
      </div>
    </Card>
  )
}

export default ChatCircularProgress
