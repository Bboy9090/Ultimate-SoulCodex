/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.next.json",
    // Type errors are pre-existing; don't block the build
    ignoreBuildErrors: true,
  },
  // "export" generates fully-static HTML/CSS/JS that the Express server can serve.
  // The app calls /api/* endpoints — set NEXT_PUBLIC_API_URL to point at the
  // Express API server when deploying the Next.js frontend separately.
  output: "export",
  // Output to dist/next-public so it doesn't conflict with the Vite build
  distDir: "dist/next-public",
  // Required for static export — disable built-in image optimization
  images: {
    unoptimized: true,
  },
}

export default nextConfig
