import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The back-office reaches the sovereign Supabase same-origin: the Supabase path
// prefixes are reverse-proxied to the API gateway (no CORS). supabase-js builds
// these paths off the origin, so they must live at the app root.
const gateway = process.env.SUPABASE_GATEWAY_URL || 'http://localhost:8000'
const supabaseProxy = {
  '/auth/v1': { target: gateway, changeOrigin: true },
  '/rest/v1': { target: gateway, changeOrigin: true },
  '/storage/v1': { target: gateway, changeOrigin: true },
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    // Allow access via the Docker service name (and localhost) in dev.
    allowedHosts: ['localhost', '127.0.0.1', 'website', 'backoffice'],
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: supabaseProxy,
  },
})
