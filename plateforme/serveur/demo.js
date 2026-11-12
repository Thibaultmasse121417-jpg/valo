/* Au premier démarrage d'un hébergement de démonstration (DEMO_AMBRE=1) :
   crée la boutique Ambre & Strass puis la remplit par l'API d'administration,
   exactement comme une commerçante (tests/creer-ambre.js). Ne fait rien si elle existe déjà. */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { requete } from './db.js'
import { config, RACINE } from './config.js'

const lancer = (args, env = {}) => new Promise((ok, ko) => {
  const p = spawn(process.execPath, args, { cwd: RACINE, env: { ...process.env, ...env }, stdio: 'inherit' })
  p.on('exit', (code) => (code === 0 ? ok() : ko(new Error(`${args[0]} : code ${code}`))))
})

export async function preparerDemo () {
  if (process.env.DEMO_AMBRE !== '1') return
  const { rowCount } = await requete("select 1 from boutiques where slug = 'ambre'")
  if (rowCount) return
  const mdp = process.env.DEMO_MDP || 'motdepasse-ambre'
  const domaines = ['ambre.localhost', process.env.RENDER_EXTERNAL_HOSTNAME].filter(Boolean).flatMap((d) => ['--domaine', d])
  console.log('[démo] création de la boutique Ambre & Strass…')
  await lancer([resolve(RACINE, 'serveur/outils/creer-boutique.js'), '--slug', 'ambre', '--nom', 'Ambre & Strass', '--email', 'gerante@ambre-strass.fr', '--mdp', mdp, ...domaines])
  await lancer([resolve(RACINE, 'tests/creer-ambre.js')], { HOTE: 'ambre.localhost', PORT: String(config.port), DEMO_MDP: mdp })
  console.log('[démo] boutique prête.')
}
