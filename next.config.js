const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      unoptimized: true,
      domains: ['localhost']
    },
    i18n: {
      locales: ['zh-TW'],
      defaultLocale: 'zh-TW',
      localeDetection: false
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '2mb'
      }
    },
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      SCRAPER_API_URL: process.env.SCRAPER_API_URL,
      SCRAPER_API_KEY: process.env.SCRAPER_API_KEY,
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      if (isServer) {
        config.externals.push('python-shell')
      }
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack')
      }
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      });
      return config;
    },
    serverRuntimeConfig: {
        maxDuration: 10,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: '/app/api/:path*',
        },
      ]
    },
}

module.exports = nextConfig