import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",  // backend port
        changeOrigin: true,
        secure: false,
      },
        "/uploads": {   
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      }
    },
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    }
  }
});
