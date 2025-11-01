import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Vercel sirve desde la raíz del dominio
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets', // Directorio específico para assets
    cssCodeSplit: true, // Cambiar a true pero con configuración específica
    rollupOptions: {
      output: {
        // Configuración específica para CSS modules
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]', // Nombres más consistentes
    },
    devSourcemap: true, // Mejor debugging en desarrollo
  },
})
