import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

import {
  BotCard,
  BotMessage,
  SpinnerMessage,
  UserMessage
} from '@/components/chat/message'

import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { AIState, Chat, UIState } from '@/types'
import { auth } from '@/auth'
import { format } from 'date-fns'
import { rateLimit } from '@/lib/chat/ratelimit'
import { fetchSitemap, findMatchingJobs } from '@/lib/jobs/sitemap'
import JobList from '@/components/jobs/job-list'
import { extractJobInfoFromUrl } from '../jobs/job-info'
import JobCard from '@/components/jobs/job-card'

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
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    // @ts-expect-error
    model: openai('gpt-4-turbo'),
    initial: <SpinnerMessage />,
    system: `\
        Du bist ein freundlicher, hilfreicher Assistent, der Auskünfte über das Bundesrechenzentrum in Wien gibt. Du kannst generelle Informationen über das BRZ geben, Stellenempfehlungen basierend auf den Fähigkeiten des Benutzers machen und ihm bei der Bewerbung auf eine Stelle helfen.
    
        Das heutige Datum ist ${format(new Date(), 'd. LLLL yyyy')}. 
        Wenn der Benutzer nach Jobs im BRZ fragt, benutze diesen Ablauf (Der Ablauf kann auch jederzeit vom User abgebrochen werden):

        1. Liste verfügbarer Positionen.
        2. Zeige die Stellenbeschreibung für eine bestimmte Position.
        3. Leite zur Online-Bewerbung weiter.

        Wenn der Benutzer nach generellen Informationen fragt, antworte so gut möglich aber erfinde keine inakkuraten Informationen.
        `,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      listPositions: {
        description: 'Liste verfügbarer Positionen, maximal 5',
        parameters: z.object({
          positions: z.array(
            z.string().describe('List of available positions.')
          ),
          query: z.string().optional().describe('Optional search query.')
        }),
        generate: async function* ({ positions, query }) {
          yield <SpinnerMessage />

          const jobs = query
            ? await findMatchingJobs(query)
            : await fetchSitemap()
          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listPositions',
                    toolCallId,
                    args: {
                      query,
                      positions
                    }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listPositions',
                    toolCallId,
                    result: jobs
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <JobList jobs={jobs} />
            </BotCard>
          )
        }
      },
      showJobDescription: {
        description:
          'Zeige die Stellenbeschreibung für eine bestimmte Position.',
        parameters: z.object({
          url: z.string().describe('Die URL der Stellenbeschreibung.')
        }),
        generate: async function* ({ url }) {
          yield <SpinnerMessage />

          const jobInfo = await extractJobInfoFromUrl(url)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showJobDescription',
                    toolCallId,
                    args: {
                      url
                    }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showJobDescription',
                    toolCallId,
                    result: jobInfo
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <JobCard jobInfo={jobInfo} />
            </BotCard>
          )
        }
      },
      applyOnline: {
        description: 'Leite zur Online-Bewerbung weiter.',
        parameters: z.object({
          job: z.string().describe('Die Stellenbezeichnung.')
        })
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
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
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

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
        message.role === 'tool' ? (
          (message.content as any).map((tool: any) => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <JobList jobs={message.display.props.jobs} />
              </BotCard>
            ) : tool.toolName === 'showJobDescription' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <JobCard jobs={message.display.props.jobInfo} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
