// CSV reading (Excel FR friendly) and column mapping for book imports.
import { normalizeIsbn, normalizeDate } from "./isbn.js";
import { parsePrice } from "./ui.js";

/** Decode a file: UTF-8 first (BOM aware), Windows-1252 if the text looks mis-decoded (Excel FR). */
export async function readTextFile(file) {
  const buf = await file.arrayBuffer();
  let text = new TextDecoder("utf-8").decode(buf);
  if (text.includes("�")) text = new TextDecoder("windows-1252").decode(buf);
  return text.replace(/^﻿/, "");
}

export function detectDelimiter(text) {
  const sample = text.split(/\r?\n/).slice(0, 10).join("\n");
  const score = (d) => sample.split("\n").map((l) => splitLine(l, d).length).filter((n) => n > 1);
  let best = ",", bestScore = 0;
  for (const d of [";", ",", "\t", "|"]) {
    const s = score(d);
    if (!s.length) continue;
    const consistent = s.every((n) => n === s[0]) ? 2 : 1;
    const val = s[0] * consistent;
    if (val > bestScore) { bestScore = val; best = d; }
  }
  return best;
}
const splitLine = (l, d) => parseCsv(l, d)[0] || [];

/** RFC 4180 parser: quotes, escaped quotes, delimiters and newlines inside quotes. */
export function parseCsv(text, delim = ",") {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"' && field === "") q = true;
    else if (c === delim) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

export const FIELDS = [
  { key: "isbn", label: "ISBN / EAN", syn: ["isbn", "ean", "ean13", "isbn13", "gencod", "code barre", "codebarre", "code ean"] },
  { key: "title", label: "Titre", syn: ["titre", "title", "libelle", "designation", "nom"] },
  { key: "authors", label: "Auteur(s)", syn: ["auteur", "auteurs", "author", "authors", "ecrivain"] },
  { key: "publisher", label: "Éditeur", syn: ["editeur", "publisher", "edition", "editions", "maison d edition"] },
  { key: "published_date", label: "Date de parution", syn: ["date", "parution", "date de parution", "annee", "published", "date parution"] },
  { key: "price", label: "Prix (€)", syn: ["prix", "price", "prix ttc", "prix public", "pvp", "tarif"] },
  { key: "stock_qty", label: "Stock (quantité)", syn: ["stock", "quantite", "qte", "qty", "stock magasin"] },
  { key: "availability", label: "Disponibilité", syn: ["disponibilite", "dispo", "availability", "statut", "etat"] },
  { key: "category", label: "Rayon", syn: ["rayon", "categorie", "category", "genre", "famille", "section"] },
  { key: "description", label: "Résumé", syn: ["resume", "description", "summary", "quatrieme", "4e de couverture"] },
  { key: "is_new", label: "Nouveauté (oui/non)", syn: ["nouveaute", "nouveau", "new"] },
  { key: "is_bestseller", label: "Meilleure vente (oui/non)", syn: ["meilleure vente", "meilleures ventes", "best", "bestseller", "top"] },
  { key: "is_staff_pick", label: "Coup de cœur (oui/non)", syn: ["coup de coeur", "coups de coeur", "cdc", "staff pick", "coeur"] },
  { key: "staff_note", label: "Mot du libraire", syn: ["mot du libraire", "avis", "note libraire", "commentaire"] },
  { key: "cover_url", label: "Image de couverture (URL https)", syn: ["couverture", "image", "cover", "visuel", "url image"] },
  { key: "external_ref", label: "Référence logiciel de stock", syn: ["reference", "ref", "code article", "id article", "sku", "code interne"] },
];

export const fold = (s) => String(s || "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function guessMapping(headers) {
  const map = {};
  const used = new Set();
  for (const f of FIELDS) {
    let idx = headers.findIndex((h, i) => !used.has(i) && f.syn.includes(fold(h)));
    if (idx < 0) idx = headers.findIndex((h, i) => !used.has(i) && f.syn.some((s) => fold(h).startsWith(s) || fold(h).includes(" " + s)));
    if (idx >= 0) { map[f.key] = idx; used.add(idx); }
  }
  return map;
}

/** "Albert Camus, Jean Giono" → 2 authors ; "CAMUS, Albert" → "Albert CAMUS" ; also ; / | & separators. */
export function splitAuthors(v) {
  const s = String(v || "").trim();
  if (!s) return [];
  const two = s.split(/\s*,\s*/);
  if (two.length === 2 && /^[A-ZÀ-Ý' -]{2,}$/.test(two[0]) && !/^[A-ZÀ-Ý' -]{2,}$/.test(two[1])) return [`${two[1]} ${two[0]}`];
  return s.split(/\s*(?:[;|\/,]|\s&\s|\set\s)\s*/).map((a) => a.trim()).filter(Boolean).slice(0, 12);
}

const yes = (v) => /^(1|oui|o|yes|y|x|vrai|true)$/i.test(String(v || "").trim());

export function parseAvailability(v, qty) {
  const s = fold(v);
  if (s) {
    if (/(epuise|rupture|indispo|out|non dispo)/.test(s)) return "out_of_stock";
    if (/(faible|bientot epuise|low|dernier)/.test(s)) return "low_stock";
    if (/(commande|order)/.test(s)) return "on_order";
    if (/(paraitre|precommande|preorder|a venir)/.test(s)) return "preorder";
    if (/(stock|dispo|available|oui)/.test(s)) return "in_stock";
  }
  if (qty !== null && qty !== undefined && Number.isFinite(qty)) return qty <= 0 ? "out_of_stock" : qty <= 2 ? "low_stock" : "in_stock";
  return null;
}

export function matchCategory(v, categories) {
  const s = fold(v);
  if (!s) return null;
  const exact = categories.find((c) => [c.id, c.title, c.short_title].some((x) => fold(x) === s));
  if (exact) return exact.id;
  const part = categories.find((c) => [c.title, c.short_title, c.kicker].some((x) => fold(x).split(" ").some((w) => w.length > 3 && s.includes(w))));
  return part ? part.id : null;
}

/** Convert one CSV row into a book record. Returns { book, errors[] }. */
export function rowToBook(row, map, ctx) {
  const get = (k) => (map[k] === undefined || map[k] === "" ? "" : String(row[map[k]] ?? "").trim());
  const errors = [];
  const book = {};
  const rawIsbn = get("isbn");
  if (rawIsbn) {
    const isbn = normalizeIsbn(rawIsbn);
    if (isbn) book.isbn = isbn; else errors.push(`ISBN invalide « ${rawIsbn} »`);
  }
  const title = get("title");
  if (title) book.title = title.slice(0, 300);
  else if (!book.isbn || !ctx.enrich) errors.push("Titre manquant");
  const authors = get("authors");
  if (authors) book.authors = splitAuthors(authors);
  const pub = get("publisher"); if (pub) book.publisher = pub.slice(0, 200);
  const date = normalizeDate(get("published_date")); if (date) book.published_date = date;
  const priceRaw = get("price");
  if (priceRaw) { const p = parsePrice(priceRaw); if (Number.isNaN(p)) errors.push(`Prix invalide « ${priceRaw} »`); else book.price = p; }
  const qtyRaw = get("stock_qty");
  let qty = null;
  if (qtyRaw) { qty = parseInt(qtyRaw.replace(/\s/g, ""), 10); if (Number.isFinite(qty) && qty >= 0) book.stock_qty = qty; else { errors.push(`Stock invalide « ${qtyRaw} »`); qty = null; } }
  const av = parseAvailability(get("availability"), qty);
  if (av) book.availability = av;
  const cat = get("category");
  const cid = (cat && matchCategory(cat, ctx.categories)) || ctx.defaultCategory || null;
  if (cid) book.category_id = cid; // never blank an existing rayon on update
  const desc = get("description"); if (desc) book.description = desc.slice(0, 8000);
  if (map.is_new !== undefined && map.is_new !== "") book.is_new = yes(get("is_new"));
  if (map.is_bestseller !== undefined && map.is_bestseller !== "") book.is_bestseller = yes(get("is_bestseller"));
  if (map.is_staff_pick !== undefined && map.is_staff_pick !== "") book.is_staff_pick = yes(get("is_staff_pick"));
  const note = get("staff_note"); if (note) book.staff_note = note.slice(0, 1200);
  const cover = get("cover_url"); if (/^https:\/\//.test(cover)) book.cover_url = cover;
  const ext = get("external_ref"); if (ext) book.external_ref = ext.slice(0, 120);
  book.published = ctx.publish;
  book.source = "csv";
  return { book, errors };
}

export const TEMPLATE = [
  ["isbn", "titre", "auteurs", "editeur", "date_parution", "prix", "stock", "disponibilite", "rayon", "resume", "nouveaute", "meilleure_vente", "coup_de_coeur", "mot_du_libraire", "reference"],
  ["9782070360024", "L'Étranger", "Albert Camus", "Gallimard", "1972", "8,90", "4", "en stock", "Poche", "", "non", "oui", "non", "", "A-000123"],
];

export function toCsv(rows, delim = ";") {
  const cell = (v) => { const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join(", ") : String(v); return /[";\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return "﻿" + rows.map((r) => r.map(cell).join(delim)).join("\r\n");
}
