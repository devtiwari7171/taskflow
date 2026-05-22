import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // No proxy needed — we use VITE_API_URL directly in client.js
  server: {
    port: 5173,
    host: true,
  },
})
