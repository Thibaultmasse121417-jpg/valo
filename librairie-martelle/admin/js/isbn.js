// ISBN utilities and bibliographic lookup from open, authorised sources:
//   • Google Books API (Google APIs Terms of Service; covers are displayed from Google, with credit)
//   • Open Library API (open data; covers may be reused)
// Lookups run in the librarian's browser: no data leaves the shop except the ISBN being searched.

const cfg = () => window.MARTELLE_CONFIG || {};

/** Keep digits (and a final X), convert ISBN-10 to ISBN-13. Returns null when invalid. */
export function normalizeIsbn(input) {
  if (!input) return null;
  const s = String(input).toUpperCase().replace(/[^0-9X]/g, "");
  if (s.length === 13 && /^97[89]\d{10}$/.test(s)) return checksum13(s.slice(0, 12)) === s[12] ? s : null;
  if (s.length === 10 && /^\d{9}[\dX]$/.test(s)) {
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += (s[i] === "X" ? 10 : +s[i]) * (10 - i);
    if (sum % 11 !== 0) return null;
    const core = "978" + s.slice(0, 9);
    return core + checksum13(core);
  }
  return null;
}
function checksum13(d12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += +d12[i] * (i % 2 ? 3 : 1);
  return String((10 - (sum % 10)) % 10);
}
export const formatIsbn = (i) => (i && i.length === 13 ? `${i.slice(0, 3)}-${i.slice(3, 4)}-${i.slice(4, 9)}-${i.slice(9, 12)}-${i[12]}` : i || "");

/** "2024", "2024-05-03", "May 2024", "07-01-1972" → "2024", "2024-05-03", "2024", "1972" */
export function normalizeDate(d) {
  if (!d) return null;
  const s = String(d).trim();
  if (/^\d{4}(-\d{2}(-\d{2})?)?$/.test(s)) return s;
  const m = s.match(/(1[5-9]\d{2}|20\d{2})/);
  return m ? m[1] : null;
}

const stripHtml = (s) => (s ? String(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : s);
const timeout = (ms) => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; };

async function google(isbn) {
  const key = cfg().googleBooksApiKey;
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1${key ? `&key=${encodeURIComponent(key)}` : ""}`;
  const r = await fetch(url, { signal: timeout(8000) });
  if (r.status === 429) throw new Error("google-quota");
  if (!r.ok) return null;
  const j = await r.json();
  const v = j.items?.[0]?.volumeInfo;
  if (!v) return null;
  let cover = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
  if (cover) cover = cover.replace(/^http:/, "https:").replace("&edge=curl", "").replace(/zoom=\d/, "zoom=1");
  return {
    title: v.title || null,
    subtitle: v.subtitle || null,
    authors: v.authors || [],
    publisher: v.publisher || null,
    published_date: normalizeDate(v.publishedDate),
    page_count: v.pageCount || null,
    language: v.language || null,
    description: stripHtml(v.description) || null,
    cover_external: cover,
    cover_credit: cover ? "Couverture : Google Books" : null,
  };
}

async function openLibrary(isbn) {
  const r = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`, { signal: timeout(8000) });
  if (!r.ok) return null;
  const j = await r.json();
  const v = j[`ISBN:${isbn}`];
  if (!v) return null;
  return {
    title: v.title || null,
    subtitle: v.subtitle || null,
    authors: (v.authors || []).map((a) => a.name).filter(Boolean),
    publisher: v.publishers?.[0]?.name || null,
    published_date: normalizeDate(v.publish_date),
    page_count: v.number_of_pages || null,
    language: null,
    description: typeof v.notes === "string" ? v.notes : v.notes?.value || null,
    cover_openlibrary: v.cover?.large || v.cover?.medium ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null,
  };
}

/**
 * Look a book up by ISBN. Merges sources field by field (Google first for summaries,
 * Open Library for covers that may be copied into the shop's own storage).
 * Returns { found, data, sources, warnings }.
 */
export async function lookupIsbn(isbnInput) {
  const isbn = normalizeIsbn(isbnInput);
  if (!isbn) return { found: false, invalid: true, data: null, sources: [], warnings: [] };
  const warnings = [];
  const [g, o] = await Promise.all([
    google(isbn).catch((e) => { warnings.push(e.message === "google-quota" ? "Google Books : quota atteint, réessayez plus tard ou ajoutez une clé API." : "Google Books indisponible."); return null; }),
    openLibrary(isbn).catch(() => { warnings.push("Open Library indisponible."); return null; }),
  ]);
  const sources = [g && "Google Books", o && "Open Library"].filter(Boolean);
  if (!g && !o) return { found: false, isbn, data: null, sources, warnings };
  const pick = (k) => (g && g[k] && (!Array.isArray(g[k]) || g[k].length) ? g[k] : o && o[k] && (!Array.isArray(o[k]) || o[k].length) ? o[k] : null);
  const data = {
    isbn,
    title: pick("title"),
    subtitle: pick("subtitle"),
    authors: pick("authors") || [],
    publisher: (o && o.publisher) || (g && g.publisher) || null,
    published_date: pick("published_date"),
    page_count: pick("page_count"),
    language: (g && g.language) || null,
    description: pick("description"),
    cover_candidates: [
      o?.cover_openlibrary && { url: o.cover_openlibrary, credit: "Couverture : Open Library", copy: true },
      g?.cover_external && { url: g.cover_external, credit: g.cover_credit, copy: false },
    ].filter(Boolean),
    metadata_source: sources.join(" + "),
  };
  return { found: true, isbn, data, sources, warnings };
}

/** Camera barcode scanning (EAN-13) when the browser supports it (Chrome / Android, Safari 17+ partially). */
export const canScan = () => "BarcodeDetector" in window && navigator.mediaDevices?.getUserMedia;

export async function scanBarcode() {
  const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a"] });
  const wrap = document.createElement("div");
  wrap.className = "scan";
  wrap.innerHTML = `<div style="display:grid;gap:14px;justify-items:center"><div class="frame"><video playsinline muted></video></div>
    <p style="color:#fff;margin:0">Placez le code-barres du livre dans le cadre</p><button class="btn">Annuler</button></div>`;
  document.body.append(wrap);
  const video = wrap.querySelector("video");
  let stream, stop = false;
  const cleanup = () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); wrap.remove(); };
  return new Promise(async (resolve) => {
    wrap.querySelector("button").onclick = () => { cleanup(); resolve(null); };
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;
      await video.play();
      const loop = async () => {
        if (stop) return;
        try {
          const codes = await detector.detect(video);
          const ok = codes.map((c) => normalizeIsbn(c.rawValue)).find(Boolean);
          if (ok) { cleanup(); resolve(ok); return; }
        } catch (_) {}
        setTimeout(loop, 180);
      };
      loop();
    } catch (e) {
      cleanup();
      resolve(null);
    }
  });
}
