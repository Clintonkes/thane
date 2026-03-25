/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only export as static files during production (Docker/Railway build)
  // In development, behave as a normal Next.js server
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
