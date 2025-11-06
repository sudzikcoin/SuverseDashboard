/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  env: {
    NEXT_PUBLIC_STRIPE_ON: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_') ? 'true' : 'false',
  },
}

module.exports = nextConfig
