const { BRZ_JOBS_ENDPOINT } = process.env

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
      ? '/usr/bin/google-chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function getOptions(isDev) {
  let options
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: true
    }
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
    }
  }
  return options
}

const fetchJobListData = async () => {
  try {
    let browser
    if (process.env.NODE_ENV !== 'development') {
      const chromium = require('@sparticuz/chromium')
      chromium.setGraphicsMode = false
      const puppeteer = require('puppeteer-core')
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless
      })
    } else {
      const puppeteer = require('puppeteer')
      browser = await puppeteer.launch({ headless: 'new' })
    }
    const page = await browser.newPage()

    await page.goto(BRZ_JOBS_ENDPOINT)
    const jobListRaw = await page.evaluate(() => jobList)
    await browser.close()

    console.log('jobListRaw', jobListRaw)
    return jobListRaw
  } catch (err) {
    console.error(err)
    return null
  }
}

const parseJobs = jobs => {
  return jobs.map(job => ({
    id: job.Id,
    title: job.Title,
    location: job.Location,
    date: job.Date,
    url: `https://www.brz-jobs.at/Job/${job.Id}/${job.UrlEncodedTitle}`
  }))
}

const parseStats = jobList => {
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
