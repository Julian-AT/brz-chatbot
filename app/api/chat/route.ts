import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { NextResponse } from 'next/server'
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import { createRetrieverTool } from 'langchain/tools/retriever'
import { MessagesPlaceholder, ChatPromptTemplate } from 'langchain/prompts'
import { AIMessage, ChatMessage, HumanMessage } from '@langchain/core/messages'
import { z } from 'zod'

export const runtime = 'edge'

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

const {
  OPENAI_API_KEY,
  DEFAULT_MODEL_URL,
  DEFAULT_MODEL_NAME,
  JOB_API_VALIDATION_TOKEN
} = process.env

// hardcoded weil sonst dauert es min. 20sek bis die Daten geladen sind
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
]

const jobTool = new DynamicStructuredTool({
  name: 'job_search',
  description:
    'Sucht nach spezifischen Jobs die derzeit im Bundesrechenzentrum (BRZ) offen sind. Jeder Job besetht aus einem Namen, einer URL, einem Standort und einem Erstellugsdatum. Liste pro Job zuerst den Titel und dann in einer Markdown Liste alle zusätzlichen Informationen auf (Beschreibung, Erstellungsdatum, Standort und URL).',
  schema: z.object({
    textFilter: z
      .string()
      .optional()
      .describe('Suchbegriff oder Jobnummer nach dem gesucht werden soll'),
    categoryFilter: z
      .string()
      .refine(profile => jobProfiles.includes(profile))
      .array()
      .min(1)
      .describe('Kategorie(n) der Job Profile die gesucht werden sollen')
  }),
  func: async ({ textFilter, categoryFilter }) => {
    console.log(`calling Jobs API`)
    const res = await fetch('https://brz-chatbot.vercel.app/api/jobs/brz', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${JOB_API_VALIDATION_TOKEN}`
      },
      body: JSON.stringify({
        textFilter,
        categoryFilter
      })
    }).then(res => res.json())
    const jobs = res.jobs?.slice(10) // max 10 neuste Jobs
    return JSON.stringify(jobs)
  },
  verbose: true
})

const jobStatsTool = new DynamicTool({
  name: 'jobs_information',
  description:
    'Liefert Informationen über Job-Profile, Regionen und Anzahl der Verfügbaren Jobs im Bundesrechenzentrum (BRZ). Sag am Ende, dass du dem Nutzer Informationen über konkrete Jobs liefern kannst wenn er z.B. nach einer Kategorie oder einem Begriff fragt.',
  func: async () => {
    console.log(`calling Job Stats API`)
    const res = await fetch(
      'https://brz-chatbot.vercel.app/api/jobs/brz/stats',
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${JOB_API_VALIDATION_TOKEN}`
        }
      }
    ).then(res => res.text())
    console.log('received data', res)
    return res
  },
  verbose: true
})

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content)
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content)
  } else {
    return new ChatMessage(message.content, message.role)
  }
}

const AGENT_SYSTEM_TEMPLATE = `Du bist ein hilfreicher Chatbot der Fragen über das Bundesrechenzentrum (BRZ) beantwortet.

Du hast zusätzlich Zugriff auf einige Tools, die dir helfen an relevante Informationen zu kommen.

Befolge beim Beantworten der Fragen folgende Regeln:
- Benutzte die Tools, die dir zur Verfügung gestellt werden
- Verwende die Sprache des Users
- Formatiere Antworten in Markdown
`

export async function POST(req: Request) {
  console.log('Request received')

  try {
    /* Fetch JSON request body */
    const json = await req.json()

    /* Destructure messages from body */
    const { messages, settings } = json

    /* Get current message content */
    const currentMessageContent = messages[messages.length - 1].content

    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage)

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      new OpenAIEmbeddings(),
      {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_COLLECTION_NAME
      }
    )

    console.log('settings', settings)

    const vectorStoreRetriever = vectorStore.asRetriever()

    const retrieverTool = createRetrieverTool(vectorStoreRetriever, {
      name: 'brz_retriever',
      description:
        'Sucht nach Informationen über das Bundesrechenzentrum (BRZ). Du musst dieses Tool für jede Frage, die sich auf das BRZ bezieht, verwenden.'
    })

    const tools = [jobTool, jobStatsTool, retrieverTool]

    const model = new ChatOpenAI(
      {
        temperature: 0.69,
        topP: 0.9,
        streaming: true,
        modelName: settings.model_name ?? DEFAULT_MODEL_NAME,
        openAIApiKey: OPENAI_API_KEY // Bei LocalAI nicht nötig (irgendwas definieren sonst akzeptiert langchain es nicht)
      },
      {
        baseURL: settings.model_uri ?? DEFAULT_MODEL_URL,
        apiKey: OPENAI_API_KEY,
        timeout: 10000
      }
    )

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', AGENT_SYSTEM_TEMPLATE],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad')
    ])

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt
    })

    const agentExecutor = new AgentExecutor({
      agent,
      tools
    })

    const logStream = agentExecutor.streamLog({
      input: currentMessageContent,
      chat_history: previousMessages
    })

    const textEncoder = new TextEncoder()
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === 'add') {
            const addOp = chunk.ops[0]
            if (
              addOp.path.startsWith('/logs/ChatOpenAI') &&
              typeof addOp.value === 'string' &&
              addOp.value.length
            ) {
              controller.enqueue(textEncoder.encode(addOp.value))
            }
          }
        }
        controller.close()
      }
    })

    return new StreamingTextResponse(transformStream)
  } catch (e: any) {
    console.log(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
