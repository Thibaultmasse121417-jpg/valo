import { getSettings, saveSettings } from "../api.js";
import { html, raw, esc, toast, I, guardDirty } from "../ui.js";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export async function render(main) {
  const s = await getSettings();
  let closures = [...(s.closures || [])].sort((a, b) => a.date.localeCompare(b.date));
  main.innerHTML = html`<div class="topbar"><div><h1>Horaires & informations</h1><div class="sub">Affichés sur le site, avec l’indication « ouvert / fermé » en temps réel.</div></div></div>
  <form id="sf" novalidate><div class="grid g2" style="align-items:start">
    <section class="card"><h2>Horaires d’ouverture</h2>${raw(DAYS.map((d, i) => { const h = s.opening_hours[i]; return `<div class="hours-row"><b>${d}</b><label class="switch"><input type="checkbox" data-open="${i}" ${h ? "checked" : ""}> Ouvert</label>
      <label class="f"><span class="sr">Ouverture ${d}</span><input class="in" type="time" data-from="${i}" value="${h ? h.open : "09:30"}" ${h ? "" : "disabled"}></label><label class="f"><span class="sr">Fermeture ${d}</span><input class="in" type="time" data-to="${i}" value="${h ? h.close : "19:00"}" ${h ? "" : "disabled"}></label></div>`; }).join(""))}</section>
    <section class="card"><h2>Fermetures exceptionnelles</h2><p class="small muted" style="margin-top:-6px">Jours fériés, inventaire, congés : la librairie apparaîtra fermée ces jours-là.</p>
      <div id="cl"></div><button type="button" class="btn sm" id="addCl">${raw(I.plus)} Ajouter une date</button></section>
    <section class="card"><h2>Coordonnées</h2><div class="grid" style="gap:12px">
      <label class="f">Téléphone<input class="in" name="phone" value="${s.phone}"></label>
      <label class="f">E-mail<input class="in" type="email" name="email" value="${s.email}"></label>
      <label class="f">Adresse<input class="in" name="address" value="${s.address}"></label></div></section>
    <section class="card"><h2>Commande en ligne & annonce</h2><div class="grid" style="gap:12px">
      <label class="f">Boutique en ligne <span class="hint">Lien des boutons « Commander »</span><input class="in" name="order_url" placeholder="https://…" value="${s.order_url || ""}"></label>
      <label class="f">Lien vers la fiche d’un livre <span class="hint">Facultatif. Utilisez {isbn} à la place de l’ISBN, ex. https://www.exemple.fr/livre/{isbn}</span><input class="in" name="book_url_template" placeholder="https://…{isbn}" value="${s.book_url_template || ""}"></label>
      <label class="f">Bandeau d’information <span class="hint">Affiché en haut du site si rempli (240 caractères max.)</span><input class="in" name="announcement" maxlength="240" placeholder="Ex. : Exceptionnellement ouvert le dimanche 21 décembre." value="${s.announcement || ""}"></label></div></section>
  </div><div class="sticky-actions"><button class="btn primary lg">Enregistrer</button></div></form>`;
  const f = main.querySelector("#sf");
  const guard = guardDirty(f);
  const drawCl = () => {
    main.querySelector("#cl").innerHTML = closures.length ? closures.map((c, i) => `<div class="closure"><input class="in" type="date" data-cd="${i}" value="${esc(c.date)}"><input class="in" data-cl="${i}" maxlength="80" placeholder="Motif (facultatif)" value="${esc(c.label || "")}"><button type="button" class="icon-btn" data-rm="${i}" aria-label="Supprimer">${I.x}</button></div>`).join("") : '<p class="small muted">Aucune fermeture prévue.</p>';
  };
  drawCl();
  main.querySelector("#addCl").onclick = () => { closures.push({ date: new Date().toISOString().slice(0, 10), label: "Fermeture exceptionnelle" }); drawCl(); };
  f.addEventListener("click", (e) => { const r = e.target.closest("[data-rm]"); if (r) { closures.splice(+r.dataset.rm, 1); drawCl(); } });
  f.addEventListener("input", (e) => {
    if (e.target.dataset.cd !== undefined) closures[+e.target.dataset.cd].date = e.target.value;
    if (e.target.dataset.cl !== undefined) closures[+e.target.dataset.cl].label = e.target.value;
  });
  f.addEventListener("change", (e) => { const o = e.target.dataset.open; if (o !== undefined) { f.querySelector(`[data-from="${o}"]`).disabled = f.querySelector(`[data-to="${o}"]`).disabled = !e.target.checked; } });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const hours = DAYS.map((_, i) => (f.querySelector(`[data-open="${i}"]`).checked ? { open: f.querySelector(`[data-from="${i}"]`).value, close: f.querySelector(`[data-to="${i}"]`).value } : null));
    if (hours.some((h) => h && (!h.open || !h.close || h.close <= h.open))) { toast("Vérifiez les horaires : l’heure de fermeture doit suivre l’heure d’ouverture.", "bad", 6000); return; }
    const v = (n) => f.elements[n].value.trim() || null;
    for (const n of ["order_url", "book_url_template"]) if (v(n) && !/^https:\/\//.test(v(n))) { toast("Les liens doivent commencer par https://", "bad"); return; }
    if (v("book_url_template") && !v("book_url_template").includes("{isbn}")) { toast("Le lien vers la fiche d’un livre doit contenir {isbn}.", "bad"); return; }
    const cl = closures.filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.date)).map((c) => ({ date: c.date, label: (c.label || "").trim() || "Fermeture exceptionnelle" }));
    try {
      await saveSettings({ opening_hours: hours, closures: cl, phone: v("phone") || s.phone, email: v("email") || s.email, address: v("address") || s.address, order_url: v("order_url"), book_url_template: v("book_url_template"), announcement: v("announcement") });
      guard.clean();
      toast("Informations enregistrées : elles sont à jour sur le site.");
    } catch (err) { toast(err.message, "bad", 6000); }
  });
  return () => guard.dispose();
}
