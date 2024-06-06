import { Sidebar } from '@/components/sidebar/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/sidebar/chat-history'
import { IconBRZ } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getChats } from '@/app/actions'

export async function SidebarDesktop() {
  const session = await auth()
  const chats = await getChats(session?.user?.id)

  return (
    <>
      <Sidebar
        className="relative bg-background inset-y-0 hidden w-full -translate-x-full
    duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex "
      >
        <div className="w-full h-full p-3">
          <div className="relative h-20 ">
            <div className="flex w-full h-full bg-secondary rounded-xl">
              <a
                href={'https://brz-chatbot.vercel.app/'}
                className="w-12 h-12 m-auto ml-5 mr-3 border rounded-full border-primary border-opacity-80 bg-primary text-secondary"
              >
                <IconBRZ className="w-full h-full p-1.5" />
              </a>
              <div className="flex flex-col justify-center flex-1">
                <div className="hidden text-lg leading-5 text-secondary-foreground 2xl:block">
                  <Button
                    variant={'link'}
                    size={'sm'}
                    className="h-5 p-0 text-base font-normal text-secondary-foreground"
                  >
                    <Link href={'https://brz-chatbot.vercel.app/'}>
                      Bundesrechenzentrum Chatbot
                    </Link>
                  </Button>
                </div>
                <div className="block text-lg leading-5 text-secondary-foreground 2xl:hidden">
                  BRZ Chatbot
                </div>
                {chats && (
                  <span className="text-sm text-muted-foreground">
                    {chats?.length} Chat{chats?.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          {session?.user ? (
            <ChatHistory userId={session.user.id} />
          ) : (
            <div className="relative flex flex-col items-center justify-center w-full h-min">
              {/* <span className="text-center text-muted-foreground">
                Melde dich an, <br /> um deine Chats zu speichern.
              </span> */}
              <div className="flex flex-col flex-1 w-full h-full py-4 space-y-4 border">
                {Array.from({ length: 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-center w-full h-16 gap-2 p-2 rounded-lg shrink-0 bg-secondary"
                  >
                    <div
                      className="h-4 rounded-lg bg-muted"
                      style={{ width: Math.random() * 30 + 70 + '%' }}
                    />
                    <div
                      className="h-4 rounded-lg bg-muted"
                      style={{ width: Math.random() * 30 + 30 + '%' }}
                    />
                  </div>
                ))}
              </div>
              <div className="z-20 flex items-center justify-center w-full h-12 border">
                <Button size={'lg'} className="w-48 h-12 text-lg font-semibold">
                  <Link href={'/login'}>Anmelden</Link>
                </Button>
              </div>

              {/* <div className="absolute inset-x-0 top-0 z-10 h-full pointer-events-none bg-gradient-to-t from-30% from-background" /> */}
            </div>
          )}
        </div>
      </Sidebar>
    </>
  )
}
