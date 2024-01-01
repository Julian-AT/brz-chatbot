import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  path: string
  id: string
  title: string
  createdAt: Date
  messages: Message[]
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
