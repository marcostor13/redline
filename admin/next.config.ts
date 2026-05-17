import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/admin',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
    ],
  },
};

export default nextConfig;
