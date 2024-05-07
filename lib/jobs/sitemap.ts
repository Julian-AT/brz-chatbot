'use server'

import fetch from 'node-fetch'
import xml2js from 'xml2js'

const SITEMAP_URL = 'https://www.brz-jobs.at/sitemap.xml'

export async function fetchSitemap(): Promise<any> {
  try {
    const response = await fetch(SITEMAP_URL)
    const xmlData = await response.text()

    const parser = new xml2js.Parser({ explicitArray: false })
    const jsonData = await parser.parseStringPromise(xmlData)

    const urls = jsonData.urlset.url.slice(1).map((url: any) => ({
      loc: url.loc,
      lastmod: url.lastmod
    }))

    return urls
  } catch (error) {
    console.error('Fehler beim Abrufen oder Parsen der Sitemap:', error)
    return null
  }
}
