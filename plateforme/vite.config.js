import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const r = (p) => resolve(import.meta.dirname, 'web', p)
export default defineConfig({
  root: r('.'),
  base: '/',
  publicDir: false,
  build: {
    outDir: r('dist'),
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: { boutique: r('index.html'), catalogue: r('boutique/index.html'), produit: r('produit/index.html'), admin: r('admin/index.html'), commande: r('commande/index.html'), paiement: r('paiement-test/index.html') }
    }
  }
})
