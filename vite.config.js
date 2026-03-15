import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || 'https://pag2pay-backend01-production.up.railway.app/api'
      ),
      'import.meta.env.VITE_WS_URL': JSON.stringify(
        env.VITE_WS_URL || 'wss://pag2pay-backend01-production.up.railway.app'
      ),
    }
  }
})
