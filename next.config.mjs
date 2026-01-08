import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      // Add S3 host configuration
      {
        protocol: 'https',
        hostname: 's3-eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'tw-eu-files.s3-eu-west-1.amazonaws.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  staticPageGenerationTimeout: 500,
  env: {
    BUILD_TIMESTAMP: new Date().toLocaleString('et-ET'),
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false
})
