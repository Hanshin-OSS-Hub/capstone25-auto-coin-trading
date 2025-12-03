import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://172.17.113.54:8080", // ⭐ WSL IP 주소로 변경!
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
