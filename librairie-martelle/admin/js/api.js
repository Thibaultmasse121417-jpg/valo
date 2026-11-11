// Data access layer: every read/write goes through Supabase (Postgres + RLS, Storage, Auth).
const cfg = window.MARTELLE_CONFIG || {};
export const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
export const sb = configured
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export const BOOK_COLS = "id,isbn,title,subtitle,authors,authors_text,publisher,published_date,page_count,language,description,cover_path,cover_url,cover_credit,price,availability,stock_qty,category_id,is_new,is_bestseller,is_staff_pick,new_rank,bestseller_rank,pick_rank,staff_note,staff_name,published,source,metadata_source,external_ref,stock_synced_at,created_at,updated_at";
export const LIST_COLS = "id,isbn,title,authors_text,publisher,cover_path,cover_url,price,availability,stock_qty,category_id,is_new,is_bestseller,is_staff_pick,published,updated_at";

/** Throw a readable French message for Supabase errors. */
export function check({ data, error, count }) {
  if (error) {
    const m = error.message || "";
    let msg = "Une erreur est survenue : " + m;
    if (error.code === "23505" && /isbn/.test(m + (error.details || ""))) msg = "Un livre avec cet ISBN existe déjà dans le catalogue.";
    else if (error.code === "42501" || /row-level security/.test(m)) msg = "Action refusée : votre compte n'a pas les droits nécessaires.";
    else if (error.code === "23514") msg = "Une valeur saisie n'est pas acceptée (format ou longueur). Vérifiez le formulaire.";
    else if (/Failed to fetch|NetworkError/i.test(m)) msg = "Connexion au serveur impossible. Vérifiez votre connexion internet.";
    const e = new Error(msg);
    e.code = error.code;
    e.raw = error;
    throw e;
  }
  return count !== undefined && count !== null ? { data, count } : data;
}

export const publicUrl = (path) => (path ? sb.storage.from("media").getPublicUrl(path).data.publicUrl : null);
export const coverOf = (b) => (b ? (b.cover_path ? publicUrl(b.cover_path) : b.cover_url || null) : null);

/* ---------------- auth ---------------- */
export async function currentStaff() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data } = await sb.from("staff").select("user_id,display_name,role").eq("user_id", session.user.id).maybeSingle();
  return data ? { ...data, email: session.user.email } : { denied: true, email: session.user.email };
}

/* ---------------- categories ---------------- */
let catCache = null;
export async function categories(force = false) {
  if (catCache && !force) return catCache;
  catCache = check(await sb.from("categories").select("*").order("position"));
  return catCache;
}
export async function updateCategory(id, patch) {
  const row = check(await sb.from("categories").update(patch).eq("id", id).select().single());
  catCache = null;
  return row;
}

/* ---------------- books ---------------- */
const clean = (q) => q.replace(/[,()"'*%\\]/g, " ").trim();

export async function listBooks({ q = "", category = "", filter = "", sort = "recent", page = 0, size = 50 } = {}) {
  let r = sb.from("books").select(LIST_COLS, { count: "exact" });
  const s = clean(q);
  if (s) {
    const digits = s.replace(/[^0-9Xx]/g, "");
    const parts = [`title.ilike.%${s}%`, `authors_text.ilike.%${s}%`, `publisher.ilike.%${s}%`, `external_ref.ilike.%${s}%`];
    if (digits.length >= 4) parts.push(`isbn.ilike.%${digits}%`);
    r = r.or(parts.join(","));
  }
  if (category === "_none") r = r.is("category_id", null);
  else if (category) r = r.eq("category_id", category);
  const F = {
    published: () => r.eq("published", true), drafts: () => r.eq("published", false),
    new: () => r.eq("is_new", true), best: () => r.eq("is_bestseller", true), picks: () => r.eq("is_staff_pick", true),
    out: () => r.eq("availability", "out_of_stock"), noprice: () => r.is("price", null), nocat: () => r.is("category_id", null),
  };
  if (F[filter]) r = F[filter]();
  if (sort === "title") r = r.order("title", { ascending: true });
  else if (sort === "price") r = r.order("price", { ascending: true, nullsFirst: false });
  else r = r.order("updated_at", { ascending: false });
  r = r.range(page * size, page * size + size - 1);
  return check(await r);
}

export async function getBook(id) { return check(await sb.from("books").select(BOOK_COLS).eq("id", id).single()); }
export async function findByIsbn(isbn) { return check(await sb.from("books").select("id,title").eq("isbn", isbn).maybeSingle()); }
export async function saveBook(id, rec) {
  return id
    ? check(await sb.from("books").update(rec).eq("id", id).select(BOOK_COLS).single())
    : check(await sb.from("books").insert(rec).select(BOOK_COLS).single());
}
export async function patchBooks(ids, patch) { return check(await sb.from("books").update(patch).in("id", ids).select("id")); }
export async function deleteBooks(ids) {
  const rows = check(await sb.from("books").select("cover_path").in("id", ids));
  check(await sb.from("books").delete().in("id", ids));
  const paths = rows.map((r) => r.cover_path).filter(Boolean);
  if (paths.length) await sb.storage.from("media").remove(paths);
}
export async function searchBooks(q, limit = 8) {
  const s = clean(q);
  if (!s) return [];
  const digits = s.replace(/\D/g, "");
  const parts = [`title.ilike.%${s}%`, `authors_text.ilike.%${s}%`];
  if (digits.length >= 4) parts.push(`isbn.ilike.%${digits}%`);
  return check(await sb.from("books").select(LIST_COLS).or(parts.join(",")).order("updated_at", { ascending: false }).limit(limit));
}
export async function selection(kind) {
  const col = { new: ["is_new", "new_rank"], best: ["is_bestseller", "bestseller_rank"], picks: ["is_staff_pick", "pick_rank"] }[kind];
  return check(await sb.from("books").select(LIST_COLS + ",staff_note,staff_name,new_rank,bestseller_rank,pick_rank").eq(col[0], true).order(col[1]).order("updated_at", { ascending: false }).limit(200));
}
export async function reorderSelection(kind, ids) { return check(await sb.rpc("reorder_selection", { p_kind: kind, p_ids: ids })); }
export async function stats() { return check(await sb.rpc("admin_stats")) || {}; }
export async function allBooksForExport() {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const rows = check(await sb.from("books").select(BOOK_COLS).order("title").range(from, from + 999));
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}
/** Which of these ISBNs already exist? */
export async function existingIsbns(isbns) {
  const found = new Set();
  for (let i = 0; i < isbns.length; i += 300) {
    const rows = check(await sb.from("books").select("isbn").in("isbn", isbns.slice(i, i + 300)));
    rows.forEach((r) => found.add(r.isbn));
  }
  return found;
}
export async function upsertBooks(rows, { update = true } = {}) {
  return check(await sb.from("books").upsert(rows, { onConflict: "isbn", ignoreDuplicates: !update }).select("id,isbn"));
}
export async function insertBooks(rows) { return check(await sb.from("books").insert(rows).select("id")); }
export async function logImport(job) { return check(await sb.from("import_jobs").insert(job).select("id").single()); }
export async function recentImports() { return check(await sb.from("import_jobs").select("*").order("created_at", { ascending: false }).limit(10)); }

/* ---------------- images ---------------- */
/** Resize to max 1000px (long side), encode as WebP (JPEG fallback), upload to the public « media » bucket. */
export async function uploadImage(fileOrBlob, folder = "covers") {
  const blob = await resizeImage(fileOrBlob, 1000);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;
  check(await sb.storage.from("media").upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false }));
  return path;
}
export async function removeImage(path) { if (path) await sb.storage.from("media").remove([path]); }

export async function resizeImage(file, max) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const webp = await new Promise((r) => c.toBlob(r, "image/webp", 0.86));
  if (webp && webp.type === "image/webp") return webp;
  return new Promise((r) => c.toBlob(r, "image/jpeg", 0.88));
}
/** Copy a remote cover (CORS-enabled source such as Open Library) into our storage. Returns path or null. */
export async function copyRemoteCover(url) {
  try {
    const r = await fetch(url, { mode: "cors" });
    if (!r.ok) return null;
    const b = await r.blob();
    if (!/^image\//.test(b.type) || b.size < 1500) return null; // Open Library returns a tiny placeholder when missing
    return await uploadImage(b, "covers");
  } catch (_) { return null; }
}

/* ---------------- events ---------------- */
export async function listEvents({ past = false } = {}) {
  const now = new Date().toISOString();
  let r = sb.from("events").select("*, book:books(id,title)");
  r = past ? r.lt("starts_at", now).order("starts_at", { ascending: false }).limit(100) : r.gte("starts_at", new Date(Date.now() - 6 * 3600e3).toISOString()).order("starts_at");
  return check(await r);
}
export async function getEvent(id) { return check(await sb.from("events").select("*, book:books(id,title,authors_text,cover_path,cover_url)").eq("id", id).single()); }
export async function saveEvent(id, rec) {
  return id ? check(await sb.from("events").update(rec).eq("id", id).select().single()) : check(await sb.from("events").insert(rec).select().single());
}
export async function deleteEvent(id) {
  const ev = check(await sb.from("events").select("image_path").eq("id", id).single());
  check(await sb.from("events").delete().eq("id", id));
  if (ev.image_path) await removeImage(ev.image_path);
}

/* ---------------- settings & sync ---------------- */
export async function getSettings() { return check(await sb.from("shop_settings").select("*").eq("id", 1).single()); }
export async function saveSettings(patch) { return check(await sb.from("shop_settings").update(patch).eq("id", 1).select().single()); }
export async function syncRuns() { return check(await sb.from("sync_runs").select("*").order("created_at", { ascending: false }).limit(20)); }
