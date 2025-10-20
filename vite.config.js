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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/styles.[hash].css';
          }
          return 'assets/[name].[hash][extname]';
        },
        generatedCode: {
          symbols: false
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    }
  }
})