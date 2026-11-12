/* Pages de service : la boutique, livraison, retours, contact, questions fréquentes, mentions légales.
   Tarifs, adresse et horaires viennent des réglages de la boutique : rien n'est écrit en double. */
import { $, esc, euros, B, C, PAIEMENT, reveler, PIECES, RAYONS, COLLECTIONS, lienProduit, lienRayon } from './coquille.js'
import { api } from './commun.js'
import { IMAGES, JOURS_RETOUR, tarifs, faq, PROPOSITION } from './textes.js'

const pr = C.presentation
const cle = document.body.dataset.info
const paras = (t) => String(t || '').split(/\n+/).filter(Boolean).map((x) => `<p>${esc(x)}</p>`).join('')
const tete = (titre, chapo) => `<header class="wrap page-tete"><nav class="fil" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><span>${esc(titre)}</span></nav><h1>${esc(titre)}</h1>${chapo ? `<p>${esc(chapo)}</p>` : ''}</header>`
const coordonnees = () => [
  pr.adresse && ['Adresse', `${esc(pr.adresse)}<br><a class="lien" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pr.adresse)}" target="_blank" rel="noopener">Voir le plan</a>`],
  pr.horaires.length && ['Horaires', pr.horaires.map(esc).join('<br>')],
  pr.telephone && ['Téléphone', `<a href="tel:${esc(pr.telephone.replace(/\s/g, ''))}">${esc(pr.telephone)}</a>`],
  pr.email && ['E-mail', `<a href="mailto:${esc(pr.email)}">${esc(pr.email)}</a>`]
].filter(Boolean).map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')

const liste = (l) => `<ul class="propo__liste">${l.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul>`
const exemple = PIECES.find((p) => p.reference === 'ROBE-SEQ') || PIECES[0]

const PAGES = {
  proposition: () => ({
    titre: 'La proposition de refonte',
    html: `<header class="wrap page-tete propo__tete"><p class="surtitre">Proposition de refonte non officielle</p>
        <h1>Une nouvelle boutique en ligne pour ${esc(PROPOSITION.client)}</h1>
        <p>Cette maquette montre ce que pourrait devenir votre site : la même boutique, les mêmes rayons et les mêmes services, avec une présentation digne de vos collections. Elle a été réalisée par ${esc(PROPOSITION.studio)} sans lien officiel avec ${esc(PROPOSITION.client)}.</p>
        <p class="propo__cta"><a class="btn" href="/">Visiter la boutique</a>${exemple ? `<a class="btn btn--ligne" href="${lienProduit(exemple)}">Voir une fiche produit</a>` : ''}</p>
      </header>
      <figure class="wrap bande-photo" data-revele><img src="${IMAGES.lookbook}" alt="" width="1400" height="788"></figure>
      <div class="wrap page-corps propo">
        <section><h2>Ce que vous visitez</h2>
          <p>${B.apercu ? 'Votre boutique, avec un catalogue d’exemple' : `« ${esc(B.nom)} » est une boutique fictive créée pour la démonstration`} : ${PIECES.length} pièces réparties dans ${RAYONS.length} rayons et ${COLLECTIONS.length} sélections, avec leurs photos, prix, tailles, compositions et stocks. ${B.apercu ? 'Les pièces, les photos de produits et les prix sont des exemples : sur votre site, ce sont vos produits, vos photos et vos prix qui s’afficheraient, avec votre stock réel.' : 'Pour votre site, nous reprendrions votre nom, votre logo, vos photos et vos produits.'}</p></section>
        <section><h2>Ce qui est repris de votre boutique</h2>${liste([
          ['Vos rayons', 'Hauts (blouses, chemisiers, gilets, pulls, tops), vestes et manteaux, pantalons et shorts, robes, jupes et combinaisons, accessoires, chaussures.'],
          ['Vos sélections', 'Nouveautés, tenues de fêtes, retour en stock, moins de 25 €, promotions, tous nos produits.'],
          ['Vos services', 'Retrait gratuit en boutique à Amiens, point relais en France et en Belgique, livraison à domicile, 14 jours pour changer d’avis.'],
          ['Vos fiches produits', 'Composition, mesures, taille portée par la mannequin, précommandes avec date d’expédition.'],
          ['Votre relation client', 'Newsletter, questions fréquentes, formulaire de contact, horaires de la boutique.']
        ])}</section>
        <section><h2>Ce que la refonte apporte</h2>${liste([
          ['Une vraie direction artistique', 'Typographies de mode, palette ivoire, beige et champagne, photos homogènes : la boutique en ligne a le niveau de vos collections.'],
          ['Des photos qui font vendre', 'Chaque pièce sur fond uniforme, des photos portées, et des repères sur les images de collection qui mènent directement à la pièce.'],
          ['Le portant', 'Les nouveautés présentées comme en boutique : on passe sur un vêtement, il tourne ; on clique, il s’ouvre.'],
          ['Un achat plus rapide', 'Ajout rapide depuis la liste, panier latéral en trois étapes, frais de livraison clairs avant de commander.'],
          ['Une expérience mobile soignée', 'Menu, recherche, panneaux et barre d’achat pensés pour le pouce, comme une application.'],
          ['Une recherche et des filtres', 'Recherche instantanée, filtres par rayon, taille et disponibilité, tri par prix ou meilleures ventes.'],
          ['Une gestion simple', 'Ajout d’un vêtement à partir d’une seule photo : le fond est retiré automatiquement, le vêtement apparaît sur le portant.']
        ])}</section>
        <section><h2>Ce qui est simulé dans cette maquette</h2>${liste([
          ['Le paiement', 'Aucune carte n’est demandée ni débitée. Sur votre site, le paiement par carte se ferait via Stripe, sur votre compte.'],
          ['Les commandes', 'Elles réservent le stock de démonstration puis sont annulées ou validées sans envoi réel.'],
          ['Les e-mails', 'Aucun e-mail n’est envoyé aux clientes depuis cette maquette.']
        ])}</section>
        <section><h2>Parcourir la maquette</h2><p class="propo__liens">
          <a class="chip" href="${lienRayon('nouveautes')}">Nouveautés</a><a class="chip" href="${lienRayon('vetements')}">Vêtements</a><a class="chip" href="${lienRayon('accessoires')}">Accessoires</a><a class="chip" href="${lienRayon('petits-prix')}">Moins de 25 €</a><a class="chip" href="/livraison/">Livraison</a><a class="chip" href="/faq/">Questions fréquentes</a></p></section>
      </div>`
  }),

  'la-boutique': () => ({
    titre: 'Notre boutique',
    html: `${tete('Notre boutique', B.slogan)}
      <div class="wrap page-split">
        <figure data-revele>${B.presentation_image ? `<img src="${esc(B.presentation_image)}" alt="L’intérieur de la boutique ${esc(B.nom)}" width="1120" height="1400">` : `<img src="${IMAGES.lookbook}" alt="" width="1400" height="788">`}</figure>
        <div class="maison__txt">
          <h2>${esc(pr.titre || B.nom)}</h2>
          <div class="maison__p">${paras(pr.texte)}<p>En boutique, on prend le temps : essayer, comparer deux tailles, demander conseil pour une tenue de fête ou un cadeau. Les commandes passées en ligne peuvent y être retirées gratuitement.</p></div>
          <dl class="maison__infos">${coordonnees()}</dl>
        </div>
      </div>
      <figure class="wrap bande-photo" data-revele><img src="${IMAGES.lookbook}" alt="Deux clientes choisissent un pull devant le portant de la boutique" loading="lazy" width="1400" height="788"></figure>`
  }),

  livraison: () => ({
    titre: 'Livraison et retrait',
    html: `${tete('Livraison et retrait', `Livraison offerte dès ${euros(B.livraison_offerte_centimes)} d’achat. Chaque commande est préparée à la main en boutique.`)}
      <div class="wrap page-corps">
        <section><h2>Les modes de livraison</h2><ul class="tarifs">${tarifs(B).map((t) => `<li><b>${esc(t.nom)}</b><span>${esc(t.prix)}</span><small>${esc(t.detail)}</small></li>`).join('')}</ul></section>
        <section><h2>Les délais</h2><p>Les commandes sont expédiées sous 3 jours ouvrés après le paiement. Comptez ensuite 2 à 3 jours ouvrés à domicile, 3 à 5 jours en point relais.</p>
          <p>Le retrait en boutique est possible dès que vous recevez le message indiquant que votre commande est prête.</p></section>
        <section><h2>Les précommandes</h2><p>Certaines pièces sont proposées en précommande : leur date d’expédition est indiquée sur la fiche et dans le panier. Si votre commande en contient une, tous les articles partent ensemble à cette date, dans un seul colis.</p></section>
        ${B.relais ? '<section><h2>Belgique</h2><p>Nous livrons la Belgique en point relais, au même tarif qu’en France. Choisissez « Belgique » au moment de commander.</p></section>' : ''}
        <section><h2>Paiement</h2><p>${esc(PAIEMENT.note)}</p></section>
      </div>`
  }),

  retours: () => ({
    titre: 'Retours et échanges',
    html: `${tete('Retours et échanges', `Vous avez ${JOURS_RETOUR} jours après réception pour changer d’avis.`)}
      <div class="wrap page-corps">
        <section><h2>Les conditions</h2><p>L’article doit être neuf, non porté, non lavé, avec son étiquette d’origine et dans son emballage. Les bijoux et boucles d’oreilles ne sont ni repris ni échangés, pour des raisons d’hygiène.</p></section>
        <section><h2>Comment retourner un article</h2><ul>
          ${B.retrait ? `<li><b>En boutique, gratuitement</b> : venez avec votre numéro de commande ou l’e-mail de confirmation. ${esc(pr.adresse || '')}</li>` : ''}
          <li><b>Par la poste ou en point relais</b> : écrivez-nous d’abord depuis la page <a href="/contact/">Contact</a> avec votre numéro de commande, nous vous indiquons l’adresse de retour. Les frais de retour restent à votre charge.</li>
        </ul></section>
        <section><h2>Le remboursement</h2><p>Dès réception et vérification du colis, nous vous remboursons sous 48 heures, sur le moyen de paiement utilisé. Vous préférez un échange de taille ? Dites-le nous : nous vous réservons la pièce le temps du retour.</p></section>
        <section><h2>Pendant le transport</h2><p>Le colis retour voyage sous votre responsabilité : gardez la preuve de dépôt jusqu’à ce que nous confirmions sa réception.</p></section>
      </div>`
  }),

  contact: () => ({
    titre: 'Nous contacter',
    html: `${tete('Nous contacter', 'Une question sur une taille, une commande ou un retour ? Écrivez-nous, nous répondons du mardi au samedi.')}
      <div class="wrap page-split">
        <form class="formulaire" data-contact novalidate>
          <label class="ck-f"><span>Nom</span><input name="nom" autocomplete="name"></label>
          <label class="ck-f"><span>E-mail</span><input name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required></label>
          <label class="ck-f"><span>Téléphone <small>(facultatif)</small></span><input name="telephone" type="tel" autocomplete="tel" inputmode="tel"></label>
          <label class="ck-f"><span>Votre message</span><textarea name="message" rows="6" required></textarea></label>
          <button class="btn" type="submit" disabled>Envoyer le message</button>
          <p class="formulaire__etat" data-contact-etat aria-live="polite"></p>
        </form>
        <div class="maison__txt"><h2>La boutique</h2><dl class="maison__infos" style="border-top:0;padding-top:0;margin-top:20px">${coordonnees()}</dl></div>
      </div>`
  }),

  faq: () => ({
    titre: 'Questions fréquentes',
    html: `${tete('Questions fréquentes', 'Tout ce qu’il faut savoir avant de commander. Vous ne trouvez pas votre réponse ? Écrivez-nous.')}
      <div class="wrap page-corps"><div class="faq__liste">${faq(B).map(([q, r], i) => `<details${i ? '' : ' open'}><summary>${esc(q)}</summary><p>${esc(r)}</p></details>`).join('')}</div>
      <p><a class="btn btn--ligne" href="/contact/">Poser une autre question</a></p></div>`
  }),

  'mentions-legales': () => ({
    titre: 'Mentions légales et conditions de vente',
    html: `${tete('Mentions légales et conditions de vente')}
      <div class="wrap page-corps">
        <section><h2>Proposition de refonte</h2><p>Ce site est une maquette de refonte réalisée par ${esc(PROPOSITION.studio)} à l’attention de ${esc(PROPOSITION.client)}, sans lien officiel avec cette boutique. ${B.apercu ? 'Les produits, les prix et les commandes sont des exemples qui servent à montrer le fonctionnement du site.' : `${esc(B.nom)} est une boutique fictive : les produits, les prix et les commandes servent à montrer le fonctionnement du site.`} ${B.paiement === 'stripe' ? '' : 'Aucun paiement réel n’est encaissé et aucune commande n’est expédiée.'}</p></section>
        <section><h2>Éditeur et hébergement</h2><p>Conception et réalisation : Estalia Studio. Hébergement : Render Services, Inc., San Francisco, États-Unis.</p></section>
        <section><h2>Commandes et prix</h2><p>Les prix sont indiqués en euros, toutes taxes comprises. Les frais de livraison sont affichés avant la validation de la commande. Les articles sont réservés pendant 30 minutes pendant le paiement.</p></section>
        <section><h2>Droit de rétractation</h2><p>Conformément au Code de la consommation, vous disposez de ${JOURS_RETOUR} jours à compter de la réception pour retourner un article, selon les conditions de la page <a href="/retours/">Retours et échanges</a>.</p></section>
        <section><h2>Données personnelles</h2><p>Vos coordonnées servent uniquement à traiter votre commande, répondre à vos messages et, si vous l’avez accepté, vous envoyer la newsletter. Elles ne sont jamais cédées. Vous pouvez demander leur suppression à tout moment depuis la page <a href="/contact/">Contact</a>.</p></section>
      </div>`
  })
}

const pg = (PAGES[cle] || PAGES.faq)()
document.title = `${pg.titre}, ${B.nom}`
$('meta[name=description]').content = `${pg.titre} : ${B.nom}, ${B.slogan || ''}`.slice(0, 160)
$('[data-contenu]').innerHTML = pg.html + '<div class="section section--fin"></div>'
reveler()

// Formulaire de contact : message enregistré, lisible dans l'administration
const f = $('[data-contact]')
if (f) {
  const etat = $('[data-contact-etat]'); const b = $('button[type=submit]', f); b.disabled = false
  f.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'))
  f.addEventListener('submit', async (e) => {
    e.preventDefault(); etat.classList.remove('is-err')
    const manque = [['email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()), 'Indiquez une adresse e-mail valide.'], ['message', f.message.value.trim().length >= 5, 'Écrivez votre message.']].find(([, ok]) => !ok)
    if (manque) { etat.classList.add('is-err'); etat.textContent = manque[2]; f[manque[0]].setAttribute('aria-invalid', 'true'); f[manque[0]].focus(); return }
    b.disabled = true; b.textContent = 'Envoi…'
    try {
      await api('/api/contact', { method: 'POST', body: { nom: f.nom.value, email: f.email.value, telephone: f.telephone.value, message: f.message.value } })
      f.reset(); etat.textContent = 'Merci, votre message est bien arrivé. Nous vous répondons par e-mail.'
    } catch (err) { etat.classList.add('is-err'); etat.textContent = err.message } finally { b.disabled = false; b.textContent = 'Envoyer le message' }
  })
}
