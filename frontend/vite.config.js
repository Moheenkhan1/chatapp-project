import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows external access
    strictPort: true, // Ensures the same port is used
    port: 5173, // Change to your local port if needed
    allowedHosts: [
      "54ad-152-58-192-126.ngrok-free.app", // Add your ngrok URL here
      ".ngrok-free.app", // Allows any ngrok subdomain
    ],
  },
})
