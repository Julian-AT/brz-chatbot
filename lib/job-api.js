import puppeteer from 'puppeteer'
const { BRZ_JOBS_ENDPOINT } = process.env

export const getJobList = async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    await page.goto(BRZ_JOBS_ENDPOINT ?? 'https://www.brz-jobs.at/Jobs')
    const joblist = await page.evaluate('window.jobList')
    await browser.close()
    return joblist
  } catch (err) {
    console.error(err)
  }
}

export const getJobs = async () => {
  const joblist_raw = await getJobList()
  const joblist = joblist_raw.model.Jobs

  const jobs = joblist.map(job => {
    return {
      id: job.Id,
      title: job.Title,
      location: job.Location,
      date: job.Date,
      url: `https://www.brz-jobs.at/Job/${job.Id}/${job.UrlEncodedTitle}`
    }
  })

  return jobs
}

export const getJobListStats = async () => {
  const joblist_raw = await getJobList()
  const joblist = joblist_raw.model

  const tmp = ['RegionsViewModel', 'JobProfiles', 'TotalJobsCount'].reduce(
    function (obj2, key) {
      if (key in joblist) {
        if (key == 'RegionsViewModel')
          obj2[key] = joblist[key].Regions.map(region => {
            return {
              text: region.Text,
              subregions: region.SubRegions.map(subregion => subregion.Text)
            }
          })
        else if (key == 'JobProfiles')
          obj2[key] = joblist[key].map(job => job.Text)
        else obj2[key] = joblist[key]
      }
      return obj2
    },
    {}
  )
  return tmp
}
