import { DashboardHeader } from '@/components/dashboard/header'
import { JobsTable } from '@/components/dashboard/jobs/jobs-table'
import { JobsStats } from '@/components/dashboard/jobs/stats'
import { DashboardShell } from '@/components/dashboard/shell'
import { getJobsAndStats } from '@/lib/job-api'

export default async function JobAPIPlaygroundPage() {
  const jobData = await getJobsAndStats()
  if (!jobData) return null

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Job API Explorer"
        text="Informationen und Details zu den verfügbaren Jobs."
      ></DashboardHeader>
      <div className="w-full px-2">
        <JobsStats stats={jobData.stats} />
        <JobsTable jobs={jobData.jobs} />
      </div>
    </DashboardShell>
  )
}
