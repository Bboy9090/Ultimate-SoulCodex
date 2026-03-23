import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, "../../"), "");
  return {
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
    define: {
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL || ""),
    },
    build: {
      outDir: "../../dist/public",
      emptyOutDir: true
    }
  };
});