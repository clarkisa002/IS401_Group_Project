import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "frontend",
  envDir: path.resolve(__dirname),
  server: {
    host: "localhost",
    port: 8080,
    fs: {
      allow: [".", "./frontend", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  publicDir: "frontend/public",
  build: {
    outDir: "../spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  optimizeDeps: {
    include: ["lucide-react"],
  },
});
