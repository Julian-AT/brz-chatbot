import { Metadata } from 'next'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import moment from 'moment'
import { siteConfig } from '@/config/config'
import { AI } from '@/actions/rsc'


moment.locale('de')


export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    'Bundesrechenzentrum Chatbot',
    'BRZ Chatbot',
    'Bundesrechenzentrum',
    'BRZ',
    'Chatbot'
  ],
  authors: [
    {
      name: 'Julian S.',
      url: 'https://github.com/julian-at'
    }
  ],
  creator: 'julian-at',
  openGraph: {
    type: 'website',
    locale: 'de',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: '@julian-at'
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {/* @ts-ignore */}
            <main className="flex flex-col flex-1 bg-muted/50">
              <AI>{children}</AI>
              <Toaster />
            </main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
