import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@soulcodex/db": path.resolve(import.meta.dirname, "../../packages/db"),
      "@soulcodex/core": path.resolve(import.meta.dirname, "../../packages/core"),
      "@soulcodex/astrology": path.resolve(import.meta.dirname, "../../packages/astrology"),
      "@soulcodex/ai": path.resolve(import.meta.dirname, "../../packages/ai"),
      "@assets": path.resolve(import.meta.dirname, "../../attached_assets"),
    }
  },
  build: {
    outDir: "../../dist/public",
    emptyOutDir: true
  }
});