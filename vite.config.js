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
  server: {
    host: "127.0.0.1", // Chạy server trên 127.0.0.1 thay vì localhost
    port: 5173, // Thay đổi nếu cần
  },
});
