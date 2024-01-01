import * as React from 'react'
import Balancer from 'react-wrap-balancer'

import { IconAccuracy, IconLock, IconSecure } from './ui/icons'

const cardConfig = [
  {
    title: 'Akkurat',
    icon: <IconAccuracy />,
    description: 'Vektorbasierte Referenzen für möglichst präzise Antworten'
  },
  {
    title: 'Unabhängig',
    icon: <IconLock />,
    description: 'Unabhängig von Anbietern durch Open-Source-Technologie'
  },
  {
    title: 'Sicher',
    icon: <IconSecure />,
    description: 'Sicher durch lokale Speicherung von Modell und Daten'
  }
]

export function Cards() {
  return (
    <div className="flex flex-col leading-4 md:flex-row">
      {cardConfig.map((card, index) => {
        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center flex-1 p-5 space-y-1"
          >
            <div className="flex items-center justify-center w-full h-8 md:w-auto">
              {card.icon}
            </div>
            <div className="text-lg text-center text-secondary-foreground">
              {card.title}
            </div>
            <div className="w-full text-muted-foreground">
              <Balancer>{card.description}</Balancer>
            </div>
          </div>
        )
      })}
    </div>
  )
}
