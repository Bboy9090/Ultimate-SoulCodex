/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.next.json",
  },
  experimental: {
    serverComponentsExternalPackages: ["astronomy-engine"],
  },
}

export default nextConfig
