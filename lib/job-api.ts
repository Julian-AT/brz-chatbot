import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const { BRZ_JOBS_ENDPOINT } = process.env

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
      ? '/usr/bin/google-chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

interface Options {
  args: string[]
  executablePath: string
  headless: boolean | 'new'
  defaultViewport?: {
    width: number
    height: number
  }
}

async function getOptions(isDev: boolean): Promise<Options> {
  let options: Options
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: 'new'
    }
  } else {
    options = {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport
    }
  }
  return options
}

const fetchJobListData = async (): Promise<any> => {
  try {
    let browser: any
    const isDev = process.env.NODE_ENV === 'development'
    const options = await getOptions(isDev)

    if (!isDev) {
      browser = await puppeteer.launch(options)
    } else {
      const puppeteerRegular = require('puppeteer')
      browser = await puppeteerRegular.launch({ headless: true })
    }

    const page = await browser.newPage()
    await page.goto(BRZ_JOBS_ENDPOINT as string)
    const jobListRaw = await page.evaluate(() => (window as any).jobList)
    await browser.close()
    return jobListRaw
  } catch (err) {
    console.error(err)
    return null
  }
}

const windowSet = (page: any, name: any, value: any) =>
  page.evaluateOnNewDocument(`
    Object.defineProperty(window, '${name}', {
      get() {
        return '${value}'
      }
    })
  `)

const fetchJobListDataWithFilters = async (
  textFilter: string,
  categoryFilter: string[]
): Promise<any> => {
  try {
    let browser: any
    const isDev = process.env.NODE_ENV === 'development'
    const options = await getOptions(isDev)

    if (!isDev) {
      browser = await puppeteer.launch(options)
    } else {
      const puppeteerRegular = require('puppeteer')
      browser = await puppeteerRegular.launch({ headless: 'new' })
    }

    const page = await browser.newPage()
    await page.goto(BRZ_JOBS_ENDPOINT as string)

    console.log(textFilter, categoryFilter)

    await page.evaluate(
      (textFilter: string, categoryFilter: string[]) => {
        const form = document.getElementsByClassName(
          'jobs-filter'
        )[0] as HTMLFormElement
        if (textFilter && textFilter.length > 0) {
          ;(document.getElementById('filter') as HTMLInputElement).setAttribute(
            'value',
            textFilter
          )
        }
        if (categoryFilter && categoryFilter.length > 0) {
          Array.from(form.elements as HTMLFormControlsCollection).map(elm => {
            if (
              elm.getAttribute('type') === 'checkbox' &&
              categoryFilter.includes(
                elm.previousElementSibling?.getAttribute('value') ?? ''
              )
            ) {
              elm.setAttribute('checked', 'true')
            }
          })
        }
      },
      textFilter,
      categoryFilter
    )

    const text = await page.evaluate(
      () => document.getElementById('filter')?.getAttribute('value')
    )
    console.log(text)

    await page.evaluate(() => {
      document.getElementById('submitFilter')?.click()
    })

    await page.waitForNavigation()

    const jobListRaw = await page.evaluate(() => (window as any).jobList)
    await browser.close()
    return jobListRaw
  } catch (err) {
    console.error(err)
    return null
  }
}
interface Job {
  Id: number
  Title: string
  Location: string
  Date: string
  UrlEncodedTitle: string
}

const parseJobs = (jobs: Job[]) => {
  return jobs.map(job => ({
    id: job.Id,
    title: job.Title,
    location: job.Location,
    date: job.Date,
    url: `https://www.brz-jobs.at/Job/${job.Id}/${job.UrlEncodedTitle}`
  }))
}

interface JobList {
  RegionsViewModel: {
    Regions: Array<{
      Text: string
      SubRegions: Array<{ Text: string }>
    }>
  }
  JobProfiles: Array<{ Text: string }>
  TotalJobsCount: number
}

const parseStats = (jobList: JobList) => {
  const { RegionsViewModel, JobProfiles, TotalJobsCount } = jobList

  return {
    regions: RegionsViewModel?.Regions.map(region => ({
      text: region.Text,
      subregions: region.SubRegions.map(subregion => subregion.Text)
    })),
    jobProfiles: JobProfiles?.map(job => job.Text),
    totalJobsCount: TotalJobsCount
  }
}

export const getJobsAndStats = async () => {
  const jobListRaw = await fetchJobListData()

  if (!jobListRaw || !jobListRaw.model) {
    return { jobs: [], stats: {} }
  }

  const jobs = parseJobs(jobListRaw.model.Jobs)
  const stats = parseStats(jobListRaw.model)

  return {
    jobs,
    stats
  }
}

export const getJobsWithFilters = async (
  textFilter: string,
  categoryFilter: string[]
) => {
  const jobListRaw = await fetchJobListDataWithFilters(
    textFilter,
    categoryFilter
  )

  if (!jobListRaw || !jobListRaw.model) {
    return { jobs: [], stats: {} }
  }

  const jobs = parseJobs(jobListRaw.model.Jobs)

  return {
    filters: {
      textFilter,
      categoryFilter
    },
    jobs
  }
}
