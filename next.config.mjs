/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
        config.externals = [...config.externals, "canvas", "hnswlib-node"]

        return config
    },
}

export default nextConfig
