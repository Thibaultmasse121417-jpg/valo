import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Site multipage : accueil + pages secteur + tarifs (générées par scripts/build_pages.py).
const pages = ['index', 'commerces', 'immobilier', 'hotels-campings', 'notaires', 'tarifs']

export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    target: 'es2020',
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])) }
  }
})
