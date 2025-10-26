import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: "10.85.78.247", // e.g. "192.168.1.100"
    port: 5173, // Optional: specify port if you want to override default
    strictPort: true, // Optional: fail if port is already used
  },
});
