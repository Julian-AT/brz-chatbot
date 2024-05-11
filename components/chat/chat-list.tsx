import { Session, UIState } from '@/types'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import JobCard from '../jobs/job-card'

export interface ChatList {
  messages: UIState
  session?: Session
  isShared: boolean
}

export function ChatList({ messages, session, isShared }: ChatList) {
  return messages.length ? (
    <div className="relative grid max-w-2xl gap-8 px-4 mx-auto mb-20 auto-rows-max">
      {!isShared && !session ? (
        <>
          <div className="relative flex items-start group md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-lg border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="flex-1 px-1 ml-5 space-y-2 overflow-auto">
              <p className="leading-normal text-muted-foreground">
                Bitte{' '}
                <Link href="/login" className="underline underline-offset-4">
                  melde dich an
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="underline underline-offset-4">
                  registriere dich
                </Link>{' '}
                um deinen Chatverlauf zu speichern und wiederzufinden!
              </p>
            </div>
          </div>
        </>
      ) : null}

      <JobCard
        jobInfo={{
          image:
            'https://www.brz-jobs.at/Content/jobAd/header_2023/JavaDeveloper_AstridDeleersnyder.jpg',
          title: 'Senior Java Fullstack Developer (w/m/d)',
          reference: 'Ref. 1195',
          location: 'Wien',
          employmentType: 'Vollzeit',
          startDate: 'ab sofort',
          duration: 'unbefristet',
          responsibilities: [],
          requirements: [
            'Sie konzipieren und übernehmen komplexe Programmieraufgaben für Neu- und Weiterentwicklungen von Java-Webanwendungen in einem agilen Projektumfeld',
            'Im Zuge von Modernisierungsprojekten unterstützen Sie die Migration etablierter Altapplikationen und Services auf einen neuen, aktuellen Technologiestack (u.a. Microservices, OpenShift) mit aktueller Frontend-Technologie.',
            'In Ihrem Entwicklungsteam arbeiten sie nach agile Methoden und gestalten diese aktiv mit',
            'Die Übernahme von 3rd Level Support für bestehende Lösungen sowie laufendes Testen und Dokumentieren',
            'Konfiguration und Weiterentwicklung der CI/CD Pipelines & enge Zusammenarbeit mit dem Operationsbereich',
            'Sie gehen aktiv auf juniore Entwickler:innen zu und geben gerne Ihr Know-How weiter'
          ],
          benefits: [
            'Flexible Arbeitszeiten ohne Kernzeiten & 60% Teleworking',
            'Ausgezeichnete öffentliche Verkehrsanbindung in zentraler Lage',
            'Lehre, Traineeships und zukunftsorientierte Weiterbildungen',
            'Gesundheitsvorsorge, 24/7-Fitnessraum, Sportveranstaltungen, arbeitspsychologische Beratung u.v.m.',
            'Onboarding und Weiterbildungen',
            'Einzahlungen ab € 100,-/Monat in die Bundespensionskasse',
            'Stay connected mit Karenzierten, Kinderbetreuung an schulautonomen Tagen u.v.m.',
            'Ermäßigungen in zahlreichen Lokalen und Geschäften',
            'Moderne Arbeitsmittel, Prämien, Essensgutscheine u.v.m.'
          ],
          applicationLink: 'https://www.brz-jobs.at/Login/1195',
          salary: 64547.7,
          entryText:
            'Wir sind das Kompetenzzentrum für Digitalisierung des Public Sectors in Österreich und damit Teil der kritischen Infrastruktur. Ob Digitales Amt, FinanzOnline, Unternehmensserviceportal oder digitaler Führerschein am Smartphone: Im BRZ entwickelte Anwendungen und Services vereinfachen Millionen Menschen den Alltag, indem sie Behördenwege mit wenigen Klicks ermöglichen. Im BRZ zu arbeiten heißt, mit seinem Job Österreichs Public Sector vorwärts zu bringen, modernste Technologien und Arbeitsweisen zu nutzen, Freiraum für Innovationen zu erhalten, Teil eines diversen und kraftvollen Teams zu sein und einen verantwortungsbewussten Arbeitgeber zu haben.Wir vergeben Topjobs mit Sinn!'
        }}
      />

      {messages.map(message => (
        <div key={message.id}>
          {message.spinner}
          {message.display}
          {message.attachments}
        </div>
      ))}
    </div>
  ) : null
}
