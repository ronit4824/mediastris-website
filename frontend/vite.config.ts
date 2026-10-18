import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const base = env.VITE_BASE_PATH || (mode === "production" ? "/mediastris-website/" : "/");
  if (!base.startsWith("/") || !base.endsWith("/")) {
    throw new Error("VITE_BASE_PATH must start and end with /.");
  }
  if (env.VITE_API_BASE_URL) {
    const url = new URL(env.VITE_API_BASE_URL);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw new Error("VITE_API_BASE_URL must be a public HTTPS origin without credentials or a path.");
    }
  }
  return {
    base,
    plugins: [react()],
    server: { proxy: { "/api": "http://localhost:8080" } },
  };
});
