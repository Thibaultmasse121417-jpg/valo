/* Commandes : prix et stock vérifiés côté serveur, stock réservé à la commande,
   rendu si le paiement n'aboutit pas. */
import { avecBoutique } from './db.js'

export class ErreurClient extends Error {
  constructor (message, statut = 400) { super(message); this.statut = statut }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* Crée la commande et réserve le stock. Renvoie { id, jeton, total_centimes }. */
export async function creerCommande (boutique, corps, paiementMode) {
  const client = corps?.client || {}
  const mode = corps?.livraison_mode === 'retrait' ? 'retrait' : 'livraison'
  const email = String(client.email || '').trim().toLowerCase()
  const nom = String(client.nom || '').trim()
  if (!EMAIL.test(email)) throw new ErreurClient('Adresse e-mail invalide.')
  if (nom.length < 2) throw new ErreurClient('Indiquez votre nom.')
  const adresse = client.adresse || {}
  if (mode === 'livraison' && (!String(adresse.ligne || '').trim() || !/^\d{4,5}$/.test(String(adresse.code_postal || '').trim()) || !String(adresse.ville || '').trim())) {
    throw new ErreurClient('Adresse de livraison incomplète.')
  }
  const lignes = Array.isArray(corps?.lignes) ? corps.lignes : []
  if (!lignes.length || lignes.length > 50) throw new ErreurClient('Panier vide.')
  const parVariante = new Map()
  for (const l of lignes) {
    const q = Math.floor(Number(l.quantite))
    if (!l.variante_id || !(q > 0) || q > 20) throw new ErreurClient('Quantité invalide.')
    parVariante.set(l.variante_id, (parVariante.get(l.variante_id) || 0) + q)
  }

  return avecBoutique(boutique.id, async (c) => {
    const ids = [...parVariante.keys()]
    // Verrouille les variantes demandées : deux clients ne peuvent pas acheter la dernière pièce.
    const { rows } = await c.query(`select v.id, v.stock, v.taille, v.sku, v.produit_id, p.nom, p.prix_centimes, p.visible, co.nom as couleur
      from variantes v join produits p on p.id = v.produit_id join couleurs co on co.id = v.couleur_id
      where v.id = any($1::uuid[]) for update of v`, [ids])
    if (rows.length !== ids.length) throw new ErreurClient('Un article n’existe plus. Rechargez la page.', 409)
    for (const r of rows) {
      if (!r.visible) throw new ErreurClient(`« ${r.nom} » n’est plus en vente.`, 409)
      if (r.stock < parVariante.get(r.id)) throw new ErreurClient(r.stock ? `Plus que ${r.stock} « ${r.nom} » en ${r.taille}.` : `« ${r.nom} » en ${r.taille} est épuisé.`, 409)
    }
    const sousTotal = rows.reduce((s, r) => s + r.prix_centimes * parVariante.get(r.id), 0)
    const livraison = mode === 'retrait' || sousTotal >= boutique.livraison_offerte_centimes ? 0 : boutique.livraison_centimes
    const { rows: [cmd] } = await c.query(`insert into commandes (boutique_id, client, livraison_mode, sous_total_centimes, livraison_centimes, total_centimes, paiement_mode)
      values ($1, $2, $3, $4, $5, $6, $7) returning id, jeton, numero, total_centimes`,
    [boutique.id, { email, nom, telephone: String(client.telephone || '').trim(), adresse: mode === 'livraison' ? adresse : null }, mode, sousTotal, livraison, sousTotal + livraison, paiementMode])
    for (const r of rows) {
      const q = parVariante.get(r.id)
      await c.query(`insert into lignes_commande (boutique_id, commande_id, variante_id, produit_id, nom, couleur, taille, sku, prix_unitaire_centimes, quantite)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [boutique.id, cmd.id, r.id, r.produit_id, r.nom, r.couleur, r.taille, r.sku, r.prix_centimes, q])
      await c.query('update variantes set stock = stock - $2 where id = $1', [r.id, q])
    }
    return { ...cmd, lignes: rows.map((r) => ({ nom: r.nom, couleur: r.couleur, taille: r.taille, prix_centimes: r.prix_centimes, quantite: parVariante.get(r.id) })), livraison_centimes: livraison }
  })
}

/* Paiement confirmé (idempotent). Si la commande avait expiré entre-temps, le stock est repris. */
export async function marquerPayee (boutiqueId, commandeId, ref) {
  return avecBoutique(boutiqueId, async (c) => {
    const { rows: [cmd] } = await c.query('select statut from commandes where id = $1 for update', [commandeId])
    if (!cmd || cmd.statut === 'payee' || !['en_attente_paiement', 'expiree', 'annulee'].includes(cmd.statut)) return false
    if (cmd.statut !== 'en_attente_paiement') {
      await c.query(`update variantes v set stock = greatest(0, v.stock - l.q) from
        (select variante_id, sum(quantite) q from lignes_commande where commande_id = $1 group by variante_id) l where v.id = l.variante_id`, [commandeId])
    }
    await c.query("update commandes set statut = 'payee', payee_at = now(), paiement_ref = coalesce($2, paiement_ref) where id = $1", [commandeId, ref])
    return true
  })
}

/* Paiement abandonné : la commande est annulée et le stock rendu (une seule fois). */
export async function annulerCommande (boutiqueId, commandeId, statut = 'annulee') {
  return avecBoutique(boutiqueId, async (c) => {
    const { rows: [cmd] } = await c.query('select statut from commandes where id = $1 for update', [commandeId])
    if (!cmd || cmd.statut !== 'en_attente_paiement') return false
    await c.query(`update variantes v set stock = v.stock + l.q from
      (select variante_id, sum(quantite) q from lignes_commande where commande_id = $1 and variante_id is not null group by variante_id) l where v.id = l.variante_id`, [commandeId])
    await c.query('update commandes set statut = $2 where id = $1', [commandeId, statut])
    return true
  })
}

export async function lireCommande (c, { id, jeton }) {
  const { rows: [cmd] } = await c.query(`select * from commandes where ${id ? 'id' : 'jeton'} = $1`, [id || jeton])
  if (!cmd) return null
  const { rows: lignes } = await c.query('select nom, couleur, taille, sku, prix_unitaire_centimes, quantite, variante_id from lignes_commande where commande_id = $1 order by nom', [cmd.id])
  return { ...cmd, lignes }
}
