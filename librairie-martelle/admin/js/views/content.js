import { getContent, saveContent, deleteContent, getSettings } from "../api.js";
import { html, raw, esc, toast, guardDirty } from "../ui.js";
import { legalTemplates } from "../../../assets/js/legal-templates.js";

// Editable texts. Empty field = the site keeps its original text.
const TEXTS = [
  { key: "home.tagline_kicker", label: "Accueil — petite ligne au-dessus de l’étagère", max: 60, ph: "Librairie indépendante · Amiens · depuis 1957" },
  { key: "home.tagline", label: "Accueil — phrase d’accroche", max: 140, ph: "Plus de 80 000 titres en magasin, des libraires pour vous conseiller." },
  { key: "home.manifesto", label: "Accueil — grand texte de présentation", max: 400, area: true, ph: "La librairie Martelle se veut un lieu de rencontre entre lecteurs, auteurs et libraires…" },
  { key: "events.lead", label: "Événements — texte d’introduction", max: 300, area: true, ph: "« Un lieu de rencontre entre lecteurs, auteurs et libraires. » …" },
  { key: "home.gallery_title", label: "Photos — titre de la galerie", max: 80, ph: "La librairie, rue des Vergeaux" },
];
const SECTIONS = [["histoire", "Histoire de la librairie"], ["equipe", "L’équipe"], ["visite", "Plan des trois niveaux"], ["nouveautes", "Nouveautés"], ["coups-de-coeur", "Coups de cœur"], ["rencontres", "Rencontres & dédicaces"]];

export async function render(main) {
  const [c, settings] = await Promise.all([getContent(), getSettings()]);
  const tpl = legalTemplates({ phone: settings.phone, email: settings.email });
  main.innerHTML = html`<div class="topbar"><div><h1>Textes & pages</h1><div class="sub">Laissez un champ vide pour conserver le texte d’origine du site.</div></div></div>
  <form id="cf" novalidate><div class="grid" style="gap:16px">
    <section class="card"><h2>Page d’accueil</h2><div class="grid" style="gap:14px">
      ${raw(TEXTS.map((t) => `<label class="f">${esc(t.label)}${t.area ? `<textarea class="in" name="${t.key}" maxlength="${t.max}" rows="3" placeholder="${esc(t.ph)}">${esc(typeof c[t.key] === "string" ? c[t.key] : "")}</textarea>` : `<input class="in" name="${t.key}" maxlength="${t.max}" placeholder="${esc(t.ph)}" value="${esc(typeof c[t.key] === "string" ? c[t.key] : "")}">`}</label>`).join(""))}
    </div></section>
    <section class="card"><h2>Sections affichées sur l’accueil</h2><div class="grid g2" style="gap:10px">
      ${raw(SECTIONS.map(([id, label]) => `<label class="switch"><input type="checkbox" data-show="${id}" ${c["home.hide." + id] === true ? "" : "checked"}> ${esc(label)}</label>`).join(""))}
    </div><p class="small muted" style="margin:12px 0 0">Les nouveautés, coups de cœur et événements se masquent aussi automatiquement s’ils sont vides.</p></section>
    <section class="card"><h2>Catalogue</h2>
      <label class="switch"><input type="checkbox" name="demo" ${c["site.demo_catalogue"] === true ? "checked" : ""}> Afficher l’avertissement « catalogue de démonstration »</label>
      <p class="small muted" style="margin:10px 0 0">À désactiver lorsque le catalogue en ligne correspond aux livres réellement proposés par la librairie.</p></section>
    ${raw(["legal.mentions", "legal.privacy"].map((k) => `<section class="card"><h2>${k === "legal.mentions" ? "Mentions légales" : "Confidentialité & cookies"}</h2>
      <p class="small muted" style="margin-top:-6px">Une ligne commençant par « ## » devient un titre. Les passages <code class="k">[À compléter : …]</code> sont surlignés sur le site tant qu’ils restent.</p>
      <textarea class="in" name="${k}" rows="14" maxlength="20000" style="font-family:ui-monospace,Menlo,monospace;font-size:13px">${esc(typeof c[k] === "string" && c[k].trim() ? c[k] : tpl[k]())}</textarea>
      <div class="row" style="margin-top:8px"><a class="btn sm" href="../${k === "legal.mentions" ? "mentions-legales" : "confidentialite"}.html" target="_blank" rel="noopener">Voir la page</a><button type="button" class="btn sm ghost" data-reset="${k}">Revenir au modèle</button></div></section>`).join(""))}
  </div><div class="sticky-actions"><button class="btn primary lg">Enregistrer</button></div></form>`;
  const f = main.querySelector("#cf");
  const guard = guardDirty(f);
  f.addEventListener("click", (e) => { const r = e.target.closest("[data-reset]"); if (r) { f.elements[r.dataset.reset].value = tpl[r.dataset.reset](); } });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const set = {}, del = [];
    for (const t of TEXTS) { const v = f.elements[t.key].value.trim(); if (v) set[t.key] = v; else del.push(t.key); }
    f.querySelectorAll("[data-show]").forEach((x) => { if (x.checked) del.push("home.hide." + x.dataset.show); else set["home.hide." + x.dataset.show] = true; });
    set["site.demo_catalogue"] = f.elements.demo.checked;
    for (const k of ["legal.mentions", "legal.privacy"]) { const v = f.elements[k].value.trim(); if (v && v !== tpl[k]().trim()) set[k] = v; else del.push(k); }
    const btn = f.querySelector(".btn.primary"); btn.disabled = true;
    try { await saveContent(set); await deleteContent(del.filter((k) => c[k] !== undefined)); guard.clean(); toast("Textes enregistrés : ils sont à jour sur le site."); }
    catch (err) { toast(err.message, "bad", 6000); }
    btn.disabled = false;
  });
  return () => guard.dispose();
}
