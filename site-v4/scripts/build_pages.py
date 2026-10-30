"""Génère les pages secteur et la page tarifs (python3 scripts/build_pages.py, depuis site-v4/).
Toutes les vidéos sont celles déjà présentes : aucun nouveau montage.
Montants indicatifs, À VALIDER."""
import html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECTORS = [
    {
        'slug': 'commerces', 'nav': 'Commerces', 'select': 'Commerce',
        'title': 'Commerces',
        'h1': 'Donnez envie<br /><em>de pousser la porte.</em>',
        'video': 'media/videos/metier-commerce-vitrine-et-produits', 'placeholder': True,
        'who_title': 'Pour les adresses<br /><em>qu’on recommande.</em>',
        'who': ['Boulangeries', 'Cavistes', 'Fleuristes', 'Restaurants', 'Instituts', 'Créateurs', 'Épiceries fines', 'Concept stores'],
        'deliver': [
            ('Le film de votre adresse', '30 à 60 secondes pour votre site et l’écran de votre vitrine.'),
            ('Trois formats verticaux', 'Prêts pour Instagram, TikTok et votre fiche Google.'),
            ('Dix photos produits', 'Retouchées, au format web et réseaux.'),
            ('Le portrait de l’équipe', 'Les visages derrière le comptoir, sous-titrés.'),
        ],
        'film': ('Une adresse <em>parisienne</em>', 'Commerce · exemple à tourner', 'media/videos/metier-commerce-vitrine-et-produits'),
        'prices': [
            ('Essentiel', 'Film de 30 secondes, deux formats', '490 €'),
            ('Vitrine', 'Film de 60 secondes, trois formats verticaux, dix photos', '890 €'),
            ('Signature', 'Film, formats réseaux et site vitrine sur mesure', '1 900 €'),
        ],
        'options': 'Options : pack des temps forts (Saint-Valentin, fête des mères, Noël) · mise à jour de la fiche Google · sous-titres en anglais.',
        'faq': [
            ('Peut-on filmer pendant l’ouverture&nbsp;?', 'Oui, ou juste avant. Vos clients ne sont filmés qu’avec leur accord.'),
            ('Combien de temps dure le tournage&nbsp;?', 'Une demi-journée suffit pour la plupart des boutiques.'),
            ('Pouvons-nous utiliser le film en publicité&nbsp;?', 'Oui, sur tous vos supports, sans limite de durée.'),
        ],
    },
    {
        'slug': 'immobilier', 'nav': 'Immobilier', 'select': 'Agence immobilière',
        'title': 'Agences immobilières',
        'h1': 'Vendez la lumière<br /><em>avant les mètres carrés.</em>',
        'video': 'media/videos/metier-agence-immobiliere-visite-villa', 'placeholder': False,
        'who_title': 'Pour les mandats<br /><em>qui méritent mieux qu’une photo.</em>',
        'who': ['Appartements', 'Maisons', 'Villas', 'Biens de prestige', 'Domaines', 'Programmes neufs', 'Locaux commerciaux'],
        'deliver': [
            ('La visite filmée', 'Plan-séquence de 60 à 90 secondes, pièce par pièce.'),
            ('La version verticale', '45 secondes pour Instagram, TikTok et vos stories.'),
            ('Les vues de drone', 'Le quartier, le jardin, la vue, quand le lieu le permet.'),
            ('Quinze photos', 'Lumineuses et redressées, prêtes pour les portails.'),
            ('Les informations à l’écran', 'Surface, pièces, extérieurs, sous-titrés sobrement.'),
        ],
        'film': ('Villa triplex, <em>San Peïre</em>', 'Immobilier · 0:50', 'media/films/villa-san-peire'),
        'prices': [
            ('Appartement', 'Visite filmée, version verticale, quinze photos', '390 €'),
            ('Maison, villa', 'Visite filmée, drone, version verticale, quinze photos', '690 €'),
            ('Prestige', 'Film signature, drone, portrait de l’agent', '1 200 €'),
            ('Abonnement agence', 'Quatre biens par mois, priorité de tournage', '1 290 €<small> / mois</small>'),
        ],
        'options': 'Options : visite 360° · portrait vidéo du vendeur ou de l’agent · film de présentation de l’agence.',
        'faq': [
            ('Sous quel délai le film est-il en ligne&nbsp;?', 'Première version sous 5 jours ouvrés, pour ne pas freiner la mise en vente.'),
            ('Le drone est-il toujours possible&nbsp;?', 'Selon la réglementation de la zone. Sinon, nous filmons au sol, en hauteur.'),
            ('Le film appartient-il à l’agence&nbsp;?', 'Oui, avec un usage illimité sur vos portails, votre site et vos réseaux.'),
        ],
    },
    {
        'slug': 'hotels-campings', 'nav': 'Hôtels & campings', 'select': 'Hôtel',
        'title': 'Campings & hôtels',
        'h1': 'Faites réserver<br /><em>avant le premier café.</em>',
        'video': 'media/videos/metier-camping-hotel-piscine-terrasse', 'placeholder': True,
        'who_title': 'Pour les lieux<br /><em>où l’on revient chaque été.</em>',
        'who': ['Hôtels', 'Maisons d’hôtes', 'Campings', 'Gîtes', 'Domaines', 'Restaurants d’hôtel', 'Résidences'],
        'deliver': [
            ('Le film du séjour', '60 à 90 secondes : l’arrivée, la journée, la soirée.'),
            ('Quatre mini-clips', 'Chambres, piscine, restaurant, activités.'),
            ('Les formats réservation', 'Versions courtes pour Booking, Google et votre site.'),
            ('Les formats verticaux', 'Pour Instagram et TikTok, toute la saison.'),
            ('Les photos', 'Une série complète, du lever au coucher du soleil.'),
        ],
        'film': ('La vallée <em>au matin</em>', 'Camping · exemple à tourner', 'media/films/film-camping-vallee-au-matin'),
        'prices': [
            ('Saison', 'Une journée de tournage, film du séjour, quatre mini-clips', '1 490 €'),
            ('Domaine', 'Deux jours, drone, film long et huit mini-clips', '2 900 €'),
            ('Annuel', 'Quatre tournages dans l’année, contenus réguliers', '290 €<small> / mois</small>'),
        ],
        'options': 'Options : site de réservation directe · versions en anglais, allemand, néerlandais · visite 360°.',
        'faq': [
            ('Quand faut-il tourner&nbsp;?', 'Idéalement en mai ou juin, quand le lieu est prêt et la lumière belle.'),
            ('Faut-il des figurants&nbsp;?', 'Vos clients volontaires suffisent souvent. Nous pouvons aussi venir avec des modèles.'),
            ('Nos clients sont-ils dérangés&nbsp;?', 'Non. Nous tournons tôt, tard, et dans les espaces que vous choisissez.'),
        ],
    },
    {
        'slug': 'notaires', 'nav': 'Notaires', 'select': 'Étude notariale',
        'title': 'Notaires',
        'h1': 'Inspirer confiance,<br /><em>sobrement.</em>',
        'video': 'media/videos/metier-notaire-facade-de-l-etude', 'placeholder': True,
        'who_title': 'Pour les études<br /><em>qui veulent être comprises.</em>',
        'who': ['Études', 'Offices en création', 'Associés', 'Négociation immobilière', 'Droit de la famille', 'Droit des entreprises'],
        'deliver': [
            ('Le film de l’étude', '60 à 90 secondes : le lieu, l’équipe, votre façon de travailler.'),
            ('Les portraits', 'Chaque notaire et ses collaborateurs, en quelques phrases.'),
            ('Questions de clients', 'Une série de vidéos courtes : succession, achat, donation.'),
            ('Les biens à la vente', 'Visites filmées pour votre service de négociation.'),
            ('Le site institutionnel', 'Clair, rapide, conforme à votre déontologie.'),
        ],
        'film': ('L’étude, <em>au crépuscule</em>', 'Notaire · exemple à tourner', 'media/videos/metier-notaire-facade-de-l-etude'),
        'prices': [
            ('Présentation', 'Film de l’étude et portraits des associés', '1 200 €'),
            ('Questions de clients', 'Six vidéos courtes de questions-réponses', '1 800 €'),
            ('Étude complète', 'Film, portraits, questions de clients et site', '3 400 €'),
        ],
        'options': 'Nous préparons chaque message avec vous, dans le respect des règles de communication de la profession.',
        'faq': [
            ('La communication d’une étude est-elle encadrée&nbsp;?', 'Oui. Nous restons informatifs et sobres, et vous validez chaque mot.'),
            ('Faut-il être à l’aise devant une caméra&nbsp;?', 'Non. Nous vous guidons, et le montage fait le reste.'),
            ('Combien de temps faut-il nous consacrer&nbsp;?', 'Une demi-journée de tournage, et deux relectures.'),
        ],
    },
]

STEPS = [
    ('Un appel de vingt minutes', 'Votre lieu, vos clients, vos objectifs. Devis sous 48 h.'),
    ('Repérage et script', 'Les plans, la lumière, l’heure du tournage.'),
    ('Le tournage', 'Une demi-journée à deux jours, sans fermer.'),
    ('Montage et étalonnage', 'Première version sous 7 à 10 jours ouvrés.'),
    ('Livraison', 'Tous les formats, révisions incluses, films à vous.'),
]

PROMISE = ['Devis sous 48 h', 'Tournage sans fermer', 'Films à vous, sans limite de durée', 'Révisions incluses']

esc = html.escape

def head(title, desc):
    return f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0a0c11" />
  <meta name="color-scheme" content="dark" />
  <title>{title}</title>
  <meta name="description" content="{esc(desc)}" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230a0c11'/%3E%3Ctext x='32' y='45' text-anchor='middle' font-family='Georgia,serif' font-size='36' fill='%23f3eee6'%3EE%3C/text%3E%3C/svg%3E" />
  <script type="module" src="/src/page.js"></script>
</head>'''

def header(current=None):
    links = ''.join(f'<a href="{s["slug"]}.html"{" aria-current=\"page\"" if s["slug"] == current else ""}>{esc(s["nav"])}</a>' for s in SECTORS)
    return f'''
  <a class="skip" href="#contenu">Aller au contenu</a>
  <header class="nav at-hero" data-nav>
    <a class="nav__brand" href="index.html" aria-label="Estalia Studio, accueil">Estalia</a>
    <nav class="nav__links" aria-label="Navigation principale">{links}<a href="tarifs.html"{' aria-current="page"' if current == 'tarifs' else ''}>Tarifs</a></nav>
    <a class="nav__cta" href="#devis">Devis</a>
    <button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </header>
  <div class="menu" id="menu" hidden>
    <nav aria-label="Menu"><a href="index.html">Accueil</a>{links}<a href="tarifs.html">Tarifs</a><a href="#devis">Devis</a></nav>
    <p class="menu__mail">contact@estalia-studio.com</p>
  </div>'''

def contact(select=''):
    opts = ''.join(f'<option{" selected" if o == select else ""}>{o}</option>' for o in ['Commerce', 'Agence immobilière', 'Camping', 'Hôtel', 'Étude notariale', 'Autre'])
    return f'''
    <!-- À REMPLACER : media/videos/ciel-nuages-boucle.mp4 -->
    <section class="contact" id="devis" aria-labelledby="devis-title">
      <div class="contact__sky" aria-hidden="true"><video muted loop playsinline preload="none" poster="media/videos/ciel-nuages-boucle.jpg" data-src="media/videos/ciel-nuages-boucle.mp4"></video></div>
      <div class="contact__inner">
        <h2 id="devis-title" class="contact__title">Parlons de <em>votre&nbsp;lieu.</em></h2>
        <form class="glass form" novalidate>
          <div class="form__row">
            <div class="field"><label for="f-nom">Nom</label><input id="f-nom" name="nom" type="text" autocomplete="name" required /><p class="field__err" id="f-nom-err"></p></div>
            <div class="field"><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" autocomplete="email" autocapitalize="none" spellcheck="false" required /><p class="field__err" id="f-email-err"></p></div>
          </div>
          <div class="form__row">
            <div class="field"><label for="f-metier">Activité</label><select id="f-metier" name="activite" required><option value="">Choisir…</option>{opts}</select><p class="field__err" id="f-metier-err"></p></div>
            <div class="field"><label for="f-formule">Formule</label><input id="f-formule" name="formule" type="text" placeholder="À définir ensemble" /></div>
          </div>
          <div class="field"><label for="f-msg">Votre projet <span class="opt">(facultatif)</span></label><textarea id="f-msg" name="message" rows="3" enterkeyhint="send"></textarea></div>
          <label class="consent"><input type="checkbox" name="consentement" required /><span>J’accepte qu’Estalia Studio utilise ces informations pour me répondre.</span></label>
          <p class="field__err" id="f-consent-err"></p>
          <button class="btn" type="submit">Envoyer</button>
          <p class="form__status" role="status" aria-live="polite"></p>
        </form>
        <p class="contact__mail">Réponse sous 48 h · <span>contact@estalia-studio.com</span></p>
      </div>
    </section>
  </main>'''

def footer(current=None):
    links = ''.join(f'<a href="{s["slug"]}.html">{esc(s["title"])}</a>' for s in SECTORS if s['slug'] != current)
    return f'''
  <footer class="footer">
    <nav class="sector-links" aria-label="Autres secteurs">{links}<a href="tarifs.html">Tous les tarifs</a></nav>
    <p class="footer__word" aria-hidden="true">Estalia</p>
    <div class="footer__base">
      <p>© 2026 Estalia Studio · Films promo &amp; sites web</p>
      <p><a href="#">Mentions légales</a> · <a href="#">Confidentialité</a></p>
    </div>
  </footer>
  <a class="pill" href="#devis">Demander un devis</a>
  <dialog class="player" aria-label="Lecture du film">
    <button class="player__close" type="button" aria-label="Fermer le film">Fermer</button>
    <video controls playsinline></video>
  </dialog>
</body>
</html>
'''

def steps():
    items = ''.join(f'<li><span class="steps__n">{i + 1:02d}</span><b>{t}</b><span>{d}</span></li>' for i, (t, d) in enumerate(STEPS))
    return f'''
    <section class="calm calm--paper method" aria-labelledby="method-title">
      <h2 id="method-title" class="label">Comment nous travaillons</h2>
      <ol class="steps">{items}</ol>
      <ul class="promise">{''.join(f'<li>{p}</li>' for p in PROMISE)}</ul>
    </section>'''

def price_rows(rows, plan_prefix=''):
    out = ''
    for i, (n, w, p) in enumerate(rows):
        feat = ' class="is-featured"' if i == 1 else ''
        out += f'''
        <li{feat}><span class="pricing__name">{n}</span><span class="pricing__what">{w}</span><span class="pricing__price">{p}</span><a class="pricing__go" href="#devis" data-plan="{esc(plan_prefix + n)}" aria-label="Demander un devis {esc(n)}"></a></li>'''
    return out

def sector_page(s):
    film_t, film_m, film_src = s['film']
    is_real = not s['placeholder']
    note = '' if is_real else '<!-- À TOURNER : remplacer par un vrai film de ce secteur -->'
    full = film_src + '.mp4'
    loop = 'media/films/villa-san-peire-extrait' if is_real else film_src
    page = head(f'{esc(s["title"])} — Estalia Studio', f'Films promo et sites web pour {s["title"].lower()}.') + f'''
<body data-sector="{s['select']}">''' + header(s['slug']) + f'''
  <main id="contenu">
    <section class="phero" aria-labelledby="page-title">
      <video class="phero__video" muted loop playsinline preload="metadata" poster="{s['video']}.jpg" data-src="{s['video']}.mp4" aria-hidden="true"></video>
      <div class="phero__inner">
        <p class="label">{esc(s['title'])}</p>
        <h1 id="page-title" class="phero__title" data-lines>{s['h1']}</h1>
        <div class="phero__cta"><a class="btn btn--pill" href="#devis">Demander un devis</a><a class="phero__link" href="#tarifs">Voir les tarifs</a></div>
      </div>
      {'<span class="placeholder-tag">Vidéo temporaire</span>' if s['placeholder'] else ''}
    </section>

    <section class="calm calm--paper who" aria-labelledby="who-title">
      <h2 id="who-title" class="calm__title">{s['who_title']}</h2>
      <ul class="chips">{''.join(f'<li>{w}</li>' for w in s['who'])}</ul>
    </section>

    <section class="calm calm--night offers" aria-labelledby="deliver-title">
      <h2 id="deliver-title" class="label">Ce que vous recevez</h2>
      <ul class="offers__list">{''.join(f'<li><span class="offers__name">{n}</span><span class="offers__line">{d}</span></li>' for n, d in s['deliver'])}</ul>
    </section>

    {note}
    <section class="feature" aria-labelledby="feature-title">
      <figure class="feature__frame" data-clip><video muted loop playsinline preload="none" poster="{film_src if not is_real else 'media/films/villa-san-peire-extrait'}.jpg" data-src="{loop}.mp4" aria-hidden="true"></video></figure>
      <div class="feature__meta">
        <p class="label">{film_m}</p>
        <h2 id="feature-title" class="films__title">{film_t}</h2>
        <button class="play" type="button" data-film="{full}"><span class="play__icon" aria-hidden="true"></span>Voir le film</button>
      </div>
    </section>
''' + steps() + f'''

    <!-- À VALIDER : montants indicatifs -->
    <section class="calm calm--night pricing" id="tarifs" aria-labelledby="tarifs-title">
      <h2 id="tarifs-title" class="label">Tarifs de départ, hors taxes</h2>
      <ol class="pricing__list">{price_rows(s['prices'])}
      </ol>
      <p class="pricing__note">{s['options']}</p>
    </section>

    <section class="calm calm--paper faq" aria-labelledby="faq-title">
      <h2 id="faq-title" class="label">Questions</h2>
      <div class="faq__list">{''.join(f'<details><summary>{q}</summary><div class="faq__a"><div><p>{a}</p></div></div></details>' for q, a in s['faq'])}</div>
    </section>
''' + contact(s['select']) + footer(s['slug'])
    open(os.path.join(ROOT, s['slug'] + '.html'), 'w').write(page)

def tarifs_page():
    groups = ''
    for s in SECTORS:
        groups += f'''
      <div class="tgroup">
        <h2 class="tgroup__title"><a href="{s['slug']}.html">{esc(s['title'])}</a></h2>
        <ol class="pricing__list">{price_rows(s['prices'], s['title'] + ' · ')}
        </ol>
      </div>'''
    page = head('Tarifs — Estalia Studio', 'Tarifs de départ des films promo et sites web Estalia Studio.') + '''
<body>''' + header('tarifs') + f'''
  <main id="contenu">
    <section class="calm calm--night tarifs-hero" aria-labelledby="page-title">
      <p class="label">Tarifs de départ, hors taxes</p>
      <h1 id="page-title" class="calm__title" data-lines>Des prix clairs.<br /><em>Un devis précis sous 48 h.</em></h1>
    </section>
    <!-- À VALIDER : montants indicatifs -->
    <section class="calm calm--night pricing tarifs" aria-label="Tarifs par secteur">{groups}
      <div class="tgroup">
        <h2 class="tgroup__title">Sites web</h2>
        <ol class="pricing__list">{price_rows([('Vitrine', 'Cinq pages sur mesure, vos films en plein écran, référencement local', '1 400 €'), ('Réservation', 'Site avec réservation ou prise de rendez-vous en ligne', '2 400 €'), ('Entretien', 'Hébergement, mises à jour, nouveaux films intégrés', '49 €<small> / mois</small>')], 'Site · ')}
        </ol>
      </div>
      <p class="pricing__note">Déplacements en France indiqués dans le devis. Musiques sous licence commerciale incluses. Films à vous, sans limite de durée.</p>
    </section>
''' + steps() + contact() + footer('tarifs')
    open(os.path.join(ROOT, 'tarifs.html'), 'w').write(page)

if __name__ == '__main__':
    for s in SECTORS:
        sector_page(s)
    tarifs_page()
    print('ok :', ', '.join(s['slug'] for s in SECTORS), '+ tarifs')
