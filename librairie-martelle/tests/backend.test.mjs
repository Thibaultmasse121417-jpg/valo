// Integration tests against a running Supabase (local: `supabase start`).
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STAFF_EMAIL/STAFF_PASSWORD, OTHER_EMAIL/OTHER_PASSWORD
import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../supabase/functions/pos-sync/handler.ts";

const URL_ = process.env.SUPABASE_URL, ANON = process.env.SUPABASE_ANON_KEY, SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const skip = !URL_ || !ANON || !SERVICE;

async function token(email, password) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: ANON, "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
  const j = await r.json();
  assert.ok(j.access_token, "login failed for " + email);
  return j.access_token;
}
const rest = (path, { method = "GET", jwt = ANON, body, prefer } = {}) =>
  fetch(`${URL_}/rest/v1/${path}`, { method, headers: { apikey: ANON, authorization: `Bearer ${jwt}`, "content-type": "application/json", ...(prefer ? { prefer } : {}) }, body: body ? JSON.stringify(body) : undefined });

const ISBN_A = "9782070360024", ISBN_B = "9782253004226", ISBN_C = "9782266296700";

test("security and workflow", { skip }, async (t) => {
  const staff = await token(process.env.STAFF_EMAIL, process.env.STAFF_PASSWORD);
  const other = await token(process.env.OTHER_EMAIL, process.env.OTHER_PASSWORD);
  await rest(`books?isbn=in.(${ISBN_A},${ISBN_B},${ISBN_C})`, { method: "DELETE", jwt: staff });

  await t.test("anonymous visitors cannot write", async () => {
    const r = await rest("books", { method: "POST", body: { title: "x" } });
    assert.ok(r.status >= 400);
    const e = await rest("events", { method: "POST", body: { title: "x", starts_at: new Date().toISOString() } });
    assert.ok(e.status >= 400);
    const s = await rest("shop_settings?id=eq.1", { method: "PATCH", body: { phone: "0" }, prefer: "return=representation" });
    const rows = s.ok ? await s.json() : [];
    assert.equal(rows.length, 0);
  });

  await t.test("a logged-in account that is not staff cannot write", async () => {
    const r = await rest("books", { method: "POST", jwt: other, body: { title: "Intrusion" } });
    assert.ok(r.status >= 400);
    const c = await rest("categories?id=eq.poche", { method: "PATCH", jwt: other, body: { title: "Piraté" }, prefer: "return=representation" });
    assert.deepEqual(c.ok ? await c.json() : [], []);
  });

  let draftId;
  await t.test("staff can create books, drafts stay private", async () => {
    const r = await rest("books", { method: "POST", jwt: staff, prefer: "return=representation", body: [
      { isbn: ISBN_A, title: "L'Étranger", authors: ["Albert Camus"], price: 8.9, category_id: "poche", is_new: true, published: true },
      { isbn: ISBN_B, title: "Brouillon", authors: [], price: null, category_id: "poche", is_new: false, published: false },
    ] });
    assert.equal(r.status, 201);
    const rows = await r.json();
    draftId = rows.find((b) => b.isbn === ISBN_B).id;
    const pub = await (await rest(`books?select=title,isbn&isbn=in.(${ISBN_A},${ISBN_B})`)).json();
    assert.deepEqual(pub.map((b) => b.isbn), [ISBN_A]);
    const hidden = await rest("books?select=external_ref,created_by");
    assert.ok(hidden.status >= 400, "internal columns must not be readable anonymously");
  });

  await t.test("duplicate ISBN is rejected", async () => {
    const r = await rest("books", { method: "POST", jwt: staff, body: { isbn: ISBN_A, title: "Doublon" } });
    assert.equal(r.status, 409);
  });

  await t.test("public counts and selection reordering", async () => {
    const counts = await (await rest("rpc/category_counts", { method: "POST", body: {} })).json();
    assert.ok(counts.find((c) => c.category_id === "poche").books >= 1);
    const a = await (await rest(`books?select=id&isbn=eq.${ISBN_A}`, { jwt: staff })).json();
    const r = await rest("rpc/reorder_selection", { method: "POST", jwt: staff, body: { p_kind: "new", p_ids: [a[0].id] } });
    assert.equal(r.status, 204);
    const denied = await rest("rpc/reorder_selection", { method: "POST", jwt: other, body: { p_kind: "new", p_ids: [a[0].id] } });
    assert.ok(denied.status >= 400);
  });

  await t.test("stock sync: token required, updates stock/price, never texts", async () => {
    const env = (k) => ({ SYNC_TOKEN: "test-token-0123456789-abcdef", SUPABASE_URL: URL_, SUPABASE_SERVICE_ROLE_KEY: SERVICE }[k]);
    const call = (body, tok = "test-token-0123456789-abcdef") => handle(new Request("http://x/pos-sync", { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) }), env);
    assert.equal((await call({ items: [{ isbn: ISBN_A }] }, "wrong")).status, 401);
    assert.equal((await call({ items: [] })).status, 400);
    const res = await call({ source: "test", create_missing: true, items: [
      { isbn: "978-2-07-036002-4", price: "9,20", stock_qty: 0 },
      { isbn: ISBN_C, title: "Nouveau du logiciel", stock_qty: 5 },
      { external_ref: "inconnu-999", stock_qty: 1 },
      { foo: 1 },
    ] });
    assert.equal(res.status, 200);
    const out = await res.json();
    assert.equal(out.updated, 1); assert.equal(out.created, 1); assert.equal(out.unknown, 1); assert.equal(out.errors.length, 1);
    const [a] = await (await rest(`books?select=title,price,stock_qty,availability,is_new&isbn=eq.${ISBN_A}`, { jwt: staff })).json();
    assert.equal(+a.price, 9.2); assert.equal(a.stock_qty, 0); assert.equal(a.availability, "out_of_stock");
    assert.equal(a.title, "L'Étranger"); assert.equal(a.is_new, true);
    const [c] = await (await rest(`books?select=published,source&isbn=eq.${ISBN_C}`, { jwt: staff })).json();
    assert.equal(c.published, false); assert.equal(c.source, "sync");
    const anonRpc = await rest("rpc/apply_stock_sync", { method: "POST", body: { p_source: "x", p_items: [] } });
    assert.ok(anonRpc.status >= 400, "the sync function must not be callable from the public API");
  });

  await rest(`books?isbn=in.(${ISBN_A},${ISBN_B},${ISBN_C})`, { method: "DELETE", jwt: staff });
});
