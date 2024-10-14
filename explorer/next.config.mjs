import { config } from 'process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
    serverSourceMaps: true,
  },
  webpack: {
    config: {
      devtool: 'eval-source-map',
    },
  },
};

export default nextConfig;
