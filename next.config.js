/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'boop-minioboop.dpbdp1.easypanel.host',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load these server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'utf-8-validate': false,
        'bufferutil': false,
        stream: false,
        crypto: false,
        http: false,
        https: false,
        ws: false,
        path: false,
        os: false,
        'fluent-ffmpeg': false,
        'puppeteer': false,
        'qrcode-terminal': false,
        'whatsapp-web.js': false
      };
    }

    // Enable source maps in development
    if (!isServer) {
      config.devtool = 'source-map';
    }

    return config;
  },
}

module.exports = nextConfig 