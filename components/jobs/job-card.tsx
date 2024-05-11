'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { JobInfo } from '@/lib/jobs/job-info'
import { Separator } from '../ui/separator'
import Image from 'next/image'
import BRZLogo from '@/public/logo-brz.png'
import { useTruncatedElement } from '@/lib/hooks/use-truncate-element'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  BriefcaseIcon,
  ClockIcon,
  DollarSignIcon,
  EuroIcon,
  PinIcon
} from 'lucide-react'
import { abbreviateNumber } from '@/lib/utils'
import JobBenefit, { Benefit } from './job-benefits'
import JobBenefits from './job-benefits'

interface JobCardProps {
  jobInfo: JobInfo
}

const JobCard = ({ jobInfo }: JobCardProps) => {
  const ref = React.useRef(null)
  const { isTruncated, isReadingMore, setIsReadingMore } = useTruncatedElement({
    ref
  })

  return (
    <Card className="flex flex-col p-5 gap-5 my-5 space-y-5 bg-secondary">
      <div className="w-full h-64 bg-secondary border border-border rounded-xl relative">
        <Image
          alt="Image"
          src={jobInfo.image as string}
          fill
          className="object-cover rounded-xl"
        />
      </div>
      <div className="mx-3">
        <div className="font-bold text-2xl">{jobInfo.title}</div>
        <div className="flex space-x-3 my-3">
          <Badge className="flex gap-1 bg-secondary border border-border text-sm hover:bg-background">
            <PinIcon className="w-3.5 h-3.5" />
            {jobInfo.location}
          </Badge>
          <Badge className="flex gap-1 bg-secondary border border-border text-sm hover:bg-background">
            <BriefcaseIcon className="w-3.5 h-3.5" />
            {jobInfo.employmentType}
          </Badge>
          <Badge className="flex gap-1 bg-secondary border border-border text-sm hover:bg-background">
            <ClockIcon className="w-3.5 h-3.5" />
            {jobInfo.startDate}
          </Badge>
          <Badge className="flex gap-1 bg-secondary border border-border text-sm hover:bg-background">
            <EuroIcon className="w-3.5 h-3.5" />~
            {abbreviateNumber(jobInfo.salary as number)}
          </Badge>
        </div>
        <div className="grid grid-cols-1">
          <div className="flex flex-col gap-10 mt-5">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-bold">Beschreibung</span>
              <p
                ref={ref}
                className={`break-words text-xl ${
                  !isReadingMore && 'line-clamp-3'
                }`}
              >
                {jobInfo.entryText}
              </p>
              <Button
                onClick={() => setIsReadingMore(!isReadingMore)}
                variant={'link'}
                className="px-0 max-w-fit text-secondary-foreground text-base font-semibold"
              >
                {isReadingMore ? 'Weniger lesen' : 'Mehr lesen'}
              </Button>
            </div>
            {jobInfo.responsibilities.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-lg font-bold">Ihre Aufgaben</span>
                <Separator />
                <ul className="list-disc">
                  {jobInfo.responsibilities.map(
                    (resp: string, index: number) => (
                      <li key={index}>{resp}</li>
                    )
                  )}
                </ul>
              </div>
            )}
            {jobInfo.requirements.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xl font-semibold">Sie bringen mit</span>
                <Separator />
                <ul className="list-disc space-y-3">
                  {jobInfo.requirements.map((resp: string, index: number) => (
                    <li key={index} className="text-base">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border">
              <JobBenefits
                benefits={jobInfo.benefits
                  .map(benefit => Benefit[benefit as keyof typeof Benefit])
                  .filter(elm => elm)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default JobCard
