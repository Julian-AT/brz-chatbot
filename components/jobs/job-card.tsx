import React from 'react'
import { Card } from '@/components/ui/card'
import { JobInfo } from '@/lib/jobs/job-info'
import { Separator } from '../ui/separator'

interface JobCardProps {
  jobInfo: JobInfo
}

const JobCard = ({ jobInfo }: JobCardProps) => {
  return (
    <Card className="flex flex-col p-5 my-5 space-y-5 bg-secondary">
      <div className="text-4xl">{jobInfo.title}</div>
      <div className="flex space-x-5">
        <div className="text-lg">{jobInfo.location}</div>
        <div className="text-lg">{jobInfo.employmentType}</div>
        <div className="text-lg">{jobInfo.startDate}</div>
        <div className="text-lg">{jobInfo.duration}</div>
      </div>
      <Separator />
      <div className="text-lg">{jobInfo.entryText}</div>
    </Card>
  )
}

export default JobCard
