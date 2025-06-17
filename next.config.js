// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Reverted to false for smoother Leaflet integration in dev
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
