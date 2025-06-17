// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disable for testing Leaflet initialization
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
