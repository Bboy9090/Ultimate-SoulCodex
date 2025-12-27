import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // ONLY add this line if your index.html is inside the 'client' folder
  // root: path.resolve(__dirname, "client"), 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "../dist/public", // Goes up one level if root is 'client'
    emptyOutDir: true,
  },
});
