/** @type {import('next').NextConfig} */
const nextConfig = {
 // output: 'export', // Add this line to enable static exports
  experimental: {
    esmExternals: 'loose'
  },
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
  // Add this to ensure TypeScript files are processed
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = nextConfig;