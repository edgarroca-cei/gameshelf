import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Rutas absolutas para producción
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    cssCodeSplit: false, // Deshabilitar división de CSS para asegurar que se cargue todo
    minify: 'esbuild',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: undefined, // Evitar chunks manuales que puedan separar CSS
      },
    },
  },
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase', // Asegurar consistencia en nombres de clases
    },
  },
})
