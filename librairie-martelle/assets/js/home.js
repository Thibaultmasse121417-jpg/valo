// Home page: 3D curved shelf of the 12 rayons, sections fed by the live catalogue.
import { C, DARK, BOOKS, DEMO, PICKS, f2, esc, wrap, motif, coverArt, spineArt, backArt, svgMarkup } from "./art.js";
import { CFG, LIVE, API, PUB_COLS, api, coverSrc, SHOP, priceTxt, AVAIL, avHTML, KINDS, deName, telHref, bookPath, loadSettings, loadContent, applyContent, bookOrderLink, reserveMailto, DAYS, hm, hoursTable, shopStatus, dfmt, mediaUrl } from "./data.js";

(() => {
"use strict";
const ART = BOOKS.map((b) => ({ cover: coverArt(b), spine: spineArt(b), back: backArt(b) }));
const N = BOOKS.length, COPIES = 3, TOTAL = N * COPIES, START = N;


if ("scrollRestoration" in history) history.scrollRestoration = "manual";
/* ================= helpers ================= */
const $ = (id) => document.getElementById(id);
const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const EASE = "cubic-bezier(.2,.8,.2,1)", SHEET_EASE = "cubic-bezier(.76,0,.18,1)";
const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
const mqFine = matchMedia("(pointer:fine)");
let reduce = mqReduce.matches;
mqReduce.addEventListener?.("change", (e) => (reduce = e.matches));
const rel = (v, s) => { let r = mod(v - s, TOTAL); if (r >= TOTAL / 2) r -= TOTAL; return r; };
const isMobile = () => innerWidth < 768;

/* ================= live catalogue (Supabase, public read-only API) ================= */
const CFG = window.MARTELLE_CONFIG || {};
const LIVE = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey);
const API = LIVE ? String(CFG.supabaseUrl).replace(/\/$/, "") : "";
const PUB_COLS = "id,isbn,title,subtitle,authors,authors_text,publisher,published_date,page_count,description,cover_path,cover_url,cover_credit,price,availability,category_id,is_new,is_bestseller,is_staff_pick,staff_note,staff_name";
async function api(path, { method = "GET", body, count = false } = {}) {
  const r = await fetch(`${API}/rest/v1/${path}`, {
    method, cache: "no-store", body: body ? JSON.stringify(body) : undefined,
    headers: { apikey: CFG.supabaseAnonKey, authorization: `Bearer ${CFG.supabaseAnonKey}`, "content-type": "application/json", ...(count ? { prefer: "count=exact" } : {}) },
  });
  if (!r.ok) throw new Error("API " + r.status);
  const data = await r.json();
  if (!count) return data;
  const cr = r.headers.get("content-range");
  return { data, total: cr && cr.includes("/") ? +cr.split("/")[1] : data.length };
}
const coverSrc = (b) => (b.cover_path ? `${API}/storage/v1/object/public/media/${b.cover_path.split("/").map(encodeURIComponent).join("/")}` : b.cover_url || null);
const SHOP = { phone: "03 22 71 54 54", email: "commandes@librairiemartelle.com", order_url: "https://www.leslibraires.fr/presentation/librairie-martelle/", book_url_template: null };
const nfEur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const priceTxt = (p) => (p === null || p === undefined ? "Prix en librairie" : nfEur.format(+p));
const AVAIL = { in_stock: "En stock", low_stock: "Derniers exemplaires", on_order: "Sur commande", preorder: "À paraître", out_of_stock: "Indisponible" };
const KINDS = { dedicace: "Dédicace", rencontre: "Rencontre", lecture: "Lecture", atelier: "Atelier", jeu: "Jeux", autre: "Événement" };
const deName = (n) => (/^[aeiouyhàâéèêëîïôöûü]/i.test(n) ? "d’" : "de ") + n;
const telHref = (p) => "tel:" + (String(p).replace(/[^0-9+]/g, "").replace(/^0/, "+33"));
const COUNTS = {};
let homeLoadedAt = 0, LIVE_PICKS = null;
function loadHome() {
  homeLoadedAt = Date.now();
  const since = new Date(Date.now() - 3 * 3600e3).toISOString();
  const sel = (flag, rank, n) => api(`books?select=${PUB_COLS}&${flag}=eq.true&published=eq.true&order=${rank}.asc,updated_at.desc&limit=${n}`);
  return Promise.allSettled([
    api("categories?select=id,title,short_title,kicker,description,location_hint&order=position"),
    api("shop_settings?select=opening_hours,closures,phone,email,address,order_url,book_url_template,announcement"),
    api("rpc/category_counts", { method: "POST", body: {} }),
    sel("is_new", "new_rank", 12), sel("is_bestseller", "bestseller_rank", 10), sel("is_staff_pick", "pick_rank", 6),
    api(`events?select=id,title,kind,starts_at,ends_at,location,guests,description,booking_url,booking_required,image_path,book:books(id,title,cover_path,cover_url)&published=eq.true&starts_at=gte.${encodeURIComponent(since)}&order=starts_at.asc&limit=6`),
  ]).then((r) => r.map((x) => (x.status === "fulfilled" ? x.value : null)));
}
const homeData = LIVE ? loadHome() : null;

/* ================= shelf ================= */
const stage = $("stage"), shelf = $("shelf"), hero = $("accueil"), heroIn = $("heroIn");
const tapes = [];
for (let v = 0; v < TOTAL; v++) {
  const i = v % N, b = BOOKS[i];
  const t = document.createElement("div");
  t.className = "book"; t.dataset.v = v; t.style.setProperty("--bh", b.h);
  const sp = document.createElement("div"); sp.className = "face sp"; sp.innerHTML = svgMarkup(ART[i].spine);
  const cv = document.createElement("div"); cv.className = "face cv"; cv.innerHTML = svgMarkup(ART[i].cover);
  const bk = document.createElement("div"); bk.className = "face bk"; bk.innerHTML = svgMarkup(ART[i].back);
  sp.setAttribute("role", "img"); sp.setAttribute("aria-label", `Rayon ${b.no} : ${b.title}`);
  t.append(sp, cv, bk); stage.append(t);
  tapes.push({ el: t, sp, cv, bk, lift: 0, vis: true, sSp: -1, sCv: -1, sBk: -1 });
}
const ticks = $("ticks");
for (let i = 0; i < N; i++) {
  const pct = (i / (N - 1)) * 100;
  const tk = document.createElement("i"); tk.className = "tk mj"; tk.style.left = pct + "%"; ticks.append(tk);
  if (i < N - 1) for (let k = 1; k < 4; k++) { const mn = document.createElement("i"); mn.className = "tk mn"; mn.style.left = pct + (k / 4) * (100 / (N - 1)) + "%"; ticks.append(mn); }
  const l = document.createElement("span");
  l.className = "ty" + (i === 0 ? " first" : i === N - 1 ? " last" : "");
  l.style.left = pct + "%"; l.innerHTML = `<b>${BOOKS[i].no}</b><span>${esc(BOOKS[i].short)}</span>`;
  ticks.append(l);
}

/* geometry */
const P = 1400;
let H, ws, d, gap, U, XS = [0], W, VH, cyPx, heroH;
const B = (r) => Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * .5;
const F = (r) => r * (ws + gap) + (d - ws + 1.4 * gap) * B(r);
const scl = (u) => 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
function xsc(u) { const a = Math.abs(u) / 2, i = Math.floor(a), f = a - i, n = XS.length - 1; return Math.sign(u) * (i >= n ? XS[n] : XS[i] + (XS[i + 1] - XS[i]) * f); }

/* state */
const INTRO = !reduce;
let s = INTRO ? START - 9.5 : START, T = START;
let held = INTRO, sweep = INTRO, interacted = false;
let active = -1, hoverV = -1;
let tiltX = 0, tiltY = 0, mx = -1, my = -1, hasMouse = false, hoverEl = null;
let dragging = false, downX = 0, downY = 0, T0 = 0, pointerDown = false, downTape = null, pid = null, justDragged = false;
let current = null, openT = 0, closing = false, originEl = null;
let dotIdx = mod(START, N), sy = scrollY, heroVisible = true;
const curPos = { x: 0, y: 0 };
const sheetOpen = () => !!current;

/* caption swap */
const cTitle = $("cTitle"), cSub = $("cSub"), cYear = $("cYear");
function swapLine(mask, content, dir) {
  const olds = [...mask.children];
  let n;
  if (content instanceof Element) n = content; else { n = document.createElement("span"); n.textContent = content; }
  mask.append(n);
  if (reduce || !dir) { olds.forEach((o) => o.remove()); return; }
  n.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: "translateY(0%)" }], { duration: 650, easing: EASE, fill: "both" });
  olds.forEach((o) => {
    const cur = getComputedStyle(o).transform;
    o.getAnimations().forEach((a) => a.cancel());
    o.animate([{ transform: cur === "none" ? "translateY(0%)" : cur }, { transform: `translateY(${-dir * 105}%)` }], { duration: 650, easing: EASE, fill: "both" }).onfinish = () => o.remove();
  });
}
function setCaption(i, dir) {
  const b = BOOKS[i];
  swapLine(cTitle, b.title, dir); swapLine(cSub, b.kicker, dir); swapLine(cYear, `Rayon ${b.no} / ${String(N).padStart(2, "0")}`, dir);
  $("tlhit").setAttribute("aria-valuenow", i + 1); $("tlhit").setAttribute("aria-valuetext", b.title);
}

/* interaction */
const settled = () => Math.abs(T - s) < .3;
function touched() { if (interacted) return; interacted = true; $("hint").classList.add("gone"); }
function step(n) { if (sheetOpen() || held) return; touched(); T = Math.round(T) + n; }
$("prev").addEventListener("click", (e) => { step(-1); if (e.detail) e.currentTarget.blur(); });
$("next").addEventListener("click", (e) => { step(1); if (e.detail) e.currentTarget.blur(); });
function tapeClick(v) {
  if (sheetOpen() || held) return;
  touched();
  const r = rel(v, s);
  if (Math.abs(r) < .5) openDetail(); else T = Math.round(T + r);
}
shelf.addEventListener("pointerdown", (e) => {
  if (sheetOpen() || held || e.button > 0) return;
  pointerDown = true; dragging = false; downX = e.clientX; downY = e.clientY; T0 = T; pid = e.pointerId;
  const t = e.target.closest(".book"); downTape = t ? +t.dataset.v : null;
});
addEventListener("pointermove", (e) => {
  mx = e.clientX; my = e.clientY; hoverEl = e.target;
  if (e.pointerType === "mouse" && !hasMouse) { hasMouse = true; curPos.x = mx; curPos.y = my; $("cur").classList.add("on"); }
  if (!pointerDown || e.pointerId !== pid) return;
  const dx = e.clientX - downX, dy = e.clientY - downY;
  if (!dragging && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { dragging = true; touched(); try { shelf.setPointerCapture(pid); } catch (_) {} }
  if (!dragging && Math.abs(dy) > 10) { pointerDown = false; downTape = null; return; }
  if (dragging) T = T0 - dx / (ws + gap);
});
function endPointer(e) {
  if (!pointerDown || (e && e.pointerId !== pid)) return;
  pointerDown = false;
  if (dragging) { T = Math.round(T); dragging = false; justDragged = true; setTimeout(() => (justDragged = false), 0); }
  else if (downTape !== null && e && e.type === "pointerup") tapeClick(downTape);
  downTape = null;
  try { shelf.releasePointerCapture(pid); } catch (_) {}
}
addEventListener("pointerup", endPointer);
addEventListener("pointercancel", endPointer);
shelf.addEventListener("click", (e) => { if (justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);
stage.addEventListener("pointerover", (e) => { const t = e.target.closest(".book"); hoverV = t ? +t.dataset.v : -1; });
stage.addEventListener("pointerleave", () => (hoverV = -1));
document.addEventListener("pointerleave", () => { hoverV = -1; });
/* horizontal wheel / trackpad swipe turns the shelf; vertical wheel scrolls the page */
let wheelTimer = 0;
hero.addEventListener("wheel", (e) => {
  if (sheetOpen() || held) return;
  const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.1 || e.shiftKey;
  if (!horiz) return;
  e.preventDefault(); touched();
  const delta = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
  T += (delta * (e.deltaMode === 1 ? 16 : 1)) / (ws + gap) * .5;
  clearTimeout(wheelTimer); wheelTimer = setTimeout(() => (T = Math.round(T)), 160);
}, { passive: false });
addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (bookOn) requestCloseBook(); else requestClose(); return; }
  if (sheetOpen() || bookOn || sy > VH * .5) return;
  const tag = document.activeElement?.tagName || "";
  if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
  else if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
  else if (e.key === "Enter" && !/^(BUTTON|A)$/.test(tag)) { openDetail(); e.preventDefault(); }
});
function goToIndex(best) { const cur = mod(Math.round(T), N); let diff = mod(best - cur, N); if (diff > N / 2) diff -= N; T = Math.round(T) + diff; }
$("tlhit").addEventListener("click", (e) => {
  if (sheetOpen() || held) return; touched();
  const r = $("tl").getBoundingClientRect();
  goToIndex(Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * (N - 1)));
});

/* ================= sheets ================= */
const sheets = { detail: $("sh-detail"), menu: $("sh-menu") };
const pSvg = $("pSvg"), pArt = $("pArt");
const blots = [...document.querySelectorAll("#pBlots circle")].map((c) => ({ c, d: +c.dataset.d, cy0: +c.getAttribute("cy"), r: -1 }));
const coverRect = () => tapes[mod(Math.round(s), TOTAL)].cv.getBoundingClientRect();
const insetOf = (r, rad) => `inset(${clamp(r.top, 0, innerHeight).toFixed(1)}px ${clamp(innerWidth - r.right, 0, innerWidth).toFixed(1)}px ${clamp(innerHeight - r.bottom, 0, innerHeight).toFixed(1)}px ${clamp(r.left, 0, innerWidth).toFixed(1)}px round ${rad}px)`;
const FULL = "inset(0px 0px 0px 0px round 0px)";
function rectOf(el) {
  if (el === "cover") return coverRect();
  const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  if (r && r.width && r.height && r.bottom > 0 && r.top < innerHeight) return r;
  const bg = document.querySelector(".burger").getBoundingClientRect();
  return bg.width ? bg : { left: innerWidth - 60, right: innerWidth - 20, top: 20, bottom: 50 };
}
function showSheet(name, origin) {
  const el = sheets[name];
  if (!el || current === name) return;
  closing = false;
  el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  el.classList.add("on"); el.setAttribute("aria-hidden", "false"); el.scrollTop = 0;
  document.body.classList.add("sheeted", "locked");
  current = name; originEl = origin;
  openT = performance.now() - (reduce ? 5000 : 0);
  el.animate([{ clipPath: insetOf(rectOf(origin), name === "menu" ? 22 : 3) }, { clipPath: FULL }], { duration: reduce ? 1 : 1050, easing: SHEET_EASE, fill: "both" });
  [...el.querySelectorAll(".dm > *")].forEach((n, k) => n.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0%)" }],
    { duration: reduce ? 1 : 900, delay: reduce ? 0 : 520 + Math.min(k, 10) * 65, easing: EASE, fill: "both" }));
  el.querySelector("[data-close]").focus({ preventScroll: true });
}
function closeSheet(after) {
  if (!current || closing) return;
  closing = true;
  const name = current, el = sheets[name];
  document.body.classList.remove("sheeted", "locked");
  if (after) after();
  const target = name === "detail" ? coverRect() : rectOf(originEl);
  el.getAnimations().forEach((a) => a.cancel());
  el.animate([{ clipPath: FULL }, { clipPath: insetOf(target, name === "menu" ? 22 : 3) }], { duration: reduce ? 1 : 850, easing: SHEET_EASE, fill: "both" })
    .onfinish = () => { el.classList.remove("on"); el.setAttribute("aria-hidden", "true"); el.getAnimations({ subtree: true }).forEach((x) => x.cancel()); current = null; closing = false; };
}
let pendingAfter = null;
function requestClose(after) {
  if (!current) { if (after) after(); return; }
  if (history.state && history.state.sheet) { pendingAfter = after || null; history.back(); }
  else closeSheet(after);
}
addEventListener("popstate", () => {
  const st = history.state && history.state.sheet;
  if (bookOn && st !== "book") { closeBook(); if (!(current && !st)) return; }
  if (current && !st) { const a = pendingAfter; pendingAfter = null; closeSheet(a); return; }
  const h = location.hash.slice(1);
  if (h.startsWith("livre-") && !bookOn) { openBookById(h.slice(6), null, true); return; }
  if (h.startsWith("rayon-") && !current) { const i = BOOKS.findIndex((b) => "rayon-" + b.id === h); if (i >= 0) { scrollTo(0, 0); sy = 0; goToIndex(i); s = T = Math.round(T); openDetail(true); } }
});
function openDetail(fromHistory) {
  if (current || held) return;
  if (sy > 10) { scrollToY(0); return; }
  T = Math.round(T);
  const i = mod(T, N), b = BOOKS[i], art = ART[i].cover;
  $("dSub").textContent = b.kicker.toUpperCase();
  $("dTitle").textContent = b.title;
  $("dMeta").textContent = `RAYON ${b.no} / ${String(N).padStart(2, "0")} — LIBRAIRIE MARTELLE, AMIENS`;
  $("dSyn").textContent = b.syn;
  $("dWhere").textContent = `Où le trouver : ${b.where}`;
  $("dMail").href = `mailto:commandes@librairiemartelle.com?subject=${encodeURIComponent("Conseil — rayon " + b.title)}`;
  pSvg.setAttribute("viewBox", `0 0 ${art.W} ${art.H}`); pSvg.style.aspectRatio = `${art.W} / ${art.H}`;
  $("pClipRect").setAttribute("height", art.H);
  pArt.innerHTML = art.s;
  blots.forEach((bl) => { bl.r = 0; bl.c.setAttribute("r", 0); bl.c.setAttribute("cy", f2(bl.cy0 * art.H / 900)); });
  $("dMeta").textContent = `RAYON ${b.no} / ${String(N).padStart(2, "0")} — ${COUNTS[b.id] ? COUNTS[b.id] + " LIVRE" + (COUNTS[b.id] > 1 ? "S" : "") + " EN LIGNE" : "LIBRAIRIE MARTELLE, AMIENS"}`;
  rayonBooks(b);
  if (fromHistory !== true) { if (location.hash) history.replaceState(null, "", location.pathname + location.search); history.pushState({ sheet: "detail" }, "", "#rayon-" + b.id); }
  showSheet("detail", "cover");
}
/* ----- the books of a rayon (inside the rayon sheet) ----- */
const RB = { cat: null, page: 0, size: 24, sort: "new", stock: false, q: "", total: 0, items: [] };
function rayonBooks(b) {
  const box = $("dBooks");
  if (!LIVE) { box.innerHTML = `<div class="d-books-h"><h3>Les livres du rayon</h3></div><p class="bk-empty">Une fois le catalogue relié, les livres de ce rayon s’afficheront ici avec leur couverture, leur prix et leur disponibilité.</p>`; return; }
  Object.assign(RB, { cat: b.id, page: 0, q: "", items: [], total: 0 });
  box.innerHTML = `<div class="d-books-h"><h3>Les livres du rayon<small id="rbCount">&nbsp;</small></h3>
    <div class="d-tools"><input type="search" id="rbQ" placeholder="Chercher dans ce rayon…" aria-label="Chercher dans ce rayon">
      <select id="rbSort" aria-label="Trier"><option value="new">Nouveautés d’abord</option><option value="title">Titre (A → Z)</option><option value="author">Auteur (A → Z)</option><option value="price">Prix croissant</option></select>
      <label><input type="checkbox" id="rbStock"> En stock</label></div></div>
    <div class="bk-grid" id="rbGrid"></div><div class="more-row" id="rbMore"></div>`;
  $("rbSort").value = RB.sort; $("rbStock").checked = RB.stock;
  let t;
  $("rbQ").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { RB.q = e.target.value; RB.page = 0; loadRB(false); }, 280); });
  $("rbSort").onchange = (e) => { RB.sort = e.target.value; RB.page = 0; loadRB(false); };
  $("rbStock").onchange = (e) => { RB.stock = e.target.checked; RB.page = 0; loadRB(false); };
  loadRB(false);
}
const ORDERS = { new: "is_new.desc,created_at.desc", title: "title.asc", author: "authors_text.asc", price: "price.asc.nullslast" };
async function loadRB(append) {
  const grid = $("rbGrid");
  if (!append) grid.innerHTML = Array.from({ length: 6 }, () => `<div class="bk-card skel"><div class="bk-cv"></div><div class="bk-t"></div></div>`).join("");
  let q = `books?select=${PUB_COLS}&published=eq.true&category_id=eq.${encodeURIComponent(RB.cat)}`;
  if (RB.stock) q += "&availability=in.(in_stock,low_stock)";
  const s = RB.q.replace(/[,()*%"\\:]/g, " ").trim();
  if (s) q += `&or=(title.ilike.*${encodeURIComponent(s)}*,authors_text.ilike.*${encodeURIComponent(s)}*,isbn.ilike.*${encodeURIComponent(s.replace(/\D/g, "") || s)}*)`;
  q += `&order=${ORDERS[RB.sort]}&offset=${RB.page * RB.size}&limit=${RB.size}`;
  try {
    const { data, total } = await api(q, { count: true });
    RB.total = total; RB.items = append ? RB.items.concat(data) : data;
    $("rbCount").textContent = `${total} livre${total > 1 ? "s" : ""}${s ? ` pour « ${s} »` : " en ligne"}`;
    const html = data.map((bk) => cardHTML(bk)).join("");
    if (append) grid.insertAdjacentHTML("beforeend", html); else grid.innerHTML = html;
    if (!RB.items.length) grid.innerHTML = `<div class="bk-empty" style="grid-column:1/-1">${s ? "Aucun livre ne correspond à votre recherche dans ce rayon." : "Les libraires préparent la vitrine en ligne de ce rayon."}<span style="font:500 15px var(--sans);font-style:normal;color:var(--ink)">Un titre en tête ? Les libraires le trouvent ou le commandent pour vous.</span><div class="btn-row"><a class="btn fill lbl" href="mailto:${esc(SHOP.email)}">Demander un livre</a><a class="btn lbl" href="${telHref(SHOP.phone)}">${esc(SHOP.phone)}</a></div></div>`;
    $("rbMore").innerHTML = RB.items.length < total ? `<button class="btn lbl" id="rbMoreBtn">Voir plus de livres (${total - RB.items.length})</button>` : "";
    $("rbMoreBtn")?.addEventListener("click", () => { RB.page++; loadRB(true); });
  } catch (e) { grid.innerHTML = `<div class="bk-empty" style="grid-column:1/-1">Le catalogue est momentanément indisponible. Merci de réessayer dans un instant.</div>`; }
}
const BOOK_CACHE = new Map();
function cardHTML(bk) {
  BOOK_CACHE.set(bk.id, bk);
  return `<button class="bk-card" data-book="${bk.id}"><span class="bk-cv">${coverHTML(bk)}</span><span class="bk-t">${esc(bk.title)}</span><span class="bk-a">${esc(bk.authors_text || "")}</span><span class="bk-p"><span>${priceTxt(bk.price)}</span><span class="av ${bk.availability}">${AVAIL[bk.availability]}</span></span></button>`;
}
const catStyle = (id) => BOOKS.find((b) => b.id === id) || BOOKS[0];
function fallbackArt(bk) {
  const c = catStyle(bk.category_id);
  return coverArt({ ...c, h: 1, title: bk.title.length > 60 ? bk.title.slice(0, 58) + "…" : bk.title, topL: c.short.toUpperCase(), topR: "", botL: (bk.authors_text || "").toUpperCase().slice(0, 34), botR: "Martelle" });
}
function coverHTML(bk) { BOOK_CACHE.set(bk.id, { ...(BOOK_CACHE.get(bk.id) || {}), ...bk }); const src = coverSrc(bk); return src ? `<img src="${esc(src)}" alt="Couverture : ${esc(bk.title)}" loading="lazy" decoding="async" data-fb="${bk.id}">` : svgMarkup(fallbackArt(bk)); }
/* a cover that fails to load is replaced by a drawn cover in the rayon's style */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.fb) return;
  const bk = BOOK_CACHE.get(img.dataset.fb);
  if (!bk) return;
  const t = document.createElement("template"); t.innerHTML = svgMarkup(fallbackArt(bk));
  img.replaceWith(t.content.firstChild);
}, true);
function book3dReal(bk) {
  const c = catStyle(bk.category_id);
  const el = document.createElement("div"); el.className = "b3d";
  const sp = spineArt({ ...c, h: 1, spT: bk.title.length > 30 ? bk.title.slice(0, 29) + "…" : bk.title, spS: ((bk.authors || [])[0] || "").split(" ").pop(), stk: null });
  el.innerHTML = `<i class="ba" style="background:${c.bg}"></i><i class="sp3">${svgMarkup(sp)}</i><i class="pg"></i><i class="tp3"></i><i class="fr">${coverHTML(bk)}</i>`;
  return el;
}

/* ----- one book (sheet stacked above everything) ----- */
let bookOn = false, bookClosing = false, bookOrigin = null;
const shBook = $("sh-book");
function bookLink(bk) {
  if (SHOP.book_url_template && bk.isbn) return { href: SHOP.book_url_template.replace("{isbn}", bk.isbn), label: "Voir en ligne" };
  return SHOP.order_url ? { href: SHOP.order_url, label: "Commander en ligne" } : null;
}
function openBook(bk, origin, fromHistory) {
  if (!bk || bookOn) return;
  BOOK_CACHE.set(bk.id, bk);
  const c = catStyle(bk.category_id);
  const year = (bk.published_date || "").slice(0, 4);
  const meta = [bk.publisher, year, bk.page_count && `${bk.page_count} pages`, bk.isbn && `ISBN ${bk.isbn}`].filter(Boolean);
  const subj = encodeURIComponent(`Réservation — ${bk.title}${bk.isbn ? " (" + bk.isbn + ")" : ""}`);
  const bodyTxt = encodeURIComponent(`Bonjour,\n\nJe souhaite réserver « ${bk.title} »${bk.authors_text ? " de " + bk.authors_text : ""}${bk.isbn ? " (ISBN " + bk.isbn + ")" : ""}.\n\nNom :\nTéléphone :\n\nMerci !`);
  const link = bookLink(bk);
  $("bkCrumb").textContent = c.title;
  $("bkInfo").innerHTML = `<div class="dm"><span class="lbl bk-kick">${esc(c.title)}</span></div>
    <div class="dm"><h2 class="bk-title">${esc(bk.title)}</h2></div>
    ${bk.subtitle ? `<div class="dm"><p class="bk-sub">${esc(bk.subtitle)}</p></div>` : ""}
    ${bk.authors_text ? `<div class="dm"><span class="bk-by">${esc(bk.authors_text)}</span></div>` : ""}
    ${meta.length ? `<div class="dm"><div class="bk-meta">${meta.map((m) => `<span>${esc(m)}</span>`).join("")}</div></div>` : ""}
    <div class="dm"><div class="bk-buy"><span class="bk-price${bk.price === null ? " na" : ""}">${priceTxt(bk.price)}</span><span class="av ${bk.availability}">${AVAIL[bk.availability]}</span>
      <span class="btn-row" style="margin-left:auto"><a class="btn fill lbl" href="mailto:${esc(SHOP.email)}?subject=${subj}&body=${bodyTxt}">${bk.availability === "out_of_stock" ? "Demander ce livre" : "Réserver en librairie"}</a>${link ? `<a class="btn lbl" href="${esc(link.href)}" target="_blank" rel="noopener">${link.label}</a>` : ""}</span></div></div>
    ${bk.staff_note ? `<div class="dm"><div class="bk-note"><p>« ${esc(bk.staff_note)} »</p><span>${bk.staff_name ? "Le coup de cœur " + esc(deName(bk.staff_name)) : "Le coup de cœur des libraires"}</span></div></div>` : ""}
    <div class="dm"><p class="bk-desc">${bk.description ? esc(bk.description) : "Le résumé de ce livre n’est pas encore en ligne : demandez conseil aux libraires."}</p></div>
    <div class="dm"><p class="src">Retrait au 3 rue des Vergeaux, Amiens · ${esc(SHOP.phone)}${bk.cover_credit ? " · " + esc(bk.cover_credit) : ""}</p></div>`;
  const stage = $("bkStage");
  stage.querySelector(".b3d")?.remove();
  const b3 = book3dReal(bk);
  stage.prepend(b3);
  if (!reduce) b3.animate([{ transform: "rotateY(-70deg) rotateX(8deg) translateY(40px)" }, { transform: "rotateY(-26deg) rotateX(3deg)" }], { duration: 1400, delay: 350, easing: EASE, fill: "backwards" });
  shBook.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  shBook.classList.add("on"); shBook.setAttribute("aria-hidden", "false"); shBook.scrollTop = 0;
  document.body.classList.add("sheeted", "locked");
  bookOn = true; bookClosing = false; bookOrigin = origin || null;
  shBook.animate([{ clipPath: insetOf(rectOf(origin || $("top")), 3) }, { clipPath: FULL }], { duration: reduce ? 1 : 1000, easing: SHEET_EASE, fill: "both" });
  [...shBook.querySelectorAll(".dm > *")].forEach((n, k) => n.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0%)" }], { duration: reduce ? 1 : 900, delay: reduce ? 0 : 480 + Math.min(k, 10) * 60, easing: EASE, fill: "both" }));
  if (!fromHistory) history.pushState({ sheet: "book", id: bk.id }, "", "#livre-" + bk.id);
  shBook.querySelector("[data-close-book]").focus({ preventScroll: true });
}
function closeBook() {
  if (!bookOn || bookClosing) return;
  bookClosing = true;
  const target = rectOf(bookOrigin && document.contains(bookOrigin) ? bookOrigin : $("top"));
  shBook.getAnimations().forEach((a) => a.cancel());
  if (!current) document.body.classList.remove("sheeted", "locked");
  shBook.animate([{ clipPath: FULL }, { clipPath: insetOf(target, 3) }], { duration: reduce ? 1 : 800, easing: SHEET_EASE, fill: "both" }).onfinish = () => {
    shBook.classList.remove("on"); shBook.setAttribute("aria-hidden", "true"); shBook.getAnimations({ subtree: true }).forEach((x) => x.cancel()); bookOn = false; bookClosing = false;
  };
}
function requestCloseBook() { if (history.state && history.state.sheet === "book") history.back(); else closeBook(); }
async function openBookById(id, origin, fromHistory) {
  if (!LIVE || !/^[0-9a-f-]{36}$/.test(id)) return;
  let bk = BOOK_CACHE.get(id);
  if (!bk) { try { [bk] = await api(`books?select=${PUB_COLS}&id=eq.${id}&published=eq.true`); } catch (_) {} }
  if (bk) openBook(bk, origin, fromHistory);
}
document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-book]");
  if (card && !e.defaultPrevented && !card.closest(".rail.dragging")) { e.preventDefault(); openBookById(card.dataset.book, card.querySelector(".bk-cv,.mini,.b3d") || card); }
});

function openMenu(origin) { history.pushState({ sheet: "menu" }, "", location.pathname + location.search + "#menu"); showSheet("menu", origin); }

/* smooth scrolling to sections (custom easing, interruptible) */
let scrollAnim = 0;
function scrollToY(y) {
  y = clamp(y, 0, document.documentElement.scrollHeight - innerHeight);
  cancelAnimationFrame(scrollAnim);
  if (reduce) { scrollTo(0, y); return; }
  const y0 = scrollY, dy = y - y0, dur = clamp(Math.abs(dy) * .4, 500, 1500), t0 = performance.now();
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tick = (now) => { const t = clamp((now - t0) / dur, 0, 1); scrollTo(0, y0 + dy * ease(t)); if (t < 1) scrollAnim = requestAnimationFrame(tick); };
  scrollAnim = requestAnimationFrame(tick);
}
["wheel", "touchstart"].forEach((ev) => addEventListener(ev, () => cancelAnimationFrame(scrollAnim), { passive: true }));
function sectionY(id) {
  const el = $(id); if (!el || id === "accueil") return 0;
  return el.getBoundingClientRect().top + scrollY - (id === "histoire" ? 0 : (isMobile() ? 56 : 64));
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-book]")) { e.preventDefault(); requestCloseBook(); return; }
  const a = e.target.closest("[data-sheet],[data-close],[data-scroll]");
  if (!a) return;
  e.preventDefault();
  if (bookOn && a.hasAttribute("data-scroll")) { closeBook(); }
  if (a.hasAttribute("data-close")) { requestClose(); return; }
  if (a.hasAttribute("data-sheet")) { openMenu(a); return; }
  const id = a.getAttribute("data-scroll");
  if (current) requestClose(() => { scrollTo(0, sectionY(id)); setHash(id); });
  else { scrollToY(sectionY(id)); setHash(id); }
});
function setHash(id) { history.replaceState(null, "", location.pathname + location.search + (id === "accueil" ? "" : "#" + id)); }

/* ================= sections ================= */
const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); countUp(en.target); } }), { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll("[data-io]").forEach((el) => io.observe(el));
function countUp(root) {
  root.querySelectorAll("[data-count]").forEach((b) => {
    if (b.hasAttribute("data-plain") || reduce) return;
    const to = +b.dataset.count, pre = b.dataset.pre || "", t0 = performance.now(), dur = 1700;
    const fmt = (n) => pre + Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
    const tick = (now) => { const t = clamp((now - t0) / dur, 0, 1); b.textContent = fmt(to * (1 - Math.pow(1 - t, 4))); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}
/* manifesto: words ink in as you read */
const wordsEl = $("words");
(() => {
  const keys = (wordsEl.dataset.k || "").split(",");
  wordsEl.innerHTML = wordsEl.textContent.trim().split(/\s+/).map((w) => `<span class="w${keys.some((k) => w.toLowerCase().includes(k)) ? " k" : ""}">${esc(w)}</span>`).join(" ");
})();
const wordSpans = [...wordsEl.querySelectorAll(".w")];
let wordsOn = -1;
/* history: pinned horizontal track */
const hz = $("histoire"), hzTrack = $("hzTrack"), hzBar = $("hzBar");
const years = [...hz.querySelectorAll(".year")];
let hzTop = 0, hzDist = 0, wordsTop = 0, wordsH = 0, sectionsSpy = [];
function measureSections() {
  if (isMobile()) { hz.style.height = ""; hzDist = 0; }
  else {
    const prev = hzTrack.style.transform; hzTrack.style.transform = "none";
    hzDist = Math.max(0, hzTrack.scrollWidth - innerWidth);
    hzTrack.style.transform = prev;
    const want = hzDist + innerHeight + "px";
    if (hz.style.height !== want) hz.style.height = want;
  }
  hzTop = hz.getBoundingClientRect().top + scrollY;
  const wr = wordsEl.getBoundingClientRect(); wordsTop = wr.top + scrollY; wordsH = wr.height;
  sectionsSpy = ["accueil", "histoire", "visite", "nouveautes", "rencontres", "venir"].map((id) => ({ id, y: $(id).getBoundingClientRect().top + scrollY }));
  lastSy = -1;
}
const navLinks = [...document.querySelectorAll(".nav a[data-scroll]")];
let spyOn = "";

/* visit: floors */
const iso = $("iso"), lvbs = [...document.querySelectorAll(".lvb")], lvs = [...iso.querySelectorAll(".lv")];
function setLevel(n) {
  lvbs.forEach((b) => { const on = +b.dataset.lv === n; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); });
  lvs.forEach((l) => { const z = +l.dataset.lv; l.classList.toggle("on", z === n); l.style.setProperty("--lift", z > n ? "110px" : z === n ? "36px" : "0px"); });
}
lvbs.forEach((b) => { b.addEventListener("click", () => setLevel(+b.dataset.lv)); b.addEventListener("mouseenter", () => mqFine.matches && setLevel(+b.dataset.lv)); });
new IntersectionObserver((ents) => ents.forEach((en) => iso.classList.toggle("open", en.isIntersecting)), { threshold: .3 }).observe($("isoWrap"));
setLevel(1);

/* 3D books for new releases & picks */
function book3d(b) {
  const el = document.createElement("div"); el.className = "b3d";
  el.innerHTML = `<i class="ba" style="background:${b.bg}"></i><i class="sp3">${svgMarkup(spineArt(b))}</i><i class="pg"></i><i class="tp3"></i><i class="fr">${svgMarkup(coverArt(b))}</i>`;
  return el;
}
const rail = $("rail");
DEMO.forEach((b) => {
  const it = document.createElement("article"); it.className = "nv";
  it.append(book3d(b));
  it.insertAdjacentHTML("beforeend", `<i class="b3d-sh"></i><div class="nv-m"><span class="lbl g">${esc(b.genre)}</span><h3>${esc(b.title)}</h3><p>${esc(b.author)} · titre fictif</p></div>`);
  rail.append(it);
});
rail.addEventListener("keydown", (e) => { const it = e.target.closest("[data-book]"); if (it && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openBookById(it.dataset.book, it.querySelector(".b3d") || it); } });
document.querySelectorAll("[data-rail]").forEach((bt) => bt.addEventListener("click", () => rail.scrollBy({ left: +bt.dataset.rail * Math.min(rail.clientWidth * .8, 600), behavior: reduce ? "auto" : "smooth" })));
(() => { /* mouse drag-to-scroll on the rail */
  let on = false, x0 = 0, l0 = 0;
  rail.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; on = true; x0 = e.clientX; l0 = rail.scrollLeft; e.preventDefault(); });
  addEventListener("pointermove", (e) => { if (!on) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) rail.classList.add("dragging"); rail.scrollLeft = l0 - dx; });
  addEventListener("pointerup", () => { if (!on) return; on = false; setTimeout(() => rail.classList.remove("dragging"), 0); });
})();
/* staff picks */
const pickStage = $("pickStage");
let pickI = 0, pickBook = null;
function renderPick(dir) {
  const live = LIVE_PICKS && LIVE_PICKS.length ? LIVE_PICKS : null;
  const b = live ? live[pickI % live.length] : PICKS[pickI];
  const nb = live ? book3dReal(b) : book3d(b);
  if (pickBook && !reduce && dir) {
    const old = pickBook;
    old.animate([{ transform: getComputedStyle(old).transform }, { transform: `rotateY(${dir > 0 ? -200 : 160}deg) translateX(${dir > 0 ? -40 : 40}px)` }], { duration: 700, easing: SHEET_EASE, fill: "forwards" }).onfinish = () => old.remove();
    nb.animate([{ transform: `rotateY(${dir > 0 ? 160 : -200}deg) rotateX(3deg)` }, { transform: "rotateY(-26deg) rotateX(3deg)" }], { duration: 1000, delay: 220, easing: EASE, fill: "backwards" });
  } else if (pickBook) pickBook.remove();
  pickStage.prepend(nb); pickBook = nb;
  $("pkN").textContent = String(pickI + 1).padStart(2, "0");
  const t = document.createElement("span"); t.className = "pick-t"; t.textContent = b.title;
  swapLine($("pkT"), t, dir || 0);
  swapLine($("pkA"), live ? `${b.authors_text || ""}${b.price !== null ? " · " + priceTxt(b.price) : ""}` : `${b.author} · ${b.genre} · titre fictif`, dir || 0);
  const q = document.createElement("span"); q.className = "pick-q";
  q.textContent = live ? (b.staff_note ? "« " + b.staff_note + " »" : (b.description || "").slice(0, 260) + ((b.description || "").length > 260 ? "…" : "")) : "« " + b.note + " »";
  swapLine($("pkQ"), q, dir || 0);
  if (live) {
    $("pkBy").textContent = b.staff_note ? (b.staff_name ? `— Le coup de cœur ${deName(b.staff_name)}` : "— Le coup de cœur des libraires") : "";
    const cta = $("pkCta"); cta.textContent = "Voir le livre"; cta.href = "#livre-" + b.id; cta.dataset.book = b.id;
  }
}
const pickLen = () => (LIVE_PICKS && LIVE_PICKS.length ? LIVE_PICKS.length : PICKS.length);
$("pkPrev").addEventListener("click", () => { pickI = mod(pickI - 1, pickLen()); renderPick(-1); });
$("pkNext").addEventListener("click", () => { pickI = mod(pickI + 1, pickLen()); renderPick(1); });
renderPick(0);
/* marquee only runs on screen */
new IntersectionObserver((ents) => ents.forEach((en) => $("marq").style.setProperty("--play", en.isIntersecting ? "running" : "paused"))).observe($("marq"));
/* map loads when "Venir" approaches */
new IntersectionObserver((ents, ob) => ents.forEach((en) => { if (!en.isIntersecting) return; ob.disconnect();
  const f = document.createElement("iframe");
  f.title = "Plan d’accès — Librairie Martelle, 3 rue des Vergeaux, Amiens"; f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
  f.src = "https://www.google.com/maps?q=" + encodeURIComponent("Librairie Martelle, 3 rue des Vergeaux, 80000 Amiens") + "&z=16&output=embed";
  $("map").prepend(f);
}), { rootMargin: "400px" }).observe($("map"));

/* ================= opening hours (leslibraires.fr, 11/11/2026) ================= */
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
let HOURS = [[570, 1140], [570, 1140], [570, 1140], [570, 1140], [570, 1140], [570, 1140], null];
const CLOSED = new Set(["2026-11-11"]);
const hm = (m) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
function parisNow() {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t).value;
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return { wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), min: (+g("hour") % 24) * 60 + +g("minute"), date };
}
const addDays = (iso, k) => { const t = new Date(iso + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + k); return t.toISOString().slice(0, 10); };
const hoursOn = (wd, iso) => (CLOSED.has(iso) ? null : HOURS[wd]);
function status() {
  const { wd, min, date } = parisNow(), h = hoursOn(wd, date), exc = CLOSED.has(date);
  if (h && min >= h[0] && min < h[1]) return { open: true, wd, exc, txt: `Ouvert · jusqu’à ${hm(h[1])}` };
  if (h && min < h[0]) return { open: false, wd, exc, txt: `Fermé · ouvre à ${hm(h[0])}` };
  for (let k = 1; k <= 14; k++) { const dd = (wd + k) % 7, hh = hoursOn(dd, addDays(date, k));
    if (hh) return { open: false, wd, exc, txt: `${exc ? "Fermeture exceptionnelle" : "Fermé"} · ouvre ${k === 1 ? "demain" : DAYS[dd].toLowerCase()} à ${hm(hh[0])}` }; }
  return { open: false, wd, exc, txt: "Fermé" };
}
function renderHours() {
  const st = status();
  $("hours").innerHTML = DAYS.map((dn, i) => `<tr${i === st.wd ? ' class="today"' : ""}><td>${dn}</td><td>${i === st.wd && st.exc ? "Fermeture exceptionnelle" : HOURS[i] ? hm(HOURS[i][0]) + " – " + hm(HOURS[i][1]) : "Fermé"}</td></tr>`).join("");
  [$("status"), $("status2")].forEach((el) => el.classList.toggle("open", st.open));
  $("statusTxt").textContent = `${st.txt} — 3 rue des Vergeaux`;
  $("status2").querySelector("span").textContent = st.txt;
}
renderHours(); setInterval(renderHours, 60000);

/* ================= intro ================= */
const intro = $("intro");
$("introWm").innerHTML = "Martelle".split("").map((c) => `<span>${c}</span>`).join("");
function revealChrome() { $("top").classList.add("ready"); $("mbar").classList.add("ready"); }
function runIntro() {
  if (!INTRO) { intro.remove(); afterIntro(); return; }
  [...intro.querySelectorAll(".iwm span")].forEach((n, k) => n.animate([{ transform: "translateY(110%) rotate(6deg)" }, { transform: "translateY(0%) rotate(0deg)" }], { duration: 1000, delay: 60 + k * 50, easing: EASE, fill: "both" }));
  [...intro.querySelectorAll(".il span")].forEach((n, k) => n.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0%)" }], { duration: 800, delay: 220 + k * 360, easing: EASE, fill: "both" }));
  $("ibar").animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1000, delay: 200, easing: SHEET_EASE, fill: "both" });
  setTimeout(() => { held = false; }, 1100);
  setTimeout(revealChrome, 1500);
  intro.animate([{ clipPath: FULL }, { clipPath: "inset(0px 0px 100% 0px round 0px)" }], { duration: 1100, delay: 1250, easing: SHEET_EASE, fill: "both" }).onfinish = () => { intro.remove(); afterIntro(); };
}
function afterIntro() {
  held = false; revealChrome(); document.body.classList.remove("locked");
  measure();
  const h = location.hash.slice(1);
  if (h.startsWith("rayon-")) {
    const i = BOOKS.findIndex((b) => "rayon-" + b.id === h);
    if (i >= 0) { goToIndex(i); s = T; history.replaceState({ sheet: "detail" }, "", location.hash); setTimeout(() => openDetail(true), 60); }
  } else if (h.startsWith("livre-")) { history.replaceState({ sheet: "book" }, "", location.hash); openBookById(h.slice(6), null, true); }
  else if (h && h !== "menu" && $(h)) setTimeout(() => scrollToY(sectionY(h)), 80);
  if (mqFine.matches) $("hintTxt").textContent = "Glissez ou utilisez ← → · cliquez sur la couverture pour ouvrir le rayon";
  setTimeout(touched, 9000);
}

/* ================= measure + loop ================= */
const play = $("play"), dot = $("dot"), cur = $("cur"), curLbl = $("curLbl"), topBar = $("top");
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
let last = performance.now(), curState = "", lastSy = -1, solid = false;
function measure() {
  H = $("probe").getBoundingClientRect().height;
  W = innerWidth; VH = innerHeight; heroH = hero.offsetHeight;
  ws = H * .136; d = H * 474 / 711; gap = H * .03;
  U = H * (W < 768 ? 1.05 : 1.3);
  XS = [0]; let acc = 0;
  for (let u = 0; u <= 3 * U; u += 2) { acc += 2 / (1 + Math.pow(u / U, 1.6)); XS.push(acc); }
  stage.style.setProperty("--hp", H + "px"); stage.style.setProperty("--ws", ws + "px"); stage.style.setProperty("--d", d + "px");
  cyPx = shelf.offsetTop + shelf.offsetHeight / 2;
  measureSections();
}
measure();
let rz = 0;
addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(measure, 120); });
document.fonts && document.fonts.ready.then(measure);
addEventListener("load", measure);
new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(measureSections, 150); }).observe($("main"));

function frame(now) {
  const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
  sy = scrollY;
  const scrolled = sy !== lastSy; lastSy = sy;
  heroVisible = sy < heroH;

  /* ---- shelf ---- */
  if (!held) {
    if (reduce) s = T;
    else s += (T - s) * (1 - Math.exp(-(dragging ? 18 : sweep ? 2.6 : 5.2) * dt));
    if (sweep && Math.abs(T - s) < .5) sweep = false;
  }
  if (Math.abs(s - START) > 4 * N) { const sh = Math.round((s - START) / N) * N; s -= sh; T -= sh; T0 -= sh; }
  const a = mod(Math.round(s), N);
  if (a !== active) { setCaption(a, active < 0 ? 0 : Math.sign(T - s) || 1); active = a; }

  const cyView = cyPx - sy;
  const onCover = hasMouse && heroVisible && !sheetOpen() && !held && settled() && sy < 40 &&
    Math.abs(mx - W / 2) < .55 * d && Math.abs(my - cyView) < .55 * H;
  let tY, tX;
  if (onCover) { tY = ((mx - W / 2) / (.55 * d)) * 8; tX = (-(my - cyView) / (H / 2)) * 5; }
  else { tY = hasMouse && heroVisible ? ((mx - W / 2) / W) * 4 : 0; tX = 0; }
  const kt = reduce ? 1 : 1 - Math.exp(-7 * dt);
  tiltY += (tY - tiltY) * kt; tiltX += (tX - tiltX) * kt;

  const covered = (current && !closing && now - openT > 1100) || !heroVisible;
  if (!covered) {
    const kl = reduce ? 1 : 1 - Math.exp(-12 * dt);
    for (let v = 0; v < TOTAL; v++) {
      const tp = tapes[v], r = rel(v, s);
      const o = smooth(Math.max(0, 1 - Math.abs(r))), u = F(r);
      tp.lift += ((hoverV === v && Math.abs(r) > .5 && !sheetOpen() ? 1 : 0) - tp.lift) * kl;
      if (Math.abs(u) > U * 1.95) { if (tp.vis) { tp.el.style.visibility = "hidden"; tp.vis = false; } continue; }
      if (!tp.vis) { tp.el.style.visibility = ""; tp.vis = true; }
      const sc = scl(u), k = 1 / sc;
      const z = P * (1 - k) + o * H * .1, x = xsc(u) * k;
      const y = (H * .5 * (1 - sc) * .42 + o * H * .012 - tp.lift * H * .05) * k;
      const ry = Math.sign(u) * Math.min(1, Math.abs(u) / U) * 26 * (1 - o) - 90 * o + tiltY * o;
      tp.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${(tiltX * o).toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
      tp.el.style.zIndex = Math.round(3000 + z);
      const shSp = Math.min(.6, o * .55 + (1 - sc) * .32), shCv = (1 - o) * .82, shBk = Math.min(.8, .3 + (1 - sc) * .5);
      if (Math.abs(shSp - tp.sSp) > .002) { tp.sp.style.setProperty("--shade", shSp.toFixed(3)); tp.sSp = shSp; }
      if (Math.abs(shCv - tp.sCv) > .002) { tp.cv.style.setProperty("--shade", shCv.toFixed(3)); tp.sCv = shCv; }
      if (Math.abs(shBk - tp.sBk) > .002) { tp.bk.style.setProperty("--shade", shBk.toFixed(3)); tp.sBk = shBk; }
      if (o > .5) tp.cv.style.setProperty("--gx", (30 + tiltY * 5).toFixed(1) + "%");
    }
    const ring = sheetOpen() || held ? 0 : smooth(Math.max(0, 1 - Math.abs(T - s) * 3));
    play.style.transform = `translate(${(W / 2 - d / 2 - 6).toFixed(1)}px,${(cyPx + .36 * H).toFixed(1)}px) scale(${ring.toFixed(3)})`;
    const fl = Math.floor(s), fr = s - fl, i0 = mod(fl, N), i1 = mod(fl + 1, N);
    const ti = i1 < i0 ? (fr < .5 ? i0 : i1) : i0 + fr;
    if (reduce || Math.abs(ti - dotIdx) > 2) dotIdx = ti; else dotIdx += (ti - dotIdx) * (1 - Math.exp(-14 * dt));
    dot.style.left = ((dotIdx / (N - 1)) * 100).toFixed(3) + "%";
  }

  /* ---- scroll-linked ---- */
  if (scrolled) {
    if (heroVisible || sy < heroH * 1.2) {
      const p = clamp(sy / heroH, 0, 1);
      heroIn.style.transform = reduce || p === 0 ? "" : `translate3d(0,${(p * heroH * .38).toFixed(1)}px,0) scale(${(1 - p * .07).toFixed(4)})`;
    }
    const sol = sy > 30; if (sol !== solid) { topBar.classList.toggle("solid", sol); solid = sol; }
    const wp = clamp((sy + VH * .82 - wordsTop) / (wordsH + VH * .3), 0, 1);
    const on = reduce ? wordSpans.length : Math.round(wp * wordSpans.length);
    if (on !== wordsOn) { wordSpans.forEach((w, i) => w.classList.toggle("on", i < on)); wordsOn = on; }
    if (hzDist > 0) {
      const hp = clamp((sy - hzTop) / hzDist, 0, 1);
      hzTrack.style.transform = `translate3d(${(-hp * hzDist).toFixed(1)}px,0,0)`;
      hzBar.style.setProperty("--p", hp.toFixed(4));
      years.forEach((y, i) => { const lcl = clamp(hp * (years.length + .6) - i + .7, 0, 1); y.style.setProperty("--fill", (lcl * 100).toFixed(1) + "%"); });
    } else years.forEach((y) => y.style.setProperty("--fill", "100%"));
    let id = "accueil"; for (const sct of sectionsSpy) if (sy + VH * .4 >= sct.y) id = sct.id;
    if (id !== spyOn) { navLinks.forEach((l) => l.classList.toggle("on", l.dataset.scroll === id && id !== "accueil")); spyOn = id; }
  }

  /* ---- ink bleed ---- */
  if (current === "detail") {
    const t = now - openT;
    for (const bl of blots) { const r = 720 * easeOutCubic(clamp((t - 520 - bl.d) / 1250, 0, 1)); if (Math.abs(r - bl.r) > .05) { bl.c.setAttribute("r", r.toFixed(2)); bl.r = r; } }
  }

  /* ---- cursor ---- */
  if (hasMouse && mqFine.matches) {
    const kc = 1 - Math.exp(-16 * dt);
    curPos.x += (mx - curPos.x) * kc; curPos.y += (my - curPos.y) * kc;
    cur.style.transform = `translate3d(${curPos.x.toFixed(1)}px,${curPos.y.toFixed(1)}px,0)`;
    let st = "";
    if (onCover) st = "open";
    else if (hoverEl && hoverEl.closest) {
      if (!sheetOpen() && hoverEl.closest(".book")) st = "spine";
      else if (hoverEl.closest(".rail")) st = "drag";
      else if (hoverEl.closest("button,a,.tl-hit,iframe,.map")) st = "btn";
      if (!sheetOpen() && hoverEl.closest(".dark,.foot")) st += " dark";
    }
    if (st !== curState) { cur.className = "cur on " + st; curLbl.textContent = st.startsWith("drag") ? "GLISSER" : "OUVRIR"; curState = st; }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
runIntro();

/* ================= apply live data to the page ================= */
function applyHome([cats, settings, counts, news, best, picks, events]) {
  /* rayons: texts editable from the admin, drawing stays fixed */
  if (cats && cats.length) {
    let changed = false;
    cats.forEach((c) => {
      const b = BOOKS.find((x) => x.id === c.id);
      if (!b) return;
      const next = { title: c.title, short: c.short_title, kicker: c.kicker || b.kicker, syn: c.description || b.syn, where: c.location_hint || b.where };
      if (Object.keys(next).some((k) => next[k] !== b[k])) { Object.assign(b, next); b.botL = b.kicker.toUpperCase(); b.spT = b.short; changed = true; }
    });
    if (changed) {
      BOOKS.forEach((b, i) => { ART[i] = { cover: coverArt(b), spine: spineArt(b), back: backArt(b) }; });
      tapes.forEach((tp, v) => { const i = v % N; tp.sp.innerHTML = svgMarkup(ART[i].spine); tp.cv.innerHTML = svgMarkup(ART[i].cover); tp.bk.innerHTML = svgMarkup(ART[i].back); });
      document.querySelectorAll("#ticks .ty span").forEach((sp, i) => (sp.textContent = BOOKS[i].short));
      if (active >= 0) setCaption(active, 0);
    }
  }
  (counts || []).forEach((c) => (COUNTS[c.category_id] = +c.books));
  /* practical information */
  const st = settings && settings[0];
  if (st) {
    const toMin = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
    if (Array.isArray(st.opening_hours) && st.opening_hours.length === 7) HOURS = st.opening_hours.map((h) => (h ? [toMin(h.open), toMin(h.close)] : null));
    CLOSED.clear(); (st.closures || []).forEach((c) => c && c.date && CLOSED.add(c.date));
    const oldPhone = SHOP.phone, oldMail = SHOP.email, oldOrder = SHOP.order_url;
    Object.assign(SHOP, { phone: st.phone || SHOP.phone, email: st.email || SHOP.email, order_url: st.order_url || SHOP.order_url, book_url_template: st.book_url_template || null });
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => { a.href = telHref(SHOP.phone); if (a.textContent.includes(oldPhone)) a.textContent = a.textContent.replace(oldPhone, SHOP.phone); });
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => { a.href = a.href.replace(oldMail, SHOP.email); if (a.textContent.includes(oldMail)) a.textContent = SHOP.email; });
    if (oldOrder !== SHOP.order_url) document.querySelectorAll(`a[href="${oldOrder}"]`).forEach((a) => (a.href = SHOP.order_url));
    renderHours();
    const an = $("annc");
    if (st.announcement) { an.textContent = st.announcement; an.hidden = false; requestAnimationFrame(() => setTimeout(() => an.classList.add("on"), 2600)); }
    else { an.classList.remove("on"); an.hidden = true; }
  }
  /* new releases */
  const secNew = $("nouveautes"), navNew = document.querySelector('.nav a[data-scroll="nouveautes"]');
  if (news && news.length) {
    $("newDemo")?.remove();
    rail.innerHTML = "";
    news.forEach((bk) => {
      BOOK_CACHE.set(bk.id, bk);
      const it = document.createElement("article"); it.className = "nv"; it.dataset.book = bk.id; it.tabIndex = 0; it.setAttribute("role", "button"); it.setAttribute("aria-label", bk.title);
      it.append(book3dReal(bk));
      it.insertAdjacentHTML("beforeend", `<i class="b3d-sh"></i><div class="nv-m"><span class="lbl g">${esc(catStyle(bk.category_id).short)}</span><h3>${esc(bk.title)}</h3><p>${esc(bk.authors_text || "")}</p><span class="pr">${priceTxt(bk.price)} <span class="av ${bk.availability}">${AVAIL[bk.availability]}</span></span></div>`);
      rail.append(it);
    });
    secNew.hidden = false; if (navNew) navNew.hidden = false;
  } else if (news) { secNew.hidden = true; if (navNew) navNew.hidden = true; }
  /* bestsellers */
  $("meilleures-ventes")?.remove();
  if (best && best.length) {
    best.forEach((bk) => BOOK_CACHE.set(bk.id, bk));
    secNew.insertAdjacentHTML("afterend", `<section class="sec" id="meilleures-ventes" aria-labelledby="t-best"><div class="row-h" data-io><div><div class="kick lbl"><span class="ln"><span>Meilleures ventes</span></span></div>
      <h2 class="h2" id="t-best"><span class="ln"><span>Les plus <em>demandés</em></span></span></h2></div><span class="lbl" style="color:var(--muted)">Rue des Vergeaux, en ce moment</span></div>
      <ol class="best" data-io>${best.map((bk, i) => `<li class="wipe" style="--i:${Math.min(i, 6)}"><button data-book="${bk.id}"><span class="rk">${String(i + 1).padStart(2, "0")}</span><span class="mini">${coverHTML(bk)}</span><span><h3>${esc(bk.title)}</h3><p>${esc(bk.authors_text || "")}</p></span><span class="pr">${priceTxt(bk.price)}<span class="av ${bk.availability}">${AVAIL[bk.availability]}</span></span></button></li>`).join("")}</ol></section>`);
    document.querySelectorAll("#meilleures-ventes [data-io]").forEach((el) => io.observe(el));
  }
  /* staff picks */
  const secPick = $("coups-de-coeur");
  if (picks && picks.length) {
    $("pickDemo")?.remove();
    LIVE_PICKS = picks;
    picks.forEach((bk) => BOOK_CACHE.set(bk.id, bk));
    document.querySelector(".pick-n .lbl").textContent = "/ " + String(picks.length).padStart(2, "0");
    pickI = 0; renderPick(0);
    secPick.hidden = false;
  } else if (picks) secPick.hidden = true;
  /* events */
  const evl = $("evList");
  if (events && events.length) {
    const dfmt = (d, o) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ...o }).format(new Date(d));
    evl.innerHTML = events.map((ev) => {
      const book = ev.book;
      const cta = ev.booking_url ? `<a class="btn fill lbl" href="${esc(ev.booking_url)}" ${/^https/.test(ev.booking_url) ? 'target="_blank" rel="noopener"' : ""}>${ev.booking_required ? "S’inscrire" : "En savoir plus"}</a>`
        : ev.booking_required ? `<a class="btn fill lbl" href="mailto:${esc(SHOP.email)}?subject=${encodeURIComponent("Inscription — " + ev.title)}">S’inscrire</a>` : "";
      return `<article class="evi"><div><div class="dd">${dfmt(ev.starts_at, { day: "numeric" })}</div><span class="mm">${dfmt(ev.starts_at, { month: "long" })}</span></div>
        <div><span class="lbl">${esc(KINDS[ev.kind] || "Rendez-vous")} · ${dfmt(ev.starts_at, { weekday: "long" })} · ${dfmt(ev.starts_at, { hour: "2-digit", minute: "2-digit" }).replace(":", "h")}${ev.ends_at ? "–" + dfmt(ev.ends_at, { hour: "2-digit", minute: "2-digit" }).replace(":", "h") : ""}</span>
        <h3>${esc(ev.title)}</h3>${ev.guests ? `<p><b>${esc(ev.guests)}</b></p>` : ""}${ev.description ? `<p>${esc(ev.description.length > 260 ? ev.description.slice(0, 258) + "…" : ev.description)}</p>` : ""}${ev.location && !/Vergeaux/.test(ev.location) ? `<p>${esc(ev.location)}</p>` : ""}</div>
        <div class="btn-row row-cta">${cta}${book ? `<button class="btn lbl" data-book="${book.id}">Le livre</button>` : ""}</div></article>`;
    }).join("");
    evl.hidden = false;
  } else evl.hidden = true;
  measureSections();
}
if (LIVE) {
  homeData.then(applyHome);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && Date.now() - homeLoadedAt > 120000) loadHome().then(applyHome); });
}
})();
