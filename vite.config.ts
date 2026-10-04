import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      // Workaround for Vite HMR filesystem watching limitation inside WSL2 on our corporate-issued laptops
      usePolling: true,
    },
  },
});
