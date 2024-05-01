/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
  },
  images: {
    remotePatterns: [
      {
        hostname: 'www.brz-jobs.at',
        protocol: 'https',
        port: ''
      }
    ]
  }
}
