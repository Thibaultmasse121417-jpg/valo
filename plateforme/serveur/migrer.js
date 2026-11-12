/* Applique les migrations SQL qui n'ont pas encore été appliquées (connexion propriétaire). */
import pg from 'pg'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { config, RACINE } from './config.js'

const c = new pg.Client({ connectionString: config.baseAdmin, ssl: config.ssl })
await c.connect()
await c.query('create table if not exists _migrations (nom text primary key, appliquee_at timestamptz not null default now())')
const faites = new Set((await c.query('select nom from _migrations')).rows.map((r) => r.nom))
const dossier = resolve(RACINE, 'serveur/migrations')
for (const f of readdirSync(dossier).filter((x) => x.endsWith('.sql')).sort()) {
  if (faites.has(f)) continue
  process.stdout.write(`Migration ${f}… `)
  await c.query('begin')
  try {
    await c.query(readFileSync(resolve(dossier, f), 'utf8'))
    await c.query('insert into _migrations (nom) values ($1)', [f])
    await c.query('commit')
    console.log('ok')
  } catch (e) {
    await c.query('rollback')
    console.error('échec :', e.message)
    process.exit(1)
  }
}
await c.end()
