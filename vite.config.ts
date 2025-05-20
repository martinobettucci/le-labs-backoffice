import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force Vite to use esbuild-wasm in WebContainer
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  esbuild: {
    // This is a hint; Vite will use esbuild-wasm if available
    // No direct config, but having esbuild-wasm installed triggers fallback
  }
})
