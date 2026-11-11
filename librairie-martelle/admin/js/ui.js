// Small UI toolkit shared by every admin screen.

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function html(strings, ...vals) {
  return strings.reduce((out, s, i) => out + s + (i < vals.length ? (vals[i]?.__raw ?? esc(vals[i])) : ""), "");
}
export const raw = (s) => ({ __raw: String(s ?? "") });

export function frag(markup) {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  return t.content;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function debounce(fn, ms = 300) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function toast(msg, kind = "ok", ms = 3800) {
  const box = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  box.append(el);
  setTimeout(() => el.remove(), ms);
}

export function confirmDialog({ title, body = "", ok = "Confirmer", danger = false }) {
  return new Promise((resolve) => {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = html`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
      <h2 id="mdl-t">${title}</h2>${body ? raw(`<p class="muted" style="margin:0">${esc(body)}</p>`) : ""}
      <div class="row end"><button class="btn" data-a="no">Annuler</button><button class="btn ${danger ? "danger" : "primary"}" data-a="yes">${ok}</button></div></div>`;
    const done = (v) => { bg.remove(); document.removeEventListener("keydown", onKey); resolve(v); };
    const onKey = (e) => { if (e.key === "Escape") done(false); };
    bg.addEventListener("click", (e) => { if (e.target === bg) done(false); const a = e.target.closest("[data-a]"); if (a) done(a.dataset.a === "yes"); });
    document.addEventListener("keydown", onKey);
    document.body.append(bg);
    bg.querySelector('[data-a="yes"]').focus();
  });
}

export const AVAIL = {
  in_stock: "En stock",
  low_stock: "Stock faible",
  on_order: "Sur commande",
  preorder: "À paraître",
  out_of_stock: "Indisponible",
};
export const EVENT_KINDS = {
  dedicace: "Dédicace",
  rencontre: "Rencontre",
  lecture: "Lecture",
  atelier: "Atelier",
  jeu: "Jeux",
  autre: "Autre",
};

const nf = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const fmtPrice = (p) => (p === null || p === undefined || p === "" ? "—" : nf.format(+p));
/** "18,50 €" | "18.5" | "18" → 18.5 ; empty → null ; invalid → NaN */
export function parsePrice(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s|€|eur/gi, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

export const fmtDate = (d, opts = { day: "numeric", month: "long", year: "numeric" }) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ...opts }).format(new Date(d));

export function thumbHTML(book, cls = "thumb") {
  const src = book && (book._cover || book.cover);
  return src ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy">` : `<div class="${cls}">${esc((book?.title || "").slice(0, 28))}</div>`;
}

export const I = {
  home: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l7-6 7 6v8H3z"/><path d="M8 17v-5h4v5"/></svg>',
  books: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 3h3v14H4zM8 3h3v14H8zM12.5 4l2.8-.8 3.2 13-2.8.8z"/></svg>',
  plus: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 4v12M4 10h12"/></svg>',
  star: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z"/></svg>',
  upload: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13V3M6 7l4-4 4 4M3 13v4h14v-4"/></svg>',
  cal: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>',
  shelf: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17h16M4 17V5h2v12M7 17V3h2v14M11 17V6h2v11M14.5 17l-1-9 2-.3 1 9.3"/></svg>',
  clock: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7.5"/><path d="M10 5.5V10l3 2"/></svg>',
  sync: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6.5 6.5 0 00-11.6-2.5M4 12a6.5 6.5 0 0011.6 2.5"/><path d="M4 2.5v3.5h3.5M16 17.5V14h-3.5"/></svg>',
  ext: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 3h6v6M17 3l-8 8M8 4H3v13h13v-5"/></svg>',
  out: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3H3v14h5M13 6l4 4-4 4M17 10H8"/></svg>',
  up: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12l5-5 5 5"/></svg>',
  down: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8l5 5 5-5"/></svg>',
  x: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  edit: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.5 3.5l3 3L7 16H4v-3z"/></svg>',
  scan: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6V3h3M15 3h3v3M18 14v3h-3M5 17H2v-3M5 6v8M8 6v8M11 6v8M14 6v8"/></svg>',
  search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg>',
  menu: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h14M3 10h14M3 14h14"/></svg>',
  dl: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3v10M6 9l4 4 4-4M3 15v2h14v-2"/></svg>',
};

/** Download a string as a file. */
export function download(name, text, type = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/** Warn before leaving a form with unsaved edits. */
export function guardDirty(form) {
  let dirty = false;
  form.addEventListener("input", () => (dirty = true));
  form.addEventListener("change", () => (dirty = true));
  const onBefore = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
  addEventListener("beforeunload", onBefore);
  return {
    get dirty() { return dirty; },
    clean() { dirty = false; },
    dispose() { removeEventListener("beforeunload", onBefore); },
  };
}
