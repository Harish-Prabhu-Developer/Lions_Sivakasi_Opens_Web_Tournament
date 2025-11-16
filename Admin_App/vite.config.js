import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [react(),tailwindcss(),],
  server: {
    host: "0.0.0.0", // Listen on all network interfaces
    port: 5170,      // Set your desired port
    strictPort: true // Fail if port is already used

  },
});
