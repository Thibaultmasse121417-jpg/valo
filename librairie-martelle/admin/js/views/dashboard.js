import { stats, listEvents, listBooks, coverOf } from "../api.js";
import { html, raw, esc, fmtDate, fmtPrice, thumbHTML, I } from "../ui.js";

export async function render(main, _p, { staff }) {
  const [st, evs, recent] = await Promise.all([stats(), listEvents(), listBooks({ size: 6 })]);
  const firstName = (staff.display_name || "").split(" ")[0];
  const card = (n, label, href, warn) => `<a class="card stat link" href="${href}"><b style="${warn && n ? "color:var(--accent)" : ""}">${n ?? 0}</b><span>${esc(label)}</span></a>`;
  const todo = [
    st.no_category && `<a href="#/livres?f=nocat">${st.no_category} livre(s) sans rayon</a>`,
    st.no_price && `<a href="#/livres?f=noprice">${st.no_price} livre(s) sans prix</a>`,
    st.drafts && `<a href="#/livres?f=drafts">${st.drafts} brouillon(s) non publié(s)</a>`,
    st.out_of_stock && `<a href="#/livres?f=out">${st.out_of_stock} livre(s) indisponible(s)</a>`,
    st.no_cover && `<a href="#/livres?f=nocover">${st.no_cover} livre(s) sans couverture</a>`,
    !st.photos && `<a href="#/photos">Ajouter des photos de la librairie</a>`,
  ].filter(Boolean);
  main.innerHTML = html`
  <div class="topbar"><div><h1>Bonjour${firstName ? " " + firstName : ""}</h1><div class="sub">Tout ce que vous modifiez ici apparaît immédiatement sur le site.</div></div>
    <div class="row"><a class="btn" href="#/import">${raw(I.upload)} Importer</a><a class="btn primary" href="#/livres/nouveau">${raw(I.plus)} Ajouter un livre</a></div></div>
  <div class="grid g4">${raw(card(st.published, "livres en ligne", "#/livres"))}${raw(card(st.is_new, "nouveautés", "#/selections"))}${raw(card(st.picks, "coups de cœur", "#/selections"))}${raw(card(st.upcoming, "événements à venir", "#/evenements"))}</div>
  <div class="grid g2" style="margin-top:16px">
    <section class="card"><h2>À compléter</h2>${todo.length ? raw(`<ul style="margin:0;padding-left:18px;display:grid;gap:8px">${todo.map((t) => `<li>${t}</li>`).join("")}</ul>`) : raw('<p class="muted" style="margin:0">Rien à signaler : le catalogue est à jour.</p>')}
      <p class="small muted" style="margin:16px 0 0">${st.last_sync ? `Dernière synchronisation du stock : ${esc(fmtDate(st.last_sync, { dateStyle: "medium", timeStyle: "short" }))}` : "Synchronisation automatique du stock : non configurée."}</p></section>
    <section class="card"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h2 style="margin:0">Prochains événements</h2><a class="btn sm" href="#/evenements/nouveau">${raw(I.plus)} Événement</a></div>
      ${evs.length ? raw(evs.slice(0, 4).map((e) => `<a href="#/evenements/${e.id}" class="ev-it" style="text-decoration:none;padding:12px 0"><div class="ev-date"><b>${fmtDate(e.starts_at, { day: "numeric" })}</b><span>${fmtDate(e.starts_at, { month: "short" })}</span></div><div><h3>${esc(e.title)}</h3><div class="small muted">${esc(e.guests || "")} ${e.published ? "" : "· brouillon"}</div></div></a>`).join("")) : raw('<p class="muted">Aucun événement programmé.</p>')}</section>
  </div>
  <section class="card" style="margin-top:16px"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 style="margin:0">Derniers livres modifiés</h2><a class="btn sm" href="#/livres">Tout le catalogue</a></div>
    ${recent.data.length ? raw(`<div class="grid g3">${recent.data.map((b) => `<a href="#/livres/${b.id}" class="found" style="text-decoration:none">${thumbHTML({ ...b, _cover: coverOf(b) })}<div><b>${esc(b.title)}</b><div class="small muted">${esc(b.authors_text || "")}</div><div class="small">${fmtPrice(b.price)}</div></div></a>`).join("")}</div>`) : raw('<div class="empty"><b>Le catalogue est vide</b>Ajoutez un premier livre avec son ISBN, ou importez un fichier CSV.</div>')}
  </section>`;
}
