// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Reverted to false for smoother Leaflet integration in dev
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
