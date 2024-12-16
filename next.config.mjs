/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, context) => {
    config.optimization.minimize = false;
    return config;
  }
};

export default nextConfig;
