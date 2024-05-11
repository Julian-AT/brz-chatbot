'use client'

// @ts-ignore
import { useActions, useUIState } from 'ai/rsc'
import { Message, SitemapJob } from '@/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import BRZLogo from '@/public/logo-brz.png'

import React from 'react'
import Image from 'next/image'
import { BriefcaseIcon, CalendarIcon, PinIcon } from 'lucide-react'
import ChatErrorMessage from '../chat/chat-error-message'
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

interface JobListProps extends React.HTMLAttributes<HTMLDivElement> {
  jobs: SitemapJob[]
}

const JobList = ({ jobs }: JobListProps) => {
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState()

  console.log(jobs)

  return (
    <div className="grid gap-2 p-2 border bg-secondary rounded-2xl border-border sm:p-4">
      <div className="grid justify-between gap-2 p-2 border-b sm:flex sm:flex-row">
        <div>
          <div className="text-sm sm:text-right text-muted-foreground flex items-center gap-1.5">
            Offene Stellen
            <BriefcaseIcon className="w-4 h-4" />
          </div>
          <div className="font-medium">Bundesrechenzentrum</div>
        </div>
        <div>
          <div className="text-sm sm:text-right text-muted-foreground flex items-center gap-1.5">
            Standort <PinIcon className="w-4 h-4" />
          </div>
          <div className="font-medium">Wien, Österreich</div>
        </div>
        <div>
          <div className="text-sm sm:text-right text-muted-foreground flex items-center gap-1.5">
            Aktuelles Datum
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="font-medium sm:text-right">
            {format(new Date(), 'dd, LLL yyyy', { locale: de })}
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {jobs.length > 0 ? (
          jobs.slice(0, 5).map(job => (
            <div
              key={job.loc}
              className="flex flex-row items-start gap-4 p-2 cursor-pointer sm:items-center rounded-xl hover:bg-card/25"
              onClick={async () => {
                try {
                  const response = await submitUserMessage(
                    `The user has selected the job with url ${job.loc}. Procede to show job description.`
                  )
                  setMessages((currentMessages: Message[]) => [
                    ...currentMessages,
                    response
                  ])
                } catch (error: any) {
                  console.log(error)

                  setMessages((currentMessages: Message[]) => [
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
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 p-1.5 rounded-md bg-background/50 border">
                <Image
                  src={BRZLogo}
                  width={1024}
                  height={1024}
                  alt="BRZ Logo"
                />
              </div>
              <div className="grid items-start flex-1 gap-4 sm:grid-cols-4 sm:gap-6">
                <div className="col-span-3">
                  <div className="font-medium truncate mr-2.5">{job.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Bundesrechenzentrum - Wien
                  </div>
                </div>
                <div>
                  <div className="font-mono font-medium tracking-tight sm:text-right">
                    {format(new Date(job.lastmod), 'dd, LLL yyyy', {
                      locale: de
                    })}
                  </div>
                  <div className="text-xs sm:text-right text-muted-foreground">
                    Erstellt am
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-3 text-center text-muted-foreground">
            Keine Jobs gefunden.{' '}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobList
