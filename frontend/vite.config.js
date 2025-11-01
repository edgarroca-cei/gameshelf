import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false, // Importante para CSS modules en producción
    rollupOptions: {
      output: {
        manualChunks: undefined, // Evita chunking que puede afectar CSS
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase', // Asegura consistencia en nombres de clase
    },
  },
})
