import { getJobsAndStats } from '@/lib/job-api'
import fs from 'fs'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ') ||
      !isValidToken(authHeader.split(' ')[1])
    ) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const jobData = await getJobsAndStats()
    if (!jobData)
      return new Response(JSON.stringify({ error: 'Could not fetch jobs' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })

    const { stats } = jobData

    return new Response(JSON.stringify({ timestamp: new Date(), stats }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

function isValidToken(token: string) {
  return token === process.env.JOB_API_VALIDATION_TOKEN
}
