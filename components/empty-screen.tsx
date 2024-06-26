import Balancer from 'react-wrap-balancer'
import { Cards } from '@/components/cards'
import { cn } from '@/lib/utils'

interface EmptyScreenProps extends React.ComponentProps<'div'> {}

export function EmptyScreen({ children, className }: EmptyScreenProps) {
  return (
    <div
      className={cn(
        'w-full min-h-full overflow-auto md:overflow-hidden select-none container',
        className
      )}
    >
      <div className="container flex flex-col justify-start h-full text-center md:justify-center">
        <div className="w-full mt-10 mb-5 text-5xl font-semibold md:my-5 text-secondary-foreground">
          <span className="hidden sm:inline bg-[linear-gradient(90deg,_rgba(9,_127,_77,_0.5)_0%,_rgba(185,_30,_35,_0.5)_0.01%,_rgba(185,_30,_35,_0)_100%)] border-l-primary border-l-4 pl-2">
            Bundesrechenzentrum
          </span>
          <span className="inline sm:hidden w-min bg-[linear-gradient(90deg,_rgba(9,_127,_77,_0.5)_0%,_rgba(185,_30,_35,_0.5)_0.01%,_rgba(185,_30,_35,_0)_100%)] border-l-primary border-l-4 pl-2">
            BRZ
          </span>
          &nbsp; Chatbot
        </div>
        <div className="text-xl text-muted-foreground">
          <Balancer>
            Vektorbasierter Chatbot für das Anwendungsbeispiel BRZ
          </Balancer>
        </div>
        <div className="hidden mb-10 md:inline">{children}</div>
        <div className="w-3/4 pb-32 mx-auto md:pb-0">
          <Cards />
        </div>
      </div>
      <div className="absolute bottom-0 z-20 inline w-full mt-5 md:hidden">
        {children}
      </div>
      <div className="absolute bottom-0 inset-x-0 e w-3/4 z-10 h-10 mx-auto bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(185,_30,_35,_0.8)_46.35%, _rgba(173,_255,_0,_0)_100%))] mix-blend-lighten border-[35px] border-red-600 filter blur-[175px] rounded-full" />
    </div>
  )
}
