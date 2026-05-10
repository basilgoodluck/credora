/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://credora.basilgoodluck.com/:path*',
      },
    ];
  },
};

export default nextConfig;