import { getEvent, saveEvent, deleteEvent, searchBooks, uploadImage, removeImage, publicUrl, coverOf } from "../api.js";
import { html, raw, esc, I, EVENT_KINDS, toast, confirmDialog, debounce, thumbHTML, guardDirty } from "../ui.js";

// Europe/Paris wall time <-> ISO (handles daylight saving)
function parisParts(iso) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso));
  const g = (t) => p.find((x) => x.type === t).value;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}` };
}
function parisToIso(date, time) {
  if (!date || !time) return null;
  const guess = new Date(`${date}T${time}:00Z`);
  for (let i = 0; i < 2; i++) {
    const p = parisParts(guess.toISOString());
    const diff = (new Date(`${p.date}T${p.time}:00Z`) - new Date(`${date}T${time}:00Z`));
    guess.setTime(guess.getTime() - diff);
  }
  return guess.toISOString();
}

export async function render(main, [id]) {
  const isNew = id === "nouveau";
  const ev = isNew ? { kind: "dedicace", published: true, location: "Librairie Martelle, 3 rue des Vergeaux, Amiens" } : await getEvent(id);
  const st = ev.starts_at ? parisParts(ev.starts_at) : { date: "", time: "18:00" };
  const en = ev.ends_at ? parisParts(ev.ends_at) : { time: "" };
  let book = ev.book || null;
  const img = { path: ev.image_path || null, file: null, removed: false };

  main.innerHTML = html`<div class="topbar"><div><h1>${isNew ? "Nouvel événement" : ev.title}</h1><div class="sub">Heure de Paris.</div></div><a class="btn ghost" href="#/evenements">← Retour</a></div>
  <form id="ef" novalidate><div class="form-grid"><div class="stack">
    <section class="card"><div class="grid g2">
      <label class="f span2">Titre *<input class="in" name="title" required maxlength="200" placeholder="Rencontre-dédicace avec…" value="${ev.title || ""}"></label>
      <label class="f">Type<select class="in" name="kind">${raw(Object.entries(EVENT_KINDS).map(([k, v]) => `<option value="${k}" ${k === ev.kind ? "selected" : ""}>${v}</option>`).join(""))}</select></label>
      <label class="f">Invité(s)<input class="in" name="guests" maxlength="300" placeholder="Nom de l’auteur, de l’illustratrice…" value="${ev.guests || ""}"></label>
      <label class="f">Date *<input class="in" type="date" name="date" required value="${st.date}"></label>
      <div class="grid g2" style="gap:10px"><label class="f">Début *<input class="in" type="time" name="start" required value="${st.time}"></label><label class="f">Fin<input class="in" type="time" name="end" value="${en.time}"></label></div>
      <label class="f span2">Lieu<input class="in" name="location" maxlength="200" value="${ev.location || ""}"></label>
      <label class="f span2">Présentation<textarea class="in" name="description" maxlength="4000" rows="6">${ev.description || ""}</textarea></label>
      <div class="f span2"><span style="font-weight:600;font-size:13.5px">Livre associé <span class="hint" style="font-weight:400;color:var(--muted)">(facultatif — affiché avec l’événement)</span></span>
        <div id="bk"></div>
        <div class="typeahead"><input class="in" id="bq" placeholder="Rechercher un livre du catalogue…"><div class="ta-list" hidden></div></div></div>
      <label class="f span2">Lien d’inscription <span class="hint">https://…, mailto:… ou tel:…</span><input class="in" name="booking_url" placeholder="mailto:commandes@librairiemartelle.com" value="${ev.booking_url || ""}"></label>
      <label class="check"><input type="checkbox" name="booking_required" ${ev.booking_required ? "checked" : ""}> Inscription recommandée</label>
      <label class="switch"><input type="checkbox" name="published" ${ev.published ? "checked" : ""}> Visible sur le site</label>
      <div class="f span2" style="border-top:1px solid var(--line);padding-top:14px"><label class="check"><input type="checkbox" name="cancelled" ${ev.cancelled ? "checked" : ""}> Événement annulé <span class="hint" style="font-weight:400;color:var(--muted)">(reste affiché, barré, avec la mention « Annulé »)</span></label>
        <label class="f" style="margin-top:8px">Motif ou information (facultatif)<input class="in" name="cancel_note" maxlength="300" placeholder="Ex. : reporté au printemps, nouvelle date à venir" value="${ev.cancel_note || ""}"></label></div>
    </div></section></div>
    <aside class="cover-box card"><div class="cover-prev" id="ip" style="aspect-ratio:4/3"></div>
      <label class="btn" style="cursor:pointer">${raw(I.upload)} Image (affiche, photo de l’auteur…)<input type="file" accept="image/jpeg,image/png,image/webp" id="file" hidden></label>
      <button type="button" class="btn ghost" id="rm">Retirer l’image</button><p class="small muted" style="margin:0">Sans image, la couverture du livre associé est utilisée.</p></aside></div>
  <div class="sticky-actions">${!isNew ? raw('<button type="button" class="btn danger" id="del">Supprimer</button><button type="button" class="btn" id="dup">Dupliquer</button><span class="grow"></span>') : ""}<button type="submit" class="btn primary lg">Enregistrer</button></div></form>`;

  const $ = (s) => main.querySelector(s);
  const f = $("#ef"), F = (n) => f.elements[n];
  const guard = guardDirty(f);
  function drawImg() {
    const src = img.file ? URL.createObjectURL(img.file) : !img.removed && img.path ? publicUrl(img.path) : book ? coverOf(book) : null;
    $("#ip").innerHTML = src ? `<img src="${esc(src)}" alt="" style="object-fit:${img.file || (img.path && !img.removed) ? "cover" : "contain"}">` : '<div class="ph">Pas d’image</div>';
  }
  function drawBook() {
    $("#bk").innerHTML = book ? `<div class="found" style="margin:6px 0 10px">${thumbHTML({ ...book, _cover: coverOf(book) })}<div><b>${esc(book.title)}</b> <button type="button" class="btn sm ghost" id="unbook">Retirer</button></div></div>` : "";
    $("#unbook")?.addEventListener("click", () => { book = null; drawBook(); drawImg(); });
  }
  drawBook(); drawImg();
  $("#file").onchange = (e) => { if (e.target.files[0]) { img.file = e.target.files[0]; img.removed = false; drawImg(); } };
  $("#rm").onclick = () => { img.file = null; img.removed = true; drawImg(); };
  const bq = $("#bq"), list = bq.nextElementSibling;
  let results = [];
  bq.addEventListener("input", debounce(async () => {
    if (bq.value.trim().length < 2) { list.hidden = true; return; }
    results = await searchBooks(bq.value, 6);
    list.innerHTML = results.map((b, i) => `<button type="button" class="ta-it" data-i="${i}">${thumbHTML({ ...b, _cover: coverOf(b) })}<span><b>${esc(b.title)}</b><br><span class="small muted">${esc(b.authors_text || "")}</span></span></button>`).join("") || '<div class="small muted" style="padding:10px">Aucun résultat</div>';
    list.hidden = false;
  }, 250));
  bq.addEventListener("blur", () => setTimeout(() => (list.hidden = true), 200));
  list.addEventListener("click", (e) => { const it = e.target.closest("[data-i]"); if (!it) return; book = results[+it.dataset.i]; bq.value = ""; list.hidden = true; drawBook(); drawImg(); });

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = (n) => F(n).value.trim();
    f.querySelectorAll(".err").forEach((x) => x.classList.remove("err"));
    const errs = [];
    if (!v("title")) { errs.push("Le titre est obligatoire."); F("title").classList.add("err"); }
    const starts = parisToIso(v("date"), v("start"));
    if (!starts) { errs.push("Indiquez la date et l’heure de début."); F("date").classList.add("err"); }
    const ends = v("end") ? parisToIso(v("date"), v("end")) : null;
    if (ends && starts && ends < starts) { errs.push("L’heure de fin doit suivre l’heure de début."); F("end").classList.add("err"); }
    const url = v("booking_url");
    if (url && !/^(https:\/\/|mailto:|tel:)/.test(url)) { errs.push("Le lien d’inscription doit commencer par https://, mailto: ou tel:"); F("booking_url").classList.add("err"); }
    if (errs.length) { toast(errs[0], "bad", 6000); return; }
    const rec = { title: v("title"), kind: v("kind"), guests: v("guests") || null, starts_at: starts, ends_at: ends, location: v("location") || "Librairie Martelle, 3 rue des Vergeaux, Amiens", description: v("description") || null, book_id: book ? book.id : null, booking_url: url || null, booking_required: F("booking_required").checked, published: F("published").checked, cancelled: F("cancelled").checked, cancel_note: v("cancel_note") || null };
    const btn = f.querySelector("[type=submit]"); btn.disabled = true;
    const old = ev.image_path;
    try {
      if (img.file) rec.image_path = await uploadImage(img.file, "events");
      else if (img.removed) rec.image_path = null;
      const saved = await saveEvent(isNew ? null : ev.id, rec);
      if (old && old !== saved.image_path) removeImage(old);
      guard.clean();
      toast(isNew ? "Événement créé : il est visible sur le site." : "Événement enregistré.");
      location.hash = "#/evenements";
    } catch (err) { toast(err.message, "bad", 6000); }
    btn.disabled = false;
  });
  $("#del")?.addEventListener("click", async () => {
    if (!(await confirmDialog({ title: "Supprimer cet événement ?", body: `« ${ev.title} » sera retiré du site.`, ok: "Supprimer", danger: true }))) return;
    try { await deleteEvent(ev.id); guard.clean(); toast("Événement supprimé."); location.hash = "#/evenements"; } catch (err) { toast(err.message, "bad"); }
  });
  $("#dup")?.addEventListener("click", async () => {
    try {
      const { id: _i, created_at, updated_at, updated_by, book: _b, image_path, ...copy } = ev;
      const saved = await saveEvent(null, { ...copy, title: ev.title + " (copie)", published: false, image_path: null });
      toast("Copie créée en brouillon : changez la date puis publiez-la.");
      location.hash = `#/evenements/${saved.id}`;
    } catch (err) { toast(err.message, "bad"); }
  });
  return () => guard.dispose();
}
