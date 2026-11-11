// Public, read-only access to the shop's data (Supabase REST + Row Level Security).
// Shared by every public page. No secret here: the anon key is public by design.

export const CFG = window.MARTELLE_CONFIG || {};
export const LIVE = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey);
export const API = LIVE ? String(CFG.supabaseUrl).replace(/\/$/, "") : "";

export const PUB_COLS = "id,isbn,title,subtitle,authors,authors_text,publisher,published_date,page_count,description,genre,cover_path,cover_url,cover_credit,price,availability,category_id,is_new,is_bestseller,is_staff_pick,staff_note,staff_name,created_at";
export const CARD_COLS = "id,isbn,title,authors,authors_text,publisher,genre,cover_path,cover_url,price,availability,category_id,is_new,is_staff_pick";

export class ApiError extends Error {}

export async function api(path, { method = "GET", body, count = false, signal } = {}) {
  if (!LIVE) throw new ApiError("offline");
  const r = await fetch(`${API}/rest/v1/${path}`, {
    method, cache: "no-store", signal, body: body ? JSON.stringify(body) : undefined,
    headers: { apikey: CFG.supabaseAnonKey, authorization: `Bearer ${CFG.supabaseAnonKey}`, "content-type": "application/json", ...(count ? { prefer: "count=exact" } : {}) },
  });
  if (!r.ok) throw new ApiError("API " + r.status);
  const data = await r.json();
  if (!count) return data;
  const cr = r.headers.get("content-range");
  return { data, total: cr && cr.includes("/") ? +cr.split("/")[1] : data.length };
}

export const mediaUrl = (path) => (path ? `${API}/storage/v1/object/public/media/${path.split("/").map(encodeURIComponent).join("/")}` : null);
export const coverSrc = (b) => (b.cover_path ? mediaUrl(b.cover_path) : b.cover_url || null);

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/** lower-case, no accents: matches books.search_text */
export const fold = (s) => String(s || "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "");

const nfEur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const priceTxt = (p) => (p === null || p === undefined ? "Prix en librairie" : nfEur.format(+p));
export const AVAIL = { in_stock: "En stock", low_stock: "Derniers exemplaires", on_order: "Sur commande", preorder: "À paraître", out_of_stock: "Indisponible" };
/** Availability is shown only when it has been entered by the shop or its stock software. */
export const avHTML = (b) => (b && b.availability && AVAIL[b.availability] ? `<span class="av ${b.availability}">${AVAIL[b.availability]}</span>` : "");
export const KINDS = { dedicace: "Dédicace", rencontre: "Rencontre", lecture: "Lecture", atelier: "Atelier", jeu: "Jeux", autre: "Rendez-vous" };
export const deName = (n) => (/^[aeiouyhàâéèêëîïôöûü]/i.test(n) ? "d’" : "de ") + n;
export const telHref = (p) => "tel:" + String(p).replace(/[^0-9+]/g, "").replace(/^0/, "+33");
export const slugify = (s) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
/** Canonical, indexable URL of a book page. */
export const bookPath = (b) => `/livre/${b.isbn || b.id}${b.title ? "-" + slugify(b.title) : ""}`;

/** Practical information (defaults = verified values from leslibraires.fr, 11/11/2026). */
export const SHOP = {
  phone: "03 22 71 54 54",
  email: "commandes@librairiemartelle.com",
  address: "3 rue des Vergeaux, 80000 Amiens",
  order_url: "https://www.leslibraires.fr/presentation/librairie-martelle/",
  book_url_template: null,
  announcement: null,
  opening_hours: [{ open: "09:30", close: "19:00" }, { open: "09:30", close: "19:00" }, { open: "09:30", close: "19:00" }, { open: "09:30", close: "19:00" }, { open: "09:30", close: "19:00" }, { open: "09:30", close: "19:00" }, null],
  closures: [{ date: "2026-11-11", label: "Fermeture exceptionnelle" }],
};

let settingsP = null;
export function loadSettings() {
  if (!LIVE) return Promise.resolve(SHOP);
  settingsP ||= api("shop_settings?select=opening_hours,closures,phone,email,address,order_url,book_url_template,announcement")
    .then(([s]) => { if (s) for (const k of Object.keys(SHOP)) if (s[k] !== undefined && s[k] !== null) SHOP[k] = s[k]; if (s) SHOP.book_url_template = s.book_url_template || null; if (s) SHOP.announcement = s.announcement || null; return SHOP; })
    .catch(() => SHOP);
  return settingsP;
}

/** Editable site texts: key → value (falls back to the text written in the HTML). */
let contentP = null;
export function loadContent() {
  if (!LIVE) return Promise.resolve({});
  contentP ||= api("site_content?select=key,value").then((rows) => Object.fromEntries(rows.map((r) => [r.key, r.value]))).catch(() => ({}));
  return contentP;
}
/** Apply [data-content="key"] texts (plain text only, never HTML). */
export function applyContent(map, root = document) {
  root.querySelectorAll("[data-content]").forEach((el) => {
    const v = map[el.dataset.content];
    if (typeof v === "string" && v.trim()) el.textContent = v;
  });
}

export function bookOrderLink(b) {
  if (SHOP.book_url_template && b.isbn) return { href: SHOP.book_url_template.replace("{isbn}", b.isbn), label: "Commander en ligne" };
  return SHOP.order_url ? { href: SHOP.order_url, label: "Commander en ligne" } : null;
}
export function reserveMailto(b) {
  const subj = `Réservation — ${b.title}${b.isbn ? " (" + b.isbn + ")" : ""}`;
  const body = `Bonjour,\n\nJe souhaite réserver « ${b.title} »${b.authors_text ? " de " + b.authors_text : ""}${b.isbn ? " (ISBN " + b.isbn + ")" : ""}.\n\nNom :\nTéléphone :\n\nMerci !`;
  return `mailto:${SHOP.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
}

/* ---------- opening hours (Europe/Paris) ---------- */
export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const toMin = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
export const hm = (m) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
export function parisNow(d = new Date()) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t) => p.find((x) => x.type === t).value;
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return { wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), min: (+g("hour") % 24) * 60 + +g("minute"), date };
}
const addDays = (iso, k) => { const t = new Date(iso + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + k); return t.toISOString().slice(0, 10); };
export function hoursTable() { return SHOP.opening_hours.map((h) => (h ? [toMin(h.open), toMin(h.close)] : null)); }
export function shopStatus(now = new Date()) {
  const H = hoursTable(), closed = new Set((SHOP.closures || []).map((c) => c.date));
  const on = (wd, iso) => (closed.has(iso) ? null : H[wd]);
  const { wd, min, date } = parisNow(now), h = on(wd, date), exc = closed.has(date);
  if (h && min >= h[0] && min < h[1]) return { open: true, wd, exc, txt: `Ouvert · jusqu’à ${hm(h[1])}` };
  if (h && min < h[0]) return { open: false, wd, exc, txt: `Fermé · ouvre à ${hm(h[0])}` };
  for (let k = 1; k <= 14; k++) {
    const dd = (wd + k) % 7, hh = on(dd, addDays(date, k));
    if (hh) return { open: false, wd, exc, txt: `${exc ? "Fermeture exceptionnelle" : "Fermé"} · ouvre ${k === 1 ? "demain" : DAYS[dd].toLowerCase()} à ${hm(hh[0])}` };
  }
  return { open: false, wd, exc, txt: "Fermé" };
}
export const dfmt = (d, o) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ...o }).format(new Date(d));
