/* Accès à la base. Toute requête métier passe par avecBoutique(), qui déclare la boutique
   dans la transaction : la sécurité par ligne de PostgreSQL masque alors toutes les autres. */
import pg from 'pg'
import { config } from './config.js'

pg.types.setTypeParser(20, (v) => Number(v)) // bigint → nombre (numéros de commande)

export const pool = new pg.Pool({ connectionString: config.baseApp, max: 10 })

export async function avecBoutique (boutiqueId, fn) {
  if (!boutiqueId) throw new Error('boutique manquante')
  const c = await pool.connect()
  try {
    await c.query('begin')
    await c.query("select set_config('app.boutique_id', $1, true)", [boutiqueId])
    const r = await fn(c)
    await c.query('commit')
    return r
  } catch (e) {
    await c.query('rollback').catch(() => {})
    throw e
  } finally {
    c.release()
  }
}

// Lecture des informations publiques (boutiques, domaines) sans boutique déclarée.
export const requete = (sql, params) => pool.query(sql, params)
