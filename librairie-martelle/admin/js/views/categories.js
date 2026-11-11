import { categories, updateCategory } from "../api.js";
import { html, raw, esc, toast } from "../ui.js";

export async function render(main) {
  const cats = await categories(true);
  main.innerHTML = html`<div class="topbar"><div><h1>Les 12 rayons</h1><div class="sub">Ce sont les 12 livres du carrousel 3D de la page d’accueil. Leur ordre et leur illustration sont fixes ; vous pouvez modifier leurs textes.</div></div></div>
  <div class="grid g2">${raw(cats.map((c) => `<form class="card" data-id="${c.id}"><h2>${String(c.position).padStart(2, "0")} · ${esc(c.title)}</h2><div class="grid" style="gap:12px">
    <div class="grid g2"><label class="f">Titre (couverture)<input class="in" name="title" maxlength="60" required value="${esc(c.title)}"></label><label class="f">Titre court (dos du livre)<input class="in" name="short_title" maxlength="20" required value="${esc(c.short_title)}"></label></div>
    <label class="f">Accroche<input class="in" name="kicker" maxlength="60" value="${esc(c.kicker || "")}"></label>
    <label class="f">Présentation du rayon<textarea class="in" name="description" maxlength="600" rows="3">${esc(c.description || "")}</textarea></label>
    <label class="f">Où le trouver dans la librairie<input class="in" name="location_hint" maxlength="160" value="${esc(c.location_hint || "")}"></label>
    <div class="row end"><button class="btn primary">Enregistrer</button></div></div></form>`).join(""))}</div>`;
  main.querySelectorAll("form").forEach((f) => f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(f));
    for (const k in fd) fd[k] = String(fd[k]).trim() || null;
    if (!fd.title || !fd.short_title) { toast("Le titre et le titre court sont obligatoires.", "bad"); return; }
    const btn = f.querySelector("button"); btn.disabled = true;
    try { await updateCategory(f.dataset.id, fd); f.querySelector("h2").textContent = f.querySelector("h2").textContent.split(" · ")[0] + " · " + fd.title; toast("Rayon enregistré."); }
    catch (err) { toast(err.message, "bad"); }
    btn.disabled = false;
  }));
}
