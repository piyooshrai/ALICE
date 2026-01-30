/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
    ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  },
}

module.exports = nextConfig
