import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://go-api-gateway:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
      "/go-api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
    ],
  },
});
