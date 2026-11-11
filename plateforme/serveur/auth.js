/* Mots de passe (scrypt) et sessions des administrateurs de boutique. */
import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'

const scryptP = promisify(scrypt)

export async function hacher (motDePasse) {
  const sel = randomBytes(16)
  const h = await scryptP(motDePasse, sel, 64)
  return `scrypt$${sel.toString('base64')}$${h.toString('base64')}`
}

export async function verifier (motDePasse, stocke) {
  const [algo, sel, h] = String(stocke).split('$')
  if (algo !== 'scrypt' || !sel || !h) return false
  const attendu = Buffer.from(h, 'base64')
  const calcule = await scryptP(motDePasse, Buffer.from(sel, 'base64'), attendu.length)
  return timingSafeEqual(attendu, calcule)
}

export const nouveauJeton = () => randomBytes(32).toString('base64url')
export const hashJeton = (j) => createHash('sha256').update(j).digest('hex')
