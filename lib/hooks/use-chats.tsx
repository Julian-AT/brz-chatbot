import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
  useState
} from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { type Chat } from '@/lib/types'
import { Message } from 'ai'

interface ChatContextType {
  chats: Chat[] | undefined
  getChats: () => Chat[] | undefined
  getChat: (id: string) => Chat | undefined
  existsChat: (id: string) => boolean
  saveChat: (chat: Chat) => void
  removeChat: (id: string) => void
  clearChats: () => void
  appendMessage: (chatId: string, message: Message) => void
  removeMessage: (chatId: string, messageId: string) => void
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  getChats: () => [],
  getChat: () => undefined,
  existsChat: () => false,
  saveChat: () => {},
  removeChat: () => {},
  clearChats: () => {},
  appendMessage: () => {},
  removeMessage: () => {}
})

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [chats, setChats] = useLocalStorage<Chat[]>('chats', [])

  const getChats = useCallback(() => chats, [chats])

  const getChat = useCallback(
    (id: string) => (chats ? chats.find(chat => chat.id === id) : undefined),
    [chats]
  )

  const existsChat = useCallback(
    (id: string) => (chats ? chats.some(chat => chat.id === id) : false),
    [chats]
  )

  const saveChat = useCallback(
    (chat: Chat) => {
      setChats(currentChats => {
        const updatedChats = (currentChats ?? []).filter(c => c.id !== chat.id)
        updatedChats.push(chat)
        return updatedChats
      })
    },
    [setChats]
  )

  const removeChat = useCallback(
    (id: string) => {
      setChats((currentChats = []) =>
        currentChats.filter(chat => chat.id !== id)
      )
    },
    [setChats]
  )

  const clearChats = useCallback(() => {
    setChats([])
  }, [setChats])

  const appendMessage = useCallback(
    (chatId: string, message: Message) => {
      setChats(currentChats => {
        if (!chatId || !message) return currentChats ?? []

        const updatedChats: Chat[] = currentChats ?? []
        const chatIndex = updatedChats.findIndex(c => c.id === chatId)
        if (chatIndex !== -1) {
          const updatedChat = {
            ...updatedChats[chatIndex],
            messages: [...updatedChats[chatIndex].messages, message]
          }
          updatedChats[chatIndex] = updatedChat
        } else {
          updatedChats.push({
            id: chatId,
            path: `/chat/${chatId}`,
            createdAt: new Date(),
            title: message.content.substring(0, 100),
            messages: [message]
          })
        }

        return updatedChats
      })
    },
    [setChats]
  )

  const removeMessage = useCallback(
    (chatId: string, messageId: string) => {
      setChats(currentChats => {
        if (!chatId || !messageId) return currentChats ?? []

        const updatedChats: Chat[] = currentChats ?? []
        const chatIndex = updatedChats.findIndex(c => c.id === chatId)
        if (chatIndex !== -1) {
          const updatedChat = {
            ...updatedChats[chatIndex],
            messages: updatedChats[chatIndex].messages.filter(
              m => m.id !== messageId
            )
          }
          updatedChats[chatIndex] = updatedChat
        }

        return updatedChats
      })
    },
    [setChats]
  )

  return (
    <ChatContext.Provider
      value={{
        chats,
        getChats,
        getChat,
        existsChat,
        saveChat,
        removeChat,
        clearChats,
        appendMessage,
        removeMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChats = () => useContext(ChatContext)
