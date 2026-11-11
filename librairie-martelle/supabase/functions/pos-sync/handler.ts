// Stock / price synchronisation endpoint for the shop's management software (POS / ERP).
// Runtime-agnostic (Deno on Supabase, Node ≥ 22 for tests): only uses fetch, Request, Response, crypto.
//
// POST /functions/v1/pos-sync
// Authorization: Bearer <SYNC_TOKEN>
// { "source": "nom-du-logiciel", "create_missing": false,
//   "items": [ { "isbn": "978…", "price": 18.5, "stock_qty": 3 }, { "external_ref": "A-123", "availability": "on_order" } ] }

export type Env = (name: string) => string | undefined;

const MAX_ITEMS = 1000;
const AVAIL = new Set(["in_stock", "low_stock", "on_order", "preorder", "out_of_stock"]);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export function normalizeIsbn(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const s = String(input).toUpperCase().replace(/[^0-9X]/g, "");
  const c13 = (d: string) => { let t = 0; for (let i = 0; i < 12; i++) t += +d[i] * (i % 2 ? 3 : 1); return String((10 - (t % 10)) % 10); };
  if (s.length === 13 && /^97[89]\d{10}$/.test(s)) return c13(s) === s[12] ? s : null;
  if (s.length === 10 && /^\d{9}[\dX]$/.test(s)) {
    let t = 0;
    for (let i = 0; i < 10; i++) t += (s[i] === "X" ? 10 : +s[i]) * (10 - i);
    if (t % 11) return null;
    const core = "978" + s.slice(0, 9);
    return core + c13(core);
  }
  return null;
}

/** Constant-time string comparison. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

export async function handle(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "Méthode non autorisée : utilisez POST." });
  const token = env("SYNC_TOKEN");
  const url = env("SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || token.length < 24 || !url || !serviceKey) return json(503, { error: "Synchronisation non configurée (SYNC_TOKEN de 24 caractères minimum requis)." });

  const auth = req.headers.get("authorization") || "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!given || !(await safeEqual(given, token))) return json(401, { error: "Jeton invalide." });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "Corps JSON invalide." }); }
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items || !items.length) return json(400, { error: "« items » doit être une liste non vide." });
  if (items.length > MAX_ITEMS) return json(413, { error: `Maximum ${MAX_ITEMS} articles par appel.` });

  const clean = items.map((it: any) => {
    const out: Record<string, unknown> = {};
    if (it && typeof it === "object") {
      const isbn = normalizeIsbn(it.isbn ?? it.ean);
      if (isbn) out.isbn = isbn;
      if (typeof it.external_ref === "string" || typeof it.external_ref === "number") out.external_ref = String(it.external_ref).slice(0, 120);
      const price = typeof it.price === "string" ? Number(it.price.replace(",", ".")) : it.price;
      if (typeof price === "number" && Number.isFinite(price) && price >= 0) out.price = price;
      const qty = typeof it.stock_qty === "string" ? Number(it.stock_qty) : it.stock_qty;
      if (typeof qty === "number" && Number.isFinite(qty)) out.stock_qty = Math.max(0, Math.floor(qty));
      if (typeof it.availability === "string" && AVAIL.has(it.availability)) out.availability = it.availability;
      if (typeof it.title === "string" && it.title.trim()) out.title = it.title.trim().slice(0, 300);
    }
    return out;
  });

  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/apply_stock_sync`, {
    method: "POST",
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, "content-type": "application/json" },
    body: JSON.stringify({ p_source: String(body.source || "logiciel").slice(0, 80), p_items: clean, p_create_missing: body.create_missing === true }),
  });
  const out = await res.json().catch(() => null);
  if (!res.ok) return json(502, { error: "Échec de la mise à jour en base.", detail: out?.message || null });
  return json(200, out);
}
