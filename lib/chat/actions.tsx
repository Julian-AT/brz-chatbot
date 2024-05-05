import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  createStreamableValue
} from 'ai/rsc'

import {
  BotCard,
  BotMessage,
  SpinnerMessage,
  UserMessage
} from '@/components/chat/message'

import { nanoid, sleep } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { AIState, Chat, SitemapJob, UIState } from '@/types'
import { auth } from '@/auth'
import { IconCheck, IconSpinner } from '@/components/ui/icons'
import { format } from 'date-fns'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { rateLimit } from '@/lib/chat/ratelimit'
import { fetchSitemap } from '@/lib/jobs/sitemap'
import JobList from '@/components/jobs/job-list'
import { extractJobInfoFromUrl } from '../jobs/job-info'
import JobCard from '@/components/jobs/job-card'

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
)

async function submitUserMessage(content: string) {
  'use server'

  await rateLimit()

  const aiState = getMutableAIState()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content: `${aiState.get().interactions.join('\n\n')}\n\n${content}`
      }
    ]
  })

  const history = aiState.get().messages.map((message: any) => ({
    role: message.role,
    content: message.content
  }))
  // console.log(history)

  const textStream = createStreamableValue('')
  const spinnerStream = createStreamableUI(<SpinnerMessage />)
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  ;(async () => {
    try {
      const result = await streamText({
        model: google('models/gemini-1.0-pro-001'),
        temperature: 0,
        tools: {
          listPositions: {
            description: 'List available positions, max 5.',
            parameters: z.object({
              positions: z.array(
                z
                  .string()
                  .describe(
                    'List of available positions. Include developer as one of the positions.'
                  )
              )
            })
          },
          showJobDescription: {
            description:
              'Display the detailed job description for a specific position.',
            parameters: z.object({
              url: z.string()
            })
          },
          applyOnline: {
            description: 'Redirect to the online application portal.',
            parameters: z.object({
              position: z.string(),
              department: z.string(),
              location: z.string(),
              applicationLink: z.string()
            })
          }
        },
        system: `\
        Sie sind ein freundlicher Assistent, der dem Benutzer bei der Bewerbung auf offene Stellen im Bundesrechenzentrum hilft. Sie können dem Benutzer Stellenempfehlungen basierend auf seinen Fähigkeiten geben und werden ihm weiterhin bei der Bewerbung auf eine Stelle helfen.
    
        Das heutige Datum ist ${format(new Date(), 'd. LLLL yyyy')}. 
    
        Hier ist der Ablauf: 
        1. Liste verfügbarer Positionen.
        2. Zeige die Stellenbeschreibung für eine bestimmte Position.
        3. Leite zur Online-Bewerbung weiter.
        `,
        messages: [...history]
      })

      let textContent = ''
      spinnerStream.done(null)

      for await (const delta of result.fullStream) {
        const { type } = delta

        if (type === 'text-delta') {
          const { textDelta } = delta

          textContent += textDelta
          messageStream.update(<BotMessage content={textContent} />)

          aiState.update({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: textContent
              }
            ]
          })
        } else if (type === 'tool-call') {
          const { toolName, args } = delta

          if (toolName === 'listPositions') {
            const jobs = await fetchSitemap()

            uiStream.update(
              <BotCard>
                <JobList jobs={jobs} />
              </BotCard>
            )

            aiState.done({
              ...aiState.get(),
              interactions: [],
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: `Hier ist eine Liste der verfügbaren Positionen. Wählen Sie eine aus, um die Stellenbeschreibung anzuzeigen.\n\n ${jobs.join(
                    ', '
                  )}.`,
                  display: {
                    name: 'listPositions',
                    props: {
                      jobs
                    }
                  }
                }
              ]
            })
          } else if (toolName === 'showJobDescription') {
            const { url } = args
            const jobInfo = await extractJobInfoFromUrl(url)

            uiStream.update(
              <BotCard>
                <JobCard jobInfo={jobInfo} />
              </BotCard>
            )

            aiState.done({
              ...aiState.get(),
              interactions: [],
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: `Hier ist die Stellenbeschreibung für die Position ${jobInfo.title} in ${jobInfo.location}.`,
                  display: {
                    name: 'showJobDescription',
                    props: {
                      jobInfo
                    }
                  }
                }
              ]
            })
          } else if (toolName === 'applyOnline') {
            const { position, department, location, applicationLink } = args

            uiStream.update(
              <BotCard>
                {/* <ApplyOnline
                  position={position}
                  department={department}
                  location={location}
                  applicationLink={applicationLink}
                /> */}
                Test card
              </BotCard>
            )

            aiState.done({
              ...aiState.get(),
              interactions: []
            })
          }
        }
      }

      uiStream.done()
      textStream.done()
      messageStream.done()
    } catch (e) {
      console.error(e)

      const error = new Error(
        'The AI got rate limited, please try again later.'
      )
      uiStream.error(error)
      textStream.error(error)
      messageStream.error(error)
      aiState.done((state: any) => state)
    }
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

export async function requestCode() {
  'use server'

  const aiState = getMutableAIState()

  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: 'assistant',
        content:
          "A code has been sent to user's phone. They should enter it in the user interface to continue."
      }
    ]
  })

  const ui = createStreamableUI(
    <div className="animate-spin">
      <IconSpinner />
    </div>
  )

  ;(async () => {
    await sleep(2000)
    ui.done()
  })()

  return {
    status: 'requires_code',
    display: ui.value
  }
}

export async function validateCode() {
  'use server'

  const aiState = getMutableAIState()

  const status = createStreamableValue('in_progress')
  const ui = createStreamableUI(
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-zinc-500">
      <div className="animate-spin">
        <IconSpinner />
      </div>
      <div className="text-sm text-zinc-500">
        Please wait while we fulfill your order.
      </div>
    </div>
  )

  ;(async () => {
    await sleep(2000)

    ui.done(
      <div className="flex flex-col items-center justify-center gap-3 p-4 text-center text-emerald-700">
        <IconCheck />
        <div>Payment Succeeded</div>
        <div className="text-sm text-zinc-600">
          Thanks for your purchase! You will receive an email confirmation
          shortly.
        </div>
      </div>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          role: 'assistant',
          content: 'The purchase has completed successfully.'
        }
      ]
    })

    status.done('completed')
  })()

  return {
    status: status.value,
    display: ui.value
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    requestCode,
    validateCode
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), interactions: [], messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }: { state: any }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'assistant' ? (
          message.display?.name === 'listPositions' ? (
            <BotCard>
              <JobList jobs={message.display.props.jobs} />
            </BotCard>
          ) : message.display?.name === 'showJobDescription' ? (
            <BotCard>
              <JobCard jobInfo={message.display.props.jobInfo} />
            </BotCard>
          ) : message.display?.name === 'applyOnline' ? (
            <BotCard>Test</BotCard>
          ) : (
            <BotMessage content={message.content} />
          )
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
