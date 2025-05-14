import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ai': {
        target: process.env.VITE_AI_SERVICE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          mapbox: ['mapbox-gl'],
          vendor: ['axios', 'bootstrap']
        }
      }
    }
  }
})
