import { OpenAI } from 'openai'
import { createAI, getMutableAIState, render } from 'ai/rsc'
import { z } from 'zod'
import { IconSpinner } from '@/components/ui/icons'
import JobCard from '@/components/jobs/job-card'
import { Job, Message } from '@/types'
import { nanoid } from 'nanoid'

const jobProfiles = [
  'BI/AI/Big Data/Data Science',
  'Communications/HR/Legal/Controlling/Finance',
  'Consulting',
  'Facility Management',
  'IT Architecture',
  'IT Security',
  'IT Support',
  'Lehre / Trainee',
  'Management',
  'Operations/Application Management',
  'Praktikum',
  'Product/Solution Management',
  'Project Management',
  'Quality und Testing',
  'SAP Development und Consulting',
  'Software Development',
  'Sonstige',
  'System-, Netzwerk- und Datenbank-Management',
  'Vertrieb/Business Partner Management'
] as const

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function Spinner() {
  return <IconSpinner className="animate-spin" />
}

function InfoMessage({ jobCount }: { jobCount: number }) {
  return (
    <div>
      Ich habe {jobCount} {jobCount > 1 ? 'passende Jobs' : 'passenden Job'} für
      deine Anfrage gefunden.
      {jobCount > 3 && 'Hier sind die Drei aktuellsten Jobs für deine Anfrage.'}
    </div>
  )
}

async function submitUserMessage(userInput: string): Promise<Message> {
  'use server'

  const aiState: any = getMutableAIState<typeof AI>()

  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content: userInput
    }
  ])

  const ui = render({
    model: 'gpt-4-0125-preview',
    provider: openai,
    messages: [
      { role: 'system', content: 'You are a flight assistant' },
      ...aiState.get()
    ],
    text: ({ content, done }: { content: any; done: any }) => {
      if (done) {
        aiState.done([
          ...aiState.get(),
          {
            role: 'assistant',
            content
          }
        ])
      }

      return <p>{content}</p>
    },
    tools: {
      get_job_info: {
        description: 'Sucht nach Jobs im BRZ Jobportal',
        parameters: z.object({
          textFilter: z
            .string()
            .min(1)
            .describe(
              'Suchbegriff oder Jobnummer nach dem gesucht werden soll. Wenn du nach nichts spezifischem suchst, gib einfach einen Punkt (".") ein. Sonst muss die Eingabe mindestens ein Zeichen lang sein.'
            ),
          categoryFilter: z
            .enum(jobProfiles)
            .optional()
            .describe(
              'Job Kategorie(n) oder Profile/Positionen die gesucht werden sollen. Wenn du nach nichts spezifischem oder einer bestimmten Nummer suchst, lass dieses Feld leer.'
            )
        }),
        render: async function* ({
          textFilter,
          categoryFilter
        }: {
          textFilter: string
          categoryFilter?: (typeof jobProfiles)[number]
        }) {
          yield <Spinner />

          try {
            const res = await fetch(
              'https://brz-chatbot.vercel.app/api/jobs/brz',
              {
                method: 'POST',
                headers: {
                  'Content-type': 'application/json',
                  Authorization: `Bearer ${process.env.JOB_API_VALIDATION_TOKEN}`
                },
                body: JSON.stringify({ textFilter, categoryFilter })
              }
            )
            const json = await res.json()
            console.log(json)

            if (!json || !json.jobs || json.jobs.length === 0) {
              return (
                <p>
                  Es wurden keine passenden Jobs für deine Anfrage gefunden.
                </p>
              )
            }

            const jobCount = json.jobs.length || 0
            const jobInfo = json.jobs?.slice(0, 3)

            console.log('jobinfo', jobInfo)

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'get_job_info',
                content: JSON.stringify(jobInfo)
              }
            ])

            return (
              <div className="flex flex-col gap-6">
                <InfoMessage jobCount={jobCount} />
                <div>
                  {jobInfo.map((job, index) => (
                    <JobCard
                      date={job.date}
                      title={job.title}
                      subtitle={job.description}
                      location={job.location}
                      image={job.image || null}
                      url={job.url}
                      key={index}
                    />
                  ))}
                </div>
              </div>
            )
          } catch (error) {
            console.log('Error:', error)
            return (
              <p>
                Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.
              </p>
            )
          }
        }
      }
    }
  })

  return {
    id: nanoid(),
    role: 'assistant',
    createdAt: new Date(),
    display: ui
  }
}

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function'
  content: string
  id?: string
  name?: string
}[] = []

const initialUIState: Message[] = []

export const AI = createAI({
  actions: {
    submitUserMessage
  },
  initialUIState,
  initialAIState
})
