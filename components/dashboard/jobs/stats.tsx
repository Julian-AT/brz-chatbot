import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stats } from '@/types'

interface JobsStatsProps {
  stats: Stats
}

export function JobsStats({ stats }: JobsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 ">
      <Card className="bg-background-base">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Stellenangebote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalJobsCount}</div>
        </CardContent>
      </Card>
      <Card className="bg-background-base">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.jobProfiles.length}</div>
        </CardContent>
      </Card>
      <Card className="bg-background-base">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Regionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.regions.reduce(
              (partialRegionCount, region) =>
                partialRegionCount + region.subregions.length > 0
                  ? region.subregions.length
                  : 1, // count of subregions or 1 if no subregions (region is the only subregion)
              0
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
