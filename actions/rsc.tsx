import { OpenAI } from 'openai'
import { createAI, getMutableAIState, render } from 'ai/rsc'
import { z } from 'zod'
import JobCard from '@/components/jobs/job-card'
import { Job, Message } from '@/types'
import { nanoid } from 'nanoid'
import ChatCircularProgress from '@/components/chat-circular-progress'
import ChatErrorMessage from '@/components/chat-error-message'
import { Button } from '@/components/ui/button'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'

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

  let progress: number = 0

  const ui = render({
    model: 'gpt-4-0125-preview',
    provider: openai,
    messages: [
      {
        role: 'system',
        content: `Du bist ein hilfreicher Chatbot der Fragen über das Bundesrechenzentrum (BRZ) beantwortet.

      Du hast zusätzlich Zugriff auf einige Tools, die dir helfen an relevante Informationen zu kommen.
      
      Befolge beim Beantworten der Fragen folgende Regeln:
      - Benutzte die Tools, die dir zur Verfügung gestellt werden
      - Verwende die Sprache des Users
      - Formatiere Antworten in Markdown`
      },
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

      return (
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <div className="w-full mb-2 last:mb-0">{children}</div>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '⬤') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">⬤</span>
                  )
                }

                children[0] = (children[0] as string).replace(`'\`⬤\`'`, '⬤')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {content}
        </MemoizedReactMarkdown>
      )
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
          if (progress < 75) {
            progress += 15
          }

          yield (
            // <ChatCircularProgress
            //   text="BRZ Jobs"
            //   description="Suche nach passenden Jobs..."
            //   progress={progress}
            // />
            <div>Grrrr</div>
          )

          async function fetchJobs() {
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
            if (!json || !json.jobs || json instanceof Error) {
              return (
                <ChatErrorMessage text="Ein Fehler bei der Suche nach passenden Jobs ist aufgetreten. Falls dieses Problem weiterhin besteht, kontaktieren Sie uns bitte." />
              )
            }

            const jobCount = json.jobs.length || 0
            const jobInfo = json as {
              timestamp: string
              filters: {
                textFilter: string
                categoryFilter?: string[]
              }
              jobs: Job[]
            }

            console.log(jobInfo)

            const jobs = jobInfo.jobs.slice(0, 3)

            if (jobCount === 0) {
              return (
                <div>
                  Ich habe leider keine passenden Jobs für deine Anfrage
                  gefunden. Bitte versuche es mit anderen Suchbegriffen oder
                  Kategorien erneut.
                  <div>
                    <Button
                      onClick={() => {
                        aiState.done([
                          ...aiState.get(),
                          {
                            role: 'function',
                            name: 'get_job_info',
                            content: JSON.stringify({
                              textFilter: '.',
                              categoryFilter: undefined
                            })
                          }
                        ])
                      }}
                    >
                      Zufällige Jobs anzeigen
                    </Button>
                  </div>
                </div>
              )
            }

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
                  {jobs.map((job, index) => (
                    <JobCard
                      date={job.date}
                      title={job.title}
                      subtitle={job.subtitle}
                      location={job.location}
                      image={job.image || null}
                      url={job.url}
                      key={index}
                    />
                  ))}
                </div>
              </div>
            )
          }

          try {
            return await fetchJobs()
          } catch (error) {
            console.log(
              'An error occured trying to fetch jobs. this is probably due to a cold start of the server. trying again.',
              error
            )
            try {
              return await fetchJobs()
            } catch (error) {
              console.log(error)
              return (
                <ChatErrorMessage text="Ein Fehler ist aufgetreten. Falls dieses Problem weiterhin besteht, kontaktieren Sie uns bitte." />
              )
            }
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
