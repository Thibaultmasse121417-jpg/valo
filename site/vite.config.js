import { defineConfig } from 'vite'

// base relative : le build fonctionne aussi bien à la racine d'un domaine que dans un sous-dossier.
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 0, target: 'es2020' }
})
