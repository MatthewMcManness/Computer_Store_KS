/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ensure webpack resolves TypeScript paths correctly
  webpack: (config, { isServer }) => {
    // Explicitly set module resolution
    config.resolve.fullySpecified = false;

    // Ensure proper extension resolution
    if (!config.resolve.extensions) {
      config.resolve.extensions = [];
    }
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    extensions.forEach(ext => {
      if (!config.resolve.extensions.includes(ext)) {
        config.resolve.extensions.push(ext);
      }
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
