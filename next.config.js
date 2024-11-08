/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals = [...config.externals, { canvas: "canvas" }];

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/analyses/new',
        destination: '/analysis',
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/analyses',
        destination: '/analyses/history',
        permanent: true,
      },
      {
        source: '/patient-records',
        destination: '/dashboard/patient-records',
        permanent: true,
      },
    ];
  },
  env: {
    API_URL: process.env.API_URL
  }
};

module.exports = nextConfig;