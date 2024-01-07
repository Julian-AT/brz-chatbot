import { getJobsAndStats, getJobsWithFilters } from '@/lib/job-api'

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

    const { jobs } = jobData

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

    const { textFilter, categoryFilter } = await req.json().catch(() => {
      throw new Error(
        'Could not parse JSON body. Please provide a valid JSON body. Use GET for this route instead to call with no filters. Example Body: { "textFilter": "Java", "categoryFilter": "Software Development" }'
      )
    })
    if (!textFilter && !categoryFilter) {
      return new Response(
        JSON.stringify({
          error:
            'No filters provided. Use GET for this route instead to call with no filters. Example Body: { "textFilter": "Java", "categoryFilter": "Software Development" }'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
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
