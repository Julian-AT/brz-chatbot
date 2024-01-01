import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { NextResponse } from 'next/server'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { RunnableSequence } from 'langchain/schema/runnable'
import { DynamicTool } from 'langchain/tools'

export const runtime = 'edge'

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

const {
  OPENAI_API_KEY,
  NEXT_PUBLIC_DEFAULT_MODEL_URL,
  NEXT_PUBLIC_DEFAULT_MODEL_NAME
} = process.env

// JOBS API GERADE DEAKTIVIERT
const jobTool = new DynamicTool({
  name: 'available-jobs',
  description: 'Gibt alle Jobs zurück, die derzeit offen sind.',
  func: async () => {
    console.log(`calling Jobs API`)
    const res = await fetch('/api/jobs/brz/').then(res => res.json())
    console.log('received data', res)
    return res
  }
})

const jobStatsTool = new DynamicTool({
  name: 'jobs-information',
  description:
    'Liefert Informationen über Jobkategorien, Anzahl und Regionen der Jobs.',
  func: async () => {
    console.log(`calling Job Stats API`)
    const res = await fetch('/api/jobs/brz/stats').then(res => res.json())
    console.log('received data', res)
    return res
  }
})

const tools = [jobTool, jobStatsTool]

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

    const TEMPLATE = `Du bist ein hilfreicher Chatbot der Fragen über das Bundesrechenzentrum (BRZ) beantworten kann. 
    Du bekommst eine Wissenbasis über das BRZ und kannst Fragen beantworten. Wenn du etwas nicht weißt, sag einfach, dass du es nicht weißt.
  

    Du musst folgende Regeln beachten beim beanworten der Fragen:
      - Wenn du die Antwort nicht weißt, sag, dass du es nicht weißt und erfinde keine zusätzlichen Informationen.
      - Gib möglichst viele Informationen aus dem Kontext wieder. 
      - Sei immer freundlich und duze den Benutzer.
      - Benutze das Markdown Format und gliedere deine Antwort in Absätze mit Überschriften.
      - Führe alle Quellen, die du für deine Antwort genutzt hast, getrennt am Ende der Antwort an. zb. [Quelle](https://www.brz.gv.at/)
      - Wenn du die Frage basierend auf dem Kontext nicht lösen kannst, sag, dass du es nicht weißt und gib dem Benutzer die Möglichkeit, die Frage umzuformulieren. Gib trotzdem potentielle Quellen an, um die Frage zu beantworten.
      - Wenn sich der Kontext nicht direkt auf die Frage bezieht, nenne die Information als Beispiel und gib die Quelle an.
    
      --------------------------------------------------
    KONTEXT:
    {context}
    --------------------------------------------------
    CHATVERLAUF:
    {chatHistory}
    --------------------------------------------------
    FRAGE:
    ${
      settings.model_name === 'mistral-7b-instruct'
        ? '[INST]{question}[/INST]'
        : '{question}'
    }
    --------------------------------------------------
    
    Antworte in der Sprache, die der User verwendet hat. Übersetzde den Kontext und die Antwort in die Sprache des Users.
    Wenn du die Frage basierend auf dem Kontext nicht lösen kannst, sag, dass du es nicht weißt und gib dem Benutzer die Möglichkeit, die Frage umzuformulieren. Gib trotzdem potentielle Quellen an, um die Frage zu beantworten.
    `

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      new OpenAIEmbeddings(),
      {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_COLLECTION_NAME
      }
    )

    const vectorStoreRetriever = vectorStore.asRetriever()

    const model = new ChatOpenAI(
      {
        temperature: 0.6,
        topP: 0.9,
        verbose: true,
        streaming: true,
        modelName: settings.model_name ?? NEXT_PUBLIC_DEFAULT_MODEL_NAME,
        openAIApiKey: OPENAI_API_KEY // Bei LocalAI nicht nötig (irgendwas definieren sonst akzeptiert langchain es nicht)
      },
      {
        baseURL: settings.model_uri ?? NEXT_PUBLIC_DEFAULT_MODEL_URL,
        apiKey: OPENAI_API_KEY,
        timeout: 10000
      }
    )

    const chain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory?: string }) =>
          input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) => {
          input.chatHistory ?? ''
        },
        context: async (input: { question: string; chatHistory?: string }) => {
          const relevantDocs = await vectorStoreRetriever.getRelevantDocuments(
            input.question
          )
          const serialized = relevantDocs
            .map(
              (doc, index) =>
                `${index + 1}. CONTEXT: ${doc.pageContent}\nSOURCE: ${
                  doc.metadata.source
                }\n`
            )
            .join('\n\n')
          console.log(serialized.slice(0, 2048))
          return serialized.slice(0, 2048)
        }
      },
      PromptTemplate.fromTemplate(TEMPLATE),
      model,
      new StringOutputParser()
    ])

    // VORBEREITUNG FÜR JOBS API
    // const modelWithTools = model.bind({
    //   functions: tools.map(tool => formatToOpenAIFunction(tool))
    // })

    // const agent = RunnableSequence.from([
    //   {
    //     input: (i: {
    //       input: string
    //       steps: AgentStep[]
    //       chatHistory: string
    //     }) => i.input,
    //     agent_scratchpad: i => formatForOpenAIFunctions(i.steps),
    //     chatHistory: (input: {
    //       input: string
    //       steps: AgentStep[]
    //       chatHistory: string
    //     }) => {
    //       input.chatHistory ?? ''
    //     },
    //     context: async (input: {
    //       input: string
    //       steps: AgentStep[]
    //       chatHistory: string
    //     }) => {
    //       const relevantDocs = await vectorStoreRetriever.getRelevantDocuments(
    //         input.input
    //       )
    //       const serialized = relevantDocs
    //         .map(
    //           (doc, index) =>
    //             `${index + 1}. CONTEXT: ${doc.pageContent}\nSOURCE: ${
    //               doc.metadata.source
    //             }\n`
    //         )
    //         .join('\n\n')
    //       console.log(serialized.slice(0, 2048))
    //       return serialized.slice(0, 2048)
    //     }
    //   },
    //   PromptTemplate.fromTemplate(TEMPLATE),
    //   modelWithTools,
    //   new OpenAIFunctionsAgentOutputParser()
    // ])

    // const executor = AgentExecutor.fromAgentAndTools({
    //   agent,
    //   tools
    // })

    const stream = await chain.stream({
      question: currentMessageContent,
      chatHistory: formattedPreviousMessages.join('\n')
    })

    const encoder = new TextEncoder()
    const tes = {
      start() {},
      transform(chunk: string, controller: any) {
        controller.enqueue(encoder.encode(chunk))
      }
    }

    /* Create a transform stream that encodes the text to unit8 */
    let __info_holder = new WeakMap() /* info holder */
    class EdgeRuntimeTransformer extends TransformStream {
      constructor() {
        let t = { ...tes }
        super(t)
        __info_holder.set(this, t)
      }
      get encoding() {
        return __info_holder.get(this).encoder.encoding
      }
    }

    return new StreamingTextResponse(
      stream.pipeThrough(new EdgeRuntimeTransformer())
    )
  } catch (e: any) {
    console.log(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
