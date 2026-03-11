/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.next.json",
  },
  output: "standalone",
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
}

export default nextConfig
