// Catalogue page: search (title, author, publisher, ISBN — accent-insensitive), rayon / selection / stock filters, sort.
import { BOOKS, DEMO, PICKS, coverArt, svgMarkup } from "./art.js";
import { LIVE, api, esc, fold, CARD_COLS, SHOP, telHref, loadSettings, loadContent } from "./data.js";
import { bookCardLink } from "./views.js";
import { initChrome } from "./chrome.js";

initChrome();
const $ = (id) => document.getElementById(id);
const P = new URLSearchParams(location.search);
const S = { q: P.get("q") || "", cat: P.get("rayon") || "", sel: P.get("selection") || "", stock: P.get("dispo") === "1", sort: P.get("tri") || "relevance", page: 0, size: 24, total: 0, shown: 0 };
const ORDER = { relevance: "is_new.desc,updated_at.desc", title: "title.asc", author: "authors_text.asc", price_asc: "price.asc.nullslast", price_desc: "price.desc.nullslast", date: "published_date.desc.nullslast" };
const SEL = { new: "is_new", picks: "is_staff_pick", best: "is_bestseller" };

$("cq").value = S.q;
$("cSort").value = ORDER[S.sort] ? S.sort : "relevance";
$("fStock").checked = S.stock;

let cats = BOOKS.map((b) => ({ id: b.id, short_title: b.short }));
function drawCats(counts = {}) {
  $("fCat").innerHTML = `<button type="button" data-cat="" aria-pressed="${!S.cat}">Tous</button>` +
    cats.map((c) => `<button type="button" data-cat="${c.id}" aria-pressed="${S.cat === c.id}">${esc(c.short_title)}${counts[c.id] ? ` <small>${counts[c.id]}</small>` : ""}</button>`).join("");
}
drawCats();
document.querySelectorAll("#fSel [data-sel]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sel === S.sel)));

function syncUrl() {
  const u = new URLSearchParams();
  if (S.q) u.set("q", S.q);
  if (S.cat) u.set("rayon", S.cat);
  if (S.sel) u.set("selection", S.sel);
  if (S.stock) u.set("dispo", "1");
  if (S.sort !== "relevance") u.set("tri", S.sort);
  history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
  document.title = (S.q ? `« ${S.q} » — ` : "") + "Catalogue — Librairie Martelle, Amiens";
}

const skeleton = () => Array.from({ length: 8 }, () => `<div class="bk-card skel" aria-hidden="true"><div class="bk-cv"></div><div class="bk-t"></div></div>`).join("");
const emptyHTML = (msg) => `<div class="bk-empty" style="grid-column:1/-1">${msg}<span class="empty-sub">Un titre en tête ? Les libraires le trouvent ou le commandent pour vous.</span>
  <div class="btn-row"><a class="btn fill lbl" href="mailto:${esc(SHOP.email)}?subject=${encodeURIComponent("Recherche d’un livre" + (S.q ? " : " + S.q : ""))}">Demander un livre</a><a class="btn lbl" href="${telHref(SHOP.phone)}">${esc(SHOP.phone)}</a></div></div>`;

let ctrl = null;
async function load(append = false) {
  syncUrl();
  const grid = $("cGrid");
  if (!append) { S.page = 0; grid.innerHTML = skeleton(); grid.setAttribute("aria-busy", "true"); }
  if (!LIVE) return demo();
  let q = `books?select=${CARD_COLS}`;
  if (S.cat) q += `&category_id=eq.${encodeURIComponent(S.cat)}`;
  if (SEL[S.sel]) q += `&${SEL[S.sel]}=eq.true`;
  if (S.stock) q += "&availability=in.(in_stock,low_stock)";
  const term = fold(S.q).replace(/[,()*%"\\:]/g, " ").trim();
  if (term) {
    const digits = term.replace(/[^0-9]/g, "");
    q += `&search_text=ilike.*${encodeURIComponent(digits.length >= 10 ? digits : term)}*`;
  }
  q += `&order=${ORDER[S.sort] || ORDER.relevance}&offset=${S.page * S.size}&limit=${S.size}`;
  ctrl?.abort(); ctrl = new AbortController();
  try {
    const { data, total } = await api(q, { count: true, signal: ctrl.signal });
    S.total = total;
    const html = data.map(bookCardLink).join("");
    if (append) grid.insertAdjacentHTML("beforeend", html); else grid.innerHTML = html;
    S.shown = append ? S.shown + data.length : data.length;
    grid.setAttribute("aria-busy", "false");
    $("cCount").textContent = total ? `${total} livre${total > 1 ? "s" : ""}${S.q ? ` pour « ${S.q} »` : ""}` : "Aucun résultat";
    if (!total) grid.innerHTML = emptyHTML(S.q ? `Aucun livre ne correspond à « ${esc(S.q)} » dans le catalogue en ligne.` : "Aucun livre en ligne pour ces critères.");
    $("cMore").innerHTML = S.shown < total ? `<button class="btn lbl" id="moreBtn">Afficher plus de livres (${total - S.shown})</button>` : "";
    $("moreBtn")?.addEventListener("click", () => { S.page++; load(true); });
  } catch (e) {
    if (e.name === "AbortError") return;
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = `<div class="bk-empty" role="alert" style="grid-column:1/-1">Le catalogue est momentanément indisponible. Merci de réessayer dans un instant.<div class="btn-row"><button class="btn lbl" id="retry">Réessayer</button></div></div>`;
    $("retry").onclick = () => load();
  }
}

/* No catalogue connected: fictional demo titles, never presented as real books. */
function demo() {
  $("demoRibbon").hidden = false;
  $("demoRibbon").textContent = "Démonstration : titres fictifs, non commercialisés. Le catalogue réel s’affichera ici une fois la base de données de la librairie connectée.";
  const term = fold(S.q);
  const all = [...DEMO, ...PICKS].filter((b) => !term || fold(b.title + " " + b.author).includes(term));
  $("cGrid").innerHTML = all.length ? all.map((b) => `<div class="bk-card demo"><span class="bk-cv">${svgMarkup(coverArt(b))}</span><span class="bk-t">${esc(b.title)}</span><span class="bk-a">${esc(b.author)} · titre fictif</span></div>`).join("") : emptyHTML("Aucun titre de démonstration ne correspond.");
  $("cCount").textContent = `${all.length} titre(s) de démonstration`;
  $("cGrid").setAttribute("aria-busy", "false");
}

/* ---------- interactions ---------- */
$("catForm").addEventListener("submit", (e) => { e.preventDefault(); S.q = $("cq").value.trim(); load(); });
let t;
$("cq").addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { S.q = $("cq").value.trim(); load(); }, 350); });
$("fCat").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; S.cat = b.dataset.cat; $("fCat").querySelectorAll("[data-cat]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); load(); });
$("fSel").addEventListener("click", (e) => { const b = e.target.closest("[data-sel]"); if (!b) return; S.sel = b.dataset.sel; $("fSel").querySelectorAll("[data-sel]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); load(); });
$("fStock").addEventListener("change", (e) => { S.stock = e.target.checked; load(); });
$("cSort").addEventListener("change", (e) => { S.sort = e.target.value; load(); });

/* ---------- boot ---------- */
if (LIVE) {
  Promise.all([
    api("categories?select=id,short_title&order=position").catch(() => null),
    api("rpc/category_counts", { method: "POST", body: {} }).catch(() => []),
    loadContent(), loadSettings(),
  ]).then(([c, counts, content]) => {
    if (c && c.length) cats = c;
    drawCats(Object.fromEntries((counts || []).map((x) => [x.category_id, +x.books])));
    if (content["site.demo_catalogue"] === true) $("demoRibbon").hidden = false;
  });
}
load();
