/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
  }
}
