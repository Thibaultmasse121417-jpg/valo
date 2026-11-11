// Shared rendering for public pages: book cards, drawn fallback covers, events.
import { BOOKS, coverArt, svgMarkup } from "./art.js";
import { esc, coverSrc, priceTxt, avHTML, bookPath, KINDS, SHOP, dfmt, mediaUrl } from "./data.js";

export const catStyle = (id) => BOOKS.find((b) => b.id === id) || BOOKS[0];

export function fallbackArt(bk) {
  const c = catStyle(bk.category_id);
  return coverArt({ ...c, h: 1, title: bk.title.length > 60 ? bk.title.slice(0, 58) + "…" : bk.title, topL: c.short.toUpperCase(), topR: "", botL: (bk.authors_text || "").toUpperCase().slice(0, 34), botR: "Martelle" });
}

const CACHE = new Map();
export const bookCache = CACHE;

export function coverHTML(bk) {
  CACHE.set(bk.id, { ...(CACHE.get(bk.id) || {}), ...bk });
  const src = coverSrc(bk);
  return src ? `<img src="${esc(src)}" alt="Couverture : ${esc(bk.title)}" loading="lazy" decoding="async" data-fb="${bk.id}">` : svgMarkup(fallbackArt(bk));
}

/** A cover that fails to load is replaced by a drawn cover in the rayon's style. */
function replaceBroken(img) {
  const bk = CACHE.get(img.dataset.fb) || (img.dataset.title ? { id: img.dataset.fb, title: img.dataset.title, authors_text: img.dataset.authors || "", category_id: img.dataset.cat || null } : null);
  if (!bk) return;
  const t = document.createElement("template");
  t.innerHTML = svgMarkup(fallbackArt(bk));
  img.replaceWith(t.content.firstChild);
}
document.addEventListener("error", (e) => {
  if (e.target instanceof HTMLImageElement && e.target.dataset.fb) replaceBroken(e.target);
}, true);
/** Images that already failed before this module loaded (server-rendered pages). */
export function repairBrokenCovers(root = document) {
  root.querySelectorAll("img[data-fb]").forEach((img) => { if (img.complete && img.naturalWidth === 0) replaceBroken(img); });
}

/** Catalogue card: a real link to the indexable book page. */
export function bookCardLink(bk) {
  const meta = [bk.authors_text, bk.publisher].filter(Boolean).join(" · ");
  return `<a class="bk-card" href="${bookPath(bk)}" data-book="${bk.id}"><span class="bk-cv">${coverHTML(bk)}</span>
    <span class="bk-t">${esc(bk.title)}</span><span class="bk-a">${esc(meta)}</span>
    <span class="bk-p"><span>${priceTxt(bk.price)}</span>${avHTML(bk)}</span></a>`;
}

export function eventHTML(ev, { past = false } = {}) {
  const time = (d) => dfmt(d, { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
  const cta = ev.cancelled || past ? ""
    : ev.booking_url ? `<a class="btn fill lbl" href="${esc(ev.booking_url)}" ${/^https/.test(ev.booking_url) ? 'target="_blank" rel="noopener"' : ""}>${ev.booking_required ? "S’inscrire" : "En savoir plus"}</a>`
    : ev.booking_required ? `<a class="btn fill lbl" href="mailto:${esc(SHOP.email)}?subject=${encodeURIComponent("Inscription — " + ev.title)}">S’inscrire</a>` : "";
  const img = ev.image_path ? `<img class="evi-img" src="${esc(mediaUrl(ev.image_path))}" alt="" loading="lazy">` : "";
  const book = ev.book ? `<a class="btn lbl" href="${bookPath(ev.book)}">Le livre</a>` : "";
  const desc = ev.description ? (ev.description.length > 280 ? ev.description.slice(0, 278) + "…" : ev.description) : "";
  return `<article class="evi${ev.cancelled ? " cancelled" : ""}${past ? " past" : ""}">
    <div><div class="dd">${dfmt(ev.starts_at, { day: "numeric" })}</div><span class="mm">${dfmt(ev.starts_at, { month: "long", ...(past ? { year: "numeric" } : {}) })}</span></div>
    <div>${ev.cancelled ? `<span class="cancel-tag">Annulé${ev.cancel_note ? " — " + esc(ev.cancel_note) : ""}</span>` : ""}
      <span class="lbl">${esc(KINDS[ev.kind] || "Rendez-vous")} · ${dfmt(ev.starts_at, { weekday: "long" })} · ${time(ev.starts_at)}${ev.ends_at ? "–" + time(ev.ends_at) : ""}</span>
      <h3>${esc(ev.title)}</h3>${ev.guests ? `<p><b>${esc(ev.guests)}</b></p>` : ""}${desc ? `<p>${esc(desc)}</p>` : ""}${ev.location && !/Vergeaux/.test(ev.location) ? `<p>${esc(ev.location)}</p>` : ""}
    </div>
    <div class="btn-row row-cta">${img}${cta}${book}</div></article>`;
}

export const EVENT_COLS = "id,title,kind,starts_at,ends_at,location,guests,description,booking_url,booking_required,image_path,cancelled,cancel_note,book:books(id,isbn,title)";
