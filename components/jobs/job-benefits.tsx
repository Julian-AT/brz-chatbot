import {
  HomeIcon,
  PiggyBankIcon,
  PlaneIcon,
  SchoolIcon,
  StarsIcon,
  TicketIcon,
  TrainIcon
} from 'lucide-react'
import React from 'react'

export enum Benefit {
  'Flexible Arbeitszeiten ohne Kernzeiten & 60% Teleworking' = 'Flexible Arbeitszeiten & Teleworking',
  'Ausgezeichnete öffentliche Verkehrsanbindung in zentraler Lage' = 'Zentrale Lage',
  'Lehre, Traineeships und zukunftsorientierte Weiterbildungen' = 'Aus- und Weiterbildung',
  'Einzahlungen ab € 100,-/Monat in die Bundespensionskasse' = 'Betriebliche Vorsorge',
  'Stay connected mit Karenzierten, Kinderbetreuung an schulautonomen Tagen u.v.m.' = 'Beruf & Familie',
  'Ermäßigungen in zahlreichen Lokalen und Geschäften' = 'Vergünstigungen',
  'Moderne Arbeitsmittel, Prämien, Essensgutscheine u.v.m.' = 'Und vieles mehr!'
}

const getBenefitIcon = (benefit: Benefit) => {
  switch (benefit) {
    case Benefit[
      'Ausgezeichnete öffentliche Verkehrsanbindung in zentraler Lage'
    ]:
      return <TrainIcon className="w-10 h-10" />
    case Benefit['Flexible Arbeitszeiten ohne Kernzeiten & 60% Teleworking']:
      return <HomeIcon className="w-10 h-10" />
    case Benefit['Lehre, Traineeships und zukunftsorientierte Weiterbildungen']:
      return <SchoolIcon className="w-10 h-10" />
    case Benefit['Einzahlungen ab € 100,-/Monat in die Bundespensionskasse']:
      return <PiggyBankIcon className="w-10 h-10" />
    case Benefit[
      'Stay connected mit Karenzierten, Kinderbetreuung an schulautonomen Tagen u.v.m.'
    ]:
      return <PlaneIcon className="w-10 h-10" />
    case Benefit['Ermäßigungen in zahlreichen Lokalen und Geschäften']:
      return <TicketIcon className="w-10 h-10" />
    case Benefit['Moderne Arbeitsmittel, Prämien, Essensgutscheine u.v.m.']:
      return <StarsIcon className="w-10 h-10" />
    default:
      return null
  }
}

interface JobBenefitProps extends React.HTMLAttributes<HTMLDivElement> {
  benefits: Benefit[]
}

const JobBenefits = ({ benefits }: JobBenefitProps) => {
  return (
    <div className="grid grid-cols-3 h-full w-full gap-5">
      {benefits.map((benefit: Benefit, index: number) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center text-center p-2 gap-2"
        >
          {getBenefitIcon(benefit)}
          <span className="text-muted-foreground h-12">{benefit}</span>
        </div>
      ))}
    </div>
  )
}

export default JobBenefits
