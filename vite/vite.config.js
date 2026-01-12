import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['lautaro.space', 'www.lautaro.space'],
    port: 5173,
    host: true
  }
})