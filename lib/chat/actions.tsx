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

import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { AIState, Chat, UIState } from '@/types'
import { auth } from '@/auth'
import { format } from 'date-fns'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { rateLimit } from '@/lib/chat/ratelimit'
import { fetchSitemap, findMatchingJobs } from '@/lib/jobs/sitemap'
import JobList from '@/components/jobs/job-list'
import { extractJobInfoFromUrl } from '../jobs/job-info'
import JobCard from '@/components/jobs/job-card'
import ChatErrorMessage from '@/components/chat/chat-error-message'

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

  console.log(history)

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
                z.string().describe('List of available positions.')
              ),
              query: z.string().optional().describe('Optional search query.')
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
        Du bist ein freundlicher, hilfreicher Assistent, der Auskünfte über das Bundesrechenzentrum in Wien gibt. Du kannst generelle Informationen über das BRZ geben, Stellenempfehlungen basierend auf den Fähigkeiten des Benutzers machen und ihm bei der Bewerbung auf eine Stelle helfen.
    
        Das heutige Datum ist ${format(new Date(), 'd. LLLL yyyy')}. 
        Wenn der Benutzer nach Jobs im BRZ fragt, benutze diesen Ablauf (Der Ablauf kann auch jederzeit vom User abgebrochen werden):

        1. Liste verfügbarer Positionen.
        2. Zeige die Stellenbeschreibung für eine bestimmte Position.
        3. Leite zur Online-Bewerbung weiter.

        Wenn der Benutzer nach generellen Informationen fragt, antworte so gut möglich aber erfinde keine inakkuraten Informationen.
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
          console.log(textContent)

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
          console.log('tool-call')

          const { toolName, args } = delta

          if (toolName === 'listPositions') {
            const { query } = args
            console.log(query)

            let jobs

            if (query) {
              jobs = await findMatchingJobs(query)
            } else {
              jobs = await fetchSitemap()
            }

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
                  content: `Hier ist eine Liste der verfügbaren Positionen. Wähle eine aus, um die Stellenbeschreibung anzuzeigen.\n`,
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

            aiState.update({
              ...aiState.get(),
              interactions: []
            })

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
          }
        }
      }

      uiStream.done()
      textStream.done()
      messageStream.done()
    } catch (e) {
      console.error(e)

      const error = new Error(
        'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
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

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
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
          ) : message.display?.name === 'error' ? (
            <BotCard>
              <ChatErrorMessage text={message.display.props.error} />
            </BotCard>
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
