/* Fichiers des boutiques sur le disque : stockage/<boutique>/<photo>-<type>.<ext>.
   Les originaux restent privés ; les images du portant et les logos sont publics.
   Pour un hébergement à plusieurs serveurs, remplacer ce module par un stockage S3. */
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { resolve, dirname, normalize, sep } from 'node:path'
import { config } from './config.js'

const RACINE = config.stockage

function chemin (relatif) {
  const p = normalize(resolve(RACINE, relatif))
  if (!p.startsWith(RACINE + sep)) throw new Error('chemin interdit')
  return p
}

export async function ecrire (relatif, donnees) {
  const p = chemin(relatif)
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, donnees)
  return relatif
}
export const lire = (relatif) => readFile(chemin(relatif))
export const supprimer = (relatif) => rm(chemin(relatif), { force: true })

// Adresse publique d'un fichier public (portant, vignette, logo).
export const urlPublique = (relatif) => (relatif ? `/medias/${relatif}` : null)
// Seuls ces fichiers sont servis publiquement.
export const estPublic = (relatif) => /-(portant|vignette)(-\d+)?\.webp$|\/logo-[\w-]+\.(webp|png)$|-vitrine\.webp$/.test(relatif)
