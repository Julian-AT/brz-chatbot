import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { NextResponse } from 'next/server'
import { DynamicTool } from 'langchain/tools'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import { createRetrieverTool } from 'langchain/tools/retriever'
import { MessagesPlaceholder, ChatPromptTemplate } from 'langchain/prompts'
import { AIMessage, ChatMessage, HumanMessage } from '@langchain/core/messages'

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

const jobTool = new DynamicTool({
  name: 'available_jobs',
  description:
    'Liefert spezifische Jobs zurück, die derzeit im Bundesrechenzentrum (BRZ) offen sind. Gib als Verweis auf weiter Jobs die Website "https://www.brz-jobs.at/Jobs" an',
  func: async () => {
    console.log(`calling Jobs API`)
    const res = await fetch('https://brz-chatbot.vercel.app/api/jobs/brz', {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${JOB_API_VALIDATION_TOKEN}`
      }
    }).then(res => res.json())
    console.log('received data', res)
    return res
  },
  verbose: true
})

const jobStatsTool = new DynamicTool({
  name: 'jobs_information',
  description:
    'Liefert Informationen über Kategorien, Regionen und Anzahl der Verfügbaren Jobs im Bundesrechenzentrum (BRZ). Gib als Verweis auf weiter Jobs die Website "https://www.brz-jobs.at/Jobs" an',
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
    ).then(res => res.json())
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

const AGENT_SYSTEM_TEMPLATE = `Du bist ein hilfreicher Chatbot der ausschließlich Fragen über das Bundesrechenzentrum (BRZ) beantworten kann.

Befolge beim Beantworten der Fragen folgende Regeln:
- Benutzte die Tools, die dir zur Verfügung gestellt werden
- Verwende die richtige Sprache
- Verwende das Markdown Format um deine Antworten zu formatieren
`

export async function POST(req: Request) {
  console.log('Request received')

  try {
    /* Fetch JSON request body */
    const json = await req.json()

    /* Destructure messages from body */
    const { messages, settings } = json

    /* Format messages */
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)

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
        temperature: 0.6,
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
