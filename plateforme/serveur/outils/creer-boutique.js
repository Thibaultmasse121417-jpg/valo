/* Crée une boutique, son domaine et son compte administrateur.

   npm run boutique:creer -- --slug alba --nom "Alba Paris" --domaine alba.fr \
     --email gerant@alba.fr --mdp "mot de passe"

   Plusieurs --domaine sont possibles (ex. alba.fr et www.alba.fr). */
import pg from 'pg'
import { parseArgs } from 'node:util'
import { config } from '../config.js'
import { hacher } from '../auth.js'

const { values: v } = parseArgs({
  options: {
    slug: { type: 'string' }, nom: { type: 'string' }, email: { type: 'string' }, mdp: { type: 'string' },
    domaine: { type: 'string', multiple: true, default: [] }, slogan: { type: 'string', default: '' }
  }
})
if (!v.slug || !v.nom || !v.email || !v.mdp) {
  console.error('Usage : --slug alba --nom "Alba Paris" --email gerant@alba.fr --mdp "…" [--domaine alba.fr]')
  process.exit(1)
}
if (v.mdp.length < 10) { console.error('Mot de passe trop court (10 caractères minimum).'); process.exit(1) }

const c = new pg.Client({ connectionString: config.baseAdmin })
await c.connect()
try {
  await c.query('begin')
  const { rows: [b] } = await c.query('insert into boutiques (slug, nom, slogan) values ($1, $2, $3) returning id', [v.slug, v.nom, v.slogan])
  for (const d of v.domaine) await c.query('insert into domaines (domaine, boutique_id) values ($1, $2)', [d.toLowerCase(), b.id])
  await c.query('insert into utilisateurs (boutique_id, email, mot_de_passe) values ($1, $2, $3)', [b.id, v.email.toLowerCase(), await hacher(v.mdp)])
  await c.query('commit')
  console.log(`Boutique « ${v.nom} » créée (${b.id}).`)
  console.log(`Administration : https://${v.domaine[0] || `${v.slug}.localhost:${config.port}`}/admin/`)
} catch (e) {
  await c.query('rollback')
  console.error('Échec :', e.message)
  process.exitCode = 1
} finally {
  await c.end()
}
