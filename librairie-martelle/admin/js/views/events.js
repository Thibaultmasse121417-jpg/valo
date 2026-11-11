import { listEvents } from "../api.js";
import { html, raw, esc, I, EVENT_KINDS, fmtDate } from "../ui.js";

export async function render(main) {
  let past = false;
  main.innerHTML = html`<div class="topbar"><div><h1>Événements & rencontres</h1><div class="sub">Dédicaces, rencontres, lectures, ateliers : ils apparaissent automatiquement sur le site.</div></div>
    <a class="btn primary" href="#/evenements/nouveau">${raw(I.plus)} Nouvel événement</a></div>
    <div class="seg" style="margin-bottom:14px"><label><input type="radio" name="when" value="0" checked><span>À venir</span></label><label><input type="radio" name="when" value="1"><span>Passés</span></label></div>
    <div class="list" id="ev"></div>`;
  const box = main.querySelector("#ev");
  async function load() {
    box.innerHTML = '<div class="empty"><span class="spin"></span></div>';
    const evs = await listEvents({ past });
    box.innerHTML = evs.length
      ? evs.map((e) => `<div class="ev-it"><div class="ev-date"><b>${fmtDate(e.starts_at, { day: "numeric" })}</b><span>${fmtDate(e.starts_at, { month: "short" })}</span></div>
          <div><span class="tag">${esc(EVENT_KINDS[e.kind])}</span> ${e.published ? "" : '<span class="pill draft">Brouillon</span>'}<h3 style="margin-top:6px">${esc(e.title)}</h3>
          <div class="small muted">${esc(fmtDate(e.starts_at, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }))}${e.guests ? " · " + esc(e.guests) : ""}${e.book ? " · Livre : " + esc(e.book.title) : ""}</div></div>
          <div class="row"><a class="btn sm" href="#/evenements/${e.id}">${I.edit} Modifier</a></div></div>`).join("")
      : `<div class="empty"><b>${past ? "Aucun événement passé" : "Aucun événement à venir"}</b>${past ? "" : "Créez une dédicace, une rencontre ou un atelier : il sera annoncé sur la page d’accueil."}</div>`;
  }
  main.querySelectorAll('[name="when"]').forEach((r) => (r.onchange = () => { past = r.value === "1"; load(); }));
  await load();
}
