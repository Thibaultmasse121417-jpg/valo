/* Réglages de la plateforme, lus dans les variables d'environnement (ou le fichier .env). */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Chargement minimal d'un fichier .env (CLE=valeur), sans écraser l'environnement.
const fichierEnv = resolve(RACINE, '.env')
if (existsSync(fichierEnv)) {
  for (const ligne of readFileSync(fichierEnv, 'utf8').split('\n')) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const e = process.env
export const config = {
  port: Number(e.PORT || 8787),
  // Connexion de l'application (rôle portant_app, soumis à l'isolation par boutique).
  baseApp: e.DATABASE_URL || 'postgres://portant_app@localhost:5432/portant',
  // Connexion propriétaire, pour les migrations et la création des boutiques.
  baseAdmin: e.DATABASE_URL_ADMIN || e.DATABASE_URL || 'postgres://postgres@localhost:5432/portant',
  // Boutique affichée quand l'adresse n'est reliée à aucune (ex. ma-plateforme.onrender.com).
  boutiqueParDefaut: e.BOUTIQUE_PAR_DEFAUT || '',
  // Connexion chiffrée vers une base hébergée.
  ssl: /sslmode=require|render\.com|neon\.tech/.test(e.DATABASE_URL || '') ? { rejectUnauthorized: false } : undefined,
  stockage: resolve(RACINE, e.STOCKAGE_DIR || 'stockage'),
  modele: resolve(RACINE, e.MODELE_DETOURAGE || 'modeles/silueta.onnx'),
  web: resolve(RACINE, 'web/dist'),
  // En développement : ?boutique=slug et <slug>.localhost sont acceptés.
  dev: e.NODE_ENV !== 'production',
  stripe: {
    cle: e.STRIPE_SECRET_KEY || '',
    webhook: e.STRIPE_WEBHOOK_SECRET || '',
    // Commission de la plateforme sur chaque vente, en pourcentage (0 = aucune).
    commission: Number(e.STRIPE_COMMISSION_POURCENT || 0)
  },
  // Paiement simulé (sans argent réel) autorisé : jamais en production.
  paiementTest: e.PAIEMENT_TEST ? e.PAIEMENT_TEST === '1' : e.NODE_ENV !== 'production',
  sessionJours: 30
}
