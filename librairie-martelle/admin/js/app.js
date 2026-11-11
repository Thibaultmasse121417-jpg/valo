import { sb, configured, currentStaff } from "./api.js";
import { html, raw, esc, I, toast } from "./ui.js";

const app = document.getElementById("app");
let staff = null;
let cleanup = null;

const NAV = [
  { href: "#/", label: "Tableau de bord", icon: I.home, view: () => import("./views/dashboard.js") },
  { href: "#/livres", label: "Livres", icon: I.books, view: () => import("./views/books.js") },
  { href: "#/livres/nouveau", label: "Ajouter un livre", icon: I.plus, view: () => import("./views/bookForm.js") },
  { href: "#/selections", label: "Sélections", icon: I.star, view: () => import("./views/selections.js") },
  { href: "#/import", label: "Importer (CSV)", icon: I.upload, view: () => import("./views/import.js") },
  { href: "#/evenements", label: "Événements", icon: I.cal, view: () => import("./views/events.js") },
  { sep: true },
  { href: "#/contenus", label: "Textes & pages", icon: I.edit, view: () => import("./views/content.js") },
  { href: "#/photos", label: "Photos", icon: I.upload, view: () => import("./views/photos.js") },
  { href: "#/rayons", label: "Les 12 rayons", icon: I.shelf, view: () => import("./views/categories.js") },
  { href: "#/infos", label: "Horaires & infos", icon: I.clock, view: () => import("./views/settings.js") },
  { href: "#/synchronisation", label: "Synchronisation stock", icon: I.sync, view: () => import("./views/sync.js") },
];

const ROUTES = [
  [/^#\/?$/, () => import("./views/dashboard.js")],
  [/^#\/livres\/?$/, () => import("./views/books.js")],
  [/^#\/livres\/nouveau$/, () => import("./views/bookForm.js")],
  [/^#\/livres\/([0-9a-f-]{36})$/, () => import("./views/bookForm.js")],
  [/^#\/selections$/, () => import("./views/selections.js")],
  [/^#\/import$/, () => import("./views/import.js")],
  [/^#\/evenements\/?$/, () => import("./views/events.js")],
  [/^#\/evenements\/(nouveau|[0-9a-f-]{36})$/, () => import("./views/eventForm.js")],
  [/^#\/rayons$/, () => import("./views/categories.js")],
  [/^#\/contenus$/, () => import("./views/content.js")],
  [/^#\/photos$/, () => import("./views/photos.js")],
  [/^#\/infos$/, () => import("./views/settings.js")],
  [/^#\/synchronisation$/, () => import("./views/sync.js")],
];

/* ---------------- login ---------------- */
function loginView(message = "", mode = "login") {
  app.innerHTML = html`<div class="login">
    <div class="login-art"><div><div style="font:500 22px/1 var(--serif)">Librairie <i>Martelle</i></div><div class="small" style="margin-top:8px;color:#C9452A;letter-spacing:.14em;text-transform:uppercase;font-weight:600">Administration du site</div></div>
      <div class="big" aria-hidden="true">Martelle</div><div class="small" style="color:#A69E8F">Espace réservé à l’équipe de la librairie.</div></div>
    <div class="login-form"><form class="login-card" id="lf" novalidate>
      <h1>${mode === "reset" ? "Mot de passe oublié" : mode === "newpass" ? "Nouveau mot de passe" : "Connexion"}</h1>
      ${message ? raw(`<div class="notice ${message.startsWith("✓") ? "ok" : "bad"}">${esc(message.replace(/^✓ /, ""))}</div>`) : ""}
      ${mode !== "newpass" ? raw(`<label class="f">Adresse e-mail<input class="in" type="email" name="email" autocomplete="username" required></label>`) : ""}
      ${mode !== "reset" ? raw(`<label class="f">${mode === "newpass" ? "Nouveau mot de passe (10 caractères minimum)" : "Mot de passe"}<input class="in" type="password" name="password" autocomplete="${mode === "newpass" ? "new-password" : "current-password"}" required minlength="${mode === "newpass" ? 10 : 1}"></label>`) : ""}
      <button class="btn primary lg" type="submit">${mode === "reset" ? "Recevoir un lien par e-mail" : mode === "newpass" ? "Enregistrer le mot de passe" : "Se connecter"}</button>
      ${mode === "login" ? raw(`<a href="#" class="small muted" id="forgot">Mot de passe oublié ?</a>`) : mode === "reset" ? raw(`<a href="#" class="small muted" id="back">← Retour à la connexion</a>`) : ""}
    </form></div></div>`;
  const f = app.querySelector("#lf");
  f.querySelector("input")?.focus();
  app.querySelector("#forgot")?.addEventListener("click", (e) => { e.preventDefault(); loginView("", "reset"); });
  app.querySelector("#back")?.addEventListener("click", (e) => { e.preventDefault(); loginView(); });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = f.querySelector("button");
    btn.disabled = true;
    const fd = new FormData(f);
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email: fd.get("email"), password: fd.get("password") });
        if (error) throw new Error(/invalid/i.test(error.message) ? "Adresse e-mail ou mot de passe incorrect." : error.message);
        await boot();
      } else if (mode === "reset") {
        const { error } = await sb.auth.resetPasswordForEmail(fd.get("email"), { redirectTo: location.origin + location.pathname });
        if (error) throw error;
        loginView("✓ Si un compte existe pour cette adresse, un e-mail vient d’être envoyé.", "login");
      } else {
        const pw = String(fd.get("password"));
        if (pw.length < 10) throw new Error("Choisissez au moins 10 caractères.");
        const { error } = await sb.auth.updateUser({ password: pw });
        if (error) throw error;
        toast("Mot de passe enregistré.");
        await boot();
      }
    } catch (err) {
      loginView(err.message || "Connexion impossible.", mode);
    }
  });
}

/* ---------------- shell ---------------- */
function shell() {
  const navHtml = NAV.map((n) => (n.sep ? '<div class="sep"></div>' : `<a class="nav-a" href="${n.href}">${n.icon}<span>${esc(n.label)}</span></a>`)).join("");
  app.innerHTML = html`<div class="mtop"><button id="mt-menu" aria-label="Menu">${raw(I.menu)}</button><span class="brand">Librairie <i>Martelle</i></span><a href="../" target="_blank" rel="noopener" aria-label="Voir le site" style="color:#fff;width:40px;height:40px;display:grid;place-items:center">${raw(I.ext)}</a></div>
  <div class="shell"><aside class="side" id="side"><div class="brand">Librairie <i>Martelle</i><small>Administration</small></div>
    <nav aria-label="Administration">${raw(navHtml)}</nav>
    <div class="sep"></div>
    <a class="nav-a" href="../" target="_blank" rel="noopener">${raw(I.ext)}<span>Voir le site</span></a>
    <div class="foot"><b>${staff.display_name || staff.email}</b>${staff.email}<br><button class="btn sm" id="logout" style="margin-top:10px;background:transparent;color:#EDE6D8;border-color:rgba(255,255,255,.25)">${raw(I.out)} Se déconnecter</button></div>
  </aside><main class="main" id="main" tabindex="-1"></main></div>`;
  app.querySelector("#logout").onclick = async () => { await sb.auth.signOut(); location.hash = "#/"; loginView("✓ Vous êtes déconnecté."); };
  const side = app.querySelector("#side");
  app.querySelector("#mt-menu").onclick = () => side.classList.toggle("open");
  side.addEventListener("click", (e) => { if (e.target.closest("a")) side.classList.remove("open"); });
}

async function route() {
  if (!staff) return;
  const h = (location.hash || "#/").split("?")[0];
  const main = document.getElementById("main");
  if (!main) return;
  if (typeof cleanup === "function") { try { cleanup(); } catch (_) {} }
  cleanup = null;
  document.querySelectorAll(".nav-a").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("on", href === h || (href === "#/livres" && /^#\/livres\/[0-9a-f-]{36}$/.test(h)) || (href === "#/evenements" && /^#\/evenements\//.test(h)));
  });
  const hit = ROUTES.find(([re]) => re.test(h));
  if (!hit) { location.hash = "#/"; return; }
  const params = h.match(hit[0]).slice(1);
  main.innerHTML = '<div class="boot" style="height:50vh"><span class="spin"></span></div>';
  try {
    const mod = await hit[1]();
    const view = document.createElement("div");
    view.innerHTML = '<div class="boot" style="height:50vh"><span class="spin"></span></div>';
    main.replaceChildren(view);
    cleanup = await mod.render(view, params, { staff });
    main.focus({ preventScroll: true });
    scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    main.innerHTML = html`<div class="card"><div class="empty"><b>Impossible d’afficher cette page</b>${e.message || ""}</div><div class="row end"><button class="btn" onclick="location.reload()">Recharger</button></div></div>`;
  }
}

async function boot() {
  if (!configured) {
    app.innerHTML = `<div class="login"><div class="login-form" style="grid-column:1/-1"><div class="login-card"><h1>Configuration requise</h1><p>Renseignez l’adresse et la clé publique de votre projet Supabase dans <code class="k">config.js</code> (voir le guide d’installation).</p></div></div></div>`;
    return;
  }
  const s = await currentStaff();
  if (!s) { staff = null; loginView(); return; }
  if (s.denied) {
    await sb.auth.signOut();
    staff = null;
    loginView(`Le compte ${s.email} n’a pas accès à l’administration. Demandez à un responsable de vous ajouter à l’équipe.`);
    return;
  }
  const first = !staff;
  staff = s;
  if (first || !document.getElementById("main")) shell();
  route();
}

addEventListener("hashchange", route);
// a cover that cannot be loaded becomes a neutral placeholder
document.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains("thumb")) return;
  const ph = document.createElement("div");
  ph.className = img.className;
  ph.textContent = "—";
  img.replaceWith(ph);
}, true);
if (sb) {
  sb.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") { staff = null; loginView("", "newpass"); }
    if (event === "SIGNED_OUT") { staff = null; }
  });
}
boot();
