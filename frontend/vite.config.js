<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

>>>>>>> develop
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
<<<<<<< HEAD
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
=======
      "/api": {
        target: "http://172.17.113.54:8080", // ⭐ WSL IP 주소로 변경!
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
>>>>>>> develop
