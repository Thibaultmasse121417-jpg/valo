// LOCAL TESTING ONLY — fills a *local* Supabase with real books taken from Open Library
// (real titles, authors, publishers, covers). No price is invented: prices stay empty.
// Never run against the production project.  Usage:
//   SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=... node tools/seed-local-test-data.mjs
const URL_ = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY || !/127\.0\.0\.1|localhost/.test(URL_)) { console.error("Local Supabase only (SUPABASE_URL must be localhost)."); process.exit(1); }

const SUBJECTS = {
  litterature: "french fiction", polar: "detective and mystery stories", imaginaire: "science fiction", bd: "comic books, strips, etc.",
  jeunesse: "juvenile fiction", poche: "classics", arts: "art", actualites: "history", voyages: "travel", scolaire: "french language",
  beauxarts: "drawing", jeux: "games",
};
const ok13 = (s) => { if (!/^97[89]\d{10}$/.test(s)) return false; let t = 0; for (let i = 0; i < 12; i++) t += +s[i] * (i % 2 ? 3 : 1); return (10 - (t % 10)) % 10 === +s[12]; };
const year = (d) => (String(d || "").match(/(1[5-9]\d{2}|20\d{2})/) || [])[1] || null;

const rows = [];
for (const [cat, subject] of Object.entries(SUBJECTS)) {
  const r = await fetch(`https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&language=fre&fields=isbn,cover_i&limit=40`);
  const docs = (await r.json()).docs || [];
  let n = 0;
  for (const d of docs) {
    if (n >= 8) break;
    const isbn = (d.isbn || []).find((i) => i.startsWith("9782") && ok13(i));
    if (!isbn || rows.some((x) => x.isbn === isbn)) continue;
    const j = await (await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`)).json();
    const v = j[`ISBN:${isbn}`];
    if (!v || !v.title || !v.cover) continue;
    rows.push({
      isbn, title: v.title.slice(0, 300), subtitle: v.subtitle || null, authors: (v.authors || []).map((a) => a.name).slice(0, 6),
      publisher: v.publishers?.[0]?.name || null, published_date: year(v.publish_date), page_count: v.number_of_pages || null,
      description: typeof v.notes === "string" ? v.notes.slice(0, 2000) : null,
      cover_url: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`, cover_credit: "Couverture : Open Library",
      category_id: cat, availability: "in_stock", published: true, source: "isbn", metadata_source: "Open Library",
      is_new: false, is_bestseller: false, is_staff_pick: false,
    });
    n++;
  }
  console.log(cat, n);
}
rows.slice(0, 8).forEach((b) => (b.is_new = true));
rows.filter((_, i) => i % 7 === 3).slice(0, 6).forEach((b) => (b.is_bestseller = true));
rows.filter((_, i) => i % 9 === 5).slice(0, 3).forEach((b) => (b.is_staff_pick = true));
const res = await fetch(`${URL_}/rest/v1/books?on_conflict=isbn`, { method: "POST", headers: { apikey: KEY, authorization: `Bearer ${KEY}`, "content-type": "application/json", prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
console.log("insert", res.status, await res.text());
