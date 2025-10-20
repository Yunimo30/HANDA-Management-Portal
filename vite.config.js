import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/HANDA-Management-Portal/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        compact: true,
        generatedCode: {
          symbols: false
        }
      }
    }
  }
})