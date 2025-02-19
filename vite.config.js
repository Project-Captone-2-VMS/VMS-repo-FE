import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window", // Polyfill global to window in browser
    // 'process.env.HERE_MAP_API_KEY': JSON.stringify(process.env.HERE_MAP_API_KEY),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
