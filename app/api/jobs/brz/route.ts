import { getJobsAndStats, getJobsWithFilters } from '@/lib/job-api'
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

    const { jobs } = await getJobsAndStats()

    return new Response(JSON.stringify({ timestamp: new Date(), jobs }), {
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

export async function POST(req: Request) {
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

    const { textFilter, categoryFilter } = await req.json()
    console.log('textFilter from API', textFilter)
    console.log('categoryFilter from API', categoryFilter)

    if (!textFilter && !categoryFilter) {
      return new Response(JSON.stringify({ error: 'No filters provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const jobs = await getJobsWithFilters(textFilter, categoryFilter)

    return new Response(JSON.stringify({ timestamp: new Date(), ...jobs }), {
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
