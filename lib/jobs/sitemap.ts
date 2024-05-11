'use server'

import { SitemapJob } from '@/types'
import fetch from 'node-fetch'
import xml2js from 'xml2js'

interface JobSimilarity {
  job: SitemapJob
  similarity: number
}

const SITEMAP_URL = 'https://www.brz-jobs.at/sitemap.xml'

function decodeJobTitleFromUrl(url: string): string {
  const uriEncodedTitle = url.substring(url.lastIndexOf('/') + 1)

  const decodedTitle = decodeURIComponent(uriEncodedTitle)
    .replace(/-/g, ' ')
    .replace(/\(w-m-d\)/g, '(w/m/d)')
    .replace(/(FH-)\)/g, '$1)')
    .replace(/(FH-)/g, '$1 ')
    .replace(/-im-/g, ' im ')

  console.log(decodedTitle)

  return decodedTitle
}

export async function fetchSitemap(): Promise<any> {
  try {
    const response = await fetch(SITEMAP_URL)
    const xmlData = await response.text()

    const parser = new xml2js.Parser({ explicitArray: false })
    const jsonData = await parser.parseStringPromise(xmlData)

    const urls = jsonData.urlset.url.slice(1).map((url: any) => ({
      loc: url.loc,
      lastmod: url.lastmod,
      title: decodeJobTitleFromUrl(url.loc)
    })) satisfies SitemapJob[]

    console.log(urls)

    return urls
  } catch (error) {
    console.error('Fehler beim Abrufen oder Parsen der Sitemap:', error)
    return null
  }
}

function calculateStringSimilarity(s1: string, s2: string): number {
  const maxLength = Math.max(s1.length, s2.length)
  let common = 0
  for (let i = 0; i < maxLength; i++) {
    if (s1[i] && s2[i] && s1[i].toLowerCase() === s2[i].toLowerCase()) {
      common++
    }
  }
  return common / maxLength
}

export async function findMatchingJobs(query: string): Promise<SitemapJob[]> {
  const sitemap = await fetchSitemap()
  if (!sitemap) {
    return []
  }

  const matches = sitemap.map(
    (job: SitemapJob) =>
      ({
        job,
        similarity: calculateStringSimilarity(query, job.title)
      }) satisfies JobSimilarity
  )

  matches.sort(
    (a: JobSimilarity, b: JobSimilarity) => b.similarity - a.similarity
  )

  const threshold = 0.5
  const filteredMatches = matches.filter(
    (match: JobSimilarity) => match.similarity >= threshold
  )

  return filteredMatches.map((match: JobSimilarity) => match.job)
}
