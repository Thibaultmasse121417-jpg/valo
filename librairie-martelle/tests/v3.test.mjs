// v3 integration tests: archiving, optional availability, photos rights, editable content, server-rendered book pages.
// Same env as backend.test.mjs. Run: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../server/book-page.mjs";

const URL_ = process.env.SUPABASE_URL, ANON = process.env.SUPABASE_ANON_KEY;
const skip = !URL_ || !ANON || !process.env.STAFF_EMAIL;
const tok = async (email, password) => (await (await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: ANON, "content-type": "application/json" }, body: JSON.stringify({ email, password }) })).json()).access_token;
const rest = (path, { method = "GET", jwt = ANON, body, prefer } = {}) => fetch(`${URL_}/rest/v1/${path}`, { method, headers: { apikey: ANON, authorization: `Bearer ${jwt}`, "content-type": "application/json", ...(prefer ? { prefer } : {}) }, body: body ? JSON.stringify(body) : undefined });
const ISBN = "9782070368228";
const env = () => ({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, SITE_URL: "https://www.exemple.fr", SITE_INDEXABLE: "false" });
const page = (path) => handle(new Request("https://www.exemple.fr" + path), env());

test("v3 rules", { skip }, async (t) => {
  const staff = await tok(process.env.STAFF_EMAIL, process.env.STAFF_PASSWORD);
  const other = await tok(process.env.OTHER_EMAIL, process.env.OTHER_PASSWORD);
  await rest(`books?isbn=eq.${ISBN}`, { method: "DELETE", jwt: staff });
  const [bk] = await (await rest("books", { method: "POST", jwt: staff, prefer: "return=representation", body: { isbn: ISBN, title: "Test v3 Été", authors: ["Auteur Éprouvé"], category_id: "poche", genre: "Roman" } })).json();

  await t.test("availability is empty unless entered; accent-free search", async () => {
    assert.equal(bk.availability, null);
    const r = await (await rest(`books?select=title&search_text=ilike.*test%20v3%20ete*`)).json();
    assert.equal(r.length, 1);
  });

  await t.test("server-rendered page: canonical redirect, JSON-LD, no invented offer", async () => {
    const red = await page(`/livre/${ISBN}`);
    assert.equal(red.status, 301);
    assert.equal(red.headers.get("location"), `/livre/${ISBN}-test-v3-ete`);
    const ok = await page(`/livre/${ISBN}-test-v3-ete`);
    assert.equal(ok.status, 200);
    const html = await ok.text();
    assert.match(html, /<h1 class="bk-title" itemprop="name">Test v3 Été<\/h1>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www.exemple.fr\/livre\/9782070368228-test-v3-ete">/);
    assert.match(html, /noindex/);
    const ld = JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/)[1]);
    assert.equal(ld["@type"], "Book"); assert.equal(ld.isbn, ISBN); assert.equal(ld.offers, undefined, "no price → no offer");
    assert.doesNotMatch(html, /class="av /, "no availability shown when unknown");
    assert.equal((await page("/livre/9780000000002")).status, 404);
    const sm = await (await page("/sitemap.xml")).text();
    assert.match(sm, /livre\/9782070368228-test-v3-ete/);
  });

  await t.test("escaping: no HTML injection through book data", async () => {
    await rest(`books?id=eq.${bk.id}`, { method: "PATCH", jwt: staff, body: { description: '<script>alert(1)</script><img src=x onerror=alert(1)>' } });
    const html = await (await page(`/livre/${ISBN}-test-v3-ete`)).text();
    assert.doesNotMatch(html, /<script>alert/); assert.match(html, /&lt;script&gt;alert/);
  });

  await t.test("archived books disappear from the public API and pages", async () => {
    await rest(`books?id=eq.${bk.id}`, { method: "PATCH", jwt: staff, body: { archived_at: new Date().toISOString() } });
    assert.deepEqual(await (await rest(`books?select=id&id=eq.${bk.id}`)).json(), []);
    assert.equal((await page(`/livre/${ISBN}-test-v3-ete`)).status, 404);
    assert.equal((await (await rest(`books?select=id&id=eq.${bk.id}`, { jwt: staff })).json()).length, 1, "still visible to staff");
  });

  await t.test("photos are public only when published with confirmed rights", async () => {
    const [ph] = await (await rest("photos", { method: "POST", jwt: staff, prefer: "return=representation", body: { path: "photos/test.webp", alt: "Vitrine de test", published: true, rights_confirmed: false } })).json();
    assert.deepEqual(await (await rest(`photos?select=id&id=eq.${ph.id}`)).json(), []);
    await rest(`photos?id=eq.${ph.id}`, { method: "PATCH", jwt: staff, body: { rights_confirmed: true } });
    assert.equal((await (await rest(`photos?select=id&id=eq.${ph.id}`)).json()).length, 1);
    assert.ok((await rest("photos", { method: "POST", jwt: other, body: { path: "x", alt: "intrus" } })).status >= 400);
    await rest(`photos?id=eq.${ph.id}`, { method: "DELETE", jwt: staff });
  });

  await t.test("site texts: public read, staff-only write", async () => {
    assert.equal((await rest("site_content", { method: "POST", body: { key: "home.tagline", value: "piratage" } })).status >= 400, true);
    assert.equal((await rest("site_content", { method: "POST", jwt: other, body: { key: "home.tagline", value: "piratage" } })).status >= 400, true);
    const ok = await rest("site_content?on_conflict=key", { method: "POST", jwt: staff, prefer: "resolution=merge-duplicates", body: { key: "home.tagline", value: "Texte de test" } });
    assert.ok(ok.status < 300);
    const rows = await (await rest("site_content?select=value&key=eq.home.tagline")).json();
    assert.equal(rows[0].value, "Texte de test");
    await rest("site_content?key=eq.home.tagline", { method: "DELETE", jwt: staff });
  });

  await rest(`books?id=eq.${bk.id}`, { method: "DELETE", jwt: staff });
});
