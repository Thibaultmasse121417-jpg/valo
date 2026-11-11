// Server-rendered, indexable book pages (/livre/<isbn>-<titre>) and /sitemap.xml.
// Runtime-agnostic: (Request, env) → Response. Used by netlify/functions/book-page.mjs and tools/dev-server.mjs.
// env: SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL (https://www.exemple.fr), SITE_INDEXABLE ("true" once validated).
import { BOOKS, coverArt, svgMarkup } from "../assets/js/art.js";
import { HEADER, FOOTER, MNAV } from "./partials.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fold = (s) => String(s || "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const slugify = (s) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
export const bookPath = (b) => `/livre/${b.isbn || b.id}${b.title ? "-" + slugify(b.title) : ""}`;
const nf = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const AVAIL = { in_stock: ["En stock", "InStock"], low_stock: ["Derniers exemplaires", "LimitedAvailability"], on_order: ["Sur commande", "BackOrder"], preorder: ["À paraître", "PreOrder"], out_of_stock: ["Indisponible", "OutOfStock"] };
const COLS = "id,isbn,title,subtitle,authors,authors_text,publisher,published_date,page_count,language,description,genre,cover_path,cover_url,cover_credit,price,availability,category_id,staff_note,staff_name,updated_at";

function client(env) {
  const base = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const get = async (path) => {
    const r = await fetch(`${base}/rest/v1/${path}`, { headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } });
    if (!r.ok) throw new Error("supabase " + r.status);
    return r.json();
  };
  const media = (p) => `${base}/storage/v1/object/public/media/${p.split("/").map(encodeURIComponent).join("/")}`;
  return { get, media };
}

const html = (status, body, headers = {}) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300", "x-content-type-options": "nosniff", ...headers } });

function layout({ title, desc, canonical, image, indexable, body, jsonld }) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${indexable ? "" : '<meta name="robots" content="noindex,nofollow">\n'}${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n` : ""}<meta name="theme-color" content="#ECE6DA">
<meta property="og:type" content="book"><meta property="og:site_name" content="Librairie Martelle"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ""}${image ? `<meta property="og:image" content="${esc(image)}">` : ""}
<link rel="preload" href="/assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/site.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body class="page p-book">
${HEADER}
${MNAV}
<div class="annc" id="annc" role="status" hidden></div>
<main id="main" tabindex="-1">
${body}
</main>
${FOOTER}
<div class="grain" aria-hidden="true"></div>
<script src="/config.js"></script>
<script type="module" src="/assets/js/book.js"></script>
</body>
</html>`;
}

function notFound(env, msg = "Ce livre n’est pas (ou plus) présenté en ligne.") {
  return html(404, layout({
    title: "Livre introuvable — Librairie Martelle", desc: msg, indexable: false,
    body: `<section class="pg-head"><div class="kick lbl">Catalogue</div><h1 class="h1">Livre <em>introuvable</em></h1><p class="lead">${esc(msg)} Les libraires peuvent sans doute le commander pour vous.</p>
      <div class="btn-row"><a class="btn fill lbl" href="/catalogue.html">Chercher dans le catalogue</a><a class="btn lbl" href="mailto:commandes@librairiemartelle.com">Demander un livre</a></div></section>`,
  }), { "cache-control": "public, max-age=0, s-maxage=30" });
}

async function bookPage(key, env, reqUrl) {
  const m = key.match(/^(97[89]\d{10}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:-[a-z0-9-]*)?$/);
  if (!m) return notFound(env);
  const db = client(env);
  const id = m[1];
  const filter = id.length === 13 ? `isbn=eq.${id}` : `id=eq.${id}`;
  let book, settings = {}, cat, related = [], content = [];
  try {
    [[book], [settings = {}], content] = await Promise.all([
      db.get(`books?select=${COLS}&${filter}`),
      db.get("shop_settings?select=phone,email,order_url,book_url_template"),
      db.get("site_content?select=key,value&key=eq.site.demo_catalogue"),
    ]);
  } catch (e) {
    return html(503, layout({ title: "Catalogue indisponible — Librairie Martelle", desc: "", indexable: false, body: `<section class="pg-head"><h1 class="h1">Catalogue <em>momentanément indisponible</em></h1><p class="lead">Merci de réessayer dans un instant.</p></section>` }), { "cache-control": "no-store", "retry-after": "60" });
  }
  if (!book) return notFound(env);
  const canonicalPath = bookPath(book);
  if (new URL(reqUrl).pathname !== canonicalPath) return new Response(null, { status: 301, headers: { location: canonicalPath, "cache-control": "public, max-age=3600" } });
  try {
    [[cat], related] = await Promise.all([
      book.category_id ? db.get(`categories?select=id,title,short_title&id=eq.${encodeURIComponent(book.category_id)}`) : [[]],
      book.category_id ? db.get(`books?select=id,isbn,title,authors_text,cover_path,cover_url,price,category_id&category_id=eq.${encodeURIComponent(book.category_id)}&id=neq.${book.id}&order=is_new.desc,updated_at.desc&limit=4`) : [],
    ]);
  } catch (_) {}
  const site = String(env.SITE_URL || "").replace(/\/$/, "");
  const canonical = site ? site + canonicalPath : null;
  const style = BOOKS.find((b) => b.id === book.category_id) || BOOKS[0];
  const cover = book.cover_path ? db.media(book.cover_path) : book.cover_url || null;
  const drawn = (b) => svgMarkup(coverArt({ ...style, h: 1, title: b.title.length > 60 ? b.title.slice(0, 58) + "…" : b.title, topL: style.short.toUpperCase(), topR: "", botL: (b.authors_text || "").toUpperCase().slice(0, 34), botR: "Martelle" }));
  const av = book.availability && AVAIL[book.availability];
  const email = settings.email || "commandes@librairiemartelle.com", phone = settings.phone || "03 22 71 54 54";
  const orderHref = settings.book_url_template && book.isbn ? settings.book_url_template.replace("{isbn}", book.isbn) : settings.order_url;
  const reserve = `mailto:${email}?subject=${encodeURIComponent(`Réservation — ${book.title}${book.isbn ? " (" + book.isbn + ")" : ""}`)}&body=${encodeURIComponent(`Bonjour,\n\nJe souhaite réserver « ${book.title} »${book.authors_text ? " de " + book.authors_text : ""}${book.isbn ? " (ISBN " + book.isbn + ")" : ""}.\n\nNom :\nTéléphone :\n\nMerci !`)}`;
  const year = (book.published_date || "").slice(0, 4);
  const demo = content.some((c) => c.value === true);
  const facts = [
    ["Auteur(s)", book.authors_text], ["Éditeur", book.publisher], ["Parution", book.published_date && (book.published_date.length > 4 ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(book.published_date)) : year)],
    ["Genre", book.genre], ["Rayon", cat && cat.title], ["Pages", book.page_count], ["ISBN", book.isbn],
  ].filter(([, v]) => v);
  const desc = (book.description || `${book.title}${book.authors_text ? " de " + book.authors_text : ""}${book.publisher ? ", " + book.publisher : ""}. Disponible à la Librairie Martelle, Amiens.`).replace(/\s+/g, " ").slice(0, 158);
  const jsonld = {
    "@context": "https://schema.org", "@type": "Book", name: book.title, ...(book.subtitle ? { alternativeHeadline: book.subtitle } : {}),
    author: (book.authors || []).map((n) => ({ "@type": "Person", name: n })), ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.publisher ? { publisher: { "@type": "Organization", name: book.publisher } } : {}), ...(book.published_date ? { datePublished: book.published_date } : {}),
    ...(book.page_count ? { numberOfPages: book.page_count } : {}), ...(book.genre ? { genre: book.genre } : {}), ...(book.description ? { description: book.description.slice(0, 500) } : {}),
    ...(cover ? { image: cover } : {}), ...(canonical ? { url: canonical } : {}),
    ...(book.price !== null && book.price !== undefined ? { offers: { "@type": "Offer", price: Number(book.price).toFixed(2), priceCurrency: "EUR", ...(av ? { availability: "https://schema.org/" + av[1] } : {}), seller: { "@type": "BookStore", name: "Librairie Martelle" } } } : {}),
  };
  const body = `<nav class="crumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><a href="/catalogue.html">Catalogue</a>${cat ? `<span aria-hidden="true">/</span><a href="/catalogue.html?rayon=${esc(cat.id)}">${esc(cat.title)}</a>` : ""}</nav>
${demo ? '<div class="demo-ribbon">Catalogue de démonstration : ce livre ne reflète pas nécessairement le stock de la librairie.</div>' : ""}
<article class="bk-body bk-page" itemscope itemtype="https://schema.org/Book">
  <div class="bk-stage"><div class="bk-flat" data-tilt>${cover ? `<img src="${esc(cover)}" alt="Couverture : ${esc(book.title)}" data-fb="${esc(book.id)}" data-title="${esc(book.title)}" data-authors="${esc(book.authors_text || "")}" data-cat="${esc(book.category_id || "")}" itemprop="image">` : drawn(book)}</div><i class="b3d-sh"></i>${book.cover_credit ? `<p class="src">${esc(book.cover_credit)}</p>` : ""}</div>
  <div class="bk-info">
    ${cat ? `<span class="lbl bk-kick">${esc(cat.title)}${book.genre ? " · " + esc(book.genre) : ""}</span>` : ""}
    <h1 class="bk-title" itemprop="name">${esc(book.title)}</h1>
    ${book.subtitle ? `<p class="bk-sub">${esc(book.subtitle)}</p>` : ""}
    ${book.authors_text ? `<p class="bk-by" itemprop="author">${esc(book.authors_text)}</p>` : ""}
    <div class="bk-buy"><span class="bk-price${book.price === null || book.price === undefined ? " na" : ""}">${book.price === null || book.price === undefined ? "Prix en librairie" : nf.format(+book.price)}</span>${av ? `<span class="av ${book.availability}">${av[0]}</span>` : ""}
      <span class="btn-row" style="margin-left:auto"><a class="btn fill lbl" href="${esc(reserve)}">${book.availability === "out_of_stock" ? "Demander ce livre" : "Réserver en librairie"}</a>${orderHref ? `<a class="btn lbl" data-order href="${esc(orderHref)}" target="_blank" rel="noopener">Commander en ligne</a>` : ""}</span></div>
    ${book.staff_note ? `<div class="bk-note"><p>« ${esc(book.staff_note)} »</p><span>${book.staff_name ? "Le coup de cœur " + (/^[aeiouyhàâéèêîôû]/i.test(book.staff_name) ? "d’" : "de ") + esc(book.staff_name) : "Le coup de cœur des libraires"}</span></div>` : ""}
    <div class="bk-desc" itemprop="description">${book.description ? esc(book.description).replace(/\n/g, "<br>") : "Le résumé de ce livre n’est pas encore en ligne : demandez conseil aux libraires."}</div>
    <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    <p class="src">Retrait au 3 rue des Vergeaux, Amiens · <a href="tel:${esc(phone.replace(/[^0-9+]/g, "").replace(/^0/, "+33"))}">${esc(phone)}</a></p>
  </div>
</article>
${related.length ? `<section class="sec related" aria-labelledby="t-rel"><div class="kick lbl">${cat ? esc(cat.title) : "Dans le même rayon"}</div><h2 class="h3" id="t-rel">Dans le même rayon</h2>
  <div class="bk-grid">${related.map((r) => { const src = r.cover_path ? db.media(r.cover_path) : r.cover_url; return `<a class="bk-card" href="${bookPath(r)}"><span class="bk-cv">${src ? `<img src="${esc(src)}" alt="Couverture : ${esc(r.title)}" loading="lazy" data-fb="${esc(r.id)}" data-title="${esc(r.title)}" data-authors="${esc(r.authors_text || "")}" data-cat="${esc(r.category_id || "")}">` : drawn(r)}</span><span class="bk-t">${esc(r.title)}</span><span class="bk-a">${esc(r.authors_text || "")}</span><span class="bk-p"><span>${r.price === null || r.price === undefined ? "Prix en librairie" : nf.format(+r.price)}</span></span></a>`; }).join("")}</div></section>` : ""}`;
  return html(200, layout({ title: `${book.title}${book.authors_text ? " — " + book.authors_text : ""} | Librairie Martelle, Amiens`, desc, canonical, image: cover, indexable: env.SITE_INDEXABLE === "true", body, jsonld }));
}

async function sitemap(env) {
  const db = client(env);
  const site = String(env.SITE_URL || "").replace(/\/$/, "");
  const urls = ["/", "/catalogue.html", "/evenements.html", "/mentions-legales.html", "/confidentialite.html"].map((p) => `<url><loc>${esc(site + p)}</loc></url>`);
  for (let from = 0; from < 50000; from += 1000) {
    const rows = await db.get(`books?select=id,isbn,title,updated_at&order=updated_at.desc&offset=${from}&limit=1000`).catch(() => []);
    rows.forEach((b) => urls.push(`<url><loc>${esc(site + bookPath(b))}</loc><lastmod>${b.updated_at.slice(0, 10)}</lastmod></url>`));
    if (rows.length < 1000) break;
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=600" } });
}

export async function handle(req, env) {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return html(503, layout({ title: "Configuration requise", desc: "", indexable: false, body: `<section class="pg-head"><h1 class="h1">Catalogue <em>non configuré</em></h1><p class="lead">Les fiches livres s’afficheront une fois la base de données de la librairie connectée.</p></section>` }), { "cache-control": "no-store" });
  const path = new URL(req.url).pathname;
  if (path === "/sitemap.xml") return sitemap(env);
  const m = path.match(/\/livre\/([^/]+)\/?$/);
  if (m) return bookPage(decodeURIComponent(m[1]).toLowerCase(), env, req.url);
  return notFound(env);
}
