/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  basePath: '/generador-links/superpay',
  assetPrefix: '/generador-links/superpay',
  trailingSlash: true,
}

export default nextConfig;
