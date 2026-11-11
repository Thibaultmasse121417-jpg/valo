#!/usr/bin/env python3
"""Shared header / footer of the public pages (single source), and generation of the sub-pages.
Usage: python3 tools/pages.py  — rewrites the header/footer of index.html and regenerates the other pages."""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
ORDER = "https://www.leslibraires.fr/presentation/librairie-martelle/"
MAPS = "https://www.google.com/maps/dir/?api=1&amp;destination=Librairie%20Martelle%2C%203%20rue%20des%20Vergeaux%2C%2080000%20Amiens"
I_SEARCH = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg>'

def header(home=False):
    p = "" if home else "index.html"
    ds = lambda i: f' data-scroll="{i}"' if home else ""
    burger = '<button class="burger" data-sheet="menu" aria-label="Ouvrir le menu"><i></i><i></i></button>' if home else '<button class="burger" data-menu aria-controls="mnav" aria-expanded="false" aria-label="Ouvrir le menu"><i></i><i></i></button>'
    return f'''<a class="skip" href="#main">Aller au contenu</a>
<header class="top{' ready' if not home else ''}" id="top">
  <a class="brand" href="{p or '#accueil'}"{ds('accueil')} aria-label="Librairie Martelle, accueil">
    <span class="wm">Librairie <i>Martelle</i></span><i class="ln"></i><span class="lbl city">Amiens · 1957</span>
  </a>
  <nav class="nav" aria-label="Navigation principale">
    <a class="lbl" href="{p or '#accueil'}"{ds('accueil')}>Accueil</a>
    <a class="lbl" href="catalogue.html">Catalogue</a>
    <a class="lbl" href="{p}#coups-de-coeur"{ds('coups-de-coeur')}>Coups de cœur</a>
    <a class="lbl" href="{p}#librairie"{ds('librairie')}>La librairie</a>
    <a class="lbl" href="evenements.html">Événements</a>
    <a class="lbl" href="{p}#venir"{ds('venir')}>Contact</a>
  </nav>
  <div class="tools">
    <form class="search" action="catalogue.html" method="get" role="search">
      <label class="sr" for="q-top">Rechercher un livre : titre, auteur ou ISBN</label>{I_SEARCH}
      <input id="q-top" name="q" type="search" placeholder="Titre, auteur, ISBN…" autocomplete="off" enterkeyhint="search">
      <div class="sugg" role="listbox" aria-label="Suggestions" hidden></div>
    </form>
    <button class="icon-btn search-toggle" data-search-toggle aria-label="Rechercher un livre">{I_SEARCH}</button>
    <a class="btn fill lbl order" data-order href="{ORDER}" target="_blank" rel="noopener">Commander</a>
    {burger}
  </div>
</header>'''

def footer(home=False):
    p = "" if home else "index.html"
    return f'''<footer class="foot">
  <div class="foot-grid">
    <div><span class="lbl">Adresse</span>3 rue des Vergeaux<br>80000 Amiens<br><a class="ulink" href="{MAPS}" target="_blank" rel="noopener">Itinéraire</a></div>
    <div><span class="lbl">Contact</span><a class="ulink" href="tel:+33322715454">03 22 71 54 54</a><br><a class="ulink" href="mailto:commandes@librairiemartelle.com">commandes@librairiemartelle.com</a></div>
    <div><span class="lbl">Horaires</span>Du lundi au samedi<br>9h30 – 19h<br>Dimanche : fermé</div>
    <div><span class="lbl">Explorer</span><a href="catalogue.html">Catalogue</a><br><a href="evenements.html">Événements</a><br><a href="{p}#histoire">Histoire de la librairie</a><br><a data-order href="{ORDER}" target="_blank" rel="noopener">Commander en ligne</a></div>
  </div>
  <span class="giant" aria-hidden="true">Martelle</span>
  <p class="sources">Sources : fiche de la librairie sur <a href="https://www.leslibraires.fr/presentation/librairie-martelle/" target="_blank" rel="noopener">leslibraires.fr</a> (consultée le 11/11/2026) ; <a href="https://www.livreshebdo.fr/article/lionel-martelle-disparait" target="_blank" rel="noopener">Livres Hebdo, 3 mars 2015</a> ; <a href="https://www.lagazettefrance.fr/article/martelle-independante-depuis-toujours" target="_blank" rel="noopener">La Gazette, 4 juin 2017</a> ; <a href="https://alexandraoury.com/la-librairie-martelle-d-amiens-a-60-ans" target="_blank" rel="noopener">La vie des livres etc., 6 avril 2017</a>. Logo typographique, palette et illustrations des rayons : propositions de design, pas un logo officiel.</p>
  <div class="foot-b lbl"><span>© Librairie Martelle</span><span><a href="mentions-legales.html">Mentions légales</a> · <a href="confidentialite.html">Confidentialité</a></span><span>Concept proposé par Estalia — démonstration non officielle</span></div>
</footer>
<nav class="mbar" id="mbar" aria-label="Actions rapides">
  <a href="catalogue.html">{I_SEARCH}Rechercher</a>
  <a href="{p}#venir"{' data-scroll="venir"' if home else ''}><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 15s5-4.6 5-8.5a5 5 0 00-10 0C3 10.4 8 15 8 15z"/><circle cx="8" cy="6.5" r="1.8"/></svg>Nous trouver</a>
  <a class="fill" data-order href="{ORDER}" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 3.2C6.2 2 3.6 1.8 1.5 2.2v10.4c2.1-.4 4.7-.2 6.5 1 1.8-1.2 4.4-1.4 6.5-1V2.2C12.4 1.8 9.8 2 8 3.2zM8 3.2v10.4"/></svg>Commander</a>
</nav>'''

MNAV = '''<nav class="mnav" id="mnav" hidden aria-label="Menu"><div class="mnav-in">
  <a href="index.html">Accueil</a><a href="catalogue.html">Catalogue</a><a href="index.html#coups-de-coeur">Coups de cœur</a>
  <a href="index.html#librairie">La librairie</a><a href="evenements.html">Événements</a><a href="index.html#venir">Contact</a></div></nav>'''

HEAD = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex,nofollow"><!-- démonstration : à retirer à la mise en production (docs/MISE-EN-PRODUCTION.md) -->
<meta name="theme-color" content="#ECE6DA">
<meta property="og:type" content="website"><meta property="og:site_name" content="Librairie Martelle"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<link rel="preload" href="assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body class="page {cls}">
'''

def page(name, title, desc, cls, main, script):
    html = HEAD.format(title=title, desc=desc, cls=cls) + header() + "\n" + MNAV + '\n<div class="annc" id="annc" role="status" hidden></div>\n<main id="main" tabindex="-1">\n' + main + "\n</main>\n" + footer() + f'\n<div class="grain" aria-hidden="true"></div>\n<script src="config.js"></script>\n<script type="module" src="assets/js/{script}"></script>\n</body>\n</html>\n'
    (ROOT / name).write_text(html, encoding="utf-8")

CATALOGUE = '''<section class="pg-head">
  <div class="kick lbl">Catalogue</div>
  <h1 class="h1">Trouver <em>un livre</em></h1>
  <p class="lead">Recherchez par titre, auteur ou ISBN. Un livre absent ? Les libraires le commandent pour vous.</p>
  <form class="cat-search" id="catForm" role="search"><label class="sr" for="cq">Rechercher dans le catalogue</label>
    <input id="cq" name="q" type="search" placeholder="Titre, auteur, éditeur ou ISBN" autocomplete="off" enterkeyhint="search"><button class="btn fill lbl">Rechercher</button></form>
</section>
<div class="demo-ribbon" id="demoRibbon" hidden>Catalogue de démonstration : ces livres ne reflètent pas le stock réel de la librairie.</div>
<section class="cat" aria-label="Résultats">
  <aside class="cat-f" aria-label="Filtres">
    <fieldset><legend class="lbl">Rayons</legend><div class="chips" id="fCat"></div></fieldset>
    <fieldset><legend class="lbl">Sélections</legend><div class="chips" id="fSel">
      <button type="button" data-sel="" aria-pressed="true">Tout</button><button type="button" data-sel="new" aria-pressed="false">Nouveautés</button>
      <button type="button" data-sel="picks" aria-pressed="false">Coups de cœur</button><button type="button" data-sel="best" aria-pressed="false">Meilleures ventes</button></div></fieldset>
    <label class="check-l"><input type="checkbox" id="fStock"><span>Disponible en magasin<small>Selon les informations de la librairie</small></span></label>
  </aside>
  <div>
    <div class="cat-bar"><p id="cCount" aria-live="polite">Chargement…</p>
      <label class="sort"><span class="lbl">Trier</span><select id="cSort"><option value="relevance">Nouveautés d’abord</option><option value="title">Titre (A → Z)</option><option value="author">Auteur (A → Z)</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option><option value="date">Parution récente</option></select></label></div>
    <div class="bk-grid" id="cGrid" aria-busy="true"></div>
    <div class="more-row" id="cMore"></div>
  </div>
</section>'''

EVENTS = '''<section class="pg-head">
  <div class="kick lbl">Événements</div>
  <h1 class="h1">Rencontres <em>&amp; dédicaces</em></h1>
  <p class="lead" data-content="events.lead">« Un lieu de rencontre entre lecteurs, auteurs et libraires. » Retrouvez ici les prochains rendez-vous de la librairie.</p>
</section>
<section class="sec dark on-dark ev-page" aria-labelledby="t-up"><h2 class="h3" id="t-up">À venir</h2><div class="evl" id="evUp" aria-busy="true"></div></section>
<section class="sec" aria-labelledby="t-past"><h2 class="h3" id="t-past">Rendez-vous passés</h2><div class="evl light" id="evPast"></div>
  <div class="past" style="margin-top:40px">
    <div class="past-it"><span class="lbl">Lundi 3 avril 2017 · Grand Théâtre, Maison de la Culture</span><h3><em>Les Liaisons dangereuses</em></h3><p>Lecture d’extraits du roman de Choderlos de Laclos, né à Amiens, par Elsa Lepoivre et Denis Podalydès de la Comédie-Française, et Marcel Bozonnet — pour les 60 ans de la librairie.</p></div>
    <div class="past-it"><span class="lbl">Mercredi 5 avril 2017 · Maison de la Culture d’Amiens</span><h3><em>La nuit sera calme</em></h3><p>Lecture-spectacle du livre de Romain Gary par Jacques Gamblin, seconde soirée anniversaire.</p></div>
  </div><p class="src" style="margin-top:20px">Archives 2017 : « La librairie Martelle d’Amiens a 60 ans ! », La vie des livres etc., 6 avril 2017.</p></section>'''

LEGAL = '''<section class="pg-head"><div class="kick lbl">Informations</div><h1 class="h1" id="lgTitle">{h1}</h1></section>
<article class="legal" id="legal" data-key="{key}" aria-busy="true"></article>'''

def absolute(html):
    """Same markup with root-relative links, for pages served under /livre/…"""
    html = re.sub(r'(href|action)="(?!https?:|mailto:|tel:|#|/)([^"]*)"', r'\1="/\2"', html)
    return html.replace('href="/index.html"', 'href="/"').replace('href="/index.html#', 'href="/#')

def write_partials():
    js = "// Generated by tools/pages.py — header / footer shared with the static pages. Do not edit by hand.\n"
    for name, val in (("HEADER", absolute(header())), ("FOOTER", absolute(footer())), ("MNAV", absolute(MNAV))):
        js += f"export const {name} = {json.dumps(val, ensure_ascii=False)};\n"
    (ROOT / "server").mkdir(exist_ok=True)
    (ROOT / "server/partials.mjs").write_text(js, encoding="utf-8")

if __name__ == "__main__":
    write_partials()
    page("catalogue.html", "Catalogue — Librairie Martelle, Amiens", "Recherchez un livre par titre, auteur ou ISBN dans le catalogue en ligne de la Librairie Martelle, 3 rue des Vergeaux à Amiens.", "p-cat", CATALOGUE, "catalogue.js")
    page("evenements.html", "Rencontres et dédicaces — Librairie Martelle, Amiens", "Rencontres d’auteurs, dédicaces, lectures et ateliers à la Librairie Martelle, Amiens.", "p-ev", EVENTS, "events.js")
    page("mentions-legales.html", "Mentions légales — Librairie Martelle", "Mentions légales du site de la Librairie Martelle.", "p-legal", LEGAL.format(h1="Mentions légales", key="legal.mentions"), "legal.js")
    page("confidentialite.html", "Confidentialité — Librairie Martelle", "Politique de confidentialité et cookies du site de la Librairie Martelle.", "p-legal", LEGAL.format(h1="Confidentialité &amp; cookies", key="legal.privacy"), "legal.js")
    print("pages written")
