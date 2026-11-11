import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    target: 'es2020',
    rollupOptions: {
      input: {
        vente: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html')
      }
    }
  }
})
