/* Aperçu privé de la proposition de refonte pour Comyx Prestige.
   Le site public reste la démonstration neutre (Ambre & Strass). Avec le lien secret
   (…/?apercu=<APERCU_COMYX>), la même boutique s'affiche sous l'identité de Comyx Prestige,
   toujours marquée « proposition non officielle » et jamais indexée par les moteurs de recherche.
   Les prix, le catalogue et les commandes ne changent pas : seule la présentation change. */
import { timingSafeEqual } from 'node:crypto'

const SECRET = process.env.APERCU_COMYX || ''
const COOKIE = 'apercu_comyx'

const egal = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y) }
const cookieDe = (c) => (c.req.header('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1]

/* Intergiciel : ?apercu=<secret> pose un cookie puis renvoie vers l'adresse propre ; ?apercu=fin le retire. */
export async function apercu (c, next) {
  const q = c.req.query('apercu')
  if (q === 'fin') {
    c.header('set-cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`)
    return c.redirect(c.req.path)
  }
  if (SECRET && q && egal(q, SECRET)) {
    c.header('set-cookie', `${COOKIE}=${encodeURIComponent(SECRET)}; Path=/; Max-Age=${60 * 60 * 24 * 60}; HttpOnly; SameSite=Lax${c.req.header('x-forwarded-proto') === 'https' ? '; Secure' : ''}`)
    return c.redirect(c.req.path)
  }
  const v = cookieDe(c)
  c.set('apercu', !!(SECRET && v && egal(decodeURIComponent(v), SECRET)))
  return next()
}

/* Identité de Comyx Prestige, modernisée (voir docs/comyx-prestige-charte.md). */
export const COMYX = {
  nom: 'Comyx Prestige',
  slogan: 'Concept store à Amiens',
  theme: { fond: '#f7f3ed', surface: '#fffcf7', texte: '#1c1612', attenue: '#6b5f55', accent: '#a9845a', bandeau: '#241b16', police_titres: 'bodoni', police_texte: 'jost', titres_italiques: false },
  contenus: {
    annonces: ['La boutique vous accueille du mardi au samedi, de 10 h à 19 h, à Amiens', 'Livraison offerte dès 60 €', 'Retrait gratuit en boutique, 7 rue Henri Barbusse'],
    banniere: { surtitre: 'Concept store, Amiens', titre: 'Des pièces qui font la différence.', texte: 'Chaque semaine, de nouvelles pièces arrivent rue Henri Barbusse et en ligne : tenues de fêtes, mailles, blouses et accessoires.', bouton: 'Découvrir la collection' },
    presentation: {
      titre: 'Notre boutique amiénoise',
      texte: 'Comyx Prestige vous accueille au 7 rue Henri Barbusse, à Amiens. Nos collections sont choisies une à une, et l’équipe prend le temps de vous conseiller.\nCommandez en ligne et retirez gratuitement en boutique, ou faites-vous livrer en point relais ou à domicile.',
      adresse: '7 rue Henri Barbusse, 80000 Amiens',
      horaires: ['Du mardi au samedi : 10 h – 19 h', 'Dimanche et lundi : fermé']
    },
    pied: 'Concept store mode femme à Amiens, en boutique et en ligne.',
    newsletter: { titre: 'Ne manquez rien', texte: 'Les nouveautés, les précommandes et les tenues de fêtes, en avant-première.' }
  },
  retrait: '7 rue Henri Barbusse, 80000 Amiens, du mardi au samedi de 10 h à 19 h'
}

/* Applique l'identité de Comyx Prestige à la boutique publique (présentation seulement). */
export function habillerComyx (pub) {
  const c = pub.contenus
  return {
    ...pub,
    nom: COMYX.nom, slogan: COMYX.slogan, logo: null, apercu: true,
    theme: { ...pub.theme, ...COMYX.theme },
    contenus: {
      ...c,
      annonces: COMYX.contenus.annonces,
      banniere: { ...c.banniere, ...COMYX.contenus.banniere },
      presentation: { ...c.presentation, ...COMYX.contenus.presentation },
      pied: COMYX.contenus.pied,
      newsletter: COMYX.contenus.newsletter
    },
    retrait: pub.retrait ? { adresse: COMYX.retrait } : null
  }
}
