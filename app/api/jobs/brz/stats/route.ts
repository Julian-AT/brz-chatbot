import { getJobListStats } from '@/lib/job-api'

export async function GET(req: Request) {
  try {
    const joblist = await getJobListStats()
    return Response.json({ joblist })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
