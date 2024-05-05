import { SitemapJob } from '@/types'
import fetch from 'node-fetch'

const SITEMAP_URL = 'https://www.brz-jobs.at/sitemap.xml'

function decodeJobTitleFromUrl(url: string): string {
  const uriEncodedTitle = url.substring(url.lastIndexOf('/') + 1)

  const decodedTitle = decodeURIComponent(uriEncodedTitle)
    .replace(/-/g, ' ')
    .replace(/\(w-m-d\)/g, '(w/m/d)')
    .replace(/(FH-)\)/g, '$1)')
    .replace(/(FH-)/g, '$1 ')
    .replace(/-im-/g, ' im ')

  return decodedTitle
}

export async function fetchSitemap(): Promise<SitemapJob[]> {
  try {
    const response = await fetch(SITEMAP_URL)
    const xmlData = await response.text()

    // Parse XML manually
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml')

    const urls = Array.from(xmlDoc.querySelectorAll('url'))
      .slice(1)
      .map(url => ({
        loc: url.querySelector('loc')?.textContent || '',
        lastmod: url.querySelector('lastmod')?.textContent || '',
        title: decodeJobTitleFromUrl(
          url.querySelector('loc')?.textContent || ''
        )
      })) as SitemapJob[]

    return urls
  } catch (error) {
    console.error('Error fetching or parsing sitemap:', error)
    return []
  }
}
