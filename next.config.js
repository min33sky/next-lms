/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['utfs.io'],
  },
};

module.exports = nextConfig;
