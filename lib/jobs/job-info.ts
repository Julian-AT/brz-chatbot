'use server'

import cheerio from 'cheerio'

export interface JobInfo {
  title: string | undefined
  reference: string | undefined
  location: string | undefined
  employmentType: string | undefined
  startDate: string | undefined
  duration: string | undefined
  entryText: string | undefined
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  applicationLink: string | undefined
  salary: number | undefined
}

export async function extractJobInfoFromUrl(url: string): Promise<JobInfo> {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const title = $('.jobAdTitle h1').text().trim()
    const reference = $('.jobAdTitle span').text().trim()
    const location = $('.shortFacts div:nth-of-type(1) span').text().trim()
    const employmentType = $('.shortFacts div:nth-of-type(2) span')
      .text()
      .trim()
    const startDate = $('.shortFacts div:nth-of-type(3) span').text().trim()
    const duration = $('.shortFacts div:nth-of-type(4) span').text().trim()
    const responsibilities = $('.jobBlock:nth-of-type(4) li')
      .map((_: any, el: any) => $(el).text().trim())
      .get()
    const requirements = $('.jobBlock:nth-of-type(5) li')
      .map((_: any, el: any) => $(el).text().trim())
      .get()
    const benefits = $('.benefitsDiv .benefitInfo')
      .map((_: any, el: any) => $(el).text().trim())
      .get()
    const applicationLink = $('.centerBtn .applyButton').attr('href')
    const paymentText = $('.jobBlock.Print p').text().trim()
    const salaryMatch = paymentText.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})/)
    const salary = salaryMatch
      ? parseFloat(salaryMatch[0].replace('.', '').replace(',', '.'))
      : undefined
    const entryText = $('.jobBlock:nth-of-type(1) p').text().trim()

    return {
      title,
      reference,
      location,
      employmentType,
      startDate,
      duration,
      responsibilities,
      requirements,
      benefits,
      applicationLink,
      salary,
      entryText
    } satisfies JobInfo
  } catch (error: any) {
    throw new Error(
      'Fehler beim Extrahieren der Jobinformationen: ' + error.message
    )
  }
}
