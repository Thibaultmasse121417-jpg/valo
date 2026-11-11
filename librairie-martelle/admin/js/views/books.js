import { listBooks, categories, patchBooks, deleteBooks, coverOf, allBooksForExport } from "../api.js";
import { html, raw, esc, fmtPrice, thumbHTML, I, AVAIL, debounce, toast, confirmDialog, download } from "../ui.js";
import { toCsv } from "../csv.js";
import { formatIsbn } from "../isbn.js";

export async function render(main) {
  const cats = await categories();
  const catName = Object.fromEntries(cats.map((c) => [c.id, c.short_title]));
  const qs = new URLSearchParams((location.hash.split("?")[1] || ""));
  const state = { q: qs.get("q") || "", category: qs.get("c") || "", filter: qs.get("f") || "", sort: "recent", page: 0, size: 50 };
  const selected = new Set();
  let rows = [], total = 0;

  main.innerHTML = html`
  <div class="topbar"><div><h1>Livres</h1><div class="sub" id="count">Chargement…</div></div>
    <div class="row"><button class="btn" id="export">${raw(I.dl)} Exporter (CSV)</button><a class="btn" href="#/import">${raw(I.upload)} Importer</a><a class="btn primary" href="#/livres/nouveau">${raw(I.plus)} Ajouter un livre</a></div></div>
  <div class="toolbar">
    <input class="in search" type="search" id="q" placeholder="Rechercher : titre, auteur, ISBN, éditeur…" value="${state.q}" aria-label="Rechercher">
    <select class="in" id="cat" aria-label="Rayon"><option value="">Tous les rayons</option>${raw(cats.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join(""))}<option value="_none">Sans rayon</option></select>
    <select class="in" id="flt" aria-label="Filtre"><option value="">Tous les livres</option><option value="published">Publiés</option><option value="drafts">Brouillons</option><option value="new">Nouveautés</option><option value="best">Meilleures ventes</option><option value="picks">Coups de cœur</option><option value="out">Indisponibles</option><option value="noprice">Sans prix</option><option value="nocat">Sans rayon</option></select>
    <select class="in" id="sort" aria-label="Tri"><option value="recent">Modifiés récemment</option><option value="title">Titre (A → Z)</option><option value="price">Prix croissant</option></select>
  </div>
  <div class="list" id="list"></div>
  <div class="pager"><span class="small muted" id="range"></span><div class="row"><button class="btn sm" id="prev">← Précédents</button><button class="btn sm" id="next">Suivants →</button></div></div>
  <div class="bulk" id="bulk" hidden>
    <b id="selN"></b>
    <select class="in" id="bCat"><option value="">Déplacer vers un rayon…</option>${raw(cats.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join(""))}</select>
    <select class="in" id="bAv"><option value="">Disponibilité…</option>${raw(Object.entries(AVAIL).map(([k, v]) => `<option value="${k}">${v}</option>`).join(""))}</select>
    <button class="btn sm" data-b="pub1">Publier</button><button class="btn sm" data-b="pub0">Dépublier</button>
    <button class="btn sm" data-b="new1">+ Nouveautés</button><button class="btn sm" data-b="best1">+ Meilleures ventes</button>
    <button class="btn sm" data-b="del" style="color:#FFB4A8;border-color:rgba(255,180,168,.5)">Supprimer</button>
    <button class="btn sm" data-b="none" style="margin-left:auto">Désélectionner</button>
  </div>`;
  const $ = (s) => main.querySelector(s);
  $("#cat").value = state.category; $("#flt").value = state.filter;

  const flag = (b, key, label, title) => `<button class="flag ${b[key] ? "on" : ""}" data-flag="${key}" data-id="${b.id}" title="${title}" aria-pressed="${b[key]}">${label}</button>`;
  function draw() {
    $("#count").textContent = `${total} livre${total > 1 ? "s" : ""}${state.q || state.category || state.filter ? " correspondant à votre recherche" : " au catalogue"}`;
    $("#range").textContent = total ? `${state.page * state.size + 1}–${Math.min(total, (state.page + 1) * state.size)} sur ${total}` : "";
    $("#prev").disabled = state.page === 0;
    $("#next").disabled = (state.page + 1) * state.size >= total;
    if (!rows.length) {
      $("#list").innerHTML = `<div class="empty"><b>${state.q || state.filter || state.category ? "Aucun livre trouvé" : "Aucun livre pour l’instant"}</b>${state.q ? "Essayez un autre mot, ou ajoutez ce livre par son ISBN." : "Ajoutez un livre avec son ISBN ou importez un fichier CSV."}</div>`;
      return;
    }
    $("#list").innerHTML = `<div class="li head"><span><input type="checkbox" id="all" aria-label="Tout sélectionner"></span><span></span><span>Livre</span><span class="c-cat">Rayon</span><span class="c-price">Prix</span><span class="c-avail">Disponibilité</span><span class="c-flags" title="Nouveauté · Meilleure vente · Coup de cœur">Sélections</span><span></span></div>` +
      rows.map((b) => `<div class="li ${selected.has(b.id) ? "sel" : ""}">
        <span><input type="checkbox" data-sel="${b.id}" ${selected.has(b.id) ? "checked" : ""} aria-label="Sélectionner ${esc(b.title)}"></span>
        <a href="#/livres/${b.id}" tabindex="-1">${thumbHTML({ ...b, _cover: coverOf(b) })}</a>
        <div class="t"><a href="#/livres/${b.id}">${esc(b.title)}</a> ${b.published ? "" : '<span class="pill draft">Brouillon</span>'}<div class="a">${esc(b.authors_text || "Auteur inconnu")}${b.isbn ? " · " + formatIsbn(b.isbn) : ""}</div></div>
        <span class="c-cat small">${esc(catName[b.category_id] || "—")}</span>
        <span class="price c-price">${fmtPrice(b.price)}</span>
        <span class="c-avail"><span class="pill ${b.availability}">${AVAIL[b.availability]}</span></span>
        <span class="flags c-flags">${flag(b, "is_new", "N", "Nouveauté")}${flag(b, "is_bestseller", "MV", "Meilleure vente")}${flag(b, "is_staff_pick", "♥", "Coup de cœur")}</span>
        <a class="icon-btn c-edit" href="#/livres/${b.id}" aria-label="Modifier ${esc(b.title)}">${I.edit}</a></div>`).join("");
    const all = $("#all");
    all.checked = rows.every((b) => selected.has(b.id));
    drawBulk();
  }
  function drawBulk() {
    $("#bulk").hidden = !selected.size;
    $("#selN").textContent = `${selected.size} sélectionné${selected.size > 1 ? "s" : ""}`;
  }
  async function load() {
    $("#list").innerHTML = '<div class="empty"><span class="spin"></span></div>';
    try {
      const r = await listBooks(state);
      rows = r.data; total = r.count || 0;
      draw();
    } catch (e) { $("#list").innerHTML = `<div class="empty"><b>Erreur</b>${esc(e.message)}</div>`; }
  }
  const reload = () => { state.page = 0; load(); };
  $("#q").addEventListener("input", debounce((e) => { state.q = e.target.value; reload(); }, 300));
  $("#cat").onchange = (e) => { state.category = e.target.value; reload(); };
  $("#flt").onchange = (e) => { state.filter = e.target.value; reload(); };
  $("#sort").onchange = (e) => { state.sort = e.target.value; reload(); };
  $("#prev").onclick = () => { state.page--; load(); };
  $("#next").onclick = () => { state.page++; load(); };

  main.addEventListener("change", (e) => {
    const s = e.target.closest("[data-sel]");
    if (s) { s.checked ? selected.add(s.dataset.sel) : selected.delete(s.dataset.sel); s.closest(".li").classList.toggle("sel", s.checked); drawBulk(); }
    if (e.target.id === "all") { rows.forEach((b) => (e.target.checked ? selected.add(b.id) : selected.delete(b.id))); draw(); }
  });
  main.addEventListener("click", async (e) => {
    const f = e.target.closest("[data-flag]");
    if (f) {
      const b = rows.find((x) => x.id === f.dataset.id);
      const key = f.dataset.flag, val = !b[key];
      f.disabled = true;
      try { await patchBooks([b.id], { [key]: val }); b[key] = val; f.classList.toggle("on", val); f.setAttribute("aria-pressed", val); toast(val ? "Ajouté à la sélection." : "Retiré de la sélection."); }
      catch (err) { toast(err.message, "bad"); }
      f.disabled = false;
    }
    const bb = e.target.closest("[data-b]");
    if (bb) {
      const ids = [...selected];
      const act = bb.dataset.b;
      if (act === "none") { selected.clear(); draw(); return; }
      try {
        if (act === "del") {
          if (!(await confirmDialog({ title: `Supprimer ${ids.length} livre(s) ?`, body: "Cette action est définitive. Les couvertures importées seront aussi supprimées.", ok: "Supprimer", danger: true }))) return;
          await deleteBooks(ids);
          toast(`${ids.length} livre(s) supprimé(s).`);
        } else {
          const patch = { pub1: { published: true }, pub0: { published: false }, new1: { is_new: true }, best1: { is_bestseller: true } }[act];
          await patchBooks(ids, patch);
          toast("Modification enregistrée.");
        }
        selected.clear(); load();
      } catch (err) { toast(err.message, "bad"); }
    }
  });
  for (const [id, key] of [["#bCat", "category_id"], ["#bAv", "availability"]]) {
    $(id).onchange = async (e) => {
      if (!e.target.value) return;
      try { await patchBooks([...selected], { [key]: e.target.value }); toast("Modification enregistrée."); selected.clear(); load(); }
      catch (err) { toast(err.message, "bad"); }
      e.target.value = "";
    };
  }
  $("#export").onclick = async () => {
    const btn = $("#export"); btn.disabled = true;
    try {
      const all = await allBooksForExport();
      const head = ["isbn", "titre", "sous_titre", "auteurs", "editeur", "date_parution", "prix", "stock", "disponibilite", "rayon", "nouveaute", "meilleure_vente", "coup_de_coeur", "mot_du_libraire", "publie", "reference", "resume"];
      const data = all.map((b) => [b.isbn, b.title, b.subtitle, b.authors, b.publisher, b.published_date, b.price === null ? "" : String(b.price).replace(".", ","), b.stock_qty, AVAIL[b.availability], catName[b.category_id] || "", b.is_new ? "oui" : "non", b.is_bestseller ? "oui" : "non", b.is_staff_pick ? "oui" : "non", b.staff_note, b.published ? "oui" : "non", b.external_ref, b.description]);
      download(`catalogue-martelle-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([head, ...data]));
    } catch (err) { toast(err.message, "bad"); }
    btn.disabled = false;
  };
  load();
}
