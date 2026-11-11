import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: './',
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  build: {
    assetsInlineLimit: 0,
    target: 'es2022',
    rollupOptions: {
      input: {
        boutique: resolve(import.meta.dirname, 'index.html'),
        atelier: resolve(import.meta.dirname, 'atelier/index.html')
      }
    }
  }
})
